const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    // Auto remove logic
    const duration = 4000;
    let timeout;

    const removeToast = () => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    };

    timeout = setTimeout(removeToast, duration);

    // Click to dismiss
    toast.addEventListener('click', () => {
        clearTimeout(timeout);
        removeToast();
    });

    container.appendChild(toast);
};

(function(__run){ if (document.readyState !== 'loading') __run(); else document.addEventListener('DOMContentLoaded', __run); })(() => {
    // Handle pill selection
    const pillGroups = document.querySelectorAll('.pills');

    pillGroups.forEach(group => {
        const pills = group.querySelectorAll('.pill-btn');

        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                // Remove active class from all pills in this group
                pills.forEach(p => p.classList.remove('active'));

                // Add active class to clicked pill
                pill.classList.add('active');
            });
        });
    });

    // EmailJS Initialization
    let emailjsInitialized = false;
    function initEmailJS() {
        if (emailjsInitialized) return true;
        if (typeof emailjs !== 'undefined' && typeof EMAIL_PUBLIC_KEY !== 'undefined' && EMAIL_PUBLIC_KEY) {
            emailjs.init(EMAIL_PUBLIC_KEY);
            emailjsInitialized = true;
            return true;
        }
        return false;
    }

    // Try initializing immediately in case emailjs is already loaded
    initEmailJS();

    // Handle Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            window.dispatchEvent(new CustomEvent('contact-form-submit'));

            const submitBtn = this.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            // Get values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Get selected category
            const activePill = document.querySelector('.pill-btn.active');
            const category = activePill ? activePill.innerText : 'Not Specified';

            // Generate Gravatar URL (PFP)
            let pfpUrl = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"; // Default
            if (email && typeof CryptoJS !== 'undefined') {
                const trimmedEmail = email.trim().toLowerCase();
                const hash = CryptoJS.MD5(trimmedEmail).toString();
                pfpUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
            }

            // Prepare template parameters
            const templateParams = {
                to_name: "Sumit",
                name: name,
                email: email,
                category: category,
                message: message,
                pfp: pfpUrl,
                time: new Date().toLocaleString()
            };

            // Try to initialize EmailJS in case it loaded asynchronously after contactScript.js started
            initEmailJS();

            const hasEmailJS = (
                typeof emailjs !== 'undefined' &&
                typeof EMAIL_PUBLIC_KEY !== 'undefined' && EMAIL_PUBLIC_KEY &&
                typeof EMAIL_SERVICE_ID !== 'undefined' && EMAIL_SERVICE_ID &&
                typeof EMAIL_TEMPLATE_ID !== 'undefined' && EMAIL_TEMPLATE_ID
            );

            if (!hasEmailJS) {
                const mailLink = document.querySelector('.gmailTxt a');
                const targetEmail = mailLink ? mailLink.textContent.trim() : "sumitbackend1@gmail.com";
                const subject = encodeURIComponent(`Contact: ${category} from ${name}`);
                const bodyText = encodeURIComponent(
                    `Name: ${name}\n` +
                    `Email: ${email}\n` +
                    `Category: ${category}\n\n` +
                    `Message:\n${message}`
                );
                
                window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${bodyText}`;
                
                window.dispatchEvent(new CustomEvent('contact-form-success'));
                showToast('Opening mail client...', 'success');
                contactForm.reset();
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams)
                .then(function () {
                    window.dispatchEvent(new CustomEvent('contact-form-success'));
                    showToast('Message Sent Successfully!', 'success');
                    contactForm.reset();
                    // Reset pills
                    document.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
                    document.querySelector('.pill-btn').classList.add('active'); // Set first as default
                }, function (error) {
                    window.dispatchEvent(new CustomEvent('contact-form-error'));
                    console.error('FAILED...', error);
                    
                    const mailLink = document.querySelector('.gmailTxt a');
                    const targetEmail = mailLink ? mailLink.textContent.trim() : "sumitbackend1@gmail.com";
                    const subject = encodeURIComponent(`Contact: ${category} from ${name}`);
                    const bodyText = encodeURIComponent(
                        `Name: ${name}\n` +
                        `Email: ${email}\n` +
                        `Category: ${category}\n\n` +
                        `Message:\n${message}`
                    );
                    
                    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${bodyText}`;
                    showToast('Sending failed. Opening mail client as fallback...', 'warning');
                    contactForm.reset();
                })
                .finally(() => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
});
