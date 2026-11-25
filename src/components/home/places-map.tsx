"use client";

import { useState } from "react";
import Image from "next/image";
import type { LoveItem } from "@/lib/notion-loves";
import styles from "./places-map.module.css";

// Positions match the Natural Earth map's equirectangular bounds, 84°N to 60°S.
const locations = [
  { id: "39632e75-4858-8189-a9e7-d04a912aab9c", region: "Wyoming, United States", lat: 43.79, lon: -110.84, photo: "/home/tetons.jpg" },
  { id: "39632e75-4858-813d-ac81-c3f0b8739c98", region: "Copenhagen, Denmark", lat: 55.67, lon: 12.55 },
  { id: "39632e75-4858-8103-8184-d376dd774a49", region: "Forest City, Malaysia", lat: 1.34, lon: 103.59 },
];

export function PlacesMap({ places }: { places: LoveItem[] }) {
  const pins = locations.flatMap(location => {
    const item = places.find(place => place.id === location.id && place.published);
    return item ? [{ ...location, item }] : [];
  });
  const [selection, select] = useState("");
  const active = pins.find(pin => pin.id === selection) ?? pins[0];
  if (!active) return null;
  return (
    <section id="places" aria-labelledby="places-title" className={styles.section}>
      <h2 id="places-title">Favorite places</h2>
      <div className={styles.sheet}>
        <div className={styles.map} role="group" aria-label="Choose a place on the world map">
          {pins.map(pin => (
            <button key={pin.id} type="button" className={styles.pin}
              style={{ left: ((pin.lon + 180) / 360 * 100) + "%", top: ((84 - pin.lat) / 144 * 100) + "%" }}
              aria-label={pin.item.title} aria-pressed={active.id === pin.id} onClick={() => select(pin.id)}>
              <span />
            </button>
          ))}
        </div>
        <div className={styles.postcard} aria-live="polite">
          <Image src={active.photo ?? `/pinboard/${active.id}.webp`} width={190} height={130}
            alt="" className={styles.photo} />
          <div><small>{active.region}</small><h3>{active.item.title}</h3>
            {active.item.note && <p>{active.item.note}</p>}
            {active.item.url && <a href={active.item.url} target="_blank" rel="noreferrer">Explore this place ↗</a>}
          </div>
        </div>
      </div>
    </section>
  );
}
