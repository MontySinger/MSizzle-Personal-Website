"use client";

import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    exit: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 },
  };

  return (
    // `initial={false}` skips the enter animation on first mount so the SSR
    // payload no longer wraps the page in `opacity:0;transform:translateY(20px)`
    // — that wrapper was hiding the LCP image until motion features loaded and
    // the fade-in ran. Route transitions still animate (exit → initial → animate).
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname === "/recommend" || pathname.startsWith("/recommend/") ? "/recommend" : pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: shouldReduceMotion ? 0.15 : 0.3,
          ease: "easeOut",
        }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
