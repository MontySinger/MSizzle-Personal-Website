import { StructureArt } from "./structure-art";
import Link from "next/link";
import type { Project } from "@/lib/notion-projects";
import { buildingRows } from "@/lib/homepage-rows";
import { accentStyle } from "@/lib/accent-rotation";

/**
 * SectionBuilding: Swiss numbered index for the Building band (HP-02).
 * Row 001 is always the hardcoded Prometheus row. Rows 002+ map one-to-one
 * from the `projects` prop (real, already-fetched Notion Featured Projects,
 * forwarded by the orchestrator in Plan 21-05) — this absorbs
 * section-work.tsx's Notion data role so that component can be deleted.
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
}: {
  projects?: Project[];
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
      <div className="structure-section-title" aria-hidden="true">Building.</div>
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
      <Link className="more reveal" href="/building">
        all projects →
      </Link>
    </section>
  );
}
