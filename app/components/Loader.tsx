'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Loader() {
  const [phase, setPhase] = useState<'loading' | 'split' | 'ended'>('loading');

  // Lock scrolling initially
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.add('is-loading');
      document.body.classList.remove('is-ready');
    }
  }, []);

  // Show "SUMIT." briefly, then open portfolio
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === 'loading') {
        setPhase('split');
        if (typeof window !== 'undefined') {
          document.body.classList.remove('is-loading');
          document.body.classList.add('is-ready');
        }
      }
    }, 1300); // 1.3s clean display duration

    return () => clearTimeout(timer);
  }, [phase]);

  // Clean up loader after curtain reveal completes
  useEffect(() => {
    if (phase === 'split') {
      const timer = setTimeout(() => {
        setPhase('ended');
        if (typeof window !== 'undefined') {
          (window as any).pageRevealed = true;
        }
        document.dispatchEvent(new CustomEvent('page:reveal'));
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (phase === 'ended') return null;

  const splitTransition = {
    ease: [0.16, 1, 0.3, 1] as const,
    duration: 1.2,
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-black overflow-hidden pointer-events-auto flex items-center justify-center">
      {/* Elegant "SUMIT." Brand Display */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            className="z-[9999] flex items-center justify-center select-none"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-extrabold tracking-[0.2em] text-white uppercase font-sans">
              SUMIT<span className="text-[#a855f7]">.</span>
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split Curtain Panels for Smooth Reveal */}
      <div className="split-panels z-[9995]">
        <motion.div
          className="panel top-panel"
          initial={{ y: 0 }}
          animate={phase === 'split' ? { y: '-100%' } : { y: 0 }}
          transition={splitTransition}
        />
        <motion.div
          className="panel bottom-panel"
          initial={{ y: 0 }}
          animate={phase === 'split' ? { y: '100%' } : { y: 0 }}
          transition={splitTransition}
        />
      </div>
    </div>
  );
}
