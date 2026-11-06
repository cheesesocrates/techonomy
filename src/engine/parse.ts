import { LOOKUP, norm } from '../map'

export interface Span {
  start: number
  end: number
  /** The map term this text resolved to, or null if it isn't on the map. */
  id: string | null
  text: string
}

export interface Parsed {
  spans: Span[]
  /** Map terms found, in reading order, without repeats. */
  found: string[]
  /** Things that look like terms but aren't on the map. */
  unknown: string[]
  /** Full sentences, kept so an AI can read them later. */
  prose: string[]
}

/**
 * Everyday words that are also tech terms. Inside a sentence these only count
 * when capitalised, so "I go to work" doesn't light up Go. In a plain list
 * they always count, because there the person clearly meant the term.
 */
const EVERYDAY = new Set(
  (
    'go c r rust swift dart spring flask express rails react ruby java make brew compose lean ' +
    'cloud edge wallet agents features types memory processor router proxy stack heap shell ' +
    'terminal tree trees graphs sorting evaluation attention alignment token tokens cursor ' +
    'workers lambda grid canvas cache hooks islands motion vault sandbox quantum drone robot ' +
    'robots virus worm mining chip chips sessions cookie cookies login permissions backup ' +
    'backups logs metrics tracing sprint sprints standup disruption monopoly transactions ' +
    'notebooks spreadsheet spreadsheets async recursive immutable ownership process processes ' +
    'thread threads clear agile transformer attention safety bias os ip vm pr mr ml dl ai ui ' +
    'ux ar vr ha ia ea dp di ts js py sh rx hf cv rl nn fp xp gc tf bi eda ram pos pow eth sol ' +
    'lambda mcp apis api rest json html css'
  )
    .split(' ')
    .filter((w) => !['mcp', 'apis', 'api', 'json', 'html', 'css'].includes(w)),
)

const SEPARATORS = /[\n\r,;|•·]+|\s+\/\s+|\s+and\s+|\s+&\s+(?=[a-z])/gi
const WORD = /[A-Za-z0-9][A-Za-z0-9+#./_'-]*/g
const MAX_GRAM = 5

export function levenshtein(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      row.push(v)
      if (v < best) best = v
    }
    if (best > limit) return limit + 1
    prev = row
  }
  return prev[b.length]
}

const KEYS_BY_FIRST = new Map<string, string[]>()
for (const key of LOOKUP.keys()) {
  const k = key[0]
  if (!KEYS_BY_FIRST.has(k)) KEYS_BY_FIRST.set(k, [])
  KEYS_BY_FIRST.get(k)!.push(key)
}

/** Forgives typos: "kubernets" still finds Kubernetes. Short words must match exactly. */
function fuzzy(key: string): string | null {
  if (key.length < 5) return null
  const limit = key.length >= 9 ? 2 : 1
  let best: string | null = null
  let bestD = limit + 1
  for (const candidate of KEYS_BY_FIRST.get(key[0]) ?? []) {
    if (candidate.length < 5) continue
    const d = levenshtein(key, candidate, limit)
    if (d < bestD) {
      bestD = d
      best = candidate
    }
  }
  return best ? LOOKUP.get(best)! : null
}

function isEveryday(text: string): boolean {
  return EVERYDAY.has(text.toLowerCase())
}

/** Finds map terms inside longer text, preferring the longest phrase at each word. */
function scan(text: string, offset: number, spans: Span[]) {
  const words = [...text.matchAll(WORD)].map((m) => ({ start: m.index, end: m.index + m[0].length, text: m[0] }))
  let i = 0
  while (i < words.length) {
    let matched = false
    for (let n = Math.min(MAX_GRAM, words.length - i); n >= 1; n--) {
      const start = words[i].start
      const end = words[i + n - 1].end
      const slice = text.slice(start, end).replace(/[.,:!?)]+$/, '')
      const id = LOOKUP.get(norm(slice))
      if (!id) continue
      if (n === 1 && isEveryday(slice) && slice === slice.toLowerCase()) continue
      spans.push({ start: offset + start, end: offset + start + slice.length, id, text: slice })
      i += n
      matched = true
      break
    }
    if (!matched) i++
  }
}

export function parseDump(input: string): Parsed {
  const spans: Span[] = []
  const unknown: string[] = []
  const prose: string[] = []

  const segments: { text: string; start: number }[] = []
  let cursor = 0
  for (const m of input.matchAll(SEPARATORS)) {
    segments.push({ text: input.slice(cursor, m.index), start: cursor })
    cursor = m.index + m[0].length
  }
  segments.push({ text: input.slice(cursor), start: cursor })

  for (const seg of segments) {
    const lead = seg.text.match(/^[\s\-*>#"'`(\d.)]*/)?.[0].length ?? 0
    let body = seg.text.slice(lead)
    const trail = body.match(/[\s"'`).:!?]+$/)?.[0].length ?? 0
    // "C++" and "Node.js" keep their punctuation; only trailing sentence marks go.
    if (trail) body = body.slice(0, body.length - trail)
    const start = seg.start + lead
    if (!body) continue

    const wordCount = body.split(/\s+/).length
    const exact = LOOKUP.get(norm(body))
    if (exact) {
      spans.push({ start, end: start + body.length, id: exact, text: body })
      continue
    }

    if (wordCount >= 5) {
      const before = spans.length
      scan(body, start, spans)
      if (spans.length === before || wordCount > 8) prose.push(body)
      continue
    }

    // Short phrase: maybe a typo, maybe it contains terms, maybe it's new to the map.
    const close = fuzzy(norm(body))
    if (close) {
      spans.push({ start, end: start + body.length, id: close, text: body })
      continue
    }
    const before = spans.length
    scan(body, start, spans)
    if (spans.length === before) {
      spans.push({ start, end: start + body.length, id: null, text: body })
      unknown.push(body)
    }
  }

  spans.sort((a, b) => a.start - b.start)
  const found = [...new Set(spans.flatMap((s) => (s.id ? [s.id] : [])))]
  const seen = new Set<string>()
  const uniqueUnknown = unknown.filter((u) => {
    const key = norm(u)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
  return { spans, found, unknown: uniqueUnknown, prose }
}
