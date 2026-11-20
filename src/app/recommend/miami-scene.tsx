"use client";

import { useState, type ReactNode } from "react";
import styles from "./miami-scene.module.css";

export function MiamiScene({ controls, host }: { controls: ReactNode; host: string }) {
  const [lit, setLit] = useState(true);
  return (
    <div className={styles.scene} data-lit={lit}>
      <button type="button" role="switch" aria-checked={lit} aria-label="Motel neon" className={styles.sign} onClick={() => setLit(!lit)}>
        <span className={styles.script} aria-hidden="true">Ocean Drive</span>
        <span className={styles.vacancy} aria-hidden="true">Vacancy</span>
        <span className={styles.switchRow} aria-hidden="true"><i />Neon {lit ? "on" : "off"}</span>
      </button>
      <div className={styles.marquee}>
        <div className={styles.letters}><span>Guest register</span><strong>{host || "Night arrivals"}</strong></div>
        {controls}
      </div>
      <div className={styles.desk} role="status">
        {!lit && <p className={styles.note}><small>Night desk · 2:13 AM</small>Gone for coffee. The flamingo takes his black.<span>— Gloria</span></p>}
      </div>
    </div>
  );
}
