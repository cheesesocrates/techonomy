import { describe, expect, it } from 'vitest'
import { AREAS, DOMAINS, MAP_PROBLEMS, TERMS, TERM_BY_ID } from '../src/map'

describe('reference map', () => {
  it('has no broken links, duplicates or malformed lines', () => {
    expect(MAP_PROBLEMS).toEqual([])
  })

  it('is complete and well formed', () => {
    for (const t of TERMS) {
      expect(t.def.length, t.name).toBeGreaterThan(8)
      expect(t.year, t.name).toBeGreaterThan(1700)
      expect(t.year, t.name).toBeLessThanOrEqual(2026)
      expect([1, 2, 3], t.name).toContain(t.weight)
    }
  })

  it('stores every link in both directions', () => {
    for (const t of TERMS) {
      for (const r of t.rel) expect(TERM_BY_ID.get(r)!.rel, `${t.id} -> ${r}`).toContain(t.id)
    }
  })

  it('forms one connected web, so full knowledge can reach full connection', () => {
    const seen = new Set<string>([TERMS[0].id])
    const stack = [TERMS[0].id]
    while (stack.length) {
      for (const r of TERM_BY_ID.get(stack.pop()!)!.rel) {
        if (!seen.has(r)) {
          seen.add(r)
          stack.push(r)
        }
      }
    }
    expect(TERMS.filter((t) => !seen.has(t.id)).map((t) => t.name)).toEqual([])
  })

  it('gives every domain real depth', () => {
    for (const d of DOMAINS) {
      const terms = TERMS.filter((t) => t.domain === d.id)
      expect(terms.length, d.name).toBeGreaterThan(50)
      expect(AREAS.filter((a) => a.domain === d.id).length, d.name).toBeGreaterThanOrEqual(4)
    }
  })
})
