"use client";

import { useRef, useState } from "react";
import countries from "./places-countries.json";
import styles from "./places-map.module.css";

const visited: Record<string, string> = {
  KOR: "South Korea", SGP: "Singapore", MYS: "Malaysia", IDN: "Indonesia",
  THA: "Thailand", FRA: "France", ITA: "Italy", ESP: "Spain", DEU: "Germany",
  DNK: "Denmark", SWE: "Sweden", USA: "United States", CRI: "Costa Rica",
  EGY: "Egypt", MAR: "Morocco", GRC: "Greece", HUN: "Hungary",
  NLD: "Netherlands · Amsterdam", VNM: "Vietnam",
};
const choices = Object.entries(visited).sort(([, a], [, b]) => a.localeCompare(b));

function countryAt(target: EventTarget | null) {
  return target instanceof Element ? target.closest("[data-country]")?.getAttribute("data-country") ?? null : null;
}

export function PlacesMap() {
  const [selected, select] = useState<string | null>(null);
  const [hovered, hover] = useState<string | null>(null);
  const [focused, focus] = useState<string | null>(null);
  const section = useRef<HTMLElement>(null);
  const raised = hovered ?? focused ?? selected;
  const label = raised && visited[raised];

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
      <svg className={styles.countries} viewBox="0 0 960 410" role="group" aria-label="Visited countries in color"
        onPointerOver={event => { if (event.pointerType !== "touch") hover(countryAt(event.target)); }}
        onPointerLeave={() => hover(null)}
        onClick={event => {
          const code = countryAt(event.target);
          if (code && visited[code]) select(current => current === code ? null : code);
          else clear();
        }}>
        {/* In coastal waters, let a finger land near a small country. Actual land shapes take precedence. */}
        <g aria-hidden="true" className={styles.touchTargets}>
          {["CRI", "DNK", "NLD"].map(code =>
            <use key={code} data-country={code} href={"/home/places-countries.svg#" + code} />)}
        </g>
        {countries.map(({ code, color }) => {
          const name = visited[code];
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
            <use href={shape} className={styles.land} fill={name ? color : "#dcdacf"} />
          </g>;
        })}
      </svg>
      <div className={styles.caption}>
        {selected ? <label>
          <select value={selected} aria-label="Explore visited countries" onChange={event => { hover(null); select(event.target.value); }}>
            {choices.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
          <span>{choices.length} countries visited</span>
        </label> : label && <span>{label}</span>}
      </div>
    </section>
  );
}
