/**
 * Host Baran - Main Application
 * Global functionality and initialization
 */

// Global cart function (placeholder for e-commerce integration)
function addToCart(domain, price) {
    Utils.showNotification(`${domain} به سبد خرید اضافه شد`, 'success');
    console.log('Added to cart:', domain, price);
    // TODO: Integrate with actual shopping cart system
}

// Mobile menu toggle
const MobileMenu = {
    toggle: null,
    nav: null,
    
    init: function() {
        this.toggle = document.querySelector('.mobile-menu-toggle');
        this.nav = document.querySelector('.main-nav ul');
        
        if (!this.toggle || !this.nav) return;
        
        this.toggle.addEventListener('click', () => {
            this.nav.classList.toggle('active');
            this.toggle.classList.toggle('active');
        });
    }
};

// Scroll reveal animation
const ScrollReveal = {
    elements: [],
    
    init: function() {
        // Find all elements that should be revealed on scroll
        this.elements = document.querySelectorAll('.price-card, .feature-item, .section-header');
        
        if (this.elements.length === 0) return;
        
        this.observe();
    },
    
    observe: function() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        this.elements.forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }
};

// Smooth scroll for anchor links
const SmoothScroll = {
    init: function() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
};

// Header scroll effect
const HeaderEffect = {
    header: null,
    
    init: function() {
        this.header = document.querySelector('.site-header');
        if (!this.header) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.header.style.boxShadow = 'var(--shadow-md)';
            } else {
                this.header.style.boxShadow = 'none';
            }
        });
    }
};

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    MobileMenu.init();
    
    // Initialize scroll animations
    ScrollReveal.init();
    
    // Initialize smooth scrolling
    SmoothScroll.init();
    
    // Initialize header effects
    HeaderEffect.init();
    
    // Add loading state to body (for page load animation)
    document.body.classList.add('loaded');
    
    console.log('Host Baran initialized successfully');
});

// Handle page visibility change (pause animations when tab is not visible)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('paused');
    } else {
        document.body.classList.remove('paused');
    }
});

// Performance: Lazy load images (if any are added later)
const LazyLoad = {
    init: function() {
        const images = document.querySelectorAll('img[data-src]');
        
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
            });
            return;
        }
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
};

// Initialize lazy load
LazyLoad.init();

// Service Worker Registration (for future PWA support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment below to enable service worker
        // navigator.serviceWorker.register('./sw.js')
        //     .then(reg => console.log('ServiceWorker registered:', reg.scope))
        //     .catch(err => console.log('ServiceWorker registration failed:', err));
    });
}
