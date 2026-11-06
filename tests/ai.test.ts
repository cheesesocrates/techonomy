import { afterEach, describe, expect, it, vi } from 'vitest'
import { completeOpenAi, listOpenAiModels } from '../src/ai/openaiCompatible'
import { PROVIDER_BY_ID, costOf, detectProvider, rankModels } from '../src/ai/providers'
import { estimatePlacement, placeTerms } from '../src/ai/tasks'
import { AiError, extractJson, type Connection } from '../src/ai/types'

const grok: Connection = {
  provider: PROVIDER_BY_ID.xai,
  key: 'xai-test',
  model: 'grok-4',
  baseURL: PROVIDER_BY_ID.xai.baseURL,
}

function sse(...chunks: object[]): Response {
  const body = chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('') + 'data: [DONE]\n\n'
  return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } })
}

const reply = (text: string) =>
  sse(
    { model: 'grok-4', choices: [{ delta: { content: text } }] },
    { choices: [{ delta: {}, finish_reason: 'stop' }] },
    { choices: [], usage: { prompt_tokens: 12, completion_tokens: 7 } },
  )

afterEach(() => vi.unstubAllGlobals())

describe('detectProvider', () => {
  it.each([
    ['sk-ant-api03-abc', 'anthropic', true],
    ['xai-abcdefgh', 'xai', true],
    ['gsk_abcdefgh', 'groq', true],
    ['sk-or-v1-abcdef', 'openrouter', true],
    ['AIzaSyAbcdefg', 'google', true],
    ['sk-proj-abcdefg', 'openai', true],
    ['sk-abcdefghijkl', 'openai', false],
  ])('%s belongs to %s', (key, id, sure) => {
    const d = detectProvider(key)!
    expect(d.provider.id).toBe(id)
    expect(d.sure).toBe(sure)
  })

  it('offers no guess for a key it cannot place', () => {
    expect(detectProvider('abcdefghijklmnop')).toBeNull()
    expect(detectProvider('short')).toBeNull()
  })

  it('tolerates stray spaces from copy and paste', () => {
    expect(detectProvider('  xai-abcdefgh \n')!.provider.id).toBe('xai')
  })
})

describe('rankModels', () => {
  it('drops non-chat models and leads with a sensible default', () => {
    const ranked = rankModels(PROVIDER_BY_ID.xai, ['grok-2-image', 'grok-3', 'grok-4', 'grok-4-fast', 'text-embedding-x'])
    expect(ranked[0]).toBe('grok-4')
    expect(ranked).not.toContain('grok-2-image')
    expect(ranked).not.toContain('text-embedding-x')
  })

  it('prefers Opus 5.5 for Claude when offered', () => {
    expect(rankModels(PROVIDER_BY_ID.anthropic, ['claude-haiku-5-5', 'claude-opus-5-5', 'claude-sonnet-5-5'])[0]).toBe('claude-opus-5-5')
  })
})

describe('costOf', () => {
  it('prices models it knows and stays quiet about those it does not', () => {
    expect(costOf('claude-opus-5-5', 1_000_000, 1_000_000)).toBe(24)
    expect(costOf('claude-haiku-5-5', 1_000_000, 1_000_000)).toBeCloseTo(0.6)
    expect(costOf('grok-4', 100, 100)).toBeNull()
    expect(estimatePlacement('grok-4', 10)).toBeNull()
    expect(estimatePlacement('claude-opus-5-5', 30)).toBeGreaterThan(0)
  })
})

describe('extractJson', () => {
  it('reads plain, fenced and chatty replies', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 })
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 })
    expect(extractJson('Sure! Here it is: {"a":1} Hope that helps.')).toEqual({ a: 1 })
  })

  it('says so when there is nothing to read', () => {
    expect(() => extractJson('no json here')).toThrow(AiError)
  })
})

describe('OpenAI-compatible wire, using Grok', () => {
  it('sends the key to the right place and reassembles a stream', async () => {
    const fetchMock = vi.fn(async () => reply('hello'))
    vi.stubGlobal('fetch', fetchMock)
    const seen: string[] = []
    const out = await completeOpenAi(grok, {
      system: 's',
      prompt: 'p',
      maxTokens: 100,
      onText: (d) => seen.push(d),
    })
    expect(out).toMatchObject({ text: 'hello', inputTokens: 12, outputTokens: 7, model: 'grok-4' })
    expect(seen).toEqual(['hello'])
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.x.ai/v1/chat/completions')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer xai-test')
  })

  it('steps down from strict schema when a provider rejects it', async () => {
    const bodies: Record<string, unknown>[] = []
    let call = 0
    vi.stubGlobal('fetch', async (_: string, init: RequestInit) => {
      bodies.push(JSON.parse(init.body as string))
      return ++call === 1 ? new Response('no schema here', { status: 400 }) : reply('{"ok":true}')
    })
    const out = await completeOpenAi(grok, { system: 's', prompt: 'p', schema: { type: 'object' }, maxTokens: 10 })
    expect(out.text).toBe('{"ok":true}')
    expect((bodies[0].response_format as { type: string }).type).toBe('json_schema')
    expect((bodies[1].response_format as { type: string }).type).toBe('json_object')
  })

  it('explains a bad key in plain words', async () => {
    vi.stubGlobal('fetch', async () => new Response('nope', { status: 401 }))
    await expect(completeOpenAi(grok, { system: 's', prompt: 'p', maxTokens: 10 })).rejects.toThrow(/didn't accept that key/)
  })

  it('tells an empty account from a rate limit', async () => {
    vi.stubGlobal('fetch', async () => new Response('insufficient credits on this team', { status: 429 }))
    await expect(completeOpenAi(grok, { system: 's', prompt: 'p', maxTokens: 10 })).rejects.toMatchObject({ kind: 'credits' })
  })

  it('names a local server that is not running', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('Failed to fetch')
    })
    const local = { ...grok, provider: PROVIDER_BY_ID.ollama, key: '', baseURL: PROVIDER_BY_ID.ollama.baseURL }
    await expect(listOpenAiModels(local)).rejects.toThrow(/Is it running/)
  })

  it('uses OpenAI’s newer token field for OpenAI only', async () => {
    let body: Record<string, unknown> = {}
    vi.stubGlobal('fetch', async (_: string, init: RequestInit) => {
      body = JSON.parse(init.body as string)
      return reply('x')
    })
    const openai = { ...grok, provider: PROVIDER_BY_ID.openai, baseURL: PROVIDER_BY_ID.openai.baseURL }
    await completeOpenAi(openai, { system: 's', prompt: 'p', maxTokens: 10 })
    expect(body.max_completion_tokens).toBe(10)
    expect(body.max_tokens).toBeUndefined()
    await completeOpenAi(grok, { system: 's', prompt: 'p', maxTokens: 10 })
    expect(body.max_tokens).toBe(10)
  })
})

describe('placeTerms', () => {
  const answer = (input: string) => ({
    input,
    name: input.toUpperCase(),
    isTech: true,
    domain: 'ai',
    area: 'Foundations',
    kind: 'concept',
    year: 2026,
    definition: 'Something new.',
    related: ['LLM'],
    sure: true,
  })

  it('files everything across batches and skips what is not tech', async () => {
    vi.stubGlobal('fetch', async (_: string, init: RequestInit) => {
      const items = JSON.parse(JSON.parse(init.body as string).messages[1].content) as string[]
      const terms = items.map(answer)
      terms[0] = { ...terms[0], isTech: false }
      return reply(JSON.stringify({ terms }))
    })
    const items = Array.from({ length: 65 }, (_, i) => `term${i}`)
    const placed: string[] = []
    let progress = 0
    await placeTerms(grok, items, (batch, terms) => {
      progress += batch.length
      placed.push(...terms.map((t) => t.name))
    })
    expect(progress).toBe(65)
    expect(placed.length).toBe(62) // three batches, one rejected from each
  })

  it('stops after the first batch when the key itself is bad', async () => {
    const fetchMock = vi.fn(async () => new Response('nope', { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)
    const items = Array.from({ length: 300 }, (_, i) => `term${i}`)
    await expect(placeTerms(grok, items, () => {})).rejects.toThrow(/didn't accept/)
    expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(3)
  })
})
