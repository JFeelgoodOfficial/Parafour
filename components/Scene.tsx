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

// ─── CAMERA CONTROLLER ───────────────────────────────────────────────
const WP = [
  { position: new THREE.Vector3(0, 0.8, 5.5),    target: new THREE.Vector3(0, 0.2, 0) },
  { position: new THREE.Vector3(1.2, 0.7, 3.2),  target: new THREE.Vector3(0, 0.6, 0) },
  { position: new THREE.Vector3(0.1, 1.2, 2.4),  target: new THREE.Vector3(0, 1.1, 0) },
  { position: new THREE.Vector3(-1.0, 0.0, 2.8), target: new THREE.Vector3(0, -0.2, 0) },
  { position: new THREE.Vector3(-1.5, 0.9, 3.8), target: new THREE.Vector3(0, 0.3, 0) },
  { position: new THREE.Vector3(2.0, 1.2, 4.5),  target: new THREE.Vector3(0, 0.2, 0) },
  { position: new THREE.Vector3(0.8, 0.5, 4.2),  target: new THREE.Vector3(0, 0.1, 0) },
]

function eio(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

function CameraCtrl({ sp }: { sp: number }) {
  const { camera } = useThree()
  const posRef = useRef(new THREE.Vector3(0, 0.8, 5.5))
  const tgt = useRef(new THREE.Vector3(0, 0.2, 0))

  useFrame((_, delta) => {
    const p = sp
    if (p < 0.18) {
      const t = p / 0.18
      posRef.current.set(Math.sin(t * 0.4) * 0.5, 0.8 + t * 0.1, 5.5 - t * 0.3)
      tgt.current.set(0, 0.2, 0)
    } else if (p < 0.28) {
      const e = eio((p - 0.18) / 0.10)
      posRef.current.lerpVectors(WP[0].position, WP[1].position, e)
      tgt.current.lerpVectors(WP[0].target, WP[1].target, e)
    } else if (p < 0.34) {
      posRef.current.copy(WP[1].position); tgt.current.copy(WP[1].target)
    } else if (p < 0.42) {
      const e = eio((p - 0.34) / 0.08)
      posRef.current.lerpVectors(WP[1].position, WP[2].position, e)
      tgt.current.lerpVectors(WP[1].target, WP[2].target, e)
    } else if (p < 0.52) {
      const e = eio((p - 0.42) / 0.10)
      posRef.current.lerpVectors(WP[2].position, WP[4].position, e)
      tgt.current.lerpVectors(WP[2].target, WP[4].target, e)
    } else if (p < 0.62) {
      posRef.current.copy(WP[4].position); tgt.current.copy(WP[4].target)
    } else if (p < 0.72) {
      const e = eio((p - 0.62) / 0.10)
      posRef.current.lerpVectors(WP[4].position, WP[5].position, e)
      tgt.current.lerpVectors(WP[4].target, WP[5].target, e)
    } else if (p < 0.82) {
      posRef.current.copy(WP[5].position); tgt.current.copy(WP[5].target)
    } else {
      const e = eio(Math.min((p - 0.82) / 0.18, 1))
      posRef.current.lerpVectors(WP[5].position, WP[6].position, e)
      tgt.current.lerpVectors(WP[5].target, WP[6].target, e)
    }
    camera.position.lerp(posRef.current, Math.min(delta * 3.5, 0.12))
    camera.lookAt(tgt.current)
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
  return <>
    <ambientLight intensity={0.08} color="#1A2530" />
    <spotLight ref={keyRef} position={[1, 6, 4]} angle={Math.PI / 8} penumbra={0.4}
      intensity={6} color="#D4E8F5" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.001} />
    <spotLight position={[-3, 4, -3]} angle={Math.PI / 6} penumbra={0.6} intensity={3.5} color="#7EB8D4" />
    <pointLight position={[3, 0.5, 2]} intensity={0.8} color="#F5E8C8" distance={8} decay={2} />
    <pointLight position={[0, -1.5, 1]} intensity={0.3} color="#1E3040" distance={5} decay={2} />
    <pointLight ref={amberRef} position={[0.05, 0.9, 0.5]} intensity={1.2} color="#F5960A" distance={2.5} decay={3} />
    <rectAreaLight position={[0, 7, 0]} rotation={[-Math.PI / 2, 0, 0]} width={3} height={6} intensity={1.5} color="#C8DCF0" />
  </>
}

// ─── PARTICLES ───────────────────────────────────────────────────────
function Particles({ sp }: { sp: number }) {
  const dustRef = useRef<THREE.Points>(null)
  const mistRef = useRef<THREE.Points>(null)
  const dustGeo = useMemo(() => {
    const count = 180, pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random()-.5)*10; pos[i*3+1] = Math.random()*5-.5; pos[i*3+2] = (Math.random()-.5)*8
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return g
  }, [])
  const mistGeo = useMemo(() => {
    const count = 40, pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random()-.5)*6; pos[i*3+1] = Math.random()*.8-.4; pos[i*3+2] = (Math.random()-.5)*4
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return g
  }, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (dustRef.current) {
      const p = dustRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < 180; i++) {
        p[i*3+1] += 0.0005; p[i*3] += Math.sin(t*.1+i)*.0003
        if (p[i*3+1] > 4.5) p[i*3+1] = -0.5
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true
      dustRef.current.rotation.y = t * 0.01
    }
    if (mistRef.current)
      (mistRef.current.material as THREE.PointsMaterial).opacity = sp < 0.2 ? 0.04 + Math.sin(t*.3)*.01 : 0.02
  })
  return <>
    <points ref={dustRef} geometry={dustGeo}>
      <pointsMaterial size={0.02} color="#8B9095" transparent opacity={0.35} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
    <points ref={mistRef} geometry={mistGeo}>
      <pointsMaterial size={0.6} color="#1E3848" transparent opacity={0.04} sizeAttenuation depthWrite={false} />
    </points>
  </>
}

// ─── FLOOR ───────────────────────────────────────────────────────────
function Floor() {
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.55,0]} receiveShadow>
      <planeGeometry args={[30,30]} /><meshStandardMaterial color="#0D0F11" roughness={0.6} metalness={0.25} />
    </mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.545,0]}>
      <planeGeometry args={[10,10,10,10]} /><meshBasicMaterial color="#1A2530" wireframe transparent opacity={0.08} />
    </mesh>
    <mesh position={[0,-1.52,0]} receiveShadow castShadow>
      <boxGeometry args={[1.1,0.06,0.65]} /><meshStandardMaterial color="#16191C" roughness={0.4} metalness={0.6} />
    </mesh>
    <mesh position={[0,-1.49,0.325]}>
      <boxGeometry args={[1.1,0.01,0.01]} /><meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
    </mesh>
  </group>
}

// ─── DISPENSER MATERIALS (module-level singletons) ───────────────────
const mBody  = new THREE.MeshStandardMaterial({ color:'#2C2F33', roughness:.35, metalness:.75 })
const mPanel = new THREE.MeshStandardMaterial({ color:'#1C1E21', roughness:.5,  metalness:.6  })
const mChrom = new THREE.MeshStandardMaterial({ color:'#9AA5B1', roughness:.1,  metalness:.95 })
const mScrew = new THREE.MeshStandardMaterial({ color:'#7A8490', roughness:.2,  metalness:.9  })
const mScrGl = new THREE.MeshStandardMaterial({ color:'#0A0C0E', roughness:.05, metalness:.1, transparent:true, opacity:.9 })
const mAmber = new THREE.MeshStandardMaterial({ color:'#F59E0B', emissive:'#F59E0B', emissiveIntensity:.8, roughness:.5, metalness:0, transparent:true, opacity:.95 })
const mAmberD= new THREE.MeshStandardMaterial({ color:'#4A3010', emissive:'#F59E0B', emissiveIntensity:.25, roughness:.5, metalness:0 })
const mBlue  = new THREE.MeshStandardMaterial({ color:'#3B82F6', emissive:'#3B82F6', emissiveIntensity:.6, roughness:.5, metalness:0, transparent:true, opacity:.9 })
const mLedG  = new THREE.MeshStandardMaterial({ color:'#22C55E', emissive:'#22C55E', emissiveIntensity:1.2, roughness:.3, metalness:0 })
const mLedR  = new THREE.MeshStandardMaterial({ color:'#EF4444', emissive:'#EF4444', emissiveIntensity:1.0, roughness:.3, metalness:0 })
const mHose  = new THREE.MeshStandardMaterial({ color:'#1A1A1A', roughness:.9, metalness:.1 })
const mPipe  = new THREE.MeshStandardMaterial({ color:'#7C4F2F', roughness:.3, metalness:.8 })
const mBrass = new THREE.MeshStandardMaterial({ color:'#B8862C', roughness:.2, metalness:.85 })
const mWireR = new THREE.MeshStandardMaterial({ color:'#DC2626', emissive:'#7F1D1D', emissiveIntensity:.3, roughness:.8, metalness:0 })
const mWireY = new THREE.MeshStandardMaterial({ color:'#CA8A04', emissive:'#451A03', emissiveIntensity:.2, roughness:.8, metalness:0 })
const mWireB = new THREE.MeshStandardMaterial({ color:'#1D4ED8', emissive:'#172554', emissiveIntensity:.2, roughness:.8, metalness:0 })
const mLabel = new THREE.MeshStandardMaterial({ color:'#D4D8DC', roughness:.9, metalness:0 })
const mSeal  = new THREE.MeshStandardMaterial({ color:'#F97316', roughness:.7, metalness:0 })
const mRubber= new THREE.MeshStandardMaterial({ color:'#111213', roughness:1.0, metalness:0 })

// Small helpers
const B = (a: [number,number,number]) => <boxGeometry args={a} />
const C = (a: [number,number,number,number]) => <cylinderGeometry args={a} />

function Screw({ p }: { p: [number,number,number] }) {
  return <group position={p}>
    <mesh material={mScrew}><C a={[.015,.015,.01,8]} /></mesh>
    <mesh material={mScrew}><C a={[.006,.006,.015,8]} /></mesh>
  </group>
}

function MeterDial({ p }: { p: [number,number,number] }) {
  return <group position={p}>
    <mesh material={mPanel}><C a={[.07,.07,.012,32]} /></mesh>
    <mesh material={mChrom}><torusGeometry args={[.07,.008,8,32]} /></mesh>
    <mesh position={[0,.007,0]} material={mAmberD}><ringGeometry args={[.055,.065,32,1,0,Math.PI*1.6]} /></mesh>
    <mesh position={[.02,.009,0]} rotation={[0,0,-.4]} material={mAmber}><B a={[.05,.004,.002]} /></mesh>
    <mesh position={[0,.009,0]} material={mChrom}><C a={[.005,.005,.005,8]} /></mesh>
  </group>
}

function Display({ p, w=.22, h=.065 }: { p:[number,number,number]; w?:number; h?:number }) {
  return <group position={p}>
    <mesh material={mPanel}><B a={[w+.02,h+.025,.015]} /></mesh>
    <mesh position={[0,0,.009]} material={mScrGl}><B a={[w,h,.002]} /></mesh>
    <mesh position={[0,.005,.011]} material={mAmber}><B a={[w*.88,h*.28,.001]} /></mesh>
    <mesh position={[0,-.01,.011]} material={mAmberD}><B a={[w*.72,h*.12,.001]} /></mesh>
    {[-.06,-.01,.04,.09].map((x,i)=>(
      <mesh key={i} position={[x,.005,.0115]} material={i<3?mAmber:mAmberD}><B a={[.01,h*.25,.001]} /></mesh>
    ))}
  </group>
}

function Nozzle({ p, side=1 }: { p:[number,number,number]; side?:number }) {
  return <group position={p} scale={[side,1,1]}>
    <mesh material={mBody}><B a={[.04,.12,.06]} /></mesh>
    <mesh position={[.02,0,.04]} rotation={[Math.PI/2,0,0]} material={mHose}><torusGeometry args={[.045,.012,8,16,Math.PI]} /></mesh>
    <mesh position={[.02,-.08,.04]} material={mChrom}><C a={[.016,.012,.08,12]} /></mesh>
    <mesh position={[.02,-.05,.04]} material={mRubber}><torusGeometry args={[.018,.006,8,16]} /></mesh>
  </group>
}

function Valve({ p }: { p:[number,number,number] }) {
  return <group position={p}>
    <mesh material={mBrass}><C a={[.045,.045,.1,12]} /></mesh>
    <mesh position={[0,0,.06]} rotation={[Math.PI/2,0,0]} material={mChrom}><B a={[.12,.012,.018]} /></mesh>
    <mesh position={[0,-.09,0]} material={mPipe}><C a={[.022,.022,.12,12]} /></mesh>
    <mesh position={[0, .09,0]} material={mPipe}><C a={[.022,.022,.12,12]} /></mesh>
    <mesh position={[0,.05,0]} material={mSeal}><torusGeometry args={[.046,.004,8,20]} /></mesh>
    <mesh position={[0,-.05,0]} material={mSeal}><torusGeometry args={[.046,.004,8,20]} /></mesh>
  </group>
}

function Wire({ from, to, mat, r=.008 }: { from:[number,number,number]; to:[number,number,number]; mat:THREE.MeshStandardMaterial; r?:number }) {
  const s=new THREE.Vector3(...from), e=new THREE.Vector3(...to)
  const dir=e.clone().sub(s), len=dir.length(), mid=s.clone().add(e).multiplyScalar(.5)
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize())
  const eu=new THREE.Euler().setFromQuaternion(q)
  return <mesh position={[mid.x,mid.y,mid.z]} rotation={[eu.x,eu.y,eu.z]} material={mat}>
    <C a={[r,r,len,6]} />
  </mesh>
}

// ─── DISPENSER ───────────────────────────────────────────────────────
function Dispenser({ sp, onReady }: { sp:number; onReady?:()=>void }) {
  const grp = useRef<THREE.Group>(null)
  const scr = useRef<THREE.Mesh>(null)
  useEffect(() => { if (onReady) { const t=setTimeout(onReady,600); return ()=>clearTimeout(t) } }, [onReady])
  useFrame(({ clock }) => {
    if (!grp.current) return
    const t = clock.elapsedTime
    const target = sp<.18 ? Math.sin(t*.15)*.06 : sp<.45 ? -.22 : sp<.65 ? .1 : sp<.85 ? .35 : .12
    grp.current.rotation.y = THREE.MathUtils.lerp(grp.current.rotation.y, target, .025)
    if (scr.current) (scr.current.material as THREE.MeshStandardMaterial).emissiveIntensity = .8+Math.sin(t*.8)*.08
  })
  return (
    <group ref={grp} position={[0,.05,0]}>
      <mesh castShadow receiveShadow material={mBody}><B a={[.48,1.62,.36]} /></mesh>
      <mesh position={[0,.1,.179]} castShadow material={mPanel}><B a={[.38,1.1,.01]} /></mesh>
      <mesh position={[.245,.1,0]} material={mBody}><B a={[.005,1.62,.36]} /></mesh>
      <mesh position={[-.245,.1,0]} material={mBody}><B a={[.005,1.62,.36]} /></mesh>
      <mesh position={[0,.825,0]} castShadow material={mChrom}><B a={[.5,.04,.38]} /></mesh>
      {Array.from({length:5}).map((_,i)=>(
        <mesh key={i} position={[0,.82,-.06+i*.04]} material={mPanel}><B a={[.38,.006,.008]} /></mesh>
      ))}
      <mesh position={[0,.76,.182]} material={mChrom}><B a={[.18,.03,.003]} /></mesh>
      <mesh position={[0,.76,.183]} material={mPanel}><B a={[.16,.018,.002]} /></mesh>
      <mesh ref={scr} position={[0,.76,.184]} material={mBlue}><B a={[.14,.008,.001]} /></mesh>
      <Display p={[0,.6,.184]} w={.28} h={.085} />
      <Display p={[-.07,.48,.184]} w={.14} h={.052} />
      <Display p={[.09,.48,.184]} w={.14} h={.052} />
      <MeterDial p={[-.1,.35,.182]} />
      <MeterDial p={[.1,.35,.182]} />
      <mesh position={[0,.16,.181]} material={mPanel}><B a={[.22,.12,.008]} /></mesh>
      {[0,1,2].flatMap(row=>[0,1,2,3].map(col=>(
        <mesh key={`${row}-${col}`} position={[-.077+col*.05,.22-row*.036,.187]}
          material={row===2&&col===3?mAmber:mBody}><B a={[.028,.028,.012]} /></mesh>
      )))}
      <mesh position={[.155,.66,.182]} material={mPanel}><B a={[.02,.16,.006]} /></mesh>
      {[.72,.68,.64,.60].map((y,i)=>(
        <mesh key={i} position={[.155,y,.185]} material={i===0?mLedG:i===3?mLedR:mPanel}>
          <sphereGeometry args={[.005,8,8]} />
        </mesh>
      ))}
      <mesh position={[-.155,.09,.185]} material={mLedR}><C a={[.025,.025,.02,20]} /></mesh>
      <mesh position={[-.155,.09,.181]} material={mPanel}><ringGeometry args={[.026,.034,20]} /></mesh>
      <Nozzle p={[.27,.2,.06]} side={1} />
      <Nozzle p={[-.27,.2,.06]} side={-1} />
      <mesh position={[0,-.55,.179]} material={mPanel}><B a={[.38,.42,.005]} /></mesh>
      <mesh position={[0,-.55,.05]} material={mBody}><C a={[.07,.07,.32,16]} /></mesh>
      <mesh position={[0,-.55,.05]} material={mChrom}><torusGeometry args={[.07,.006,8,24]} /></mesh>
      <Valve p={[-.14,-.62,.05]} />
      <Valve p={[.14,-.62,.05]} />
      <mesh position={[0,-.82,.05]} material={mPipe}><C a={[.025,.025,.3,12]} /></mesh>
      <mesh position={[0,.05,-.15]} material={mPanel}><B a={[.38,.8,.02]} /></mesh>
      <Wire from={[-.08,.35,-.12]} to={[-.08,-.2,-.12]} mat={mWireR} />
      <Wire from={[-.04,.35,-.12]} to={[-.04,-.2,-.12]} mat={mWireY} />
      <Wire from={[.02,.35,-.12]}  to={[.02,-.2,-.12]}  mat={mWireB} />
      <Wire from={[.06,.35,-.12]}  to={[.06,-.2,-.12]}  mat={mWireR} />
      {[.2,.05,-.1].map((y,i)=>(
        <mesh key={i} position={[0,y,-.118]} material={mLabel}><B a={[.2,.006,.004]} /></mesh>
      ))}
      {[[.225,.8],[-.225,.8],[.225,-.78],[-.225,-.78]].map(([x,y],i)=>(
        <Screw key={i} p={[x,y,.185] as [number,number,number]} />
      ))}
      <mesh position={[0,-.86,0]} material={mChrom}><B a={[.52,.04,.4]} /></mesh>
      {Array.from({length:6}).map((_,i)=>(
        <mesh key={i} position={[-.1+i*.04,-.84,.202]} material={mPanel}><B a={[.008,.025,.004]} /></mesh>
      ))}
      <mesh position={[0,-.78,.183]} material={mLabel}><B a={[.12,.022,.002]} /></mesh>
      <mesh position={[0,-.78,.184]} material={mAmberD}><B a={[.1,.01,.001]} /></mesh>
      <pointLight position={[0,.6,.5]} color="#F59E0B" intensity={1.0} distance={2} decay={3} />
      <pointLight position={[0,-.4,.4]} color="#3B82F6" intensity={0.3} distance={1.5} decay={3} />
    </group>
  )
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────
export default function Scene({ scrollProgress, activeSection, onReady }: SceneProps) {
  const [dpr, setDpr] = useState(1.5)
  return (
    <Canvas
      camera={{ position:[0,.5,5.5], fov:45, near:.1, far:200 }}
      gl={{ antialias:true, powerPreference:'high-performance', alpha:false, stencil:false }}
      dpr={dpr} shadows style={{ background:'#0D0E10' }}
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
          <Bloom intensity={0.6} luminanceThreshold={0.6} luminanceSmoothing={0.4} blendFunction={BlendFunction.ADD} />
          <Vignette offset={0.3} darkness={0.7} blendFunction={BlendFunction.NORMAL} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
