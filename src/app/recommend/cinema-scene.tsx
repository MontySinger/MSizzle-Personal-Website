"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import styles from "./cinema-scene.module.css";

const shots = [
  "A couple meet outside the Colosseum",
  "They lean toward each other",
  "They kiss on the street",
];

export function CinemaScene() {
  const [frame, setFrame] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = {
      ArrowRight: (index + 1) % shots.length,
      ArrowLeft: (index + shots.length - 1) % shots.length,
      Home: 0,
      End: shots.length - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setFrame(next);
    buttons.current[next]?.focus();
  }

  return <section className={styles.viewer} aria-label="Cinema Club film viewer">
    <div aria-hidden="true" className={styles.rail}><i style={{ backgroundPositionX: `${frame * 20}px` }} /></div>
    <div className={styles.strip} role="group" aria-label="Choose a film frame" data-frame={frame}>
      {shots.map((description, index) => <button
        className={styles.frame} key={description} type="button"
        aria-label={`Frame ${index + 1}: ${description}`} aria-pressed={frame === index}
        onClick={() => setFrame(index)} onKeyDown={event => navigate(event, index)}
        ref={el => { buttons.current[index] = el; }}>
        <span className={styles.still} style={{backgroundPositionX: `${index * 50}%`}} />
        <span className={styles.number} aria-hidden="true">0{index + 1}</span>
      </button>)}
    </div>
    <div aria-hidden="true" className={styles.rail}><i style={{ backgroundPositionX: `${frame * 20}px` }} /></div>
    <div className={styles.transport}>
      <span aria-live="polite"><span className={styles.light} aria-hidden="true"/>Frame 0{frame + 1} / 03{frame === 2 && <em className={styles.endTitle} lang="it">Fine.</em>}</span>
      <button type="button" onClick={() => setFrame(n => (n + 1) % shots.length)}>Advance film <span aria-hidden="true">→</span></button>
    </div>
  </section>;
}
