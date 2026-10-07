"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function FieldArtwork() {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const pause = useRef(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (typeof window.matchMedia !== "function") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let request = 0;
    const update = () => {
      request = 0;
      if (pause.current) return;
      const b = el.getBoundingClientRect();
      const travel = Math.max(1, el.offsetHeight - (innerHeight - 64));
      const p = Math.max(0, Math.min(1, (64 - b.top) / travel));
      el.style.setProperty("--field-progress", String(preference.matches ? 0 : p));
    };
    const schedule = () => { if (!request) request = requestAnimationFrame(update); };
    addEventListener("scroll", schedule, { passive: true }); addEventListener("resize", schedule); preference.addEventListener("change", schedule);
    el.addEventListener("field-motion-change", schedule); update();
    return () => { cancelAnimationFrame(request); removeEventListener("scroll", schedule); removeEventListener("resize", schedule); preference.removeEventListener("change", schedule); el.removeEventListener("field-motion-change", schedule); };
  }, []);
  return <div className="finished-field" ref={root}>
    <div className="finished-field-sticky">
      <div className="finished-field-image">
        <Image src="/home/tetons.jpg" alt="Monty hiking in front of the Teton Range" fill preload sizes="100vw" className="field-original" />
        <Image src="/artwork/ink-landscape.webp" alt="" fill sizes="100vw" className="field-ink" aria-hidden="true" />
      </div>
      <div className="finished-field-caption"><span>In the field. Into structure.</span><button aria-pressed={paused} onClick={() => { pause.current = !pause.current; setPaused(pause.current); root.current?.dispatchEvent(new Event("field-motion-change")); }}>{paused ? "Resume motion" : "Pause motion"}</button><span>Scroll to transform ↓</span></div>
    </div>
  </div>;
}
