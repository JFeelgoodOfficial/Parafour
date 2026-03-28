'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductsOverlayProps {
  scrollProgress: number
  sections: Record<string, { start: number; end: number }>
}

const HOTSPOTS = [
  {
    id: 'display',
    label: 'Digital Transaction Display',
    icon: '◈',
    position: { top: '22%', left: '54%' },
    spec: 'LCD Amber Display',
    value: '6-digit precision readout',
    detail:
      'High-contrast amber LCD with 6-digit transaction and total register. Anti-glare coating ensures clear readability in direct sunlight and low-light conditions.',
    tags: ['High Contrast', 'Weather-sealed', 'Dual-register'],
    color: '#F59E0B',
  },
  {
    id: 'meter',
    label: 'Flow Measurement Chamber',
    icon: '◉',
    position: { top: '38%', left: '52%' },
    spec: 'Positive Displacement Meter',
    value: '±0.3% accuracy',
    detail:
      'Precision positive displacement metering chamber rated to ±0.3% accuracy. OIML R117 certified for commercial-grade LPG measurement in all ambient conditions.',
    tags: ['OIML Certified', 'PD Meter', '±0.3% Accuracy'],
    color: '#3B82F6',
  },
  {
    id: 'valve',
    label: 'Safety Valve System',
    icon: '◆',
    position: { top: '65%', left: '48%' },
    spec: 'Dual-Stage Solenoid Valve',
    value: 'Auto-shutoff on fault',
    detail:
      'Dual-stage brass solenoid valves with fail-safe normally-closed design. Automatic shutoff triggers on power loss, pressure anomaly, or operator-initiated emergency stop.',
    tags: ['Fail-safe NC', 'Auto-shutoff', 'ATEX Rated'],
    color: '#F59E0B',
  },
  {
    id: 'nozzle',
    label: 'Hose & Nozzle Assembly',
    icon: '◇',
    position: { top: '45%', left: '72%' },
    spec: 'LPG-grade Composite Hose',
    value: '20-bar rated',
    detail:
      'Anti-static LPG composite hose with stainless steel fittings. 20-bar burst pressure rating. Break-away coupling protects the dispenser from drive-away incidents.',
    tags: ['Anti-static', 'Break-away Coupling', '20-bar Rated'],
    color: '#3B82F6',
  },
  {
    id: 'panel',
    label: 'Control Panel & Keypad',
    icon: '▣',
    position: { top: '50%', left: '54%' },
    spec: 'Sealed IP54 Keypad',
    value: '12-key operator interface',
    detail:
      'IP54-sealed 12-key keypad with tactile feedback. Supports preset delivery, quantity authorization, and operator PIN security. Anti-vandal construction with steel keys.',
    tags: ['IP54 Sealed', 'Anti-vandal', 'PIN Security'],
    color: '#F59E0B',
  },
]

interface Spec {
  id: string
  label: string
  icon: string
  position: { top: string; left: string }
  spec: string
  value: string
  detail: string
  tags: string[]
  color: string
}

function HotspotButton({ spot, isActive, onClick }: { spot: Spec; isActive: boolean; onClick: () => void }) {
  return (
    <motion.button
      className="absolute pointer-events-auto"
      style={{ top: spot.position.top, left: spot.position.left, transform: 'translate(-50%, -50%)' }}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
    >
      {/* Outer ring pulse */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid ${spot.color}`,
          width: 32,
          height: 32,
          top: -6,
          left: -6,
        }}
        animate={isActive ? {} : { scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
      />
      {/* Core dot */}
      <div
        className="relative z-10 flex items-center justify-center rounded-full font-mono text-xs transition-all duration-200"
        style={{
          width: 20,
          height: 20,
          background: isActive ? spot.color : 'rgba(13,14,16,0.8)',
          border: `1.5px solid ${spot.color}`,
          color: isActive ? '#0D0E10' : spot.color,
          fontSize: 10,
          boxShadow: isActive ? `0 0 12px ${spot.color}60` : 'none',
        }}
      >
        {spot.icon}
      </div>
    </motion.button>
  )
}

export default function ProductsOverlay({ scrollProgress, sections }: ProductsOverlayProps) {
  const [activeSpot, setActiveSpot] = useState<string | null>(null)
  const [entered, setEntered] = useState(false)

  const sectionProgress = Math.max(
    0,
    Math.min(1, (scrollProgress - sections.products.start) / (sections.products.end - sections.products.start))
  )

  useEffect(() => {
    if (sectionProgress > 0.1 && !entered) setEntered(true)
  }, [sectionProgress, entered])

  const activeData = HOTSPOTS.find((h) => h.id === activeSpot)

  return (
    <div className="absolute inset-0 flex flex-col justify-between">
      {/* Section header */}
      <motion.div
        className="px-5 md:px-10 pt-8 md:pt-10"
        initial={{ opacity: 0, y: -20 }}
        animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
      >
        <div className="font-mono text-xs tracking-industrial uppercase mb-2" style={{ color: '#F59E0B' }}>
          02 — Engineering Detail
        </div>
        <h2
          className="font-display font-bold leading-none"
          style={{ fontSize: 'clamp(28px, 5vw, 52px)', color: '#ECEEF0' }}
        >
          Inspect the Quality
        </h2>
        <p className="font-body mt-2" style={{ fontSize: 14, color: '#4A5568', maxWidth: 360 }}>
          Tap any hotspot to examine the precision engineering built into every P4-SFCP unit.
        </p>
      </motion.div>

      {/* Hotspot overlay on 3D canvas area */}
      <div className="absolute inset-0 pointer-events-none">
        {entered &&
          HOTSPOTS.map((spot) => (
            <HotspotButton
              key={spot.id}
              spot={spot}
              isActive={activeSpot === spot.id}
              onClick={() => setActiveSpot(activeSpot === spot.id ? null : spot.id)}
            />
          ))}
      </div>

      {/* Detail panel — slides in from bottom/right */}
      <AnimatePresence>
        {activeData && (
          <motion.div
            key={activeData.id}
            className="absolute pointer-events-auto"
            style={{
              bottom: 80,
              right: 16,
              left: 16,
              maxWidth: 380,
              marginLeft: 'auto',
            }}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              style={{
                background: 'rgba(13,14,16,0.93)',
                border: `1px solid ${activeData.color}30`,
                backdropFilter: 'blur(12px)',
                padding: '18px 20px',
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-mono text-xs mb-1" style={{ color: activeData.color }}>
                    {activeData.spec}
                  </div>
                  <div className="font-display font-semibold" style={{ fontSize: 18, color: '#ECEEF0' }}>
                    {activeData.label}
                  </div>
                </div>
                <div
                  className="font-display font-bold text-right"
                  style={{ fontSize: 15, color: activeData.color, whiteSpace: 'nowrap', marginLeft: 12 }}
                >
                  {activeData.value}
                </div>
              </div>

              {/* Divider */}
              <div className="industrial-line mb-3" />

              {/* Detail text */}
              <p className="font-body mb-3" style={{ fontSize: 13, color: '#8B9095', lineHeight: 1.6 }}>
                {activeData.detail}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {activeData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs px-2 py-0.5"
                    style={{
                      color: activeData.color,
                      border: `1px solid ${activeData.color}40`,
                      background: `${activeData.color}08`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Close */}
              <button
                className="absolute top-3 right-3 font-mono text-xs pointer-events-auto"
                style={{ color: '#3A4048', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setActiveSpot(null)}
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spec bar */}
      <motion.div
        className="px-5 md:px-10 pb-6"
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-1">
          {[
            { label: 'Accuracy', value: '±0.3%' },
            { label: 'Pressure', value: '20 bar' },
            { label: 'Protection', value: 'IP54' },
            { label: 'Certification', value: 'OIML R117' },
          ].map(({ label, value }) => (
            <div key={label} className="flex-shrink-0">
              <div className="font-mono text-xs mb-0.5" style={{ color: '#3A4048' }}>
                {label}
              </div>
              <div className="font-display font-semibold" style={{ fontSize: 17, color: '#ECEEF0' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
