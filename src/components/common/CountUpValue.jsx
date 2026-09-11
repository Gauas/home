import { useEffect, useRef, useState } from "react";

const DURATION_MS = 620;

function getDecimalPlaces(value) {
  return Number.isInteger(value) ? 0 : String(value).split(".")[1].length;
}

function formatValue(value, decimalPlaces) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: decimalPlaces,
    minimumFractionDigits: decimalPlaces,
  }).format(value);
}

export function CountUpValue({ value, suffix = "" }) {
  const elementRef = useRef(null);
  const hasPlayedRef = useRef(false);
  const decimalPlaces = getDecimalPlaces(value);
  const [displayValue, setDisplayValue] = useState(() => formatValue(0, decimalPlaces));

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasPlayedRef.current) return undefined;

    const finish = () => setDisplayValue(formatValue(value, decimalPlaces));
    const start = () => {
      hasPlayedRef.current = true;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }

      const startTime = performance.now();
      const update = (now) => {
        const progress = Math.min((now - startTime) / DURATION_MS, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        const currentValue = value * easedProgress;
        const roundedValue = decimalPlaces
          ? Number(currentValue.toFixed(decimalPlaces))
          : Math.round(currentValue);

        setDisplayValue(formatValue(roundedValue, decimalPlaces));
        if (progress < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      start();
    }, { threshold: 0.35 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [decimalPlaces, value]);

  return (
    <strong className="stat-value" ref={elementRef}>
      {displayValue}{suffix}
    </strong>
  );
}
