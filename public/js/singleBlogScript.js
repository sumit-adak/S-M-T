
(function(__run){ if (document.readyState !== 'loading') __run(); else document.addEventListener('DOMContentLoaded', __run); })(() => {
    // 1. Smooth Scroll
    const tocLinks = document.querySelectorAll('.toc-link');

    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerOffset = 100;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 1.5 Copy to Clipboard
    const codeBlocks = document.querySelectorAll('.code-block');
    codeBlocks.forEach(block => {
        // Create button
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copy';

        // Add button to block
        block.appendChild(btn);

        // Click event
        btn.addEventListener('click', () => {
            const command = block.querySelector('.command') || block;
            const textToCopy = command.innerText.trim();

            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                btn.classList.add('copied');

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                btn.textContent = 'Error';
            });
        });
    });

    // 2. Scroll Spy (Scroll Event based)
    // Works better for flat content (h2... p... h2...) where headings scroll off-screen
    const sections = Array.from(tocLinks).map(link => {
        const id = link.getAttribute('href');
        return document.querySelector(id);
    }).filter(section => section !== null);

    function onScroll() {
        // Offset to trigger activation (e.g., 150px from top)
        const scrollPosition = window.scrollY + 150;

        let currentSection = null;

        // Find the last section that is above the scroll line
        sections.forEach(section => {
            // offsetTop is relative to parent, so strictly we want relative to document
            // Standard approach: section.offsetTop (works if no positioned parents interfere)
            if (section.offsetTop <= scrollPosition) {
                currentSection = section;
            }
        });

        // Determine if we are at the bottom of the page
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            currentSection = sections[sections.length - 1];
        }

        // Update Active Class
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (currentSection) {
                const activeId = '#' + currentSection.getAttribute('id');
                if (link.getAttribute('href') === activeId) {
                    link.classList.add('active');
                }
            }
        });
    }

    // Throttle scroll event for performance
    let isTicking = false;
    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                onScroll();
                isTicking = false;
            });
            isTicking = true;
        }
    });

    // Initial check
    onScroll();
});
