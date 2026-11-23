"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import styles from "./shelf.module.css";
import { BookSpine, bookHeight } from "./bookshelf";
import type { LoveItem } from "@/lib/notion-loves";

const objects = [
  { name: "The gym gloves", kind: "An unexpected upgrade", note: "I use gardening gloves as lifting gloves. The blue and gray ones with the honeycomb grip.", url: "https://www.homedepot.com/p/318748411", extra: "https://www.youtube.com/shorts/opRpbsIFdMw", label: "Watch the glove test", width: 89, height: 92, mass: .7 },
  { name: "Ninja CREAMi", kind: "Something worth making room for", note: "One of my favorite things. More from me soon.", url: "", extra: "", label: "", width: 83, height: 112, mass: 2 },
  { name: "Cybertruck", kind: "Parked, for once", note: "A little version of a big favorite. More from me soon.", url: "https://www.tesla.com/cybertruck", extra: "", label: "", width: 138, height: 76, mass: 1.6 },
  { name: "The pocket light", kind: "ALTSON · rechargeable clip-on LED", note: "The little portable light I like. More from me soon.", url: "https://www.amazon.com/dp/B0C2C9QT91", extra: "", label: "", width: 80, height: 89, mass: .9 },
  { name: "WHITIN barefoot shoes", kind: "Room for your toes", note: "My white barefoot shoes.", url: "", extra: "", label: "", width: 112, height: 70, mass: .8 },
  { name: "Strawberry rhubarb pie", kind: "Sweet meets tart", note: "Strawberry rhubarb pie. A favorite.", url: "", extra: "", label: "", width: 85, height: 72, mass: 1 },
  { name: "Warheads", kind: "The sour corner", note: "Warheads candy.", url: "", extra: "", label: "", width: 72, height: 77, mass: .6 },
  { name: "Concord grapes", kind: "A bunch worth keeping", note: "Concord grapes.", url: "", extra: "", label: "", width: 72, height: 74, mass: .7 },
  { name: "Soursop", kind: "Something tropical", note: "Soursop.", url: "", extra: "", label: "", width: 85, height: 73, mass: 1.1 },
  { name: "Mangosteen", kind: "Under the purple shell", note: "Mangosteen.", url: "", extra: "", label: "", width: 73, height: 72, mass: .8 },
  { name: "Darn Tough socks", kind: "A good pair of socks", note: "Darn Tough socks.", url: "", extra: "", label: "", width: 74, height: 83, mass: .6 },
  { name: "Give’r gloves", kind: "The leather pair", note: "Give’r gloves.", url: "", extra: "", label: "", width: 80, height: 86, mass: .8 },
  { name: "Electric heated mittens", kind: "A little extra warmth", note: "Electric heated mittens.", url: "", extra: "", label: "", width: 80, height: 90, mass: .9 },
];
type ShelfItem = (typeof objects)[number] & { book?: LoveItem; bookIndex?: number };
const noBooks: LoveItem[] = [];
type Body = { x: number; y: number; vx: number; vy: number; angle: number; spin: number; readyAt: number };
const platforms = [{ x: .07, end: .9, y: .24 }, { x: 0, end: 1, y: .48 }, { x: .07, end: .99, y: .72 }, { x: .07, end: .99, y: .96 }];
export function CarryShelf({ books = noBooks }: { books?: LoveItem[] }) {
  const items = useMemo<ShelfItem[]>(() => [
    ...objects,
    ...books.filter(book => book.published && book.type === "Book").map((book, index) => ({
      name: book.title, kind: book.subtitle, note: book.note, url: book.url,
      extra: "", label: "", width: 44, height: bookHeight(index), mass: .9,
      book, bookIndex: index,
    })),
  ], [books]);
  const stage = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const popup = useRef<HTMLDivElement>(null);
  const bodies = useRef<Body[]>([]);
  const size = useRef({ w: 900, h: 510, scale: 1 });
  const drag = useRef<{ id: number; dx: number; dy: number; startX: number; startY: number; moved: boolean; time: number; lastX: number; lastY: number } | null>(null);
  const selectedRef = useRef<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [light, setLight] = useState(false);

  function scaleFor(index: number) { return items[index].book ? 1 : size.current.scale; }
  function choose(id: number | null) { selectedRef.current = id; setSelected(id); }
  function reset(drop = false) {
    const { w, h } = size.current;
    const homes = [[.17, 0], [.38, 0], [.17, 1], [.59, 0], [.47, 1], [.17, 2], [.35, 2], [.53, 2], [.71, 2], [.9, 2], [.8, 0], [.7, 1], [.9, 1]];
    bodies.current = items.map((item, i) => ({
      x: item.book ? Math.max(8, (w - (items.length - objects.length) * 46) / 2) + (i - objects.length) * 46 : w * homes[i][0] - item.width * scaleFor(i) / 2,
      y: h * platforms[item.book ? 3 : homes[i][1]].y - item.height * scaleFor(i) - (drop ? 48 + i % 3 * 7 : 0),
      vx: 0, vy: 0, angle: drop && !item.book ? (i % 2 ? -5 : 5) : 0, spin: 0,
      readyAt: drop ? performance.now() + i * 65 : 0,
    }));
    choose(null);
  }
  useEffect(() => {
    const el = stage.current!;
    const observer = new ResizeObserver(() => {
      size.current = { w: el.clientWidth, h: el.clientHeight, scale: Math.max(.63, Math.min(1, el.clientWidth / 650)) };
      el.style.setProperty("--item-scale", String(size.current.scale));
      reset();
    });
    observer.observe(el);
    let visible = false, entered = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !entered) {
        entered = true;
        reset(!reduced.matches);
        el.dataset.ready = "true";
      }
    }, { threshold: .2 });
    visibility.observe(el);
    let frame = 0, previous = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, .025); previous = now;
      const { w, h } = size.current;
      if (!visible || document.hidden) { frame = requestAnimationFrame(tick); return; }
      bodies.current.forEach((b, i) => {
        const iw = items[i].width * scaleFor(i), ih = items[i].height * scaleFor(i);
        if (drag.current?.id !== i && now >= b.readyAt) {
          const oldBottom = b.y + ih;
          b.vy += 1100 * dt;
          b.x += b.vx * dt; b.y += b.vy * dt;
          b.angle = items[i].book ? 0 : b.angle + b.spin * dt;
          if (b.x < 0 || b.x + iw > w) { b.x = Math.max(0, Math.min(w - iw, b.x)); b.vx *= -.25; }
          for (const shelf of platforms) {
            const top = h * shelf.y;
            if (b.vy >= 0 && oldBottom <= top + 2 && b.y + ih >= top && b.x + iw * .7 > w * shelf.x && b.x + iw * .3 < w * shelf.end) {
              b.y = top - ih;
              b.vy = Math.abs(b.vy) > 65 && !reduced.matches ? -b.vy * .2 / items[i].mass : 0;
              b.vx *= .79; b.angle *= .75; b.spin *= .4;
              break;
            }
          }
          if (b.y + ih > h * .96) { b.y = h * .96 - ih; b.vy = 0; b.vx *= .8; }
        }
      });
      // Resolve contacts between objects without disturbing the item held by the pointer.
      for (let i = 0; i < bodies.current.length; i++) for (let j = i + 1; j < bodies.current.length; j++) {
        const a = bodies.current[i], b = bodies.current[j];
        if (now < a.readyAt || now < b.readyAt) continue;
        const aw = items[i].width * scaleFor(i), ah = items[i].height * scaleFor(i), bw = items[j].width * scaleFor(j), bh = items[j].height * scaleFor(j);
        const ox = Math.min(a.x + aw, b.x + bw) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + ah, b.y + bh) - Math.max(a.y, b.y);
        if (ox > 0 && oy > 0) {
          const held = drag.current?.id;
          if (oy < ox && held !== i && held !== j) {
            const upper = a.y < b.y ? a : b;
            upper.y -= oy; upper.vy = 0; upper.vx *= .9; upper.angle *= .75; upper.spin *= .4;
          } else {
            const direction = a.x < b.x ? -1 : 1;
            if (held !== i) { a.x = Math.max(0, Math.min(w - aw, a.x + direction * ox * (held === j ? 1 : .5))); a.vx = direction * 25; }
            if (held !== j) { b.x = Math.max(0, Math.min(w - bw, b.x - direction * ox * (held === i ? 1 : .5))); b.vx = -direction * 25; }
          }
        }
      }
      bodies.current.forEach((b, i) => {
        const node = nodes.current[i];
        if (node) node.style.transform = "translate(" + b.x + "px," + b.y + "px) rotate(" + b.angle + "deg)";
      });
      const id = selectedRef.current;
      if (id !== null && bodies.current[id] && popup.current) {
        const b = bodies.current[id], card = popup.current;
        const pw = card.offsetWidth, ph = card.offsetHeight;
        const x = Math.max(8, Math.min(w - pw - 8, b.x + items[id].width * scaleFor(id) + 12));
        const overlapsObject = x < b.x + items[id].width * scaleFor(id) && x + pw > b.x;
        const desiredY = overlapsObject ? (b.y > ph + 12 ? b.y - ph - 12 : b.y + items[id].height * scaleFor(id) + 12) : b.y - 20;
        const y = Math.max(8, overlapsObject ? desiredY : Math.min(h - ph - 8, desiredY));
        card.style.transform = "translate(" + x + "px," + y + "px)";
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { observer.disconnect(); visibility.disconnect(); cancelAnimationFrame(frame); };
    // Rebuild when the published book list changes or the shelf is resized.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
  function moveWithKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const b = bodies.current[index];
    if (!b || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const { w, h } = size.current, scale = scaleFor(index), item = items[index];
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      b.x = Math.max(0, Math.min(w - item.width * scale, b.x + (event.key === "ArrowLeft" ? -30 : 30)));
    } else {
      const bottom = b.y + item.height * scale;
      const row = platforms.reduce((best, shelf, i) => Math.abs(shelf.y * h - bottom) < Math.abs(platforms[best].y * h - bottom) ? i : best, 0);
      const next = Math.max(0, Math.min(platforms.length - 1, row + (event.key === "ArrowUp" ? -1 : 1)));
      b.y = h * platforms[next].y - item.height * scale;
    }
    b.vx = 0; b.vy = 0; b.readyAt = 0;
  }

  return <section id="current-carry" aria-label="Things I keep close" className={styles.room} data-inspecting={selected !== null}>
    <div className={styles.cabinet} data-light={light}>
      <div ref={stage} data-ready="false" className={styles.stage} onKeyDown={e => { if (e.key === "Escape") choose(null); }}>
        {platforms.map((s, i) => <div key={i} className={styles.shelf} aria-hidden="true" style={{ left: s.x * 100 + "%", width: (s.end - s.x) * 100 + "%", top: s.y * 100 + "%" }}></div>)}
        {items.map((item, i) => <button key={item.name} ref={el => { nodes.current[i] = el; }} className={styles.object} data-book={Boolean(item.book)} data-selected={selected === i} aria-label={item.name + ". Click for details, drag to move, or use arrow keys."} aria-expanded={selected === i} aria-controls="carry-note"
          style={{ width: item.book ? item.width + "px" : "calc(" + item.width + "px * var(--item-scale))", height: item.book ? item.height + "px" : "calc(" + item.height + "px * var(--item-scale))", "--sprite": i } as React.CSSProperties}
          onPointerDown={e => {
            if (e.button !== 0) return;
            const b = bodies.current[i]; if (!b) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            const rect = stage.current!.getBoundingClientRect();
            drag.current = { id: i, dx: e.clientX - rect.left - b.x, dy: e.clientY - rect.top - b.y, startX: e.clientX, startY: e.clientY, moved: false, time: performance.now(), lastX: e.clientX, lastY: e.clientY };
          }}
          onPointerMove={e => {
            const d = drag.current; if (d?.id !== i) return;
            if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) d.moved = true;
            if (!d.moved) return;
            const rect = stage.current!.getBoundingClientRect(), b = bodies.current[i], now = performance.now(), dt = Math.max(.016, (now - d.time) / 1000);
            b.x = Math.max(0, Math.min(size.current.w - item.width * scaleFor(i), e.clientX - rect.left - d.dx));
            b.y = Math.max(0, Math.min(size.current.h - item.height * scaleFor(i), e.clientY - rect.top - d.dy));
            b.vx = Math.max(-500, Math.min(500, (e.clientX - d.lastX) / dt)); b.vy = Math.max(-400, Math.min(500, (e.clientY - d.lastY) / dt));
            b.angle = item.book ? 0 : Math.max(-9, Math.min(9, b.vx / 50)); b.spin = 0;
            d.lastX = e.clientX; d.lastY = e.clientY; d.time = now;
          }}
          onPointerUp={e => {
            const d = drag.current; if (d?.id !== i) return;
            if (!d.moved) choose(selectedRef.current === i ? null : i);
            if (item.book) { bodies.current[i].vx = 0; bodies.current[i].vy = 0; }
            drag.current = null; e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => { drag.current = null; }}
          onClick={e => { if (e.detail === 0) choose(selectedRef.current === i ? null : i); }}
          onKeyDown={event => moveWithKeys(event, i)}>{item.book ? <BookSpine book={item.book} index={item.bookIndex!} /> : <span className={styles.sprite} style={{backgroundImage:"url(/current-carry/"+(i === 4 ? "white-shoes" : i >= 10 ? ["darn-tough-mark", "giver-mark", "winter-3"][i-10] : "voxel-"+i)+".webp)"}}/>}<span className={styles.objectShadow}/></button>)}
        {selected !== null && <div ref={popup} id="carry-note" className={styles.note} role="region" aria-label={items[selected].name + " details"}>
          <div className={styles.noteBar}><span>INSPECT OBJECT</span><button onClick={() => choose(null)} aria-label="Close item details">×</button></div>
          <div className={styles.noteBody}><small>{items[selected].kind}</small><h2>{items[selected].name}</h2><p>{items[selected].note}</p>
            {items[selected].url && <a href={items[selected].url} target="_blank" rel="noreferrer">Take a closer look ↗</a>}
            {items[selected].extra && <a href={items[selected].extra} target="_blank" rel="noreferrer">{items[selected].label} ↗</a>}
            {selected === 3 && <button className={styles.lightSwitch} onClick={() => setLight(!light)} aria-pressed={light}>Light {light ? "off" : "on"} ↗</button>}
          </div>
        </div>}
      </div>
      <div className={styles.base}><button onClick={() => reset()} aria-label="Reset shelf">↺</button></div>

    </div>

  </section>;
}
