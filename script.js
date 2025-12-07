/**
 * UIUC Food Waste Awareness Website
 * Interactive features: Intersection Observer, localStorage, smooth scrolling
 */

(function() {
    'use strict';

    // ============================================
    // Intersection Observer for Fade-in Animations
    // ============================================
    const initFadeInAnimations = () => {
        const fadeElements = document.querySelectorAll('.fade-in');
        
        if (!fadeElements.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach(element => {
            observer.observe(element);
        });
    };

    // ============================================
    // localStorage for Checklist Persistence
    // ============================================
    const STORAGE_KEY = 'uiuc-food-waste-checklist';

    const saveChecklistState = () => {
        const checkboxes = document.querySelectorAll('.action-checkbox');
        const state = {};
        
        checkboxes.forEach(checkbox => {
            const action = checkbox.getAttribute('data-action');
            state[action] = checkbox.checked;
        });
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Could not save checklist state:', e);
        }
    };

    const loadChecklistState = () => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (!savedState) return;

            const state = JSON.parse(savedState);
            const checkboxes = document.querySelectorAll('.action-checkbox');
            
            checkboxes.forEach(checkbox => {
                const action = checkbox.getAttribute('data-action');
                if (state.hasOwnProperty(action)) {
                    checkbox.checked = state[action];
                }
            });
        } catch (e) {
            console.warn('Could not load checklist state:', e);
        }
    };

    const initChecklist = () => {
        const checkboxes = document.querySelectorAll('.action-checkbox');
        
        // Load saved state
        loadChecklistState();
        
        // Add event listeners
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', saveChecklistState);
            
            // Add keyboard support
            checkbox.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        });
    };

    // ============================================
    // Smooth Scrolling
    // ============================================
    const initSmoothScrolling = () => {
        const scrollLinks = document.querySelectorAll('a[href^="#"]');
        
        scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    };

    // ============================================
    // Enhanced Accessibility
    // ============================================
    const initAccessibility = () => {
        // Add skip link functionality if needed
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const main = document.querySelector('main');
                if (main) {
                    main.focus();
                    main.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Ensure all interactive elements are keyboard accessible
        const interactiveElements = document.querySelectorAll('a, button, input, [tabindex]');
        interactiveElements.forEach(element => {
            if (!element.hasAttribute('tabindex') && element.tagName !== 'A' && element.tagName !== 'BUTTON' && element.tagName !== 'INPUT') {
                element.setAttribute('tabindex', '0');
            }
        });
    };

    // ============================================
    // Performance Optimization
    // ============================================
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // ============================================
    // Initialize Everything
    // ============================================
    const init = () => {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initFadeInAnimations();
                initChecklist();
                initSmoothScrolling();
                initAccessibility();
            });
        } else {
            // DOM is already loaded
            initFadeInAnimations();
            initChecklist();
            initSmoothScrolling();
            initAccessibility();
        }
    };

    // Start initialization
    init();

    // Re-initialize fade-in animations if new elements are added dynamically
    // (useful for future enhancements)
    if (window.MutationObserver) {
        const mutationObserver = new MutationObserver(debounce(() => {
            initFadeInAnimations();
        }, 100));

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();

