"use client";
import { useEffect, useState, type ReactNode } from "react";
import { OrbitalDisplay } from "./orbital-display";
import styles from "./orbital-scene.module.css";

export function OrbitalScene({ controls, host }: { controls: ReactNode; host: string }) {
  const [start, setStart] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [flight, setFlight] = useState(0);
  useEffect(() => {
    if (start === null) return;
    let frame: number;
    const tick = (now: number) => {
      const percent = Math.min(100, Math.max(0, (now - start - 600) / 60));
      setProgress(percent);
      if (percent < 100) frame = requestAnimationFrame(tick);
      else setStart(null);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start]);
  function launch() {
    setFlight(n => n + 1);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {setProgress(100); return;}
    setProgress(0);
    setStart(performance.now());
  }
  const angle = progress * 3.6;
  const phase = start !== null ? (progress === 0 ? "Relay warming" : "Tracking") : progress === 100 ? "Orbit complete" : "Standby";
  return <section className={styles.screen} aria-label="Orbital flight simulator">
    <div className={styles.plot}><OrbitalDisplay sequence={flight} angle={angle}/></div>
    <div className={styles.panel}><span className={styles.relay} data-active={start !== null} role="status">{phase}</span>
      <output aria-live="off">{String(Math.floor(angle)).padStart(3,"0")}°</output>
      <progress value={progress} max={100} aria-label="Orbit completed"/>
      <button type="button" onClick={start !== null ? () => {setStart(null); setProgress(0);} : launch}>
        {start !== null ? "Abort flight" : flight ? "Launch again ↗" : "Launch sequence ↗"}
      </button>
    </div>
    <div className={styles.uplink}>
      <div className={styles.tape}><i aria-hidden="true" data-locked={Boolean(host)}/><span>Mission control</span><samp title={host}>{host || "Awaiting carrier"}</samp></div>
      {controls}
    </div>
    {progress === 100 && <details className={styles.slip}>
      <summary>Read ground transmission</summary>
      <p>Signal received. We left a light on for you.</p>
    </details>}
  </section>;
}
