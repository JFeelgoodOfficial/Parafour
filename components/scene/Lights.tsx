'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SceneLightsProps {
  scrollProgress: number
}

export default function SceneLights({ scrollProgress }: SceneLightsProps) {
  const keyLightRef = useRef<THREE.SpotLight>(null)
  const fillLightRef = useRef<THREE.PointLight>(null)
  const rimLightRef = useRef<THREE.SpotLight>(null)
  const amberLightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Key light — slowly sweeps during hero
    if (keyLightRef.current && scrollProgress < 0.2) {
      keyLightRef.current.intensity = 6 + Math.sin(time * 0.4) * 0.5
    }

    // Amber screen glow pulses
    if (amberLightRef.current) {
      amberLightRef.current.intensity = 1.2 + Math.sin(time * 1.2) * 0.15
    }
  })

  return (
    <>
      {/* Ambient — very low, just barely visible in shadows */}
      <ambientLight intensity={0.08} color="#1A2530" />

      {/* Key light — primary dramatic overhead-front */}
      <spotLight
        ref={keyLightRef}
        position={[1, 6, 4]}
        target-position={[0, 0, 0]}
        angle={Math.PI / 8}
        penumbra={0.4}
        intensity={6}
        color="#D4E8F5"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.001}
      />

      {/* Rim light — strong back-left for silhouette */}
      <spotLight
        ref={rimLightRef}
        position={[-3, 4, -3]}
        target-position={[0, 0.5, 0]}
        angle={Math.PI / 6}
        penumbra={0.6}
        intensity={3.5}
        color="#7EB8D4"
        castShadow={false}
      />

      {/* Fill light — right side, low, warm */}
      <pointLight
        ref={fillLightRef}
        position={[3, 0.5, 2]}
        intensity={0.8}
        color="#F5E8C8"
        distance={8}
        decay={2}
      />

      {/* Floor bounce — subtle upward fill */}
      <pointLight
        position={[0, -1.5, 1]}
        intensity={0.3}
        color="#1E3040"
        distance={5}
        decay={2}
      />

      {/* Amber glow — simulates LCD/display screen emission */}
      <pointLight
        ref={amberLightRef}
        position={[0.05, 0.9, 0.5]}
        intensity={1.2}
        color="#F5960A"
        distance={2.5}
        decay={3}
      />

      {/* Cold ceiling strip — warehouse feel */}
      <rectAreaLight
        position={[0, 7, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={3}
        height={6}
        intensity={1.5}
        color="#C8DCF0"
      />

      {/* Ground plane receives shadow */}
      <directionalLight
        position={[2, 8, 2]}
        intensity={0.4}
        color="#B0C8D4"
        castShadow={false}
      />
    </>
  )
}
