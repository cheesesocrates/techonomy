import ai from './domains/ai'
import cloud from './domains/cloud'
import code from './domains/code'
import data from './domains/data'
import ideas from './domains/ideas'
import interfaces from './domains/interfaces'
import security from './domains/security'
import systems from './domains/systems'
import type { DomainId, Kind, Term } from './types'

export * from './types'

const KINDS: Record<string, Kind> = {
  t: 'tool',
  l: 'language',
  c: 'concept',
  p: 'practice',
  i: 'ideology',
  s: 'standard',
}

/** Folds spelling, spacing and punctuation so "Node.js", "node js" and "NODEJS" all meet. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9+#]+/g, '')
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\+/g, 'p')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SOURCES: [DomainId, string][] = [
  ['ai', ai],
  ['data', data],
  ['ideas', ideas],
  ['systems', systems],
  ['code', code],
  ['interfaces', interfaces],
  ['security', security],
  ['cloud', cloud],
]

interface Draft extends Term {
  rawRel: string[]
}

const drafts: Draft[] = []
/** Problems with the data itself. The test suite fails if any exist. */
export const MAP_PROBLEMS: string[] = []

for (const [domain, src] of SOURCES) {
  let area = ''
  for (const raw of src.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('@')) {
      area = line.slice(1).trim()
      continue
    }
    const f = line.split('|').map((x) => x.trim())
    if (f.length !== 7) {
      MAP_PROBLEMS.push(`bad line: ${line}`)
      continue
    }
    const [name, aliases, kind, year, weight, def, rel] = f
    drafts.push({
      id: slug(name),
      name,
      aliases: aliases ? aliases.split(',').map((a) => a.trim()).filter(Boolean) : [],
      domain,
      area,
      kind: KINDS[kind] ?? 'concept',
      year: Number(year),
      weight: Number(weight) as 1 | 2 | 3,
      def,
      rel: [],
      rawRel: rel ? rel.split(';').map((r) => r.trim()).filter(Boolean) : [],
    })
  }
}

/** Every spelling of every term, folded. */
export const LOOKUP = new Map<string, string>()

// Names win over aliases, so collisions never hide a term's own name.
for (const d of drafts) {
  const key = norm(d.name)
  if (LOOKUP.has(key)) MAP_PROBLEMS.push(`duplicate name: ${d.name}`)
  LOOKUP.set(key, d.id)
}
for (const d of drafts) {
  for (const a of d.aliases) {
    const key = norm(a)
    const owner = LOOKUP.get(key)
    if (owner && owner !== d.id) MAP_PROBLEMS.push(`alias "${a}" of ${d.name} collides with ${owner}`)
    else LOOKUP.set(key, d.id)
  }
}

export const TERM_BY_ID = new Map<string, Term>()
for (const d of drafts) TERM_BY_ID.set(d.id, d)

// Links are authored in one direction and stored in both.
const links = new Map<string, Set<string>>(drafts.map((d) => [d.id, new Set<string>()]))
for (const d of drafts) {
  for (const r of d.rawRel) {
    const target = LOOKUP.get(norm(r))
    if (!target) {
      MAP_PROBLEMS.push(`${d.name} links to unknown term "${r}"`)
      continue
    }
    if (target === d.id) continue
    links.get(d.id)!.add(target)
    links.get(target)!.add(d.id)
  }
}
for (const d of drafts) {
  d.rel = [...links.get(d.id)!]
  delete (d as Partial<Draft>).rawRel
}

export const TERMS: Term[] = drafts

export const AREAS: { domain: DomainId; area: string; terms: Term[] }[] = []
for (const t of TERMS) {
  let bucket = AREAS.find((a) => a.domain === t.domain && a.area === t.area)
  if (!bucket) {
    bucket = { domain: t.domain, area: t.area, terms: [] }
    AREAS.push(bucket)
  }
  bucket.terms.push(t)
}

/** Each term's share of the whole map. Core terms count three times a specialist one. */
export const TOTAL_WEIGHT = TERMS.reduce((sum, t) => sum + t.weight, 0)
