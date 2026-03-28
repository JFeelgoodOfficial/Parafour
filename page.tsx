'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import Navigation from '@/components/ui/Navigation'
import LoadingScreen from '@/components/ui/LoadingScreen'
import HeroOverlay from '@/components/sections/HeroOverlay'
import ProductsOverlay from '@/components/sections/ProductsOverlay'
import SystemOverlay from '@/components/sections/SystemOverlay'
import ImpactOverlay from '@/components/sections/ImpactOverlay'
import ContactOverlay from '@/components/sections/ContactOverlay'

// Dynamic import to avoid SSR for Three.js
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false })

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const { scrollProgress, scrollY } = useScrollProgress()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200)
    return () => clearTimeout(timer)
  }, [])

  // Section breakpoints (0-1 scroll progress)
  // Total scroll height = 600vh → each 20% = 120vh
  const sections = {
    hero:     { start: 0,    end: 0.18 },
    products: { start: 0.18, end: 0.42 },
    system:   { start: 0.42, end: 0.62 },
    impact:   { start: 0.62, end: 0.82 },
    contact:  { start: 0.82, end: 1.0  },
  }

  const activeSection =
    scrollProgress < sections.hero.end     ? 'hero'
    : scrollProgress < sections.products.end ? 'products'
    : scrollProgress < sections.system.end   ? 'system'
    : scrollProgress < sections.impact.end   ? 'impact'
    : 'contact'

  return (
    <main className="relative">
      {/* Loading screen */}
      <LoadingScreen isLoaded={sceneReady} />

      {/* Fixed 3D Canvas */}
      <div id="scene-canvas">
        <Suspense fallback={null}>
          <Scene
            scrollProgress={scrollProgress}
            activeSection={activeSection}
            onReady={() => setSceneReady(true)}
          />
        </Suspense>
      </div>

      {/* Navigation */}
      <Navigation scrollProgress={scrollProgress} activeSection={activeSection} />

      {/* Scroll container — creates scroll height */}
      <div style={{ height: '600vh' }} className="relative pointer-events-none">

        {/* SECTION 1: Hero (0–20%) */}
        <div
          className="sticky top-0 h-screen pointer-events-none"
          style={{
            zIndex: 10,
            opacity: scrollProgress < sections.products.start ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          <HeroOverlay scrollProgress={scrollProgress} sections={sections} />
        </div>

        {/* SECTION 2: Products (20–42%) */}
        <div
          className="sticky top-0 h-screen"
          style={{
            zIndex: 10,
            opacity:
              scrollProgress >= sections.products.start - 0.03 &&
              scrollProgress <= sections.products.end + 0.03
                ? 1 : 0,
            transition: 'opacity 0.5s ease',
            pointerEvents: activeSection === 'products' ? 'auto' : 'none',
          }}
        >
          <ProductsOverlay scrollProgress={scrollProgress} sections={sections} />
        </div>

        {/* SECTION 3: System Intelligence (42–62%) */}
        <div
          className="sticky top-0 h-screen"
          style={{
            zIndex: 10,
            opacity:
              scrollProgress >= sections.system.start - 0.03 &&
              scrollProgress <= sections.system.end + 0.03
                ? 1 : 0,
            transition: 'opacity 0.5s ease',
            pointerEvents: activeSection === 'system' ? 'auto' : 'none',
          }}
        >
          <SystemOverlay scrollProgress={scrollProgress} sections={sections} />
        </div>

        {/* SECTION 4: Impact (62–82%) */}
        <div
          className="sticky top-0 h-screen"
          style={{
            zIndex: 10,
            opacity:
              scrollProgress >= sections.impact.start - 0.03 &&
              scrollProgress <= sections.impact.end + 0.03
                ? 1 : 0,
            transition: 'opacity 0.5s ease',
            pointerEvents: activeSection === 'impact' ? 'auto' : 'none',
          }}
        >
          <ImpactOverlay scrollProgress={scrollProgress} sections={sections} />
        </div>

        {/* SECTION 5: Contact (82–100%) */}
        <div
          className="sticky top-0 h-screen"
          style={{
            zIndex: 10,
            opacity: scrollProgress >= sections.contact.start - 0.03 ? 1 : 0,
            transition: 'opacity 0.5s ease',
            pointerEvents: activeSection === 'contact' ? 'auto' : 'none',
          }}
        >
          <ContactOverlay scrollProgress={scrollProgress} sections={sections} />
        </div>
      </div>

      {/* Global gradient vignette for cinematic feel */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(13,14,16,0.7) 100%)',
        }}
      />
    </main>
  )
}
