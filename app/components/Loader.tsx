'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Loader() {
  const [phase, setPhase] = useState<'loading' | 'split' | 'ended'>('loading');
  const [progress, setProgress] = useState(0);

  // Lock body scroll initially
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.add('is-loading');
      document.body.classList.remove('is-ready');
    }
  }, []);

  // Organic counter progress 0 -> 100%
  useEffect(() => {
    if (phase !== 'loading') return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.floor(Math.random() * 14) + 6;
        return Math.min(100, prev + increment);
      });
    }, 45);

    return () => clearInterval(interval);
  }, [phase]);

  // When progress hits 100%, trigger split curtain reveal
  useEffect(() => {
    if (progress === 100 && phase === 'loading') {
      const timer = setTimeout(() => {
        setPhase('split');
        if (typeof window !== 'undefined') {
          document.body.classList.remove('is-loading');
          document.body.classList.add('is-ready');
        }
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [progress, phase]);

  // Cleanup after curtain reveal
  useEffect(() => {
    if (phase === 'split') {
      const timer = setTimeout(() => {
        setPhase('ended');
        if (typeof window !== 'undefined') {
          (window as any).pageRevealed = true;
        }
        document.dispatchEvent(new CustomEvent('page:reveal'));
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (phase === 'ended') return null;

  const splitTransition = {
    ease: [0.16, 1, 0.3, 1] as const,
    duration: 0.9,
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-black overflow-hidden pointer-events-auto flex items-center justify-center select-none">
      {/* Center Brand "SUMIT." & Progress Overlay */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            key="sumit-brand-loader"
            className="relative z-[9999] flex flex-col items-center justify-center text-center px-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }}
          >
            {/* SUMIT. Brand Title */}
            <h1 className="text-[clamp(3.5rem,11vw,7.5rem)] font-extrabold tracking-[0.2em] text-white uppercase font-sans drop-shadow-[0_0_35px_rgba(168,85,247,0.45)]">
              SUMIT<span className="text-[#a855f7] drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]">.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-xs md:text-sm font-mono tracking-[0.4em] text-purple-200/80 uppercase">
              Full Stack &amp; AI Developer
            </p>

            {/* Progress Percentage Counter & Bar */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="text-2xl md:text-3xl font-extralight font-mono text-white tracking-widest">
                <span>{progress}</span>
                <span className="text-[#a855f7] ml-1">%</span>
              </div>

              {/* Glowing progress line */}
              <div className="w-52 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-sky-400 to-fuchsia-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.08 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split Curtain Panels for Smooth Reveal */}
      <div className="split-panels absolute inset-0 z-[9995] pointer-events-none">
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



