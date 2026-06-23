"use client";

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ----------------------------------------------------
// 3D SUB-COMPONENTS
// ----------------------------------------------------

// 1. Neon Tunnel
function Tunnel() {
  const rings = useMemo(() => {
    const arr = [];
    // Space rings along Z axis from 0 to -120 every 6 units
    for (let i = 0; i < 22; i++) {
      const z = -i * 6;
      // Interpolate colors: Purple (#7C3AED) -> Violet (#8B5CF6) -> Accent (#A855F7)
      let color = '#7C3AED';
      if (i > 7 && i <= 14) color = '#8B5CF6';
      else if (i > 14) color = '#A855F7';
      arr.push({ z, color });
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Torus Rings */}
      {rings.map((ring, idx) => (
        <mesh key={idx} position={[0, 0, ring.z]} rotation={[0, 0, idx * 0.1]}>
          <torusGeometry args={[3.2, 0.02, 8, 48]} />
          <meshBasicMaterial color={ring.color} transparent opacity={0.65} />
        </mesh>
      ))}

      {/* Outer Cylinder Wireframe Grid */}
      <mesh position={[0, 0, -60]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.25, 3.25, 126, 12, 30, true]} />
        <meshBasicMaterial color="#7C3AED" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// 2. Glowing Floating Starfield Particles
function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 400;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const colorPalette = [
      new THREE.Color('#7C3AED'),
      new THREE.Color('#8B5CF6'),
      new THREE.Color('#A855F7'),
      new THREE.Color('#f472b6'),
    ];

    for (let i = 0; i < count; i++) {
      // Cylindrical distribution along the tunnel Z axis
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.0 + Math.random() * 5.0; // keep outside camera but in view
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = Math.sin(theta) * radius;
      pos[i * 3 + 2] = -Math.random() * 125;

      const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      cols[i * 3] = randomColor.r;
      cols[i * 3 + 1] = randomColor.g;
      cols[i * 3 + 2] = randomColor.b;
    }
    return [pos, cols];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.z = time * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// 3. Phase 1: Curiosity Cube (Z = -20)
function CuriosityCube() {
  const cubeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (cubeRef.current) {
      cubeRef.current.rotation.x = time * 0.45;
      cubeRef.current.rotation.y = time * 0.55;
      const pulse = 1.0 + Math.sin(time * 2.5) * 0.08;
      cubeRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={cubeRef} position={[0, 0, -20]}>
      {/* Outer Wireframe Dodecahedron */}
      <mesh>
        <dodecahedronGeometry args={[0.85]} />
        <meshBasicMaterial color="#A855F7" wireframe transparent opacity={0.7} />
      </mesh>
      {/* Inner Glowing solid Icosahedron */}
      <mesh>
        <icosahedronGeometry args={[0.45]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// 4. Phase 2: React Logo & Torus Knot (Z = -40)
function ReactInterface() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.35;
      groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -40]}>
      {/* Central Glowing Torus Knot */}
      <mesh>
        <torusKnotGeometry args={[0.55, 0.16, 100, 16]} />
        <meshBasicMaterial color="#00d8ff" wireframe transparent opacity={0.8} />
      </mesh>

      {/* Orbit Rings */}
      <mesh rotation={[0.4, 0.8, 0]}>
        <torusGeometry args={[1.2, 0.015, 8, 48]} />
        <meshBasicMaterial color="#00d8ff" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[0.4, -0.8, 0]}>
        <torusGeometry args={[1.2, 0.015, 8, 48]} />
        <meshBasicMaterial color="#00d8ff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// 5. Phase 3: DB & API Network Graph (Z = -60)
function NetworkGraph() {
  const groupRef = useRef<THREE.Group>(null);

  const [nodes, links] = useMemo(() => {
    const nodeCount = 10;
    const positions: [number, number, number][] = [];
    const linkPairs: number[] = [];

    // Create random node positions in a cluster
    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 0.4 + Math.random() * 0.6;
      
      positions.push([
        Math.sin(phi) * Math.cos(theta) * r,
        Math.sin(phi) * Math.sin(theta) * r,
        (Math.random() * 2 - 1) * 0.4,
      ]);
    }

    // Create connected link lines
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        // connect if close enough
        const distSq = 
          Math.pow(positions[i][0] - positions[j][0], 2) +
          Math.pow(positions[i][1] - positions[j][1], 2) +
          Math.pow(positions[i][2] - positions[j][2], 2);
        if (distSq < 1.2) {
          linkPairs.push(i, j);
        }
      }
    }

    return [positions, linkPairs];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = -time * 0.25;
      groupRef.current.rotation.z = time * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -60]}>
      {/* Database Storage Columns */}
      <mesh position={[-0.9, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 8, 4, true]} />
        <meshBasicMaterial color="#8B5CF6" wireframe transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.9, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 8, 4, true]} />
        <meshBasicMaterial color="#8B5CF6" wireframe transparent opacity={0.5} />
      </mesh>

      {/* Node Spheres */}
      {nodes.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={idx % 2 === 0 ? '#8B5CF6' : '#A855F7'} />
        </mesh>
      ))}

      {/* Network link lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(links.flatMap(idx => nodes[idx])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#8B5CF6" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

// 6. Phase 4: Neural Net & AI energy (Z = -80)
function AIVisualization() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const [points, links] = useMemo(() => {
    const ptCount = 18;
    const coords: [number, number, number][] = [];
    const linkIndices: number[] = [];

    // Dense cluster
    for (let i = 0; i < ptCount; i++) {
      const phi = Math.acos(Math.random() * 2 - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 0.55 + Math.random() * 0.55;
      coords.push([
        Math.sin(phi) * Math.cos(theta) * r,
        Math.sin(phi) * Math.sin(theta) * r,
        (Math.random() * 2 - 1) * 0.5
      ]);
    }

    // Connect nodes
    for (let i = 0; i < ptCount; i++) {
      const distances = coords.map((c, idx) => {
        if (idx === i) return { idx, dist: Infinity };
        const d = Math.pow(c[0]-coords[i][0], 2) + Math.pow(c[1]-coords[i][1], 2) + Math.pow(c[2]-coords[i][2], 2);
        return { idx, dist: d };
      });
      distances.sort((a, b) => a.dist - b.dist);
      for (let k = 0; k < 2; k++) {
        linkIndices.push(i, distances[k].idx);
      }
    }

    return [coords, linkIndices];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.35;
      groupRef.current.rotation.x = Math.sin(time * 0.4) * 0.1;
    }
    if (coreRef.current) {
      const scale = 1.0 + Math.sin(time * 4) * 0.12;
      coreRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -80]}>
      {/* Outer Geodesic Shell Wireframe */}
      <mesh>
        <icosahedronGeometry args={[0.85, 2]} />
        <meshBasicMaterial color="#f472b6" wireframe transparent opacity={0.35} />
      </mesh>

      {/* Central energy core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshBasicMaterial color="#f472b6" wireframe transparent opacity={0.75} />
      </mesh>

      {/* Orbiting AI nodes */}
      {points.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#f472b6" />
        </mesh>
      ))}

      {/* Connection paths */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(links.flatMap(idx => points[idx])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#f472b6" transparent opacity={0.25} />
      </lineSegments>
    </group>
  );
}

// 7. Phase 5: Project Worlds Chamber (Z = -100)
// Renders beautiful rotating structures representing the projects floating around the tunnel bounds.
function ProjectChamber3D() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = time * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -100]}>
      {/* Project World 1: WhiteBoard (Glass Canvas at Angle) */}
      <group position={[-2, 1.5, 0]} rotation={[0.2, 0.4, 0.1]}>
        <mesh>
          <boxGeometry args={[1.2, 0.8, 0.05]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.2, 0.8, 0.05]} />
          <meshBasicMaterial color="#7C3AED" wireframe transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Project World 2: Interview-AI (Neural Clusters) */}
      <group position={[2, 1.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#A855F7" wireframe />
        </mesh>
        <mesh position={[0.4, 0.3, 0.2]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#A855F7" />
        </mesh>
        <mesh position={[-0.4, -0.3, -0.2]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#8B5CF6" />
        </mesh>
      </group>

      {/* Project World 3: Code Reviewer (Holographic terminal box) */}
      <group position={[-2, -1.5, 0]} rotation={[0.4, -0.2, -0.2]}>
        <mesh>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshBasicMaterial color="#f472b6" wireframe transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Project World 4: Edu Hub (Orb with Satellite ring) */}
      <group position={[2, -1.5, 0]} rotation={[0.5, 0.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#8B5CF6" />
        </mesh>
        <mesh>
          <torusGeometry args={[0.5, 0.02, 6, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Project World 5: Banking Vault (Rotating secure core) */}
      <group position={[0, 0, 2]}>
        <mesh>
          <octahedronGeometry args={[0.4]} />
          <meshBasicMaterial color="#f59e0b" wireframe />
        </mesh>
      </group>
    </group>
  );
}

// 8. Final Scene: Gyroscopic Rotating SMT Logo (Z = -115)
function SMTLogo() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = -time * 0.6;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.4;
      ring1Ref.current.rotation.y = time * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 0.5;
      ring2Ref.current.rotation.z = time * 0.3;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = -time * 0.3;
      ring3Ref.current.rotation.x = -time * 0.5;
    }
  });

  return (
    <group position={[0, 0, -115]}>
      {/* Central Core Sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#A855F7" />
      </mesh>

      {/* Gyro Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.1, 0.03, 8, 48]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.8} />
      </mesh>

      {/* Gyro Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.3, 0.03, 8, 48]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.6} />
      </mesh>

      {/* Gyro Ring 3 */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.5, 0.03, 8, 48]} />
        <meshBasicMaterial color="#f472b6" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// ----------------------------------------------------
// CAMERA & INTERACTIVE SCENE CONTROLLER
// ----------------------------------------------------
type SceneProps = {
  scrollProgress: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
};

function SceneController({ scrollProgress, mouse }: SceneProps) {
  const { camera } = useThree();

  // Initialize camera far away in the tunnel
  useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.far = 150;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => {
    // 1. Calculate target Z based on scroll progress (tunnel spans Z = 0 to -115)
    // At progress 0: targetZ = 5
    // At progress 1: targetZ = -115
    const totalDistance = 120; // from Z = 5 to Z = -115
    const targetZ = 5 - (scrollProgress * totalDistance);

    // Lerp camera position Z for smooth inertia
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.06);

    // 2. Mouse parallax rotation (only affects X & Y cameras)
    const targetX = mouse.current.x * 0.8;
    const targetY = mouse.current.y * 0.8;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.06);

    // 3. Make camera look slightly ahead, plus add mouse offset
    camera.lookAt(targetX * 0.5, targetY * 0.5, camera.position.z - 8);
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, -20]} intensity={1.5} color="#A855F7" />
      <pointLight position={[0, 0, -60]} intensity={1.5} color="#8B5CF6" />
      <pointLight position={[0, 0, -100]} intensity={2.0} color="#f472b6" />

      {/* Atmospheric Fog: hides loading boundaries and matches space theme */}
      <fog attach="fog" args={['#050816', 4, 32]} />
    </>
  );
}

// ----------------------------------------------------
// MAIN CONTAINER COMPONENT
// ----------------------------------------------------
export default function Journey() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll position of the section relative to viewport
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollHeight = rect.height - windowHeight;

      // Calculate progress of scroll through this section
      // 0 means section starts entering viewport, 1 means section finished scrolling out of top
      const progress = Math.max(0, Math.min(1, -rect.top / scrollHeight));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll(); // Trigger initial calc

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Track mouse coordinates for interactive parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize between -1 and 1
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Map progress to active text phases
  const getActivePhase = () => {
    if (scrollProgress < 0.12) return 'intro';
    if (scrollProgress >= 0.12 && scrollProgress < 0.28) return 'p1';
    if (scrollProgress >= 0.28 && scrollProgress < 0.48) return 'p2';
    if (scrollProgress >= 0.48 && scrollProgress < 0.68) return 'p3';
    if (scrollProgress >= 0.68 && scrollProgress < 0.85) return 'p4';
    if (scrollProgress >= 0.85 && scrollProgress < 0.96) return 'p5';
    return 'final';
  };

  const activePhase = getActivePhase();

  // Dynamic projects list
  const projects = [
    {
      idx: '01',
      title: 'WhiteBoard',
      desc: 'Real-time collaborative whiteboard with infinite drawing canvas.',
      tags: ['React', 'WebSocket', 'Canvas API'],
      link: 'https://white-board-umber.vercel.app/'
    },
    {
      idx: '02',
      title: 'Interview-AI',
      desc: 'AI-powered interview simulator with voice feedback and transcripts.',
      tags: ['Next.js', 'OpenAI API', 'WebSpeech'],
      link: 'https://github.com/sumit-adak'
    },
    {
      idx: '03',
      title: 'AI Code Reviewer',
      desc: 'Holographic repository analyzer providing instant bug reviews.',
      tags: ['TypeScript', 'LLM Integration', 'Node.js'],
      link: 'https://github.com/sumit-adak'
    },
    {
      idx: '04',
      title: 'Edu Hub',
      desc: 'Floating student dashboard with custom calendar & AI helper.',
      tags: ['Full Stack', 'Tailwind', 'Database'],
      link: 'https://github.com/sumit-adak'
    },
    {
      idx: '05',
      title: 'Banking Ledger',
      desc: 'Futuristic secure transactional vault and auditing system.',
      tags: ['PostgreSQL', 'API Security', 'Ledger'],
      link: 'https://github.com/sumit-adak'
    }
  ];

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="journey-section">
        <div className="journey-sticky-wrapper">
          <div className="journey-overlay">
            <div className="phase-text intro-phase active">
              <h2>Every Build<br /><span className="gradient">Tells A Story.</span></h2>
              <p>Mine started with curiosity and evolved into building intelligent products.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="journey-section">
      <div className="journey-sticky-wrapper">
        
        {/* React Three Fiber Canvas */}
        <div className="journey-canvas-container">
          <Canvas camera={{ fov: 60 }}>
            <color attach="background" args={['#050816']} />
            
            {/* 3D Scene components */}
            <SceneController scrollProgress={scrollProgress} mouse={mouse} />
            <Tunnel />
            <Particles />
            <CuriosityCube />
            <ReactInterface />
            <NetworkGraph />
            <AIVisualization />
            <ProjectChamber3D />
            <SMTLogo />
          </Canvas>
        </div>

        {/* HTML Content Overlays */}
        <div className="journey-overlay">
          
          {/* Phase 0: Intro */}
          <div className={`phase-text intro-phase phase-center ${activePhase === 'intro' ? 'active' : ''}`}>
            <h2>Every Build<br /><span className="gradient">Tells A Story.</span></h2>
            <p>Mine started with curiosity and evolved into building intelligent products.</p>
          </div>

          {/* Phase 1: 2023 */}
          <div className={`phase-text phase-left ${activePhase === 'p1' ? 'active' : ''}`}>
            <span className="year">2023</span>
            <h3>Started Learning Programming</h3>
            <p>Sparked by curiosity, learning HTML, CSS, and Javascript. Tinkering with scripts and building simple browser layouts.</p>
          </div>

          {/* Phase 2: 2024 */}
          <div className={`phase-text phase-right ${activePhase === 'p2' ? 'active' : ''}`}>
            <span className="year">2024</span>
            <h3>Building Modern Interfaces</h3>
            <p>Transitioned into React, components, and responsive design. Crafting complex user interfaces and learning state management.</p>
          </div>

          {/* Phase 3: 2025 FS */}
          <div className={`phase-text phase-left ${activePhase === 'p3' ? 'active' : ''}`}>
            <span className="year">2025</span>
            <h3>Full Stack Development</h3>
            <p>Deep-dived into server architectures, REST APIs, and database modeling with PostgreSQL and Supabase. Bridging frontend and backend.</p>
          </div>

          {/* Phase 4: 2025 AI */}
          <div className={`phase-text phase-right ${activePhase === 'p4' ? 'active' : ''}`}>
            <span className="year">2025</span>
            <h3>Discovering Artificial Intelligence</h3>
            <p>Integrating large language models (LLMs) and training neural visual networks. Merging software architecture with intelligent systems.</p>
          </div>

          {/* Phase 5: 2026 Projects Chamber */}
          <div className={`projects-chamber ${activePhase === 'p5' ? 'active' : ''}`}>
            <div className="projects-chamber-title">
              <h3>Holographic Project Chamber</h3>
              <p>Hover cards to inspect — Click to explore repositories</p>
            </div>
            <div className="projects-grid">
              {projects.map((proj, i) => (
                <a key={i} href={proj.link} target="_blank" rel="noopener noreferrer" className="project-chamber-card">
                  <span className="card-index">{proj.idx}</span>
                  <div className="card-content">
                    <h4>{proj.title}</h4>
                    <p className="card-desc">{proj.desc}</p>
                  </div>
                  <div className="card-tags">
                    {proj.tags.map((tag, idx) => (
                      <span key={idx} className="tag-pill">{tag}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Phase 6: Final SMT Logo */}
          <div className={`phase-text final-phase phase-center ${activePhase === 'final' ? 'active' : ''}`}>
            <h2>SMT<span className="gradient">.</span></h2>
            <p className="subtitle">Still Building.</p>
            <p className="desc">The story is far from finished. Engineering with precision, crafting with passion.</p>
          </div>

          {/* Bottom indicator */}
          {scrollProgress < 0.95 && (
            <div className="scroll-indicator">
              <span>Scroll to Travel</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
