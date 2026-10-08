import { StructureArt } from "./structure-art";
import Link from "next/link";
import type { Project } from "@/lib/notion-projects";
import { buildingRows } from "@/lib/homepage-rows";
import { accentStyle } from "@/lib/accent-rotation";

/**
 * SectionBuilding: Swiss numbered index for the Building band (HP-02).
 * Prometheus is the sole public feature. The row helper also owns the
 * document-order accent count so Writing starts immediately after it.
 * Server Component only; no client directive.
 * Full-row hover/focus inversion is the site's only hover language (HP-02),
 * implemented via the .a-row CSS family in globals.css.
 *
 * Row derivation lives in `@/lib/homepage-rows` (21.5-02) so the accent
 * rotation offset math and the rendered rows can never drift apart.
 */
export function SectionBuilding({
  projects = [],
  accentStart = 0,
  standalone = false,
}: {
  projects?: Project[];
  standalone?: boolean;
  /**
   * Document-order accent index this section's first row should carry.
   * `nth-child` cannot count across sibling `<section>` elements, so the
   * running counter is lifted to the common parent (explorative-homepage.tsx)
   * and handed down here as a start offset (D-V5-05, D-V5-07).
   */
  accentStart?: number;
}) {
  const rows = buildingRows(projects);

  return (
    <section className="wrap a-sec" id="building">
      <h2 className="reveal font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
        01 · Building
      </h2>
      {standalone ? <h1 className="structure-section-title">Building.</h1> : <div className="structure-section-title" aria-hidden="true">Building.</div>}
      <StructureArt kind="systems" />
      {rows.map((row, i) => {
        const children = (
          <>
            <span className="num">{String(i + 1).padStart(3, "0")}</span>
            <span className="ttl">{row.title}</span>
            <span className="dsc">{row.description}</span>
            <span className="status">{row.status}</span>
          </>
        );

        return row.external ? (
          <a
            key={row.href}
            className="a-row reveal"
            href={row.href}
            target="_blank"
            rel="noopener noreferrer"
            style={accentStyle(accentStart + i)}
          >
            {children}
          </a>
        ) : (
          <Link
            key={row.href}
            className="a-row reveal"
            href={row.href}
            style={accentStyle(accentStart + i)}
          >
            {children}
          </Link>
        );
      })}
    </section>
  );
}
