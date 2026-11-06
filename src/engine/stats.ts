import { DOMAINS, DOMAIN_BY_ID, KIND_LABEL, TERMS, TERM_BY_ID, TOTAL_WEIGHT, type Domain, type DomainId, type Kind, type Term } from '../map'
import { hash } from '../brain/layout'

export type Level = 1 | 2 | 3 | 4

export interface Known {
  level: Level
  at: number
}

export type KnownMap = Record<string, Known>

export interface CustomTerm {
  id: string
  name: string
  domain: DomainId
  area: string
  kind: Kind
  year: number
  def: string
  rel: string[]
  x: number
  y: number
  /** The AI wasn't confident about this one. */
  unsure?: boolean
}

export const LEVELS: { level: Level; label: string; hint: string; depth: number }[] = [
  { level: 1, label: 'Heard of it', hint: 'The name rings a bell', depth: 0.4 },
  { level: 2, label: 'Know it', hint: 'I could explain the gist', depth: 0.7 },
  { level: 3, label: 'Use it', hint: 'I work with this', depth: 0.9 },
  { level: 4, label: 'Could teach it', hint: 'I could teach this', depth: 1 },
]

export interface AreaStat {
  area: string
  known: number
  total: number
}

export interface DomainStat {
  domain: Domain
  known: number
  total: number
  /** Share of this field's weight, so core terms count for more. */
  coverage: number
  coreKnown: number
  coreTotal: number
  areas: AreaStat[]
}

export interface EraStat {
  label: string
  known: number
  total: number
}

export interface KindStat {
  label: string
  known: number
  total: number
}

export interface Tier {
  name: string
  floor: number
}

export interface Meter {
  key: 'breadth' | 'depth' | 'connection' | 'currency'
  label: string
  value: number
  explain: string
}

export interface Stats {
  /** Importance-weighted share of the map you know, 0 to 1. */
  awareness: number
  lit: number
  total: number
  beyond: number
  domains: DomainStat[]
  meters: Meter[]
  eras: EraStat[]
  kinds: KindStat[]
  tier: Tier
  nextTier: Tier | null
  /** Roughly how many core terms get you to the next tier. */
  termsToNext: number
  strongest: DomainStat | null
  weakest: DomainStat | null
  recentKnown: number
  recentTotal: number
  blindSpots: Term[]
}

export const TIERS: Tier[] = [
  { name: 'Blank slate', floor: 0 },
  { name: 'Curious', floor: 0.02 },
  { name: 'Explorer', floor: 0.08 },
  { name: 'Practitioner', floor: 0.2 },
  { name: 'Veteran', floor: 0.38 },
  { name: 'Polymath', floor: 0.58 },
  { name: 'Oracle', floor: 0.8 },
]

const ERAS: { label: string; from: number; to: number }[] = [
  { label: 'Before 1980', from: 0, to: 1979 },
  { label: '1980s', from: 1980, to: 1989 },
  { label: '1990s', from: 1990, to: 1999 },
  { label: '2000s', from: 2000, to: 2009 },
  { label: '2010s', from: 2010, to: 2019 },
  { label: '2020s', from: 2020, to: 9999 },
]

export const RECENT_FROM = 2023

const depthOf = (level: Level) => LEVELS[level - 1].depth

/**
 * How close a term sits to what you already know. Links to things you know pull
 * it forward; core terms and thin fields nudge it up. The small hash keeps ties
 * stable, so the order doesn't shuffle between visits.
 */
function frontierScore(t: Term, known: KnownMap, coverage: Map<DomainId, number>): number {
  let pull = 0
  for (const r of t.rel) {
    const k = known[r]
    if (k) pull += 0.7 + 0.25 * k.level
  }
  return pull * 2 + t.weight * 1.1 + (1 - (coverage.get(t.domain) ?? 0)) * 0.9 + (hash(t.id) % 100) / 400
}

export function frontier(known: KnownMap, skip: Record<string, unknown> = {}, limit = 60): Term[] {
  const coverage = new Map<DomainId, number>()
  for (const d of DOMAINS) {
    const terms = TERMS.filter((t) => t.domain === d.id)
    const all = terms.reduce((s, t) => s + t.weight, 0)
    coverage.set(d.id, terms.reduce((s, t) => s + (known[t.id] ? t.weight : 0), 0) / all)
  }
  return TERMS.filter((t) => !known[t.id] && !skip[t.id])
    .map((t) => ({ t, s: frontierScore(t, known, coverage) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.t)
}

/** The classics, one field at a time, for someone staring at an empty page. */
export function starters(known: KnownMap, offset = 0, count = 14): Term[] {
  const core = DOMAINS.map((d) =>
    TERMS.filter((t) => t.domain === d.id && t.weight === 3 && !known[t.id]).sort(
      (a, b) => hash(a.id) - hash(b.id),
    ),
  )
  const out: Term[] = []
  for (let i = offset; out.length < count && i < offset + 200; i++) {
    const row = core[i % core.length]
    if (row.length) out.push(row[Math.floor(i / core.length) % row.length])
  }
  return [...new Set(out)]
}

function largestWeb(ids: string[], known: KnownMap): { linked: number; largest: number } {
  const visited = new Set<string>()
  let linked = 0
  let largest = 0
  for (const id of ids) {
    if (TERM_BY_ID.get(id)?.rel.some((r) => known[r])) linked++
    if (visited.has(id)) continue
    let size = 0
    const stack = [id]
    visited.add(id)
    while (stack.length) {
      const cur = stack.pop()!
      size++
      for (const r of TERM_BY_ID.get(cur)?.rel ?? []) {
        if (known[r] && !visited.has(r)) {
          visited.add(r)
          stack.push(r)
        }
      }
    }
    if (size > largest) largest = size
  }
  return { linked, largest }
}

export function computeStats(known: KnownMap, custom: Record<string, CustomTerm> = {}): Stats {
  const onMap = TERMS.filter((t) => known[t.id])
  const awareness = onMap.reduce((s, t) => s + t.weight, 0) / TOTAL_WEIGHT

  const domains: DomainStat[] = DOMAINS.map((domain) => {
    const terms = TERMS.filter((t) => t.domain === domain.id)
    const all = terms.reduce((s, t) => s + t.weight, 0)
    const have = terms.filter((t) => known[t.id])
    const areas = new Map<string, AreaStat>()
    for (const t of terms) {
      if (!areas.has(t.area)) areas.set(t.area, { area: t.area, known: 0, total: 0 })
      const a = areas.get(t.area)!
      a.total++
      if (known[t.id]) a.known++
    }
    const core = terms.filter((t) => t.weight === 3)
    return {
      domain,
      known: have.length,
      total: terms.length,
      coverage: have.reduce((s, t) => s + t.weight, 0) / all,
      coreKnown: core.filter((t) => known[t.id]).length,
      coreTotal: core.length,
      areas: [...areas.values()],
    }
  })

  const ranked = [...domains].sort((a, b) => b.coverage - a.coverage)
  const hasAny = onMap.length > 0

  // Breadth: a field counts as fully reached at a third of its weight.
  const breadth = domains.reduce((s, d) => s + Math.min(1, d.coverage / 0.33), 0) / domains.length

  // Depth: how much of the core you hold, and how well, in the fields you've entered.
  const active = domains.filter((d) => d.coverage >= 0.05)
  let depthSum = 0
  let depthAll = 0
  for (const d of active) {
    for (const t of TERMS) {
      if (t.domain !== d.domain.id || t.weight !== 3) continue
      depthAll++
      if (known[t.id]) depthSum += depthOf(known[t.id].level)
    }
  }
  const depth = depthAll ? depthSum / depthAll : 0

  // Connection: how much of what you know links up into a single web.
  const ids = onMap.map((t) => t.id)
  const web = largestWeb(ids, known)
  const connection = ids.length ? 0.5 * (web.linked / ids.length) + 0.5 * (web.largest / ids.length) : 0

  // Currency: how much of the last few years you've picked up.
  const recent = TERMS.filter((t) => t.year >= RECENT_FROM)
  const recentHave = recent.filter((t) => known[t.id])
  const currency = recentHave.length / recent.length

  const meters: Meter[] = [
    { key: 'breadth', label: 'Breadth', value: breadth, explain: 'How many fields you reach into.' },
    { key: 'depth', label: 'Depth', value: depth, explain: 'How much of the core you hold, and how well.' },
    { key: 'connection', label: 'Connection', value: connection, explain: 'How much of it links into one web.' },
    { key: 'currency', label: 'Currency', value: currency, explain: `How much of ${RECENT_FROM} onward you've caught.` },
  ]

  const eras = ERAS.map((e) => {
    const inEra = TERMS.filter((t) => t.year >= e.from && t.year <= e.to)
    return { label: e.label, total: inEra.length, known: inEra.filter((t) => known[t.id]).length }
  })

  const kinds = (Object.keys(KIND_LABEL) as Kind[])
    .map((k) => {
      const ofKind = TERMS.filter((t) => t.kind === k)
      return { label: KIND_LABEL[k], total: ofKind.length, known: ofKind.filter((t) => known[t.id]).length }
    })
    .sort((a, b) => b.known - a.known)

  let tierIndex = 0
  TIERS.forEach((t, i) => {
    if (awareness >= t.floor) tierIndex = i
  })
  const tier = TIERS[tierIndex]
  const nextTier = TIERS[tierIndex + 1] ?? null
  const termsToNext = nextTier ? Math.ceil(((nextTier.floor - awareness) * TOTAL_WEIGHT) / 3) : 0

  return {
    awareness,
    lit: onMap.length,
    total: TERMS.length,
    beyond: Object.keys(custom).filter((id) => known[id]).length,
    domains,
    meters,
    eras,
    kinds,
    tier,
    nextTier,
    termsToNext,
    strongest: hasAny ? ranked[0] : null,
    weakest: hasAny ? ranked[ranked.length - 1] : null,
    recentKnown: recentHave.length,
    recentTotal: recent.length,
    blindSpots: frontier(known, {}, 6),
  }
}

/** Plain-language summary, so nobody has to read a dashboard to get the point. */
export function summarize(s: Stats): string {
  if (!s.lit) return 'Nothing lit yet. Tell it one thing you know and the map starts to fill in.'
  const parts = [`You know ${s.lit} of the ${s.total} terms on the map.`]
  if (s.strongest && s.weakest && s.strongest !== s.weakest) {
    parts.push(`${s.strongest.domain.name} is your strongest field, and ${s.weakest.domain.name} is your biggest blind spot.`)
  }
  return parts.join(' ')
}

/** A line about where a field lives in the brain, and why. */
export function regionCopy(id: DomainId): string {
  const d = DOMAIN_BY_ID[id]
  const place = id === 'code' ? d.region : `The ${d.region.toLowerCase()}`
  return `${place}: ${d.role}.`
}
