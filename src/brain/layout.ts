import { CEREBELLUM, CEREBRUM, STEM, distanceTo, inside, insideBrain, type Pt } from './anatomy'
import { DOMAINS, TERMS, type DomainId, type Term } from '../map'

/**
 * Fixed geography. Every term on the map owns one spot, computed the same way on
 * every load, so people build real spatial memory of their own brain: adding a
 * term never moves anything else. Unknown terms stay on the plate, dark.
 */
export interface Atlas {
  pos: Map<string, { x: number; y: number }>
  /** Middle of each domain's region. */
  centers: Record<DomainId, { x: number; y: number }>
}

export function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A hex grid, bent by a little noise so its rows read like tissue and not graph paper. */
function grid(poly: Pt[], spacing: number, margin: number, exclude: Pt[][]): Pt[] {
  const rand = seeded(20261106)
  const out: Pt[] = []
  const rowH = spacing * 0.866
  // Sampling doesn't need every vertex, and this runs on every page load.
  const coarse = poly.filter((_, i) => i % 4 === 0)
  const xs = coarse.map((p) => p[0])
  const ys = coarse.map((p) => p[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  let row = 0
  for (let y = 40; y < 800; y += rowH, row++) {
    for (let x = 80 + (row % 2 ? spacing / 2 : 0); x < 920; x += spacing) {
      const px = x + 5 * Math.sin(y / 37 + 1.1) + 3 * Math.sin((x + y) / 23) + (rand() - 0.5) * spacing * 0.3
      const py = y + 5 * Math.sin(x / 41) + 3 * Math.sin((x - y) / 29 + 0.7) + (rand() - 0.5) * spacing * 0.3
      if (px < x0 || px > x1 || py < y0 || py > y1) continue
      if (!inside(coarse, px, py)) continue
      if (exclude.some((e) => inside(e, px, py))) continue
      if (distanceTo(coarse, px, py, 1) < margin) continue
      out.push([px, py])
    }
  }
  return out
}

/** Finds the widest spacing that still fits `n` points inside a shape. */
function fill(poly: Pt[], n: number, margin: number, exclude: Pt[][] = []): Pt[] {
  let lo = 6
  let hi = 60
  let best: Pt[] = []
  for (let i = 0; i < 11; i++) {
    const mid = (lo + hi) / 2
    const pts = grid(poly, mid, margin, exclude)
    if (pts.length >= n) {
      best = pts
      lo = mid
    } else {
      hi = mid
    }
  }
  if (best.length < n) throw new Error(`Could not fit ${n} points`)
  // Trim evenly rather than from one edge.
  const rand = seeded(7)
  while (best.length > n) best.splice(Math.floor(rand() * best.length), 1)
  return best
}

interface Seed {
  x: number
  y: number
  cap: number
}

/**
 * Voronoi regions with exact sizes: each point joins its nearest seed, and seeds
 * that are over capacity shrink until every domain holds exactly its own terms.
 */
function capacityAssign(points: Pt[], seeds: Seed[]): Pt[][] {
  const offset = seeds.map(() => 0)
  const owner = new Array<number>(points.length).fill(0)
  // Distances never change between iterations, only the offsets do.
  const dist = points.map((p) => seeds.map((s) => Math.hypot(p[0] - s.x, p[1] - s.y)))
  const cost = (i: number, s: number) => dist[i][s] - offset[s]

  for (let iter = 0; iter < 600; iter++) {
    const count = seeds.map(() => 0)
    for (let i = 0; i < points.length; i++) {
      let best = 0
      for (let s = 1; s < seeds.length; s++) if (cost(i, s) < cost(i, best)) best = s
      owner[i] = best
      count[best]++
    }
    if (seeds.every((s, i) => s.cap === count[i])) break
    const step = 2 * (1 - iter / 600) + 0.05
    seeds.forEach((s, i) => (offset[i] += Math.sign(s.cap - count[i]) * step))
  }

  // Settle any last few points by moving the cheapest one across a border.
  const count = seeds.map((_, i) => owner.filter((o) => o === i).length)
  for (let guard = 0; guard < 200; guard++) {
    const over = count.findIndex((c, i) => c > seeds[i].cap)
    if (over < 0) break
    let move = -1
    let target = -1
    let bestCost = Infinity
    points.forEach((_, i) => {
      if (owner[i] !== over) return
      seeds.forEach((_, s) => {
        if (count[s] >= seeds[s].cap) return
        const c = cost(i, s) - cost(i, over)
        if (c < bestCost) {
          bestCost = c
          move = i
          target = s
        }
      })
    })
    owner[move] = target
    count[over]--
    count[target]++
  }

  return seeds.map((_, s) => points.filter((_, i) => owner[i] === s))
}

/** Cuts a region into its sub-areas, keeping areas that are listed together side by side. */
function splitAreas(points: Pt[], groups: Term[][], assign: (terms: Term[], pts: Pt[]) => void): void {
  if (groups.length === 1) {
    assign(groups[0], points)
    return
  }
  const total = groups.reduce((n, g) => n + g.length, 0)
  let acc = 0
  let cut = 1
  for (let i = 0; i < groups.length - 1; i++) {
    acc += groups[i].length
    cut = i + 1
    if (acc >= total / 2) break
  }
  const leftCount = groups.slice(0, cut).reduce((n, g) => n + g.length, 0)
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const wide = Math.max(...xs) - Math.min(...xs) >= Math.max(...ys) - Math.min(...ys)
  const sorted = [...points].sort((a, b) => (wide ? a[0] - b[0] : a[1] - b[1]))
  splitAreas(sorted.slice(0, leftCount), groups.slice(0, cut), assign)
  splitAreas(sorted.slice(leftCount), groups.slice(cut), assign)
}

// Where each cerebral domain's region is anchored, in the spirit of real anatomy.
const CEREBRAL_SEEDS: Partial<Record<DomainId, Pt>> = {
  ideas: [225, 215],
  code: [235, 372],
  ai: [545, 175],
  interfaces: [785, 320],
  data: [545, 480],
  security: [370, 520],
}

export function buildAtlas(terms: Term[] = TERMS): Atlas {
  const byDomain = new Map<DomainId, Term[]>(DOMAINS.map((d) => [d.id, []]))
  for (const t of terms) byDomain.get(t.domain)!.push(t)

  const ids = Object.keys(CEREBRAL_SEEDS) as DomainId[]
  const cerebralCount = ids.reduce((n, id) => n + byDomain.get(id)!.length, 0)
  const cerebral = fill(CEREBRUM, cerebralCount, 7)
  const seeds = ids.map((id) => ({
    x: CEREBRAL_SEEDS[id]![0],
    y: CEREBRAL_SEEDS[id]![1],
    cap: byDomain.get(id)!.length,
  }))
  const regions = new Map<DomainId, Pt[]>()
  capacityAssign(cerebral, seeds).forEach((pts, i) => regions.set(ids[i], pts))
  regions.set('cloud', fill(CEREBELLUM, byDomain.get('cloud')!.length, 5, [CEREBRUM]))
  regions.set('systems', fill(STEM, byDomain.get('systems')!.length, 4, [CEREBRUM, CEREBELLUM]))

  const pos = new Map<string, { x: number; y: number }>()
  const centers = {} as Atlas['centers']

  for (const d of DOMAINS) {
    const pts = regions.get(d.id)!
    centers[d.id] = {
      x: pts.reduce((s, p) => s + p[0], 0) / pts.length,
      y: pts.reduce((s, p) => s + p[1], 0) / pts.length,
    }

    const groups = new Map<string, Term[]>()
    for (const t of byDomain.get(d.id)!) {
      if (!groups.has(t.area)) groups.set(t.area, [])
      groups.get(t.area)!.push(t)
    }

    splitAreas(pts, [...groups.values()], (group, spots) => {
      // The core of each area sits at its middle.
      const cx = spots.reduce((s, p) => s + p[0], 0) / spots.length
      const cy = spots.reduce((s, p) => s + p[1], 0) / spots.length
      const nearest = [...spots].sort(
        (a, b) => Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy),
      )
      const ranked = [...group].sort((a, b) => b.weight - a.weight || a.year - b.year)
      ranked.forEach((t, i) => pos.set(t.id, { x: nearest[i][0], y: nearest[i][1] }))
    })
  }

  return { pos, centers }
}

/** Finds a free spot for a term the map doesn't have, near whatever it relates to. */
export function placeCustom(
  id: string,
  anchor: { x: number; y: number },
  taken: { x: number; y: number }[],
): { x: number; y: number } {
  const rand = seeded(hash(id))
  for (let i = 0; i < 400; i++) {
    const r = 5 + i * 0.7
    const a = rand() * Math.PI * 2
    const x = anchor.x + Math.cos(a) * r
    const y = anchor.y + Math.sin(a) * r
    if (!insideBrain(x, y)) continue
    if (taken.every((t) => Math.hypot(t.x - x, t.y - y) >= 9)) return { x, y }
  }
  return anchor
}
