"use client";

import { useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import type { LoveItem } from "@/lib/notion-loves";
import countries from "./places-countries.json";
import styles from "./places-map.module.css";

// Same projection as scripts/render-places-map.mjs, in the 960 × 410 viewBox.
function pinPosition(longitude: number, latitude: number) {
  return {
    left: (480 + 2.58 * longitude * (1 - 0.38 * (latitude / 90) ** 2)) / 960 * 100 + "%",
    top: (16 + (84 - latitude) * 2.65) / 410 * 100 + "%",
  };
}
const locations = [
  { id: "39632e75-4858-8189-a9e7-d04a912aab9c", region: "Wyoming, United States", country: "USA", longitude: -110.84, latitude: 43.79, photo: "/home/tetons.jpg" },
  { id: "39632e75-4858-813d-ac81-c3f0b8739c98", region: "Copenhagen, Denmark", country: "DNK", longitude: 12.55, latitude: 55.67 },
  { id: "39632e75-4858-8103-8184-d376dd774a49", region: "Forest City, Malaysia", country: "MYS", longitude: 103.59, latitude: 1.34 },
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

  const [hovered, setHovered] = useState<string | null>(null);
  const [holdLift, setHoldLift] = useState(false);
  const pointerType = useRef("");
  const raised = hovered ?? (holdLift ? active?.country : null);

  function trackCountry(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const target = event.target as Element;
    setHovered(target.closest("[data-country]")?.getAttribute("data-country") ?? null);
  }

  function close() {
    select(null);
    trigger.current?.focus({ preventScroll: true });
  }

  if (!pins.length) return null;
  return (
    <section id="places" aria-label="Favorite places" className={styles.section}
      onKeyDown={event => { if (active && event.key === "Escape") close(); }}>
      <div className={styles.map} role="group" aria-label="Explore the map pins"
        onPointerOver={trackCountry} onPointerLeave={() => setHovered(null)}>
        <svg className={styles.countries} viewBox="0 0 960 410" aria-hidden="true" focusable="false">
          {countries.map(({ code, color }) => {
            const shape = "/home/places-countries.svg#" + code;
            return <g key={code} data-country={code} data-raised={raised === code}>
              <use href={shape} fill="transparent" />
              <use href={shape} className={styles.land} fill={color} />
            </g>;
          })}
        </svg>
        {pins.map(pin => (
          <button key={pin.id} type="button" className={styles.pin}
            style={pinPosition(pin.longitude, pin.latitude)} data-country={pin.country}
            data-raised={raised === pin.country}
            onPointerDown={event => { pointerType.current = event.pointerType; }}
            aria-label={pin.item.title} aria-expanded={selection === pin.id} aria-controls={detailId}
            onClick={event => {
              trigger.current = event.currentTarget;
              setHoldLift(event.detail === 0 || pointerType.current === "touch");
              select(selection === pin.id ? null : pin.id);
            }}>
            <span className={styles.tack} aria-hidden="true" />
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
