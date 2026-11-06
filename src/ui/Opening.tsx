import { useMemo, useRef, useState } from 'react'
import { stage } from '../brain/atlas'
import { starters, type KnownMap } from '../engine/stats'
import { SplitText, gsap, prefersReducedMotion, useGSAP, useRise } from '../lib/motion'
import { TERM_BY_ID } from '../map'
import { useStore } from '../state/store'
import { Dot, domainVar } from './bits'

/** Mirrors the text behind the field, underlining what's been recognised, right where you're looking. */
function Mirror({ text, innerRef }: { text: string; innerRef: React.RefObject<HTMLDivElement | null> }) {
  const spans = useStore((s) => s.parsed.spans)
  const parts: React.ReactNode[] = []
  let at = 0
  spans.forEach((s, i) => {
    if (s.start > at) parts.push(text.slice(at, s.start))
    const term = s.id ? TERM_BY_ID.get(s.id) : null
    parts.push(
      <mark key={i} style={term ? domainVar(term.domain) : undefined} data-new={!term || undefined}>
        {text.slice(s.start, s.end)}
      </mark>,
    )
    at = s.end
  })
  parts.push(text.slice(at))
  return (
    <div className="dump-mirror" ref={innerRef} aria-hidden="true">
      {parts}
      {'\n'}
    </div>
  )
}

export function Opening() {
  const root = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const mirror = useRef<HTMLDivElement>(null)
  const draft = useStore((s) => s.draft)
  const parsed = useStore((s) => s.parsed)
  const known = useStore((s) => s.known)
  const setDraft = useStore((s) => s.setDraft)
  const commitDraft = useStore((s) => s.commitDraft)
  const loadExample = useStore((s) => s.loadExample)
  const [offset, setOffset] = useState(0)

  useRise(root)
  useGSAP(
    () => {
      if (prefersReducedMotion() || !title.current) return
      const split = new SplitText(title.current, { type: 'lines', mask: 'lines' })
      gsap.from(split.lines, { yPercent: 105, duration: 1, stagger: 0.09, ease: 'expo.out', delay: 0.1 })
      return () => split.revert()
    },
    { scope: root },
  )

  const picks = useMemo(() => {
    const seen: KnownMap = { ...known }
    for (const id of parsed.found) seen[id] = { level: 2, at: 0 }
    return starters(seen, offset, 11)
  }, [known, parsed, offset])

  const count = parsed.found.length
  const fresh = parsed.unknown.length + parsed.prose.length
  const ready = count + fresh > 0

  const append = (name: string) => {
    const base = draft.replace(/[\s,]+$/, '')
    setDraft(base ? `${base}, ${name}` : name)
  }

  const open = () => {
    if (!ready) return
    commitDraft()
    stage.plate?.celebrate()
  }

  return (
    <div className="opening" ref={root}>
      <h1 className="headline" ref={title}>
        What's in
        <br />
        your <em>head?</em>
      </h1>
      <p className="lede" data-rise>
        List every tech term you know. Tools, ideas, acronyms, half-remembered buzzwords. Your brain lights up as you
        type.
      </p>

      <div className="dump" data-rise>
        <Mirror text={draft} innerRef={mirror} />
        <textarea
          className="dump-field"
          aria-label="Everything you know, in any order"
          placeholder="react, docker, zero trust, rag, the unix philosophy…"
          value={draft}
          spellCheck={false}
          // On a phone, focusing here would throw a keyboard over the brain.
          autoFocus={!matchMedia('(pointer: coarse)').matches}
          onChange={(e) => setDraft(e.target.value)}
          onScroll={(e) => {
            if (mirror.current) mirror.current.scrollTop = e.currentTarget.scrollTop
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) open()
          }}
        />
      </div>

      <div className="dump-row" data-rise>
        <p className="tally" aria-live="polite">
          {ready ? (
            <>
              <b>{count}</b> on the map
              {fresh > 0 && (
                <>
                  , <b>{fresh}</b> new
                </>
              )}
            </>
          ) : (
            'Any order. Any format.'
          )}
        </p>
        <button className="btn btn-primary" disabled={!ready} onClick={open}>
          Open my brain
        </button>
      </div>

      <div className="starter" data-rise>
        <div className="starter-head">
          <span>Blank page? Tap what you recognise</span>
          <button className="link" onClick={() => setOffset((o) => o + 11)}>
            More
          </button>
        </div>
        <div className="chips">
          {picks.map((t) => (
            <button
              key={t.id}
              className="chip"
              onClick={() => append(t.name)}
              onPointerEnter={() => stage.plate?.highlight(t.id)}
              onPointerLeave={() => stage.plate?.highlight(null)}
            >
              <Dot domain={t.domain} />
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <p className="opening-foot" data-rise>
        Just looking?{' '}
        <button className="link" onClick={() => { loadExample(); stage.plate?.celebrate() }}>
          Explore an example brain
        </button>
      </p>
    </div>
  )
}
