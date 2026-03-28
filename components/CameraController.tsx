'use client'

import { useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraControllerProps {
  scrollProgress: number
  activeSection: string
}

// Camera waypoints for each section of the journey
const CAMERA_WAYPOINTS = [
  // Hero: Wide cinematic reveal, slightly elevated, looking up at dispenser
  { position: new THREE.Vector3(0, 0.8, 5.5),   target: new THREE.Vector3(0, 0.2, 0) },
  // Products – front inspection angle
  { position: new THREE.Vector3(1.2, 0.7, 3.2),  target: new THREE.Vector3(0, 0.6, 0) },
  // Products – display panel closeup
  { position: new THREE.Vector3(0.1, 1.2, 2.4),  target: new THREE.Vector3(0, 1.1, 0) },
  // Products – valve/bottom inspection
  { position: new THREE.Vector3(-1.0, 0.0, 2.8), target: new THREE.Vector3(0, -0.2, 0) },
  // System – three-quarter wide view
  { position: new THREE.Vector3(-1.5, 0.9, 3.8), target: new THREE.Vector3(0, 0.3, 0) },
  // Impact – wider pullback, dramatic
  { position: new THREE.Vector3(2.0, 1.2, 4.5),  target: new THREE.Vector3(0, 0.2, 0) },
  // Contact – calm settled 3/4 view
  { position: new THREE.Vector3(0.8, 0.5, 4.2),  target: new THREE.Vector3(0, 0.1, 0) },
]

function lerpVector3(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  return new THREE.Vector3().lerpVectors(a, b, t)
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export default function CameraController({ scrollProgress, activeSection }: CameraControllerProps) {
  const { camera } = useThree()
  const currentPosRef = useRef(new THREE.Vector3(0, 0.8, 5.5))
  const currentTargetRef = useRef(new THREE.Vector3(0, 0.2, 0))

  useFrame((state, delta) => {
    // Map scroll to waypoint index
    let waypointIndex: number
    let localT: number

    if (scrollProgress < 0.18) {
      // Hero — subtle hero orbit
      waypointIndex = 0
      localT = 0
      // Gentle orbital motion in hero
      const heroT = scrollProgress / 0.18
      const orbit = easeInOut(heroT)
      currentPosRef.current.set(
        Math.sin(orbit * 0.4) * 0.5,
        0.8 + orbit * 0.1,
        5.5 - orbit * 0.3
      )
      currentTargetRef.current.set(0, 0.2, 0)
    } else if (scrollProgress < 0.28) {
      // Hero → Products transition
      const t = (scrollProgress - 0.18) / 0.10
      const et = easeInOut(t)
      currentPosRef.current.lerpVectors(CAMERA_WAYPOINTS[0].position, CAMERA_WAYPOINTS[1].position, et)
      currentTargetRef.current.lerpVectors(CAMERA_WAYPOINTS[0].target, CAMERA_WAYPOINTS[1].target, et)
    } else if (scrollProgress < 0.34) {
      // Products – front view
      currentPosRef.current.copy(CAMERA_WAYPOINTS[1].position)
      currentTargetRef.current.copy(CAMERA_WAYPOINTS[1].target)
    } else if (scrollProgress < 0.42) {
      // Products – pan to display panel
      const t = (scrollProgress - 0.34) / 0.08
      const et = easeInOut(t)
      currentPosRef.current.lerpVectors(CAMERA_WAYPOINTS[1].position, CAMERA_WAYPOINTS[2].position, et)
      currentTargetRef.current.lerpVectors(CAMERA_WAYPOINTS[1].target, CAMERA_WAYPOINTS[2].target, et)
    } else if (scrollProgress < 0.52) {
      // System view
      const t = (scrollProgress - 0.42) / 0.10
      const et = easeInOut(t)
      currentPosRef.current.lerpVectors(CAMERA_WAYPOINTS[2].position, CAMERA_WAYPOINTS[4].position, et)
      currentTargetRef.current.lerpVectors(CAMERA_WAYPOINTS[2].target, CAMERA_WAYPOINTS[4].target, et)
    } else if (scrollProgress < 0.62) {
      currentPosRef.current.copy(CAMERA_WAYPOINTS[4].position)
      currentTargetRef.current.copy(CAMERA_WAYPOINTS[4].target)
    } else if (scrollProgress < 0.72) {
      // Impact transition
      const t = (scrollProgress - 0.62) / 0.10
      const et = easeInOut(t)
      currentPosRef.current.lerpVectors(CAMERA_WAYPOINTS[4].position, CAMERA_WAYPOINTS[5].position, et)
      currentTargetRef.current.lerpVectors(CAMERA_WAYPOINTS[4].target, CAMERA_WAYPOINTS[5].target, et)
    } else if (scrollProgress < 0.82) {
      currentPosRef.current.copy(CAMERA_WAYPOINTS[5].position)
      currentTargetRef.current.copy(CAMERA_WAYPOINTS[5].target)
    } else {
      // Contact
      const t = (scrollProgress - 0.82) / 0.18
      const et = easeInOut(Math.min(t, 1))
      currentPosRef.current.lerpVectors(CAMERA_WAYPOINTS[5].position, CAMERA_WAYPOINTS[6].position, et)
      currentTargetRef.current.lerpVectors(CAMERA_WAYPOINTS[5].target, CAMERA_WAYPOINTS[6].target, et)
    }

    // Smooth camera to target with lag for cinematic feel
    const lerpSpeed = Math.min(delta * 3.5, 0.12)
    camera.position.lerp(currentPosRef.current, lerpSpeed)

    // LookAt with smooth interpolation
    const lookTarget = new THREE.Vector3()
    lookTarget.lerp(currentTargetRef.current, lerpSpeed)
    camera.lookAt(currentTargetRef.current)
  })

  return null
}
