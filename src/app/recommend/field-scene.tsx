"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import styles from "./field-scene.module.css";

const details = [
  { name: "Mandibles", x: .496, y: .204 },
  { name: "Wing study", x: .151, y: .701 },
  { name: "Root system", x: .858, y: .536 },
];

export function FieldScene() {
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
    setSelected("");
    setPoint({
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    });
  }
  const diameter = Math.min(size.width * .21, 190);
  const magnification = 1.85;
  const lensStyle: CSSProperties | undefined = point ? {
    width: diameter, height: diameter,
    left: Math.max(0, Math.min(size.width - diameter, point.x * size.width - diameter / 2)),
    top: Math.max(0, Math.min(size.height - diameter, point.y * size.height - diameter / 2)),
    backgroundSize: `${size.width * magnification}px ${size.height * magnification}px`,
    backgroundPosition: `${diameter / 2 - point.x * size.width * magnification}px ${diameter / 2 - point.y * size.height * magnification}px`,
  } : undefined;

  return <section className={styles.drawer} aria-label="Specimen drawer">
    <div className={styles.cabinet} ref={cabinet} onPointerDown={inspect}
      onPointerMove={event => { if (point && event.pointerType === "mouse") inspect(event); }}>
      <Image unoptimized src="/recommend/cabinet.webp" alt="A stag beetle beside pressed blossoms, a wing study and a preserved root." width={1983} height={793} draggable={false} />
      {point && <span className={styles.lens} aria-hidden="true" style={lensStyle}/>}
    </div>
    <div className={styles.instruments} role="group" aria-label="Magnifying loupe">
      <span className={styles.label}>Inspect</span>
      {details.map(detail => <button type="button" key={detail.name} aria-pressed={selected === detail.name}
        onClick={() => { setSelected(detail.name); setPoint(detail); }}>{detail.name}</button>)}
      <button type="button" className={styles.reset} disabled={!point}
        onClick={() => { setSelected(""); setPoint(null); }}>Put loupe away</button>
    </div>
  </section>;
}
