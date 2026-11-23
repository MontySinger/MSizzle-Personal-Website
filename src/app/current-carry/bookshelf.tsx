"use client";

import { useRef, useState, type CSSProperties } from "react";
import type { LoveItem } from "@/lib/notion-loves";
import styles from "./bookshelf.module.css";

const bindings = [
  { paper: "#e8d7b6", cloth: "#345c53", height: 178 },
  { paper: "#f7e1af", cloth: "#a55936", height: 195 },
  { paper: "#f5dfaa", cloth: "#9a772e", height: 205 },
  { paper: "#e5d9bb", cloth: "#354965", height: 166 },
  { paper: "#f6e3bc", cloth: "#733c40", height: 190 },
];

export function BookShelf({ items }: { items: LoveItem[] }) {
  const books = items.filter(item => item.published && item.type === "Book");
  const [selected, setSelected] = useState<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const active = books.find(book => book.id === selected);
  if (!books.length) return null;

  function close() {
    const id = selected;
    setSelected(null);
    // Return focus without immediately reopening the note.
    if (id) buttons.current.get(id)?.focus({ preventScroll: true });
  }

  return <div className={styles.bookcase} role="region" aria-label="Books I love"
    onKeyDown={event => { if (event.key === "Escape") close(); }}>
    <div className={styles.row}>
      {books.map((book, index) => {
        const binding = bindings[index % bindings.length];
        const style = {
          "--cloth": binding.cloth, "--lettering": binding.paper,
          "--book-height": binding.height + "px",
        } as CSSProperties;
        return <button type="button" className={styles.book} key={book.id} style={style}
          ref={element => { if (element) buttons.current.set(book.id, element); else buttons.current.delete(book.id); }}
          aria-label={book.title + (book.subtitle ? " by " + book.subtitle : "")}
          aria-expanded={selected === book.id} aria-controls="bookshelf-note"
          data-selected={selected === book.id}
          onPointerEnter={event => { if (event.pointerType === "mouse") setSelected(book.id); }}
          onClick={() => setSelected(book.id)}>
          <span className={styles.headband} aria-hidden="true" />
          <span className={styles.title}>{book.title}</span>
          <span className={styles.tailband} aria-hidden="true" />
        </button>;
      })}
      <span className={styles.bookend} aria-hidden="true" />
    </div>
    <div className={styles.plank} aria-hidden="true" />
    {active && <div className={styles.note} id="bookshelf-note" role="region" aria-label={active.title + " details"}>
      <button type="button" className={styles.close} onClick={close} aria-label="Close book details">×</button>
      <h3>{active.title}</h3>
      {active.subtitle && <p className={styles.author}>{active.subtitle}</p>}
      {active.note && <p className={styles.annotation}>{active.note}</p>}
      {/^https?:\/\//i.test(active.url) && <a href={active.url} target="_blank" rel="noreferrer">Find the book ↗</a>}
    </div>}
  </div>;
}
