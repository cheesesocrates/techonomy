import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { stage } from '../brain/atlas'
import { frontier } from '../engine/stats'
import { gsap, prefersReducedMotion, useGSAP, useRise } from '../lib/motion'
import { DOMAIN_BY_ID } from '../map'
import { useStore } from '../state/store'
import { Dot, useStats } from './bits'

/**
 * Recognition beats recall. Nobody can list everything they know from memory,
 * but anyone can answer "do you know this one?" in a second. One term at a time,
 * nearest to what's already lit, so each answer takes almost no thought.
 */
export function DiscoverPage() {
  const root = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const known = useStore((s) => s.known)
  const seen = useStore((s) => s.seen)
  const addTerm = useStore((s) => s.addTerm)
  const skip = useStore((s) => s.skip)
  const stats = useStats()
  const [answered, setAnswered] = useState(0)
  const start = useRef(stats.awareness)
  const busy = useRef(false)

  const term = useMemo(() => frontier(known, seen, 1)[0], [known, seen])

  useRise(root)

  useEffect(() => {
    if (!term) return
    stage.plate?.setTarget(term.id)
    stage.plate?.flyTo(term.id, 1.55)
  }, [term])

  useEffect(
    () => () => {
      stage.plate?.setTarget(null)
      stage.plate?.fit()
    },
    [],
  )

  useGSAP(
    () => {
      if (!card.current || prefersReducedMotion()) return
      gsap.fromTo(card.current, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' })
    },
    { dependencies: [term?.id] },
  )

  const answer = useCallback(
    (choice: 'know' | 'heard' | 'new') => {
      if (!term || busy.current) return
      busy.current = true
      const settle = () => {
        if (choice === 'know') addTerm(term.id, 2)
        else if (choice === 'heard') addTerm(term.id, 1)
        else skip(term.id)
        setAnswered((n) => n + 1)
        busy.current = false
      }
      if (prefersReducedMotion() || !card.current) {
        settle()
        return
      }
      gsap.to(card.current, {
        y: choice === 'new' ? 12 : -16,
        autoAlpha: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: settle,
      })
    },
    [term, addTerm, skip],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      const k = e.key.toLowerCase()
      if (k === 'k') answer('know')
      if (k === 'h') answer('heard')
      if (k === 'n') answer('new')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answer])

  if (!term) {
    return (
      <div className="deck" ref={root}>
        <p className="deck-prompt" data-rise>
          That's the whole map.
        </p>
        <p className="card-def" data-rise>
          You've answered every term on it. Nothing left to discover here.
        </p>
      </div>
    )
  }

  const gain = Math.round((stats.awareness - start.current) * 1000) / 10

  return (
    <div className="deck" ref={root}>
      <p className="deck-prompt" data-rise>
        Do you know this one?
      </p>

      <div className="card" ref={card} aria-live="polite">
        <p className="term-where" style={{ marginTop: 0 }}>
          <Dot domain={term.domain} />
          {DOMAIN_BY_ID[term.domain].name}, {term.area.toLowerCase()}
        </p>
        <h2 className="card-name">{term.name}</h2>
        <p className="card-def">{term.def}</p>
      </div>

      <div className="answers" data-rise>
        <button className="btn btn-primary" onClick={() => answer('know')}>
          Know it <kbd>K</kbd>
        </button>
        <button className="btn btn-quiet" onClick={() => answer('heard')}>
          Heard of it <kbd>H</kbd>
        </button>
        <button className="btn btn-quiet" onClick={() => answer('new')}>
          New to me <kbd>N</kbd>
        </button>
      </div>

      <p className="deck-foot" data-rise>
        {answered === 0
          ? 'Sorted by what sits closest to what you already know.'
          : `${answered} answered${gain > 0 ? `, up ${gain} points` : ''}.`}
      </p>
    </div>
  )
}
