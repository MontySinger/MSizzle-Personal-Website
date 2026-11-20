"use client";

import { useState } from "react";
import styles from "./recommend.module.css";

export type FavoriteCard = {
  id: string; title: string; subtitle: string; url: string; images: string[];
};

function Favorite({ card }: { card: FavoriteCard }) {
  const [imageIndex, setImageIndex] = useState(0);
  return <a className={styles.favorite} href={card.url} target="_blank" rel="noreferrer">
    <img src={card.images[imageIndex]} alt="" loading="lazy" width={220} height={150}
      onError={() => setImageIndex(n => Math.min(n + 1, card.images.length - 1))} />
    <strong>{card.title}</strong>
    {card.subtitle && <small>{card.subtitle}</small>}
  </a>;
}

export function FavoriteGallery({ cards }: { cards: FavoriteCard[] }) {
  const [open, setOpen] = useState(false);
  if (!cards.length) return null;
  return <details className={styles.gallery} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Browse Monty’s favorites</summary>
    {open && <div className={styles.galleryGrid}>{cards.map(card => <Favorite key={card.id} card={card}/>)}</div>}
  </details>;
}
