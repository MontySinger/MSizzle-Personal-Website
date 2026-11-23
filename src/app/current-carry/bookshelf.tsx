import type { CSSProperties } from "react";
import type { LoveItem } from "@/lib/notion-loves";
import styles from "./bookshelf.module.css";

const bindings: Record<string, { paper: string; cloth: string; height: number; width: number; rounded: boolean }> = {
  "39632e75-4858-815e-bce3-c2ebb4336ca5": { paper: "#9b722c", cloth: "#f2ede0", height: 112, width: 40, rounded: false },
  "39632e75-4858-80b5-b0fc-cae365527e4a": { paper: "#f8f04e", cloth: "#8b05ee", height: 108, width: 43, rounded: false },
  "39632e75-4858-801c-8d6d-f6de7065032a": { paper: "#315e4e", cloth: "#eedb91", height: 116, width: 36, rounded: true },
  "39632e75-4858-8089-89be-ff7fb34fb37e": { paper: "#fff7e9", cloth: "#4377a0", height: 88, width: 52, rounded: false },
  "30032e75-4858-82c9-bf45-8183e628c61e": { paper: "#ffe35a", cloth: "#0099bb", height: 110, width: 41, rounded: true },
};

export function bookBinding(book: LoveItem) {
  return bindings[book.id] ?? { paper: "#453c2f", cloth: "#ebd8a6", height: 106, width: 42, rounded: false };
}

export function BookSpine({ book }: { book: LoveItem }) {
  const binding = bookBinding(book);
  return <span data-book-spine="" className={styles.binding} data-rounded={binding.rounded} style={{
    "--cloth": binding.cloth, "--lettering": binding.paper,
  } as CSSProperties}>
    <span className={styles.headband} aria-hidden="true" />
    <span className={styles.title}>{book.title}</span>
    <span className={styles.tailband} aria-hidden="true" />
  </span>;
}
