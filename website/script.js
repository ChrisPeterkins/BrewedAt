// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80; // Height of fixed navbar
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate feature cards on scroll
document.addEventListener('DOMContentLoaded', () => {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate steps on scroll
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(30px)';
        step.style.transition = `opacity 0.5s ease ${index * 0.2}s, transform 0.5s ease ${index * 0.2}s`;
        observer.observe(step);
    });
});

// Add navbar background on scroll
const navbar = document.querySelector('.nav-container');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 248, 231, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(101, 67, 33, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 248, 231, 0.95)';
        navbar.style.boxShadow = '0 1px 3px rgba(101, 67, 33, 0.05)';
    }
});

// Animate numbers in stats
const animateNumbers = () => {
    const stats = document.querySelectorAll('.stat-number');

    stats.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/\D/g, ''));
        const suffix = stat.textContent.replace(/[0-9]/g, '');
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current).toLocaleString() + suffix;
        }, 30);
    });
};

// Trigger number animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateNumbers();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Mobile menu toggle (if needed in future)
const mobileMenuToggle = () => {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('mobile-active');
    }
};

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image');
    if (heroImage && window.innerWidth > 768) {
        heroImage.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// Form validation (if contact form added later)
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Add hover effect to download buttons
const downloadButtons = document.querySelectorAll('.store-button');
downloadButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Add loading animation for images
const images = document.querySelectorAll('img');
images.forEach(img => {
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
});

// Progress bar animation in phone mockup
const animateProgressBars = () => {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
};

// Trigger progress animation when phone mockup is visible
const phoneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateProgressBars();
            phoneObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const phoneMockup = document.querySelector('.phone-mockup');
if (phoneMockup) {
    phoneObserver.observe(phoneMockup);
}

// Email signup form handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('emailSignupForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email');
            const email = emailInput.value;
            const messageElement = form.querySelector('.form-message');
            const btnText = form.querySelector('.btn-text');
            const btnLoading = form.querySelector('.btn-loading');
            const submitButton = form.querySelector('button[type="submit"]');

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                messageElement.textContent = 'Please enter a valid email address';
                messageElement.className = 'form-message error';
                return;
            }

            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-block';
            submitButton.disabled = true;
            messageElement.textContent = '';
            messageElement.className = 'form-message';

            // Simulate API call (replace with your actual backend endpoint)
            try {
                // For now, just simulate a successful signup after 1 second
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Store email in localStorage for demo purposes
                const emails = JSON.parse(localStorage.getItem('brewedat_emails') || '[]');
                if (!emails.includes(email)) {
                    emails.push(email);
                    localStorage.setItem('brewedat_emails', JSON.stringify(emails));
                }

                messageElement.textContent = '🎉 Thanks for signing up! We\'ll keep you updated.';
                messageElement.className = 'form-message success';
                emailInput.value = '';

                // Reset button after 3 seconds
                setTimeout(() => {
                    btnText.style.display = 'inline-block';
                    btnLoading.style.display = 'none';
                    submitButton.disabled = false;
                    messageElement.textContent = '';
                }, 3000);

            } catch (error) {
                messageElement.textContent = 'Oops! Something went wrong. Please try again.';
                messageElement.className = 'form-message error';

                // Reset button
                btnText.style.display = 'inline-block';
                btnLoading.style.display = 'none';
                submitButton.disabled = false;
            }
        });
    }
});

// Photo Carousel
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carouselTrack');
    const prevButton = document.getElementById('carouselPrev');
    const nextButton = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');

    if (!track || !prevButton || !nextButton || !dotsContainer) return;

    const slides = Array.from(track.children);
    const slideCount = slides.length;
    let currentIndex = 0;
    let autoplayInterval;

    // Calculate visible slides based on screen width
    const getVisibleSlides = () => {
        if (window.innerWidth <= 640) return 1;
        if (window.innerWidth <= 968) return 2;
        return 3;
    };

    // Create dots
    const createDots = () => {
        dotsContainer.innerHTML = '';
        const visibleSlides = getVisibleSlides();
        const dotCount = Math.max(1, slideCount - visibleSlides + 1);

        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    };

    // Update dots
    const updateDots = () => {
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    };

    // Move to slide
    const goToSlide = (index) => {
        const visibleSlides = getVisibleSlides();
        const maxIndex = Math.max(0, slideCount - visibleSlides);
        currentIndex = Math.max(0, Math.min(index, maxIndex));

        const slideWidth = slides[0].getBoundingClientRect().width;
        const gap = 20;
        const offset = -(currentIndex * (slideWidth + gap));

        track.style.transform = `translateX(${offset}px)`;
        updateDots();
    };

    // Next slide
    const nextSlide = () => {
        const visibleSlides = getVisibleSlides();
        const maxIndex = Math.max(0, slideCount - visibleSlides);
        if (currentIndex < maxIndex) {
            goToSlide(currentIndex + 1);
        } else {
            goToSlide(0); // Loop back to start
        }
    };

    // Previous slide
    const prevSlide = () => {
        if (currentIndex > 0) {
            goToSlide(currentIndex - 1);
        } else {
            const visibleSlides = getVisibleSlides();
            const maxIndex = Math.max(0, slideCount - visibleSlides);
            goToSlide(maxIndex); // Loop to end
        }
    };

    // Autoplay
    const startAutoplay = () => {
        stopAutoplay();
        autoplayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    };

    const stopAutoplay = () => {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    };

    // Event listeners
    nextButton.addEventListener('click', () => {
        nextSlide();
        stopAutoplay();
        startAutoplay();
    });

    prevButton.addEventListener('click', () => {
        prevSlide();
        stopAutoplay();
        startAutoplay();
    });

    // Pause autoplay on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            createDots();
            goToSlide(0); // Reset to first slide on resize
        }, 250);
    });

    // Initialize
    createDots();
    goToSlide(0);
    startAutoplay();
});