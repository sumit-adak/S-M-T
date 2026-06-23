/* ============================================================
   VEESHAL.ME — shared loader + seamless page transitions
   Handles outbound navigation transitions and browser scroll.
   The main loading experience is handled in components/Loader.tsx.
   ============================================================ */

window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

(function () {
    const out = document.createElement('div');
    out.className = 'page-out';
    
    Object.assign(out.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '9991',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        clipPath: 'inset(100% 0% 0% 0%)',
        opacity: '0',
        pointerEvents: 'none',
    });
    
    // Minimalist watermark inside the outbound curtain
    out.innerHTML = `
        <div style="font-family: 'Clash Display', 'Arial Black', sans-serif; font-size: 24px; font-weight: 700; color: #ffffff; opacity: 0; letter-spacing: 0.15em; transform: scale(0.9);" class="outbound-logo">
            SMT.
        </div>
    `;
    
    document.body.appendChild(out);

    let leaving = false;

    // Back/forward cache restore: never leave a stuck curtain
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            leaving = false;
            if (typeof gsap !== 'undefined') {
                gsap.set(out, { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 0 });
                gsap.set('.outbound-logo', { opacity: 0, scale: 0.9 });
            } else {
                out.style.clipPath = 'inset(100% 0% 0% 0%)';
                out.style.opacity = '0';
            }
            out.style.pointerEvents = 'none';
            document.body.classList.remove('is-loading');
            document.body.classList.add('is-ready');
        }
    });

    function leaveTo(href) {
        if (leaving) return;
        leaving = true;
        out.style.pointerEvents = 'auto';
        
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline({
                onComplete: () => { window.location.href = href; }
            });
            
            tl.fromTo(out,
                { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 1 },
                {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    duration: 0.65,
                    ease: 'power4.inOut'
                }
            );
            
            tl.to('.outbound-logo', {
                opacity: 0.35,
                scale: 1,
                duration: 0.4,
                ease: 'power2.out'
            }, '-=0.25');
        } else {
            // Fallback if GSAP is not ready
            out.style.transition = 'clip-path 0.5s ease-in-out, opacity 0.5s ease-in-out';
            out.style.clipPath = 'inset(0% 0% 0% 0%)';
            out.style.opacity = '1';
            setTimeout(() => {
                window.location.href = href;
            }, 500);
        }
    }

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href]');
        if (!a) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return;

        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        const url = new URL(a.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.hash) return;

        e.preventDefault();
        leaveTo(a.href);
    });
})();
