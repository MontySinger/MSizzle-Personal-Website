"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KissatenPlayer } from "./kissaten-player";
import { ZineScene } from "./zine-scene";
import { FieldScene } from "./field-scene";
import { MiamiScene } from "./miami-scene";
import { CinemaScene } from "./cinema-scene";
import { GoblinScene } from "./goblin-scene";
import { OrbitalScene } from "./orbital-scene";
import { FavoriteGallery, type FavoriteCard } from "./favorite-gallery";
import { editions } from "./editions";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./recommend.module.css";

const instruments = {
  kissaten: { label: "Request a side for Monty", receipt: "Your request is in Monty’s inbox." },
  goblin: { label: "What’s on the menu for Monty?", receipt: "Order delivered to Monty’s inbox." },
  miami: { label: "Leave a link at the night desk", receipt: "The night desk delivered your message to Monty." },
  field: { label: "Catalogue a find for Monty", receipt: "Your specimen card reached Monty’s inbox." },
  cinema: { label: "Admit one recommendation", receipt: "Ticket issued and delivered to Monty." },
  orbit: { label: "Uplink address", receipt: "Transmission received in Monty’s inbox." },
  zine: { label: "Paste a link into the master copy", receipt: "Your edition reached Monty’s inbox." },
};

export function RecommendationForm({ initialTheme, cards }: { initialTheme?: string; cards: FavoriteCard[] }) {
  const pathname = usePathname();
  const query = useSearchParams();
  const selected = pathname.split("/")[2] || query.get("theme") || initialTheme;
  const [theme, name] = editions.find(([id]) => id === selected) ?? editions[1];
  useEffect(() => { document.title = name + " · Things I Love"; }, [name]);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"ready" | "sending" | "sent">("ready");
  const [noteOpen, setNoteOpen] = useState(false);
  const noteInput = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (noteOpen) noteInput.current?.focus(); }, [noteOpen]);
  const [error, setError] = useState("");
  const pending = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    if (!url.trim()) {
      input.current?.focus();
      return;
    }
    const body = Object.fromEntries(new FormData(event.currentTarget));
    pending.current = true;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Please try again.");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof TypeError ? "Check your connection and try again." : (err as Error).message);
      setStatus("ready");
    } finally {
      pending.current = false;
    }
  }



  let host = "";
  try {
    const parsed = new URL(url);
    if (["http:", "https:"].includes(parsed.protocol)) host = parsed.hostname.replace(/^www\./, "");
  } catch { /* An unfinished address stays editable. */ }

  const controls = <form className={styles.controls} onSubmit={submit}>
        {status === "sent" ? <div className={styles.receipt} role="status">
          <strong>{instruments[theme].receipt}</strong>
          <button type="button" onClick={() => {setStatus("ready"); setNoteOpen(false); setUrl(""); setNote("");}}>Send another ↗</button>
        </div> : <>
          <div className={styles.slot}>
            <label className={styles.urlLabel}>{instruments[theme].label}
              <input ref={input} name="url" value={url} onChange={e=>setUrl(e.target.value)} type="url" required maxLength={2048} placeholder="Paste a link…" aria-label="Link to your favorite" />
            </label>
            <input hidden name="website" tabIndex={-1} autoComplete="off"/>
            <label hidden={!noteOpen} className={styles.note}>Why would I like it?<textarea id="recommendation-note" ref={noteInput} name="note" maxLength={500} rows={2} value={note} onChange={e=>setNote(e.target.value)}/></label>
            {error && <p role="alert">{error}</p>}
          </div>
          <div className={styles.keys}>
            <button className={styles.send} disabled={status === "sending"}>{status === "sending" ? "Sharing…" : "Share with Monty"}</button>
            <button className={styles.utility} type="button" aria-controls="recommendation-note" aria-expanded={noteOpen} onClick={() => setNoteOpen(!noteOpen)}>Note {noteOpen ? "−" : "+"}</button>
          </div>
        </>}
      </form>;
  const sceneProps = { controls, host };

  return <section className={styles.world} data-theme={theme} data-instrument="" data-status={status}>
    <nav className={styles.nav} aria-label="Pinboard navigation">
      <Link href="/#loves">← Monty’s pinboard</Link>
      <a href="#editions">Editions ↓</a>
    </nav>
    <div className={styles.machine}>
      <header className={styles.plate}>
        {theme === "orbit" && <span className={styles.screws} aria-hidden="true" />}
        {theme === "kissaten" && <span lang="ja" className={styles.japanese}>好きなもの</span>}
        <h1>Things <em>I Love</em></h1>
        <div className={styles.signature}><strong>{name}</strong><i aria-hidden="true"/></div>
      </header>
      <div className={styles.display}>
        {theme === "kissaten" ? <KissatenPlayer {...sceneProps} /> :
          theme === "orbit" ? <OrbitalScene {...sceneProps} /> :
          theme === "cinema" ? <CinemaScene {...sceneProps} /> :
          theme === "goblin" ? <GoblinScene {...sceneProps} onFeed={() => input.current?.focus()} /> :
          theme === "field" ? <FieldScene {...sceneProps} /> :
          theme === "miami" ? <MiamiScene {...sceneProps} /> :
          <ZineScene {...sceneProps} />}
      </div>

      {theme === "orbit" && <div className={styles.vents} aria-hidden="true"/>}
    </div>
    <fieldset id="editions" className={styles.themes}><legend>Choose your edition</legend>
      {editions.map(([id, title]) => <a key={id} href={`/recommend/${id}`} aria-current={theme === id ? "page" : undefined}
        onClick={event => {if(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); window.history.pushState(null, "", `/recommend/${id}`);}}>
        <span aria-hidden="true" style={{ backgroundImage: `url(/recommend/thumbs/${id}.webp)` }} />{title}
      </a>)}
    </fieldset>
    <FavoriteGallery cards={cards} />
  </section>;
}
