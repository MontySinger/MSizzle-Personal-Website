"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./kissaten-player.module.css";

type Phase = "ready" | "cueing" | "playing" | "paused";

function Deck({ phase }: { phase: Phase }) {
  return <svg className={styles.deck} viewBox="0 0 720 500" role="img" aria-label="Walnut turntable with a vermilion jazz record and a moving silver tonearm">
    <defs>
      <linearGradient id="ks-felt" x2=".8" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="#566044"/><stop offset=".55" stopColor="#3b4533"/><stop offset="1" stopColor="#293024"/></linearGradient>
      <linearGradient id="ks-wood" x2=".1" y2="1"><stop stopColor="#77472c"/><stop offset=".2" stopColor="#6a422b"/><stop offset=".86" stopColor="#593621"/><stop offset="1" stopColor="#352518"/></linearGradient>
      <linearGradient id="ks-metal" x2=".88" y2="1"><stop stopColor="#acaaa0"/><stop offset=".25" stopColor="#ded7c7"/><stop offset=".55" stopColor="#b6afa1"/><stop offset=".82" stopColor="#ccc6b7"/><stop offset="1" stopColor="#8a867b"/></linearGradient>
      <linearGradient id="ks-chrome"><stop stopColor="#282822"/><stop offset=".22" stopColor="#8f9186"/><stop offset=".47" stopColor="#fcf9e7"/><stop offset=".68" stopColor="#908e80"/><stop offset="1" stopColor="#3c403a"/></linearGradient>
      <radialGradient id="ks-cap" cx=".32" cy=".27"><stop stopColor="#f9f0d4"/><stop offset=".35" stopColor="#c9b796"/><stop offset=".78" stopColor="#84765b"/><stop offset="1" stopColor="#4b4436"/></radialGradient>
      <pattern id="ks-brush" width="37" height="5" patternUnits="userSpaceOnUse"><path d="M0 .5h34m-27 2h30" stroke="#f8f2df" strokeWidth=".45" opacity=".45"/></pattern>
      <pattern id="ks-woodgrain" width="158" height="10" patternUnits="userSpaceOnUse"><path d="M-4 6q40-8 87-2t82-1m-143 6q44-8 89-2" fill="none" stroke="#281c13" strokeWidth=".8" opacity=".43"/></pattern>
      <clipPath id="ks-vinyl"><circle cx="278" cy="244" r="190"/></clipPath>
      <path id="ks-label-arc" d="M233 248a45 45 0 0 1 90 0"/>
    </defs>
    <rect width="720" height="500" fill="url(#ks-felt)"/>
    <rect x="46" y="41" width="636" height="425" rx="8" fill="#141c14" opacity=".48"/>
    <rect x="34" y="28" width="642" height="429" rx="8" fill="url(#ks-wood)" stroke="#37271c" strokeWidth="2"/>
    <rect x="37" y="31" width="636" height="422" rx="6" fill="url(#ks-woodgrain)" stroke="#986744"/>
    <rect x="46" y="40" width="619" height="399" rx="5" fill="url(#ks-metal)" stroke="#4c493d" strokeWidth="2"/>
    <rect x="47" y="41" width="617" height="397" rx="5" fill="url(#ks-brush)"/>
    {[[58,53],[653,53],[58,427],[653,427]].map(([x,y]) => <g key={x+"-"+y} transform={`translate(${x} ${y}) rotate(-28)`}><circle r="4" fill="url(#ks-cap)"/><path d="M-2.5 0h5" stroke="#494638" strokeWidth="1.3"/></g>)}
    <circle cx="280" cy="249" r="195" fill="#57554b" opacity=".65"/>
    <circle cx="278" cy="244" r="195" fill="#292a24" stroke="#d5d1c4" strokeWidth="1.8"/>
    <image href="/recommend/kissaten.webp" x="-30" y="5" width="670" height="502.5" clipPath="url(#ks-vinyl)" preserveAspectRatio="none"/>
    <g className={styles.rotor}>
      <circle cx="278" cy="244" r="57" fill="#e4cf9a" stroke="#bda879"/>
      <circle cx="278" cy="244" r="49" fill="none" stroke="#b68a57" strokeWidth=".65"/>
      <path d="M225 255q53 18 106 0" fill="none" stroke="#943b27" strokeWidth="1.5"/>
      <text fill="#383923" fontFamily="Georgia,serif" fontWeight="bold" fontSize="11" letterSpacing="2.2"><textPath href="#ks-label-arc" startOffset="50%" textAnchor="middle">KISSATEN</textPath></text>
      <text x="278" y="274" textAnchor="middle" fontFamily="monospace" fontSize="7.5" fill="#514a32">SIDE A · 33⅓</text>
      <path d="M161 100l2 3m166 301 2 1m61-227 1.8 2.6" stroke="#ffd67d" opacity=".74" strokeWidth="1.2"/>
    </g>
    <circle cx="278" cy="244" r="5.6" fill="url(#ks-cap)" stroke="#514430" strokeWidth="1"/>
    <g transform="translate(597 105)"><circle cx="2" cy="4" r="33" fill="#686659"/><circle r="32" fill="url(#ks-chrome)" stroke="#48483d" strokeWidth="1.5"/><circle r="25" fill="#343731" stroke="#c3c0ac" strokeWidth="2"/></g>
    <g transform="translate(597 105)">
      <g className={styles.arm}>
        <rect x="-11" y="-42" width="22" height="50" rx="4" fill="#272924" stroke="#504e41"/>
        <rect x="-15" y="-50" width="30" height="24" rx="4" fill="url(#ks-chrome)" stroke="#5a584c"/>
        <path d="M0 2v176q0 22-10 39l-20 33" fill="none" stroke="#4c493a" strokeWidth="10" opacity=".48" transform="translate(3 4)"/>
        <path d="M0 2v176q0 22-10 39l-20 33" fill="none" stroke="#49493f" strokeWidth="9"/>
        <path d="M-1 2v176q0 22-10 39l-20 33" fill="none" stroke="#d1cebd" strokeWidth="5"/>
        <path d="M-2 10v167q0 22-10 39l-19 32" fill="none" stroke="#fbf4dd" strokeWidth="1.15"/>
        <circle r="10" fill="url(#ks-cap)" stroke="#46473c"/>
        <g transform="translate(-25 236) rotate(28)"><rect x="-8" y="-7" width="18" height="32" rx="2" fill="#292b25" stroke="#5b5c50"/><rect x="-5" y="20" width="12" height="8" fill="#c3b590"/><path d="M1 27v5" stroke="#3f3f36" strokeWidth="1.4"/><path d="M7 0h18v-4" fill="none" stroke="#bab7a7" strokeWidth="3"/></g>
      </g>
    </g>
    <circle cx="606" cy="383" r="19" fill="#827f71"/><circle cx="605" cy="381" r="16" fill="url(#ks-cap)" stroke="#777466"/>
    <path d="m605 369 2 7" stroke="#45473c" strokeWidth="2"/>
    <circle cx="556" cy="382" r="3" fill={phase === "playing" ? "#bc4c27" : "#757461"}/>
    <text x="489" y="412" fontFamily="monospace" fontSize="8" letterSpacing="1.6" fill="#434738">33⅓ RPM · STEREO</text>
  </svg>;
}

export function KissatenPlayer() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [sound, setSound] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (phase !== "ready" && phase !== "cueing") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = phase === "ready" ? 160 : reduced ? 0 : 1050;
    const timer = window.setTimeout(() => setPhase(phase === "ready" ? "cueing" : "playing"), delay);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    const element = audio.current;
    return () => element?.pause();
  }, []);

  function startSound() {
    const element = audio.current;
    if (!element) return;
    element.volume = .48;
    setAudioError(false);
    void element.play().catch((err: Error) => {
      if (err.name === "AbortError" || !element.isConnected) return;
      setSound(false);
      setAudioError(true);
    });
  }

  function togglePlay() {
    if (phase !== "paused") {
      setPhase("paused");
      audio.current?.pause();
    } else {
      setPhase("cueing");
      if (sound) startSound();
    }
  }

  function toggleSound() {
    if (sound) {
      setSound(false);
      audio.current?.pause();
    } else {
      setSound(true);
      if (phase === "paused") setPhase("cueing");
      startSound();
    }
  }

  return <section className={styles.player} data-phase={phase} aria-label="Kissaten record player">
    <Deck phase={phase}/>
    <div className={styles.transport}>
      <button type="button" onClick={togglePlay}><span aria-hidden="true">{phase === "paused" ? "▶" : "Ⅱ"}</span>{phase === "paused" ? "Play record" : "Pause record"}</button>
      <span className={styles.status} role="status">{audioError ? "Audio unavailable" : phase === "cueing" ? "Cueing side A" : phase === "paused" ? "At rest" : phase === "playing" ? "Playing side A" : "Side A"}</span>
      <button type="button" aria-pressed={sound} onClick={toggleSound} aria-label={sound ? "Turn music off" : "Turn music on"}>Music {sound ? "on" : "off"}</button>
    </div>
    <audio ref={audio} src="/recommend/kissaten/afternoon-trio.mp3" muted={!sound || phase !== "playing"} loop preload="none" />
  </section>;
}
