/**
 * The plate: a lateral view of a brain, facing left, drawn in a 1000 × 800 world.
 * Everything is hand-placed control points run through Catmull-Rom splines.
 */
export type Pt = [number, number]

export const WORLD = { width: 1000, height: 800 }

function catmull(points: Pt[], closed: boolean, seg: number): Pt[] {
  const out: Pt[] = []
  const n = points.length
  const at = (i: number): Pt =>
    closed ? points[(i + n) % n] : points[Math.min(n - 1, Math.max(0, i))]
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    for (let j = 0; j < seg; j++) {
      const t = j / seg
      const t2 = t * t
      const t3 = t2 * t
      out.push([
        0.5 * (2 * p1[0] + (p2[0] - p0[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (p2[1] - p0[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * t3),
      ])
    }
  }
  if (!closed) out.push(points[n - 1])
  return out
}

/** Pushes an outline in and out along its normal to suggest the folds of the cortex. */
function folded(poly: Pt[], amp: (p: Pt) => number, wave: number): Pt[] {
  const n = poly.length
  let s = 0
  return poly.map((p, i) => {
    const a = poly[(i - 1 + n) % n]
    const b = poly[(i + 1) % n]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    s += Math.hypot(p[0] - a[0], p[1] - a[1]) / 2
    const bump = Math.sin(s / wave) * 0.72 + Math.sin(s / (wave * 0.43) + 1.3) * 0.28
    const off = amp(p) * bump
    return [p[0] + (dy / len) * off, p[1] - (dx / len) * off]
  })
}

const cerebrumCtrl: Pt[] = [
  [118, 322], [126, 256], [160, 194], [212, 144], [280, 106], [360, 82], [446, 72],
  [534, 74], [618, 90], [696, 120], [762, 162], [816, 214], [856, 272], [878, 332],
  [874, 386], [842, 430], [790, 452], [728, 466], [676, 486], [640, 522], [590, 554],
  [520, 574], [444, 580], [374, 568], [318, 542], [282, 508], [274, 476], [298, 452],
  [262, 446], [214, 438], [168, 416], [134, 376],
]

const cerebellumCtrl: Pt[] = [
  [612, 556], [640, 516], [700, 492], [770, 486], [826, 504], [858, 546], [860, 594],
  [832, 640], [784, 670], [722, 680], [668, 666], [630, 628], [608, 590],
]

const stemCtrl: Pt[] = [
  [526, 588], [566, 572], [612, 566], [628, 606], [626, 652], [642, 708], [662, 774],
  [604, 782], [586, 730], [556, 682], [524, 640],
]

export const CEREBRUM = folded(catmull(cerebrumCtrl, true, 10), (p) => (p[1] < 440 ? 4.2 : 2.2), 11)
export const CEREBELLUM = folded(catmull(cerebellumCtrl, true, 10), () => 1.5, 5)
export const STEM = catmull(stemCtrl, true, 8)

/** The large grooves of the cortex. Purely drawn; they carry no data. */
export const SULCI: Pt[][] = (
  [
    // lateral (Sylvian) fissure, the deepest line on the plate
    [[298, 452], [372, 420], [450, 390], [520, 352], [574, 318]],
    // central sulcus
    [[470, 74], [452, 132], [472, 196], [448, 262], [470, 322]],
    // precentral
    [[380, 84], [366, 150], [382, 214], [358, 284], [380, 346]],
    // frontal
    [[196, 176], [258, 182], [316, 160], [350, 178]],
    [[156, 292], [228, 268], [298, 278], [350, 256]],
    [[146, 366], [204, 350], [262, 374], [318, 352], [352, 384]],
    // postcentral
    [[560, 78], [540, 140], [566, 210], [540, 280], [576, 318]],
    // parietal and occipital
    [[566, 192], [630, 180], [700, 206], [744, 258]],
    [[692, 120], [712, 170], [698, 232]],
    [[760, 300], [800, 334], [838, 322]],
    [[742, 392], [792, 402], [846, 380]],
    // temporal
    [[342, 490], [420, 466], [500, 432], [580, 394], [640, 352], [690, 300]],
    [[362, 532], [440, 522], [520, 502], [600, 470], [672, 422]],
  ] as Pt[][]
).map((c) => catmull(c, false, 12))

/** The cerebellum's fine parallel folds, fanned out from its root. */
export const FOLIA: Pt[][] = (() => {
  const focus: Pt = [620, 590]
  const outer = catmull(cerebellumCtrl, true, 10)
  const arcs: Pt[][] = []
  for (let k = 1; k <= 8; k++) {
    const f = 1 - k * 0.1
    const arc: Pt[] = []
    for (const p of outer) {
      const a = Math.atan2(p[1] - focus[1], p[0] - focus[0])
      if (a < -1.15 || a > 1.28) continue
      arc.push([focus[0] + (p[0] - focus[0]) * f, focus[1] + (p[1] - focus[1]) * f])
    }
    arcs.push(arc)
  }
  return arcs
})()

export function inside(poly: Pt[], x: number, y: number): boolean {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

export function distanceTo(poly: Pt[], x: number, y: number, step = 3): number {
  let best = Infinity
  const n = poly.length
  for (let i = 0; i < n; i += step) {
    const [ax, ay] = poly[i]
    const [bx, by] = poly[(i + step) % n]
    const dx = bx - ax
    const dy = by - ay
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)))
    const d = Math.hypot(x - (ax + t * dx), y - (ay + t * dy))
    if (d < best) best = d
  }
  return best
}

export function insideBrain(x: number, y: number): boolean {
  return inside(CEREBRUM, x, y) || inside(CEREBELLUM, x, y) || inside(STEM, x, y)
}
