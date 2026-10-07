"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** Finished artwork remains visible without JS; particles derive from its ink. */
export function StructureArt({ kind, essay }: { kind: "systems" | "press"; essay?: { title: string; href: string } }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const pause = useRef(false);
  const press = kind === "press";
  const src = `/artwork/ink-${press ? "press" : "systems"}.webp`;
  useEffect(() => {
    const el = root.current;
    const surface = canvas.current;
    if (!el || !surface) return;
    const ctx = surface.getContext("2d");
    if (!ctx) return;
    if (typeof window.matchMedia !== "function") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false, disposed = false, ready = false, request = 0, last = 0, time = 0, progress = 0;
    let trigger: { progress: number; kill(): void } | null = null;
    let points: { x: number; y: number; r: number; phase: number }[] = [];
    const source = new window.Image();
    function measure() {
      if (!ready) return;
      const width = 640;
      const height = Math.round(width * source.height / source.width);
      surface!.width = width; surface!.height = height;
      const sample = document.createElement("canvas"); sample.width = width; sample.height = height;
      const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
      if (!sampleCtx) return;
      sampleCtx.drawImage(source, 0, 0, width, height);
      const pixels = sampleCtx.getImageData(0, 0, width, height).data;
      points = [];
      for (let y = 8; y < height - 8; y += 5) for (let x = 8; x < width * .46; x += 5) {
        const n = (y * width + x) * 4;
        const ink = press ? 1 - pixels[n] / 255 : pixels[n] / 255;
        // Pick real ink near the dissolving side of the composition.
        if (pixels[n + 3] > 120 && ink > .5 && ((x * 7 + y * 3) % 19) < 3) points.push({ x, y, r: .5 + ink * .7, phase: x * .06 + y * .09 });
      }
      draw(); schedule();
    }
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, surface!.width, surface!.height);
      if (preference.matches) return;
      ctx.fillStyle = press ? "#111" : "#f1efe5";
      ctx.globalAlpha = .55;
      const dispersion = 1 + (1 - progress) * 9;
      for (const point of points) {
        const dx = Math.sin(time * .4 + point.phase) * dispersion;
        const dy = Math.cos(time * .3 + point.phase) * dispersion * .55;
        ctx.beginPath(); ctx.arc(point.x + dx, point.y + dy, point.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    function update() {
      if (pause.current) return;
      progress = trigger?.progress ?? .5;
      el!.style.setProperty("--art-progress", String(preference.matches ? .5 : progress));
      draw(); schedule();
    }
    function tick(timestamp: number) {
      request = 0;
      if (!visible || disposed || document.hidden || pause.current || preference.matches) return;
      if (timestamp - last > 32) { time += Math.min(timestamp - last, 50) / 1000; last = timestamp; draw(); }
      schedule();
    }
    function schedule() { if (!request && ready && visible && !disposed && !pause.current && !document.hidden && !preference.matches) request = requestAnimationFrame(tick); }
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    observer?.observe(el);
    source.onload = () => { if (!disposed) { ready = true; measure(); update(); } }; source.src = src;
    if (typeof ResizeObserver !== "undefined") {
      Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        trigger = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onUpdate: update, onRefresh: update });
        update();
      });
    }
    document.addEventListener("visibilitychange", update);
    preference.addEventListener("change", update);
    el.addEventListener("art-motion-change", update);
    return () => { disposed = true; source.onload = null; observer?.disconnect(); trigger?.kill(); cancelAnimationFrame(request); document.removeEventListener("visibilitychange", update); preference.removeEventListener("change", update); el.removeEventListener("art-motion-change", update); };
  }, [press, src]);
  function toggle() { pause.current = !pause.current; setPaused(pause.current); root.current?.dispatchEvent(new Event("art-motion-change")); }
  return <div ref={root} className={`finished-art ${press ? "finished-press" : "finished-systems"}`}>
    <div className="finished-art-top"><span>{press ? "Ideas, put into print." : "Prometheus"}</span><button onClick={toggle} aria-pressed={paused}>{paused ? "Resume motion" : "Pause motion"}</button></div>
    <div className="finished-art-stage">
      <Image src={press ? "/artwork/ink-press-base.webp" : src} alt={press ? "Printing press transitioning from rich halftone ink into precise mechanical linework" : "Connected systems transitioning from dimensional halftone spheres into fine construction lines"} fill sizes="(max-width: 767px) 100vw, 1100px" />
      <canvas ref={canvas} aria-hidden="true" />
      {press && <>
        <div className="finished-press-crank" aria-hidden="true"><Image src="/artwork/ink-press-moving.webp" alt="" fill sizes="(max-width: 767px) 100vw, 1100px" /></div>
        <div className="finished-press-feed">
          <Image src="/artwork/ink-press-moving.webp" alt="" fill sizes="(max-width: 767px) 100vw, 1100px" className="finished-press-paper" aria-hidden="true" />
          {essay && <Link href={essay.href} className="printed-essay"><span>From the archive</span><strong>{essay.title}</strong><span>Read essay ↗</span></Link>}
        </div>
      </>}
    </div>
    {!press && <div className="finished-art-bottom"><span>Applied AI. Connected systems.</span><a href="https://prometheus.today" target="_blank" rel="noopener noreferrer">Explore Prometheus ↗</a></div>}
  </div>;
}
