'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  isLoaded: boolean
}

const BOOT_LINES = [
  'PARAFOUR P4-SFCP BOOT SEQUENCE v2.4.1',
  'Initializing metering subsystem…',
  'Valve controller: ONLINE',
  'Display controller: ACTIVE',
  'Safety interlock: ARMED',
  'Flow calibration: ±0.3% NOMINAL',
  'System ready.',
]

export default function LoadingScreen({ isLoaded }: LoadingScreenProps) {
  const [bootLines, setBootLines] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    let lineIndex = 0
    const interval = setInterval(() => {
      if (lineIndex < BOOT_LINES.length) {
        setBootLines((prev) => [...prev, BOOT_LINES[lineIndex]])
        setProgress(((lineIndex + 1) / BOOT_LINES.length) * 100)
        lineIndex++
      } else {
        clearInterval(interval)
      }
    }, 280)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isLoaded && progress >= 100) {
      const timer = setTimeout(() => setExiting(true), 400)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, progress])

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="loading-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <div className="w-full max-w-sm px-6">
            {/* Logo mark */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="font-display font-black tracking-wider mb-1"
                style={{ fontSize: 28, color: '#ECEEF0', letterSpacing: '0.2em' }}
              >
                PARAFOUR
              </div>
              <div className="font-mono text-xs" style={{ color: '#F59E0B', letterSpacing: '0.15em' }}>
                P4-SFCP SERIES
              </div>
            </motion.div>

            {/* Boot terminal */}
            <div
              className="font-mono mb-6"
              style={{
                fontSize: 11,
                lineHeight: 1.8,
                color: '#3A4048',
                minHeight: 148,
              }}
            >
              {bootLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    color:
                      i === 0
                        ? '#F59E0B'
                        : i === bootLines.length - 1
                        ? '#22C55E'
                        : '#3A4048',
                  }}
                >
                  {i === 0 ? '> ' : '  '}{line}
                </motion.div>
              ))}
              {/* Blinking cursor */}
              {progress < 100 && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                  style={{ color: '#F59E0B' }}
                >
                  █
                </motion.span>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: '#1A2530', width: '100%' }}>
              <motion.div
                style={{ height: '100%', background: '#F59E0B' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
            </div>

            <div className="flex justify-between mt-1.5">
              <span className="font-mono text-xs" style={{ color: '#1A2530', fontSize: 10 }}>
                SYSTEM INIT
              </span>
              <span className="font-mono text-xs" style={{ color: '#2A3038', fontSize: 10 }}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
