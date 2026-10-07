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
    if (typeof window.matchMedia !== "function" || typeof ResizeObserver === "undefined") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let trigger: { progress: number; kill(): void } | null = null;
    const apply = (progress: number) => {
      if (pause.current) return;
      const p = preference.matches ? 0 : progress;
      const smooth = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
      const ink = smooth((p - .12) / .3);
      const lines = smooth((p - .58) / .3);
      el.style.setProperty("--field-progress", String(p));
      el.style.setProperty("--field-ink-opacity", String(ink));
      el.style.setProperty("--field-lines-opacity", String(lines));
      el.style.setProperty("--field-photo-opacity", String(1 - ink));
      el.style.setProperty("--field-title-fill", String(1 - lines));
      el.style.setProperty("--field-title-outline", String(lines));
      const shade = Math.round(245 * (1 - ink) + 20 * ink);
      el.style.setProperty("--field-text", `rgb(${shade} ${shade} ${shade})`);
    };
    const update = () => apply(trigger?.progress ?? 0);
    // ScrollTrigger batches scroll/resize work; CSS owns the sticky viewport.
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 64px",
        end: () => `+=${Math.max(1, el.offsetHeight - (el.querySelector<HTMLElement>(".finished-field-sticky")?.offsetHeight ?? innerHeight - 64))}`,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
      update();
    });
    preference.addEventListener("change", update);
    el.addEventListener("field-motion-change", update);
    return () => { disposed = true; trigger?.kill(); preference.removeEventListener("change", update); el.removeEventListener("field-motion-change", update); };
  }, []);
  return <div className="finished-field" ref={root}>
    <div className="finished-field-sticky">
      <div className="finished-field-image">
        <Image src="/home/tetons.jpg" alt="Monty hiking in front of the Teton Range" fill preload sizes="(max-width: 767px) 180vh, 100vw" className="field-original" />
        <Image src="/artwork/ink-landscape.webp" alt="" fill sizes="(max-width: 767px) 180vh, 100vw" className="field-ink" aria-hidden="true" />
        <Image src="/artwork/field-lines.webp" alt="" fill sizes="(max-width: 767px) 180vh, 100vw" className="field-lines" aria-hidden="true" />
        <div className="field-intro">
          <h1><span className="field-name-solid">Monty<span className="field-name-break"> </span>Singer.</span><span className="field-name-outline" aria-hidden="true">Monty<span className="field-name-break"> </span>Singer.</span></h1>
        </div>
      </div>
      <div className="finished-field-caption"><p>Founder of Prometheus,<br />an applied AI company.</p><a href="#building">Into the field <span aria-hidden="true">↘</span></a><button aria-pressed={paused} onClick={() => { pause.current = !pause.current; setPaused(pause.current); root.current?.dispatchEvent(new Event("field-motion-change")); }}>{paused ? "Resume motion" : "Pause motion"}</button></div>
    </div>
  </div>;
}
