"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { crankPose, spherePoint } from "@/lib/artwork-motion";

// Positions follow the spheres in the finished 3:1 illustration.
const SPHERES = [
  { x: .205, y: .489, r: .123, solid: true },
  { x: .361, y: .422, r: .034, solid: true },
  { x: .446, y: .620, r: .041, solid: true },
  { x: .604, y: .497, r: .063, solid: false },
  { x: .732, y: .630, r: .027, solid: false },
  { x: .820, y: .343, r: .044, solid: false },
  { x: .928, y: .616, r: .035, solid: false },
];
const CONNECTIONS = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6]];

/** Finished illustrations remain as the static and reduced-motion fallback. */
export function StructureArt({ kind, essay }: { kind: "systems" | "press"; essay?: { title: string; href: string } }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const press = kind === "press";
  const src = `/artwork/ink-${press ? "press-base" : "systems"}.webp`;
  useEffect(() => {
    const el = root.current;
    const surface = canvas.current;
    if (!el || !surface || typeof window.matchMedia !== "function") return;
    const ctx = surface.getContext("2d");
    if (!ctx) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false, disposed = false, ready = false, request = 0, last = 0, time = 0, progress = .5;
    let trigger: { progress: number; kill(): void } | null = null;
    const points: { x: number; y: number; r: number; phase: number }[] = [];
    const source = new window.Image();
    const moving = new window.Image();
    surface.width = 1200;
    surface.height = press ? 600 : 400;
    const width = surface.width, height = surface.height;
    const scale = width / 1774;

    function drawCrank() {
      if (!ctx || !moving.complete || !moving.naturalWidth) return;
      const { hub, elbow, grip } = crankPose(time * .65 + progress * Math.PI * 1.5, width, height);
      // The shaft is fixed. Only the arm revolves in its projected end plane.
      // The illustrated grip translates along the orbit without tumbling.
      const path = new Path2D();
      const inset = 20 * scale;
      path.moveTo(hub.x, hub.y);
      path.lineTo(elbow.x, elbow.y - inset * Math.cos(time * .65 + progress * Math.PI * 1.5));
      path.quadraticCurveTo(elbow.x, elbow.y, elbow.x + inset, elbow.y);
      path.lineTo(grip.x, grip.y);
      ctx.globalAlpha = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#171717"; ctx.lineWidth = 23 * scale; ctx.stroke(path);
      ctx.strokeStyle = "#dad9d1"; ctx.lineWidth = 18 * scale; ctx.stroke(path);
      ctx.strokeStyle = "#f1efe5"; ctx.lineWidth = 10 * scale; ctx.stroke(path);
      ctx.save();
      ctx.translate(-3 * scale, 0);
      ctx.strokeStyle = "#55554f"; ctx.lineWidth = 1.4 * scale; ctx.stroke(path);
      ctx.restore();
      ctx.save();
      ctx.translate(4 * scale, 0);
      ctx.strokeStyle = "#78786e"; ctx.lineWidth = 1 * scale; ctx.stroke(path);
      ctx.restore();
      // Sample original raster details at runtime; no new replacement artwork.
      ctx.drawImage(moving, 1506, 398, 235, 92, grip.x - 7 * scale, grip.y - 43 * scale, 235 * scale, 92 * scale);
    }

    function drawShaft() {
      if (!ctx) return;
      // The fixed collar belongs to the roller, behind the near-side arm.
      // Keep the collar and shaft, excluding the old downward arm.
      ctx.drawImage(moving, 1296, 193, 65, 111, 1296 * scale, 193 * scale, 65 * scale, 111 * scale);
      ctx.drawImage(moving, 1361, 213, 74, 57, 1361 * scale, 213 * scale, 74 * scale, 57 * scale);
    }

    function drawSystems() {
      if (!ctx) return;
      SPHERES.forEach((sphere, index) => {
        const cx = sphere.x * width, cy = sphere.y * height, radius = sphere.r * width;
        const turn = time * (.18 + index * .018) * (index % 2 ? -1 : 1);
        ctx!.save();
        ctx!.beginPath(); ctx!.arc(cx, cy, radius * .98, 0, Math.PI * 2); ctx!.clip();
        if (!sphere.solid) {
          // Revolving meridians project as ellipses, with rear arcs subdued.
          for (let line = 0; line < 6; line++) {
            ctx!.beginPath();
            for (let step = 0; step <= 60; step++) {
              const p = spherePoint(-Math.PI / 2 + step / 60 * Math.PI, line / 6 * Math.PI * 2, turn);
              const x = cx + p.x * radius * .92, y = cy + p.y * radius * .92;
              if (step === 0 || p.z < 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y);
            }
            ctx!.globalAlpha = .48; ctx!.strokeStyle = "#f1efe5"; ctx!.lineWidth = .75; ctx!.stroke();
          }
        }
        const count = index === 0 ? 320 : 90;
        for (let n = 0; n < count; n++) {
          const latitude = Math.asin(1 - 2 * (n + .5) / count);
          const p = spherePoint(latitude, n * 2.399963, turn);
          if (p.z < .08) continue;
          ctx!.globalAlpha = sphere.solid ? .65 : .22 + p.z * .65;
          ctx!.fillStyle = sphere.solid ? "#111110" : "#f1efe5";
          ctx!.beginPath();
          ctx!.arc(cx + p.x * radius * .91, cy + p.y * radius * .91, Math.max(.7, radius * (sphere.solid ? .013 : .009)) * (.55 + p.z * .45), 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.restore();
        // Orbiting highlights make the motion legible even on a small phone.
        for (let n = 0; n < 2; n++) {
          const angle = turn * 1.6 + n * Math.PI;
          ctx!.globalAlpha = .8; ctx!.fillStyle = "#f1efe5";
          ctx!.beginPath(); ctx!.arc(cx + Math.cos(angle) * radius * 1.025, cy + Math.sin(angle) * radius * 1.025, index === 0 ? 2.2 : 1.8, 0, Math.PI * 2); ctx!.fill();
        }
      });
      CONNECTIONS.forEach(([from, to], index) => {
        const a = SPHERES[from], b = SPHERES[to];
        const dx = (b.x - a.x) * width, dy = (b.y - a.y) * height, length = Math.hypot(dx, dy);
        const start = a.r * width / length, end = 1 - b.r * width / length;
        if (start >= end) return;
        const travel = (time * .18 + index * .137) % 1;
        for (let tail = 0; tail < 5; tail++) {
          const t = start + ((travel - tail * .018 + 1) % 1) * (end - start);
          ctx!.globalAlpha = .8 * (1 - tail / 5); ctx!.fillStyle = "#f1efe5";
          ctx!.beginPath(); ctx!.arc(a.x * width + dx * t, a.y * height + dy * t, tail === 0 ? 2 : 1, 0, Math.PI * 2); ctx!.fill();
        }
      });
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      if (!ready || preference.matches) return;
      if (!press) { drawSystems(); return; }
      // Composite the mechanics together before the stage's paper/ink blend.
      // Rear arm -> opaque roller and fixed shaft -> front arm.
      // A DOM overlay alone cannot model the crank passing around the roller.
      const { depth } = crankPose(time * .65 + progress * Math.PI * 1.5, width, height);
      ctx.globalAlpha = 1;
      if (depth < 0) drawCrank();
      ctx.drawImage(source, 0, 0, width, height);
      drawShaft();
      if (depth >= 0) drawCrank();
      ctx.fillStyle = "#111"; ctx.globalAlpha = .45;
      for (const point of points) {
        const dx = Math.sin(time * .4 + point.phase) * 7;
        const dy = Math.cos(time * .3 + point.phase) * 4;
        ctx.beginPath(); ctx.arc(point.x + dx, point.y + dy, point.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    function update() {
      progress = trigger?.progress ?? .5;
      el!.style.setProperty("--art-progress", String(preference.matches ? .5 : progress));
      el!.classList.toggle("has-live-art", ready && !preference.matches);
      draw(); schedule();
    }
    function tick(timestamp: number) {
      request = 0;
      if (!visible || disposed || document.hidden || preference.matches) { last = 0; return; }
      if (!last || timestamp - last > 32) { time += last ? Math.min(timestamp - last, 50) / 1000 : 0; last = timestamp; draw(); }
      schedule();
    }
    function schedule() { if (!request && ready && visible && !disposed && !document.hidden && !preference.matches) request = requestAnimationFrame(tick); }
    function load() {
      if (disposed || ready || !source.complete || !source.naturalWidth || (press && (!moving.complete || !moving.naturalWidth))) return;
      ready = true;
      if (press) {
        const sample = document.createElement("canvas"); sample.width = width; sample.height = height;
        const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
        if (sampleCtx) {
          sampleCtx.drawImage(source, 0, 0, width, height);
          const pixels = sampleCtx.getImageData(0, 0, width, height).data;
          for (let y = 8; y < height - 8; y += 8) for (let x = 8; x < width * .46; x += 8) {
            const n = (y * width + x) * 4;
            if (pixels[n + 3] > 120 && pixels[n] < 128 && ((x * 7 + y * 3) % 19) < 3) points.push({ x, y, r: .9, phase: x * .06 + y * .09 });
          }
        }
      }
      update();
    }
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) last = 0; schedule(); });
    observer?.observe(el);
    source.onload = load; source.src = src;
    if (press) { moving.onload = load; moving.src = "/artwork/ink-press-moving.webp"; }
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
    return () => { disposed = true; source.onload = null; moving.onload = null; observer?.disconnect(); trigger?.kill(); cancelAnimationFrame(request); el.classList.remove("has-live-art"); document.removeEventListener("visibilitychange", update); preference.removeEventListener("change", update); };
  }, [press, src]);
  return <div ref={root} className={`finished-art ${press ? "finished-press" : "finished-systems"}`}>
    <div className="finished-art-top"><span>{press ? "Ideas, put into print." : "Prometheus"}</span></div>
    <div className="finished-art-stage">
      <Image src={src} className="finished-art-fallback" alt={press ? "A working printing press with halftone shading and mechanical linework" : "Connected halftone spheres with rotating wireframes and flowing particles"} fill sizes="(max-width: 767px) 145vw, 1100px" />
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
