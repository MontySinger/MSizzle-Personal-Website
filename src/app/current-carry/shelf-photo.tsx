"use client";
import { useState } from "react";
import type { LoveItem } from "@/lib/notion-loves";
import { cardImages } from "@/lib/pinboard-covers";
import photos from "./shelf-photos.json";
import styles from "./shelf-photo.module.css";

export function ShelfPhoto({ book, itemIndex, href }: { book?: LoveItem; itemIndex: number; href: string }) {
  const [index, setIndex] = useState(0);
  const photo = photos[itemIndex];
  const sources = book ? cardImages(book).filter(src => !src.endsWith(".svg")) : photo ? [photo.image] : [];
  if (index >= sources.length) return null;
  const sourceUrl = book ? book.url : photo.source;
  const link = /^https?:\/\//i.test(href) ? href : sourceUrl;
  return <figure className={styles.figure} data-book={Boolean(book)}>
    <a href={link} target="_blank" rel="noreferrer" aria-label={book ? "View " + book.title : photo.alt}>
      {/* Book covers use the pinboard’s source fallback chain. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sources[index]} alt={book ? book.title + " book cover" : photo.alt}
        width={360} height={260} onError={() => setIndex(value => value + 1)} />
    </a>
    {!book && <figcaption>
      {photo.caption && <span>{photo.caption}</span>}
      <a href={photo.source} target="_blank" rel="noreferrer">Photo · {photo.credit}</a>
    </figcaption>}
  </figure>;
}
