import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
    const { threshold = 0.15, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
    const ref = useRef<HTMLDivElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsRevealed(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsRevealed(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isRevealed };
}

/**
 * Hook that observes multiple children inside a container
 * and staggers their reveal animations.
 */
export function useStaggerReveal(options: ScrollRevealOptions = {}) {
    const { threshold = 0.1, rootMargin = '0px 0px -30px 0px', triggerOnce = true } = options;
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsRevealed(true);
                    if (triggerOnce) observer.unobserve(element);
                } else if (!triggerOnce) {
                    setIsRevealed(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, rootMargin, triggerOnce]);

    return { containerRef, isRevealed };
}
