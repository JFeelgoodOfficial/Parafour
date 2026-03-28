'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface SystemOverlayProps {
  scrollProgress: number
  sections: Record<string, { start: number; end: number }>
}

const FEATURES = [
  {
    id: 'control',
    icon: '⬡',
    title: 'Precision Flow Control',
    body: 'Proportional solenoid valve modulates flow rate in real time. Eliminates over-delivery and ensures exact preset dispensing every cycle.',
    stat: '99.7%',
    statLabel: 'Preset accuracy',
    color: '#F59E0B',
  },
  {
    id: 'safety',
    icon: '◈',
    title: 'Multi-layer Safety Logic',
    body: 'Triple-redundant fault detection: pressure anomaly, vapor lock, and connectivity loss all trigger automatic shutoff within 80ms.',
    stat: '< 80ms',
    statLabel: 'Fault response time',
    color: '#3B82F6',
  },
  {
    id: 'metering',
    icon: '◉',
    title: 'Certified Measurement',
    body: 'OIML R117 & NTEP certified PD metering chamber. Temperature-compensated for consistent accuracy across all weather conditions.',
    stat: 'OIML R117',
    statLabel: 'Certification standard',
    color: '#F59E0B',
  },
  {
    id: 'interface',
    icon: '▣',
    title: 'Operator-first Interface',
    body: 'Logical keypad layout, clear display hierarchy, and audible confirmation reduce operator error and accelerate transaction time.',
    stat: '40%',
    statLabel: 'Faster operator training',
    color: '#3B82F6',
  },
]

// Animated flow path SVG
function FlowDiagram({ animate }: { animate: boolean }) {
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (!pathRef.current) return
    const length = pathRef.current.getTotalLength()
    pathRef.current.style.strokeDasharray = `${length}`
    pathRef.current.style.strokeDashoffset = animate ? '0' : `${length}`
    pathRef.current.style.transition = animate ? 'stroke-dashoffset 2.5s cubic-bezier(0.4,0,0.2,1)' : 'none'
  }, [animate])

  return (
    <svg
      viewBox="0 0 280 80"
      className="w-full"
      style={{ height: 64, overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* Background track */}
      <path
        d="M 10,40 C 60,40 80,20 120,20 C 160,20 180,60 220,60 C 250,60 265,40 275,40"
        fill="none"
        stroke="#1A2530"
        strokeWidth="2"
      />
      {/* Animated flow line */}
      <path
        ref={pathRef}
        d="M 10,40 C 60,40 80,20 120,20 C 160,20 180,60 220,60 C 250,60 265,40 275,40"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Nodes */}
      {[
        { cx: 10, cy: 40, label: 'IN', color: '#3B82F6' },
        { cx: 120, cy: 20, label: 'METER', color: '#F59E0B' },
        { cx: 220, cy: 60, label: 'VALVE', color: '#F59E0B' },
        { cx: 275, cy: 40, label: 'OUT', color: '#22C55E' },
      ].map(({ cx, cy, label, color }) => (
        <g key={label}>
          <circle cx={cx} cy={cy} r={5} fill={color} opacity={0.9} />
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            fill={color}
            fontSize={8}
            fontFamily="IBM Plex Mono"
            letterSpacing="0.05em"
          >
            {label}
          </text>
        </g>
      ))}
      {/* Moving dot along path */}
      {animate && (
        <circle r={3} fill="#ECEEF0" opacity={0.9}>
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path="M 10,40 C 60,40 80,20 120,20 C 160,20 180,60 220,60 C 250,60 265,40 275,40"
          />
        </circle>
      )}
    </svg>
  )
}

export default function SystemOverlay({ scrollProgress, sections }: SystemOverlayProps) {
  const [entered, setEntered] = useState(false)

  const sectionProgress = Math.max(
    0,
    Math.min(1, (scrollProgress - sections.system.start) / (sections.system.end - sections.system.start))
  )

  useEffect(() => {
    if (sectionProgress > 0.05 && !entered) setEntered(true)
  }, [sectionProgress, entered])

  const visibleCards = Math.floor(sectionProgress * 5)

  return (
    <div className="absolute inset-0 flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <motion.div
        className="px-5 md:px-10 pt-8 md:pt-10"
        initial={{ opacity: 0, y: -16 }}
        animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
        transition={{ duration: 0.55 }}
      >
        <div className="font-mono text-xs tracking-industrial uppercase mb-2" style={{ color: '#3B82F6' }}>
          03 — System Intelligence
        </div>
        <h2
          className="font-display font-bold leading-none"
          style={{ fontSize: 'clamp(26px, 4.5vw, 48px)', color: '#ECEEF0' }}
        >
          Engineered to Think,
          <br />
          <span style={{ color: '#3B82F6' }}>Not Just Dispense.</span>
        </h2>
      </motion.div>

      {/* Flow diagram */}
      <motion.div
        className="px-5 md:px-10"
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="mb-1 font-mono text-xs" style={{ color: '#2A3038' }}>
          LPG FLOW PATH — P4-SFCP
        </div>
        <FlowDiagram animate={entered} />
      </motion.div>

      {/* Feature cards — scrolls into view progressively */}
      <div className="px-5 md:px-10 pb-6 grid grid-cols-2 gap-2 md:gap-3 md:grid-cols-4">
        {FEATURES.map((feat, i) => (
          <motion.div
            key={feat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={
              entered && i < visibleCards
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'rgba(13,14,16,0.85)',
              border: `1px solid ${feat.color}18`,
              backdropFilter: 'blur(8px)',
              padding: '14px',
            }}
          >
            {/* Icon + stat */}
            <div className="flex items-start justify-between mb-2">
              <span style={{ fontSize: 18, color: feat.color }}>{feat.icon}</span>
              <div className="text-right">
                <div className="font-display font-bold" style={{ fontSize: 15, color: feat.color }}>
                  {feat.stat}
                </div>
                <div className="font-mono text-xs" style={{ color: '#3A4048', fontSize: 9 }}>
                  {feat.statLabel}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="font-display font-semibold mb-1" style={{ fontSize: 13, color: '#ECEEF0', lineHeight: 1.25 }}>
              {feat.title}
            </div>

            {/* Body — hide on very small */}
            <p className="font-body hidden sm:block" style={{ fontSize: 11, color: '#4A5568', lineHeight: 1.55 }}>
              {feat.body}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
