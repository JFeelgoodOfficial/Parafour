'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavigationProps {
  scrollProgress: number
  activeSection: string
}

const NAV_SECTIONS = [
  { id: 'hero',     label: 'Overview',   scroll: 0.0  },
  { id: 'products', label: 'Products',   scroll: 0.22 },
  { id: 'system',   label: 'Systems',    scroll: 0.45 },
  { id: 'impact',   label: 'Impact',     scroll: 0.65 },
  { id: 'contact',  label: 'Contact',    scroll: 0.86 },
]

export default function Navigation({ scrollProgress, activeSection }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (fraction: number) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: maxScroll * fraction, behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <>
      {/* Desktop: right-side vertical nav dots */}
      <nav
        className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3 items-center"
        aria-label="Section navigation"
      >
        {NAV_SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollTo(sec.scroll)}
            title={sec.label}
            className="group relative flex items-center justify-end gap-2"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            {/* Label tooltip */}
            <span
              className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ color: '#4A5568', fontSize: 10, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}
            >
              {sec.label.toUpperCase()}
            </span>
            {/* Dot */}
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: activeSection === sec.id ? 8 : 4,
                height: activeSection === sec.id ? 8 : 4,
                background: activeSection === sec.id ? '#F59E0B' : '#2A3038',
                boxShadow: activeSection === sec.id ? '0 0 8px rgba(245,158,11,0.6)' : 'none',
              }}
            />
          </button>
        ))}

        {/* Scroll progress line */}
        <div
          className="absolute left-1/2 top-0 bottom-0 -z-10"
          style={{
            width: 1,
            background: '#1A2530',
            transform: 'translateX(3px)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: `${scrollProgress * 100}%`,
              background: 'linear-gradient(to bottom, #F59E0B80, transparent)',
              transition: 'height 0.1s linear',
            }}
          />
        </div>
      </nav>

      {/* Mobile: hamburger + bottom sheet menu */}
      <button
        className="fixed top-5 right-5 z-50 md:hidden flex flex-col gap-1.5 pointer-events-auto"
        style={{ background: 'rgba(13,14,16,0.7)', border: '1px solid #1A2530', padding: '10px 12px', cursor: 'pointer' }}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 20, height: 1.5, background: '#8B9095' }}
            animate={
              menuOpen
                ? i === 1 ? { opacity: 0 }
                  : i === 0 ? { rotate: 45, y: 4 }
                  : { rotate: -45, y: -4 }
                : { rotate: 0, y: 0, opacity: 1 }
            }
            transition={{ duration: 0.22 }}
          />
        ))}
      </button>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(13,14,16,0.85)' }}
              onClick={() => setMenuOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              className="relative z-10"
              style={{ background: '#0D0E10', border: '1px solid #1A2530', borderBottom: 'none' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex justify-between items-center px-5 pt-5 pb-3">
                <span className="font-mono text-xs tracking-industrial" style={{ color: '#3A4048' }}>
                  NAVIGATE
                </span>
                <button onClick={() => setMenuOpen(false)} style={{ color: '#3A4048', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                  ✕
                </button>
              </div>
              <div className="industrial-line" />
              <div className="px-5 py-4 flex flex-col gap-0">
                {NAV_SECTIONS.map((sec, i) => (
                  <motion.button
                    key={sec.id}
                    className="text-left py-3.5 font-display font-semibold pointer-events-auto"
                    style={{
                      fontSize: 22,
                      color: activeSection === sec.id ? '#F59E0B' : '#ECEEF0',
                      background: 'none',
                      border: 'none',
                      borderBottom: i < NAV_SECTIONS.length - 1 ? '1px solid #0D1014' : 'none',
                      cursor: 'pointer',
                    }}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    onClick={() => scrollTo(sec.scroll)}
                  >
                    <span className="font-mono text-xs mr-3" style={{ color: '#2A3038' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {sec.label}
                  </motion.button>
                ))}
              </div>
              <div className="px-5 pb-8 pt-2">
                <div className="font-mono text-xs" style={{ color: '#1A2530' }}>
                  PARAFOUR SYSTEMS — P4-SFCP
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
