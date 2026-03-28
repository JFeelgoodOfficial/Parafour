'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface DispenserModelProps {
  scrollProgress: number
  activeSection: string
  onReady?: () => void
}

// ─── Material Definitions ───────────────────────────────────────────
const MAT = {
  bodySteel: new THREE.MeshStandardMaterial({
    color: '#2C2F33',
    roughness: 0.35,
    metalness: 0.75,
  }),
  panelDark: new THREE.MeshStandardMaterial({
    color: '#1C1E21',
    roughness: 0.5,
    metalness: 0.6,
  }),
  chrome: new THREE.MeshStandardMaterial({
    color: '#9AA5B1',
    roughness: 0.1,
    metalness: 0.95,
  }),
  screwMetal: new THREE.MeshStandardMaterial({
    color: '#7A8490',
    roughness: 0.2,
    metalness: 0.9,
  }),
  screenGlass: new THREE.MeshStandardMaterial({
    color: '#0A0C0E',
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9,
  }),
  screenAmber: new THREE.MeshStandardMaterial({
    color: '#F59E0B',
    emissive: '#F59E0B',
    emissiveIntensity: 0.8,
    roughness: 0.5,
    metalness: 0,
    transparent: true,
    opacity: 0.95,
  }),
  screenAmberDim: new THREE.MeshStandardMaterial({
    color: '#4A3010',
    emissive: '#F59E0B',
    emissiveIntensity: 0.25,
    roughness: 0.5,
    metalness: 0,
  }),
  screenBlue: new THREE.MeshStandardMaterial({
    color: '#3B82F6',
    emissive: '#3B82F6',
    emissiveIntensity: 0.6,
    roughness: 0.5,
    metalness: 0,
    transparent: true,
    opacity: 0.9,
  }),
  ledGreen: new THREE.MeshStandardMaterial({
    color: '#22C55E',
    emissive: '#22C55E',
    emissiveIntensity: 1.2,
    roughness: 0.3,
    metalness: 0,
  }),
  ledRed: new THREE.MeshStandardMaterial({
    color: '#EF4444',
    emissive: '#EF4444',
    emissiveIntensity: 1.0,
    roughness: 0.3,
    metalness: 0,
  }),
  hoseBlack: new THREE.MeshStandardMaterial({
    color: '#1A1A1A',
    roughness: 0.9,
    metalness: 0.1,
  }),
  pipeCopper: new THREE.MeshStandardMaterial({
    color: '#7C4F2F',
    roughness: 0.3,
    metalness: 0.8,
  }),
  valveBrass: new THREE.MeshStandardMaterial({
    color: '#B8862C',
    roughness: 0.2,
    metalness: 0.85,
  }),
  wireRed: new THREE.MeshStandardMaterial({
    color: '#DC2626',
    emissive: '#7F1D1D',
    emissiveIntensity: 0.3,
    roughness: 0.8,
    metalness: 0,
  }),
  wireYellow: new THREE.MeshStandardMaterial({
    color: '#CA8A04',
    emissive: '#451A03',
    emissiveIntensity: 0.2,
    roughness: 0.8,
    metalness: 0,
  }),
  wireBlue: new THREE.MeshStandardMaterial({
    color: '#1D4ED8',
    emissive: '#172554',
    emissiveIntensity: 0.2,
    roughness: 0.8,
    metalness: 0,
  }),
  whiteLabel: new THREE.MeshStandardMaterial({
    color: '#D4D8DC',
    roughness: 0.9,
    metalness: 0,
  }),
  rubber: new THREE.MeshStandardMaterial({
    color: '#111213',
    roughness: 1.0,
    metalness: 0,
  }),
  sealRing: new THREE.MeshStandardMaterial({
    color: '#F97316',
    roughness: 0.7,
    metalness: 0,
  }),
}

// ─── Sub-components ──────────────────────────────────────────────────

// Corner screw bolts
function Screw({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh material={MAT.screwMetal}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
      </mesh>
      <mesh position={[0, 0, 0]} material={MAT.screwMetal}>
        <cylinderGeometry args={[0.006, 0.006, 0.015, 8]} />
      </mesh>
    </group>
  )
}

// Flow meter gauge face
function MeterDial({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Dial face */}
      <mesh material={MAT.panelDark}>
        <cylinderGeometry args={[0.07, 0.07, 0.012, 32]} />
      </mesh>
      {/* Bezel ring */}
      <mesh material={MAT.chrome}>
        <torusGeometry args={[0.07, 0.008, 8, 32]} />
      </mesh>
      {/* Tick marks (simplified as a slightly smaller disc) */}
      <mesh position={[0, 0.007, 0]} material={MAT.screenAmberDim}>
        <ringGeometry args={[0.055, 0.065, 32, 1, 0, Math.PI * 1.6]} />
      </mesh>
      {/* Needle */}
      <mesh position={[0.02, 0.009, 0]} rotation={[0, 0, -0.4]} material={MAT.screenAmber}>
        <boxGeometry args={[0.05, 0.004, 0.002]} />
      </mesh>
      {/* Center pin */}
      <mesh position={[0, 0.009, 0]} material={MAT.chrome}>
        <cylinderGeometry args={[0.005, 0.005, 0.005, 8]} />
      </mesh>
    </group>
  )
}

// Digital 7-segment display tile
function DigitalDisplay({
  position,
  w = 0.22,
  h = 0.065,
  label = true,
}: {
  position: [number, number, number]
  w?: number
  h?: number
  label?: boolean
}) {
  return (
    <group position={position}>
      {/* Display housing */}
      <mesh material={MAT.panelDark}>
        <boxGeometry args={[w + 0.02, h + 0.025, 0.015]} />
      </mesh>
      {/* Screen surface */}
      <mesh position={[0, 0, 0.009]} material={MAT.screenGlass}>
        <boxGeometry args={[w, h, 0.002]} />
      </mesh>
      {/* Digit rows — emissive amber segments */}
      <mesh position={[0, 0.005, 0.011]} material={MAT.screenAmber}>
        <boxGeometry args={[w * 0.88, h * 0.28, 0.001]} />
      </mesh>
      <mesh position={[0, -0.01, 0.011]} material={MAT.screenAmberDim}>
        <boxGeometry args={[w * 0.72, h * 0.12, 0.001]} />
      </mesh>
      {/* Decimal point dots */}
      {[-.06, -.01, .04, .09].map((x, i) => (
        <mesh key={i} position={[x, 0.005, 0.0115]} material={i < 3 ? MAT.screenAmber : MAT.screenAmberDim}>
          <boxGeometry args={[0.01, h * 0.25, 0.001]} />
        </mesh>
      ))}
    </group>
  )
}

// Keypad button
function KeypadButton({
  position,
  color = MAT.panelDark,
}: {
  position: [number, number, number]
  color?: THREE.MeshStandardMaterial
}) {
  return (
    <mesh position={position} material={color}>
      <boxGeometry args={[0.028, 0.028, 0.012]} />
    </mesh>
  )
}

// Hose nozzle cradle
function NozzleCradle({ position, side = 1 }: { position: [number, number, number]; side?: number }) {
  return (
    <group position={position} scale={[side, 1, 1]}>
      {/* Cradle mount */}
      <mesh material={MAT.bodySteel}>
        <boxGeometry args={[0.04, 0.12, 0.06]} />
      </mesh>
      {/* Hose loop */}
      <mesh position={[0.02, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={MAT.hoseBlack}>
        <torusGeometry args={[0.045, 0.012, 8, 16, Math.PI]} />
      </mesh>
      {/* Nozzle tip */}
      <mesh position={[0.02, -0.08, 0.04]} material={MAT.chrome}>
        <cylinderGeometry args={[0.016, 0.012, 0.08, 12]} />
      </mesh>
      {/* Safety grip ring */}
      <mesh position={[0.02, -0.05, 0.04]} material={MAT.rubber}>
        <torusGeometry args={[0.018, 0.006, 8, 16]} />
      </mesh>
    </group>
  )
}

// Bottom valve assembly
function ValveAssembly({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main valve body */}
      <mesh material={MAT.valveBrass}>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 12]} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]} material={MAT.chrome}>
        <boxGeometry args={[0.12, 0.012, 0.018]} />
      </mesh>
      {/* Pipe in/out */}
      <mesh position={[0, -0.09, 0]} material={MAT.pipeCopper}>
        <cylinderGeometry args={[0.022, 0.022, 0.12, 12]} />
      </mesh>
      <mesh position={[0, 0.09, 0]} material={MAT.pipeCopper}>
        <cylinderGeometry args={[0.022, 0.022, 0.12, 12]} />
      </mesh>
      {/* Seal rings */}
      <mesh position={[0, 0.05, 0]} material={MAT.sealRing}>
        <torusGeometry args={[0.046, 0.004, 8, 20]} />
      </mesh>
      <mesh position={[0, -0.05, 0]} material={MAT.sealRing}>
        <torusGeometry args={[0.046, 0.004, 8, 20]} />
      </mesh>
    </group>
  )
}

// Wire bundle
function WireBundle({
  from,
  to,
  mat,
  radius = 0.008,
}: {
  from: [number, number, number]
  to: [number, number, number]
  mat: THREE.MeshStandardMaterial
  radius?: number
}) {
  const start = new THREE.Vector3(...from)
  const end = new THREE.Vector3(...to)
  const dir = end.clone().sub(start)
  const length = dir.length()
  const mid = start.clone().add(end).multiplyScalar(0.5)
  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  const euler = new THREE.Euler().setFromQuaternion(quaternion)

  return (
    <mesh
      position={[mid.x, mid.y, mid.z]}
      rotation={[euler.x, euler.y, euler.z]}
      material={mat}
    >
      <cylinderGeometry args={[radius, radius, length, 6]} />
    </mesh>
  )
}

// ─── Main Dispenser Component ────────────────────────────────────────
export default function DispenserModel({ scrollProgress, activeSection, onReady }: DispenserModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const screenRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.PointLight>(null)

  useEffect(() => {
    if (onReady) {
      const timer = setTimeout(onReady, 600)
      return () => clearTimeout(timer)
    }
  }, [onReady])

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime

    // Subtle idle sway
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      scrollProgress < 0.18
        ? Math.sin(time * 0.15) * 0.06   // hero: gentle orbit
        : scrollProgress < 0.45
        ? -0.22                            // products: angled for panel view
        : scrollProgress < 0.65
        ? 0.1                              // system: slight angle
        : scrollProgress < 0.85
        ? 0.35                             // impact: dramatic angle
        : 0.12,                            // contact: calm
      0.025
    )

    // Screen brightness pulse
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.8 + Math.sin(time * 0.8) * 0.08
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.05, 0]}>

      {/* ── MAIN CABINET BODY ── */}
      {/* Core housing — steel-painted alloy casing */}
      <mesh castShadow receiveShadow material={MAT.bodySteel}>
        <boxGeometry args={[0.48, 1.62, 0.36]} />
      </mesh>

      {/* Front panel recess */}
      <mesh position={[0, 0.1, 0.179]} castShadow material={MAT.panelDark}>
        <boxGeometry args={[0.38, 1.1, 0.01]} />
      </mesh>

      {/* Side panels — slightly lighter for differentiation */}
      <mesh position={[0.245, 0.1, 0]} material={MAT.bodySteel}>
        <boxGeometry args={[0.005, 1.62, 0.36]} />
      </mesh>
      <mesh position={[-0.245, 0.1, 0]} material={MAT.bodySteel}>
        <boxGeometry args={[0.005, 1.62, 0.36]} />
      </mesh>

      {/* Top cap — slightly wider overhang */}
      <mesh position={[0, 0.825, 0]} castShadow material={MAT.chrome}>
        <boxGeometry args={[0.5, 0.04, 0.38]} />
      </mesh>

      {/* Top vent grille (horizontal strips) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, 0.82, -0.06 + i * 0.04]} material={MAT.panelDark}>
          <boxGeometry args={[0.38, 0.006, 0.008]} />
        </mesh>
      ))}

      {/* Brand badge area */}
      <mesh position={[0, 0.76, 0.182]} material={MAT.chrome}>
        <boxGeometry args={[0.18, 0.03, 0.003]} />
      </mesh>
      <mesh position={[0, 0.76, 0.183]} material={MAT.panelDark}>
        <boxGeometry args={[0.16, 0.018, 0.002]} />
      </mesh>
      {/* "PARAFOUR" label as flat emissive strip */}
      <mesh position={[0, 0.76, 0.184]} material={MAT.screenBlue}>
        <boxGeometry args={[0.14, 0.008, 0.001]} />
      </mesh>

      {/* ── MAIN DISPLAY ASSEMBLY ── */}
      {/* Primary transaction display */}
      <DigitalDisplay position={[0, 0.6, 0.184]} w={0.28} h={0.085} />

      {/* Sub-display row: LPG KG */}
      <DigitalDisplay position={[-0.07, 0.48, 0.184]} w={0.14} h={0.052} />

      {/* Sub-display row: TOTAL */}
      <DigitalDisplay position={[0.09, 0.48, 0.184]} w={0.14} h={0.052} />

      {/* Flow meters */}
      <MeterDial position={[-0.1, 0.35, 0.182]} rotation={[0, 0, 0]} />
      <MeterDial position={[0.1, 0.35, 0.182]} rotation={[0, 0, 0]} />

      {/* ── CONTROL PANEL AREA ── */}
      {/* Keypad surround */}
      <mesh position={[0, 0.16, 0.181]} material={MAT.panelDark}>
        <boxGeometry args={[0.22, 0.12, 0.008]} />
      </mesh>
      {/* 12 keys in 3×4 grid */}
      {[0, 1, 2].flatMap((row) =>
        [0, 1, 2, 3].map((col) => (
          <KeypadButton
            key={`${row}-${col}`}
            position={[
              -0.077 + col * 0.05,
              0.22 - row * 0.036,
              0.187,
            ]}
            color={row === 2 && col === 3 ? MAT.screenAmber : MAT.bodySteel}
          />
        ))
      )}

      {/* Status LED strip */}
      <mesh position={[0.155, 0.66, 0.182]} material={MAT.panelDark}>
        <boxGeometry args={[0.02, 0.16, 0.006]} />
      </mesh>
      {[0.72, 0.68, 0.64, 0.60].map((y, i) => (
        <mesh key={i} position={[0.155, y, 0.185]}
          material={i === 0 ? MAT.ledGreen : i === 3 ? MAT.ledRed : MAT.panelDark}>
          <sphereGeometry args={[0.005, 8, 8]} />
        </mesh>
      ))}

      {/* Emergency stop button */}
      <mesh position={[-0.155, 0.09, 0.185]} material={MAT.ledRed}>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 20]} />
      </mesh>
      <mesh position={[-0.155, 0.09, 0.181]} material={MAT.panelDark}>
        <ringGeometry args={[0.026, 0.034, 20]} />
      </mesh>

      {/* ── HOSE / NOZZLE CRADLES ── */}
      <NozzleCradle position={[0.27, 0.2, 0.06]} side={1} />
      <NozzleCradle position={[-0.27, 0.2, 0.06]} side={-1} />

      {/* ── LOWER SECTION — METERING & PLUMBING ── */}
      {/* Lower panel */}
      <mesh position={[0, -0.55, 0.179]} material={MAT.panelDark}>
        <boxGeometry args={[0.38, 0.42, 0.005]} />
      </mesh>

      {/* Flow measurement chamber */}
      <mesh position={[0, -0.55, 0.05]} material={MAT.bodySteel}>
        <cylinderGeometry args={[0.07, 0.07, 0.32, 16]} />
      </mesh>
      <mesh position={[0, -0.55, 0.05]} material={MAT.chrome}>
        <torusGeometry args={[0.07, 0.006, 8, 24]} />
      </mesh>

      {/* Valve assemblies */}
      <ValveAssembly position={[-0.14, -0.62, 0.05]} />
      <ValveAssembly position={[0.14, -0.62, 0.05]} />

      {/* Inlet pipe at base */}
      <mesh position={[0, -0.82, 0.05]} material={MAT.pipeCopper}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 12]} />
      </mesh>

      {/* ── INTERNAL WIRING (VISIBLE PANEL) ── */}
      {/* Wire conduit back plate */}
      <mesh position={[0, 0.05, -0.15]} material={MAT.panelDark}>
        <boxGeometry args={[0.38, 0.8, 0.02]} />
      </mesh>

      {/* Wire bundles — color-coded harness */}
      <WireBundle from={[-0.08, 0.35, -0.12]} to={[-0.08, -0.2, -0.12]} mat={MAT.wireRed} />
      <WireBundle from={[-0.04, 0.35, -0.12]} to={[-0.04, -0.2, -0.12]} mat={MAT.wireYellow} />
      <WireBundle from={[0.02, 0.35, -0.12]} to={[0.02, -0.2, -0.12]} mat={MAT.wireBlue} />
      <WireBundle from={[0.06, 0.35, -0.12]} to={[0.06, -0.2, -0.12]} mat={MAT.wireRed} />
      {/* Horizontal cable ties */}
      {[0.2, 0.05, -0.1].map((y, i) => (
        <mesh key={i} position={[0, y, -0.118]} material={MAT.whiteLabel}>
          <boxGeometry args={[0.2, 0.006, 0.004]} />
        </mesh>
      ))}

      {/* ── CORNER HARDWARE ── */}
      {/* Top corner bolts */}
      <Screw position={[0.225, 0.8, 0.185]} />
      <Screw position={[-0.225, 0.8, 0.185]} />
      <Screw position={[0.225, -0.78, 0.185]} />
      <Screw position={[-0.225, -0.78, 0.185]} />

      {/* Side panel bolts */}
      {[0.4, 0.0, -0.4].map((y, i) => (
        <Screw key={`r-${i}`} position={[0.248, y, 0.0]} />
      ))}
      {[0.4, 0.0, -0.4].map((y, i) => (
        <Screw key={`l-${i}`} position={[-0.248, y, 0.0]} />
      ))}

      {/* ── BASE SECTION ── */}
      <mesh position={[0, -0.86, 0]} material={MAT.chrome}>
        <boxGeometry args={[0.52, 0.04, 0.4]} />
      </mesh>
      {/* Base ventilation */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.1 + i * 0.04, -0.84, 0.202]} material={MAT.panelDark}>
          <boxGeometry args={[0.008, 0.025, 0.004]} />
        </mesh>
      ))}

      {/* Model number plate */}
      <mesh position={[0, -0.78, 0.183]} material={MAT.whiteLabel}>
        <boxGeometry args={[0.12, 0.022, 0.002]} />
      </mesh>
      <mesh position={[0, -0.78, 0.184]} material={MAT.screenAmberDim}>
        <boxGeometry args={[0.1, 0.01, 0.001]} />
      </mesh>

      {/* ── AMBIENT GLOW SOURCES ── */}
      {/* Screen emission light */}
      <pointLight
        ref={glowRef}
        position={[0, 0.6, 0.5]}
        color="#F59E0B"
        intensity={1.0}
        distance={2}
        decay={3}
      />
      {/* Lower panel blue accent */}
      <pointLight
        position={[0, -0.4, 0.4]}
        color="#3B82F6"
        intensity={0.3}
        distance={1.5}
        decay={3}
      />
    </group>
  )
}
