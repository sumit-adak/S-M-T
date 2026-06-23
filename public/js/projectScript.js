(function(__run){ if (document.readyState !== 'loading') __run(); else document.addEventListener("DOMContentLoaded", __run); })(function () {


    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach((item) => {
        const copyElements = item.querySelectorAll('.info, .name, .tag');

        copyElements.forEach((div) => {
            const copy = div.querySelector("p");

            if (copy) {
                const duplicateCopy = document.createElement("p");
                duplicateCopy.textContent = copy.textContent;
                div.appendChild(duplicateCopy);
            }
        });
    });

    const appendImages = (src) => {
        const preview1 = document.querySelector('.preview-img-1');
        const preview2 = document.querySelector('.preview-img-2');

        const img1 = document.createElement('img');
        const img2 = document.createElement('img');

        img1.src = src;
        img1.style.clipPath = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
        img2.src = src;
        img2.style.clipPath = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";

        preview1.appendChild(img1);
        preview2.appendChild(img2);

        gsap.to([img1, img2], {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
            duration: 1,
            ease: "power3.out",
            onComplete: function () {
                removeExtraImages(preview1);
                removeExtraImages(preview2);
            }
        });
    }

    function removeExtraImages(container) {
        while (container.children.length > 10) {
            container.removeChild(container.firstChild);
        }
    }

    document.querySelectorAll('.menu-item').forEach((item) => {
        item.addEventListener('mouseover', () => {
            mouseOverAnimation(item);
            const hoverSrc = item.getAttribute('data-hover-src');
            if (hoverSrc) appendImages(hoverSrc);
        });

        item.addEventListener('mouseout', () => {
            mouseOutAnimation(item);
        });
    });

    const mouseOverAnimation = (elem) => {
        gsap.to(elem.querySelectorAll("p:nth-child(1)"), {
            top: "-100%",
            duration: 0.3,
        });
        gsap.to(elem.querySelectorAll("p:nth-child(2)"), {
            top: "0%",
            duration: 0.3,
        });
    }

    const mouseOutAnimation = (elem) => {
        gsap.to(elem.querySelectorAll("p:nth-child(1)"), {
            top: "0%",
            duration: 0.3,
        });
        gsap.to(elem.querySelectorAll("p:nth-child(2)"), {
            top: "100%",
            duration: 0.3,
        });
    }

    document.querySelector('.menu').addEventListener('mouseout', function () {
        gsap.to('.preview-img img', {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1,
            ease: "power3.out",
        });
    });

    // Fixed mousemove event to account for scroll position
    document.addEventListener('mousemove', function (e) {
        const preview = document.querySelector('.preview');

        // Use clientX/Y for fixed elements so they track relative to the viewport
        const x = e.clientX;
        const y = e.clientY;

        gsap.to(preview, {
            x: x,
            y: y,
            duration: 1,
            ease: "power3.out",
        });
    });

    // URI
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", () => {
            const url = item.getAttribute("data-url");
            if (url) {
                window.open(url, "_blank"); // Opens in new tab
                // Or use window.location.href = url; to open in same tab
            }
        });
    });

    // VIDEO POP UP
    const mediaModal = document.getElementById("mediaModal");
    const popupVideo = document.getElementById("popupVideo");
    const popupImage = document.getElementById("popupImage");
    const closeMedia = document.getElementById("closeMedia");

    // Select all menu items
    const menuItem = document.querySelectorAll(".menu-item");

    menuItem.forEach(item => {
        item.addEventListener("click", () => {
            const videoSrc = item.getAttribute("data-video");
            const imageSrc = item.getAttribute("data-image");

            // ✅ Trigger popup only if menu item has a video or image
            if (!videoSrc && !imageSrc) {
                return; // Stop here if there's no data attribute
            }

            // Reset both video & image before showing
            popupVideo.style.display = "none";
            popupImage.style.display = "none";
            popupVideo.pause();

            if (videoSrc) {
                // Show video popup
                popupVideo.querySelector("source").setAttribute("src", videoSrc);
                popupVideo.load();
                popupVideo.play();
                popupVideo.style.display = "block";
            }
            else if (imageSrc) {
                // Show image popup
                popupImage.setAttribute("src", imageSrc);
                popupImage.style.display = "block";
            }

            // Show the modal
            mediaModal.style.display = "flex";
        });
    });

    // Close modal when clicking close button
    closeMedia.addEventListener("click", () => {
        mediaModal.style.display = "none";
        popupVideo.pause();
    });

    // Close modal when clicking outside the content
    mediaModal.addEventListener("click", (e) => {
        if (e.target === mediaModal) {
            mediaModal.style.display = "none";
            popupVideo.pause();
        }
    });
});