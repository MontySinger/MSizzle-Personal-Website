"use client";
import { useEffect, useState } from "react";
import { OrbitalDisplay } from "./orbital-display";
import styles from "./orbital-scene.module.css";

export function OrbitalScene() {
  const [start, setStart] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [flight, setFlight] = useState(0);
  useEffect(() => {
    if (start === null) return;
    let frame: number;
    const tick = (now: number) => {
      const percent = Math.min(100, (now - start) / 60);
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
  const phase = start !== null ? "Tracking" : progress === 100 ? "Orbit complete" : "Standby";
  return <section className={styles.screen} aria-label="Orbital flight simulator">
    <div className={styles.plot}><OrbitalDisplay sequence={flight} progress={progress}/></div>
    <div className={styles.panel}><span role="status">{phase}</span>
      <output aria-live="off">{String(Math.floor(progress * 3.6)).padStart(3,"0")}°</output>
      <progress value={progress} max={100} aria-label="Orbit completed"/>
      <button type="button" onClick={start !== null ? () => {setStart(null); setProgress(0);} : launch}>
        {start !== null ? "Abort flight" : flight ? "Launch again ↗" : "Launch sequence ↗"}
      </button>
    </div>
  </section>;
}
