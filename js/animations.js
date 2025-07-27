// Animation utilities and intersection observer setup

class AnimationController {
    constructor() {
        this.observers = new Map();
        this.particles = [];
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupParticles();
        this.setupScrollAnimations();
        this.setupTypingAnimation();
    }

    // Intersection Observer for scroll-triggered animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, observerOptions);

        // Store observer for later use
        this.observers.set('main', observer);
    }

    // Animate elements when they come into view
    animateElement(element) {
        if (element.classList.contains('book-card')) {
            element.classList.add('fade-in');
        } else if (element.classList.contains('fade-in-observer')) {
            element.classList.add('observed');
        } else if (element.classList.contains('slide-in-left-observer')) {
            element.classList.add('observed');
        } else if (element.classList.contains('slide-in-right-observer')) {
            element.classList.add('observed');
        } else if (element.classList.contains('scale-in-observer')) {
            element.classList.add('observed');
        }
    }

    // Create floating particles background
    setupParticles() {
        const particlesContainer = document.getElementById('particles-background');
        if (!particlesContainer) return;

        const particleCount = window.innerWidth < 768 ? 20 : 50;
        
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(particlesContainer);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random particle styles
        const size = Math.random() * 4 + 2;
        const opacity = Math.random() * 0.5 + 0.1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(83, 52, 131, ${opacity}) 0%, transparent 70%);
            border-radius: 50%;
            left: ${x}%;
            top: ${y}%;
            animation: particleFloat ${duration}s ease-in-out ${delay}s infinite;
            pointer-events: none;
        `;

        container.appendChild(particle);
        this.particles.push(particle);
    }

    // Setup scroll-based animations
    setupScrollAnimations() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateScrollAnimations = () => {
            const scrollY = window.scrollY;
            const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
            
            // Header animation
            const header = document.querySelector('.header');
            if (header) {
                if (scrollY > 100) {
                    header.style.background = 'rgba(26, 26, 46, 0.95)';
                    header.style.backdropFilter = 'blur(15px)';
                } else {
                    header.style.background = 'rgba(26, 26, 46, 0.9)';
                    header.style.backdropFilter = 'blur(10px)';
                }
            }

            // Scroll to top button
            const scrollToTopBtn = document.getElementById('scroll-to-top');
            if (scrollToTopBtn) {
                if (scrollY > 300) {
                    scrollToTopBtn.classList.add('show');
                } else {
                    scrollToTopBtn.classList.remove('show');
                }
            }

            // Parallax effect for particles
            if (window.innerWidth > 768) {
                this.particles.forEach((particle, index) => {
                    const speed = (index % 3 + 1) * 0.5;
                    particle.style.transform = `translateY(${scrollY * speed}px)`;
                });
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        });
    }

    // Typing animation for hero title
    setupTypingAnimation() {
        const typingElement = document.querySelector('.typing-animation');
        if (!typingElement) return;

        const text = typingElement.textContent;
        typingElement.textContent = '';
        typingElement.style.borderRight = '3px solid var(--accent-purple)';
        
        let index = 0;
        const typeChar = () => {
            if (index < text.length) {
                typingElement.textContent += text.charAt(index);
                index++;
                setTimeout(typeChar, 100);
            } else {
                // Blinking cursor effect
                setInterval(() => {
                    typingElement.style.borderRightColor = 
                        typingElement.style.borderRightColor === 'transparent' 
                            ? 'var(--accent-purple)' 
                            : 'transparent';
                }, 500);
            }
        };

        // Start typing after a delay
        setTimeout(typeChar, 1000);
    }

    // Staggered animation for multiple elements
    staggerAnimation(elements, animationClass, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add(animationClass);
            }, index * delay);
        });
    }

    // Ripple effect for buttons
    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Smooth scroll to element
    smoothScrollTo(target, duration = 1000) {
        const targetElement = typeof target === 'string' 
            ? document.querySelector(target) 
            : target;
            
        if (!targetElement) return;

        const targetPosition = targetElement.offsetTop - 100;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    }

    // Easing function for smooth animations
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    // Loading animation
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('show');
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('show');
        }
    }

    // Toast notification animation
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // Observe elements for animations
    observeElements() {
        const observer = this.observers.get('main');
        if (!observer) return;

        // Observe book cards
        document.querySelectorAll('.book-card').forEach(card => {
            observer.observe(card);
        });

        // Observe other animated elements
        document.querySelectorAll('.fade-in-observer, .slide-in-left-observer, .slide-in-right-observer, .scale-in-observer').forEach(element => {
            observer.observe(element);
        });
    }

    // Cleanup animations
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.particles.forEach(particle => particle.remove());
        this.particles = [];
    }

    // Resize handler
    handleResize() {
        // Recreate particles for new screen size
        const particlesContainer = document.getElementById('particles-background');
        if (particlesContainer) {
            this.particles.forEach(particle => particle.remove());
            this.particles = [];
            this.setupParticles();
        }
    }
}

// CSS animations injection
const animationStyles = `
    @keyframes particleFloat {
        0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
        }
        25% {
            transform: translateY(-20px) translateX(10px) rotate(90deg);
        }
        50% {
            transform: translateY(0px) translateX(-10px) rotate(180deg);
        }
        75% {
            transform: translateY(20px) translateX(5px) rotate(270deg);
        }
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;

// Inject styles
if (!document.querySelector('#dynamic-animations')) {
    const style = document.createElement('style');
    style.id = 'dynamic-animations';
    style.textContent = animationStyles;
    document.head.appendChild(style);
}

// Export the animation controller
window.AnimationController = AnimationController;