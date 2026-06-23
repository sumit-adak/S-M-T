'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export default function Loader() {
  const [isFullMode, setIsFullMode] = useState(true);
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'evolving' | 'collapsing' | 'monogram' | 'complete'>('idle');
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [statusLog, setStatusLog] = useState('// CONNECTING SYNAPSE CHANNELS...');

  const words = ['BUILD', 'DESIGN', 'CREATE', 'SHIP', 'INNOVATE'];

  useEffect(() => {
    // Determine mode based on dataset or path
    const isFull = typeof window !== 'undefined' && document.body.dataset.loader === 'full';
    setIsFullMode(isFull);

    // Initial delay for black screen impact
    setPhase('drawing');

    if (isFull) {
      // --- Full Cinematic Loading Timeline ---
      
      // Word cycling timer
      const wordInterval = setInterval(() => {
        setActiveWordIndex((prev) => {
          if (prev < words.length - 1) return prev + 1;
          clearInterval(wordInterval);
          return prev;
        });
      }, 550);

      // Status logs updates
      const logTimeouts = [
        setTimeout(() => setStatusLog('// INJECTING DESIGN SCHEMAS...'), 1000),
        setTimeout(() => setStatusLog('// RESOLVING IDENTITY COMPONENT...'), 2000),
        setTimeout(() => setStatusLog('// MONOGRAM RESOLUTION ACTIVE'), 3000),
        setTimeout(() => setStatusLog('// INITIALIZATION COMPLETE'), 3800),
      ];

      // Phase transitions
      const phaseTimeouts = [
        setTimeout(() => setPhase('evolving'), 1200),
        setTimeout(() => setPhase('collapsing'), 3000),
        setTimeout(() => setPhase('monogram'), 3300),
        setTimeout(() => {
          setPhase('complete');
          revealExperience();
        }, 4500),
      ];

      return () => {
        clearInterval(wordInterval);
        logTimeouts.forEach(clearTimeout);
        phaseTimeouts.forEach(clearTimeout);
      };
    } else {
      // --- Fast Snippet Loading Timeline for Subpages ---
      setStatusLog('// RUNNING OPTIMIZED SEQUENCE...');
      
      const logTimeout = setTimeout(() => setStatusLog('// INITIALIZATION COMPLETE'), 500);
      const phaseTimeouts = [
        setTimeout(() => setPhase('monogram'), 200),
        setTimeout(() => {
          setPhase('complete');
          revealExperience();
        }, 1100),
      ];

      return () => {
        clearTimeout(logTimeout);
        phaseTimeouts.forEach(clearTimeout);
      };
    }
  }, []);

  const revealExperience = () => {
    if (typeof window === 'undefined') return;

    // 1. Mark page as ready
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');

    // 2. Dispatch page:reveal event for GSAP script synchronization
    document.dispatchEvent(new CustomEvent('page:reveal'));

    // 3. Coordinate premium exit transition via GSAP if available
    const win = window as any;
    if (win.gsap) {
      const gsap = win.gsap;

      // Animate the main loader container sliding up and fading out smoothly
      gsap.to('.loader', {
        y: '-100vh',
        opacity: 0,
        duration: 1.2,
        ease: 'power4.inOut',
        onComplete: () => {
          const loaderEl = document.querySelector('.loader') as HTMLElement;
          if (loaderEl) loaderEl.style.display = 'none';
          if (win.ScrollTrigger) win.ScrollTrigger.refresh();
        }
      });

      // Zoom through monogram "S" monogram for luxury scale reveal
      gsap.to('.loader-monogram-container', {
        scale: 3.5,
        opacity: 0,
        duration: 1.0,
        ease: 'power3.inOut'
      });
    } else {
      // Fallback transition if GSAP has not loaded
      const loaderEl = document.querySelector('.loader') as HTMLElement;
      if (loaderEl) {
        loaderEl.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.85, 0, 0.15, 1)';
        loaderEl.style.opacity = '0';
        loaderEl.style.transform = 'translateY(-100vh)';
        setTimeout(() => {
          loaderEl.style.display = 'none';
        }, 800);
      }
    }
  };

  // Abstract geometric symbol paths configuration
  const lineVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    draw: (custom: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: custom, type: 'spring' as const, duration: 1.5, bounce: 0 },
        opacity: { delay: custom, duration: 0.3 }
      }
    }),
    collapse: {
      pathLength: 0,
      opacity: 0,
      transition: { duration: 0.6, ease: 'easeIn' }
    }
  };

  return (
    <div className="loader" aria-hidden="true">
      <div className="loader-viewport">
        {/* Editorial Layout Typography & Metadata (Nothing Design / Swiss Aesthetic) */}
        <AnimatePresence>
          {phase !== 'collapsing' && phase !== 'monogram' && phase !== 'complete' && (
            <>
              {/* Coordinates & Meta Indicators */}
              <motion.div
                className="loader-meta top-left mono"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 0.4, x: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                SYS.INIT // IDENTITY.ASM
              </motion.div>

              <motion.div
                className="loader-meta top-right mono"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 0.4, x: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                LOC. 26.2006° N / 90.2647° E
              </motion.div>

              <motion.div
                className="loader-meta bottom-left mono"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 0.4, x: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
              >
                VER. 2.0.6
              </motion.div>

              <motion.div
                className="loader-meta bottom-right mono"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 0.4, x: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
              >
                FRAME. 60FPS
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Center Animation Container */}
        <div className="loader-center-container">
          <AnimatePresence mode="wait">
            {(phase === 'drawing' || phase === 'evolving') && (
              <motion.div
                key="abstract-symbol"
                className="symbol-wrapper"
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                animate={
                  phase === 'evolving'
                    ? {
                        rotate: [0, 4, -4, 0],
                        y: [0, -6, 6, 0],
                        x: [0, 3, -3, 0],
                      }
                    : {}
                }
                style={{ originX: 0.5, originY: 0.5 }}
              >
                <svg viewBox="0 0 100 100" className="symbol-svg">
                  {/* Subtle Grid Blueprint Circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="0.5"
                    strokeDasharray="2 3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.0 }}
                  />

                  {/* Outer Diamond Framework */}
                  <motion.path
                    d="M 50 15 L 85 50 L 50 85 L 15 50 Z"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="0.75"
                    strokeDasharray="4 4"
                    variants={lineVariants}
                    initial="hidden"
                    animate="draw"
                    custom={0.2}
                  />

                  {/* Axis Crosshairs */}
                  <motion.path
                    d="M 50 15 V 35"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="0.75"
                    variants={lineVariants}
                    initial="hidden"
                    animate="draw"
                    custom={0.4}
                  />
                  <motion.path
                    d="M 50 85 V 65"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="0.75"
                    variants={lineVariants}
                    initial="hidden"
                    animate="draw"
                    custom={0.4}
                  />
                  <motion.path
                    d="M 15 50 H 28"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="0.75"
                    variants={lineVariants}
                    initial="hidden"
                    animate="draw"
                    custom={0.4}
                  />
                  <motion.path
                    d="M 85 50 H 72"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="0.75"
                    variants={lineVariants}
                    initial="hidden"
                    animate="draw"
                    custom={0.4}
                  />

                  {/* Left Bracket (Code Symbol Part 1) */}
                  <motion.path
                    d="M 38 35 L 26 50 L 38 65"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={lineVariants}
                    initial="hidden"
                    animate="draw"
                    custom={0.6}
                  />

                  {/* Right Bracket (Code Symbol Part 2) */}
                  <motion.path
                    d="M 62 35 L 74 50 L 62 65"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={lineVariants}
                    initial="hidden"
                    animate="draw"
                    custom={0.8}
                  />

                  {/* Central Slash (Code Symbol Part 3) */}
                  <motion.path
                    d="M 46 62 L 54 38"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    variants={lineVariants}
                    initial="hidden"
                    animate="draw"
                    custom={1.0}
                  />

                  {/* Vertex Points (Subtle Particles) */}
                  {[[26, 50], [74, 50], [50, 15], [50, 85]].map(([cx, cy], idx) => (
                    <motion.circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="1.25"
                      fill="#FFFFFF"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.8 }}
                      transition={{ delay: 1.1 + idx * 0.1, duration: 0.4 }}
                    />
                  ))}
                </svg>

                {/* Shifting Words Cycle (Inside the brackets) */}
                {isFullMode && (
                  <div className="words-wrapper">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={activeWordIndex}
                        className="word-text mono"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 0.9, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.25 }}
                      >
                        {words[activeWordIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {(phase === 'monogram' || (phase === 'drawing' && !isFullMode)) && (
              <motion.div
                key="monogram-s"
                className="loader-monogram-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.5, ease: 'easeOut' }
                }}
                exit={{ opacity: 0 }}
              >
                <svg viewBox="0 0 100 100" className="monogram-svg">
                  {/* Subtle outer accent ring */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="0.75"
                    initial={{ pathLength: 0 }}
                    animate={{
                      pathLength: 1,
                      transition: { duration: 0.8, ease: 'easeOut' }
                    }}
                  />
                  {/* Outer Monogram S Curve (Thicker line) */}
                  <motion.path
                    d="M 32,34 C 32,22 40,16 50,16 C 60,16 68,22 68,34 C 68,48 32,44 32,58 C 32,70 40,76 50,76 C 60,76 68,70 68,58"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{
                      pathLength: 1,
                      transition: { duration: 0.8, ease: 'easeInOut' }
                    }}
                  />
                  {/* Inner Parallel Monogram S Curve (Thinner accent line) */}
                  <motion.path
                    d="M 37,34 C 37,25 43,21 50,21 C 57,21 63,25 63,34 C 63,45 37,41 37,49 C 37,56 43,60 50,60 C 57,60 63,56 63,49"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1.0"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{
                      pathLength: 1,
                      transition: { duration: 0.8, ease: 'easeInOut', delay: 0.1 }
                    }}
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Organic Progress Terminal Log */}
        <div className="loader-status-container">
          <motion.div
            key={statusLog}
            className="loader-status-text mono"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {statusLog}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
