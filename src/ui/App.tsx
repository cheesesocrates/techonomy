import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { stage } from '../brain/atlas'
import { PROVIDER_BY_ID } from '../ai/providers'
import { gsap, prefersReducedMotion, useGSAP } from '../lib/motion'
import { useStore, type View } from '../state/store'
import { BrainPage } from './BrainPage'
import { ConnectPage } from './ConnectPage'
import { DiscoverPage } from './DiscoverPage'
import { Opening } from './Opening'
import { PlateView } from './PlateView'
import { StatsPage } from './StatsPage'
import { TermPage } from './TermPage'
import { Icon, useResolvedTheme, useStats } from './bits'

const TABS: { id: View; label: string }[] = [
  { id: 'brain', label: 'Brain' },
  { id: 'stats', label: 'Stats' },
  { id: 'discover', label: 'Discover' },
]

function Tabs() {
  const view = useStore((s) => s.view)
  const open = useStore((s) => s.open)
  const termId = useStore((s) => s.termId)
  const connecting = useStore((s) => s.connecting)
  const bar = useRef<HTMLDivElement>(null)
  const mark = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)

  useGSAP(
    () => {
      const tab = bar.current?.querySelector<HTMLElement>(`[data-tab='${view}']`)
      if (!tab) return
      gsap.to(mark.current, {
        x: tab.offsetLeft,
        width: tab.offsetWidth,
        duration: placed.current && !prefersReducedMotion() ? 0.45 : 0,
        ease: 'power3.out',
      })
      placed.current = true
    },
    { dependencies: [view, termId, connecting] },
  )

  return (
    <div className="tabs" role="tablist" aria-label="Sections" ref={bar}>
      {TABS.map((t) => (
        <button
          key={t.id}
          className="tab"
          role="tab"
          data-tab={t.id}
          aria-selected={view === t.id}
          onClick={() => open(t.id)}
        >
          {t.label}
        </button>
      ))}
      <span className="tab-mark" ref={mark} aria-hidden="true" />
    </div>
  )
}

function Menu({ onClose }: { onClose: () => void }) {
  const startOver = useStore((s) => s.startOver)
  const exportBrain = useStore((s) => s.exportBrain)
  const importBrain = useStore((s) => s.importBrain)
  const say = useStore((s) => s.say)
  const stats = useStats()
  const file = useRef<HTMLInputElement>(null)

  const save = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="menu" role="menu">
      <button
        role="menuitem"
        onClick={async () => {
          const blob = await stage.plate?.toBlob(
            `${stats.lit} of ${stats.total} terms lit. ${Math.round(stats.awareness * 100)}% of the map. Techonomy`,
          )
          if (blob) save(blob, 'my-brain.png')
          onClose()
        }}
      >
        Save plate as image
      </button>
      <button
        role="menuitem"
        onClick={() => {
          save(new Blob([exportBrain()], { type: 'application/json' }), 'my-brain.json')
          onClose()
        }}
      >
        Export my brain
      </button>
      <button role="menuitem" onClick={() => file.current?.click()}>
        Import a brain
      </button>
      <input
        ref={file}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) say(importBrain(await f.text()) ? 'Brain imported.' : "That file isn't a Techonomy brain.")
          onClose()
        }}
      />
      <hr />
      <button
        role="menuitem"
        onClick={() => {
          startOver()
          onClose()
        }}
      >
        Start over
      </button>
    </div>
  )
}

function Foot() {
  const ai = useStore((s) => s.ai)
  const setTheme = useStore((s) => s.setTheme)
  const showConnect = useStore((s) => s.showConnect)
  const theme = useResolvedTheme()
  const [menu, setMenu] = useState(false)
  const on = ai.status === 'on'
  const provider = ai.providerId ? PROVIDER_BY_ID[ai.providerId] : null

  useEffect(() => {
    if (!menu) return
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.menu, [data-menu]')) setMenu(false)
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [menu])

  return (
    <footer className="page-foot">
      <button className="ai-pill" onClick={() => showConnect()}>
        <span className="ai-state" data-on={on} aria-hidden="true" />
        <span className="ai-name">{on && provider ? `${provider.name}, ${ai.model}` : 'Connect any AI'}</span>
      </button>
      <span className="spacer" />
      <button
        className="icon-btn"
        aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      </button>
      <button
        className="icon-btn"
        aria-label="More"
        aria-expanded={menu}
        aria-haspopup="menu"
        data-menu
        onClick={() => setMenu((m) => !m)}
      >
        <Icon name="more" />
      </button>
      {menu && <Menu onClose={() => setMenu(false)} />}
    </footer>
  )
}

function Toast() {
  const toast = useStore((s) => s.toast)
  const dismiss = useStore((s) => s.dismissToast)
  const box = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!toast) return
      if (!prefersReducedMotion()) {
        gsap.from(box.current, { y: 10, autoAlpha: 0, duration: 0.35, ease: 'power3.out' })
      }
      const timer = gsap.delayedCall(toast.undo ? 7 : 3.4, dismiss)
      return () => timer.kill()
    },
    { dependencies: [toast?.id] },
  )

  if (!toast) return null
  return (
    <div className="toast" ref={box} role="status">
      <span>{toast.text}</span>
      {toast.undo && (
        <button
          onClick={() => {
            toast.undo?.()
            dismiss()
          }}
        >
          Undo
        </button>
      )}
    </div>
  )
}

export function App() {
  const started = useStore((s) => s.started)
  const view = useStore((s) => s.view)
  const termId = useStore((s) => s.termId)
  const connecting = useStore((s) => s.connecting)
  const open = useStore((s) => s.open)
  const openTerm = useStore((s) => s.openTerm)
  const closeConnect = useStore((s) => s.closeConnect)
  const spread = useRef<HTMLDivElement>(null)
  const pageWidth = useRef(0)
  const wasStarted = useRef(started)

  // Leaving the opening, the page narrows and the brain takes the room.
  useLayoutEffect(() => {
    const el = spread.current
    if (!el) return
    const page = el.querySelector<HTMLElement>('.page')!
    const to = page.offsetWidth
    if (wasStarted.current !== started && pageWidth.current && !prefersReducedMotion() && window.innerWidth > 860) {
      el.style.setProperty('--page', `${pageWidth.current}px`)
      gsap.to(el, {
        '--page': `${to}px`,
        duration: 1,
        ease: 'expo.inOut',
        onComplete: () => el.style.removeProperty('--page'),
      })
    }
    wasStarted.current = started
    pageWidth.current = to
  }, [started])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
      if (e.key === 'Escape') {
        if (connecting) closeConnect()
        else if (termId) openTerm(null)
        return
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey || !useStore.getState().started) return
      if (e.key === '/') {
        e.preventDefault()
        open('brain')
        requestAnimationFrame(() => document.getElementById('finder')?.focus())
      }
      if (e.key === '1') open('brain')
      if (e.key === '2') open('stats')
      if (e.key === '3') open('discover')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [connecting, termId, open, openTerm, closeConnect])

  const body = connecting ? (
    <ConnectPage key="connect" />
  ) : termId ? (
    <TermPage key="term" id={termId} />
  ) : !started ? (
    <Opening key="opening" />
  ) : view === 'stats' ? (
    <StatsPage key="stats" />
  ) : view === 'discover' ? (
    <DiscoverPage key="discover" />
  ) : (
    <BrainPage key="brain" />
  )

  return (
    <div className="spread" ref={spread} data-opening={!started}>
      <main className="page">
        <header className="page-head">
          <h1 className="wordmark">Techonomy</h1>
          {started && <Tabs />}
        </header>
        <div className="page-body">{body}</div>
        <Toast />
        <Foot />
      </main>
      <PlateView />
    </div>
  )
}
