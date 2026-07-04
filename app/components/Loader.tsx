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

// Odometer single digit column
function Digit({ value }: { value: string }) {
  return (
    <span className="digit-container">
      {/* Invisible spacer to reserve width and height */}
      <span className="digit-spacer" aria-hidden="true">
        {value || '0'}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        {value && (
          <motion.span
            key={value}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 180,
              damping: 22,
              mass: 0.7,
            }}
            className="digit-value"
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export default function Loader() {
  const [isFullMode, setIsFullMode] = useState(false);
  const { isLoaded } = useAssetLoader(isFullMode);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'fade_out_pct' | 'brand_reveal' | 'hold' | 'split' | 'ended'>('loading');

  // Detect mode on mount
  useEffect(() => {
    const isFull = typeof window !== 'undefined' && document.body.dataset.loader === 'full';
    setIsFullMode(isFull);
  }, []);

  // Smooth displayed progress logic
  useEffect(() => {
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
  }, [isLoaded, isFullMode]);

  // Phase transitions sequencing
  useEffect(() => {
    if (displayProgress === 100 && phase === 'loading') {
      if (isFullMode) {
        // Pause at 100% for 350ms
        const t1 = setTimeout(() => {
          setPhase('fade_out_pct');
        }, 350);
        return () => clearTimeout(t1);
      } else {
        // Subpage: skip reveal and go directly to split transition
        setPhase('split');
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-ready');
        document.dispatchEvent(new CustomEvent('page:reveal'));
      }
    }
  }, [displayProgress, phase, isFullMode]);

  useEffect(() => {
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
        document.dispatchEvent(new CustomEvent('page:reveal'));
      }, 600);
      return () => clearTimeout(t4);
    }

    if (phase === 'split') {
      // Split panels duration is 1400ms
      const t5 = setTimeout(() => {
        setPhase('ended');
      }, 1400);
      return () => clearTimeout(t5);
    }
  }, [phase]);

  if (phase === 'ended') return null;

  // Format odometer digits
  const hundredStr = displayProgress >= 100 ? '1' : '';
  const tenStr = displayProgress >= 10 ? Math.floor((displayProgress % 100) / 10).toString() : '0';
  const unitStr = (displayProgress % 10).toString();

  const letters = 'SUMIT'.split('');

  const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 110,
        damping: 15,
        mass: 0.9,
        delay: i * 0.12,
      },
    }),
  };

  const splitTransition = {
    ease: [0.16, 1, 0.3, 1] as const, // premium custom cubic-bezier (easeOutQuart-like)
    duration: 1.4,
  };

  return (
    <div className="loader">
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
              <Digit value={hundredStr} />
              <Digit value={tenStr} />
              <Digit value={unitStr} />
              <span className="percent-symbol">%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2, 3, 4: Split panels and brand reveal */}
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
    </div>
  );
}
