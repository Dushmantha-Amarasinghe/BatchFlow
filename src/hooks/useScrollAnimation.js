/**
 * useScrollAnimation.js
 * React hook that uses IntersectionObserver to add .visible class 
 * to elements when they enter the viewport, triggering CSS animations.
 */
import { useEffect } from 'react';

export function useScrollAnimation(selector = '.scroll-animate', options = {}) {
    useEffect(() => {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target); // fire once
                }
            });
        }, {
            threshold: options.threshold ?? 0.12,
            rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
        });

        const elements = document.querySelectorAll(selector);
        elements.forEach(el => obs.observe(el));

        return () => obs.disconnect();
    }, [selector]);
}
