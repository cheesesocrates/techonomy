import { useEffect, useMemo, useRef, useState } from 'react'
import { plateTerms, stage } from '../brain/atlas'
import { Plate, type PlateTerm } from '../brain/plate'
import { DOMAIN_BY_ID, TERM_BY_ID } from '../map'
import { useStore } from '../state/store'
import { Icon, useResolvedTheme, useStats } from './bits'

export function PlateView() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const tip = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const known = useStore((s) => s.known)
  const custom = useStore((s) => s.custom)
  const parsed = useStore((s) => s.parsed)
  const termId = useStore((s) => s.termId)
  const openDomain = useStore((s) => s.openDomain)
  const started = useStore((s) => s.started)
  const theme = useResolvedTheme()
  const stats = useStats()
  const [moved, setMoved] = useState(false)

  const levels = useMemo(() => {
    const out: Record<string, number> = {}
    for (const [id, k] of Object.entries(known)) out[id] = k.level
    // What's being typed lights up live, before anything is saved.
    for (const id of parsed.found) out[id] ??= 2
    return out
  }, [known, parsed])

  useEffect(() => {
    const showTip = (t: PlateTerm | null, x: number, y: number) => {
      const el = tip.current
      if (!el) return
      if (!t) {
        el.style.visibility = 'hidden'
        return
      }
      const s = useStore.getState()
      const area = TERM_BY_ID.get(t.id)?.area ?? s.custom[t.id]?.area ?? ''
      el.replaceChildren()
      const name = document.createElement('b')
      name.textContent = t.name
      el.append(name, `${DOMAIN_BY_ID[t.domain].name}, ${area.toLowerCase()}`)
      el.style.visibility = 'visible'
      const width = box.current?.clientWidth ?? 800
      const left = Math.min(width - el.offsetWidth - 10, Math.max(10, x + 14))
      const top = Math.max(10, y - el.offsetHeight - 12)
      el.style.transform = `translate(${left}px, ${top}px)`
    }

    const plate = new Plate(canvas.current!, {
      onHover: showTip,
      onSelect: (t) => {
        setMoved(true)
        useStore.getState().openTerm(t ? t.id : null)
      },
      onRegionHover: (d) => plate.focusDomain(d ?? useStore.getState().openDomain),
      onRegionSelect: (d) => {
        const s = useStore.getState()
        s.open('brain')
        if (s.openDomain !== d) s.toggleDomain(d)
      },
    })
    stage.plate = plate
    const s = useStore.getState()
    plate.setTheme(theme)
    plate.setTerms(plateTerms(s.custom))
    plate.setLevels(levels, false)
    plate.setRegionStats(Object.fromEntries(stats.domains.map((d) => [d.domain.id, d.coverage])))
    plate.playReveal()
    canvas.current!.addEventListener('wheel', () => setMoved(true), { passive: true, once: true })

    return () => {
      plate.destroy()
      stage.plate = null
    }
    // The plate is created once. The effects below keep it in step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => stage.plate?.setTheme(theme), [theme])
  useEffect(() => stage.plate?.setTerms(plateTerms(custom)), [custom])
  useEffect(() => stage.plate?.setLevels(levels), [levels])
  useEffect(() => {
    stage.plate?.setRegionStats(
      started ? Object.fromEntries(stats.domains.map((d) => [d.domain.id, d.coverage])) : {},
    )
  }, [stats, started])

  useEffect(() => {
    stage.plate?.select(termId)
    if (termId) stage.plate?.flyTo(termId, 1.9)
  }, [termId])

  useEffect(() => {
    if (openDomain) {
      stage.plate?.flyToDomain(openDomain)
      stage.plate?.focusDomain(openDomain)
    } else {
      stage.plate?.focusDomain(null)
      if (!useStore.getState().termId) stage.plate?.fit()
    }
  }, [openDomain])

  // Counts what's lit on screen, which includes terms still being typed.
  const lit = Object.keys(levels).filter((id) => TERM_BY_ID.has(id)).length
  const label = `A brain seen from the side, made of ${stats.total} dots, one for each term on the map. ${lit} are lit.`

  return (
    <section className="plate" ref={box} aria-label="Your brain">
      <canvas ref={canvas} tabIndex={0} role="img" aria-label={label} />
      <div className="tip" ref={tip} aria-hidden="true" />
      <p className="plate-caption">
        Plate I. {lit} of {stats.total} terms lit
        {stats.beyond > 0 ? `, ${stats.beyond} beyond the map` : ''}.
        {!moved && started ? (matchMedia('(pointer: coarse)').matches ? ' Pinch to zoom in.' : ' Scroll to zoom in.') : ''}
      </p>
      <div className="plate-tools">
        <button className="icon-btn" aria-label="Zoom in" onClick={() => stage.plate?.zoomBy(1.5)}>
          <Icon name="plus" />
        </button>
        <button className="icon-btn" aria-label="Zoom out" onClick={() => stage.plate?.zoomBy(1 / 1.5)}>
          <Icon name="minus" />
        </button>
        <button className="icon-btn" aria-label="Show the whole brain" onClick={() => stage.plate?.fit()}>
          <Icon name="fit" />
        </button>
      </div>
    </section>
  )
}
