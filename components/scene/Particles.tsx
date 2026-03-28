'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticlesProps {
  scrollProgress: number
}

export default function Particles({ scrollProgress }: ParticlesProps) {
  const dustRef = useRef<THREE.Points>(null)
  const mistRef = useRef<THREE.Points>(null)

  // Dust particles — ambient floaters
  const dustGeometry = useMemo(() => {
    const count = 180
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = Math.random() * 5 - 0.5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
      sizes[i] = Math.random() * 0.5 + 0.2
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [])

  // Mist particles — larger, cloudier
  const mistGeometry = useMemo(() => {
    const count = 40
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 6
      positions[i * 3 + 1] = Math.random() * 0.8 - 0.4
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (dustRef.current) {
      const positions = dustRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < 180; i++) {
        // Slow upward drift
        positions[i * 3 + 1] += 0.0005
        positions[i * 3 + 0] += Math.sin(time * 0.1 + i) * 0.0003
        // Wrap
        if (positions[i * 3 + 1] > 4.5) positions[i * 3 + 1] = -0.5
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true
      dustRef.current.rotation.y = time * 0.01
    }

    if (mistRef.current) {
      mistRef.current.material.opacity = scrollProgress < 0.2
        ? 0.04 + Math.sin(time * 0.3) * 0.01
        : 0.02
    }
  })

  return (
    <>
      {/* Fine dust particles */}
      <points ref={dustRef} geometry={dustGeometry}>
        <pointsMaterial
          size={0.02}
          color="#8B9095"
          transparent
          opacity={0.35}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Floor mist */}
      <points ref={mistRef} geometry={mistGeometry}>
        <pointsMaterial
          size={0.6}
          color="#1E3848"
          transparent
          opacity={0.04}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </>
  )
}
