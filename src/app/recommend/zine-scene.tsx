"use client";

import { type ReactNode, useState } from "react";
import styles from "./zine-scene.module.css";

const printRuns = [
  { name: "Acid pink", paper: "#c6ec00", ink: "#ed007d", filter: "none" },
  { name: "Blue raspberry", paper: "#73eaf4", ink: "#313ed3", filter: "none", stock: "zine-blue" },
  { name: "Black copy", paper: "#eee9d8", ink: "#22231e", filter: "grayscale(1) contrast(1.45)" },
];

export function ZineScene({ controls, host }: { controls: ReactNode; host: string }) {
  const [pulls, setPulls] = useState(0);
  const run = pulls % printRuns.length;
  const current = printRuns[run];

  return (
    <figure className={styles.press} aria-label="Zine print press">
      <div className={styles.sheet}>
        <picture key={run} className={styles.print}>
          <source media="(max-width: 680px)" srcSet={`/recommend/${current.stock ?? "zine"}-850.webp`} />
          {/* The full-bleed collage has its own responsive, pre-sized sources. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/recommend/${current.stock ?? "zine"}.webp`} alt="Two hands pinning a torn paper heart back together" width="1817" height="866" style={{filter: current.filter}} />
        </picture>
        {pulls >= printRuns.length && (
          <details className={styles.corner}>
            <summary>Lift corner</summary>
            <p>The pin held. Make a copy for a friend.</p>
          </details>
        )}
      </div>
      <div className={styles.pasteup} style={{ "--proof-ink": current.ink, "--proof-paper": current.paper } as React.CSSProperties}>
        <span className={styles.imprint}>{host || "Paste-up"}</span>
        {controls}
      </div>
      <figcaption className={styles.desk}>
        <span className={styles.proof} aria-live="polite">
          <i aria-hidden="true" style={{background: current.paper}} />
          <i aria-hidden="true" style={{background: current.ink}} />
          <span>{current.name}</span>
        </span>
        <button type="button" onClick={() => setPulls((count) => count + 1)}>Pull another print <span aria-hidden="true">↻</span></button>
      </figcaption>
    </figure>
  );
}
