/* ============================================================
   VEESHAL.ME — v2 home engine
   scroll effects · cursor · marquees
   (loader + transitions live in js/loader.js)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(pointer: fine)').matches;

function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.site-header', { yPercent: -120, duration: 0.7 })
        .from('.hero-title .word', {
            yPercent: 120,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power4.out',
        }, 0.1)
        .from('.hero-eyebrow, .hero-copy', { y: 24, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 0.35)
        .from('.social-row > *, .cta-row > *', { y: 18, autoAlpha: 0, duration: 0.4, stagger: 0.045 }, 0.5)
        .from('.stats .stat-item', { y: 24, autoAlpha: 0, duration: 0.5, stagger: 0.1 }, 0.65)
        .from('.portrait-card', {
            clipPath: 'inset(100% 0% 0% 0%)',
            duration: 1.0,
            ease: 'power4.inOut',
        }, 0.15)
        .from('.hero-ghost', { autoAlpha: 0, duration: 1.2 }, 0.6)
        .from('.scroll-cue', { autoAlpha: 0, duration: 0.6 }, 1);

    // hero swoosh draws itself
    const swoosh = document.querySelector('.hero-swoosh path');
    if (swoosh) {
        const len = swoosh.getTotalLength();
        gsap.set(swoosh, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(swoosh, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.7);
    }
    return tl;
}

/* hero entrance plays when the shared loader lifts the curtain */
document.addEventListener('page:reveal', () => {
    if (!prefersReducedMotion) heroIntro();
});

/* ------------------------------------------------------------
   CUSTOM CURSOR
   ------------------------------------------------------------ */
if (isFinePointer && !prefersReducedMotion) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (dot && ring) {
        const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
        const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
        const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
        const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

        window.addEventListener('mousemove', (e) => {
            dotX(e.clientX); dotY(e.clientY);
            ringX(e.clientX); ringY(e.clientY);
        });

        document.querySelectorAll('a, button, .menu-item, .card, .pill-btn').forEach((el) => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }
}

/* ------------------------------------------------------------
   SCROLL PROGRESS WHEEL (bottom-left, spins with scroll)
   ------------------------------------------------------------ */
const swRotor = document.querySelector('.scroll-wheel .sw-rotor');
const swProgress = document.querySelector('.scroll-wheel .sw-progress');

if (swRotor && swProgress) {
    const r = swProgress.r.baseVal.value;
    const circ = 2 * Math.PI * r;
    swProgress.style.strokeDasharray = circ;
    swProgress.style.strokeDashoffset = circ;

    ScrollTrigger.create({
        start: 0,
        end: () => document.documentElement.scrollHeight - window.innerHeight,
        onUpdate: (self) => {
            gsap.set(swRotor, { rotation: self.progress * 1080, transformOrigin: '50% 50%' });
            swProgress.style.strokeDashoffset = circ * (1 - self.progress);
        },
    });

    document.querySelector('.scroll-wheel').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ------------------------------------------------------------
   SCROLL EFFECTS (skipped for reduced motion)
   ------------------------------------------------------------ */
if (!prefersReducedMotion) {

    /* hero parallax */
    gsap.to('.portrait-card img', {
        yPercent: -8,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    gsap.to('.hero-ghost', {
        xPercent: -16,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* velocity-reactive marquee bands */
    document.querySelectorAll('.band-track').forEach((track) => {
        const loop = gsap.to(track, {
            xPercent: -50,
            duration: 24,
            repeat: -1,
            ease: 'none',
        });

        const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power2.out' });

        ScrollTrigger.create({
            trigger: track.closest('.band'),
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => {
                const v = self.getVelocity();
                loop.timeScale(gsap.utils.clamp(0.4, 5, 1 + Math.abs(v) / 800));
                skewTo(gsap.utils.clamp(-12, 12, v / 250));
            },
        });
    });

    /* section titles: words rise */
    document.querySelectorAll('.section-title').forEach((title) => {
        const words = title.querySelectorAll('.word');
        if (!words.length) return;
        gsap.from(words, {
            yPercent: 120,
            autoAlpha: 0,
            rotate: 4,
            duration: 0.9,
            stagger: 0.07,
            ease: 'power4.out',
            scrollTrigger: { trigger: title, start: 'top 88%' },
        });
    });

    /* draw-on-scroll SVG doodles */
    document.querySelectorAll('.doodle path').forEach((path) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: path.closest('.doodle'),
                start: 'top 92%',
                end: 'bottom 45%',
                scrub: 1,
            },
        });
    });

    /* showreel: cinematic zoom-out + frame reveal */
    const reelFrame = document.querySelector('.reel-frame');
    if (reelFrame) {
        gsap.from(reelFrame, {
            clipPath: 'inset(12% 8% 12% 8% round 24px)',
            duration: 1,
            ease: 'none',
            scrollTrigger: { trigger: reelFrame, start: 'top 85%', end: 'top 30%', scrub: 1 },
        });

        gsap.to('.reel-frame img, .reel-frame video', {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: reelFrame, start: 'top 90%', end: 'bottom 20%', scrub: 1 },
        });
    }

    /* portfolio cards + giant title */
    gsap.utils.toArray('.portfolio .card').forEach((card, i) => {
        gsap.from(card, {
            y: 90,
            autoAlpha: 0,
            rotate: i % 2 ? 3 : -3,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 92%' },
        });
    });

    const pTitle = document.querySelector('.portfolio-title');
    if (pTitle) {
        gsap.fromTo(pTitle,
            { scale: 0.7, autoAlpha: 0 },
            {
                scale: 1,
                autoAlpha: 1,
                ease: 'none',
                scrollTrigger: { trigger: '.portfolio', start: 'top 80%', end: 'center center', scrub: 1 },
            }
        );
    }

    /* featured menu rows slide in */
    gsap.utils.toArray('.menu-item').forEach((item, i) => {
        gsap.from(item, {
            y: 44,
            autoAlpha: 0,
            duration: 0.7,
            delay: (i % 4) * 0.05,
            ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 94%' },
        });
    });

    /* stats count-up */
    document.querySelectorAll('.stat-item h2 .count').forEach((el) => {
        const target = parseFloat(el.dataset.target || '0');
        const obj = { v: 0 };
        ScrollTrigger.create({
            trigger: el,
            start: 'top 95%',
            once: true,
            onEnter: () => {
                gsap.to(obj, {
                    v: target,
                    duration: 1.6,
                    ease: 'power2.out',
                    onUpdate: () => { el.textContent = Math.round(obj.v); },
                });
            },
        });
    });

    /* about statement: word-by-word ink-in */
    const statement = document.querySelector('.about-statement');
    if (statement) {
        gsap.to(statement.querySelectorAll('.w'), {
            opacity: 1,
            stagger: 0.06,
            ease: 'none',
            scrollTrigger: {
                trigger: statement,
                start: 'top 80%',
                end: 'bottom 45%',
                scrub: 1,
            },
        });
    }

    /* contact image tilt-in */
    const contactImg = document.querySelector('.contact-image');
    if (contactImg) {
        gsap.from(contactImg, {
            rotate: -10,
            y: 80,
            autoAlpha: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.contact-container', start: 'top 80%' },
        });
    }

    /* footer giant text slides from opposite sides */
    const fRows = document.querySelectorAll('.footer-giant .row > span');
    fRows.forEach((row, i) => {
        gsap.from(row, {
            xPercent: i % 2 ? 24 : -24,
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.footer-giant',
                start: 'top 95%',
                end: 'bottom bottom',
                scrub: 1,
            },
        });
    });
}

/* ------------------------------------------------------------
   SHOWREEL: glide the control to the top-right while playing
   ------------------------------------------------------------ */
const introVideoEl = document.getElementById('introVideo');
const reelFrameEl = document.querySelector('.reel-frame');

if (introVideoEl && reelFrameEl) {
    introVideoEl.addEventListener('play', () => reelFrameEl.classList.add('is-playing'));
    introVideoEl.addEventListener('pause', () => reelFrameEl.classList.remove('is-playing'));
    introVideoEl.addEventListener('ended', () => reelFrameEl.classList.remove('is-playing'));
}

/* ------------------------------------------------------------
   NAV ACTIVE STATE
   ------------------------------------------------------------ */
const navSections = document.querySelectorAll('[data-nav-section]');
const navLinks = document.querySelectorAll('.site-header nav a[href^="#"]');

if (navSections.length && navLinks.length) {
    window.addEventListener('scroll', () => {
        let current = '';
        navSections.forEach((section) => {
            if (window.scrollY >= section.offsetTop - 140) {
                current = section.id;
            }
        });
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }, { passive: true });
}
