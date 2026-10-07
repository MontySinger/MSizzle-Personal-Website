"use client";
import { useEffect, useId, useRef, useState } from "react";

/** Native scroll drives the mechanism. Ambient drift runs only while visible. */
export function StructureArt({ kind }: { kind: "systems" | "press" }) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let request = 0;
    const update = () => {
      request = 0;
      const b = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight - b.top) / (innerHeight + b.height)));
      el.style.setProperty("--art-progress", String(p));
      el.style.setProperty("--crank", `${p * 360}deg`);
    };
    const schedule = () => { if (!request) request = requestAnimationFrame(update); };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => el.classList.toggle("art-visible", entry.isIntersecting));
    observer?.observe(el);
    const visibility = () => el.classList.toggle("art-hidden", document.hidden);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", visibility);
    update();
    return () => { observer?.disconnect(); cancelAnimationFrame(request); removeEventListener("scroll", schedule); removeEventListener("resize", schedule); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const press = kind === "press";
  return <div ref={root} className={`structure-art ${press ? "structure-press" : "structure-systems"} ${paused ? "art-paused" : ""}`}>
    <div className="structure-art-label"><span>{press ? "Ideas, put into print." : "Applied AI. Connected systems."}</span><button onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? "Resume motion" : "Pause motion"}</button></div>
    <svg viewBox={press ? "120 60 620 310" : "0 0 800 400"} fill="none" aria-hidden="true">
      <defs>
        <pattern id={`${id}-dots`} width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="currentColor" /></pattern>
        <linearGradient id={`${id}-fade`}><stop offset="0" stopColor="white" /><stop offset="1" stopColor="black" /></linearGradient>
        <mask id={`${id}-mask`}><rect width="800" height="400" fill={`url(#${id}-fade)`} /></mask>
      </defs>
      {press ? <>
        <g stroke="currentColor" strokeWidth="2">
          <path d="M200 95H590V275H200z M220 95V275 M565 95V275 M175 275H615V293H175z" />
          <path d="M200 107H565 M200 162H565 M200 188H565 M200 243H565" />
          <ellipse cx="220" cy="135" rx="22" ry="28" /><ellipse cx="565" cy="135" rx="22" ry="28" />
          <ellipse cx="220" cy="215" rx="22" ry="28" /><ellipse cx="565" cy="215" rx="22" ry="28" />
          <path d="M215 107H565V163H215z" fill={`url(#${id}-dots)`} mask={`url(#${id}-mask)`} />
          <path d="M220 188H565V243H220z" fill={`url(#${id}-dots)`} opacity=".25" />
          <g className="press-sheet"><path d="M310 164H490L515 336H285Z" fill="var(--color-bg, #efeee9)" /><path d="M330 200H473 M328 218H475 M325 236H478 M322 254H480 M319 272H482 M316 290H460" /></g>
          <g className="press-crank"><path d="M586 215H630V167H679" strokeWidth="3" /><rect x="673" y="157" width="37" height="18" rx="8" fill={`url(#${id}-dots)`} /></g>
          <path d="M180 75H610 M180 65V85 M610 65V85 M165 98V293" strokeDasharray="3 5" opacity=".4" />
        </g>
      </> : <g stroke="currentColor">
        <path d="M160 205L365 112L510 244L667 130 M160 205L410 310L667 130 M365 112L410 310" strokeWidth="1" />
        {[{x:160,y:205,r:87},{x:365,y:112,r:39},{x:510,y:244,r:57},{x:667,y:130,r:28},{x:410,y:310,r:21}].map((n,i) => <g key={i}><circle cx={n.x} cy={n.y} r={n.r} fill={i % 2 === 0 ? `url(#${id}-dots)` : "none"} /><circle cx={n.x} cy={n.y} r={n.r+9} strokeDasharray="2 5" opacity=".5" /><path d={`M${n.x-n.r-18} ${n.y}H${n.x+n.r+18} M${n.x} ${n.y-n.r-18}V${n.y+n.r+18}`} opacity=".35" /></g>)}
      </g>}
      <g className="art-particles" fill="currentColor">
        {Array.from({length:100},(_,i) => {
          const x = press ? 115 + (i*37 % 210) : 60 + (i*47 % 680);
          const y = 70 + (i*61 % 270);
          return <circle key={i} cx={x} cy={y} r={.7+(i%4)*.45} opacity={.2+(i%5)*.12} style={{ animationDelay:`-${i*.31}s`, animationDuration:`${6+i%6}s` }} />;
        })}
      </g>
    </svg>
    <div className="structure-art-foot"><span>{press ? "Ink → structure → ideas" : "Structure from possibility"}</span><span aria-hidden="true">＋</span></div>
  </div>;
}
