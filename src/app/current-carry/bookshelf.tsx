import type { CSSProperties } from "react";
import type { LoveItem } from "@/lib/notion-loves";
import styles from "./bookshelf.module.css";

const bindings = [
  { paper: "#ffffff", cloth: "#008fa6", height: 106 },
  { paper: "#fff9ed", cloth: "#ee5037", height: 112 },
  { paper: "#3d3013", cloth: "#f5cb21", height: 115 },
  { paper: "#ffffff", cloth: "#2859e0", height: 100 },
  { paper: "#fff7ed", cloth: "#cf3283", height: 110 },
];

export function bookHeight(index: number) { return bindings[index % bindings.length].height; }

export function BookSpine({ book, index }: { book: LoveItem; index: number }) {
  const binding = bindings[index % bindings.length];
  return <span data-book-spine="" className={styles.binding} style={{
    "--cloth": binding.cloth, "--lettering": binding.paper,
  } as CSSProperties}>
    <span className={styles.headband} aria-hidden="true" />
    <span className={styles.title}>{book.title}</span>
    <span className={styles.tailband} aria-hidden="true" />
  </span>;
}
