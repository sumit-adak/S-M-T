"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// TYPES
// ============================================================
type CharState =
  | 'idle'
  | 'excited'
  | 'name-focus'
  | 'email-focus'
  | 'message-focus'
  | 'submit-hover'
  | 'submitting'
  | 'success';

// ============================================================
// DIALOGUE DICTIONARY
// ============================================================
const DIALOGUE: Record<CharState, { icon: string; label: string; text: string }> = {
  idle: {
    icon: '👋',
    label: 'Hey there!',
    text: "Fill out the form and let's build something amazing together.",
  },
  excited: {
    icon: '✨',
    label: 'Welcome!',
    text: "Great to see you here! I'm ready to help.",
  },
  'name-focus': {
    icon: '📝',
    label: 'Your name?',
    text: "What should I call you? Don't be shy!",
  },
  'email-focus': {
    icon: '📧',
    label: 'Email time!',
    text: "Drop your email so we can reach you back.",
  },
  'message-focus': {
    icon: '💬',
    label: 'Tell me more!',
    text: "What's on your mind? I'm all ears!",
  },
  'submit-hover': {
    icon: '🚀',
    label: 'Ready to go!',
    text: "Everything looks perfect — send it over!",
  },
  submitting: {
    icon: '⏳',
    label: 'Sending...',
    text: "Getting your message out right now!",
  },
  success: {
    icon: '🎉',
    label: 'Sent!',
    text: "Message delivered! We'll reply soon.",
  },
};

// ============================================================
// SMOOTH DAMPED LERP
// ============================================================
function dampLerp(current: number, target: number, lambda: number, delta: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));
}

// ============================================================
// PREMIUM MATERIALS — Nothing + Apple Vision Pro + Tesla
// ============================================================
function usePremiumMaterials() {
  return useMemo(() => {
    // 1. Visor Glass: Clean transparent dark black tint with high reflection
    const visorGlass = new THREE.MeshPhysicalMaterial({
      color: '#121218',
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.22, // Reduced opacity so eyes and internals show through even more clearly!
      transmission: 0.95,
      thickness: 0.2,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.5,
    });

    // 2. Anodized Matte Black Body (Tesla Optimus style) -> Lighter Space Gray/Titanium
    const matteBlack = new THREE.MeshPhysicalMaterial({
      color: '#3a3a40',
      roughness: 0.28,
      metalness: 0.85,
      clearcoat: 0.4,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.5,
    });

    // 3. CNC-Machined Graphite / Dark Chrome Details -> Lighter Graphite
    const graphite = new THREE.MeshPhysicalMaterial({
      color: '#55555e',
      roughness: 0.15,
      metalness: 0.95,
      clearcoat: 0.75,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.8,
    });

    // 4. Polished Chrome / Piston Rods
    const polishedChrome = new THREE.MeshPhysicalMaterial({
      color: '#e2e2e7',
      roughness: 0.06,
      metalness: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 2.2,
    });

    // 5. Nothing Polycarbonate (Clear plastic casing)
    const polycarbonate = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.12,
      transparent: true,
      opacity: 0.45,
      transmission: 0.8,
      thickness: 0.35,
      ior: 1.5,
      clearcoat: 0.8,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.0,
    });

    // 6. Purple Neon Glow (#8B5CF6)
    const purpleNeon = new THREE.MeshStandardMaterial({
      color: '#8B5CF6',
      emissive: '#8B5CF6',
      emissiveIntensity: 7.0,
      roughness: 0.0,
      metalness: 0.0,
    });

    // 7. Soft Purple Ambient Accents
    const softPurple = new THREE.MeshStandardMaterial({
      color: '#8B5CF6',
      emissive: '#7C3AED',
      emissiveIntensity: 2.5,
      roughness: 0.0,
      metalness: 0.0,
    });

    return {
      visorGlass,
      matteBlack,
      graphite,
      polishedChrome,
      polycarbonate,
      purpleNeon,
      softPurple,
    };
  }, []);
}

// ============================================================
// CINEMATIC STUDIO LIGHTING
// ============================================================
function CinematicLighting() {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.15} color="#1c1a2e" />

      {/* Main overhead key light */}
      <directionalLight
        position={[0, 5, 4]}
        intensity={2.5}
        color="#e8e2fa"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-normalBias={0.015}
      >
        <orthographicCamera attach="shadow-camera" args={[-2.5, 2.5, 2.5, -2.5, 0.1, 15]} />
      </directionalLight>

      {/* High-intensity purple rim lights from right & left */}
      <directionalLight position={[6, 1.5, -3]} intensity={3.5} color="#8B5CF6" />
      <directionalLight position={[-6, 1.5, -3]} intensity={2.2} color="#7C3AED" />

      {/* Under-glow fill */}
      <pointLight position={[0, -2, 1.5]} intensity={0.6} color="#4C1D95" distance={5} />

      {/* Back rim for silhouette separation */}
      <pointLight position={[0, 1.2, -2.5]} intensity={2.5} color="#8B5CF6" distance={6} />

      <Environment preset="night" environmentIntensity={0.25} />

      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.45}
        scale={5.5}
        blur={2.8}
        far={4.5}
        color="#1f0945"
      />
    </>
  );
}

// ============================================================
// PROCEDURAL FINGER COMPONENT
// ============================================================
type FingerProps = {
  curl: number;
  length: number;
  thickness: number;
  rotationOffset?: [number, number, number];
  positionOffset: [number, number, number];
  mats: ReturnType<typeof usePremiumMaterials>;
};

function Finger({ curl, length, thickness, rotationOffset = [0, 0, 0], positionOffset, mats }: FingerProps) {
  const joint1Rot = curl * 0.9;
  const joint2Rot = curl * 0.9;
  const joint3Rot = curl * 0.6;

  return (
    <group position={positionOffset} rotation={rotationOffset}>
      {/* Joint Knuckle */}
      <mesh>
        <sphereGeometry args={[thickness * 1.15, 12, 12]} />
        <meshPhysicalMaterial color={mats.graphite.color} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Phalanx 1 */}
      <group rotation={[joint1Rot, 0, 0]}>
        <mesh castShadow position={[0, length * 0.2, 0]}>
          <cylinderGeometry args={[thickness, thickness, length * 0.4, 12]} />
          <meshPhysicalMaterial color={mats.matteBlack.color} roughness={0.25} metalness={0.9} />
        </mesh>

        {/* Joint 2 */}
        <group position={[0, length * 0.4, 0]}>
          <mesh>
            <sphereGeometry args={[thickness * 1.05, 10, 10]} />
            <meshPhysicalMaterial color={mats.polishedChrome.color} roughness={0.08} metalness={0.95} />
          </mesh>

          {/* Phalanx 2 */}
          <group rotation={[joint2Rot, 0, 0]}>
            <mesh castShadow position={[0, length * 0.15, 0]}>
              <cylinderGeometry args={[thickness * 0.9, thickness * 0.9, length * 0.3, 10]} />
              <meshPhysicalMaterial color={mats.matteBlack.color} roughness={0.25} metalness={0.9} />
            </mesh>

            {/* Joint 3 */}
            <group position={[0, length * 0.3, 0]}>
              <mesh>
                <sphereGeometry args={[thickness * 0.9, 10, 10]} />
                <meshPhysicalMaterial color={mats.polishedChrome.color} roughness={0.08} metalness={0.95} />
              </mesh>

              {/* Phalanx 3 / Tip */}
              <group rotation={[joint3Rot, 0, 0]}>
                <mesh castShadow position={[0, length * 0.1, 0]}>
                  <cylinderGeometry args={[thickness * 0.8, thickness * 0.6, length * 0.2, 10]} />
                  <meshPhysicalMaterial color={mats.graphite.color} roughness={0.15} metalness={0.9} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// ============================================================
// BASE ENERGY PARTICLES
// ============================================================
function BaseParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 45;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.25 + Math.random() * 0.4;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = -0.65 + Math.random() * 0.5;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      spd[i] = 0.12 + Math.random() * 0.25;
    }
    return [pos, spd];
  }, []);

  useFrame((_state, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      posAttr.setY(i, posAttr.getY(i) + speeds[i] * delta);
      if (posAttr.getY(i) > -0.05) {
        posAttr.setY(i, -0.65);
        const theta = Math.random() * Math.PI * 2;
        const r = 0.25 + Math.random() * 0.4;
        posAttr.setX(i, Math.cos(theta) * r);
        posAttr.setZ(i, Math.sin(theta) * r);
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#DDD6FE"
        size={0.016}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ============================================================
// MAIN PREMIUM MASCOT COMPONENT
// ============================================================
type RobotProps = {
  charState: CharState;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
};

function PremiumMascot({ charState, mouse }: RobotProps) {
  const { camera } = useThree();
  const mats = usePremiumMaterials();

  // Root node refs
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const neckBallRef = useRef<THREE.Mesh>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const coreInnerRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  // Left arm refs
  const lShoulderRef = useRef<THREE.Group>(null);
  const lElbowRef = useRef<THREE.Group>(null);
  const lWristRef = useRef<THREE.Group>(null);

  // Right arm refs
  const rShoulderRef = useRef<THREE.Group>(null);
  const rElbowRef = useRef<THREE.Group>(null);
  const rWristRef = useRef<THREE.Group>(null);

  // Eye refs
  const lEyeRef = useRef<THREE.Group>(null);
  const rEyeRef = useRef<THREE.Group>(null);

  // Platform and floaters
  const platformRef = useRef<THREE.Group>(null);
  const sensorRotRef = useRef<THREE.Mesh>(null);

  // Hydraulic rod refs
  const rodFrontRef = useRef<THREE.Group>(null);
  const pistonFrontRef = useRef<THREE.Mesh>(null);
  const rodLeftRef = useRef<THREE.Group>(null);
  const pistonLeftRef = useRef<THREE.Mesh>(null);
  const rodRightRef = useRef<THREE.Group>(null);
  const pistonRightRef = useRef<THREE.Mesh>(null);

  // Joint state targets for spring-lerping
  const joints = useRef({
    headX: 0, headY: 0, headZ: 0,
    torsoX: 0, torsoY: 0, torsoZ: 0,
    lShoulderX: 0, lShoulderY: 0, lShoulderZ: 0,
    lElbowX: -0.15,
    lWristX: 0, lWristY: 0, lWristZ: 0,
    lIndexCurl: 0.2, lOtherCurl: 0.2,
    rShoulderX: 0, rShoulderY: 0, rShoulderZ: 0,
    rElbowX: -0.15,
    rWristX: 0, rWristY: 0, rWristZ: 0,
    rIndexCurl: 0.2, rOtherCurl: 0.2,
    rThumbCurl: 0.2, lThumbCurl: 0.2,
    platformRotY: 0,
    platformHover: 0,
    eyeScaleX: 1.0, eyeScaleY: 1.0,
    eyeBlinkL: 1.0, eyeBlinkR: 1.0,
    spinVelocity: 0.0,
    nodAngle: 0.0,
  });

  const blinkTimer = useRef(Math.random() * 3 + 2);
  const isBlinking = useRef(false);
  const blinkPhase = useRef(0);
  const wanderTimer = useRef(0);
  const wanderTarget = useRef({ x: 0, y: 0 });
  const wanderCurrent = useRef({ x: 0, y: 0 });
  const fingerTwitchTimer = useRef(0);
  const lookAroundTimer = useRef(Math.random() * 4 + 2);
  const isLookingAround = useRef(false);
  const lookTarget = useRef({ x: 0, y: 0 });

  // Camera initial orientation
  useEffect(() => {
    camera.position.set(0, 0.25, 2.9);
    camera.lookAt(0, 0.08, 0);
  }, [camera]);

  useFrame((_state, delta) => {
    const t = _state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    if (!rootRef.current) return;
    const j = joints.current;

    // === 1. BASIC FLOATING & HOVER ===
    let hoverFreq = 1.0;
    let hoverAmp = 0.035;
    if (charState === 'success') { hoverFreq = 2.4; hoverAmp = 0.06; }
    else if (charState === 'excited') { hoverFreq = 1.8; hoverAmp = 0.045; }
    else if (charState === 'submitting') { hoverFreq = 0.8; hoverAmp = 0.015; }

    const hoverTarget = Math.sin(t * hoverFreq) * hoverAmp + Math.sin(t * hoverFreq * 0.7 + 1.2) * hoverAmp * 0.25;
    j.platformHover = dampLerp(j.platformHover, hoverTarget, 5.0, dt);
    rootRef.current.position.y = j.platformHover;

    // === 2. BODY BREATHING MOTION ===
    let breathFreq = 1.4;
    let breathAmp = 0.006;
    if (charState === 'success') { breathFreq = 2.8; breathAmp = 0.012; }
    else if (charState === 'excited') { breathFreq = 2.0; breathAmp = 0.009; }

    const breathScale = 1.0 + Math.sin(t * breathFreq) * breathAmp;
    rootRef.current.scale.set(breathScale, breathScale, breathScale);

    // === 3. RANDOM FINGER TWITCH ===
    fingerTwitchTimer.current -= dt;
    let twitchL = 0;
    let twitchR = 0;
    if (fingerTwitchTimer.current <= 0) {
      twitchL = (Math.random() - 0.5) * 0.15;
      twitchR = (Math.random() - 0.5) * 0.15;
      fingerTwitchTimer.current = 1.2 + Math.random() * 2.5;
    }

    // === 4. EYE BLINKING ===
    blinkTimer.current -= dt;
    if (blinkTimer.current <= 0 && !isBlinking.current) {
      isBlinking.current = true;
      blinkPhase.current = 0;
      blinkTimer.current = 3.0 + Math.random() * 4.0;
    }

    if (isBlinking.current) {
      blinkPhase.current += dt;
      if (blinkPhase.current < 0.06) {
        j.eyeBlinkL = dampLerp(j.eyeBlinkL, 0.02, 35.0, dt);
        j.eyeBlinkR = dampLerp(j.eyeBlinkR, 0.02, 35.0, dt);
      } else if (blinkPhase.current < 0.12) {
        j.eyeBlinkL = dampLerp(j.eyeBlinkL, 1.0, 25.0, dt);
        j.eyeBlinkR = dampLerp(j.eyeBlinkR, 1.0, 25.0, dt);
      } else {
        isBlinking.current = false;
        j.eyeBlinkL = 1.0;
        j.eyeBlinkR = 1.0;
      }
    }

    // === 5. LOOK AROUND DRIFT ===
    lookAroundTimer.current -= dt;
    if (lookAroundTimer.current <= 0 && !isLookingAround.current && charState === 'idle') {
      isLookingAround.current = true;
      lookTarget.current = {
        x: (Math.random() - 0.5) * 0.22,
        y: (Math.random() - 0.5) * 0.15,
      };
      lookAroundTimer.current = 3.0 + Math.random() * 4.0;
      setTimeout(() => {
        isLookingAround.current = false;
      }, 1000 + Math.random() * 1500);
    }

    // === 6. INTERACTION STATE CONTROLLERS ===
    let hx = 0, hy = 0, hz = 0;
    let mx = mouse.current.x * 0.32;
    let my = mouse.current.y * 0.22;

    // Default target parameters
    let tLX = 0.1, tLY = 0, tLZ = 0.1, tLEX = -0.15, tLWX = 0, tLWY = 0, tLWZ = 0, tLIndex = 0.25, tLOther = 0.25, tLThumb = 0.2;
    let tRX = 0.1, tRY = 0, tRZ = -0.1, tREX = -0.15, tRWX = 0, tRWY = 0, tRWZ = 0, tRIndex = 0.25, tROther = 0.25, tRThumb = 0.2;
    let tTorsoX = 0, tTorsoY = 0, tTorsoZ = 0;
    let tEyeScaleX = 1.0;
    let tEyeScaleY = 1.0;

    j.spinVelocity = dampLerp(j.spinVelocity, 0, 1.5, dt);

    switch (charState) {
      case 'excited':
        tRX = -0.3;
        tRY = 0.2;
        tRZ = -1.25;
        tREX = -0.7;
        tRWZ = Math.sin(t * 9.5) * 0.35;
        tRWX = -0.25;
        tRIndex = 0.0;
        tROther = 0.0;
        tRThumb = -0.2;

        hy = Math.sin(t * 3.5) * 0.08;
        hx = -0.05 + Math.sin(t * 2.0) * 0.02;
        hz = Math.sin(t * 2.5) * 0.03;
        break;

      case 'name-focus':
        tRX = -0.55;
        tRY = -0.75;
        tRZ = -0.65;
        tREX = -0.15;
        tRWX = 0.18;
        tRWY = 0.08;
        tRWZ = 0.22;
        tRIndex = 0.0;
        tROther = 1.0;
        tRThumb = 0.6;

        hy = -0.32;
        hx = 0.1;
        hz = -0.04;
        tTorsoY = -0.08;
        break;

      case 'email-focus':
        tRX = -0.35;
        tRY = -0.7;
        tRZ = -0.55;
        tREX = -0.15;
        tRWX = 0.15;
        tRWY = 0.05;
        tRWZ = 0.18;
        tRIndex = 0.0;
        tROther = 1.0;
        tRThumb = 0.6;

        hy = -0.28;
        hx = 0.05;
        hz = -0.03;
        tTorsoY = -0.06;
        break;

      case 'message-focus':
        tTorsoX = 0.16;
        tTorsoY = -0.12;

        tLX = -0.25; tLY = 0.25; tLZ = 0.45; tLEX = -1.25;
        tRX = -0.25; tRY = -0.25; tRZ = -0.45; tREX = -1.25;

        hy = -0.26;
        hx = 0.14;
        hz = -0.05;
        break;

      case 'submit-hover':
        tRX = -0.55;
        tRY = -0.08;
        tRZ = -0.65;
        tREX = -0.85;
        tRWX = 0.85;
        tRWY = 0.45;
        tRWZ = -0.45;
        tRIndex = 1.0;
        tROther = 1.0;
        tRThumb = -0.7;

        hy = -0.28;
        hx = -0.02;
        hz = 0.04;
        break;

      case 'submitting':
        tRX = -0.65;
        tRY = -0.42;
        tRZ = -0.42;
        tREX = -1.45;
        tRIndex = 0.1;
        tROther = 0.8;
        tRThumb = 0.4;

        hy = -0.08;
        hx = 0.22;
        hz = 0.08;
        tTorsoX = 0.05;
        break;

      case 'success':
        tLX = -0.2; tLY = 0; tLZ = 1.25; tLEX = -0.4;
        tRX = -0.2; tRY = 0; tRZ = -1.25; tREX = -0.4;
        tLIndex = 0; tLOther = 0; tRIndex = 0; tROther = 0;

        j.spinVelocity = 3.8;
        tEyeScaleY = 0.16;
        tEyeScaleX = 1.25;
        tTorsoX = -0.08 + Math.sin(t * 8) * 0.05;
        hx = -0.12 + Math.sin(t * 6) * 0.06;
        break;

      default:
        if (isLookingAround.current) {
          hy = lookTarget.current.y;
          hx = lookTarget.current.x;
        } else {
          hy = mx + wanderCurrent.current.y;
          hx = -my + wanderCurrent.current.x;
        }

        tLZ = 0.08 + Math.sin(t * 1.5) * 0.02;
        tRZ = -0.08 - Math.sin(t * 1.5) * 0.02;
        tLEX = -0.15 + Math.cos(t * 1.5) * 0.015;
        tREX = -0.15 + Math.cos(t * 1.5) * 0.015;

        tLIndex = 0.25 + twitchL;
        tLOther = 0.25 + twitchL;
        tRIndex = 0.25 + twitchR;
        tROther = 0.25 + twitchR;
        break;
    }

    if (charState === 'success') {
      j.platformRotY += j.spinVelocity * dt;
    } else {
      j.platformRotY = dampLerp(j.platformRotY, 0, 4.0, dt);
    }

    // Spring-lerp all target joints
    const lerpJoints = (lambda: number) => {
      j.headY = dampLerp(j.headY, hy, lambda, dt);
      j.headX = dampLerp(j.headX, hx, lambda, dt);
      j.headZ = dampLerp(j.headZ, hz, lambda, dt);

      j.torsoX = dampLerp(j.torsoX, tTorsoX, lambda, dt);
      j.torsoY = dampLerp(j.torsoY, tTorsoY, lambda, dt);
      j.torsoZ = dampLerp(j.torsoZ, tTorsoZ, lambda, dt);

      j.lShoulderX = dampLerp(j.lShoulderX, tLX, lambda, dt);
      j.lShoulderY = dampLerp(j.lShoulderY, tLY, lambda, dt);
      j.lShoulderZ = dampLerp(j.lShoulderZ, tLZ, lambda, dt);
      j.lElbowX = dampLerp(j.lElbowX, tLEX, lambda, dt);
      j.lWristX = dampLerp(j.lWristX, tLWX, lambda, dt);
      j.lWristY = dampLerp(j.lWristY, tLWY, lambda, dt);
      j.lWristZ = dampLerp(j.lWristZ, tLWZ, lambda, dt);
      j.lIndexCurl = dampLerp(j.lIndexCurl, tLIndex, lambda, dt);
      j.lOtherCurl = dampLerp(j.lOtherCurl, tLOther, lambda, dt);
      j.lThumbCurl = dampLerp(j.lThumbCurl, tLThumb, lambda, dt);

      j.rShoulderX = dampLerp(j.rShoulderX, tRX, lambda, dt);
      j.rShoulderY = dampLerp(j.rShoulderY, tRY, lambda, dt);
      j.rShoulderZ = dampLerp(j.rShoulderZ, tRZ, lambda, dt);
      j.rElbowX = dampLerp(j.rElbowX, tREX, lambda, dt);
      j.rWristX = dampLerp(j.rWristX, tRWX, lambda, dt);
      j.rWristY = dampLerp(j.rWristY, tRWY, lambda, dt);
      j.rWristZ = dampLerp(j.rWristZ, tRWZ, lambda, dt);
      j.rIndexCurl = dampLerp(j.rIndexCurl, tRIndex, lambda, dt);
      j.rOtherCurl = dampLerp(j.rOtherCurl, tROther, lambda, dt);
      j.rThumbCurl = dampLerp(j.rThumbCurl, tRThumb, lambda, dt);

      j.eyeScaleX = dampLerp(j.eyeScaleX, tEyeScaleX, lambda, dt);
      j.eyeScaleY = dampLerp(j.eyeScaleY, tEyeScaleY, lambda, dt);
    };

    const lambdaValue = (charState === 'excited' || charState === 'success') ? 8.5 : 5.5;
    lerpJoints(lambdaValue);

    // Apply transforms
    if (headRef.current) {
      headRef.current.rotation.x = j.headX;
      headRef.current.rotation.y = j.headY;
      headRef.current.rotation.z = j.headZ;
    }
    if (torsoRef.current) {
      torsoRef.current.rotation.x = j.torsoX;
      torsoRef.current.rotation.y = j.torsoY;
      torsoRef.current.rotation.z = j.torsoZ;
    }

    if (lShoulderRef.current) {
      lShoulderRef.current.rotation.set(j.lShoulderX, j.lShoulderY, j.lShoulderZ);
    }
    if (lElbowRef.current) {
      lElbowRef.current.rotation.x = j.lElbowX;
    }
    if (lWristRef.current) {
      lWristRef.current.rotation.set(j.lWristX, j.lWristY, j.lWristZ);
    }

    if (rShoulderRef.current) {
      rShoulderRef.current.rotation.set(j.rShoulderX, j.rShoulderY, j.rShoulderZ);
    }
    if (rElbowRef.current) {
      rElbowRef.current.rotation.x = j.rElbowX;
    }
    if (rWristRef.current) {
      rWristRef.current.rotation.set(j.rWristX, j.rWristY, j.rWristZ);
    }

    if (lEyeRef.current) {
      lEyeRef.current.scale.set(j.eyeScaleX, j.eyeScaleY * j.eyeBlinkL, 1);
    }
    if (rEyeRef.current) {
      rEyeRef.current.scale.set(j.eyeScaleX, j.eyeScaleY * j.eyeBlinkR, 1);
    }

    if (platformRef.current) {
      platformRef.current.rotation.y = j.platformRotY;
    }

    // Internals rotating
    if (ring1Ref.current) ring1Ref.current.rotation.x = t * 2.0;
    if (ring2Ref.current) ring2Ref.current.rotation.y = t * -3.0;
    if (coreInnerRef.current) {
      const cm = coreInnerRef.current.material as THREE.MeshStandardMaterial;
      cm.emissiveIntensity = 4.0 + Math.sin(t * 4.0) * 1.5;
    }

    if (sensorRotRef.current) {
      sensorRotRef.current.rotation.y = t * 3.5;
    }

    // === 10. REALISTIC HYDRAULIC COLLAPSE/EXPAND FOR NECK ===
    // LOCAL COORDINATE TRANSFORMS (Avoids matrixWorld layout delay and camera mismatch)
    if (!torsoRef.current || !headRef.current) return;

    const localTorsoF = new THREE.Vector3(0, 0.16, 0.06);
    const localTorsoL = new THREE.Vector3(-0.06, 0.16, -0.06);
    const localTorsoR = new THREE.Vector3(0.06, 0.16, -0.06);

    const localHeadF = new THREE.Vector3(0, -0.15, 0.04);
    const localHeadL = new THREE.Vector3(-0.05, -0.15, -0.05);
    const localHeadR = new THREE.Vector3(0.05, -0.15, -0.05);

    const anchorTorsoF = localTorsoF.clone().applyEuler(torsoRef.current.rotation).add(torsoRef.current.position);
    const anchorTorsoL = localTorsoL.clone().applyEuler(torsoRef.current.rotation).add(torsoRef.current.position);
    const anchorTorsoR = localTorsoR.clone().applyEuler(torsoRef.current.rotation).add(torsoRef.current.position);

    const anchorHeadF = localHeadF.clone().applyEuler(headRef.current.rotation).add(headRef.current.position);
    const anchorHeadL = localHeadL.clone().applyEuler(headRef.current.rotation).add(headRef.current.position);
    const anchorHeadR = localHeadR.clone().applyEuler(headRef.current.rotation).add(headRef.current.position);

    const updateHydraulic = (
      gRef: React.RefObject<THREE.Group | null>,
      pRef: React.RefObject<THREE.Mesh | null>,
      bot: THREE.Vector3,
      top: THREE.Vector3
    ) => {
      if (!gRef.current) return;
      const vDir = new THREE.Vector3().subVectors(top, bot);
      const dist = vDir.length();
      vDir.normalize();

      gRef.current.position.copy(bot);
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vDir);
      gRef.current.quaternion.copy(quat);

      if (pRef.current) {
        pRef.current.position.y = dist - 0.045;
      }
    };

    updateHydraulic(rodFrontRef, pistonFrontRef, anchorTorsoF, anchorHeadF);
    updateHydraulic(rodLeftRef, pistonLeftRef, anchorTorsoL, anchorHeadL);
    updateHydraulic(rodRightRef, pistonRightRef, anchorTorsoR, anchorHeadR);

    if (neckBallRef.current) {
      const centerPos = new THREE.Vector3().addVectors(anchorTorsoF, anchorHeadF).multiplyScalar(0.5);
      neckBallRef.current.position.copy(centerPos);
    }
  });

  return (
    <group ref={rootRef} position={[0, 0.05, 0]}>

      {/* ============================================================ */}
      {/* TORSO COMPONENT */}
      {/* ============================================================ */}
      <group ref={torsoRef} position={[0, -0.05, 0]}>
        {/* Main core chassis (Tesla Optimus depth layout) */}
        <RoundedBox
          args={[0.38, 0.4, 0.22]} // Reduced Z depth from 0.24 to 0.22 to expose chest window
          radius={0.05}
          smoothness={8}
          castShadow
          receiveShadow
          material={mats.matteBlack}
        />

        {/* Layered armor plates sitting on sides & back — leaves front completely open! */}
        {/* Back plate */}
        <RoundedBox
          args={[0.36, 0.38, 0.02]}
          radius={0.015}
          smoothness={4}
          position={[0, 0, -0.111]}
          material={mats.graphite}
          castShadow
        />
        {/* Left shoulder panel */}
        <RoundedBox
          args={[0.02, 0.32, 0.18]}
          radius={0.005}
          smoothness={4}
          position={[0.191, 0, 0]}
          material={mats.graphite}
        />
        {/* Right shoulder panel */}
        <RoundedBox
          args={[0.02, 0.32, 0.18]}
          radius={0.005}
          smoothness={4}
          position={[-0.191, 0, 0]}
          material={mats.graphite}
        />

        {/* Segmented left and right front chest plates (frames the energy core) */}
        <RoundedBox
          args={[0.07, 0.34, 0.025]}
          radius={0.008}
          smoothness={4}
          position={[0.13, 0.01, 0.105]}
          material={mats.graphite}
          castShadow
        />
        <RoundedBox
          args={[0.07, 0.34, 0.025]}
          radius={0.008}
          smoothness={4}
          position={[-0.13, 0.01, 0.105]}
          material={mats.graphite}
          castShadow
        />

        {/* ARC ENERGY CORE - Transparent chest window positioned fully in front */}
        <RoundedBox
          args={[0.18, 0.18, 0.025]}
          radius={0.025}
          smoothness={6}
          position={[0, 0.02, 0.115]} // Sitting proud at Z = 0.115, completely uncovered!
          material={mats.visorGlass}
        />
        {/* Glowing core rim */}
        <mesh position={[0, 0.02, 0.125]}>
          <ringGeometry args={[0.064, 0.076, 32]} />
          <meshBasicMaterial color="#8B5CF6" transparent opacity={0.5} />
        </mesh>

        {/* Energy Core internals */}
        <group position={[0, 0.02, 0.07]}>
          <mesh ref={coreInnerRef}>
            <sphereGeometry args={[0.032, 24, 24]} />
            <meshStandardMaterial color="#c4b5fd" emissive="#8B5CF6" emissiveIntensity={4.5} />
          </mesh>
          <mesh ref={ring1Ref}>
            <torusGeometry args={[0.054, 0.007, 8, 32]} />
            <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={3.0} />
          </mesh>
          <mesh ref={ring2Ref} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.062, 0.004, 8, 24]} />
            <meshStandardMaterial color="#a78bfa" emissive="#7C3AED" emissiveIntensity={2.0} />
          </mesh>
          <pointLight position={[0, 0, 0.05]} distance={1.0} intensity={2.0} color="#8B5CF6" />
        </group>

        {/* Status Micro-LEDs */}
        <mesh position={[-0.14, 0.14, 0.11]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[-0.11, 0.14, 0.11]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={2.0} />
        </mesh>

        {/* ============================================================ */}
        {/* ARMS & ACTUATORS */}
        {/* ============================================================ */}

        {/* --- LEFT ARM COMPONENT --- */}
        <group ref={lShoulderRef} position={[0.23, 0.12, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.05, 24, 24]} />
            <meshPhysicalMaterial color={mats.graphite.color} roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.058, 0.008, 12, 32]} />
            <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={1.0} />
          </mesh>

          {/* Upper Arm Actuator */}
          <group position={[0.05, -0.08, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.024, 0.02, 0.16, 16]} />
              <meshPhysicalMaterial color={mats.matteBlack.color} roughness={0.28} metalness={0.88} />
            </mesh>
            <mesh position={[0.015, 0, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.14, 8]} />
              <meshPhysicalMaterial color={mats.polishedChrome.color} roughness={0.05} metalness={0.98} />
            </mesh>

            {/* Elbow joint */}
            <group ref={lElbowRef} position={[0, -0.09, 0]}>
              <mesh>
                <sphereGeometry args={[0.024, 16, 16]} />
                <meshPhysicalMaterial color={mats.graphite.color} roughness={0.1} metalness={0.9} />
              </mesh>

              {/* Forearm */}
              <group position={[0, -0.08, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.02, 0.016, 0.14, 16]} />
                  <meshPhysicalMaterial color={mats.matteBlack.color} roughness={0.28} metalness={0.88} />
                </mesh>
                <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.022, 0.003, 8, 24]} />
                  <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={1.5} />
                </mesh>

                {/* Wrist */}
                <group ref={lWristRef} position={[0, -0.08, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.016, 16, 16]} />
                    <meshPhysicalMaterial color={mats.polishedChrome.color} roughness={0.06} metalness={0.96} />
                  </mesh>

                  {/* Palm */}
                  <group position={[0, -0.025, 0]}>
                    <RoundedBox args={[0.055, 0.036, 0.016]} radius={0.005} smoothness={4} material={mats.graphite} castShadow />

                    {/* Left articulated fingers */}
                    <Finger positionOffset={[0.02, -0.018, 0]} length={0.045} thickness={0.005} curl={joints.current.lIndexCurl} mats={mats} />
                    <Finger positionOffset={[0.0, -0.019, 0]} length={0.05} thickness={0.005} curl={joints.current.lOtherCurl} mats={mats} />
                    <Finger positionOffset={[-0.02, -0.017, 0]} length={0.04} thickness={0.0048} curl={joints.current.lOtherCurl} mats={mats} />
                    <Finger positionOffset={[0.03, -0.008, 0.005]} length={0.032} thickness={0.0055} curl={joints.current.lThumbCurl} rotationOffset={[0, -0.4, -0.8]} mats={mats} />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>

        {/* --- RIGHT ARM COMPONENT --- */}
        <group ref={rShoulderRef} position={[-0.23, 0.12, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.05, 24, 24]} />
            <meshPhysicalMaterial color={mats.graphite.color} roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.058, 0.008, 12, 32]} />
            <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={1.0} />
          </mesh>

          {/* Upper Arm Actuator */}
          <group position={[-0.05, -0.08, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.024, 0.02, 0.16, 16]} />
              <meshPhysicalMaterial color={mats.matteBlack.color} roughness={0.28} metalness={0.88} />
            </mesh>
            <mesh position={[-0.015, 0, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.14, 8]} />
              <meshPhysicalMaterial color={mats.polishedChrome.color} roughness={0.05} metalness={0.98} />
            </mesh>

            {/* Elbow joint */}
            <group ref={rElbowRef} position={[0, -0.09, 0]}>
              <mesh>
                <sphereGeometry args={[0.024, 16, 16]} />
                <meshPhysicalMaterial color={mats.graphite.color} roughness={0.1} metalness={0.9} />
              </mesh>

              {/* Forearm */}
              <group position={[0, -0.08, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.02, 0.016, 0.14, 16]} />
                  <meshPhysicalMaterial color={mats.matteBlack.color} roughness={0.28} metalness={0.88} />
                </mesh>
                <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.022, 0.003, 8, 24]} />
                  <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={1.5} />
                </mesh>

                {/* Wrist */}
                <group ref={rWristRef} position={[0, -0.08, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.016, 16, 16]} />
                    <meshPhysicalMaterial color={mats.polishedChrome.color} roughness={0.06} metalness={0.96} />
                  </mesh>

                  {/* Palm */}
                  <group position={[0, -0.025, 0]}>
                    <RoundedBox args={[0.055, 0.036, 0.016]} radius={0.005} smoothness={4} material={mats.graphite} castShadow />

                    {/* Right articulated fingers */}
                    <Finger positionOffset={[-0.02, -0.018, 0]} length={0.045} thickness={0.005} curl={joints.current.rIndexCurl} mats={mats} />
                    <Finger positionOffset={[0.0, -0.019, 0]} length={0.05} thickness={0.005} curl={joints.current.rOtherCurl} mats={mats} />
                    <Finger positionOffset={[0.02, -0.017, 0]} length={0.04} thickness={0.0048} curl={joints.current.rOtherCurl} mats={mats} />
                    <Finger positionOffset={[-0.03, -0.008, 0.005]} length={0.032} thickness={0.0055} curl={joints.current.rThumbCurl} rotationOffset={[0, 0.4, 0.8]} mats={mats} />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ============================================================ */}
      {/* HEAD COMPONENT */}
      {/* ============================================================ */}
      <group ref={headRef} position={[0, 0.44, 0]}>
        {/* Main premium CNC-molded casing — depth reduced to 0.28 to sit visor correctly */}
        <RoundedBox
          args={[0.54, 0.4, 0.28]}
          radius={0.06}
          smoothness={10}
          castShadow
          receiveShadow
          material={mats.matteBlack}
        />

        {/* Side panel seams / precision cuts */}
        <mesh position={[0.271, 0, 0]}>
          <boxGeometry args={[0.002, 0.32, 0.22]} />
          <meshBasicMaterial color="#08080a" />
        </mesh>
        <mesh position={[-0.271, 0, 0]}>
          <boxGeometry args={[0.002, 0.32, 0.22]} />
          <meshBasicMaterial color="#08080a" />
        </mesh>

        {/* Back panel venting slots */}
        {[-0.1, -0.05, 0.0, 0.05, 0.1].map((y, i) => (
          <mesh key={i} position={[0, y, -0.141]}>
            <boxGeometry args={[0.22, 0.006, 0.002]} />
            <meshBasicMaterial color="#08080a" />
          </mesh>
        ))}

        {/* Hidden speaker grille under the chin */}
        {[-0.06, -0.03, 0.0, 0.03, 0.06].map((x, i) => (
          <mesh key={i} position={[x, -0.201, 0.02]}>
            <boxGeometry args={[0.015, 0.002, 0.06]} />
            <meshBasicMaterial color="#08080a" />
          </mesh>
        ))}

        {/* APPLE VISION PRO STYLE GLOSSY VISOR SCREEN (Shifted to Z = 0.141 to sit proud of casing) */}
        <RoundedBox
          args={[0.48, 0.34, 0.03]}
          radius={0.045}
          smoothness={8}
          position={[0, 0, 0.145]}
          material={mats.visorGlass}
          castShadow
        />

        {/* EYES PLACED VISIBLY JUST BEHIND THE GLASS VISOR */}
        <group position={[0, 0.02, 0.138]}>
          {/* Left Eye LED glyph structure */}
          <group ref={lEyeRef} position={[-0.1, 0, 0]}>
            {/* Outer LED ring */}
            <mesh>
              <ringGeometry args={[0.044, 0.054, 32]} />
              <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={4.5} />
            </mesh>
            {/* Inner eye dot */}
            <mesh>
              <circleGeometry args={[0.034, 32]} />
              <meshStandardMaterial color="#c4b5fd" emissive="#8B5CF6" emissiveIntensity={6.0} />
            </mesh>
            {/* Eye lens highlight reflection */}
            <mesh position={[0.01, 0.01, 0.002]}>
              <circleGeometry args={[0.008, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
            </mesh>
            <pointLight position={[0, 0, 0.03]} distance={0.3} intensity={0.6} color="#8B5CF6" />
          </group>

          {/* Right Eye LED glyph structure */}
          <group ref={rEyeRef} position={[0.1, 0, 0]}>
            <mesh>
              <ringGeometry args={[0.044, 0.054, 32]} />
              <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={4.5} />
            </mesh>
            <mesh>
              <circleGeometry args={[0.034, 32]} />
              <meshStandardMaterial color="#c4b5fd" emissive="#8B5CF6" emissiveIntensity={6.0} />
            </mesh>
            <mesh position={[0.01, 0.01, 0.002]}>
              <circleGeometry args={[0.008, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
            </mesh>
            <pointLight position={[0, 0, 0.03]} distance={0.3} intensity={0.6} color="#8B5CF6" />
          </group>
        </group>

        {/* SIDE OPTICAL SENSOR MODULE — left side with rotating purple light */}
        <group position={[-0.275, 0.04, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.024, 0.024, 0.012, 24]} />
            <meshPhysicalMaterial color={mats.graphite.color} roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh ref={sensorRotRef} position={[-0.007, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.004, 24]} />
            <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={3.5} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.026, 0.004, 8, 32]} />
            <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={1.0} />
          </mesh>
          <pointLight position={[-0.03, 0, 0]} distance={0.3} intensity={0.5} color="#8B5CF6" />
        </group>
      </group>

      {/* ============================================================ */}
      {/* NECK GIMBAL SYSTEM */}
      {/* ============================================================ */}
      {/* Central Ball joint */}
      <mesh ref={neckBallRef}>
        <sphereGeometry args={[0.044, 24, 24]} />
        <meshPhysicalMaterial color={mats.polishedChrome.color} roughness={0.06} metalness={0.98} />
      </mesh>

      {/* Glowing Neck collar energy ring */}
      <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.006, 12, 48]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={2.5} />
      </mesh>

      {/* Triple hydraulic support rods */}
      {/* 1. FRONT ROD */}
      <group ref={rodFrontRef}>
        <mesh castShadow position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.011, 0.011, 0.07, 12]} />
          <meshPhysicalMaterial color={mats.graphite.color} roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh ref={pistonFrontRef} castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.07, 12]} />
          <meshPhysicalMaterial color={mats.polishedChrome.color} roughness={0.05} metalness={0.98} />
        </mesh>
      </group>

      {/* 2. BACK-LEFT ROD */}
      <group ref={rodLeftRef}>
        <mesh castShadow position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.011, 0.011, 0.07, 12]} />
          <meshPhysicalMaterial color={mats.graphite.color} roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh ref={pistonLeftRef} castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.07, 12]} />
          <meshPhysicalMaterial color={mats.polishedChrome.color} roughness={0.05} metalness={0.98} />
        </mesh>
      </group>

      {/* 3. BACK-RIGHT ROD */}
      <group ref={rodRightRef}>
        <mesh castShadow position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.011, 0.011, 0.07, 12]} />
          <meshPhysicalMaterial color={mats.graphite.color} roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh ref={pistonRightRef} castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.07, 12]} />
          <meshPhysicalMaterial color={mats.polishedChrome.color} roughness={0.05} metalness={0.98} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* HOVERING PLATFORM BASE */}
      {/* ============================================================ */}
      <group ref={platformRef} position={[0, -0.7, 0]}>
        
        {/* Layer 1: Glass Refractive Top Disk */}
        <mesh position={[0, 0.21, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.02, 32]} />
          <meshPhysicalMaterial
            color={mats.polycarbonate.color}
            roughness={0.08}
            transparent
            opacity={0.35}
            transmission={0.8}
            thickness={0.2}
            ior={1.49}
            clearcoat={0.9}
            clearcoatRoughness={0.02}
            envMapIntensity={2.0}
          />
        </mesh>

        {/* Layer 2: Main metallic chamfered deck */}
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.36, 0.38, 0.08, 32]} />
          <meshPhysicalMaterial color={mats.matteBlack.color} roughness={0.25} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.355, 0.005, 8, 48]} />
          <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={2.5} />
        </mesh>

        {/* Layer 3: Polished graphite core block */}
        <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.28, 0.1, 24]} />
          <meshPhysicalMaterial color={mats.graphite.color} roughness={0.12} metalness={0.96} />
        </mesh>

        {/* Floating anti-gravity rings underneath */}
        <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.008, 12, 64]} />
          <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={3.0} />
        </mesh>
        <mesh position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.006, 12, 48]} />
          <meshStandardMaterial color="#7C3AED" emissive="#6D28D9" emissiveIntensity={2.0} />
        </mesh>

        {/* Anti-gravity emitter spotlight */}
        <pointLight position={[0, -0.08, 0]} distance={1.2} intensity={2.0} color="#8B5CF6" />
        
        {/* Anti-gravity particles */}
        <BaseParticles />
      </group>

    </group>
  );
}

// ============================================================
// MAIN EXPORT — ContactCharacter
// ============================================================
export default function ContactCharacter() {
  const [charState, setCharState] = useState<CharState>('idle');
  const [mounted, setMounted] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });
  const hoveredField = useRef<string | null>(null);
  const lifecycleLock = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const contactSection = document.getElementById('contact');
    const nameInput = document.getElementById('name') as HTMLInputElement | null;
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const messageInput = document.getElementById('message') as HTMLTextAreaElement | null;
    const submitBtn = document.querySelector('.submit-btn') as HTMLButtonElement | null;

    const resolveFieldState = (): CharState => {
      const active = document.activeElement;
      if (active === nameInput) return 'name-focus';
      if (active === emailInput) return 'email-focus';
      if (active === messageInput) return 'message-focus';
      if (hoveredField.current === 'name') return 'name-focus';
      if (hoveredField.current === 'email') return 'email-focus';
      if (hoveredField.current === 'message') return 'message-focus';
      return 'idle';
    };

    const updateState = () => {
      if (lifecycleLock.current) return;
      setCharState(resolveFieldState());
    };

    const onFocus = () => updateState();
    const onBlur = () => setTimeout(updateState, 60);
    const onNameInput = () => {
      if (document.activeElement === nameInput) updateState();
    };

    nameInput?.addEventListener('focus', onFocus);
    nameInput?.addEventListener('blur', onBlur);
    nameInput?.addEventListener('input', onNameInput);
    emailInput?.addEventListener('focus', onFocus);
    emailInput?.addEventListener('blur', onBlur);
    messageInput?.addEventListener('focus', onFocus);
    messageInput?.addEventListener('blur', onBlur);

    const makeHover = (field: string) => ({
      enter: () => { hoveredField.current = field; updateState(); },
      leave: () => { hoveredField.current = null; updateState(); },
    });

    const nameHover = makeHover('name');
    const emailHover = makeHover('email');
    const msgHover = makeHover('message');

    nameInput?.addEventListener('mouseenter', nameHover.enter);
    nameInput?.addEventListener('mouseleave', nameHover.leave);
    emailInput?.addEventListener('mouseenter', emailHover.enter);
    emailInput?.addEventListener('mouseleave', emailHover.leave);
    messageInput?.addEventListener('mouseenter', msgHover.enter);
    messageInput?.addEventListener('mouseleave', msgHover.leave);

    const onBtnEnter = () => {
      if (!lifecycleLock.current) setCharState('submit-hover');
    };
    const onBtnLeave = () => updateState();
    submitBtn?.addEventListener('mouseenter', onBtnEnter);
    submitBtn?.addEventListener('mouseleave', onBtnLeave);

    const onSubmit = () => {
      lifecycleLock.current = true;
      setCharState('submitting');
    };
    const onSuccess = () => {
      setCharState('success');
      setTimeout(() => {
        lifecycleLock.current = false;
        updateState();
      }, 7000);
    };
    const onError = () => {
      lifecycleLock.current = false;
      setCharState('idle');
    };

    window.addEventListener('contact-form-submit', onSubmit);
    window.addEventListener('contact-form-success', onSuccess);
    window.addEventListener('contact-form-error', onError);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !lifecycleLock.current) {
            setCharState('excited');
            setTimeout(() => {
              if (!lifecycleLock.current) updateState();
            }, 3500);
          }
        }
      },
      { threshold: 0.25 },
    );
    if (contactSection) io.observe(contactSection);

    return () => {
      nameInput?.removeEventListener('focus', onFocus);
      nameInput?.removeEventListener('blur', onBlur);
      nameInput?.removeEventListener('input', onNameInput);
      emailInput?.removeEventListener('focus', onFocus);
      emailInput?.removeEventListener('blur', onBlur);
      messageInput?.removeEventListener('focus', onFocus);
      messageInput?.removeEventListener('blur', onBlur);

      nameInput?.removeEventListener('mouseenter', nameHover.enter);
      nameInput?.removeEventListener('mouseleave', nameHover.leave);
      emailInput?.removeEventListener('mouseenter', emailHover.enter);
      emailInput?.removeEventListener('mouseleave', emailHover.leave);
      messageInput?.removeEventListener('mouseenter', msgHover.enter);
      messageInput?.removeEventListener('mouseleave', msgHover.leave);

      submitBtn?.removeEventListener('mouseenter', onBtnEnter);
      submitBtn?.removeEventListener('mouseleave', onBtnLeave);

      window.removeEventListener('contact-form-submit', onSubmit);
      window.removeEventListener('contact-form-success', onSuccess);
      window.removeEventListener('contact-form-error', onError);
      if (contactSection) io.unobserve(contactSection);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mounted]);

  if (!mounted) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1.05',
          background: 'radial-gradient(circle at center, rgba(139,92,246,0.05) 0%, transparent 70%)',
          borderRadius: '24px',
        }}
      />
    );
  }

  const dlg = DIALOGUE[charState];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1.05',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={charState}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            top: '8%',
            right: '-8px',
            background: 'rgba(15, 15, 20, 0.92)',
            backdropFilter: 'blur(12px)',
            color: '#e4e0f0',
            padding: '14px 18px',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(139,92,246,0.15)',
            maxWidth: '195px',
            zIndex: 10,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '13px',
            lineHeight: '1.45',
            border: '1px solid rgba(139,92,246,0.2)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '-6px',
              top: '50%',
              transform: 'translateY(-50%) rotate(45deg)',
              width: '12px',
              height: '12px',
              background: 'rgba(15, 15, 20, 0.92)',
              borderLeft: '1px solid rgba(139,92,246,0.2)',
              borderBottom: '1px solid rgba(139,92,246,0.2)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                color: charState === 'success' ? '#34D399' : '#A78BFA',
                marginBottom: '4px',
                fontSize: '13.5px',
              }}
            >
              {dlg.icon} {dlg.label}
            </div>
            {dlg.text}
          </div>
        </motion.div>
      </AnimatePresence>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(139,92,246,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 36 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          powerPreference: 'high-performance',
        }}
      >
        <CinematicLighting />
        <Suspense fallback={null}>
          <PremiumMascot charState={charState} mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
