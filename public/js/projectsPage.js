/* ============================================================
   VEESHAL.ME — /projects engine
   case reveals · filters · media modal
   (loader + transitions live in js/loader.js)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(pointer: fine)').matches;

/* page entrance plays when the shared loader lifts the curtain */
document.addEventListener('page:reveal', () => {
    if (prefersReducedMotion) return;
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.site-header', { yPercent: -120, duration: 0.6 })
        .from('.garage-title .word', { yPercent: 120, duration: 0.8, stagger: 0.07 }, 0.05)
        .from('.garage-sub, .filter-bar', { y: 24, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, 0.3);
});

/* ------------------------------------------------------------
   custom cursor (same as home)
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

        document.querySelectorAll('a, button, .case-media').forEach((el) => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }
}

/* ------------------------------------------------------------
   scroll progress wheel
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
   case reveals + media parallax
   ------------------------------------------------------------ */
function bindCaseAnimations() {
    if (prefersReducedMotion) return;

    gsap.utils.toArray('.case:not(.is-hidden)').forEach((entry) => {
        const media = entry.querySelector('.case-media');
        const body = entry.querySelector('.case-body');
        const num = entry.querySelector('.case-num');

        gsap.from(media, {
            y: 70,
            autoAlpha: 0,
            rotate: entry.matches(':nth-child(even)') ? 2.5 : -2.5,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: entry, start: 'top 80%' },
        });

        gsap.from(body.children, {
            y: 36,
            autoAlpha: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: entry, start: 'top 74%' },
        });

        if (num) {
            gsap.from(num, {
                xPercent: 40,
                autoAlpha: 0,
                ease: 'none',
                scrollTrigger: { trigger: entry, start: 'top 90%', end: 'top 35%', scrub: 1 },
            });
        }
    });
}

bindCaseAnimations();

/* ------------------------------------------------------------
   filters
   ------------------------------------------------------------ */
const filterBtns = document.querySelectorAll('.filter-btn');
const caseEls = document.querySelectorAll('.case');

filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const f = btn.dataset.filter;
        caseEls.forEach((c) => {
            const show = f === 'all' || c.dataset.cat === f;
            c.classList.toggle('is-hidden', !show);
        });

        const visible = document.querySelectorAll('.case:not(.is-hidden)');
        gsap.fromTo(visible,
            { y: 30, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out', overwrite: 'auto' }
        );

        ScrollTrigger.refresh();
    });
});

/* ------------------------------------------------------------
   media modal (videos & stills open in-page)
   ------------------------------------------------------------ */
const mediaModal = document.getElementById('mediaModal');
const popupVideo = document.getElementById('popupVideo');
const popupImage = document.getElementById('popupImage');
const closeMedia = document.getElementById('closeMedia');

function openCase(el) {
    const url = el.dataset.url;
    const videoSrc = el.dataset.video;
    const imageSrc = el.dataset.image;

    if (url) {
        window.open(url, '_blank');
        return;
    }
    if (!videoSrc && !imageSrc) return;

    popupVideo.style.display = 'none';
    popupImage.style.display = 'none';
    popupVideo.pause();

    if (videoSrc) {
        popupVideo.querySelector('source').setAttribute('src', videoSrc);
        popupVideo.load();
        popupVideo.play();
        popupVideo.style.display = 'block';
    } else if (imageSrc) {
        popupImage.setAttribute('src', imageSrc);
        popupImage.style.display = 'block';
    }

    mediaModal.style.display = 'flex';
}

document.querySelectorAll('[data-open-case]').forEach((el) => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        openCase(el);
    });
});

if (closeMedia) {
    closeMedia.addEventListener('click', () => {
        mediaModal.style.display = 'none';
        popupVideo.pause();
    });

    mediaModal.addEventListener('click', (e) => {
        if (e.target === mediaModal) {
            mediaModal.style.display = 'none';
            popupVideo.pause();
        }
    });
}
