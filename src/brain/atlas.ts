import { buildAtlas } from './layout'
import type { Plate, PlateTerm } from './plate'
import { TERMS } from '../map'
import type { CustomTerm } from '../engine/stats'

/** The fixed geography of the brain, worked out once per page load. */
export const ATLAS = buildAtlas()

const BASE: PlateTerm[] = TERMS.map((t) => ({
  id: t.id,
  name: t.name,
  domain: t.domain,
  kind: t.kind,
  weight: t.weight,
  x: ATLAS.pos.get(t.id)!.x,
  y: ATLAS.pos.get(t.id)!.y,
  rel: t.rel,
  custom: false,
}))

export function plateTerms(custom: Record<string, CustomTerm>): PlateTerm[] {
  const extra = Object.values(custom).map((c) => ({
    id: c.id,
    name: c.name,
    domain: c.domain,
    kind: c.kind,
    weight: 2,
    x: c.x,
    y: c.y,
    rel: c.rel,
    custom: true,
  }))
  if (!extra.length) return BASE

  // Links are stored both ways, so a map term points back at custom terms too.
  const back = new Map<string, string[]>()
  for (const c of extra) {
    for (const r of c.rel) {
      if (!back.has(r)) back.set(r, [])
      back.get(r)!.push(c.id)
    }
  }
  return [...BASE.map((n) => (back.has(n.id) ? { ...n, rel: [...n.rel, ...back.get(n.id)!] } : n)), ...extra]
}

/** The live plate, so any page can point at something on it. */
export const stage: { plate: Plate | null } = { plate: null }
