import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { stage } from '../brain/atlas'
import type { ThemeName } from '../brain/plate'
import { computeStats } from '../engine/stats'
import { gsap, prefersReducedMotion, useGSAP } from '../lib/motion'
import { TERM_BY_ID, type DomainId } from '../map'
import { useStore } from '../state/store'

export function useStats() {
  const known = useStore((s) => s.known)
  const custom = useStore((s) => s.custom)
  return useMemo(() => computeStats(known, custom), [known, custom])
}

export function useResolvedTheme(): ThemeName {
  const choice = useStore((s) => s.theme)
  const [system, setSystem] = useState<ThemeName>(() =>
    matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )
  useEffect(() => {
    const q = matchMedia('(prefers-color-scheme: dark)')
    const on = () => setSystem(q.matches ? 'dark' : 'light')
    q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  return choice === 'system' ? system : choice
}

export const domainVar = (domain: DomainId) => ({ '--dot': `var(--d-${domain})` }) as CSSProperties

export function Dot({ domain }: { domain: DomainId }) {
  return <span className="dot" style={domainVar(domain)} aria-hidden="true" />
}

export function termInfo(id: string) {
  const s = useStore.getState()
  const t = TERM_BY_ID.get(id)
  if (t) return { id, name: t.name, domain: t.domain }
  const c = s.custom[id]
  return c ? { id, name: c.name, domain: c.domain } : null
}

/** A term that can be opened, and that points itself out on the plate when hovered. */
export function TermChip({ id, dim }: { id: string; dim?: boolean }) {
  const openTerm = useStore((s) => s.openTerm)
  const info = termInfo(id)
  if (!info) return null
  return (
    <button
      className="chip"
      data-dim={dim || undefined}
      onClick={() => openTerm(id)}
      onPointerEnter={() => stage.plate?.highlight(id)}
      onPointerLeave={() => stage.plate?.highlight(null)}
      onFocus={() => stage.plate?.highlight(id)}
      onBlur={() => stage.plate?.highlight(null)}
    >
      <Dot domain={info.domain} />
      {info.name}
    </button>
  )
}

/** Counts up to a number rather than snapping, so change is felt. */
export function CountUp({ value, format = (v: number) => String(Math.round(v)) }: { value: number; format?: (v: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const last = useRef(0)
  useGSAP(
    () => {
      const obj = { v: last.current }
      last.current = value
      if (prefersReducedMotion()) {
        if (ref.current) ref.current.textContent = format(value)
        return
      }
      gsap.to(obj, {
        v: value,
        duration: 1.2,
        ease: 'power3.out',
        onUpdate: () => {
          if (ref.current) ref.current.textContent = format(obj.v)
        },
      })
    },
    { dependencies: [value] },
  )
  return <span ref={ref}>{format(0)}</span>
}

const PATHS: Record<string, ReactNode> = {
  plus: <path d="M9 3.5v11M3.5 9h11" />,
  minus: <path d="M3.5 9h11" />,
  fit: <path d="M3.5 7V3.5H7M11 3.5h3.5V7M14.5 11v3.5H11M7 14.5H3.5V11" />,
  back: <path d="M10.5 4 5.5 9l5 5" />,
  more: (
    <>
      <circle cx="4" cy="9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="9" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  sun: (
    <>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M9 2v1.6M9 14.4V16M2 9h1.6M14.4 9H16M4 4l1.1 1.1M12.9 12.9 14 14M14 4l-1.1 1.1M5.1 12.9 4 14" />
    </>
  ),
  moon: <path d="M15 10.6A6.5 6.5 0 0 1 7.4 3a6.5 6.5 0 1 0 7.6 7.6Z" />,
}

export function Icon({ name, size = 18 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

export function Back({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button className="back" onClick={onClick} data-rise>
      <Icon name="back" size={16} />
      {label}
    </button>
  )
}

export const money = (n: number) => (n < 0.01 ? 'under a cent' : `about $${n.toFixed(n < 1 ? 2 : 2)}`)
