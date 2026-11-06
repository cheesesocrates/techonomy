// A stand-in AI provider for trying the whole app without spending anything.
//
//   npm run mock-ai
//
// It speaks both wire formats on http://localhost:8787 and refuses the same
// things the real APIs refuse, so the real SDK and the real fetch code run end
// to end. In the app, choose "Other" and use http://localhost:8787/v1 as the
// server address. Keys containing "bad" get a 401, "broke" gets an out-of-credit
// 429, and any item containing "refuse-me" triggers a safety refusal.
import { createServer } from 'node:http'

const PORT = Number(process.env.PORT ?? 8787)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function reply(system, user) {
  if (system.includes('You file terms')) {
    const items = JSON.parse(user)
    return JSON.stringify({
      terms: items.map((input) => ({
        input,
        name: input.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 40),
        isTech: !/^(banana|my cat)/i.test(input),
        domain: /model|agent|llm/i.test(input) ? 'ai' : 'cloud',
        area: 'Elsewhere',
        kind: 'concept',
        year: 2026,
        definition: `A mock definition of ${input}.`,
        related: ['LLM', 'Docker', 'Definitely Not A Real Term'],
        sure: !/mystery/i.test(input),
      })),
    })
  }
  if (system.includes('You explain technology')) {
    const bridge = user.match(/already know: (.*)/)?.[1]?.split(',')[0] ?? 'what you know'
    return `Think of it as a cousin of ${bridge}. Same instincts, different job. That's the mock explanation, streamed in pieces.`
  }
  if (system.includes("You read someone's map")) {
    return JSON.stringify({
      title: 'Mock Generalist',
      reading: 'A wide, shallow-to-medium spread with its centre of gravity in shipping things for the web.',
      next: 'Learn how containers actually isolate processes, because you already lean on them.',
    })
  }
  return 'ok'
}

const chunks = (text) => text.match(/[\s\S]{1,14}/g) ?? ['']

function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] ?? '*')
}

const fail = (res, status, message, type = 'invalid_request_error') => {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ type: 'error', error: { type, message } }))
}

/** What the real Messages API rejects on current models. */
function anthropicProblem(b) {
  if ('temperature' in b || 'top_p' in b || 'top_k' in b) return 'sampling parameters are not supported'
  if (b.thinking?.type === 'disabled' || b.thinking?.budget_tokens) return 'thinking: this setting is not supported'
  if (b.tool_choice && ['any', 'tool'].includes(b.tool_choice.type)) return 'tool_choice: type "tool" and "any" are not supported'
  if (b.messages?.at(-1)?.role === 'assistant') return 'prefill is not supported'
  const format = b.output_config?.format
  if (format) {
    if (format.type !== 'json_schema' || !format.schema) return 'output_config.format must be a json_schema'
    const walk = (s) => {
      if (s?.type === 'object' && s.additionalProperties !== false) return false
      return Object.values(s?.properties ?? {}).every(walk) && (!s?.items || walk(s.items))
    }
    if (!walk(format.schema)) return 'output_config.format.schema: additionalProperties must be false'
  }
  return null
}

async function anthropic(req, res, b) {
  // The SDK sends keys as a bearer token; older clients use x-api-key.
  const key = String(req.headers['x-api-key'] ?? req.headers.authorization ?? '')
  if (key.includes('bad')) return fail(res, 401, 'invalid x-api-key', 'authentication_error')
  if (key.includes('broke')) return fail(res, 429, 'Your credit balance is too low', 'rate_limit_error')
  if (req.headers['anthropic-dangerous-direct-browser-access'] !== 'true') return fail(res, 401, 'browser access header missing')
  if (b.fallbacks && !String(req.headers['anthropic-beta']).includes('server-side-fallback-2026-07-01')) {
    return fail(res, 400, 'fallbacks requires the beta header')
  }
  const problem = anthropicProblem(b)
  if (problem) return fail(res, 400, problem)

  const system = b.system.map((s) => s.text).join('')
  const user = b.messages[0].content
  console.log(`anthropic ${b.model} effort=${b.output_config?.effort ?? '-'} schema=${Boolean(b.output_config?.format)} fallbacks=${b.fallbacks ?? '-'} max=${b.max_tokens}`)

  const refuse = user.includes('refuse-me')
  const text = reply(system, user)
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' })
  const send = (type, data) => res.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`)
  send('message_start', {
    message: { id: 'msg_mock', type: 'message', role: 'assistant', model: b.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: Math.ceil(user.length / 4) + 400, output_tokens: 1 } },
  })
  if (!refuse) {
    send('content_block_start', { index: 0, content_block: { type: 'text', text: '' } })
    for (const c of chunks(text)) {
      send('content_block_delta', { index: 0, delta: { type: 'text_delta', text: c } })
      await sleep(6)
    }
    send('content_block_stop', { index: 0 })
  }
  send('message_delta', { delta: { stop_reason: refuse ? 'refusal' : 'end_turn', stop_sequence: null }, usage: { output_tokens: Math.ceil(text.length / 4) } })
  send('message_stop', {})
  res.end()
}

async function openai(req, res, b) {
  const auth = String(req.headers.authorization ?? '')
  if (auth.includes('bad')) return fail(res, 401, 'invalid key')
  if (auth.includes('broke')) return fail(res, 429, 'You exceeded your quota, check your billing details')
  const schema = b.response_format?.type === 'json_schema'
  console.log(`openai ${b.model} format=${b.response_format?.type ?? 'none'} strict=${schema ? b.response_format.json_schema.strict : '-'}`)

  const [system, user] = [b.messages[0].content, b.messages[1].content]
  const text = reply(system, user)
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' })
  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)
  for (const c of chunks(text)) {
    send({ model: b.model, choices: [{ delta: { content: c }, finish_reason: null }] })
    await sleep(6)
  }
  send({ model: b.model, choices: [{ delta: {}, finish_reason: 'stop' }] })
  send({ choices: [], usage: { prompt_tokens: Math.ceil(user.length / 4) + 400, completion_tokens: Math.ceil(text.length / 4) } })
  res.write('data: [DONE]\n\n')
  res.end()
}

createServer(async (req, res) => {
  cors(req, res)
  if (req.method === 'OPTIONS') {
    res.writeHead(204).end()
    return
  }
  const url = new URL(req.url, 'http://x')

  if (req.method === 'GET' && url.pathname === '/v1/models') {
    if (String(req.headers['x-api-key'] ?? req.headers.authorization ?? '').includes('bad')) {
      return fail(res, 401, 'invalid key', 'authentication_error')
    }
    const ids = 'anthropic-version' in req.headers
      ? ['claude-haiku-5-5', 'claude-opus-5-5', 'claude-sonnet-5-5']
      : ['mock-embed-1', 'mock-large', 'mock-small']
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(
      JSON.stringify({
        data: ids.map((id) => ({ id, type: 'model', display_name: id, created_at: '2026-01-01T00:00:00Z' })),
        has_more: false,
        first_id: ids[0],
        last_id: ids.at(-1),
      }),
    )
    return
  }

  if (req.method === 'POST') {
    let raw = ''
    for await (const part of req) raw += part
    const body = JSON.parse(raw)
    if (url.pathname === '/v1/messages') return anthropic(req, res, body)
    if (url.pathname === '/v1/chat/completions') return openai(req, res, body)
  }
  res.writeHead(404).end()
}).listen(PORT, () => console.log(`Mock AI on http://localhost:${PORT}`))
