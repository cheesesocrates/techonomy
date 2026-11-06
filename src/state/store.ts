import { create } from 'zustand'
import { ATLAS } from '../brain/atlas'
import { hash, placeCustom } from '../brain/layout'
import { parseDump, type Parsed } from '../engine/parse'
import { computeStats, type CustomTerm, type KnownMap, type Level } from '../engine/stats'
import { LOOKUP, TERMS, TERM_BY_ID, norm, slug, type DomainId } from '../map'
import { SAMPLE_BRAIN, SAMPLE_LEVELS } from '../map/sample'
import { PROVIDER_BY_ID } from '../ai/providers'
import { fetchModels, placeTerms, readBrain, type PlacedTerm, type Reading, type Usage } from '../ai/tasks'
import { AiError, type Connection } from '../ai/types'

export type View = 'brain' | 'stats' | 'discover'
export type ThemeChoice = 'system' | 'light' | 'dark'

export interface Snapshot {
  day: string
  awareness: number
  lit: number
}

export interface AiSettings {
  providerId: string
  model: string
  baseURL: string
  key: string
  remember: boolean
  models: string[]
  status: 'off' | 'checking' | 'on'
  error: string | null
}

interface Toast {
  id: number
  text: string
  undo?: () => void
}

type AfterConnect = { type: 'place' } | { type: 'read' } | { type: 'explain'; id: string }

interface Saved {
  known: KnownMap
  custom: Record<string, CustomTerm>
  pending: string[]
  seen: Record<string, 1>
  history: Snapshot[]
  reading: Reading | null
  isExample: boolean
  started: boolean
  draft: string
}

interface Store extends Saved {
  view: View
  termId: string | null
  openDomain: DomainId | null
  connecting: boolean
  afterConnect: AfterConnect | null
  explainFor: string | null
  parsed: Parsed
  theme: ThemeChoice
  ai: AiSettings
  spent: Usage
  placing: { done: number; total: number } | null
  reading_busy: boolean
  aiError: string | null
  toast: Toast | null

  setDraft: (text: string) => void
  commitDraft: () => { added: number; unknown: number }
  addTerm: (id: string, level?: Level) => void
  addCustomText: (text: string) => void
  setLevel: (id: string, level: Level) => void
  forget: (id: string) => void
  skip: (id: string) => void
  open: (view: View) => void
  openTerm: (id: string | null) => void
  toggleDomain: (id: DomainId | null) => void
  setTheme: (t: ThemeChoice) => void
  showConnect: (then?: AfterConnect) => void
  closeConnect: () => void
  connect: (input: { providerId: string; key: string; baseURL: string; remember: boolean; model?: string }) => Promise<boolean>
  pickModel: (model: string) => void
  disconnect: () => void
  connection: () => Connection | null
  addUsage: (u: Usage) => void
  placePending: () => Promise<void>
  stopPlacing: () => void
  dropPending: (item: string) => void
  readMyBrain: () => Promise<void>
  loadExample: () => void
  startOver: () => void
  importBrain: (raw: string) => boolean
  exportBrain: () => string
  say: (text: string, undo?: () => void) => void
  dismissToast: () => void
}

const STATE_KEY = 'techonomy:v1'
const AI_KEY = 'techonomy:ai'
const SECRET_KEY = 'techonomy:key'
const THEME_KEY = 'techonomy:theme'

const EMPTY: Saved = {
  known: {},
  custom: {},
  pending: [],
  seen: {},
  history: [],
  reading: null,
  isExample: false,
  started: false,
  draft: '',
}

function safe<T>(read: () => T, fallback: T): T {
  try {
    return read()
  } catch {
    return fallback
  }
}

function loadSaved(): Saved {
  return safe(() => ({ ...EMPTY, ...JSON.parse(localStorage.getItem(STATE_KEY) ?? '{}') }), EMPTY)
}

function loadAi(): AiSettings {
  const saved = safe(() => JSON.parse(localStorage.getItem(AI_KEY) ?? '{}'), {}) as Partial<AiSettings>
  const key = safe(() => localStorage.getItem(SECRET_KEY) ?? sessionStorage.getItem(SECRET_KEY) ?? '', '')
  const remembered = safe(() => Boolean(localStorage.getItem(SECRET_KEY)), false)
  const providerId = saved.providerId && PROVIDER_BY_ID[saved.providerId] ? saved.providerId : ''
  const needsKey = providerId ? PROVIDER_BY_ID[providerId].needsKey : true
  return {
    providerId,
    model: saved.model ?? '',
    baseURL: saved.baseURL ?? '',
    key,
    remember: remembered,
    models: [],
    status: providerId && saved.model && (key || !needsKey) ? 'on' : 'off',
    error: null,
  }
}

function persistAi(ai: AiSettings) {
  safe(() => {
    localStorage.setItem(AI_KEY, JSON.stringify({ providerId: ai.providerId, model: ai.model, baseURL: ai.baseURL }))
    // A key lasts for this tab unless someone explicitly asks to keep it.
    localStorage.removeItem(SECRET_KEY)
    sessionStorage.removeItem(SECRET_KEY)
    if (ai.key) (ai.remember ? localStorage : sessionStorage).setItem(SECRET_KEY, ai.key)
  }, undefined)
}

const today = () => new Date().toISOString().slice(0, 10)

let toastId = 0
let controller: AbortController | null = null

const saved = loadSaved()

export const useStore = create<Store>((set, get) => ({
  ...saved,
  view: 'brain',
  termId: null,
  openDomain: null,
  connecting: false,
  afterConnect: null,
  explainFor: null,
  parsed: parseDump(saved.draft),
  theme: safe(() => (localStorage.getItem(THEME_KEY) as ThemeChoice) || 'system', 'system'),
  ai: loadAi(),
  spent: { inputTokens: 0, outputTokens: 0, cost: null },
  placing: null,
  reading_busy: false,
  aiError: null,
  toast: null,

  setDraft: (text) => set({ draft: text, parsed: parseDump(text) }),

  commitDraft: () => {
    const { parsed, known, pending, custom } = get()
    const now = Date.now()
    const next = { ...known }
    const fresh = parsed.found.filter((id) => !next[id])
    for (const id of fresh) next[id] = { level: 2, at: now }

    const taken = new Set([...pending, ...Object.values(custom).map((c) => c.name)].map(norm))
    const extras = [...parsed.unknown, ...parsed.prose].filter((x) => {
      const k = norm(x)
      if (taken.has(k)) return false
      taken.add(k)
      return true
    })
    set({
      known: next,
      pending: [...pending, ...extras],
      draft: '',
      parsed: parseDump(''),
      started: true,
      isExample: false,
    })
    return { added: fresh.length, unknown: extras.length }
  },

  addTerm: (id, level = 2) => {
    const { known } = get()
    if (known[id]) return
    set({ known: { ...known, [id]: { level, at: Date.now() } }, started: true })
  },

  addCustomText: (text) => {
    const { pending } = get()
    if (!text.trim() || pending.some((p) => norm(p) === norm(text))) return
    set({ pending: [...pending, text.trim()], started: true })
  },

  setLevel: (id, level) => {
    const { known } = get()
    if (!known[id]) return
    set({ known: { ...known, [id]: { ...known[id], level } } })
  },

  forget: (id) => {
    const { known, custom } = get()
    const entry = known[id]
    const extra = custom[id]
    const name = TERM_BY_ID.get(id)?.name ?? extra?.name ?? 'That term'
    const nextKnown = { ...known }
    delete nextKnown[id]
    const nextCustom = { ...custom }
    delete nextCustom[id]
    set({ known: nextKnown, custom: nextCustom, termId: extra ? null : get().termId })
    get().say(`Forgot ${name}.`, () => {
      const s = get()
      set({
        known: { ...s.known, [id]: entry },
        custom: extra ? { ...s.custom, [id]: extra } : s.custom,
      })
    })
  },

  skip: (id) => set({ seen: { ...get().seen, [id]: 1 } }),

  open: (view) =>
    set({ view, termId: null, connecting: false, openDomain: view === 'brain' ? get().openDomain : null }),

  openTerm: (id) => set({ termId: id, connecting: false }),

  toggleDomain: (id) => set({ openDomain: get().openDomain === id ? null : id }),

  setTheme: (theme) => {
    safe(() => {
      if (theme === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, theme)
    }, undefined)
    if (theme === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = theme
    set({ theme })
  },

  showConnect: (then) => set({ connecting: true, termId: null, afterConnect: then ?? null }),

  closeConnect: () => set({ connecting: false, afterConnect: null }),

  connect: async ({ providerId, key, baseURL, remember, model }) => {
    const provider = PROVIDER_BY_ID[providerId]
    const url = baseURL.trim() || provider.baseURL
    set({ ai: { ...get().ai, status: 'checking', error: null } })
    try {
      const models = await fetchModels({ provider, key: key.trim(), model: '', baseURL: url })
      const chosen = model && models.includes(model) ? model : (models[0] ?? model ?? '')
      if (!chosen) throw new AiError('model', `${provider.name} didn't list any chat models for this key.`)
      const ai: AiSettings = {
        providerId,
        key: key.trim(),
        baseURL: url,
        remember,
        models,
        model: chosen,
        status: 'on',
        error: null,
      }
      persistAi(ai)
      set({ ai, aiError: null })

      const then = get().afterConnect
      set({ connecting: false, afterConnect: null })
      if (then?.type === 'place') void get().placePending()
      if (then?.type === 'read') void get().readMyBrain()
      if (then?.type === 'explain') set({ termId: then.id, explainFor: then.id })
      return true
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Something went wrong connecting.'
      set({ ai: { ...get().ai, status: 'off', error } })
      return false
    }
  },

  pickModel: (model) => {
    const ai = { ...get().ai, model }
    persistAi(ai)
    set({ ai })
  },

  disconnect: () => {
    const ai: AiSettings = { providerId: '', key: '', baseURL: '', model: '', remember: false, models: [], status: 'off', error: null }
    persistAi(ai)
    set({ ai })
  },

  connection: () => {
    const { ai } = get()
    if (ai.status !== 'on' || !ai.providerId) return null
    const provider = PROVIDER_BY_ID[ai.providerId]
    return { provider, key: ai.key, model: ai.model, baseURL: ai.baseURL || provider.baseURL }
  },

  addUsage: (u) => {
    const s = get().spent
    set({
      spent: {
        inputTokens: s.inputTokens + u.inputTokens,
        outputTokens: s.outputTokens + u.outputTokens,
        cost: u.cost === null ? s.cost : (s.cost ?? 0) + u.cost,
      },
    })
  },

  placePending: async () => {
    const conn = get().connection()
    if (!conn) {
      get().showConnect({ type: 'place' })
      return
    }
    const items = [...get().pending]
    if (!items.length) return
    controller = new AbortController()
    set({ placing: { done: 0, total: items.length }, aiError: null })
    let placedCount = 0
    let litBefore = 0
    try {
      await placeTerms(
        conn,
        items,
        (batch, placed, usage) => {
          get().addUsage(usage)
          placedCount += acceptPlaced(placed)
          litBefore += batch.length
          const left = get().pending.filter((p) => !batch.includes(p))
          set({ pending: left, placing: { done: litBefore, total: items.length } })
        },
        controller.signal,
      )
      const dropped = items.length - placedCount
      const placed = `Placed ${placedCount} on the plate.`
      if (dropped === 1) get().say(`${placed} One didn't look like a tech term, so it was left out.`)
      else if (dropped > 1) get().say(`${placed} ${dropped} didn't look like tech terms, so they were left out.`)
      else get().say(placed)
    } catch (e) {
      if (!(e instanceof AiError && e.message === 'Stopped.')) {
        set({ aiError: e instanceof Error ? e.message : 'Placing those terms failed.' })
      }
    }
    set({ placing: null })
  },

  stopPlacing: () => controller?.abort(),

  dropPending: (item) => set({ pending: get().pending.filter((p) => p !== item) }),

  readMyBrain: async () => {
    const conn = get().connection()
    if (!conn) {
      get().showConnect({ type: 'read' })
      return
    }
    const { known, custom } = get()
    const stats = computeStats(known, custom)
    // Lead with what they know best, then a spread of the rest.
    const names = TERMS.filter((t) => known[t.id])
      .sort((a, b) => known[b.id].level - known[a.id].level || hash(a.id) - hash(b.id))
      .slice(0, 80)
      .map((t) => t.name)
    set({ reading_busy: true, aiError: null })
    try {
      const { reading, usage } = await readBrain(conn, stats, names)
      get().addUsage(usage)
      set({ reading, reading_busy: false })
    } catch (e) {
      set({ reading_busy: false, aiError: e instanceof Error ? e.message : 'The reading failed.' })
    }
  },

  loadExample: () => {
    const p = parseDump(SAMPLE_BRAIN)
    const now = Date.now()
    const known: KnownMap = {}
    for (const id of p.found) known[id] = { level: SAMPLE_LEVELS[id] ?? 2, at: now }
    set({ known, started: true, isExample: true, draft: '', parsed: parseDump('') })
  },

  startOver: () => {
    const before = get()
    const snapshot: Saved = {
      known: before.known,
      custom: before.custom,
      pending: before.pending,
      seen: before.seen,
      history: before.history,
      reading: before.reading,
      isExample: before.isExample,
      started: before.started,
      draft: before.draft,
    }
    set({ ...EMPTY, parsed: parseDump(''), termId: null, view: 'brain', openDomain: null, connecting: false })
    get().say('Brain cleared.', () => set({ ...snapshot, parsed: parseDump(snapshot.draft) }))
  },

  importBrain: (raw) => {
    try {
      const data = JSON.parse(raw) as Partial<Saved> & { app?: string }
      if (data.app !== 'techonomy' || typeof data.known !== 'object') return false
      set({
        known: data.known!,
        custom: data.custom ?? {},
        pending: data.pending ?? [],
        seen: data.seen ?? {},
        history: data.history ?? [],
        reading: data.reading ?? null,
        started: true,
        isExample: false,
      })
      return true
    } catch {
      return false
    }
  },

  exportBrain: () => {
    const { known, custom, pending, seen, history, reading } = get()
    return JSON.stringify({ app: 'techonomy', version: 1, known, custom, pending, seen, history, reading }, null, 2)
  },

  say: (text, undo) => set({ toast: { id: ++toastId, text, undo } }),

  dismissToast: () => set({ toast: null }),
}))

/** Turns AI answers into nodes. Returns how many terms it placed. */
function acceptPlaced(placed: PlacedTerm[]): number {
  const s = useStore.getState()
  const known = { ...s.known }
  const custom = { ...s.custom }
  const now = Date.now()
  let count = 0

  const taken = (): { x: number; y: number }[] => [...ATLAS.pos.values(), ...Object.values(custom)]

  for (const p of placed) {
    count++
    // The AI may recognise a messy input as something the map already has.
    const onMap = LOOKUP.get(norm(p.name))
    if (onMap) {
      known[onMap] ??= { level: 2, at: now }
      continue
    }
    const id = `x-${slug(p.name)}`
    if (custom[id]) continue

    const rel = p.related.flatMap((r) => {
      const hit = LOOKUP.get(norm(r))
      return hit ? [hit] : []
    })
    const anchors = rel.flatMap((r) => {
      const at = ATLAS.pos.get(r)
      return at ? [at] : []
    })
    const anchor = anchors.length
      ? {
          x: anchors.reduce((a, b) => a + b.x, 0) / anchors.length,
          y: anchors.reduce((a, b) => a + b.y, 0) / anchors.length,
        }
      : ATLAS.centers[p.domain]
    const { x, y } = placeCustom(id, anchor, taken())
    custom[id] = {
      id,
      name: p.name,
      domain: p.domain,
      area: p.area,
      kind: p.kind,
      year: p.year,
      def: p.definition,
      rel,
      x,
      y,
      unsure: !p.sure,
    }
    known[id] = { level: 2, at: now }
  }
  useStore.setState({ known, custom })
  return count
}

// Saving is debounced, and a snapshot per day feeds the trend line.
let saveTimer: ReturnType<typeof setTimeout> | undefined
useStore.subscribe((s, prev) => {
  if (
    s.known === prev.known &&
    s.custom === prev.custom &&
    s.pending === prev.pending &&
    s.seen === prev.seen &&
    s.reading === prev.reading &&
    s.draft === prev.draft &&
    s.started === prev.started &&
    s.isExample === prev.isExample
  ) {
    return
  }
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const now = useStore.getState()
    let history = now.history
    if (now.known !== prev.known && !now.isExample) {
      const stats = computeStats(now.known, now.custom)
      const entry: Snapshot = { day: today(), awareness: stats.awareness, lit: stats.lit }
      history = [...history.filter((h) => h.day !== entry.day), entry].slice(-90)
      useStore.setState({ history })
    }
    const data: Saved = {
      known: now.known,
      custom: now.custom,
      pending: now.pending,
      seen: now.seen,
      history,
      reading: now.reading,
      isExample: now.isExample,
      started: now.started,
      draft: now.draft,
    }
    safe(() => localStorage.setItem(STATE_KEY, JSON.stringify(data)), undefined)
  }, 400)
})

/** Finds terms for the search field, from the map and from the person's own additions. */
export function searchTerms(query: string, custom: Record<string, CustomTerm>, limit = 6) {
  const q = norm(query)
  if (!q) return []
  const score = (name: string, aliases: string[]) => {
    const n = norm(name)
    if (n === q) return 100
    if (aliases.some((a) => norm(a) === q)) return 90
    if (n.startsWith(q)) return 70
    if (aliases.some((a) => norm(a).startsWith(q))) return 55
    if (q.length >= 3 && n.includes(q)) return 40
    return 0
  }
  const pool = [
    ...TERMS.map((t) => ({ id: t.id, name: t.name, domain: t.domain, s: score(t.name, t.aliases) + t.weight })),
    ...Object.values(custom).map((c) => ({ id: c.id, name: c.name, domain: c.domain, s: score(c.name, []) })),
  ]
  return pool
    .filter((x) => x.s > 3)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
}
