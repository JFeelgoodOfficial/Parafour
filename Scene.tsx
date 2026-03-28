'use client'

import { Canvas } from '@react-three/fiber'
import { Environment, Fog, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Suspense, useEffect, useRef, useState } from 'react'
import { BlendFunction } from 'postprocessing'
import DispenserModel from './Scene/DispenserModel'
import SceneLights from './Scene/Lights'
import Particles from './Scene/Particles'
import CameraController from './Scene/CameraController'
import FloorPlane from './Scene/FloorPlane'

interface SceneProps {
  scrollProgress: number
  activeSection: string
  onReady: () => void
}

export default function Scene({ scrollProgress, activeSection, onReady }: SceneProps) {
  const [dpr, setDpr] = useState(1.5)

  return (
    <Canvas
      camera={{ position: [0, 0.5, 5.5], fov: 45, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
      }}
      dpr={dpr}
      shadows
      style={{ background: '#0D0E10' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#0D0E10', 1)
      }}
    >
      {/* Performance adaptive DPR */}
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(window.devicePixelRatio, 2))}
      />
      <AdaptiveDpr pixelated />

      {/* Fog for atmospheric depth */}
      <fog attach="fog" args={['#0D0E10', 12, 35]} />

      <Suspense fallback={null}>
        {/* Camera controlled by scroll */}
        <CameraController scrollProgress={scrollProgress} activeSection={activeSection} />

        {/* Scene Lighting */}
        <SceneLights scrollProgress={scrollProgress} />

        {/* Floor */}
        <FloorPlane />

        {/* Main 3D Dispenser */}
        <DispenserModel
          scrollProgress={scrollProgress}
          activeSection={activeSection}
          onReady={onReady}
        />

        {/* Ambient particles */}
        <Particles scrollProgress={scrollProgress} />

        {/* Post-processing */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.4}
            blendFunction={BlendFunction.ADD}
          />
          <Vignette
            offset={0.3}
            darkness={0.7}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
