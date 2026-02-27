import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  duration?: number;
  decimals?: number;
  start?:    number;
}

export function useCountUp(
  target: number,
  { duration = 800, decimals = 0, start = 0 }: UseCountUpOptions = {}
): string {
  const [current, setCurrent] = useState(start);
  const rafRef                = useRef<number>(0);
  const startTimeRef          = useRef<number>(0);
  const prevTargetRef         = useRef<number>(start);

  useEffect(() => {
    const from      = prevTargetRef.current;
    const to        = target;
    const startTime = performance.now();
    startTimeRef.current  = startTime;
    prevTargetRef.current = to;

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOut(progress);
      const value    = from + (to - from) * eased;

      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  if (current >= 1_000_000) return `${(current / 1_000_000).toFixed(decimals || 2)}M`;
  if (current >= 1_000)     return `${(current / 1_000).toFixed(decimals || 1)}K`;
  return current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
