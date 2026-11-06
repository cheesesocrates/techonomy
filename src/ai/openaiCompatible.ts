import { AiError, friendlyStatus, type CompleteRequest, type CompleteResult, type Connection } from './types'

function headers(conn: Connection): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(conn.key ? { Authorization: `Bearer ${conn.key}` } : {}),
  }
}

const base = (conn: Connection) => conn.baseURL.replace(/\/+$/, '')

function unreachable(conn: Connection): AiError {
  return conn.provider.needsKey
    ? new AiError('network', `Couldn't reach ${conn.provider.company}. Check your connection.`)
    : new AiError('network', `Couldn't reach ${conn.provider.name}. Is it running, and does it allow requests from this page?`)
}

export async function listOpenAiModels(conn: Connection): Promise<string[]> {
  let res: Response
  try {
    res = await fetch(`${base(conn)}/models`, { headers: headers(conn) })
  } catch {
    throw unreachable(conn)
  }
  if (!res.ok) throw friendlyStatus(res.status, conn.provider.company, await res.text().catch(() => ''))
  const body = (await res.json()) as { data?: { id: string }[]; models?: { name?: string; id?: string }[] }
  const list = body.data ?? body.models ?? []
  return list
    .map((m) => ('id' in m && m.id ? m.id : ((m as { name?: string }).name ?? '')))
    .filter(Boolean)
    .map((id) => id.replace(/^models\//, ''))
}

async function readStream(res: Response, onText?: (d: string) => void) {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let text = ''
  let inputTokens = 0
  let outputTokens = 0
  let model = ''
  let finish: string | null = null

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const raw of lines) {
      const line = raw.trim()
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (data === '[DONE]') continue
      let chunk: {
        model?: string
        choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[]
        usage?: { prompt_tokens?: number; completion_tokens?: number } | null
        error?: { message?: string }
      }
      try {
        chunk = JSON.parse(data)
      } catch {
        continue
      }
      if (chunk.error) throw new AiError('server', chunk.error.message ?? 'The provider reported an error mid-reply.')
      if (chunk.model) model = chunk.model
      const choice = chunk.choices?.[0]
      const delta = choice?.delta?.content
      if (delta) {
        text += delta
        onText?.(delta)
      }
      if (choice?.finish_reason) finish = choice.finish_reason
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens ?? inputTokens
        outputTokens = chunk.usage.completion_tokens ?? outputTokens
      }
    }
  }
  return { text, inputTokens, outputTokens, model, finish }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Providers differ in how much of the structured-output API they support, so
 * this steps down: strict schema, then plain JSON mode, then just the prompt.
 * The tolerant parser in types.ts handles whatever comes back.
 */
function variants(req: CompleteRequest) {
  const usage = { stream_options: { include_usage: true } }
  if (!req.schema) return [usage, {}]
  return [
    {
      ...usage,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'techonomy_reply', strict: true, schema: req.schema },
      },
    },
    { ...usage, response_format: { type: 'json_object' } },
    {},
  ]
}

export async function completeOpenAi(conn: Connection, req: CompleteRequest): Promise<CompleteResult> {
  const steps = variants(req)
  const system = req.schema
    ? `${req.system}\n\nReply with a single JSON object matching this schema, and nothing else:\n${JSON.stringify(req.schema)}`
    : req.system

  let step = 0
  let retries = 0
  for (;;) {
    let res: Response
    try {
      res = await fetch(`${base(conn)}/chat/completions`, {
        method: 'POST',
        headers: headers(conn),
        signal: req.signal,
        body: JSON.stringify({
          model: conn.model,
          stream: true,
          [conn.provider.tokenField]: req.maxTokens,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: req.prompt },
          ],
          ...steps[step],
        }),
      })
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') throw new AiError('network', 'Stopped.')
      throw unreachable(conn)
    }

    if (res.ok) {
      const out = await readStream(res, req.onText)
      if (out.finish === 'length' && req.schema) throw new AiError('format', 'That batch was too long for one reply.')
      if (out.finish === 'content_filter') {
        throw new AiError('refused', 'The model declined this one. Try rewording it, or switch models.')
      }
      return {
        text: out.text,
        inputTokens: out.inputTokens,
        outputTokens: out.outputTokens,
        model: out.model || conn.model,
      }
    }

    const detail = await res.text().catch(() => '')
    if ((res.status === 400 || res.status === 422) && step < steps.length - 1) {
      step++
      continue
    }
    if ((res.status === 429 || res.status >= 500) && retries < 2 && !/credit|quota|billing|balance/i.test(detail)) {
      retries++
      const after = Number(res.headers.get('retry-after'))
      await wait(after > 0 ? Math.min(after, 20) * 1000 : 1500 * retries)
      continue
    }
    throw friendlyStatus(res.status, conn.provider.company, detail.slice(0, 200))
  }
}
