"use client";

import { useState } from "react";
import styles from "./goblin-scene.module.css";

/** Hand-inked scene elements stay separate from the transparent character. */
export function GoblinScene({ onFeed }: { onFeed?: () => void }) {
  const [bites, setBites] = useState(0);
  function feed() {
    setBites(count => count + 1);
    onFeed?.();
  }

  return (
    <figure className={styles.spread} aria-label="Link Goblin’s spaghetti supper">
      <div className={styles.table}>
        <svg className={styles.doodles} viewBox="0 0 780 365" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="#ab3021" strokeWidth="5" d="M83 91c-17-27-42-3 1 25 36-34 10-49-1-25Z"/>
            <path stroke="#272322" strokeWidth="3.5" fill="#ffd047" d="m130 32 9 14 18-4-10 15 9 12-18-3-10 14 1-18-13-8 14-4Z"/>
            <g className={styles.noodle} stroke="#ca4625" strokeWidth="5"><path d="M548 37q17-16 29 0t27 1q13-13 24 1"/></g>
            <g transform="translate(687 206) rotate(11)" strokeWidth="3.5">
              <path d="M0 3c-26-20-35 5-25 22 8 17 38 13 49-9 8-18-8-27-24-13Z" fill="#dc4026" stroke="#54231a"/>
              <path d="m-12-1 12 5 12-9-5 10 12 1-15 3-5 7 1-9-10 1 9-5Z" fill="#55814e" stroke="#314f36"/>
              <path d="M-18 12q-5 3-5 8" stroke="#ffab77"/>
            </g>
            <g stroke="#242124" strokeWidth="3.5"><path d="m100 213-17 12m22-1-8 15m566-115 16-16m-11 24 16-5"/></g>
          </g>
        </svg>
        <div className={styles.cloth} aria-hidden="true" />
        {/* The transparent cutout preserves the original character, utensil and dish. */}
        <img key={bites} className={styles.character} data-bite={bites > 0}
          src="/recommend/goblin/link-goblin.png" width={1200} height={760}
          alt="The original blue Link Goblin, twirling a URL-shaped noodle over a plate of spaghetti." />
      </div>
      <figcaption className={styles.caption}>
        <button type="button" className={styles.feed} onClick={feed}>
          Feed him a link <span aria-hidden="true">↗</span>
        </button>
      </figcaption>
    </figure>
  );
}
