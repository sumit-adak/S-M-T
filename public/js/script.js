// Force scroll to top immediately on page load - before any animations
window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

// Disable scrolling initially
document.body.style.overflow = "hidden";

// Loader — fast counter that finishes in ~1s
function startLoader() {
    let counterElement = document.querySelector('.counter');
    let currentValue = 0;

    function updateCounter() {
        if (currentValue === 100) {
            return;
        }

        currentValue += Math.floor(Math.random() * 20) + 10; // bigger jumps = faster

        if (currentValue > 100) {
            currentValue = 100;
        }

        counterElement.innerText = currentValue;

        let delay = Math.floor(Math.random() * 40) + 30; // shorter delay
        setTimeout(updateCounter, delay);
    }

    updateCounter();
}

startLoader();

// Create spokes
const spokesContainer = document.getElementById('spokes');
const numSpokes = 10;

for (let i = 0; i < numSpokes; i++) {
    const angle = (i * 360 / numSpokes);

    // Create spoke
    const spoke = document.createElement('div');
    spoke.className = 'spoke';
    spoke.style.transform = `rotate(${angle}deg)`;
    spokesContainer.appendChild(spoke);

    // Create bolt
    const bolt = document.createElement('div');
    bolt.className = 'bolt';

    // Position bolt along rim using percentages for responsiveness
    const boltAngle = angle * (Math.PI / 180);
    const boltRadiusPercent = 38.75; // 155px / 400px * 100
    bolt.style.left = `${50 + Math.cos(boltAngle) * boltRadiusPercent}%`;
    bolt.style.top = `${50 + Math.sin(boltAngle) * boltRadiusPercent}%`;

    document.querySelector('.wheel').appendChild(bolt);
}

// Wheel slides in from left — uses translateX (GPU-accelerated, same as home page)
gsap.fromTo(".wheel",
    {
        x: "-150vw",        // starts way off-screen left
        scale: 0.8,
    },
    {
        x: "0vw",           // lands in centre (loader is flex-centred)
        scale: 1,
        duration: 1.0,      // same feel as the home page slide
        ease: "power3.inOut",
        delay: 0.0,
    }
);

// Rotation starts as the wheel arrives — overlaps with the slide-in
const wheelTl = gsap.timeline({ delay: 0.3 });

// Main spin — builds up as it rolls in
wheelTl.to(".wheel", {
    duration: 0.8,
    rotation: 720,
    ease: "power2.inOut",
});

// Final burst spin
wheelTl.to(".wheel", {
    rotation: "+=360",
    duration: 0.5,
    ease: "power1.in",
});

// Home slides in — starts at 1s, takes 1s to reach centred position
// This gives a smooth, unhurried entry that the user can actually see
gsap.fromTo(
    ".home",
    {
        transform: "translateX(150%)",
        scale: 0.1,
    },
    {
        duration: 1.0,          // slow, smooth slide-in
        scale: 0.7,
        transform: "translateX(0%)",
        ease: "power3.inOut",
        delay: 1.0,             // starts 1s in, while loader is still present
    }
);

// Loader fades out after home has arrived and settled (~1s after home starts)
gsap.to(".loader", {
    duration: 0.6,
    scale: 0,
    ease: "power4.inOut",
    delay: 2.0,                 // home has been visible for ~1s before loader leaves
});

// Home expands to full size — runs at the same time as loader fades
gsap.to(".home", {
    duration: 0.8,              // smooth, not a snap
    scale: 1,
    ease: "power3.out",
    delay: 2.0,
    onComplete: () => {
        // Re-enable scrolling after animation
        document.body.style.overflow = "auto";
    }
});

// SINGLE PAGE SCROLLING ANIMATION
const sections = document.querySelectorAll("section, div[id$='Container']");
const navLinks = document.querySelectorAll("nav ul li a");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
});