'use client'

import { useRef } from 'react'
import * as THREE from 'three'

export default function FloorPlane() {
  return (
    <group>
      {/* Main floor — dark polished concrete */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.55, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#0D0F11"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Subtle floor grid lines */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.545, 0]}
      >
        <planeGeometry args={[10, 10, 10, 10]} />
        <meshBasicMaterial
          color="#1A2530"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Platform / plinth under dispenser */}
      <mesh
        position={[0, -1.52, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[1.1, 0.06, 0.65]} />
        <meshStandardMaterial
          color="#16191C"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Platform edge strip — amber accent line */}
      <mesh position={[0, -1.49, 0.325]}>
        <boxGeometry args={[1.1, 0.01, 0.01]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh position={[0, -1.49, -0.325]}>
        <boxGeometry args={[1.1, 0.01, 0.01]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}
