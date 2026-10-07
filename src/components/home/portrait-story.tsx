"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

const photos = [
  { label: "Mushrooms", src: "/home/monty-mushrooms.jpg", alt: "Monty holding mushrooms in his growing setup", position: 0.65 },
  { label: "The hike", src: "/home/tetons.jpg", alt: "Monty hiking in front of the Teton Range", position: 0.8 },
];
const styles = ["Photograph", "Halftone", "Contours", "Particles"];
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

/** One scroll-authored portrait, derived from the original pixels.
 * Canvas does live halftone, edge detection, and particle displacement;
 * no invented facial geometry or generated replacement photo. A real image
 * remains the SSR/error/reduced-motion fallback. Native scrolling stays intact.
 */
export function PortraitStory({ children, field = false }: { children: ReactNode; field?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [photoIndex, setPhotoIndex] = useState(field ? 1 : 0);
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState(false);
  const pauseRef = useRef(false);
  const photo = photos[photoIndex];

  useEffect(() => { pauseRef.current = paused; }, [paused]);

  useEffect(() => {
    const container = root.current;
    const viewport = frame.current;
    const surface = canvas.current;
    if (!container || !viewport || !surface) return;
    const ctx = surface.getContext("2d");
    if (!ctx) return;
    surface.style.opacity = "0";

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionPreference.matches;
    let active = true;
    let ready = false;
    let disposed = false;
    let progress = 0;
    let lastStage = 0;
    let request = 0;
    let lastTime = 0;
    let time = 0;
    let width = 0;
    let height = 0;
    let edgeLayer: HTMLCanvasElement | null = null;
    let points: { x: number; y: number; radius: number; phase: number }[] = [];
    const source = new window.Image();

    function measure() {
      if (!ready || !ctx) return;
      // Raster budget stays below 640px wide and ~7,000 dots on desktop.
      width = Math.round(Math.min(640, viewport!.clientWidth));
      height = Math.round(width * viewport!.clientHeight / viewport!.clientWidth);
      if (!width || !height) return;
      surface!.width = width;
      surface!.height = height;
      const sample = document.createElement("canvas");
      sample.width = width;
      sample.height = height;
      const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
      if (!sampleCtx) return;
      const scale = Math.max(width / source.width, height / source.height);
      const dx = (width - source.width * scale) * photo.position;
      const dy = (height - source.height * scale) * 0.5;
      sampleCtx.drawImage(source, dx, dy, source.width * scale, source.height * scale);
      const pixels = sampleCtx.getImageData(0, 0, width, height).data;
      const gray = new Float32Array(width * height);
      for (let i = 0; i < gray.length; i++) {
        gray[i] = (pixels[i * 4] * 0.2126 + pixels[i * 4 + 1] * 0.7152 + pixels[i * 4 + 2] * 0.0722) / 255;
      }
      const gap = Math.max(6, Math.round(width / 88));
      points = [];
      for (let y = gap; y < height - gap; y += gap) {
        for (let x = gap; x < width - gap; x += gap) {
          const darkness = 1 - gray[y * width + x];
          if (darkness > 0.08) points.push({ x, y, radius: Math.sqrt(darkness) * gap * 0.46, phase: x * 0.073 + y * 0.037 });
        }
      }
      edgeLayer = document.createElement("canvas");
      edgeLayer.width = width;
      edgeLayer.height = height;
      const edgeCtx = edgeLayer.getContext("2d");
      if (edgeCtx) {
        const edgeImage = edgeCtx.createImageData(width, height);
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const n = y * width + x;
            const gx = -gray[n - width - 1] + gray[n - width + 1] - 2 * gray[n - 1] + 2 * gray[n + 1] - gray[n + width - 1] + gray[n + width + 1];
            const gy = -gray[n - width - 1] - 2 * gray[n - width] - gray[n - width + 1] + gray[n + width - 1] + 2 * gray[n + width] + gray[n + width + 1];
            const strength = clamp((Math.hypot(gx, gy) - 0.09) * 2.8);
            const i = n * 4;
            edgeImage.data[i] = 28;
            edgeImage.data[i + 1] = 28;
            edgeImage.data[i + 2] = 28;
            edgeImage.data[i + 3] = Math.round(strength * 255);
          }
        }
        edgeCtx.putImageData(edgeImage, 0, 0);
      }
      draw();
    }

    function draw() {
      if (!ctx || !ready || !width) return;
      const photoToDots = smooth((progress - 0.08) / 0.2);
      const dotsToLines = smooth((progress - 0.37) / 0.2);
      const linesToParticles = smooth((progress - 0.68) / 0.2);
      surface!.style.opacity = reduced ? "0" : String(photoToDots);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#efeee9";
      ctx.fillRect(0, 0, width, height);
      const dotAlpha = 1 - dotsToLines + linesToParticles;
      if (dotAlpha > 0.005) {
        ctx.fillStyle = "#181818";
        ctx.globalAlpha = dotAlpha;
        ctx.beginPath();
        for (const point of points) {
          const displacement = linesToParticles * (reduced ? 0 : 1);
          const x = point.x + Math.sin(time * 0.65 + point.phase) * 5 * displacement;
          const y = point.y + Math.cos(time * 0.5 + point.phase * 1.7) * 4 * displacement;
          const radius = point.radius * (1 - linesToParticles * 0.35);
          ctx.moveTo(x + radius, y);
          ctx.arc(x, y, radius, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      if (edgeLayer && dotsToLines > 0.005) {
        ctx.globalAlpha = dotsToLines * (1 - linesToParticles);
        ctx.drawImage(edgeLayer, 0, 0);
      }
      ctx.globalAlpha = 1;
    }

    function updateScroll() {
      const bounds = container!.getBoundingClientRect();
      const stickyTop = parseFloat(getComputedStyle(container!).getPropertyValue("--portrait-top")) || 64;
      const travel = Math.max(1, container!.offsetHeight - (window.innerHeight - stickyTop));
      progress = clamp((stickyTop - bounds.top) / travel);
      container!.style.setProperty("--portrait-ink", progress > 0.2 && !reduced ? "#181818" : "#ffffff");
      active = bounds.bottom > stickyTop && bounds.top < window.innerHeight;
      const nextStage = reduced ? 0 : progress < 0.23 ? 0 : progress < 0.49 ? 1 : progress < 0.79 ? 2 : 3;
      if (nextStage !== lastStage) { lastStage = nextStage; setStage(nextStage); }
      draw();
      schedule();
    }

    function animate(timestamp: number) {
      request = 0;
      if (disposed || reduced || !active || document.hidden || !ready || pauseRef.current || progress < 0.68) return;
      if (timestamp - lastTime > 32) {
        time += Math.min(timestamp - lastTime, 50) / 1000;
        lastTime = timestamp;
        draw();
      }
      schedule();
    }

    function schedule() {
      if (!request && !disposed && !reduced && active && !document.hidden && ready && !pauseRef.current && progress >= 0.68) request = requestAnimationFrame(animate);
    }

    function onPreferenceChange() { reduced = motionPreference.matches; updateScroll(); }
    function onVisibilityChange() { updateScroll(); }
    source.onload = () => { if (!disposed) { ready = true; measure(); updateScroll(); } };
    source.src = photo.src;
    const resize = new ResizeObserver(() => { measure(); updateScroll(); });
    resize.observe(viewport);
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    window.addEventListener("portrait-motion-change", updateScroll);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionPreference.addEventListener("change", onPreferenceChange);
    updateScroll();
    return () => {
      disposed = true;
      source.onload = null;
      cancelAnimationFrame(request);
      resize.disconnect();
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      window.removeEventListener("portrait-motion-change", updateScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionPreference.removeEventListener("change", onPreferenceChange);
    };
  }, [photo]);

  function toggleMotion() {
    pauseRef.current = !paused;
    setPaused(!paused);
    window.dispatchEvent(new Event("portrait-motion-change"));
  }

  return (
    <div ref={root} className={`portrait-story ${field ? "structure-portrait" : ""}`}>
      <div className="portrait-sticky kinetic-opening">
        {children}
        <div className="portrait-art">
          <div className="portrait-photo-switch" aria-label="Choose a photograph">
            {photos.map((item, i) => <button key={item.src} aria-pressed={i === photoIndex} onClick={() => setPhotoIndex(i)}>{item.label}</button>)}
            <button className="portrait-pause" onClick={toggleMotion} aria-pressed={paused}>{paused ? "Resume dots" : "Pause dots"}</button>
          </div>
          <div className="portrait-frame" ref={frame}>
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 100vw, 50vw" preload={photoIndex === 0} style={{ objectPosition: `${photo.position * 100}% center` }} className="portrait-source" />
            <canvas ref={canvas} className="portrait-render" aria-hidden="true" />
            <div className="portrait-register portrait-register-tl" aria-hidden="true" />
            <div className="portrait-register portrait-register-br" aria-hidden="true" />
          </div>
          <div className="portrait-caption">
            <div className="portrait-stages" aria-label="Current image treatment">
              {styles.map((name, i) => <span key={name} aria-current={stage === i ? "step" : undefined} className={stage === i ? "is-current" : ""}>{name}</span>)}
            </div>
            <span className="portrait-scroll-note">Scroll to transform</span>
          </div>
        </div>
      </div>
    </div>
  );
}
