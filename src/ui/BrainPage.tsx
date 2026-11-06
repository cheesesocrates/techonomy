import { useMemo, useRef, useState } from 'react'
import { stage } from '../brain/atlas'
import { estimatePlacement } from '../ai/tasks'
import { parseDump } from '../engine/parse'
import { regionCopy, type DomainStat } from '../engine/stats'
import { gsap, prefersReducedMotion, useGSAP, useGrow, useRise } from '../lib/motion'
import { TERMS } from '../map'
import { searchTerms, useStore } from '../state/store'
import { CountUp, Dot, TermChip, domainVar, money, useStats } from './bits'

/** One field to find, add and paste. People shouldn't have to decide which box does what. */
function Finder() {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const known = useStore((s) => s.known)
  const custom = useStore((s) => s.custom)
  const openTerm = useStore((s) => s.openTerm)
  const addTerm = useStore((s) => s.addTerm)
  const addCustomText = useStore((s) => s.addCustomText)
  const setDraft = useStore((s) => s.setDraft)
  const commitDraft = useStore((s) => s.commitDraft)
  const say = useStore((s) => s.say)

  const results = useMemo(() => searchTerms(q, custom), [q, custom])
  const showNew = q.trim().length > 1 && !results.some((r) => r.s >= 90)
  const rows = results.length + (showNew ? 1 : 0)

  const addMany = (text: string) => {
    setDraft(text)
    const { added, unknown } = commitDraft()
    const parts = [`Added ${added} ${added === 1 ? 'term' : 'terms'}.`]
    if (unknown) parts.push(`${unknown} new to the map.`)
    say(parts.join(' '))
    setQ('')
  }

  const choose = (i: number) => {
    const r = results[i]
    if (r) {
      if (known[r.id]) {
        openTerm(r.id)
      } else {
        addTerm(r.id)
        say(`Added ${r.name}.`)
      }
    } else if (showNew) {
      addCustomText(q)
      say(`Saved "${q.trim()}". It isn't on the map yet.`)
    }
    setQ('')
    setActive(0)
  }

  return (
    <div className="finder" data-rise>
      <label className="sr-only" htmlFor="finder">
        Find a term or add one
      </label>
      <input
        ref={input}
        id="finder"
        className="finder-input"
        placeholder="Find or add a term"
        autoComplete="off"
        spellCheck={false}
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setActive(0)
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData('text')
          if (/[\n,;]/.test(text) && parseDump(text).spans.length > 1) {
            e.preventDefault()
            addMany(text)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((a) => (a + 1) % Math.max(1, rows))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => (a - 1 + rows) % Math.max(1, rows))
          } else if (e.key === 'Enter' && rows) {
            e.preventDefault()
            choose(active)
          } else if (e.key === 'Escape') {
            setQ('')
          }
        }}
      />
      {!q && (
        <span className="key-hint" aria-hidden="true">
          /
        </span>
      )}
      {rows > 0 && (
        <div className="results" role="listbox" aria-label="Matching terms">
          {results.map((r, i) => (
            <button
              key={r.id}
              className="result"
              role="option"
              aria-selected={i === active}
              data-active={i === active}
              onClick={() => choose(i)}
              onPointerEnter={() => {
                setActive(i)
                stage.plate?.highlight(r.id)
              }}
              onPointerLeave={() => stage.plate?.highlight(null)}
            >
              <Dot domain={r.domain} />
              <span className="result-name">{r.name}</span>
              <span className="result-state">{known[r.id] ? 'In your brain' : 'Add'}</span>
            </button>
          ))}
          {showNew && (
            <button
              className="result"
              role="option"
              aria-selected={active === results.length}
              data-active={active === results.length}
              onClick={() => choose(results.length)}
              onPointerEnter={() => setActive(results.length)}
            >
              <span className="result-name">Add "{q.trim()}" as a new term</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function PendingNote() {
  const pending = useStore((s) => s.pending)
  const placing = useStore((s) => s.placing)
  const aiError = useStore((s) => s.aiError)
  const model = useStore((s) => s.ai.model)
  const on = useStore((s) => s.ai.status === 'on')
  const placePending = useStore((s) => s.placePending)
  const stopPlacing = useStore((s) => s.stopPlacing)
  const dropPending = useStore((s) => s.dropPending)
  if (!pending.length && !placing) return null

  if (placing) {
    return (
      <div className="note" role="status">
        <p>
          Placing {placing.total} {placing.total === 1 ? 'term' : 'terms'} on the plate…
        </p>
        <div className="progress">
          <i style={{ width: `${Math.max(6, (placing.done / placing.total) * 100)}%` }} />
        </div>
        <div className="note-actions">
          <button className="link" onClick={stopPlacing}>
            Stop
          </button>
        </div>
      </div>
    )
  }

  const shown = pending.slice(0, 5)
  const estimate = on ? estimatePlacement(model, pending.length) : null
  return (
    <div className="note" data-rise>
      <p>
        {pending.length === 1 ? 'One term isn’t' : `${pending.length} terms aren’t`} on the map yet.{' '}
        {on ? 'An AI can work out where ' : 'Connect any AI and it will work out where '}
        {pending.length === 1 ? 'it belongs.' : 'they belong.'}
      </p>
      <div className="chips" style={{ marginTop: 8 }}>
        {shown.map((p) => (
          <button key={p} className="chip" title="Remove" onClick={() => dropPending(p)}>
            {p.length > 34 ? `${p.slice(0, 34)}…` : p}
            <span aria-hidden="true">×</span>
            <span className="sr-only">Remove</span>
          </button>
        ))}
        {pending.length > shown.length && (
          <span className="chip" data-dim="true">
            and {pending.length - shown.length} more
          </span>
        )}
      </div>
      {aiError && <p className="note-error" style={{ marginTop: 8 }}>{aiError}</p>}
      <div className="note-actions">
        <button className="btn btn-primary" onClick={() => void placePending()}>
          {on ? 'Place them' : 'Connect an AI'}
        </button>
        {estimate !== null && <span className="result-state">{money(estimate)}</span>}
      </div>
    </div>
  )
}

function Region({ stat, open }: { stat: DomainStat; open: boolean }) {
  const body = useRef<HTMLDivElement>(null)
  const known = useStore((s) => s.known)
  const custom = useStore((s) => s.custom)
  const toggleDomain = useStore((s) => s.toggleDomain)
  const { domain } = stat

  useGSAP(
    () => {
      gsap.to(body.current, {
        height: open ? 'auto' : 0,
        duration: prefersReducedMotion() ? 0 : 0.5,
        ease: 'power3.inOut',
      })
    },
    { dependencies: [open] },
  )

  const inner = useMemo(() => {
    if (!open) return null
    const terms = TERMS.filter((t) => t.domain === domain.id)
    const yours = [
      ...terms.filter((t) => known[t.id]).map((t) => t.id),
      ...Object.values(custom)
        .filter((c) => c.domain === domain.id && known[c.id])
        .map((c) => c.id),
    ]
    const missing = terms.filter((t) => !known[t.id]).sort((a, b) => b.weight - a.weight).slice(0, 8)
    return { yours, missing }
  }, [open, known, custom, domain.id])

  return (
    <li className="region" style={domainVar(domain.id)}>
      <button
        className="region-head"
        aria-expanded={open}
        onClick={() => toggleDomain(domain.id)}
        onPointerEnter={() => stage.plate?.focusDomain(domain.id)}
        onPointerLeave={() => stage.plate?.focusDomain(useStore.getState().openDomain)}
        onFocus={() => stage.plate?.focusDomain(domain.id)}
        onBlur={() => stage.plate?.focusDomain(useStore.getState().openDomain)}
      >
        <Dot domain={domain.id} />
        <span className="region-name">{domain.name}</span>
        <span className="region-count">
          {stat.known} of {stat.total}
        </span>
        <div className="region-bar">
          <div className="bar-track">
            <div className="bar-fill" data-grow style={{ width: `${stat.coverage * 100}%` }} />
          </div>
        </div>
      </button>
      <div className="region-body" ref={body}>
        <div className="region-inner">
          <p className="region-role">{regionCopy(domain.id)}</p>
          {inner && inner.yours.length > 0 && (
            <>
              <p className="region-label">In your brain</p>
              <div className="chips">
                {inner.yours.map((id) => (
                  <TermChip key={id} id={id} />
                ))}
              </div>
            </>
          )}
          {inner && inner.missing.length > 0 && (
            <>
              <p className="region-label">Worth knowing</p>
              <div className="chips">
                {inner.missing.map((t) => (
                  <TermChip key={t.id} id={t.id} dim />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </li>
  )
}

export function BrainPage() {
  const root = useRef<HTMLDivElement>(null)
  const stats = useStats()
  const openDomain = useStore((s) => s.openDomain)
  const isExample = useStore((s) => s.isExample)
  const startOver = useStore((s) => s.startOver)
  const open = useStore((s) => s.open)

  useRise(root)
  useGrow(root)

  return (
    <div ref={root}>
      <Finder />

      {isExample && (
        <div className="note" data-rise>
          <p>This is an example brain, so you can see how it all works.</p>
          <div className="note-actions">
            <button className="link" onClick={startOver}>
              Clear it and start mine
            </button>
          </div>
        </div>
      )}

      <PendingNote />

      <button className="summary" onClick={() => open('stats')} data-rise aria-label="See your full stats">
        <span className="summary-num">
          <CountUp value={stats.awareness * 100} />
          <small>%</small>
        </span>
        <span className="summary-side">
          <em>{stats.tier.name}</em>
          of the map known
        </span>
      </button>

      <h2 className="section-head" data-rise>
        Regions
      </h2>
      <ul className="regions">
        {stats.domains.map((d) => (
          <Region key={d.domain.id} stat={d} open={openDomain === d.domain.id} />
        ))}
      </ul>
    </div>
  )
}
