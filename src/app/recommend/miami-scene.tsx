"use client";

import { useState } from "react";
import styles from "./miami-scene.module.css";

export function MiamiScene() {
  const [lit, setLit] = useState(true);
  return (
    <div className={styles.scene} data-lit={lit}>
      <button type="button" role="switch" aria-checked={lit} aria-label="Motel neon" className={styles.sign} onClick={() => setLit(!lit)}>
        <span className={styles.script} aria-hidden="true">Ocean Drive</span>
        <span className={styles.vacancy} aria-hidden="true">Vacancy</span>
        <span className={styles.switchRow} aria-hidden="true"><i />Neon {lit ? "on" : "off"}</span>
      </button>
    </div>
  );
}
