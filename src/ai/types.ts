import type { Provider } from './providers'

export interface Connection {
  provider: Provider
  key: string
  model: string
  baseURL: string
}

export interface CompleteRequest {
  system: string
  prompt: string
  /** A JSON Schema. When set, the reply is expected to be JSON of that shape. */
  schema?: Record<string, unknown>
  maxTokens: number
  onText?: (delta: string) => void
  signal?: AbortSignal
}

export interface CompleteResult {
  text: string
  inputTokens: number
  outputTokens: number
  model: string
}

export type AiErrorKind = 'auth' | 'credits' | 'rate' | 'network' | 'refused' | 'model' | 'server' | 'format'

/** An error written for the person using the app, not for a log file. */
export class AiError extends Error {
  constructor(
    public kind: AiErrorKind,
    message: string,
  ) {
    super(message)
    this.name = 'AiError'
  }
}

export function friendlyStatus(status: number | undefined, who: string, detail = ''): AiError {
  if (status === 401 || status === 403) {
    return new AiError('auth', `${who} didn't accept that key. Check it's active and copied in full.`)
  }
  if (status === 402) return new AiError('credits', `That ${who} account is out of credit.`)
  if (status === 404) return new AiError('model', `${who} doesn't offer that model on this key. Try another one.`)
  if (status === 429) {
    if (/credit|quota|billing|balance/i.test(detail)) {
      return new AiError('credits', `That ${who} account is out of credit.`)
    }
    return new AiError('rate', `${who} is rate-limiting this key. Give it a minute and try again.`)
  }
  if (status && status >= 500) return new AiError('server', `${who} is having trouble right now. Try again shortly.`)
  return new AiError('server', `${who} couldn't handle that request${detail ? `: ${detail}` : '.'}`)
}

/** Pulls the JSON out of a reply, whatever a model wrapped around it. */
export function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    return JSON.parse(trimmed)
  } catch {
    const start = trimmed.search(/[{[]/)
    const end = Math.max(trimmed.lastIndexOf('}'), trimmed.lastIndexOf(']'))
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1))
      } catch {
        // Fall through to the error below.
      }
    }
    throw new AiError('format', 'The model replied in a shape Techonomy could not read. Try again.')
  }
}
