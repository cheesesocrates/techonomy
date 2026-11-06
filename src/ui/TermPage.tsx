import { useEffect, useMemo, useRef, useState } from 'react'
import { explainTerm } from '../ai/tasks'
import { LEVELS } from '../engine/stats'
import { useRise } from '../lib/motion'
import { DOMAIN_BY_ID, KIND_LABEL, TERM_BY_ID } from '../map'
import { useStore } from '../state/store'
import { Back, Dot, TermChip, domainVar } from './bits'

export function TermPage({ id }: { id: string }) {
  const root = useRef<HTMLDivElement>(null)
  const known = useStore((s) => s.known)
  const custom = useStore((s) => s.custom)
  const explainFor = useStore((s) => s.explainFor)
  const openTerm = useStore((s) => s.openTerm)
  const addTerm = useStore((s) => s.addTerm)
  const setLevel = useStore((s) => s.setLevel)
  const forget = useStore((s) => s.forget)
  const showConnect = useStore((s) => s.showConnect)
  const connection = useStore((s) => s.connection)
  const addUsage = useStore((s) => s.addUsage)

  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const term = TERM_BY_ID.get(id) ?? custom[id]
  useRise(root, [id])

  useEffect(() => {
    setText('')
    setError('')
    setBusy(false)
  }, [id])

  const links = useMemo(() => {
    if (!term) return { lit: [], dark: [] }
    const rel = new Set(term.rel)
    for (const c of Object.values(custom)) if (c.rel.includes(id)) rel.add(c.id)
    const all = [...rel]
    return { lit: all.filter((r) => known[r]), dark: all.filter((r) => !known[r]).slice(0, 8) }
  }, [term, custom, id, known])

  const explain = async () => {
    const conn = connection()
    if (!conn) {
      showConnect({ type: 'explain', id })
      return
    }
    if (!term) return
    setBusy(true)
    setText('')
    setError('')
    try {
      const bridges = links.lit.map((r) => TERM_BY_ID.get(r)?.name ?? custom[r]?.name ?? '').filter(Boolean)
      const usage = await explainTerm(conn, term, bridges, (d) => setText((t) => t + d))
      addUsage(usage)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That explanation failed.')
    }
    setBusy(false)
  }

  // Coming back from connecting a key picks up where the person left off.
  useEffect(() => {
    if (explainFor === id) {
      useStore.setState({ explainFor: null })
      void explain()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explainFor, id])

  if (!term) {
    return (
      <div ref={root}>
        <Back onClick={() => openTerm(null)} />
        <p className="term-def">That term is gone.</p>
      </div>
    )
  }

  const domain = DOMAIN_BY_ID[term.domain]
  const entry = known[id]
  const isCustom = !TERM_BY_ID.has(id)

  return (
    <div ref={root} style={domainVar(term.domain)}>
      <Back onClick={() => openTerm(null)} />

      <p className="term-where" data-rise>
        <Dot domain={term.domain} />
        {domain.name}, {term.area.toLowerCase()}
      </p>
      <h2 className="term-name" data-rise>
        {term.name}
      </h2>
      <p className="term-def" data-rise>
        {term.def}
      </p>
      <p className="term-meta" data-rise>
        {KIND_LABEL[term.kind].replace(/ies$/, 'y').replace(/s$/, '')}, around since {term.year}
        {isCustom ? '. Placed by AI, beyond the map.' : '.'}
        {'unsure' in term && term.unsure ? ' The AI wasn’t sure about this one.' : ''}
      </p>

      {entry ? (
        <>
          <h3 className="section-head" data-rise>
            How well do you know it?
          </h3>
          <div className="levels" role="radiogroup" aria-label="How well you know this" data-rise>
            {LEVELS.map((l) => (
              <button
                key={l.level}
                className="level"
                role="radio"
                aria-checked={entry.level === l.level}
                title={l.hint}
                onClick={() => setLevel(id, l.level)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="connect-actions" data-rise>
          <button className="btn btn-primary" onClick={() => addTerm(id)}>
            I know this
          </button>
          <button className="btn btn-quiet" onClick={() => addTerm(id, 1)}>
            Heard of it
          </button>
        </div>
      )}

      {links.lit.length > 0 && (
        <>
          <h3 className="section-head" data-rise>
            Connected in your brain
          </h3>
          <div className="chips" data-rise>
            {links.lit.map((r) => (
              <TermChip key={r} id={r} />
            ))}
          </div>
        </>
      )}

      {links.dark.length > 0 && (
        <>
          <h3 className="section-head" data-rise>
            Next door, not lit yet
          </h3>
          <div className="chips" data-rise>
            {links.dark.map((r) => (
              <TermChip key={r} id={r} dim />
            ))}
          </div>
        </>
      )}

      {(text || busy) && (
        <p className="explain" aria-live="polite">
          {text || 'Thinking…'}
        </p>
      )}
      {error && <p className="note-error" style={{ marginTop: 14 }}>{error}</p>}

      {!text && !busy && (
        <div style={{ marginTop: 22 }} data-rise>
          <button className="link" onClick={() => void explain()}>
            Explain it through what I already know
          </button>
        </div>
      )}

      {entry && (
        <div>
          <button className="danger-link" onClick={() => forget(id)}>
            Forget this term
          </button>
        </div>
      )}
    </div>
  )
}
