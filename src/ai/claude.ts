import type Anthropic from '@anthropic-ai/sdk'
import { AiError, friendlyStatus, type CompleteRequest, type CompleteResult, type Connection } from './types'

/** The SDK loads only for people who actually connect a Claude key. */
async function clientFor(conn: Connection): Promise<{ client: Anthropic; SDK: typeof Anthropic }> {
  const { default: SDK } = await import('@anthropic-ai/sdk')
  const isDefault = conn.baseURL === conn.provider.baseURL
  const client = new SDK({
    apiKey: conn.key,
    baseURL: isDefault ? undefined : conn.baseURL,
    // The whole point of bring-your-own-key: the key is the user's own and
    // stays in their browser, so a direct call is what we want here.
    dangerouslyAllowBrowser: true,
    maxRetries: 2,
  })
  return { client, SDK }
}

const SUPPORTS_EFFORT = /^claude-(opus-(5|4-[5-8])|sonnet-(5|4-6)|fable-5|mythos-5|haiku-5)/
const SUPPORTS_FALLBACK = /^claude-(fable-5-1|opus-5|sonnet-5-5)/

export async function listClaudeModels(conn: Connection): Promise<string[]> {
  const { client, SDK } = await clientFor(conn)
  try {
    const ids: string[] = []
    for await (const model of client.models.list({ limit: 100 })) ids.push(model.id)
    return ids
  } catch (e) {
    throw translate(e, SDK)
  }
}

function translate(e: unknown, SDK: typeof Anthropic): AiError {
  if (e instanceof AiError) return e
  if (e instanceof SDK.APIConnectionError) {
    return new AiError('network', "Couldn't reach Anthropic. Check your connection.")
  }
  if (e instanceof SDK.APIError) return friendlyStatus(e.status, 'Anthropic', e.message)
  return new AiError('server', e instanceof Error ? e.message : 'Something went wrong talking to Anthropic.')
}

export async function completeClaude(conn: Connection, req: CompleteRequest): Promise<CompleteResult> {
  const { client, SDK } = await clientFor(conn)

  // Bulk filing is classification, so it runs at low effort. Each feature is
  // switched off and retried if a chosen model turns out not to support it.
  const use = {
    format: Boolean(req.schema),
    effort: SUPPORTS_EFFORT.test(conn.model),
    // Security terms can trip a classifier by accident. "default" lets the API
    // retry on another model instead of failing the whole batch.
    fallback: SUPPORTS_FALLBACK.test(conn.model),
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    const output_config = {
      ...(use.effort ? { effort: 'low' as const } : {}),
      ...(use.format ? { format: { type: 'json_schema' as const, schema: req.schema! } } : {}),
    }
    const base = {
      model: conn.model,
      max_tokens: req.maxTokens,
      system: [{ type: 'text' as const, text: req.system, cache_control: { type: 'ephemeral' as const } }],
      messages: [{ role: 'user' as const, content: req.prompt }],
      ...(use.effort || use.format ? { output_config } : {}),
    }

    try {
      const stream = use.fallback
        ? client.beta.messages.stream(
            { ...base, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' },
            { signal: req.signal },
          )
        : client.beta.messages.stream(base, { signal: req.signal })

      if (req.onText) stream.on('text', (delta) => req.onText!(delta))
      const message = await stream.finalMessage()

      if (message.stop_reason === 'refusal') {
        throw new AiError('refused', 'The model declined this one. Try rewording it, or switch models.')
      }
      if (message.stop_reason === 'max_tokens' && req.schema) {
        throw new AiError('format', 'That batch was too long for one reply.')
      }

      // After a fallback, only what came after the last switch is the real answer.
      let lastSwitch = -1
      message.content.forEach((block, i) => {
        if (block.type === 'fallback') lastSwitch = i
      })
      const text = message.content
        .slice(lastSwitch + 1)
        .flatMap((block) => (block.type === 'text' ? [block.text] : []))
        .join('')

      return {
        text,
        inputTokens:
          message.usage.input_tokens +
          (message.usage.cache_read_input_tokens ?? 0) +
          (message.usage.cache_creation_input_tokens ?? 0),
        outputTokens: message.usage.output_tokens,
        model: message.model,
      }
    } catch (e) {
      if (e instanceof SDK.APIUserAbortError) throw new AiError('network', 'Stopped.')
      if (e instanceof SDK.BadRequestError) {
        const said = e.message.toLowerCase()
        if (use.fallback && /fallback|beta/.test(said)) {
          use.fallback = false
          continue
        }
        if (use.effort && /effort/.test(said)) {
          use.effort = false
          continue
        }
        if (use.format && /output_config|format|schema/.test(said)) {
          use.format = false
          continue
        }
      }
      throw translate(e, SDK)
    }
  }
  throw new AiError('server', 'Anthropic rejected the request.')
}
