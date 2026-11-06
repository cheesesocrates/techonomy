import { useRef, useState } from 'react'
import { stage } from '../brain/atlas'
import { RECENT_FROM, summarize, type Stats } from '../engine/stats'
import { useGrow, useRise } from '../lib/motion'
import { useStore } from '../state/store'
import { CountUp, Dot, domainVar, useStats } from './bits'

function Sparkline() {
  const history = useStore((s) => s.history)
  if (history.length < 2) return null
  const w = 112
  const h = 40
  const values = history.map((p) => p.awareness)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const point = (v: number, i: number): [number, number] => [
    4 + (i / (values.length - 1)) * (w - 8),
    h - 5 - ((v - min) / span) * (h - 10),
  ]
  const line = values.map((v, i) => point(v, i).join(',')).join(' ')
  const [ex, ey] = point(values[values.length - 1], values.length - 1)
  return (
    <svg className="spark" width={w} height={h} role="img" aria-label={`Trend over ${history.length} days`}>
      <polyline points={line} fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={ex} cy={ey} r="4" fill="var(--ink)" stroke="var(--bg)" strokeWidth="2" />
    </svg>
  )
}

function Reading() {
  const reading = useStore((s) => s.reading)
  const busy = useStore((s) => s.reading_busy)
  const aiError = useStore((s) => s.aiError)
  const readMyBrain = useStore((s) => s.readMyBrain)
  const on = useStore((s) => s.ai.status === 'on')

  return (
    <div className="reading" data-rise>
      {reading && (
        <>
          <p className="reading-title">{reading.title}</p>
          <p className="reading-body">{reading.reading}</p>
          {reading.next && <p className="reading-next">{reading.next}</p>}
        </>
      )}
      {aiError && <p className="note-error">{aiError}</p>}
      <div style={{ marginTop: reading ? 10 : 0 }}>
        <button className="link" disabled={busy} onClick={() => void readMyBrain()}>
          {busy ? 'Reading your brain…' : reading ? 'Read it again' : on ? 'Have the AI read my brain' : 'Connect an AI to read my brain'}
        </button>
      </div>
    </div>
  )
}

function Fields({ stats }: { stats: Stats }) {
  const [table, setTable] = useState(false)
  const open = useStore((s) => s.open)
  const openDomain = useStore((s) => s.openDomain)
  const toggleDomain = useStore((s) => s.toggleDomain)
  const ranked = [...stats.domains].sort((a, b) => b.coverage - a.coverage)

  return (
    <section>
      <div className="chart-head" data-rise>
        <h3 className="section-head">Field by field</h3>
        <button className="link" onClick={() => setTable((t) => !t)}>
          {table ? 'Show bars' : 'Show table'}
        </button>
      </div>
      {table ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Known</th>
              <th>Core</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((d) => (
              <tr key={d.domain.id}>
                <td>{d.domain.name}</td>
                <td>
                  {d.known}/{d.total}
                </td>
                <td>
                  {d.coreKnown}/{d.coreTotal}
                </td>
                <td>{Math.round(d.coverage * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="hbars">
          {ranked.map((d) => (
            <li key={d.domain.id} data-rise>
              <button
                className="hbar"
                style={domainVar(d.domain.id)}
                aria-label={`${d.domain.name}: ${Math.round(d.coverage * 100)} percent. Open this region.`}
                onPointerEnter={() => stage.plate?.focusDomain(d.domain.id)}
                onPointerLeave={() => stage.plate?.focusDomain(null)}
                onFocus={() => stage.plate?.focusDomain(d.domain.id)}
                onBlur={() => stage.plate?.focusDomain(null)}
                onClick={() => {
                  open('brain')
                  if (openDomain !== d.domain.id) toggleDomain(d.domain.id)
                }}
              >
                <Dot domain={d.domain.id} />
                <span className="hbar-name">{d.domain.name}</span>
                <span className="bar-track">
                  <span className="bar-fill" data-grow style={{ width: `${d.coverage * 100}%` }} />
                </span>
                <span className="hbar-value">{Math.round(d.coverage * 100)}%</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Eras({ stats }: { stats: Stats }) {
  const max = Math.max(...stats.eras.map((e) => e.total))
  const pct = stats.recentTotal ? Math.round((stats.recentKnown / stats.recentTotal) * 100) : 0
  return (
    <section>
      <h3 className="section-head" data-rise>
        When your knowledge is from
      </h3>
      <p className="meter-explain" data-rise style={{ fontSize: 15 }}>
        You know {stats.recentKnown} of the {stats.recentTotal} terms from {RECENT_FROM} onward, or {pct}%.
      </p>
      <div className="eras" data-rise>
        {stats.eras.map((e) => (
          <div className="era" key={e.label} title={`${e.label}: ${e.known} of ${e.total}`}>
            <p className="era-value">{e.known}</p>
            <div className="era-col">
              <div className="era-all" style={{ height: `${(e.total / max) * 100}%` }} />
              <div className="era-yours" data-grow-up style={{ height: `${(e.known / max) * 100}%` }} />
            </div>
            <p className="era-label">{e.label.replace('Before 1980', 'Pre-80')}</p>
          </div>
        ))}
      </div>
      <p className="legend-line" data-rise>
        <span>
          <span className="legend-key" style={{ background: 'var(--ink)' }} />
          Yours
        </span>
        <span>
          <span className="legend-key" style={{ background: 'var(--wash)', boxShadow: 'inset 0 0 0 1px var(--line)' }} />
          On the map
        </span>
      </p>
    </section>
  )
}

function Kinds({ stats }: { stats: Stats }) {
  const top = stats.kinds[0]
  const ranked = stats.kinds
  const max = Math.max(1, ...ranked.map((k) => k.known))
  return (
    <section>
      <h3 className="section-head" data-rise>
        What you collect
      </h3>
      <p className="meter-explain" data-rise style={{ fontSize: 15 }}>
        Mostly {top.label.toLowerCase()}. Ideologies and practices tend to come with experience.
      </p>
      <ul className="hbars">
        {ranked.map((k) => (
          <li key={k.label} data-rise>
            <div className="hbar" style={{ gridTemplateColumns: '112px minmax(0,1fr) 36px' }}>
              <span className="hbar-name">{k.label}</span>
              <span className="bar-track">
                <span className="bar-fill" data-grow style={{ width: `${(k.known / max) * 100}%` }} />
              </span>
              <span className="hbar-value">{k.known}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function StatsPage() {
  const root = useRef<HTMLDivElement>(null)
  const stats = useStats()
  const openTerm = useStore((s) => s.openTerm)

  useRise(root)
  useGrow(root)

  return (
    <div ref={root}>
      <section className="hero">
        <p className="hero-label" data-rise>
          How much of the map you know
        </p>
        <div className="hero-row" data-rise>
          <p className="hero-num">
            <CountUp value={stats.awareness * 100} />
            <small>%</small>
          </p>
          <Sparkline />
        </div>
        <p className="hero-tier" data-rise>
          <b>{stats.tier.name}.</b>{' '}
          {stats.nextTier
            ? `About ${stats.termsToNext} core ${stats.termsToNext === 1 ? 'term' : 'terms'} from ${stats.nextTier.name}.`
            : 'There’s nowhere left to climb.'}
        </p>
        <p className="hero-copy" data-rise>
          {summarize(stats)}
          {stats.beyond > 0 ? ` You also know ${stats.beyond} ${stats.beyond === 1 ? 'term' : 'terms'} beyond the map.` : ''}
        </p>
        <Reading />
      </section>

      <section>
        <h3 className="section-head" data-rise>
          The shape of it
        </h3>
        <div className="meters">
          {stats.meters.map((m) => (
            <div className="meter" key={m.key} data-rise>
              <div className="meter-top">
                <span className="meter-name">{m.label}</span>
                <span className="meter-value">{Math.round(m.value * 100)}%</span>
              </div>
              <div
                className="bar-track"
                role="meter"
                aria-label={m.label}
                aria-valuenow={Math.round(m.value * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="bar-fill" data-grow style={{ width: `${m.value * 100}%` }} />
              </div>
              <p className="meter-explain">{m.explain}</p>
            </div>
          ))}
        </div>
      </section>

      <Fields stats={stats} />

      <section>
        <h3 className="section-head" data-rise>
          Closest blind spots
        </h3>
        <ul className="spots">
          {stats.blindSpots.map((t) => (
            <li key={t.id} data-rise>
              <button
                className="spot"
                onClick={() => openTerm(t.id)}
                onPointerEnter={() => stage.plate?.highlight(t.id)}
                onPointerLeave={() => stage.plate?.highlight(null)}
              >
                <Dot domain={t.domain} />
                <span>
                  <span className="spot-name">{t.name}</span>
                  <span className="spot-sub">{t.def}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Eras stats={stats} />
      <Kinds stats={stats} />
    </div>
  )
}
