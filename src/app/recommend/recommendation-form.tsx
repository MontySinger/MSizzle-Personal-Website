"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { OrbitalDisplay } from "./orbital-display";
import { editions } from "./editions";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./recommend.module.css";

type Pick = { title: string; subtitle: string; note: string; url: string };

export function RecommendationForm({ initialTheme, picks }: { initialTheme?: string; picks: Pick[] }) {
  const pathname = usePathname();
  const query = useSearchParams();
  const selected = pathname.split("/")[2] || query.get("theme") || initialTheme;
  const [theme, name, action] = editions.find(([id]) => id === selected) ?? editions[1];
  useEffect(() => { document.title = name + " · Things I Love"; }, [name]);
  const illustration = theme === "field" ? "cabinet" : theme === "cinema" ? "film" : theme;
  const [take, setTake] = useState(0);
  const [entry, setEntry] = useState(false);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const pick = picks[index % (picks.length || 1)];
  useEffect(() => { if (entry) input.current?.focus(); }, [entry]);
  const [status, setStatus] = useState<"ready" | "sending" | "sent">("ready");
  const [noteOpen, setNoteOpen] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    if (!url.trim()) {
      setTake(n => n + 1);
      setEntry(true);
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

  function explore() {
    setTake(n => n + 1);
    setIndex(n => n + 1);
  }

  return <section className={styles.world} data-theme={theme}>
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
        <button type="button" className={styles.scene} onClick={explore} aria-label={action} data-alt={take % 2} data-play={take > 0}>
          {theme === "orbit" ? <OrbitalDisplay key={take} sequence={index} total={picks.length} /> :
            theme !== "miami" && <picture>
              <source media="(max-width: 480px) and (max-resolution: 2dppx)" srcSet={`/recommend/${illustration}-850.webp`} />
              <img key={theme + take} className={styles.art} src={`/recommend/${illustration}.webp`} alt="" />
            </picture>}
          <i key={theme + "-fx" + take} className={styles.effect} aria-hidden="true" />
          <span className={styles.trigger}>{action} ↻</span>
        </button>
        <aside className={styles.collection} aria-label="From the pinboard">
          <span className={styles.kicker}>From the pinboard</span>
          {pick ? <div aria-live="polite"><h2><a href={pick.url} target="_blank" rel="noreferrer">{pick.title} ↗</a></h2>
            <p>{pick.note || pick.subtitle}</p>
            <button type="button" className={styles.next} onClick={explore}>Next favorite →</button>
          </div> : <Link href="/#loves">Explore the collection ↗</Link>}
        </aside>
      </div>
      <form className={styles.controls} onSubmit={submit}>
        {status === "sent" ? <div className={styles.receipt} role="status">
          <strong>Your recommendation is in my inbox.</strong>
          <button type="button" onClick={() => {setStatus("ready"); setEntry(false); setNoteOpen(false); setUrl(""); setNote("");}}>Send another ↗</button>
        </div> : <>
          <div className={styles.slot}>
            <label className={styles.urlLabel}>Send me something you think I’d enjoy.
              <input ref={input} name="url" value={url} onChange={e=>setUrl(e.target.value)} type="url" maxLength={2048} placeholder="Paste a link…" aria-label="Link to your favorite" />
            </label>
            <input hidden name="website" tabIndex={-1} autoComplete="off"/>
            <label hidden={!noteOpen} className={styles.note}>Why would I like it?<textarea name="note" maxLength={500} rows={2} value={note} onChange={e=>setNote(e.target.value)}/></label>
            {error && <p role="alert">{error}</p>}
          </div>
          <div className={styles.keys}>
            <button className={styles.send} disabled={status === "sending"}>{status === "sending" ? "Sharing…" : "Share with Monty"}</button>
            <button className={styles.utility} type="button" aria-expanded={noteOpen} onClick={() => {setEntry(true); setNoteOpen(!noteOpen);}}>Note {noteOpen ? "−" : "+"}</button>
          </div>
        </>}
      </form>
      {theme === "orbit" && <div className={styles.vents} aria-hidden="true"/>}
    </div>
    <fieldset id="editions" className={styles.themes}><legend>Choose your edition</legend>
      {editions.map(([id, title]) => <a key={id} href={`/recommend/${id}`} aria-current={theme === id ? "page" : undefined}
        onClick={event => {if(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); window.history.pushState(null, "", `/recommend/${id}`); setTake(0);}}>
        <span aria-hidden="true" style={{ backgroundImage: `url(/recommend/thumbs/${id}.webp)` }} />{title}
      </a>)}
    </fieldset>
  </section>;
}
