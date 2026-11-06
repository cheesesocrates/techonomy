import { describe, expect, it } from 'vitest'
import { buildAtlas } from '../src/brain/layout'
import { insideBrain } from '../src/brain/anatomy'
import { parseDump } from '../src/engine/parse'
import { computeStats, frontier, starters, summarize, type KnownMap } from '../src/engine/stats'
import { TERMS, TERM_BY_ID, TOTAL_WEIGHT } from '../src/map'

const names = (ids: string[]) => ids.map((id) => TERM_BY_ID.get(id)!.name)

describe('parseDump', () => {
  it('reads plain lists in any spelling', () => {
    const p = parseDump('react, node js\nKubernetes; k8s\n- postgres\n* C++, C#, ci/cd')
    expect(names(p.found)).toEqual(['React', 'Node.js', 'Kubernetes', 'PostgreSQL', 'C++', 'C#', 'CI/CD'])
    expect(p.unknown).toEqual([])
  })

  it('forgives typos on longer words but not short ones', () => {
    expect(names(parseDump('kubernets, tenserflow').found)).toEqual(['Kubernetes', 'TensorFlow'])
    expect(parseDump('dokcer-x').found).toEqual([])
  })

  it('keeps unknown phrases for later', () => {
    const p = parseDump('react, frobnicator 9000')
    expect(names(p.found)).toEqual(['React'])
    expect(p.unknown).toEqual(['frobnicator 9000'])
  })

  it('finds terms inside sentences without being fooled by everyday words', () => {
    const p = parseDump('I go to work and make things with Docker and the unix philosophy every single day')
    expect(names(p.found)).toContain('Docker')
    expect(names(p.found)).toContain('Unix Philosophy')
    expect(names(p.found)).not.toContain('Go')
    expect(names(p.found)).not.toContain('Makefile')
  })

  it('takes a capitalised everyday word in a sentence at face value', () => {
    expect(names(parseDump('Lately I have been writing a lot of Go at my job').found)).toContain('Go')
  })

  it('accepts everyday words in a list, where the meaning is obvious', () => {
    expect(names(parseDump('go, rust, swift').found)).toEqual(['Go', 'Rust', 'Swift'])
  })

  it('reports exact character spans so the field can underline them', () => {
    const input = 'docker, kafka'
    for (const s of parseDump(input).spans) expect(input.slice(s.start, s.end)).toBe(s.text)
  })

  it('does not choke on empty or strange input', () => {
    expect(parseDump('').found).toEqual([])
    expect(parseDump(',,, ;;; \n\n').spans).toEqual([])
    expect(parseDump('🧠, ???').found).toEqual([])
  })
})

describe('stats', () => {
  const know = (...names: string[]): KnownMap =>
    Object.fromEntries(
      TERMS.filter((t) => names.includes(t.name)).map((t) => [t.id, { level: 2 as const, at: 1 }]),
    )

  it('starts at zero', () => {
    const s = computeStats({})
    expect(s.awareness).toBe(0)
    expect(s.lit).toBe(0)
    expect(s.tier.name).toBe('Blank slate')
    expect(s.strongest).toBeNull()
    expect(summarize(s)).toMatch(/Nothing lit/)
  })

  it('reaches exactly 100% when everything is known', () => {
    const all: KnownMap = Object.fromEntries(TERMS.map((t) => [t.id, { level: 4 as const, at: 1 }]))
    const s = computeStats(all)
    expect(s.awareness).toBeCloseTo(1)
    expect(s.tier.name).toBe('Oracle')
    expect(s.nextTier).toBeNull()
    for (const m of s.meters) expect(m.value).toBeCloseTo(1)
  })

  it('weights core terms above specialist ones', () => {
    const core = TERMS.find((t) => t.weight === 3)!
    const niche = TERMS.find((t) => t.weight === 1)!
    const a = computeStats({ [core.id]: { level: 2, at: 1 } }).awareness
    const b = computeStats({ [niche.id]: { level: 2, at: 1 } }).awareness
    expect(a).toBeCloseTo(3 / TOTAL_WEIGHT)
    expect(a).toBeGreaterThan(b)
  })

  it('rewards deeper familiarity without changing awareness', () => {
    const t = TERMS.find((x) => x.weight === 3)!
    const peers = TERMS.filter((x) => x.domain === t.domain && x.weight === 3).slice(0, 12)
    const at = (level: 1 | 4): KnownMap => Object.fromEntries(peers.map((p) => [p.id, { level, at: 1 }]))
    const low = computeStats(at(1))
    const high = computeStats(at(4))
    expect(high.awareness).toBe(low.awareness)
    expect(high.meters[1].value).toBeGreaterThan(low.meters[1].value)
  })

  it('credits links between terms', () => {
    const linked = computeStats(know('Docker', 'Kubernetes', 'Containers'))
    const apart = computeStats(know('Docker', 'Haskell', 'Bitcoin'))
    expect(linked.meters[2].value).toBeGreaterThan(apart.meters[2].value)
  })

  it('suggests what sits next to what you know, and never what you know', () => {
    const known = know('Docker', 'Containers', 'Microservices')
    const next = frontier(known)
    expect(next.map((t) => t.name)).toContain('Kubernetes')
    expect(next.some((t) => known[t.id])).toBe(false)
  })

  it('has starters for an empty brain across every field', () => {
    const picks = starters({}, 0, 8)
    expect(new Set(picks.map((t) => t.domain)).size).toBe(8)
    expect(picks.every((t) => t.weight === 3)).toBe(true)
  })
})

describe('atlas', () => {
  const atlas = buildAtlas()

  it('gives every term its own spot inside the brain', () => {
    expect(atlas.pos.size).toBe(TERMS.length)
    const seen = new Set<string>()
    for (const t of TERMS) {
      const p = atlas.pos.get(t.id)!
      expect(insideBrain(p.x, p.y), t.name).toBe(true)
      const key = `${p.x.toFixed(1)},${p.y.toFixed(1)}`
      expect(seen.has(key), t.name).toBe(false)
      seen.add(key)
    }
  })

  it('lands in the same place every time', () => {
    const again = buildAtlas()
    for (const t of TERMS) expect(again.pos.get(t.id)).toEqual(atlas.pos.get(t.id))
  })
})
