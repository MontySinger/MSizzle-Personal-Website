"use client";

import { useRef, useState } from "react";
import countries from "./places-countries.json";
import styles from "./places-map.module.css";

type VisitedCountry = { name: string; longitude: number; latitude: number; lean?: number };

// Mark the country, using Amsterdam for the Netherlands entry. Nearby pins
// lean apart so their heads stay distinct at the map's smallest size.
const visited: Record<string, VisitedCountry> = {
  KOR: { name: "South Korea", longitude: 128.13, latitude: 36.38 },
  SGP: { name: "Singapore", longitude: 103.82, latitude: 1.37, lean: 3 },
  MYS: { name: "Malaysia", longitude: 113.84, latitude: 2.53 },
  IDN: { name: "Indonesia", longitude: 110.3, latitude: -7.4, lean: 3 },
  THA: { name: "Thailand", longitude: 101.07, latitude: 15.46 },
  FRA: { name: "France", longitude: 2.55, latitude: 46.7 },
  ITA: { name: "Italy", longitude: 12.45, latitude: 42.9 },
  ESP: { name: "Spain", longitude: -3.46, latitude: 40.09 },
  DEU: { name: "Germany", longitude: 10.45, latitude: 51.1, lean: 3 },
  DNK: { name: "Denmark", longitude: 9.02, latitude: 55.97 },
  SWE: { name: "Sweden", longitude: 15.2, latitude: 61.5 },
  USA: { name: "United States", longitude: -97.48, latitude: 39.54 },
  CRI: { name: "Costa Rica", longitude: -84.08, latitude: 10.07 },
  EGY: { name: "Egypt", longitude: 29.45, latitude: 26.19 },
  MAR: { name: "Morocco", longitude: -7.19, latitude: 31.65 },
  GRC: { name: "Greece", longitude: 21.73, latitude: 39.49 },
  HUN: { name: "Hungary", longitude: 19.45, latitude: 47.09, lean: 3 },
  NLD: { name: "Netherlands · Amsterdam", longitude: 4.9, latitude: 52.37, lean: -5 },
  VNM: { name: "Vietnam", longitude: 105.39, latitude: 21.72 },
};
const choices = Object.entries(visited).sort(([, a], [, b]) => a.name.localeCompare(b.name));

// Match the projection in scripts/render-places-map.mjs.
function pinAnchor({ longitude, latitude }: VisitedCountry) {
  const x = 480 + 2.58 * longitude * (1 - 0.38 * (latitude / 90) ** 2);
  const y = 16 + (84 - latitude) * 2.65;
  return `translate(${x} ${y})`;
}

function countryAt(target: EventTarget | null) {
  return target instanceof Element ? target.closest("[data-country]")?.getAttribute("data-country") ?? null : null;
}

export function PlacesMap() {
  const [selected, select] = useState<string | null>(null);
  const [hovered, hover] = useState<string | null>(null);
  const [focused, focus] = useState<string | null>(null);
  const section = useRef<HTMLElement>(null);
  const touchedCountry = useRef<string | null | undefined>(undefined);
  const raised = hovered ?? focused ?? selected;
  const label = raised && visited[raised]?.name;

  function clear() {
    select(null);
    hover(null);
    focus(null);
  }

  return (
    <section id="places" ref={section} className={styles.section}
      aria-label={choices.length + " countries Monty has visited"}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) clear(); }}
      onKeyDown={event => {
        if (event.key !== "Escape") return;
        if (selected) section.current?.querySelector<SVGElement>('g[role="button"][data-country="' + selected + '"]')?.focus();
        clear();
      }}>
      <svg className={styles.countries} viewBox="0 0 960 410" role="group" aria-label="World map with pins on visited countries"
        onPointerOver={event => { if (event.pointerType !== "touch") hover(countryAt(event.target)); }}
        onPointerLeave={() => hover(null)}
        onPointerDown={() => { touchedCountry.current = undefined; }}
        onTouchEnd={event => {
          // Phones can retarget a click to a neighboring country in dense clusters.
          const touch = event.changedTouches[0];
          touchedCountry.current = countryAt(document.elementFromPoint(touch.clientX, touch.clientY));
        }}
        onClick={event => {
          const code = event.detail && touchedCountry.current !== undefined
            ? touchedCountry.current
            : countryAt(event.target);
          touchedCountry.current = undefined;
          if (code && visited[code]) select(current => current === code ? null : code);
          else clear();
        }}>
        {/* In coastal waters, let a finger land near a small country. Actual land shapes take precedence. */}
        <g aria-hidden="true" className={styles.touchTargets}>
          {["CRI", "DNK", "NLD"].map(code =>
            <use key={code} data-country={code} href={"/home/places-countries.svg#" + code} />)}
        </g>
        {countries.map(({ code, color }) => {
          const name = visited[code]?.name;
          const shape = "/home/places-countries.svg#" + code;
          return <g key={code} data-country={code} data-visited={Boolean(name)} data-raised={raised === code}
            role={name ? "button" : undefined} tabIndex={name ? 0 : undefined} aria-hidden={name ? undefined : true}
            aria-label={name} aria-pressed={name ? selected === code : undefined}
            onFocus={event => { if (event.currentTarget.matches(":focus-visible")) focus(code); }}
            onBlur={() => focus(null)}
            onKeyDown={event => {
              if (name && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                select(current => current === code ? null : code);
              }
            }}>
            {code === "SGP" && <circle className={styles.islandTarget} cx="747.8" cy="235" r="15" fill="transparent" />}
            <use href={shape} fill="transparent" />
            <use href={shape} className={styles.land} fill={color} />
          </g>;
        })}
        <g aria-hidden="true" className={styles.pins}>
          {choices.map(([code, country]) => {
            const lean = country.lean ?? -2;
            return <g key={code} data-country={code} transform={pinAnchor(country)} data-raised={raised === code}>
              <circle cx={lean} cy="-6" r="5" fill="transparent" />
              <g className={styles.pinArt}>
                <line x1="0" y1="0" x2={lean} y2="-6" />
                <circle cx={lean} cy="-6" r="3.8" />
              </g>
            </g>;
          })}
        </g>
      </svg>
      <div className={styles.caption}>
        {selected ? <label>
          <select value={selected} aria-label="Explore visited countries" onChange={event => { hover(null); select(event.target.value); }}>
            {choices.map(([code, { name }]) => <option key={code} value={code}>{name}</option>)}
          </select>
          <span>{choices.length} countries visited</span>
        </label> : label && <span>{label}</span>}
      </div>
    </section>
  );
}
