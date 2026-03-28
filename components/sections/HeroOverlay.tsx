'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HeroOverlayProps {
  scrollProgress: number
  sections: Record<string, { start: number; end: number }>
}

const TAGLINES = ['Precision.', 'Power.', 'Parafour.']

export default function HeroOverlay({ scrollProgress, sections }: HeroOverlayProps) {
  const [wordIndex, setWordIndex] = useState(0)
  const [showSub, setShowSub] = useState(false)
  const [showCTA, setShowCTA] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const t1 = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setWordIndex((i) => {
          if (i >= TAGLINES.length - 1) {
            clearInterval(intervalRef.current!)
            return i
          }
          return i + 1
        })
      }, 600)
    }, 400)

    const t2 = setTimeout(() => setShowSub(true), 2000)
    const t3 = setTimeout(() => setShowCTA(true), 2600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const heroProgress = Math.min(scrollProgress / sections.hero.end, 1)
  const fadeOut = heroProgress > 0.6 ? 1 - (heroProgress - 0.6) / 0.4 : 1

  const scrollToExplore = () => {
    window.scrollTo({ top: window.innerHeight * 1.2, behavior: 'smooth' })
  }

  return (
    <div
      className="absolute inset-0 flex flex-col justify-end pb-16 md:pb-20"
      style={{ opacity: fadeOut }}
    >
      {/* Top-left brand */}
      <motion.div
        className="absolute top-6 left-5 md:left-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div
          className="text-xs tracking-industrial font-mono uppercase"
          style={{ color: '#8B9095' }}
        >
          PARAFOUR SYSTEMS
        </div>
        <div className="industrial-line mt-1" style={{ width: 80 }} />
      </motion.div>

      {/* Top-right model badge */}
      <motion.div
        className="absolute top-6 right-5 md:right-8 text-right"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <div className="font-mono text-xs" style={{ color: '#F59E0B' }}>
          P4-SFCP SERIES
        </div>
        <div className="font-mono text-xs mt-0.5" style={{ color: '#4A5568' }}>
          LPG DISPENSING UNIT
        </div>
      </motion.div>

      {/* Main hero content — bottom-left anchored */}
      <div className="px-5 md:px-12 max-w-2xl">
        {/* Animated tagline words */}
        <div
          className="font-display font-black leading-none mb-3 md:mb-4"
          style={{
            fontSize: 'clamp(52px, 10vw, 96px)',
            color: '#ECEEF0',
            letterSpacing: '-0.01em',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              {TAGLINES[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Supporting copy */}
        <AnimatePresence>
          {showSub && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-body mb-6 md:mb-8 max-w-sm"
              style={{
                fontSize: 'clamp(13px, 2.2vw, 16px)',
                color: '#8B9095',
                lineHeight: 1.65,
              }}
            >
              Industrial-grade LPG dispensing engineered for reliability,
              operator clarity, and zero-compromise safety.
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA + scroll cue */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start"
            >
              <button
                onClick={scrollToExplore}
                className="group relative overflow-hidden font-display font-semibold tracking-wide uppercase pointer-events-auto"
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.18em',
                  padding: '13px 28px',
                  background: 'transparent',
                  color: '#F59E0B',
                  border: '1.5px solid rgba(245,158,11,0.5)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.background = 'rgba(245,158,11,0.08)'
                  el.style.borderColor = 'rgba(245,158,11,0.9)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.background = 'transparent'
                  el.style.borderColor = 'rgba(245,158,11,0.5)'
                }}
              >
                Explore the Systems
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('contact')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="font-body text-sm pointer-events-auto"
                style={{ color: '#4A5568', cursor: 'pointer', background: 'none', border: 'none' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B9095' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#4A5568' }}
              >
                Contact & Inquiries →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll cue — bottom center */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span
              className="font-mono text-xs tracking-industrial uppercase"
              style={{ color: '#3A4048' }}
            >
              Scroll to inspect
            </span>
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, #4A5568, transparent)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left vertical text — industrial detail */}
      <div
        className="absolute bottom-1/3 left-4 md:left-6 hidden md:block"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'rotate(180deg)',
        }}
      >
        <span className="font-mono text-xs tracking-wider" style={{ color: '#2A3038' }}>
          INDUSTRIAL · LPG · PRECISION
        </span>
      </div>
    </div>
  )
}
