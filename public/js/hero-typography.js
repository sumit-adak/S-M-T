/* ============================================================
   SUMIT ADAK PORTFOLIO — HERO TYPOGRAPHY ENGINE
   GSAP Entrance · Spring Physics · Cursor Magnetism & Warp
   ============================================================ */

(function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Spring solver class for organic, weighted, lag-free motion
    class Spring {
        constructor(val = 0, stiffness = 0.06, damping = 0.12) {
            this.val = val;
            this.target = val;
            this.vel = 0;
            this.stiffness = stiffness;
            this.damping = damping;
        }
        update() {
            const force = (this.target - this.val) * this.stiffness;
            this.vel += force;
            this.vel *= (1 - this.damping);
            this.val += this.vel;
            return this.val;
        }
    }

    let isInteractionActive = false;
    let charData = [];
    let otherElements = [];
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let isMouseInHero = false;

    // Cache elements and their page-relative centers
    function cacheRects() {
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        charData.forEach((data) => {
            const rect = data.el.getBoundingClientRect();
            data.rect = {
                left: rect.left + scrollX,
                top: rect.top + scrollY,
                width: rect.width,
                height: rect.height
            };
        });

        otherElements.forEach((data) => {
            const rect = data.el.getBoundingClientRect();
            data.rect = {
                left: rect.left + scrollX,
                top: rect.top + scrollY,
                width: rect.width,
                height: rect.height
            };
        });
    }

    function initInteractiveTypography() {
        const title = document.querySelector('.hero-title.interactive-title');
        if (!title) return;

        const chars = title.querySelectorAll('.char');
        if (!chars.length) return;

        // Initialize spring state for every character
        charData = Array.from(chars).map((el) => {
            return {
                el: el,
                rect: { left: 0, top: 0, width: 0, height: 0 },
                x: new Spring(0, 0.05, 0.12),
                y: new Spring(0, 0.05, 0.12),
                rotX: new Spring(0, 0.03, 0.1),
                rotY: new Spring(0, 0.03, 0.1),
                rotZ: new Spring(0, 0.03, 0.1),
                skewX: new Spring(0, 0.03, 0.1),
                scale: new Spring(1, 0.05, 0.12),
                isHovered: false,
                isIdleAnimating: false
            };
        });

        // Track other warp-susceptible elements
        const warpSelectors = ['.hero-swoosh', '.hero-eyebrow', '.hero-copy'];
        otherElements = warpSelectors.map(selector => {
            const el = document.querySelector(selector);
            return el ? {
                el,
                rect: { left: 0, top: 0, width: 0, height: 0 },
                x: new Spring(0, 0.05, 0.12),
                y: new Spring(0, 0.05, 0.12),
                rotZ: new Spring(0, 0.03, 0.1)
            } : null;
        }).filter(Boolean);

        // Bind hover listeners for direct interaction details
        charData.forEach((data) => {
            data.el.addEventListener('mouseenter', () => {
                data.isHovered = true;
                document.body.classList.add('cursor-typography-hover');
            });
            data.el.addEventListener('mouseleave', () => {
                data.isHovered = false;
                document.body.classList.remove('cursor-typography-hover');
            });
        });

        // Coordinate mouse position tracking and grid line effects
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                targetMouseX = e.clientX;
                targetMouseY = e.clientY;
                isMouseInHero = true;

                const gridOverlay = document.querySelector('.hero-grid-overlay');
                if (gridOverlay) {
                    const rect = gridOverlay.getBoundingClientRect();
                    const relX = e.clientX - rect.left;
                    const relY = e.clientY - rect.top;
                    gridOverlay.style.setProperty('--mouse-x', `${relX}px`);
                    gridOverlay.style.setProperty('--mouse-y', `${relY}px`);
                    gridOverlay.classList.add('active');
                }
            });

            heroSection.addEventListener('mouseleave', () => {
                isMouseInHero = false;
                const gridOverlay = document.querySelector('.hero-grid-overlay');
                if (gridOverlay) {
                    gridOverlay.classList.remove('active');
                }
            });
        }

        window.addEventListener('resize', cacheRects);
        window.addEventListener('scroll', cacheRects);

        // Start spring physics update loop
        requestAnimationFrame(updateLoop);
    }

    // Spring solver loop running at 60 FPS
    function updateLoop() {
        if (isInteractionActive) {
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;
            const pageMouseX = targetMouseX + scrollX;
            const pageMouseY = targetMouseY + scrollY;

            charData.forEach((data) => {
                if (data.isIdleAnimating) return; // Let GSAP control during micro-animations

                const rect = data.rect;
                const elCenterX = rect.left + rect.width / 2;
                const elCenterY = rect.top + rect.height / 2;

                const dx = pageMouseX - elCenterX;
                const dy = pageMouseY - elCenterY;
                const dist = Math.hypot(dx, dy);

                // Target configurations (Rest state)
                let tx = 0;
                let ty = 0;
                let rx = 0;
                let ry = 0;
                let rz = 0;
                let sx = 0;
                let sc = 1;

                if (data.isHovered) {
                    // Hover overrides
                    rx = -8; 
                    ty = -6; // Lift
                    sc = 1.08; // Subtle scale
                } else if (isMouseInHero && dist < 220) {
                    // Soft magnetic field distortion
                    const influence = Math.pow((220 - dist) / 220, 1.5);
                    
                    tx = dx * 0.12 * influence; // Bend towards cursor
                    ty = dy * 0.12 * influence;
                    rx = -(dy / 220) * 12 * influence; 
                    ry = (dx / 220) * 12 * influence;  
                    rz = (dx / 220) * 5 * influence;   
                    sx = (dx / 220) * 8 * influence;   
                    sc = 1 + (0.05 * influence);
                }

                data.x.target = tx;
                data.y.target = ty;
                data.rotX.target = rx;
                data.rotY.target = ry;
                data.rotZ.target = rz;
                data.skewX.target = sx;
                data.scale.target = sc;

                // Update springs
                const curX = data.x.update();
                const curY = data.y.update();
                const curRotX = data.rotX.update();
                const curRotY = data.rotY.update();
                const curRotZ = data.rotZ.update();
                const curSkewX = data.skewX.update();
                const curScale = data.scale.update();

                // Apply premium transforms using transform only
                data.el.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0) ` +
                                         `perspective(600px) ` +
                                         `rotateX(${curRotX.toFixed(2)}deg) ` +
                                         `rotateY(${curRotY.toFixed(2)}deg) ` +
                                         `rotateZ(${curRotZ.toFixed(2)}deg) ` +
                                         `skewX(${curSkewX.toFixed(2)}deg) ` +
                                         `scale(${curScale.toFixed(2)})`;
            });

            // Distort secondary elements within radius
            otherElements.forEach((data) => {
                const rect = data.rect;
                const elCenterX = rect.left + rect.width / 2;
                const elCenterY = rect.top + rect.height / 2;

                const dx = pageMouseX - elCenterX;
                const dy = pageMouseY - elCenterY;
                const dist = Math.hypot(dx, dy);

                let tx = 0;
                let ty = 0;
                let rz = 0;

                if (isMouseInHero && dist < 220) {
                    const influence = Math.pow((220 - dist) / 220, 1.5);
                    tx = dx * 0.05 * influence;
                    ty = dy * 0.05 * influence;
                    rz = (dx / 220) * 1.5 * influence;
                }

                data.x.target = tx;
                data.y.target = ty;
                data.rotZ.target = rz;

                const curX = data.x.update();
                const curY = data.y.update();
                const curRotZ = data.rotZ.update();

                data.el.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0) rotateZ(${curRotZ.toFixed(2)}deg)`;
            });
        }
        requestAnimationFrame(updateLoop);
    }

    // Periodic soft aluminum sheen sweep
    function startSheenSweep() {
        setInterval(() => {
            charData.forEach((data, index) => {
                setTimeout(() => {
                    data.el.classList.add('sheen');
                    setTimeout(() => {
                        data.el.classList.remove('sheen');
                    }, 2100);
                }, index * 65); // 65ms stagger sweep
            });
        }, 13500); // Trigger every 13.5 seconds
    }

    // Small organic idle micro-movements
    function startIdleAnimations() {
        // 1. Blinking terminal cursor interaction on letter "I"
        setInterval(() => {
            const charI = document.getElementById('char-I');
            if (!charI || isMouseInHero) return;

            const dataI = charData[3];
            if (dataI.isHovered) return;

            const tl = gsap.timeline({
                onStart: () => { dataI.isIdleAnimating = true; },
                onComplete: () => { 
                    dataI.isIdleAnimating = false;
                    gsap.set(charI, { rotationY: 0 });
                }
            });

            // Rotate Y to edge-on, switch letter to cursor
            tl.to(charI, {
                rotationY: 90,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    charI.textContent = '|';
                    charI.style.fontFamily = 'monospace';
                    charI.style.fontWeight = 'normal';
                }
            });

            // Complete first half-spin to 180 degrees
            tl.to(charI, {
                rotationY: 180,
                duration: 0.2,
                ease: 'power2.out'
            });

            // Terminal cursor blinking hold
            tl.to(charI, { opacity: 0.2, duration: 0.1, yoyo: true, repeat: 1 });

            // Rotate Y back to edge-on, restore letter "I"
            tl.to(charI, {
                rotationY: 270,
                duration: 0.2,
                ease: 'power2.in',
                delay: 0.1,
                onComplete: () => {
                    charI.textContent = 'I';
                    charI.style.fontFamily = '';
                    charI.style.fontWeight = '';
                }
            });

            // Complete rotation back to 360 degrees
            tl.to(charI, {
                rotationY: 360,
                duration: 0.2,
                ease: 'power2.out'
            });

        }, 2800);

        // 2. Micro animations for other letters
        setInterval(() => {
            if (isMouseInHero) return;

            // Random indices excluding index 3 (the letter "I")
            const activeIndices = [0, 1, 2, 4, 5, 6, 7, 8];
            const randomIndex = activeIndices[Math.floor(Math.random() * activeIndices.length)];
            const targetChar = charData[randomIndex];
            if (!targetChar || targetChar.isHovered || targetChar.isIdleAnimating) return;

            targetChar.isIdleAnimating = true;

            if (randomIndex === 0) { // S breathes
                gsap.to(targetChar.el, {
                    scale: 1.04,
                    duration: 0.9,
                    yoyo: true,
                    repeat: 1,
                    ease: 'sine.inOut',
                    onComplete: () => { targetChar.isIdleAnimating = false; }
                });
            } else if (randomIndex === 1) { // U moves up 2px
                gsap.to(targetChar.el, {
                    y: -2,
                    duration: 0.6,
                    yoyo: true,
                    repeat: 1,
                    ease: 'sine.inOut',
                    onComplete: () => { targetChar.isIdleAnimating = false; }
                });
            } else if (randomIndex === 2) { // M skew
                gsap.to(targetChar.el, {
                    skewX: 4,
                    duration: 0.7,
                    yoyo: true,
                    repeat: 1,
                    ease: 'sine.inOut',
                    onComplete: () => { targetChar.isIdleAnimating = false; }
                });
            } else if (randomIndex === 4) { // T gentle rotation
                gsap.to(targetChar.el, {
                    rotation: 1.2,
                    duration: 0.6,
                    yoyo: true,
                    repeat: 1,
                    ease: 'sine.inOut',
                    onComplete: () => { targetChar.isIdleAnimating = false; }
                });
            } else { // ADAK letters
                gsap.to(targetChar.el, {
                    y: -1.5,
                    rotation: 0.8,
                    duration: 0.8,
                    yoyo: true,
                    repeat: 1,
                    ease: 'sine.inOut',
                    onComplete: () => { targetChar.isIdleAnimating = false; }
                });
            }
        }, 3800);
    }

    // Main page load entrance animation triggered by shared loader reveal or immediately if already revealed
    function runEntrance() {
        const title = document.querySelector('.hero-title.interactive-title');
        if (title) title.classList.add('revealed');

        if (prefersReducedMotion) {
            isInteractionActive = true;
            cacheRects();
            return;
        }

        // Set initial invisible & blurred styles
        gsap.set('.char', { opacity: 0, filter: 'blur(18px)' });

        const tl = gsap.timeline({
            onComplete: () => {
                isInteractionActive = true;
                // Clear filters and opacity to prevent GPU compositing lag during interaction
                gsap.set('.char', { clearProps: 'filter,opacity' });
                cacheRects();
                startIdleAnimations();
                startSheenSweep();
            }
        });

        const sumitChars = document.querySelectorAll('.first-name .char');
        const adakChars = document.querySelectorAll('.last-name .char');

        if (sumitChars.length < 5 || adakChars.length < 4) {
            isInteractionActive = true;
            return;
        }

        // --- SUMIT ENTRANCES ---
        // S enters from far left rotating slightly
        tl.fromTo(sumitChars[0],
            { x: -300, rotation: -20, opacity: 0, filter: 'blur(18px)' },
            { x: 0, rotation: 0, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'elastic.out(1.0, 0.75)' },
            0
        );
        // U falls from above with a soft bounce
        tl.fromTo(sumitChars[1],
            { y: -300, opacity: 0, filter: 'blur(18px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'elastic.out(1.1, 0.6)' },
            0.08
        );
        // M slides from right with slight perspective
        tl.fromTo(sumitChars[2],
            { x: 300, rotationY: 45, opacity: 0, filter: 'blur(18px)', transformPerspective: 600 },
            { x: 0, rotationY: 0, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'elastic.out(1.0, 0.75)' },
            0.16
        );
        // I rises from bottom rotating 180 degrees
        tl.fromTo(sumitChars[3],
            { y: 300, rotation: 180, opacity: 0, filter: 'blur(18px)' },
            { y: 0, rotation: 0, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'elastic.out(1.0, 0.75)' },
            0.24
        );
        // T scales from 0 to full size
        tl.fromTo(sumitChars[4],
            { scale: 0, opacity: 0, filter: 'blur(18px)' },
            { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'elastic.out(1.2, 0.6)' },
            0.32
        );

        // --- ADAK ENTRANCES ---
        // Starts after SUMIT is completed (1.4s startOffset)
        const adakStart = 1.4;

        // A rotates on X axis
        tl.fromTo(adakChars[0],
            { rotationX: 90, opacity: 0, filter: 'blur(18px)', transformPerspective: 600 },
            { rotationX: 0, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'elastic.out(1.2, 0.7)' },
            adakStart
        );
        // D drops from the top
        tl.fromTo(adakChars[1],
            { y: -300, opacity: 0, filter: 'blur(18px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.6, ease: 'bounce.out' },
            adakStart + 0.08
        );
        // Second A scales in with blur
        tl.fromTo(adakChars[2],
            { scale: 0, opacity: 0, filter: 'blur(18px)' },
            { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'elastic.out(1.2, 0.6)' },
            adakStart + 0.16
        );
        // K swings slightly before settling
        tl.fromTo(adakChars[3],
            { rotation: -45, opacity: 0, filter: 'blur(18px)', transformOrigin: 'top center' },
            { rotation: 0, opacity: 1, filter: 'blur(0px)', duration: 2.0, ease: 'elastic.out(1.5, 0.4)' },
            adakStart + 0.24
        );
    }

    function startTypographyEngine() {
        if (typeof gsap === 'undefined') {
            setTimeout(startTypographyEngine, 50);
            return;
        }

        initInteractiveTypography();

        if (window.pageRevealed) {
            runEntrance();
        } else {
            document.addEventListener('page:reveal', runEntrance);
        }
    }

    // Run initialization once scripts load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startTypographyEngine);
    } else {
        startTypographyEngine();
    }

})();
