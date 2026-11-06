import { completeClaude, listClaudeModels } from './claude'
import { completeOpenAi, listOpenAiModels } from './openaiCompatible'
import { costOf, rankModels } from './providers'
import { AiError, extractJson, type CompleteRequest, type CompleteResult, type Connection } from './types'
import { DOMAINS, TERMS, type DomainId, type Kind } from '../map'
import type { Stats } from '../engine/stats'

export function complete(conn: Connection, req: CompleteRequest): Promise<CompleteResult> {
  return conn.provider.wire === 'anthropic' ? completeClaude(conn, req) : completeOpenAi(conn, req)
}

export async function fetchModels(conn: Connection): Promise<string[]> {
  const ids = conn.provider.wire === 'anthropic' ? await listClaudeModels(conn) : await listOpenAiModels(conn)
  return rankModels(conn.provider, ids)
}

export interface Usage {
  inputTokens: number
  outputTokens: number
  cost: number | null
}

const usageOf = (r: CompleteResult): Usage => ({
  inputTokens: r.inputTokens,
  outputTokens: r.outputTokens,
  cost: costOf(r.model, r.inputTokens, r.outputTokens),
})

const KINDS: Kind[] = ['tool', 'language', 'concept', 'practice', 'ideology', 'standard']
const DOMAIN_IDS = DOMAINS.map((d) => d.id)

const AREA_GUIDE = DOMAINS.map((d) => {
  const areas = [...new Set(TERMS.filter((t) => t.domain === d.id).map((t) => t.area))]
  return `- ${d.id} (${d.name}): ${areas.join(', ')}`
}).join('\n')

const PLACE_SYSTEM = `You file terms into Techonomy, a personal atlas of technology. Someone is listing what they know in their own words, and each item you receive is something that was not already on the atlas.

An item may be one term, a messy phrase or a full sentence. If it holds several terms, return each as its own entry. Keep tech ideologies, movements and philosophies: they belong on the atlas as much as tools do.

The atlas has eight domains, each with areas:
${AREA_GUIDE}

For each term return:
- input: the item it came from, copied exactly
- name: the term's usual written form, for example "PostgreSQL" rather than "postgres sql"
- isTech: false when it isn't really a technology term, such as an ordinary word or a personal note
- domain: the best domain id
- area: the best existing area, or a short new one if none fits
- kind: tool, language, concept, practice, ideology or standard
- year: roughly when it entered common use
- definition: one plain-English sentence under 16 words that a smart non-specialist would follow
- related: up to 4 well-known terms it connects to, by their usual names
- sure: false when you don't recognise the term, or it may be newer than your training data. In that case say so in the definition instead of guessing at a meaning. A wrong definition is much worse than an honest "not sure".`

const PLACE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['terms'],
  properties: {
    terms: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['input', 'name', 'isTech', 'domain', 'area', 'kind', 'year', 'definition', 'related', 'sure'],
        properties: {
          input: { type: 'string' },
          name: { type: 'string' },
          isTech: { type: 'boolean' },
          domain: { type: 'string', enum: DOMAIN_IDS },
          area: { type: 'string' },
          kind: { type: 'string', enum: KINDS },
          year: { type: 'integer' },
          definition: { type: 'string' },
          related: { type: 'array', items: { type: 'string' } },
          sure: { type: 'boolean' },
        },
      },
    },
  },
}

export interface PlacedTerm {
  input: string
  name: string
  domain: DomainId
  area: string
  kind: Kind
  year: number
  definition: string
  related: string[]
  sure: boolean
}

function validPlaced(x: unknown): PlacedTerm | null {
  const t = x as Partial<PlacedTerm & { isTech: boolean }>
  if (!t || typeof t.name !== 'string' || !t.name.trim() || t.isTech === false) return null
  if (!DOMAIN_IDS.includes(t.domain as DomainId)) return null
  return {
    input: String(t.input ?? t.name),
    name: t.name.trim().slice(0, 60),
    domain: t.domain as DomainId,
    area: String(t.area ?? '').slice(0, 40) || 'Elsewhere',
    kind: KINDS.includes(t.kind as Kind) ? (t.kind as Kind) : 'concept',
    year: Number.isFinite(t.year) ? Math.min(2030, Math.max(1800, Number(t.year))) : new Date().getFullYear(),
    definition: String(t.definition ?? '').slice(0, 220),
    related: Array.isArray(t.related) ? t.related.filter((r) => typeof r === 'string').slice(0, 4) : [],
    sure: t.sure !== false,
  }
}

const BATCH = 30
const PARALLEL = 3

/** Files items in small batches so a long list shows progress and one failure costs little. */
export async function placeTerms(
  conn: Connection,
  items: string[],
  onBatch: (batch: string[], placed: PlacedTerm[], usage: Usage) => void,
  signal?: AbortSignal,
): Promise<void> {
  const batches: string[][] = []
  for (let i = 0; i < items.length; i += BATCH) batches.push(items.slice(i, i + BATCH))

  let next = 0
  let firstError: unknown = null

  const worker = async () => {
    while (next < batches.length && !signal?.aborted) {
      const batch = batches[next++]
      try {
        const res = await complete(conn, {
          system: PLACE_SYSTEM,
          prompt: JSON.stringify(batch),
          schema: PLACE_SCHEMA,
          maxTokens: 24000,
          signal,
        })
        const parsed = extractJson(res.text) as { terms?: unknown[] } | unknown[]
        const list = Array.isArray(parsed) ? parsed : (parsed.terms ?? [])
        onBatch(batch, list.flatMap((x) => validPlaced(x) ?? []), usageOf(res))
      } catch (e) {
        firstError ??= e
        // A bad key will fail every batch the same way, so stop early.
        if (e instanceof AiError && ['auth', 'credits', 'model'].includes(e.kind)) next = batches.length
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(PARALLEL, batches.length) }, worker))
  if (firstError) throw firstError
}

/** Rough cost of filing a list, shown before anything is spent. */
export function estimatePlacement(model: string, count: number): number | null {
  const batches = Math.max(1, Math.ceil(count / BATCH))
  return costOf(model, batches * 1500 + count * 12, count * 130 + batches * 1200)
}

const EXPLAIN_SYSTEM = `You explain technology to one specific person, using what they already know as the bridge to what they don't.

Write two or three short sentences. Connect the new idea to something on their list, naming it, so it clicks into place. Plain language, no preamble, no headings, no lists. If you don't recognise the term or it may be newer than your training data, say that honestly instead of guessing.`

export async function explainTerm(
  conn: Connection,
  term: { name: string; def: string; area: string },
  bridges: string[],
  onText: (delta: string) => void,
  signal?: AbortSignal,
): Promise<Usage> {
  const res = await complete(conn, {
    system: EXPLAIN_SYSTEM,
    prompt: `Explain: ${term.name} (${term.area}). The atlas says: "${term.def}"\n\nThings this person already knows: ${
      bridges.join(', ') || 'nothing nearby yet'
    }`,
    maxTokens: 2000,
    onText,
    signal,
  })
  return usageOf(res)
}

const READ_SYSTEM = `You read someone's map of their own tech knowledge the way a sharp, kind mentor would. Be specific and honest; flattery is useless to them. Refer to the fields and terms you can actually see, and don't claim mastery the data doesn't show: this is what they say they're aware of, not a test of what they can do.

Return:
- title: a two to four word name for this kind of mind, such as "Product-minded Frontender"
- reading: two or three sentences on the shape of their knowledge and what it suggests about how they think
- next: one sentence naming the single most useful thing to learn next, and why`

const READ_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'reading', 'next'],
  properties: {
    title: { type: 'string' },
    reading: { type: 'string' },
    next: { type: 'string' },
  },
}

export interface Reading {
  title: string
  reading: string
  next: string
}

export async function readBrain(
  conn: Connection,
  stats: Stats,
  sample: string[],
  signal?: AbortSignal,
): Promise<{ reading: Reading; usage: Usage }> {
  const fields = stats.domains
    .map((d) => `${d.domain.name}: ${d.known} of ${d.total} terms, ${d.coreKnown} of ${d.coreTotal} core`)
    .join('\n')
  const meters = stats.meters.map((m) => `${m.label}: ${Math.round(m.value * 100)}%`).join(', ')
  const res = await complete(conn, {
    system: READ_SYSTEM,
    prompt: `Fields:\n${fields}\n\nShape: ${meters}\n\nSome of what they know: ${sample.join(', ')}\n\nClosest things they don't know yet: ${stats.blindSpots
      .map((t) => t.name)
      .join(', ')}`,
    schema: READ_SCHEMA,
    maxTokens: 3000,
    signal,
  })
  const parsed = extractJson(res.text) as Partial<Reading>
  if (!parsed.title || !parsed.reading) {
    throw new AiError('format', 'The model replied in a shape Techonomy could not read. Try again.')
  }
  return {
    reading: { title: parsed.title, reading: parsed.reading, next: parsed.next ?? '' },
    usage: usageOf(res),
  }
}
