"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import styles from "./field-scene.module.css";

const details = [
  { name: "Mandibles", note: "A second pair of antlers, small enough to pin.", x: .496, y: .204 },
  { name: "Wing study", note: "The veins divide, then divide again. A map in miniature.", x: .151, y: .701 },
  { name: "Root system", note: "Below the stem, another tree grows upside down.", x: .858, y: .536 },
];

export function FieldScene({ controls, host }: { controls: ReactNode; host: string }) {
  const cabinet = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState("");
  useEffect(() => {
    if (!cabinet.current) return;
    const observer = new ResizeObserver(([entry]) => setSize(entry.contentRect));
    observer.observe(cabinet.current);
    return () => observer.disconnect();
  }, []);

  function inspect(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const target = {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
    const nearby = details.find(detail => Math.hypot(
      (target.x - detail.x) * rect.width, (target.y - detail.y) * rect.height
    ) <= 22);
    setSelected(nearby?.name ?? "");
    setPoint(nearby ?? target);
  }
  const diameter = Math.min(size.width * .21, 190);
  const magnification = 1.85;
  const lensStyle: CSSProperties | undefined = point ? {
    width: diameter, height: diameter,
    left: Math.max(0, Math.min(size.width - diameter, point.x * size.width + (point.x > .5 ? -diameter - 12 : 12))),
    top: Math.max(0, Math.min(size.height - diameter, point.y * size.height - diameter / 2)),
    backgroundSize: `${size.width * magnification}px ${size.height * magnification}px`,
    backgroundPosition: `${diameter / 2 - point.x * size.width * magnification}px ${diameter / 2 - point.y * size.height * magnification}px`,
  } : undefined;

  return <section className={styles.drawer} aria-label="Specimen drawer">
    <div className={styles.tray}>
      <div className={styles.cabinet} ref={cabinet} onPointerDown={inspect}
        onPointerMove={event => { if (point && event.pointerType === "mouse") inspect(event); }}>
        <Image unoptimized src="/recommend/cabinet.webp" alt="A stag beetle beside pressed blossoms, a wing study and a preserved root." width={1983} height={793} draggable={false} />
        {point && <>
          <span className={styles.sight} aria-hidden="true" style={{left: point.x * 100 + "%", top: point.y * 100 + "%"}}/>
          <span className={styles.lens} aria-hidden="true" style={lensStyle}/>
        </>}
      </div>
      <div className={styles.instruments} role="group" aria-label="Magnifying loupe">
        <span className={styles.label}>Inspect</span>
        {details.map(detail => <button type="button" key={detail.name} aria-pressed={selected === detail.name}
          onClick={() => { setSelected(detail.name); setPoint(detail); }}>{detail.name}</button>)}
        <button type="button" className={styles.reset} disabled={!point}
          onClick={() => { setSelected(""); setPoint(null); }}>Put loupe away</button>
      </div>
      <div className={styles.annotation} role="status">{details.find(detail => detail.name === selected)?.note}</div>
    </div>
    <div className={styles.accession}>
      <div className={styles.labelholder}><span>{host || "Specimen label"}</span></div>
      {controls}
    </div>
  </section>;
}
