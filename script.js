/**
 * UIUC Food Waste Awareness Website
 * Interactive features: Intersection Observer, localStorage, smooth scrolling, counter animations
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
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach(element => {
            observer.observe(element);
        });
    };

    // ============================================
    // Animated Counter for Statistics
    // ============================================
    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                if (target >= 100) {
                    element.textContent = Math.floor(current).toLocaleString();
                } else if (target < 1) {
                    element.textContent = current.toFixed(1);
                } else {
                    element.textContent = Math.floor(current);
                }
                requestAnimationFrame(updateCounter);
            } else {
                if (target >= 100) {
                    element.textContent = target.toLocaleString();
                } else if (target < 1) {
                    element.textContent = target.toFixed(1);
                } else {
                    element.textContent = target;
                }
            }
        };
        
        updateCounter();
    };

    const initCounterAnimations = () => {
        const statCards = document.querySelectorAll('.stat-card[data-target]');
        
        if (!statCards.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    const statNumber = entry.target.querySelector('.stat-number');
                    const target = parseFloat(entry.target.getAttribute('data-target'));
                    const dataValue = parseFloat(statNumber.getAttribute('data-value'));
                    
                    if (statNumber && target) {
                        const isCurrency = statNumber.textContent.includes('$');
                        const isPercentage = statNumber.textContent.includes('%');
                        
                        if (isCurrency) {
                            animateCounter(statNumber, dataValue, 2000);
                            statNumber.textContent = '$0';
                        } else {
                            animateCounter(statNumber, dataValue, 2000);
                            statNumber.textContent = '0';
                        }
                    }
                }
            });
        }, observerOptions);

        statCards.forEach(card => {
            observer.observe(card);
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
            updateProgressIndicator();
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
            updateProgressIndicator();
        } catch (e) {
            console.warn('Could not load checklist state:', e);
        }
    };

    // ============================================
    // Progress Indicator
    // ============================================
    const updateProgressIndicator = () => {
        const checkboxes = document.querySelectorAll('.action-checkbox');
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        const percentage = (checked / total) * 100;
        
        const progressCount = document.getElementById('progress-count');
        const progressFill = document.getElementById('progress-fill');
        
        if (progressCount) {
            progressCount.textContent = checked;
        }
        
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        
        // Celebration when all checked
        if (checked === total && total > 0) {
            showCelebration();
        }
    };

    const showCelebration = () => {
        const celebrationMessage = document.getElementById('celebration-message');
        if (celebrationMessage) {
            celebrationMessage.textContent = '🎉 Amazing! You\'ve committed to all 8 actions! You\'re making a real difference!';
            celebrationMessage.classList.add('show');
            
            // Remove after 5 seconds
            setTimeout(() => {
                celebrationMessage.classList.remove('show');
            }, 5000);
        }
    };

    const initChecklist = () => {
        const checkboxes = document.querySelectorAll('.action-checkbox');
        
        // Load saved state
        loadChecklistState();
        
        // Add event listeners
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                saveChecklistState();
                
                // Add visual feedback
                const checklistItem = checkbox.closest('.checklist-item');
                if (checklistItem && checkbox.checked) {
                    checklistItem.style.background = 'rgba(232, 74, 39, 0.1)';
                    setTimeout(() => {
                        checklistItem.style.background = '';
                    }, 300);
                }
            });
            
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
    // Share Commitment Functionality
    // ============================================
    const initShareCommitment = () => {
        const shareButton = document.getElementById('share-button');
        if (!shareButton) return;

        shareButton.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.action-checkbox');
            const checked = Array.from(checkboxes).filter(cb => cb.checked);
            const checkedActions = checked.map(cb => {
                const text = cb.closest('.checklist-item').querySelector('.checklist-text').textContent;
                return text;
            });

            let shareText = 'I\'m committed to reducing food waste at UIUC! ';
            shareText += `I've committed to ${checked.length} of ${checkboxes.length} actions: `;
            shareText += checkedActions.join(', ');
            shareText += ' Join me: https://uiuc-food-waste-awareness.vercel.app';

            if (navigator.share) {
                navigator.share({
                    title: 'Stop Food Waste at UIUC',
                    text: shareText,
                    url: 'https://uiuc-food-waste-awareness.vercel.app'
                }).catch(err => {
                    console.log('Error sharing:', err);
                    fallbackShare(shareText);
                });
            } else {
                fallbackShare(shareText);
            }
        });
    };

    const fallbackShare = (text) => {
        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                const celebrationMessage = document.getElementById('celebration-message');
                if (celebrationMessage) {
                    celebrationMessage.textContent = '✅ Commitment copied to clipboard! Share it anywhere.';
                    celebrationMessage.classList.add('show');
                    setTimeout(() => {
                        celebrationMessage.classList.remove('show');
                    }, 3000);
                }
            });
        } else {
            // Fallback: show text in alert
            alert(text);
        }
    };

    // ============================================
    // QR Code Generation
    // ============================================
    const generateQRCode = () => {
        const canvas = document.getElementById('qr-code');
        if (!canvas) return;

        const url = window.location.href;
        const size = 200;
        const qrSize = 25; // QR code grid size
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        
        // Simple QR-like pattern (for a real implementation, use a QR library)
        ctx.fillStyle = '#13294B';
        const cellSize = size / qrSize;
        
        // Create a simple pattern
        for (let i = 0; i < qrSize; i++) {
            for (let j = 0; j < qrSize; j++) {
                // Simple pattern based on position
                if ((i + j) % 3 === 0 || (i * j) % 7 === 0) {
                    ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                }
            }
        }
        
        // Add URL text below
        ctx.fillStyle = '#13294B';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Scan to visit', size / 2, size + 20);
    };

    // ============================================
    // Smooth Scrolling
    // ============================================
    const initSmoothScrolling = () => {
        const scrollLinks = document.querySelectorAll('a[href^="#"]');
        
        scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href === '#' || href === '#!') return;
                
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
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const main = document.querySelector('main');
                if (main) {
                    main.setAttribute('tabindex', '-1');
                    main.focus();
                    main.scrollIntoView({ behavior: 'smooth' });
                    main.removeAttribute('tabindex');
                }
            });
        }

        // Ensure all interactive elements are keyboard accessible
        const interactiveElements = document.querySelectorAll('a, button, input, [tabindex]');
        interactiveElements.forEach(element => {
            if (!element.hasAttribute('tabindex') && 
                element.tagName !== 'A' && 
                element.tagName !== 'BUTTON' && 
                element.tagName !== 'INPUT') {
                element.setAttribute('tabindex', '0');
            }
        });
    };

    // ============================================
    // Parallax Effects
    // ============================================
    const initParallax = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // Skip parallax if user prefers reduced motion
        }

        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            
            if (hero) {
                const rate = scrolled * 0.5;
                hero.style.transform = `translateY(${rate}px)`;
            }
            
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick);
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
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initFadeInAnimations();
                initCounterAnimations();
                initChecklist();
                initShareCommitment();
                initSmoothScrolling();
                initAccessibility();
                initParallax();
                generateQRCode();
            });
        } else {
            initFadeInAnimations();
            initCounterAnimations();
            initChecklist();
            initShareCommitment();
            initSmoothScrolling();
            initAccessibility();
            initParallax();
            generateQRCode();
        }
    };

    // Start initialization
    init();

    // Re-initialize fade-in animations if new elements are added dynamically
    if (window.MutationObserver) {
        const mutationObserver = new MutationObserver(debounce(() => {
            initFadeInAnimations();
            initCounterAnimations();
        }, 100));

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
