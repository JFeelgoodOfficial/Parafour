'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImpactOverlayProps {
  scrollProgress: number
  sections: Record<string, { start: number; end: number }>
}

const SCENARIOS = [
  {
    id: 'throughput',
    number: '01',
    headline: 'Cut Fill Time by 40%',
    sub: 'Fuel Station Throughput',
    description:
      'Preset delivery and instant flow confirmation reduce operator time per vehicle from 4.2 minutes to 2.5 minutes. More vehicles. More revenue. Same station.',
    stats: [
      { label: 'Fill Cycle Time', before: '4.2 min', after: '2.5 min', gain: '−40%' },
      { label: 'Daily Vehicle Capacity', before: '180', after: '300+', gain: '+67%' },
    ],
    icon: '⚡',
    color: '#F59E0B',
    context: 'Fuel Stations & Forecourts',
  },
  {
    id: 'safety',
    headline: 'Zero Unauthorized Dispensing',
    number: '02',
    sub: 'Access & Operator Control',
    description:
      'PIN-secured operation and operator logging mean every liter is authorized, tracked, and accountable. Eliminate shrinkage and unauthorized fills at the hardware level.',
    stats: [
      { label: 'Shrinkage Incidents', before: 'Untracked', after: 'Zero', gain: '100%' },
      { label: 'Operator Accountability', before: 'Manual log', after: 'Automated', gain: '∞' },
    ],
    icon: '◈',
    color: '#3B82F6',
    context: 'Fleet & Service Operations',
  },
  {
    id: 'maintenance',
    headline: 'Predictable, Low-effort Maintenance',
    number: '03',
    sub: 'Operational Uptime',
    description:
      'Modular valve and meter assemblies tool-free serviceable in under 20 minutes. Fault codes displayed directly on the panel eliminate guesswork for technicians.',
    stats: [
      { label: 'Service Time', before: '3–4 hrs', after: '< 20 min', gain: '−88%' },
      { label: 'Technician Skill Required', before: 'Specialist', after: 'Operator', gain: 'Simpler' },
    ],
    icon: '⬡',
    color: '#F59E0B',
    context: 'Service & Installation Teams',
  },
  {
    id: 'professionalism',
    headline: 'Station Professionalism Upgrade',
    number: '04',
    sub: 'Customer & Operator Confidence',
    description:
      'Precision displays, clear operation flow, and clean engineering build trust with customers instantly. A Parafour installation signals a serious, professional operation.',
    stats: [
      { label: 'Customer Confidence', before: 'Visual concern', after: 'Trust signal', gain: 'Brand' },
      { label: 'Repeat Business Factor', before: 'Variable', after: 'Consistent', gain: 'Loyalty' },
    ],
    icon: '▣',
    color: '#3B82F6',
    context: 'LPG Cylinder Filling Plants',
  },
]

// Animated counter
function AnimatedStat({ value, label, color }: { value: string; label: string; color: string }) {
  const [displayed, setDisplayed] = useState('0')
  const hasNumber = /\d/.test(value)

  useEffect(() => {
    if (!hasNumber) { setDisplayed(value); return }
    let frame = 0
    const total = 40
    const interval = setInterval(() => {
      frame++
      const progress = frame / total
      const eased = 1 - Math.pow(1 - progress, 3)
      // Extract numeric part and suffix
      const match = value.match(/^([<+\-−]?\d+\.?\d*)(.*)$/)
      if (match) {
        const num = parseFloat(match[1].replace(/[<+\-−]/, ''))
        const prefix = match[1].match(/^[<+\-−]/)?.[0] || ''
        const suffix = match[2]
        setDisplayed(`${prefix}${Math.round(num * eased)}${suffix}`)
      } else {
        setDisplayed(value)
      }
      if (frame >= total) {
        clearInterval(interval)
        setDisplayed(value)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [value, hasNumber])

  return (
    <div>
      <div className="font-display font-black" style={{ fontSize: 28, color, lineHeight: 1 }}>
        {displayed}
      </div>
      <div className="font-mono text-xs mt-0.5" style={{ color: '#3A4048', fontSize: 10 }}>
        {label}
      </div>
    </div>
  )
}

export default function ImpactOverlay({ scrollProgress, sections }: ImpactOverlayProps) {
  const [entered, setEntered] = useState(false)
  const [activeScenario, setActiveScenario] = useState(0)

  const sectionProgress = Math.max(
    0,
    Math.min(1, (scrollProgress - sections.impact.start) / (sections.impact.end - sections.impact.start))
  )

  useEffect(() => {
    if (sectionProgress > 0.05 && !entered) setEntered(true)
  }, [sectionProgress, entered])

  // Auto-advance scenarios based on scroll
  useEffect(() => {
    const idx = Math.min(Math.floor(sectionProgress * 4.5), 3)
    setActiveScenario(idx)
  }, [sectionProgress])

  const scenario = SCENARIOS[activeScenario]

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header */}
      <motion.div
        className="px-5 md:px-10 pt-8 md:pt-10 flex-shrink-0"
        initial={{ opacity: 0, y: -16 }}
        animate={entered ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55 }}
      >
        <div className="font-mono text-xs tracking-industrial uppercase mb-2" style={{ color: '#F59E0B' }}>
          04 — Industry Impact
        </div>
        <h2
          className="font-display font-bold leading-none"
          style={{ fontSize: 'clamp(24px, 4vw, 46px)', color: '#ECEEF0' }}
        >
          From Dispenser to
          <br />
          <span style={{ color: '#F59E0B' }}>Game-changer.</span>
        </h2>
      </motion.div>

      {/* Scenario tabs */}
      <motion.div
        className="flex gap-1 px-5 md:px-10 mt-4 flex-shrink-0 overflow-x-auto pb-1"
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            className="flex-shrink-0 font-mono text-xs py-1.5 px-3 pointer-events-auto transition-all duration-200"
            style={{
              background: activeScenario === i ? `${s.color}14` : 'transparent',
              border: `1px solid ${activeScenario === i ? s.color : '#1A2530'}`,
              color: activeScenario === i ? s.color : '#3A4048',
              cursor: 'pointer',
            }}
            onClick={() => setActiveScenario(i)}
          >
            {s.number}
          </button>
        ))}
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-5 md:px-10 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Context badge */}
            <div
              className="inline-flex items-center gap-2 font-mono text-xs mb-3 px-2 py-1"
              style={{
                border: `1px solid ${scenario.color}30`,
                color: scenario.color,
                background: `${scenario.color}08`,
              }}
            >
              <span>{scenario.icon}</span>
              <span>{scenario.context}</span>
            </div>

            {/* Headline */}
            <h3
              className="font-display font-black mb-2 leading-tight"
              style={{ fontSize: 'clamp(20px, 4vw, 36px)', color: '#ECEEF0' }}
            >
              {scenario.headline}
            </h3>

            {/* Description */}
            <p className="font-body mb-5" style={{ fontSize: 14, color: '#8B9095', lineHeight: 1.65, maxWidth: 440 }}>
              {scenario.description}
            </p>

            {/* Before / After stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 max-w-md">
              {scenario.stats.map((stat, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(13,14,16,0.9)',
                    border: `1px solid ${scenario.color}18`,
                    padding: '12px 14px',
                  }}
                >
                  <div className="font-mono text-xs mb-2" style={{ color: '#3A4048', fontSize: 10 }}>
                    {stat.label}
                  </div>
                  <div className="flex items-end gap-3">
                    <div>
                      <div className="font-mono text-xs line-through" style={{ color: '#3A4048' }}>
                        {stat.before}
                      </div>
                      <div className="font-display font-bold" style={{ fontSize: 16, color: '#ECEEF0' }}>
                        {stat.after}
                      </div>
                    </div>
                    <div
                      className="font-mono text-xs ml-auto"
                      style={{ color: scenario.color }}
                    >
                      {stat.gain}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="px-5 md:px-10 pb-6 flex items-center gap-3">
        {SCENARIOS.map((s, i) => (
          <div
            key={s.id}
            className="transition-all duration-400"
            style={{
              height: 2,
              flex: activeScenario === i ? 3 : 1,
              background: activeScenario === i ? scenario.color : '#1A2530',
            }}
          />
        ))}
        <span className="font-mono text-xs ml-2" style={{ color: '#2A3038' }}>
          {activeScenario + 1}/{SCENARIOS.length}
        </span>
      </div>
    </div>
  )
}
