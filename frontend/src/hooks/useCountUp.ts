import { useEffect, useRef, useState } from 'react';

interface CountUpOptions {
    duration?: number;
    startOnView?: boolean;
}

/**
 * Animates a number from 0 to `end` over `duration` ms using requestAnimationFrame.
 * Triggers when the element enters the viewport.
 */
export function useCountUp(end: number, options: CountUpOptions = {}) {
    const { duration = 2000, startOnView = true } = options;
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (!startOnView) {
            animateCount();
            return;
        }

        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted.current) {
                    hasStarted.current = true;
                    animateCount();
                    observer.unobserve(element);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(element);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [end, duration, startOnView]);

    function animateCount() {
        const startTime = performance.now();

        function tick(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for natural deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    return { count, ref };
}
