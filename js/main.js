document.addEventListener('DOMContentLoaded', function() {

    // 0. Update Copyright Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 1. Responsive Navigation (Hamburger Menu)
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 2. Simple Scroll Animations
    const sectionsToAnimate = document.querySelectorAll('section');

    const observerOptions = {
        root: null, // relative to the viewport
        threshold: 0.1 // 10% of the item must be visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    sectionsToAnimate.forEach(section => {
        // Set initial state for animation
        section.style.opacity = 0;
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });

    // 3. Basic Client-Side Form Validation
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (name === '' || email === '' || message === '') {
                alert('Please fill out all required fields.');
                event.preventDefault(); // Stop form submission
                return;
            }

            // Simple email format validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert('Please enter a valid email address.');
                event.preventDefault(); // Stop form submission
                return;
            }

            // If validation passes, send data to backend
            const formData = {
                name: name,
                email: email,
                subject: document.getElementById('subject').value.trim(),
                message: message
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Message sent successfully!');
                    contactForm.reset(); // Clear the form
                } else {
                    alert(`Error: ${result.error || 'Failed to send message.'}`);
                }
            } catch (error) {
                console.error('Error submitting contact form:', error);
                alert('An error occurred while sending your message. Please try again later.');
            }
        });
    }

});