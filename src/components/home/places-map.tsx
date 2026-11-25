"use client";

import { useId, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { LoveItem } from "@/lib/notion-loves";
import styles from "./places-map.module.css";

// Pin tips in percent of the oblique Natural Earth voxel illustration.
const locations = [
  { id: "39632e75-4858-8189-a9e7-d04a912aab9c", region: "Wyoming, United States", x: 24.95, y: 28.23, ink: "#b63c22", highlight: "#ff9773", photo: "/home/tetons.jpg" },
  { id: "39632e75-4858-813d-ac81-c3f0b8739c98", region: "Copenhagen, Denmark", x: 54.83, y: 25.24, ink: "#82419f", highlight: "#e6a4f4" },
  { id: "39632e75-4858-8103-8184-d376dd774a49", region: "Forest City, Malaysia", x: 76.69, y: 59.97, ink: "#175991", highlight: "#85c8fc" },
];

export function PlacesMap({ places }: { places: LoveItem[] }) {
  const pins = locations.flatMap(location => {
    const item = places.find(place => place.id === location.id && place.published);
    return item ? [{ ...location, item }] : [];
  });
  const [selection, select] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const detailId = useId();
  const active = pins.find(pin => pin.id === selection);

  function close() {
    select(null);
    trigger.current?.focus({ preventScroll: true });
  }

  if (!pins.length) return null;
  return (
    <section id="places" aria-label="Favorite places" className={styles.section}
      onKeyDown={event => { if (active && event.key === "Escape") close(); }}>
      <div className={styles.map} role="group" aria-label="Explore the map pins">
        {pins.map(pin => (
          <button key={pin.id} type="button" className={styles.pin}
            style={{ left: pin.x + "%", top: pin.y + "%", "--ink": pin.ink, "--glint": pin.highlight } as CSSProperties}
            aria-label={pin.item.title} aria-expanded={selection === pin.id} aria-controls={detailId}
            onClick={event => {
              trigger.current = event.currentTarget;
              select(selection === pin.id ? null : pin.id);
            }}>
            <span className={styles.tack} aria-hidden="true"><i /></span>
            <span className={styles.label} aria-hidden="true">{pin.item.title}</span>
          </button>
        ))}
      </div>
      <div id={detailId} className={styles.detail} hidden={!active}>
        {active && <>
          <Image src={active.photo ?? `/pinboard/${active.id}.webp`} width={144} height={112}
            alt="" className={styles.photo} />
          <div aria-live="polite">
            <small>{active.region}</small><h2>{active.item.title}</h2>
            {active.item.note && <p>{active.item.note}</p>}
            {active.item.url && <a href={active.item.url} target="_blank" rel="noreferrer">Explore this place ↗</a>}
          </div>
          <button className={styles.close} type="button" aria-label="Close place details" onClick={close}>×</button>
        </>}
      </div>
    </section>
  );
}
