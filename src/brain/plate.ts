import gsap from 'gsap'
import { CEREBELLUM, CEREBRUM, FOLIA, STEM, SULCI, type Pt } from './anatomy'
import { DOMAINS, DOMAIN_BY_ID, type DomainId, type Kind } from '../map'

export type ThemeName = 'dark' | 'light'

export interface PlateTerm {
  id: string
  name: string
  domain: DomainId
  kind: Kind
  weight: number
  x: number
  y: number
  rel: string[]
  custom: boolean
}

export interface PlateEvents {
  onHover: (term: PlateTerm | null, x: number, y: number) => void
  onSelect: (term: PlateTerm | null) => void
  onRegionHover: (domain: DomainId | null) => void
  onRegionSelect: (domain: DomainId) => void
}

interface N extends PlateTerm {
  lit: number
  pop: number
  level: number
}

interface Edge {
  a: N
  b: N
  cx: number
  cy: number
}

interface Pulse {
  edge: Edge
  from: N
  t: number
}

interface Ripple {
  x: number
  y: number
  color: string
  t: number
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

const TAU = Math.PI * 2
const UI_FONT = '"Atkinson Hyperlegible Next Variable", system-ui, sans-serif'
const SERIF_FONT = '"Ibarra Real Nova Variable", Georgia, serif'

const THEME = {
  dark: {
    bg: '#12110e',
    ink: '#f1ebdf',
    ink2: '#bdb5a6',
    ink3: '#958e80',
    outline: 'rgba(241,235,223,.3)',
    sulcus: 'rgba(241,235,223,.1)',
    edge: 0.34,
    dim: 0.34,
    glow: 0.55,
    blend: 'lighter' as GlobalCompositeOperation,
  },
  light: {
    bg: '#f6f1e7',
    ink: '#1b1914',
    ink2: '#57514a',
    ink3: '#6d6659',
    outline: 'rgba(27,25,20,.38)',
    sulcus: 'rgba(27,25,20,.13)',
    edge: 0.4,
    dim: 0.34,
    glow: 0.38,
    blend: 'multiply' as GlobalCompositeOperation,
  },
}

/** Annotations around the plate, in world space, with where each leader line lands. */
const REGION_LABELS: Record<DomainId, { x: number; y: number; align: CanvasTextAlign; to: Pt }> = {
  ideas: { x: 28, y: 62, align: 'left', to: [212, 196] },
  ai: { x: 800, y: 44, align: 'left', to: [628, 150] },
  interfaces: { x: 972, y: 470, align: 'right', to: [806, 348] },
  code: { x: 28, y: 512, align: 'left', to: [196, 392] },
  security: { x: 66, y: 634, align: 'left', to: [344, 516] },
  data: { x: 318, y: 694, align: 'left', to: [486, 530] },
  systems: { x: 382, y: 778, align: 'left', to: [592, 716] },
  cloud: { x: 972, y: 722, align: 'right', to: [786, 606] },
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export class Plate {
  private ctx: CanvasRenderingContext2D
  private layer = document.createElement('canvas')
  private lctx = this.layer.getContext('2d')!
  private w = 0
  private h = 0
  private dpr = 1
  private view = { x: 500, y: 400, z: 1 }
  private fitZ = 1
  private fitted = true
  private nodes = new Map<string, N>()
  private list: N[] = []
  private edges: Edge[] = []
  private buckets = new Map<number, N[]>()
  private pulses: Pulse[] = []
  private ripples: Ripple[] = []
  private glows = new Map<DomainId, HTMLCanvasElement>()
  private widths = new Map<string, number>()
  private theme: ThemeName = 'dark'
  private staleLayer = true
  private dirty = true
  private hovered: N | null = null
  private selected: N | null = null
  private linked: N | null = null
  private target: N | null = null
  private targetPhase = { t: 0 }
  private focus: DomainId | null = null
  private focusAmt = { t: 0 }
  private hoverAmt = { t: 0 }
  private reveal = { t: 1 }
  private regionBoxes: { id: DomainId; box: Box }[] = []
  private regionStats: Partial<Record<DomainId, number>> = {}
  private pointers = new Map<number, { x: number; y: number }>()
  private press: { x: number; y: number; vx: number; vy: number; moved: boolean } | null = null
  private pinch: { dist: number; z: number } | null = null
  private nextPulse = 0
  private resizer: ResizeObserver
  private anatomy: { poly: Path2D; lines: Path2D; lengths: number }
  private reduced = prefersReducedMotion()

  constructor(
    private canvas: HTMLCanvasElement,
    private events: PlateEvents,
  ) {
    this.ctx = canvas.getContext('2d')!
    this.anatomy = this.buildAnatomy()
    this.resizer = new ResizeObserver(() => this.resize())
    this.resizer.observe(canvas.parentElement ?? canvas)
    this.resize()

    canvas.addEventListener('pointerdown', this.pointerDown)
    canvas.addEventListener('pointermove', this.pointerMove)
    canvas.addEventListener('pointerup', this.pointerUp)
    canvas.addEventListener('pointercancel', this.pointerUp)
    canvas.addEventListener('pointerleave', this.pointerLeave)
    canvas.addEventListener('wheel', this.wheel, { passive: false })
    canvas.addEventListener('dblclick', this.doubleClick)
    canvas.addEventListener('keydown', this.keyDown)

    gsap.ticker.add(this.tick)
    if (document.fonts) document.fonts.ready.then(() => this.touch())
  }

  destroy() {
    gsap.ticker.remove(this.tick)
    this.resizer.disconnect()
    gsap.killTweensOf(this.view)
    this.canvas.removeEventListener('pointerdown', this.pointerDown)
    this.canvas.removeEventListener('pointermove', this.pointerMove)
    this.canvas.removeEventListener('pointerup', this.pointerUp)
    this.canvas.removeEventListener('pointercancel', this.pointerUp)
    this.canvas.removeEventListener('pointerleave', this.pointerLeave)
    this.canvas.removeEventListener('wheel', this.wheel)
    this.canvas.removeEventListener('dblclick', this.doubleClick)
    this.canvas.removeEventListener('keydown', this.keyDown)
  }

  // ---- data ----------------------------------------------------------------

  setTerms(terms: PlateTerm[]) {
    const next = new Map<string, N>()
    for (const t of terms) {
      const prev = this.nodes.get(t.id)
      next.set(t.id, prev ? Object.assign(prev, t) : { ...t, lit: 0, pop: 0, level: 0 })
    }
    this.nodes = next
    this.list = [...next.values()]
    this.buckets.clear()
    for (const n of this.list) {
      const key = this.bucketKey(n.x, n.y)
      const b = this.buckets.get(key)
      if (b) b.push(n)
      else this.buckets.set(key, [n])
    }
    this.rebuildEdges()
    this.touch()
  }

  /** Lights up what's known. Newly known terms ignite in a sweep across the plate. */
  setLevels(levels: Record<string, number>, animate = true) {
    const fresh: N[] = []
    for (const n of this.list) {
      const level = levels[n.id] ?? 0
      if (level > 0 && n.level === 0) fresh.push(n)
      if (level === 0 && n.level > 0) {
        gsap.to(n, { lit: 0, duration: this.reduced ? 0 : 0.5, ease: 'power2.out', onUpdate: this.touch })
      }
      n.level = level
    }
    this.rebuildEdges()
    if (!animate || this.reduced) {
      for (const n of fresh) n.lit = 1
    } else {
      this.ignite(fresh)
    }
    this.touch()
  }

  setRegionStats(stats: Partial<Record<DomainId, number>>) {
    this.regionStats = stats
    this.touch()
  }

  private ignite(fresh: N[]) {
    if (!fresh.length) return
    const many = fresh.length > 10
    const order = many ? [...fresh].sort((a, b) => a.x + a.y * 0.35 - (b.x + b.y * 0.35)) : fresh
    const step = many ? Math.min(0.022, 1.5 / order.length) : 0.05
    const dark = this.theme === 'dark'
    order.forEach((n, i) => {
      const delay = i * step
      gsap.to(n, {
        lit: 1,
        duration: 0.5,
        delay,
        ease: 'power2.out',
        onStart: () => {
          const ripple: Ripple = { x: n.x, y: n.y, t: 0, color: dark ? DOMAIN_BY_ID[n.domain].dark : DOMAIN_BY_ID[n.domain].light }
          this.ripples.push(ripple)
          gsap.to(ripple, {
            t: 1,
            duration: 0.9,
            ease: 'power2.out',
            onUpdate: () => (this.dirty = true),
            onComplete: () => (this.ripples = this.ripples.filter((r) => r !== ripple)),
          })
          this.fireFrom(n)
        },
        onUpdate: this.touch,
      })
      n.pop = 1.5
      gsap.to(n, { pop: 0, duration: 0.8, delay, ease: 'elastic.out(1, 0.5)', onUpdate: this.touch })
    })
  }

  /** The peak moment: a wave of light passes through everything you know. */
  celebrate() {
    if (this.reduced) return
    const lit = this.list.filter((n) => n.level > 0).sort((a, b) => a.x - b.x)
    const dark = this.theme === 'dark'
    lit.forEach((n, i) => {
      const delay = 0.15 + (i / Math.max(1, lit.length)) * 1.15
      gsap.to(n, {
        pop: 0.9,
        duration: 0.22,
        delay,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        onUpdate: this.touch,
        onStart: () => {
          if (i % 3) return
          const ripple: Ripple = { x: n.x, y: n.y, t: 0, color: dark ? DOMAIN_BY_ID[n.domain].dark : DOMAIN_BY_ID[n.domain].light }
          this.ripples.push(ripple)
          gsap.to(ripple, {
            t: 1,
            duration: 0.9,
            ease: 'power2.out',
            onUpdate: () => (this.dirty = true),
            onComplete: () => (this.ripples = this.ripples.filter((r) => r !== ripple)),
          })
        },
      })
    })
  }

  private fireFrom(n: N) {
    if (this.reduced || this.pulses.length > 40) return
    for (const e of this.edges) {
      if (e.a === n || e.b === n) this.addPulse(e, n)
    }
  }

  private addPulse(edge: Edge, from: N) {
    const pulse: Pulse = { edge, from, t: 0 }
    this.pulses.push(pulse)
    gsap.to(pulse, {
      t: 1,
      duration: 1.1,
      ease: 'sine.inOut',
      onUpdate: () => (this.dirty = true),
      onComplete: () => {
        this.pulses = this.pulses.filter((p) => p !== pulse)
        this.dirty = true
      },
    })
  }

  private rebuildEdges() {
    const edges: Edge[] = []
    for (const n of this.list) {
      if (n.level === 0) continue
      for (const r of n.rel) {
        const o = this.nodes.get(r)
        if (!o || o.level === 0 || o.id <= n.id) continue
        const dx = o.x - n.x
        const dy = o.y - n.y
        const bend = (n.x + o.y) % 2 > 1 ? 0.14 : -0.14
        edges.push({ a: n, b: o, cx: (n.x + o.x) / 2 - dy * bend, cy: (n.y + o.y) / 2 + dx * bend })
      }
    }
    this.edges = edges
  }

  // ---- view state ----------------------------------------------------------

  setTheme(theme: ThemeName) {
    this.theme = theme
    this.glows.clear()
    this.touch()
  }

  /** The intro: the outline draws itself and the dots fade in from front to back. */
  playReveal() {
    if (this.reduced) return
    this.reveal.t = 0
    gsap.to(this.reveal, { t: 1, duration: 1.9, ease: 'power2.inOut', onUpdate: this.touch })
  }

  focusDomain(domain: DomainId | null) {
    if (domain === this.focus && (domain === null) === (this.focusAmt.t === 0)) return
    if (domain) this.focus = domain
    gsap.to(this.focusAmt, {
      t: domain ? 1 : 0,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: this.touch,
      onComplete: () => {
        if (!domain) this.focus = null
      },
    })
  }

  /** Highlights a term from outside the canvas, such as a row on the page. */
  highlight(id: string | null) {
    this.linked = id ? (this.nodes.get(id) ?? null) : null
    this.dirty = true
  }

  select(id: string | null) {
    this.selected = id ? (this.nodes.get(id) ?? null) : null
    this.dirty = true
  }

  setTarget(id: string | null) {
    this.target = id ? (this.nodes.get(id) ?? null) : null
    gsap.killTweensOf(this.targetPhase)
    this.targetPhase.t = 0
    if (this.target && !this.reduced) {
      gsap.to(this.targetPhase, { t: 1, duration: 1.3, ease: 'sine.out', repeat: -1, onUpdate: () => (this.dirty = true) })
    }
    this.dirty = true
  }

  fit(duration = 0.9) {
    this.fitted = true
    this.moveTo(500, 400, this.fitZ, duration)
  }

  flyTo(id: string, rel = 2.3) {
    const n = this.nodes.get(id)
    if (!n) return
    this.fitted = false
    this.moveTo(n.x, n.y, Math.max(this.view.z, this.fitZ * rel), 0.9)
  }

  flyToDomain(domain: DomainId) {
    const pts = this.list.filter((n) => n.domain === domain && !n.custom)
    if (!pts.length) return
    const xs = pts.map((n) => n.x)
    const ys = pts.map((n) => n.y)
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    const z = Math.min((this.w * 0.82) / (x1 - x0 + 40), (this.h * 0.82) / (y1 - y0 + 40))
    this.fitted = false
    this.moveTo((x0 + x1) / 2, (y0 + y1) / 2, Math.min(z, this.fitZ * 3.2), 1)
  }

  zoomBy(factor: number) {
    this.zoomAt(this.w / 2, this.h / 2, factor, 0.45)
  }

  private moveTo(x: number, y: number, z: number, duration: number) {
    gsap.to(this.view, {
      x,
      y,
      z,
      duration: this.reduced ? 0 : duration,
      ease: 'expo.out',
      overwrite: true,
      onUpdate: this.touch,
    })
  }

  private zoomAt(sx: number, sy: number, factor: number, duration: number) {
    const z = Math.min(this.fitZ * 9, Math.max(this.fitZ * 0.8, this.view.z * factor))
    const [wx, wy] = this.toWorld(sx, sy)
    const nx = wx - (sx - this.w / 2) / z
    const ny = wy - (sy - this.h / 2) / z
    this.fitted = false
    this.moveTo(nx, ny, z, duration)
  }

  private toWorld(sx: number, sy: number): [number, number] {
    return [(sx - this.w / 2) / this.view.z + this.view.x, (sy - this.h / 2) / this.view.z + this.view.y]
  }

  private toScreen(x: number, y: number): [number, number] {
    return [(x - this.view.x) * this.view.z + this.w / 2, (y - this.view.y) * this.view.z + this.h / 2]
  }

  private resize = () => {
    const box = this.canvas.parentElement?.getBoundingClientRect() ?? this.canvas.getBoundingClientRect()
    if (!box.width || !box.height) return
    this.w = box.width
    this.h = box.height
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    for (const c of [this.canvas, this.layer]) {
      c.width = Math.round(this.w * this.dpr)
      c.height = Math.round(this.h * this.dpr)
    }
    this.fitZ = Math.min(this.w / 1040, this.h / 830)
    if (this.fitted) {
      gsap.killTweensOf(this.view)
      this.view.x = 500
      this.view.y = 400
      this.view.z = this.fitZ
    }
    // Resizing wipes a canvas, so repaint before the browser shows the empty frame.
    this.touch()
    this.render()
  }

  /** Marks the cached layer stale. Arrow function so it can be passed to tweens. */
  private touch = () => {
    this.staleLayer = true
    this.dirty = true
  }

  // ---- input ---------------------------------------------------------------

  private bucketKey(x: number, y: number) {
    return (Math.floor((x + 200) / 30) << 12) | Math.floor((y + 200) / 30)
  }

  private pick(sx: number, sy: number): N | null {
    const [wx, wy] = this.toWorld(sx, sy)
    const reach = 15 / this.view.z
    const span = Math.ceil(reach / 30)
    let best: N | null = null
    let bestD = reach
    const gx = Math.floor((wx + 200) / 30)
    const gy = Math.floor((wy + 200) / 30)
    for (let x = gx - span; x <= gx + span; x++) {
      for (let y = gy - span; y <= gy + span; y++) {
        for (const n of this.buckets.get((x << 12) | y) ?? []) {
          // Lit terms are easier to land on than dim ones.
          const d = Math.hypot(n.x - wx, n.y - wy) * (n.level ? 0.72 : 1)
          if (d < bestD) {
            bestD = d
            best = n
          }
        }
      }
    }
    return best
  }

  private regionAt(sx: number, sy: number): DomainId | null {
    for (const r of this.regionBoxes) {
      if (sx >= r.box.x && sx <= r.box.x + r.box.w && sy >= r.box.y && sy <= r.box.y + r.box.h) return r.id
    }
    return null
  }

  private localPoint(e: PointerEvent | MouseEvent) {
    const r = this.canvas.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  private pointerDown = (e: PointerEvent) => {
    const p = this.localPoint(e)
    this.canvas.setPointerCapture(e.pointerId)
    this.pointers.set(e.pointerId, p)
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()]
      this.pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), z: this.view.z }
      this.press = null
      return
    }
    gsap.killTweensOf(this.view)
    this.press = { x: p.x, y: p.y, vx: this.view.x, vy: this.view.y, moved: false }
  }

  private pointerMove = (e: PointerEvent) => {
    const p = this.localPoint(e)
    if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, p)

    if (this.pinch && this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const z = Math.min(this.fitZ * 9, Math.max(this.fitZ * 0.8, (this.pinch.z * dist) / this.pinch.dist))
      this.view.z = z
      this.fitted = false
      this.touch()
      return
    }

    if (this.press) {
      const dx = p.x - this.press.x
      const dy = p.y - this.press.y
      if (!this.press.moved && Math.hypot(dx, dy) < 5) return
      this.press.moved = true
      this.fitted = false
      this.view.x = this.press.vx - dx / this.view.z
      this.view.y = this.press.vy - dy / this.view.z
      this.canvas.style.cursor = 'grabbing'
      this.touch()
      return
    }

    const region = this.regionAt(p.x, p.y)
    this.events.onRegionHover(region)
    const n = region ? null : this.pick(p.x, p.y)
    if (n !== this.hovered) {
      this.hovered = n
      gsap.to(this.hoverAmt, { t: n ? 1 : 0, duration: 0.25, overwrite: true, onUpdate: () => (this.dirty = true) })
    }
    this.canvas.style.cursor = n || region ? 'pointer' : 'grab'
    if (n) {
      const [sx, sy] = this.toScreen(n.x, n.y)
      this.events.onHover(n, sx, sy)
    } else {
      this.events.onHover(null, 0, 0)
    }
    this.dirty = true
  }

  private pointerUp = (e: PointerEvent) => {
    const p = this.localPoint(e)
    this.pointers.delete(e.pointerId)
    if (this.pointers.size < 2) this.pinch = null
    const press = this.press
    this.press = null
    this.canvas.style.cursor = 'grab'
    if (!press || press.moved) return
    const region = this.regionAt(p.x, p.y)
    if (region) {
      this.events.onRegionSelect(region)
      return
    }
    this.events.onSelect(this.pick(p.x, p.y))
  }

  private pointerLeave = () => {
    if (this.press) return
    this.hovered = null
    this.hoverAmt.t = 0
    this.events.onHover(null, 0, 0)
    this.events.onRegionHover(null)
    this.dirty = true
  }

  private wheel = (e: WheelEvent) => {
    e.preventDefault()
    const p = this.localPoint(e)
    this.zoomAt(p.x, p.y, Math.exp(-e.deltaY * 0.0016), 0.35)
  }

  private doubleClick = (e: MouseEvent) => {
    const p = this.localPoint(e)
    this.zoomAt(p.x, p.y, 1.9, 0.6)
  }

  private keyDown = (e: KeyboardEvent) => {
    const step = 60 / this.view.z
    const pan = (dx: number, dy: number) => {
      this.fitted = false
      this.moveTo(this.view.x + dx, this.view.y + dy, this.view.z, 0.35)
    }
    switch (e.key) {
      case 'ArrowLeft':
        pan(-step, 0)
        break
      case 'ArrowRight':
        pan(step, 0)
        break
      case 'ArrowUp':
        pan(0, -step)
        break
      case 'ArrowDown':
        pan(0, step)
        break
      case '+':
      case '=':
        this.zoomBy(1.4)
        break
      case '-':
        this.zoomBy(1 / 1.4)
        break
      case '0':
        this.fit()
        break
      default:
        return
    }
    e.preventDefault()
  }

  // ---- drawing -------------------------------------------------------------

  private buildAnatomy() {
    const poly = new Path2D()
    let lengths = 0
    for (const shape of [STEM, CEREBELLUM, CEREBRUM]) {
      shape.forEach(([x, y], i) => (i ? poly.lineTo(x, y) : poly.moveTo(x, y)))
      poly.closePath()
      lengths += shape.length
    }
    const lines = new Path2D()
    for (const line of [...SULCI, ...FOLIA]) {
      line.forEach(([x, y], i) => (i ? lines.lineTo(x, y) : lines.moveTo(x, y)))
    }
    return { poly, lines, lengths }
  }

  private color(domain: DomainId) {
    const d = DOMAIN_BY_ID[domain]
    return this.theme === 'dark' ? d.dark : d.light
  }

  private glow(domain: DomainId) {
    let g = this.glows.get(domain)
    if (!g) {
      g = document.createElement('canvas')
      g.width = g.height = 96
      const c = g.getContext('2d')!
      const grad = c.createRadialGradient(48, 48, 0, 48, 48, 48)
      const hex = this.color(domain)
      grad.addColorStop(0, hex)
      grad.addColorStop(0.28, hex + 'aa')
      grad.addColorStop(0.62, hex + '2e')
      grad.addColorStop(1, hex + '00')
      c.fillStyle = grad
      c.fillRect(0, 0, 96, 96)
      this.glows.set(domain, g)
    }
    return g
  }

  private textWidth(c: CanvasRenderingContext2D, text: string) {
    const key = c.font + text
    let w = this.widths.get(key)
    if (w === undefined) {
      w = c.measureText(text).width
      this.widths.set(key, w)
    }
    return w
  }

  private dimFor(n: N) {
    if (this.reveal.t >= 1) return 1
    return Math.min(1, Math.max(0, (this.reveal.t * 1.35 - n.x / 1000) * 5))
  }

  private domainFade(domain: DomainId) {
    if (!this.focus || this.focusAmt.t === 0) return 1
    return domain === this.focus ? 1 : 1 - 0.8 * this.focusAmt.t
  }

  private radius(n: N) {
    const base = 1.9 + n.weight * 0.7
    const scale = [1, 0.86, 1, 1.2, 1.42][n.level] ?? 1
    return base * scale * (1 + n.pop)
  }

  private shape(c: CanvasRenderingContext2D, n: N, r: number) {
    if (n.kind === 'ideology') {
      const s = r * 1.28
      c.moveTo(n.x, n.y - s)
      c.lineTo(n.x + s, n.y)
      c.lineTo(n.x, n.y + s)
      c.lineTo(n.x - s, n.y)
      c.closePath()
    } else {
      c.moveTo(n.x + r, n.y)
      c.arc(n.x, n.y, r, 0, TAU)
    }
  }

  private drawLayer() {
    const c = this.lctx
    const t = THEME[this.theme]
    const { x, y, z } = this.view
    const rel = z / this.fitZ
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    c.clearRect(0, 0, this.w, this.h)

    c.save()
    c.translate(this.w / 2, this.h / 2)
    c.scale(z, z)
    c.translate(-x, -y)

    // Anatomy, drawn on over the intro.
    c.globalAlpha = Math.min(1, this.reveal.t * 1.6)
    c.lineJoin = 'round'
    c.lineCap = 'round'
    c.strokeStyle = t.sulcus
    c.lineWidth = 1 / z
    c.stroke(this.anatomy.lines)
    c.strokeStyle = t.outline
    c.lineWidth = 1.1 / z
    c.stroke(this.anatomy.poly)
    c.globalAlpha = 1

    // Dim dots: everything on the map you haven't claimed yet.
    const intro = this.reveal.t < 1
    for (const d of DOMAINS) {
      const fade = this.domainFade(d.id)
      const isFocus = this.focus === d.id ? this.focusAmt.t : 0
      c.fillStyle = this.color(d.id)
      if (intro) {
        for (const n of this.list) {
          if (n.domain !== d.id || n.lit >= 1) continue
          c.globalAlpha = t.dim * this.dimFor(n) * (1 - n.lit)
          c.beginPath()
          c.arc(n.x, n.y, 1.5 + n.weight * 0.28, 0, TAU)
          c.fill()
        }
        continue
      }
      c.globalAlpha = (t.dim + 0.42 * isFocus) * fade
      c.beginPath()
      for (const n of this.list) {
        if (n.domain !== d.id || n.lit >= 1) continue
        const r = 1.5 + n.weight * 0.28 + isFocus * 0.5
        c.moveTo(n.x + r, n.y)
        c.arc(n.x, n.y, r, 0, TAU)
      }
      c.fill()
    }

    // Synapses between terms you know.
    c.lineWidth = Math.max(0.7 / z, 0.55)
    for (const d of DOMAINS) {
      const fade = this.domainFade(d.id)
      c.strokeStyle = this.color(d.id)
      c.globalAlpha = t.edge * fade
      c.beginPath()
      for (const e of this.edges) {
        if (e.a.domain !== d.id) continue
        if (e.a.lit < 0.6 || e.b.lit < 0.6) continue
        c.moveTo(e.a.x, e.a.y)
        c.quadraticCurveTo(e.cx, e.cy, e.b.x, e.b.y)
      }
      c.stroke()
    }

    // Lit terms: a soft halo, then the term itself.
    c.globalCompositeOperation = t.blend
    for (const n of this.list) {
      if (n.lit <= 0.01) continue
      const r = this.radius(n)
      const gr = r * (3.1 + n.level * 0.42)
      c.globalAlpha = n.lit * t.glow * this.domainFade(n.domain) * (n.level === 1 ? 0.55 : 1)
      c.drawImage(this.glow(n.domain), n.x - gr, n.y - gr, gr * 2, gr * 2)
    }
    c.globalCompositeOperation = 'source-over'
    for (const n of this.list) {
      if (n.lit <= 0.01) continue
      const r = this.radius(n)
      const col = this.color(n.domain)
      c.globalAlpha = n.lit * this.domainFade(n.domain)
      c.beginPath()
      this.shape(c, n, r)
      if (n.level === 1) {
        // "Heard of it" is an outline: present, but not solid yet.
        c.strokeStyle = col
        c.lineWidth = Math.max(1 / z, 0.9)
        c.stroke()
      } else {
        c.fillStyle = col
        c.fill()
      }
      if (n.custom) {
        c.strokeStyle = t.ink
        c.lineWidth = 0.9 / z
        c.globalAlpha *= 0.8
        c.beginPath()
        c.arc(n.x, n.y, r + 2.4, 0, TAU)
        c.stroke()
      }
    }
    c.restore()

    this.drawTermLabels(c, rel)
    this.drawRegions(c, rel)
  }

  /** Names appear as you zoom: core terms first, then everything lit, then the dark. */
  private drawTermLabels(c: CanvasRenderingContext2D, rel: number) {
    const t = THEME[this.theme]
    if (rel < 1.3) return
    const boxes: Box[] = []
    const show = (n: N) => {
      if (n.level) return n.weight === 3 ? rel >= 1.3 : n.weight === 2 ? rel >= 1.75 : rel >= 2.3
      return rel >= (n.weight === 3 ? 2.6 : n.weight === 2 ? 3.4 : 4.2)
    }
    const ranked = this.list
      .filter(show)
      .sort((a, b) => b.level - a.level || b.weight - a.weight)
    c.textBaseline = 'middle'
    c.textAlign = 'left'
    c.lineJoin = 'round'
    for (const n of ranked) {
      const [sx, sy] = this.toScreen(n.x, n.y)
      if (sx < -80 || sy < -20 || sx > this.w + 20 || sy > this.h + 20) continue
      c.font = `${n.level ? 600 : 400} 12.5px ${UI_FONT}`
      const r = this.radius(n) * this.view.z
      const w = this.textWidth(c, n.name)
      const box = { x: sx + r + 4, y: sy - 8, w: w + 6, h: 16 }
      if (boxes.some((b) => b.x < box.x + box.w && box.x < b.x + b.w && b.y < box.y + box.h && box.y < b.y + b.h)) continue
      boxes.push(box)
      c.globalAlpha = this.domainFade(n.domain) * (n.level ? 1 : 0.8) * Math.min(1, (rel - 1.3) * 5)
      c.lineWidth = 3
      c.strokeStyle = t.bg
      c.strokeText(n.name, box.x, sy)
      c.fillStyle = n.level ? t.ink : t.ink3
      c.fillText(n.name, box.x, sy)
    }
    c.globalAlpha = 1
  }

  /** The plate's annotations, each with a hairline to its region. */
  private drawRegions(c: CanvasRenderingContext2D, rel: number) {
    const t = THEME[this.theme]
    this.regionBoxes = []
    // Labels keep their size while the brain shrinks, so past a point they'd collide.
    // The page's region list carries the same information.
    if (this.w < 560 || this.fitZ < 0.46) return
    const alpha = (1 - smooth(1.12, 1.4, rel)) * Math.min(1, Math.max(0, this.reveal.t * 2 - 1))
    if (alpha <= 0) return
    c.textBaseline = 'alphabetic'
    for (const d of DOMAINS) {
      const l = REGION_LABELS[d.id]
      const [sx, sy] = this.toScreen(l.x, l.y)
      const [tx, ty] = this.toScreen(l.to[0], l.to[1])
      const focused = this.focus === d.id
      const fade = focused ? 1 : this.domainFade(d.id)
      const pct = this.regionStats[d.id]

      c.font = `italic 400 16px ${SERIF_FONT}`
      const regionW = this.textWidth(c, d.region)
      c.font = `600 13px ${UI_FONT}`
      const nameW = this.textWidth(c, d.name)
      const statText = pct === undefined ? '' : `${Math.round(pct * 100)}%`
      const statW = statText ? this.textWidth(c, statText) + 8 : 0
      const width = Math.max(regionW, nameW + 13 + statW)
      const left = l.align === 'left' ? sx : sx - width

      // Leader line.
      const startX = l.align === 'left' ? left + width / 2 : left + width / 2
      const startY = sy + (ty > sy ? 10 : -34)
      c.globalAlpha = alpha * fade * 0.8
      c.strokeStyle = t.ink3
      c.lineWidth = 1
      c.beginPath()
      c.moveTo(startX, startY)
      c.lineTo(tx, ty)
      c.stroke()
      c.fillStyle = t.ink3
      c.beginPath()
      c.arc(tx, ty, 2, 0, TAU)
      c.fill()

      // Text.
      c.globalAlpha = alpha * fade
      c.textAlign = 'left'
      c.font = `italic 400 16px ${SERIF_FONT}`
      c.fillStyle = t.ink2
      c.fillText(d.region, left, sy - 17)
      c.fillStyle = this.color(d.id)
      c.beginPath()
      c.arc(left + 4, sy - 4.5, 4, 0, TAU)
      c.fill()
      c.font = `600 13px ${UI_FONT}`
      c.fillStyle = t.ink
      c.fillText(d.name, left + 13, sy)
      if (statText) {
        c.font = `400 13px ${UI_FONT}`
        c.fillStyle = t.ink2
        c.fillText(statText, left + 13 + nameW + 8, sy)
      }
      this.regionBoxes.push({ id: d.id, box: { x: left - 6, y: sy - 34, w: width + 12, h: 42 } })
    }
    c.globalAlpha = 1
  }

  private drawOverlay(c: CanvasRenderingContext2D) {
    const t = THEME[this.theme]
    const { x, y, z } = this.view
    c.save()
    c.translate(this.w / 2, this.h / 2)
    c.scale(z, z)
    c.translate(-x, -y)

    const quad = (e: Edge, u: number): [number, number] => {
      const from = e.a
      const to = e.b
      const v = 1 - u
      return [
        v * v * from.x + 2 * v * u * e.cx + u * u * to.x,
        v * v * from.y + 2 * v * u * e.cy + u * u * to.y,
      ]
    }

    // Everything connected to what you're pointing at.
    const active = this.hovered ?? this.linked ?? this.selected
    if (active) {
      c.lineWidth = Math.max(1.3 / z, 0.8)
      for (const e of this.edges) {
        if (e.a !== active && e.b !== active) continue
        c.strokeStyle = this.color(active.domain)
        c.globalAlpha = 0.95
        c.beginPath()
        c.moveTo(e.a.x, e.a.y)
        c.quadraticCurveTo(e.cx, e.cy, e.b.x, e.b.y)
        c.stroke()
      }
      c.globalAlpha = 1
      const r = Math.max(this.radius(active), 3) + 3.5 / z
      c.strokeStyle = t.ink
      c.lineWidth = 1.4 / z
      c.beginPath()
      c.arc(active.x, active.y, r, 0, TAU)
      c.stroke()
    }

    if (this.selected && this.selected !== active) {
      c.globalAlpha = 0.9
      c.strokeStyle = t.ink
      c.lineWidth = 1.2 / z
      c.beginPath()
      c.arc(this.selected.x, this.selected.y, this.radius(this.selected) + 3.5 / z, 0, TAU)
      c.stroke()
    }

    if (this.target) {
      const p = this.targetPhase.t
      c.strokeStyle = t.ink
      c.lineWidth = 1.3 / z
      c.globalAlpha = 1 - p
      c.beginPath()
      c.arc(this.target.x, this.target.y, 5 + p * (22 / Math.max(1, z / this.fitZ)), 0, TAU)
      c.stroke()
      c.globalAlpha = 1
      c.fillStyle = t.ink
      c.beginPath()
      c.arc(this.target.x, this.target.y, 3, 0, TAU)
      c.fill()
    }

    for (const r of this.ripples) {
      c.strokeStyle = r.color
      c.globalAlpha = (1 - r.t) * 0.85
      c.lineWidth = (1.6 * (1 - r.t) + 0.3) / Math.min(z, 1.4)
      c.beginPath()
      c.arc(r.x, r.y, 3 + r.t * 24, 0, TAU)
      c.stroke()
    }

    // A signal crossing a synapse.
    for (const p of this.pulses) {
      const u = p.from === p.edge.a ? p.t : 1 - p.t
      const [px, py] = quad(p.edge, u)
      const fade = Math.sin(p.t * Math.PI)
      c.globalCompositeOperation = t.blend
      c.globalAlpha = fade * 0.9
      c.drawImage(this.glow(p.from.domain), px - 7, py - 7, 14, 14)
      c.globalCompositeOperation = 'source-over'
      c.globalAlpha = fade
      c.fillStyle = this.theme === 'dark' ? t.ink : this.color(p.from.domain)
      c.beginPath()
      c.arc(px, py, 1.25, 0, TAU)
      c.fill()
    }
    c.restore()
    c.globalAlpha = 1
  }

  private tick = (time: number) => {
    if (document.hidden) return
    // The resting brain is never quite still: an occasional signal crosses a synapse.
    if (!this.reduced && time > this.nextPulse && this.edges.length) {
      this.nextPulse = time + 0.5 + Math.random() * 1.1
      const e = this.edges[Math.floor(Math.random() * this.edges.length)]
      if (e.a.lit > 0.9 && e.b.lit > 0.9) this.addPulse(e, Math.random() > 0.5 ? e.a : e.b)
    }
    if (this.dirty) this.render()
  }

  private render() {
    if (!this.w) return
    this.dirty = false
    if (this.staleLayer) {
      this.staleLayer = false
      this.drawLayer()
    }
    const c = this.ctx
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.clearRect(0, 0, this.canvas.width, this.canvas.height)
    c.drawImage(this.layer, 0, 0)
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.drawOverlay(c)
  }

  /** The plate as a PNG, for people who want to show it off. */
  toBlob(caption: string): Promise<Blob | null> {
    const out = document.createElement('canvas')
    out.width = this.layer.width
    out.height = this.layer.height
    const c = out.getContext('2d')!
    const t = THEME[this.theme]
    c.fillStyle = t.bg
    c.fillRect(0, 0, out.width, out.height)
    c.drawImage(this.layer, 0, 0)
    c.scale(this.dpr, this.dpr)
    c.fillStyle = t.ink2
    c.font = `italic 400 17px ${SERIF_FONT}`
    c.textAlign = 'center'
    c.fillText(caption, this.w / 2, this.h - 18)
    return new Promise((resolve) => out.toBlob(resolve, 'image/png'))
  }
}
