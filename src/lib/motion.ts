import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import type { RefObject } from 'react'
import { prefersReducedMotion } from '../brain/plate'

gsap.registerPlugin(useGSAP, SplitText)

/**
 * One motion language for the whole app. Things settle rather than bounce, and
 * every animation explains something: where a thing came from, or what changed.
 */
export const EASE = 'power3.out'

/** Lifts a page's marked elements into place, in reading order. */
export function useRise(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-rise]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.045,
        ease: EASE,
        clearProps: 'transform,opacity,visibility',
      })
    },
    { scope, dependencies: deps },
  )
}

/** Grows bars from zero so changes read as change. */
export function useGrow(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-grow]', {
        scaleX: 0,
        duration: 0.9,
        stagger: 0.035,
        ease: 'expo.out',
        delay: 0.1,
        clearProps: 'transform',
      })
      gsap.from('[data-grow-up]', {
        scaleY: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'expo.out',
        delay: 0.2,
        clearProps: 'transform',
      })
    },
    { scope, dependencies: deps },
  )
}

export { gsap, useGSAP, SplitText, prefersReducedMotion }
