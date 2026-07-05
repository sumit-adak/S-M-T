'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// Custom hook to track real asset loading progress with failsafe
function useAssetLoader(isFullMode: boolean) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let imagesTotal = 0;
    let imagesLoaded = 0;
    let videosTotal = 0;
    let videosLoaded = 0;
    let threeTotal = 0;
    let threeLoaded = 0;
    let fontsLoaded = false;
    let domLoaded = false;
    let isCleanedUp = false;

    const checkComplete = () => {
      if (isCleanedUp) return;

      const allImagesDone = imagesLoaded === imagesTotal;
      const allVideosDone = videosLoaded === videosTotal;
      const allThreeDone = threeLoaded === threeTotal;

      if (domLoaded && fontsLoaded && allImagesDone && allVideosDone && allThreeDone) {
        setIsLoaded(true);
      }
    };

    // 1. DOM Content Loading
    if (document.readyState === 'complete') {
      domLoaded = true;
      checkComplete();
    } else {
      const handleLoad = () => {
        domLoaded = true;
        checkComplete();
      };
      window.addEventListener('load', handleLoad);
    }

    // 2. Font Loading
    document.fonts.ready
      .then(() => {
        fontsLoaded = true;
        checkComplete();
      })
      .catch(() => {
        fontsLoaded = true;
        checkComplete();
      });

    // 3. Media Element Tracking
    const trackedElements = new Set<Element>();

    const updateMediaElements = () => {
      if (isCleanedUp) return;

      const images = Array.from(document.querySelectorAll('img'));
      const videos = Array.from(document.querySelectorAll('video'));

      let changed = false;

      images.forEach((img) => {
        // Skip lazy-loaded images, SVG placeholders, and empty sources
        const isCritical =
          img.src &&
          !img.src.startsWith('data:') &&
          img.getAttribute('loading') !== 'lazy';

        if (isCritical && !trackedElements.has(img)) {
          trackedElements.add(img);
          imagesTotal++;
          changed = true;

          if (img.complete) {
            imagesLoaded++;
          } else {
            const onLoad = () => {
              imagesLoaded++;
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
              checkComplete();
            };
            const onError = () => {
              imagesLoaded++; // treat error as loaded to prevent block
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
              checkComplete();
            };
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
          }
        }
      });

      videos.forEach((video) => {
        // Skip non-preloaded videos
        const isCritical =
          (video.src || video.querySelector('source')) &&
          video.getAttribute('preload') !== 'none';

        if (isCritical && !trackedElements.has(video)) {
          trackedElements.add(video);
          videosTotal++;
          changed = true;

          if (video.readyState >= 3) {
            videosLoaded++;
          } else {
            const onLoad = () => {
              videosLoaded++;
              video.removeEventListener('loadeddata', onLoad);
              video.removeEventListener('error', onError);
              checkComplete();
            };
            const onError = () => {
              videosLoaded++;
              video.removeEventListener('loadeddata', onLoad);
              video.removeEventListener('error', onError);
              checkComplete();
            };
            video.addEventListener('loadeddata', onLoad);
            video.addEventListener('error', onError);
          }
        }
      });

      if (changed) {
        checkComplete();
      }
    };

    // Scan initially
    updateMediaElements();

    // Observe future additions (lazy imports / dynamic components)
    const observer = new MutationObserver(() => {
      updateMediaElements();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 4. Three.js Loading Manager
    const originalOnStart = THREE.DefaultLoadingManager.onStart;
    const originalOnProgress = THREE.DefaultLoadingManager.onProgress;
    const originalOnLoad = THREE.DefaultLoadingManager.onLoad;

    THREE.DefaultLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      if (originalOnStart) originalOnStart(url, itemsLoaded, itemsTotal);
      threeTotal = itemsTotal;
      threeLoaded = itemsLoaded;
      checkComplete();
    };

    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (originalOnProgress) originalOnProgress(url, itemsLoaded, itemsTotal);
      threeTotal = itemsTotal;
      threeLoaded = itemsLoaded;
      checkComplete();
    };

    THREE.DefaultLoadingManager.onLoad = () => {
      if (originalOnLoad) originalOnLoad();
      threeLoaded = threeTotal;
      checkComplete();
    };

    // 5. Failsafe Timeout
    const limit = isFullMode ? 5000 : 2500;
    const failsafeTimeout = setTimeout(() => {
      setIsLoaded(true);
    }, limit);

    return () => {
      isCleanedUp = true;
      observer.disconnect();
      window.removeEventListener('load', checkComplete);
      clearTimeout(failsafeTimeout);
      THREE.DefaultLoadingManager.onStart = originalOnStart;
      THREE.DefaultLoadingManager.onProgress = originalOnProgress;
      THREE.DefaultLoadingManager.onLoad = originalOnLoad;
    };
  }, [isFullMode]);

  return { isLoaded };
}

// Helper to calculate delay starting from center outwards (middle strips first)
const numStrips = 10;
const getStripDelay = (index: number) => {
  const center = (numStrips - 1) / 2; // 4.5
  const distanceFromCenter = Math.abs(index - center);
  return (distanceFromCenter - 0.5) * 0.08;
};

export default function Loader() {
  const [isFullMode, setIsFullMode] = useState(false);
  const { isLoaded } = useAssetLoader(isFullMode);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'fade_out_pct' | 'brand_reveal' | 'hold' | 'split' | 'ended'>('loading');
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Detect mode on mount and session loaded check
  useEffect(() => {
    const isFull = typeof window !== 'undefined' && document.body.dataset.loader === 'full';
    setIsFullMode(isFull);

    if (typeof window !== 'undefined') {
      const hasLoaded = sessionStorage.getItem('hasLoadedBefore');
      
      // Subpages do not need full asset load sequence
      if (!isFull) {
        setIsFirstLoad(false);
        setPhase('split');
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-ready');
      } else if (hasLoaded) {
        setIsFirstLoad(false);
        setPhase('split');
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-ready');
      }
    }
  }, []);

  // Smooth displayed progress logic
  useEffect(() => {
    if (!isFirstLoad) return;

    let currentVal = 0;
    const startTime = Date.now();
    const MIN_DURATION = isFullMode ? 2200 : 700; // 2.2s for home, 0.7s for subpages
    let frameId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const timeProgress = Math.min(100, (elapsed / MIN_DURATION) * 100);

      // Clamp display progress at 99 if assets aren't fully loaded
      let target = timeProgress;
      if (!isLoaded && target > 99) {
        target = 99;
      }

      const diff = target - currentVal;
      if (diff > 0.01) {
        // Smooth ease-out increment
        const step = Math.max(0.1, diff * 0.1);
        currentVal = Math.min(target, currentVal + step);
        setDisplayProgress(Math.floor(currentVal));
      } else if (isLoaded && currentVal < 100) {
        // Once loaded, finalize count smoothly
        currentVal = Math.min(100, currentVal + 1.5);
        setDisplayProgress(Math.floor(currentVal));
      }

      if (currentVal < 100) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isLoaded, isFullMode, isFirstLoad]);

  // Phase transitions sequencing
  useEffect(() => {
    if (!isFirstLoad) return;

    if (displayProgress === 100 && phase === 'loading') {
      if (isFullMode) {
        // Pause at 100% for 350ms
        const t1 = setTimeout(() => {
          setPhase('fade_out_pct');
        }, 350);
        return () => clearTimeout(t1);
      } else {
        // Subpage fallback: skip reveal and go directly to split transition
        setPhase('split');
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-ready');
      }
    }
  }, [displayProgress, phase, isFullMode, isFirstLoad]);

  useEffect(() => {
    if (!isFirstLoad && phase !== 'split') return;

    if (phase === 'fade_out_pct') {
      // Fade out percentage takes 300ms
      const t2 = setTimeout(() => {
        setPhase('brand_reveal');
      }, 300);
      return () => clearTimeout(t2);
    }

    if (phase === 'brand_reveal') {
      // Letters reveal stagger + spring settling takes 850ms
      const t3 = setTimeout(() => {
        setPhase('hold');
      }, 850);
      return () => clearTimeout(t3);
    }

    if (phase === 'hold') {
      // Hold brand visible for 600ms
      const t4 = setTimeout(() => {
        setPhase('split');
        // Unlock page scrolling and make it visible underneath
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-ready');
      }, 600);
      return () => clearTimeout(t4);
    }

    if (phase === 'split') {
      const duration = isFirstLoad ? (isFullMode ? 2500 : 1600) : (isFullMode ? 1200 : 1600);
      
      if (isFirstLoad && typeof window !== 'undefined') {
        sessionStorage.setItem('hasLoadedBefore', 'true');
      }

      const t5 = setTimeout(() => {
        setPhase('ended');
        // Dispatch reveal event when the split transition is completely finished
        document.dispatchEvent(new CustomEvent('page:reveal'));
      }, duration);
      
      return () => clearTimeout(t5);
    }
  }, [phase, isFirstLoad, isFullMode]);

  if (phase === 'ended') return null;

  const showStrips = !isFullMode;
  const letters = 'SUMIT'.split('');

  const letterVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 90,
        damping: 18,
        mass: 1.0,
        delay: i * 0.14,
      },
    }),
  };

  const splitTransition = {
    ease: [0.16, 1, 0.3, 1] as const, // premium custom cubic-bezier (easeOutQuart-like)
    duration: isFirstLoad ? (isFullMode ? 2.5 : 1.2) : 1.2,
  };

  const stripVariants = {
    initial: { y: 0 },
    animate: (index: number) => ({
      y: index % 2 === 0 ? '-100%' : '100%',
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: getStripDelay(index),
      },
    }),
  };

  return (
    <div className="loader">
      {/* Premium aesthetic textures */}
      {phase === 'loading' && (
        <>
          <div className="loader-grid" />
          <div className="loader-glow" />
        </>
      )}

      {/* Phase 1: Percentage Counter */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            className="percentage-counter"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="odometer">
              <span className="odometer-number">{displayProgress}</span>
              <span className="percent-symbol">%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2, 3, 4: Split panels or strip transition */}
      {showStrips ? (
        <div className="strip-transition-container">
          {Array.from({ length: numStrips }).map((_, index) => (
            <motion.div
              key={index}
              className="strip"
              custom={index}
              variants={stripVariants}
              initial="initial"
              animate={phase === 'split' ? 'animate' : 'initial'}
            />
          ))}
        </div>
      ) : (
        <div className="split-panels">
          {/* Top Panel (Clipped to top 50%) */}
          <motion.div
            className="panel top-panel"
            initial={{ y: 0 }}
            animate={phase === 'split' ? { y: '-100%' } : { y: 0 }}
            transition={splitTransition}
          >
            <div className="panel-content">
              {phase !== 'loading' && phase !== 'fade_out_pct' && (
                <div className="brand-name">
                  {letters.map((char, i) => (
                    <motion.span
                      key={i}
                      custom={i}
                      variants={letterVariants}
                      initial="hidden"
                      animate="visible"
                      className="brand-letter"
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Bottom Panel (Clipped to bottom 50%) */}
          <motion.div
            className="panel bottom-panel"
            initial={{ y: 0 }}
            animate={phase === 'split' ? { y: '100%' } : { y: 0 }}
            transition={splitTransition}
          >
            <div className="panel-content">
              {phase !== 'loading' && phase !== 'fade_out_pct' && (
                <div className="brand-name">
                  {letters.map((char, i) => (
                    <motion.span
                      key={i}
                      custom={i}
                      variants={letterVariants}
                      initial="hidden"
                      animate="visible"
                      className="brand-letter"
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
