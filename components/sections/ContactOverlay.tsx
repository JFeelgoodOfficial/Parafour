'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ContactOverlayProps {
  scrollProgress: number
  sections: Record<string, { start: number; end: number }>
}

const TRUST_MARKS = [
  { icon: '◈', label: 'OIML Certified Metering' },
  { icon: '◉', label: 'ATEX Zone 1 Rated' },
  { icon: '◆', label: 'IP54 Weather Protection' },
  { icon: '⬡', label: '5-Year Warranty Available' },
]

export default function ContactOverlay({ scrollProgress, sections }: ContactOverlayProps) {
  const [entered, setEntered] = useState(false)
  const [formState, setFormState] = useState({ name: '', company: '', email: '', message: '', sent: false })
  const [submitting, setSubmitting] = useState(false)

  const sectionProgress = Math.max(
    0,
    Math.min(1, (scrollProgress - sections.contact.start) / (sections.contact.end - sections.contact.start))
  )

  useEffect(() => {
    if (sectionProgress > 0.05 && !entered) setEntered(true)
  }, [sectionProgress, entered])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setFormState((s) => ({ ...s, sent: true }))
    setSubmitting(false)
  }

  const inputStyle = {
    background: 'rgba(26,28,31,0.8)',
    border: '1px solid #1A2530',
    color: '#ECEEF0',
    padding: '11px 13px',
    width: '100%',
    fontFamily: 'IBM Plex Sans',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties

  return (
    <div id="contact" className="absolute inset-0 flex flex-col overflow-y-auto">
      <div className="min-h-full flex flex-col justify-center px-5 md:px-10 py-10 md:py-12">

        {/* Header */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={entered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <div className="font-mono text-xs tracking-industrial uppercase mb-2" style={{ color: '#F59E0B' }}>
            05 — Get In Touch
          </div>
          <h2
            className="font-display font-bold leading-none"
            style={{ fontSize: 'clamp(26px, 4.5vw, 52px)', color: '#ECEEF0' }}
          >
            Ready to Upgrade
            <br />
            <span style={{ color: '#F59E0B' }}>Your Operation?</span>
          </h2>
          <p className="font-body mt-2" style={{ fontSize: 14, color: '#4A5568', maxWidth: 380 }}>
            Talk to our team about specification, pricing, or installation for your site.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 max-w-2xl">

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={entered ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            {formState.sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'rgba(13,14,16,0.9)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  padding: '24px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
                <div className="font-display font-bold mb-2" style={{ fontSize: 20, color: '#F59E0B' }}>
                  Message Received
                </div>
                <p className="font-body" style={{ fontSize: 13, color: '#8B9095' }}>
                  Our team will be in touch within 1 business day.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                <input
                  required
                  placeholder="Your name"
                  value={formState.name}
                  onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#1A2530' }}
                />
                <input
                  required
                  placeholder="Company / Operation"
                  value={formState.company}
                  onChange={(e) => setFormState((s) => ({ ...s, company: e.target.value }))}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#1A2530' }}
                />
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={formState.email}
                  onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#1A2530' }}
                />
                <textarea
                  placeholder="Tell us about your installation needs…"
                  rows={3}
                  value={formState.message}
                  onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#1A2530' }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="font-display font-semibold tracking-wide uppercase pointer-events-auto transition-all duration-200"
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.2em',
                    padding: '13px 20px',
                    background: submitting ? 'rgba(245,158,11,0.08)' : 'transparent',
                    color: '#F59E0B',
                    border: '1.5px solid rgba(245,158,11,0.5)',
                    cursor: submitting ? 'wait' : 'pointer',
                    width: '100%',
                  }}
                >
                  {submitting ? 'Sending…' : 'Send Inquiry →'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Company info + trust marks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={entered ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Location */}
            <div
              style={{
                background: 'rgba(13,14,16,0.85)',
                border: '1px solid #1A2530',
                padding: '14px 16px',
              }}
            >
              <div className="font-mono text-xs mb-2" style={{ color: '#3A4048' }}>HEADQUARTERS</div>
              <div className="font-display font-semibold mb-0.5" style={{ fontSize: 16, color: '#ECEEF0' }}>
                Parafour Systems
              </div>
              <div className="font-body" style={{ fontSize: 13, color: '#4A5568' }}>
                Kyle, Texas, USA
              </div>
              <div className="industrial-line my-2" />
              <div className="font-body" style={{ fontSize: 12, color: '#3A4048' }}>
                Distributor inquiries welcome.
                <br />
                International shipping available.
              </div>
            </div>

            {/* Trust marks */}
            <div>
              <div className="font-mono text-xs mb-2" style={{ color: '#3A4048' }}>CERTIFICATIONS & STANDARDS</div>
              <div className="grid grid-cols-2 gap-1.5">
                {TRUST_MARKS.map((tm) => (
                  <div
                    key={tm.label}
                    className="flex items-center gap-2 px-2.5 py-2"
                    style={{ border: '1px solid #1A2530', background: 'rgba(13,14,16,0.6)' }}
                  >
                    <span className="text-xs" style={{ color: '#F59E0B' }}>{tm.icon}</span>
                    <span className="font-mono text-xs leading-tight" style={{ color: '#4A5568', fontSize: 10 }}>
                      {tm.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Closing statement */}
            <p
              className="font-display font-medium"
              style={{ fontSize: 14, color: '#2A3038', lineHeight: 1.5 }}
            >
              "Built for the demands of real operations. Trusted where precision and safety are non-negotiable."
            </p>
          </motion.div>
        </div>

        {/* Footer strip */}
        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          initial={{ opacity: 0 }}
          animate={entered ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="industrial-line flex-1" />
          <div className="font-mono text-xs sm:ml-6" style={{ color: '#1A2530', whiteSpace: 'nowrap' }}>
            © {new Date().getFullYear()} PARAFOUR SYSTEMS — ALL RIGHTS RESERVED
          </div>
        </motion.div>
      </div>
    </div>
  )
}
