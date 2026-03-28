'use client'

import { useEffect, useRef, useState } from 'react'

export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const lenisRef = useRef<any>(null)

  useEffect(() => {
    let lenis: any = null

    const initLenis = async () => {
      const { default: Lenis } = await import('lenis')

      lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.5,
      })

      lenisRef.current = lenis

      lenis.on('scroll', ({ scroll, limit }: { scroll: number; limit: number }) => {
        const progress = limit > 0 ? scroll / limit : 0
        setScrollProgress(progress)
        setScrollY(scroll)
      })

      function raf(time: number) {
        lenis?.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)
    }

    initLenis()

    return () => {
      lenis?.destroy()
    }
  }, [])

  return { scrollProgress, scrollY, lenis: lenisRef.current }
}

// Section progress helper
// Returns 0-1 progress for a section that occupies [sectionStart, sectionEnd] of total scroll
export function useSectionProgress(
  scrollProgress: number,
  sectionStart: number,
  sectionEnd: number
): number {
  const range = sectionEnd - sectionStart
  if (range <= 0) return 0
  return Math.max(0, Math.min(1, (scrollProgress - sectionStart) / range))
}
