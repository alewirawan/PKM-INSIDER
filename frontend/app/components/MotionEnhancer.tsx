"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MotionEnhancer() {
  const pathname = usePathname();
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return;
    const targets = document.querySelectorAll<HTMLElement>(
      [
        ".hero-copy > *",
        ".hero-visual",
        ".page-hero > *",
        ".news-card",
        ".program-card",
        ".value-grid article",
        ".step-grid article",
        ".club-grid span",
      ].join(","),
    );
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          if (typeof element.animate === "function")
            animations.push(
              element.animate(
                [
                  { opacity: 0.85, transform: "translateY(12px)" },
                  { opacity: 1, transform: "translateY(0)" },
                ],
                { duration: 420, easing: "ease-out" },
              ),
            );
          observer.unobserve(element);
        }
      },
      { threshold: 0.08 },
    );
    targets.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [pathname]);
  return null;
}
