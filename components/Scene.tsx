'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Suspense, useEffect, useRef, useMemo, useState } from 'react'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

interface SceneProps {
  scrollProgress: number
  activeSection: string
  onReady: () => void
}

// ─── CAMERA WAYPOINTS ────────────────────────────────────────────────
const WP = [
  { pos: new THREE.Vector3(0, 0.8, 5.5),    tgt: new THREE.Vector3(0, 0.2, 0) },
  { pos: new THREE.Vector3(1.2, 0.7, 3.2),  tgt: new THREE.Vector3(0, 0.6, 0) },
  { pos: new THREE.Vector3(0.1, 1.2, 2.4),  tgt: new THREE.Vector3(0, 1.1, 0) },
  { pos: new THREE.Vector3(-1.0, 0.0, 2.8), tgt: new THREE.Vector3(0, -0.2, 0) },
  { pos: new THREE.Vector3(-1.5, 0.9, 3.8), tgt: new THREE.Vector3(0, 0.3, 0) },
  { pos: new THREE.Vector3(2.0, 1.2, 4.5),  tgt: new THREE.Vector3(0, 0.2, 0) },
  { pos: new THREE.Vector3(0.8, 0.5, 4.2),  tgt: new THREE.Vector3(0, 0.1, 0) },
]

function eio(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

// ─── CAMERA CONTROLLER ───────────────────────────────────────────────
function CameraCtrl({ sp }: { sp: number }) {
  const { camera } = useThree()
  const posRef = useRef(new THREE.Vector3(0, 0.8, 5.5))
  const tgtRef = useRef(new THREE.Vector3(0, 0.2, 0))

  useFrame((_, delta) => {
    const p = sp
    if (p < 0.18) {
      const t = p / 0.18
      posRef.current.set(Math.sin(t * 0.4) * 0.5, 0.8 + t * 0.1, 5.5 - t * 0.3)
      tgtRef.current.set(0, 0.2, 0)
    } else if (p < 0.28) {
      const e = eio((p - 0.18) / 0.10)
      posRef.current.lerpVectors(WP[0].pos, WP[1].pos, e)
      tgtRef.current.lerpVectors(WP[0].tgt, WP[1].tgt, e)
    } else if (p < 0.34) {
      posRef.current.copy(WP[1].pos); tgtRef.current.copy(WP[1].tgt)
    } else if (p < 0.42) {
      const e = eio((p - 0.34) / 0.08)
      posRef.current.lerpVectors(WP[1].pos, WP[2].pos, e)
      tgtRef.current.lerpVectors(WP[1].tgt, WP[2].tgt, e)
    } else if (p < 0.52) {
      const e = eio((p - 0.42) / 0.10)
      posRef.current.lerpVectors(WP[2].pos, WP[4].pos, e)
      tgtRef.current.lerpVectors(WP[2].tgt, WP[4].tgt, e)
    } else if (p < 0.62) {
      posRef.current.copy(WP[4].pos); tgtRef.current.copy(WP[4].tgt)
    } else if (p < 0.72) {
      const e = eio((p - 0.62) / 0.10)
      posRef.current.lerpVectors(WP[4].pos, WP[5].pos, e)
      tgtRef.current.lerpVectors(WP[4].tgt, WP[5].tgt, e)
    } else if (p < 0.82) {
      posRef.current.copy(WP[5].pos); tgtRef.current.copy(WP[5].tgt)
    } else {
      const e = eio(Math.min((p - 0.82) / 0.18, 1))
      posRef.current.lerpVectors(WP[5].pos, WP[6].pos, e)
      tgtRef.current.lerpVectors(WP[5].tgt, WP[6].tgt, e)
    }
    camera.position.lerp(posRef.current, Math.min(delta * 3.5, 0.12))
    camera.lookAt(tgtRef.current)
  })
  return null
}

// ─── LIGHTS ──────────────────────────────────────────────────────────
function SceneLights({ sp }: { sp: number }) {
  const keyRef = useRef<THREE.SpotLight>(null)
  const amberRef = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (keyRef.current && sp < 0.2) keyRef.current.intensity = 6 + Math.sin(t * 0.4) * 0.5
    if (amberRef.current) amberRef.current.intensity = 1.2 + Math.sin(t * 1.2) * 0.15
  })
  return (
    <>
      <ambientLight intensity={0.08} color="#1A2530" />
      <spotLight ref={keyRef} position={[1, 6, 4]} angle={Math.PI / 8} penumbra={0.4}
        intensity={6} color="#D4E8F5" castShadow shadow-mapSize={[2048, 2048] as [number, number]} shadow-bias={-0.001} />
      <spotLight position={[-3, 4, -3]} angle={Math.PI / 6} penumbra={0.6} intensity={3.5} color="#7EB8D4" />
      <pointLight position={[3, 0.5, 2]} intensity={0.8} color="#F5E8C8" distance={8} decay={2} />
      <pointLight position={[0, -1.5, 1]} intensity={0.3} color="#1E3040" distance={5} decay={2} />
      <pointLight ref={amberRef} position={[0.05, 0.9, 0.5]} intensity={1.2} color="#F5960A" distance={2.5} decay={3} />
      <rectAreaLight position={[0, 7, 0]} rotation={[-Math.PI / 2, 0, 0]} width={3} height={6} intensity={1.5} color="#C8DCF0" />
    </>
  )
}

// ─── PARTICLES ───────────────────────────────────────────────────────
function Particles({ sp }: { sp: number }) {
  const dustRef = useRef<THREE.Points>(null)
  const mistRef = useRef<THREE.Points>(null)

  const dustGeo = useMemo(() => {
    const count = 180
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = Math.random() * 5 - 0.5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const mistGeo = useMemo(() => {
    const count = 40
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6
      pos[i * 3 + 1] = Math.random() * 0.8 - 0.4
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (dustRef.current) {
      const p = dustRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < 180; i++) {
        p[i * 3 + 1] += 0.0005
        p[i * 3] += Math.sin(t * 0.1 + i) * 0.0003
        if (p[i * 3 + 1] > 4.5) p[i * 3 + 1] = -0.5
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true
      dustRef.current.rotation.y = t * 0.01
    }
    if (mistRef.current) {
      (mistRef.current.material as THREE.PointsMaterial).opacity =
        sp < 0.2 ? 0.04 + Math.sin(t * 0.3) * 0.01 : 0.02
    }
  })

  return (
    <>
      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial size={0.02} color="#8B9095" transparent opacity={0.35}
          sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points ref={mistRef} geometry={mistGeo}>
        <pointsMaterial size={0.6} color="#1E3848" transparent opacity={0.04}
          sizeAttenuation depthWrite={false} />
      </points>
    </>
  )
}

// ─── FLOOR ───────────────────────────────────────────────────────────
function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0D0F11" roughness={0.6} metalness={0.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.545, 0]}>
        <planeGeometry args={[10, 10, 10, 10]} />
        <meshBasicMaterial color="#1A2530" wireframe transparent opacity={0.08} />
      </mesh>
      <mesh position={[0, -1.52, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.1, 0.06, 0.65]} />
        <meshStandardMaterial color="#16191C" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, -1.49, 0.325]}>
        <boxGeometry args={[1.1, 0.01, 0.01]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// ─── DISPENSER MATERIALS ─────────────────────────────────────────────
const mBody  = new THREE.MeshStandardMaterial({ color: '#2C2F33', roughness: 0.35, metalness: 0.75 })
const mPanel = new THREE.MeshStandardMaterial({ color: '#1C1E21', roughness: 0.5,  metalness: 0.6  })
const mChrom = new THREE.MeshStandardMaterial({ color: '#9AA5B1', roughness: 0.1,  metalness: 0.95 })
const mScrew = new THREE.MeshStandardMaterial({ color: '#7A8490', roughness: 0.2,  metalness: 0.9  })
const mGlass = new THREE.MeshStandardMaterial({ color: '#0A0C0E', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.9 })
const mAmber = new THREE.MeshStandardMaterial({ color: '#F59E0B', emissive: new THREE.Color('#F59E0B'), emissiveIntensity: 0.8, roughness: 0.5, metalness: 0, transparent: true, opacity: 0.95 })
const mAmberD= new THREE.MeshStandardMaterial({ color: '#4A3010', emissive: new THREE.Color('#F59E0B'), emissiveIntensity: 0.25, roughness: 0.5, metalness: 0 })
const mBlue  = new THREE.MeshStandardMaterial({ color: '#3B82F6', emissive: new THREE.Color('#3B82F6'), emissiveIntensity: 0.6, roughness: 0.5, metalness: 0, transparent: true, opacity: 0.9 })
const mLedG  = new THREE.MeshStandardMaterial({ color: '#22C55E', emissive: new THREE.Color('#22C55E'), emissiveIntensity: 1.2, roughness: 0.3, metalness: 0 })
const mLedR  = new THREE.MeshStandardMaterial({ color: '#EF4444', emissive: new THREE.Color('#EF4444'), emissiveIntensity: 1.0, roughness: 0.3, metalness: 0 })
const mHose  = new THREE.MeshStandardMaterial({ color: '#1A1A1A', roughness: 0.9, metalness: 0.1 })
const mPipe  = new THREE.MeshStandardMaterial({ color: '#7C4F2F', roughness: 0.3, metalness: 0.8 })
const mBrass = new THREE.MeshStandardMaterial({ color: '#B8862C', roughness: 0.2, metalness: 0.85 })
const mWireR = new THREE.MeshStandardMaterial({ color: '#DC2626', emissive: new THREE.Color('#7F1D1D'), emissiveIntensity: 0.3, roughness: 0.8, metalness: 0 })
const mWireY = new THREE.MeshStandardMaterial({ color: '#CA8A04', emissive: new THREE.Color('#451A03'), emissiveIntensity: 0.2, roughness: 0.8, metalness: 0 })
const mWireB = new THREE.MeshStandardMaterial({ color: '#1D4ED8', emissive: new THREE.Color('#172554'), emissiveIntensity: 0.2, roughness: 0.8, metalness: 0 })
const mLabel = new THREE.MeshStandardMaterial({ color: '#D4D8DC', roughness: 0.9, metalness: 0 })
const mSeal  = new THREE.MeshStandardMaterial({ color: '#F97316', roughness: 0.7, metalness: 0 })
const mRubber= new THREE.MeshStandardMaterial({ color: '#111213', roughness: 1.0, metalness: 0 })

// ─── DISPENSER SUB-COMPONENTS ────────────────────────────────────────
function Screw({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh material={mScrew}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
      </mesh>
      <mesh material={mScrew}>
        <cylinderGeometry args={[0.006, 0.006, 0.015, 8]} />
      </mesh>
    </group>
  )
}

function MeterDial({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh material={mPanel}><cylinderGeometry args={[0.07, 0.07, 0.012, 32]} /></mesh>
      <mesh material={mChrom}><torusGeometry args={[0.07, 0.008, 8, 32]} /></mesh>
      <mesh position={[0, 0.007, 0]} material={mAmberD}>
        <ringGeometry args={[0.055, 0.065, 32, 1, 0, Math.PI * 1.6]} />
      </mesh>
      <mesh position={[0.02, 0.009, 0]} rotation={[0, 0, -0.4]} material={mAmber}>
        <boxGeometry args={[0.05, 0.004, 0.002]} />
      </mesh>
      <mesh position={[0, 0.009, 0]} material={mChrom}>
        <cylinderGeometry args={[0.005, 0.005, 0.005, 8]} />
      </mesh>
    </group>
  )
}

function Display({ pos, w = 0.22, h = 0.065 }: { pos: [number, number, number]; w?: number; h?: number }) {
  return (
    <group position={pos}>
      <mesh material={mPanel}><boxGeometry args={[w + 0.02, h + 0.025, 0.015]} /></mesh>
      <mesh position={[0, 0, 0.009]} material={mGlass}><boxGeometry args={[w, h, 0.002]} /></mesh>
      <mesh position={[0, 0.005, 0.011]} material={mAmber}><boxGeometry args={[w * 0.88, h * 0.28, 0.001]} /></mesh>
      <mesh position={[0, -0.01, 0.011]} material={mAmberD}><boxGeometry args={[w * 0.72, h * 0.12, 0.001]} /></mesh>
      {([-0.06, -0.01, 0.04, 0.09] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.005, 0.0115]} material={i < 3 ? mAmber : mAmberD}>
          <boxGeometry args={[0.01, h * 0.25, 0.001]} />
        </mesh>
      ))}
    </group>
  )
}

function Nozzle({ pos, side = 1 }: { pos: [number, number, number]; side?: number }) {
  return (
    <group position={pos} scale={[side, 1, 1]}>
      <mesh material={mBody}><boxGeometry args={[0.04, 0.12, 0.06]} /></mesh>
      <mesh position={[0.02, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={mHose}>
        <torusGeometry args={[0.045, 0.012, 8, 16, Math.PI]} />
      </mesh>
      <mesh position={[0.02, -0.08, 0.04]} material={mChrom}>
        <cylinderGeometry args={[0.016, 0.012, 0.08, 12]} />
      </mesh>
      <mesh position={[0.02, -0.05, 0.04]} material={mRubber}>
        <torusGeometry args={[0.018, 0.006, 8, 16]} />
      </mesh>
    </group>
  )
}

function Valve({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh material={mBrass}><cylinderGeometry args={[0.045, 0.045, 0.1, 12]} /></mesh>
      <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]} material={mChrom}>
        <boxGeometry args={[0.12, 0.012, 0.018]} />
      </mesh>
      <mesh position={[0, -0.09, 0]} material={mPipe}><cylinderGeometry args={[0.022, 0.022, 0.12, 12]} /></mesh>
      <mesh position={[0,  0.09, 0]} material={mPipe}><cylinderGeometry args={[0.022, 0.022, 0.12, 12]} /></mesh>
      <mesh position={[0,  0.05, 0]} material={mSeal}><torusGeometry args={[0.046, 0.004, 8, 20]} /></mesh>
      <mesh position={[0, -0.05, 0]} material={mSeal}><torusGeometry args={[0.046, 0.004, 8, 20]} /></mesh>
    </group>
  )
}

function Wire({ from, to, mat, r = 0.008 }: {
  from: [number, number, number]
  to: [number, number, number]
  mat: THREE.MeshStandardMaterial
  r?: number
}) {
  const s = new THREE.Vector3(...from)
  const e = new THREE.Vector3(...to)
  const dir = e.clone().sub(s)
  const len = dir.length()
  const mid = s.clone().add(e).multiplyScalar(0.5)
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  const eu = new THREE.Euler().setFromQuaternion(q)
  return (
    <mesh position={[mid.x, mid.y, mid.z]} rotation={[eu.x, eu.y, eu.z]} material={mat}>
      <cylinderGeometry args={[r, r, len, 6]} />
    </mesh>
  )
}

// ─── MAIN DISPENSER ──────────────────────────────────────────────────
function Dispenser({ sp, onReady }: { sp: number; onReady?: () => void }) {
  const grpRef = useRef<THREE.Group>(null)
  const scrRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (!onReady) return
    const t = setTimeout(onReady, 600)
    return () => clearTimeout(t)
  }, [onReady])

  useFrame(({ clock }) => {
    if (!grpRef.current) return
    const t = clock.elapsedTime
    const target =
      sp < 0.18 ? Math.sin(t * 0.15) * 0.06
      : sp < 0.45 ? -0.22
      : sp < 0.65 ? 0.1
      : sp < 0.85 ? 0.35
      : 0.12
    grpRef.current.rotation.y = THREE.MathUtils.lerp(grpRef.current.rotation.y, target, 0.025)
    if (scrRef.current) {
      (scrRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + Math.sin(t * 0.8) * 0.08
    }
  })

  const screwPositions: [number, number, number][] = [
    [0.225, 0.8, 0.185], [-0.225, 0.8, 0.185],
    [0.225, -0.78, 0.185], [-0.225, -0.78, 0.185],
  ]

  return (
    <group ref={grpRef} position={[0, 0.05, 0]}>
      {/* Main cabinet */}
      <mesh castShadow receiveShadow material={mBody}><boxGeometry args={[0.48, 1.62, 0.36]} /></mesh>
      <mesh position={[0, 0.1, 0.179]} castShadow material={mPanel}><boxGeometry args={[0.38, 1.1, 0.01]} /></mesh>
      <mesh position={[0.245, 0.1, 0]} material={mBody}><boxGeometry args={[0.005, 1.62, 0.36]} /></mesh>
      <mesh position={[-0.245, 0.1, 0]} material={mBody}><boxGeometry args={[0.005, 1.62, 0.36]} /></mesh>

      {/* Top cap + vents */}
      <mesh position={[0, 0.825, 0]} castShadow material={mChrom}><boxGeometry args={[0.5, 0.04, 0.38]} /></mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 0.82, -0.06 + i * 0.04]} material={mPanel}>
          <boxGeometry args={[0.38, 0.006, 0.008]} />
        </mesh>
      ))}

      {/* Brand badge */}
      <mesh position={[0, 0.76, 0.182]} material={mChrom}><boxGeometry args={[0.18, 0.03, 0.003]} /></mesh>
      <mesh position={[0, 0.76, 0.183]} material={mPanel}><boxGeometry args={[0.16, 0.018, 0.002]} /></mesh>
      <mesh ref={scrRef} position={[0, 0.76, 0.184]} material={mBlue}><boxGeometry args={[0.14, 0.008, 0.001]} /></mesh>

      {/* Displays */}
      <Display pos={[0, 0.6, 0.184]} w={0.28} h={0.085} />
      <Display pos={[-0.07, 0.48, 0.184]} w={0.14} h={0.052} />
      <Display pos={[0.09, 0.48, 0.184]} w={0.14} h={0.052} />

      {/* Meter dials */}
      <MeterDial pos={[-0.1, 0.35, 0.182]} />
      <MeterDial pos={[0.1, 0.35, 0.182]} />

      {/* Keypad */}
      <mesh position={[0, 0.16, 0.181]} material={mPanel}><boxGeometry args={[0.22, 0.12, 0.008]} /></mesh>
      {[0, 1, 2].flatMap((row) =>
        [0, 1, 2, 3].map((col) => (
          <mesh key={`${row}-${col}`}
            position={[-0.077 + col * 0.05, 0.22 - row * 0.036, 0.187]}
            material={row === 2 && col === 3 ? mAmber : mBody}>
            <boxGeometry args={[0.028, 0.028, 0.012]} />
          </mesh>
        ))
      )}

      {/* Status LEDs */}
      <mesh position={[0.155, 0.66, 0.182]} material={mPanel}><boxGeometry args={[0.02, 0.16, 0.006]} /></mesh>
      {([0.72, 0.68, 0.64, 0.60] as number[]).map((y, i) => (
        <mesh key={i} position={[0.155, y, 0.185]} material={i === 0 ? mLedG : i === 3 ? mLedR : mPanel}>
          <sphereGeometry args={[0.005, 8, 8]} />
        </mesh>
      ))}

      {/* E-stop */}
      <mesh position={[-0.155, 0.09, 0.185]} material={mLedR}><cylinderGeometry args={[0.025, 0.025, 0.02, 20]} /></mesh>
      <mesh position={[-0.155, 0.09, 0.181]} material={mPanel}><ringGeometry args={[0.026, 0.034, 20]} /></mesh>

      {/* Nozzle cradles */}
      <Nozzle pos={[0.27, 0.2, 0.06]} side={1} />
      <Nozzle pos={[-0.27, 0.2, 0.06]} side={-1} />

      {/* Lower metering section */}
      <mesh position={[0, -0.55, 0.179]} material={mPanel}><boxGeometry args={[0.38, 0.42, 0.005]} /></mesh>
      <mesh position={[0, -0.55, 0.05]} material={mBody}><cylinderGeometry args={[0.07, 0.07, 0.32, 16]} /></mesh>
      <mesh position={[0, -0.55, 0.05]} material={mChrom}><torusGeometry args={[0.07, 0.006, 8, 24]} /></mesh>

      {/* Valves */}
      <Valve pos={[-0.14, -0.62, 0.05]} />
      <Valve pos={[0.14, -0.62, 0.05]} />

      {/* Inlet pipe */}
      <mesh position={[0, -0.82, 0.05]} material={mPipe}><cylinderGeometry args={[0.025, 0.025, 0.3, 12]} /></mesh>

      {/* Wiring panel */}
      <mesh position={[0, 0.05, -0.15]} material={mPanel}><boxGeometry args={[0.38, 0.8, 0.02]} /></mesh>
      <Wire from={[-0.08, 0.35, -0.12]} to={[-0.08, -0.2, -0.12]} mat={mWireR} />
      <Wire from={[-0.04, 0.35, -0.12]} to={[-0.04, -0.2, -0.12]} mat={mWireY} />
      <Wire from={[0.02,  0.35, -0.12]} to={[0.02,  -0.2, -0.12]} mat={mWireB} />
      <Wire from={[0.06,  0.35, -0.12]} to={[0.06,  -0.2, -0.12]} mat={mWireR} />
      {([0.2, 0.05, -0.1] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y, -0.118]} material={mLabel}><boxGeometry args={[0.2, 0.006, 0.004]} /></mesh>
      ))}

      {/* Corner screws */}
      {screwPositions.map((p, i) => <Screw key={i} pos={p} />)}

      {/* Base */}
      <mesh position={[0, -0.86, 0]} material={mChrom}><boxGeometry args={[0.52, 0.04, 0.4]} /></mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[-0.1 + i * 0.04, -0.84, 0.202]} material={mPanel}>
          <boxGeometry args={[0.008, 0.025, 0.004]} />
        </mesh>
      ))}
      <mesh position={[0, -0.78, 0.183]} material={mLabel}><boxGeometry args={[0.12, 0.022, 0.002]} /></mesh>
      <mesh position={[0, -0.78, 0.184]} material={mAmberD}><boxGeometry args={[0.1, 0.01, 0.001]} /></mesh>

      {/* Emissive glow sources */}
      <pointLight position={[0, 0.6, 0.5]} color="#F59E0B" intensity={1.0} distance={2} decay={3} />
      <pointLight position={[0, -0.4, 0.4]} color="#3B82F6" intensity={0.3} distance={1.5} decay={3} />
    </group>
  )
}

// ─── ROOT SCENE ──────────────────────────────────────────────────────
export default function Scene({ scrollProgress, activeSection, onReady }: SceneProps) {
  const [dpr, setDpr] = useState(1.5)

  return (
    <Canvas
      camera={{ position: [0, 0.5, 5.5], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, stencil: false }}
      dpr={dpr}
      shadows
      style={{ background: '#0D0E10' }}
      onCreated={({ gl }) => gl.setClearColor('#0D0E10', 1)}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(window.devicePixelRatio, 2))}
      />
      <AdaptiveDpr pixelated />
      <Suspense fallback={null}>
        <fog attach="fog" args={['#0D0E10', 12, 35]} />
        <CameraCtrl sp={scrollProgress} />
        <SceneLights sp={scrollProgress} />
        <Floor />
        <Dispenser sp={scrollProgress} onReady={onReady} />
        <Particles sp={scrollProgress} />
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.4}
            blendFunction={BlendFunction.ADD}
          />
          <Vignette offset={0.3} darkness={0.7} blendFunction={BlendFunction.NORMAL} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
