import { StructureArt } from "./structure-art";
import Link from "next/link";
import type { BlogPost } from "@/lib/notion";
import { writingRows, formatYYYYMM } from "@/lib/homepage-rows";
import { accentStyle } from "@/lib/accent-rotation";

/**
 * SectionWriting: terminal-format Writing log (HP-03). Renders real blog
 * posts only -- newest-first, capped at 5 rows -- as a mono `~/writing` log
 * with no box around it, only the header carrying a visible rule. Reuses
 * the .e-term/.e-post CSS family (identical full-row hover/focus-invert
 * mechanism as .a-row in Plan 21-02). Server Component only; no client
 * directive.
 *
 * Row derivation lives in `@/lib/homepage-rows` (21.5-02) so the accent
 * rotation offset math and the rendered rows can never drift apart.
 *
 * Quick task 260722-wov (item 2) intentionally removed the prior
 * posts+Monty-Monthly merge: this homepage log is posts-only now. Monty
 * Monthly issues still appear on /writing, in their own dedicated section
 * (enlarged as part of the same quick task).
 */
export function SectionWriting({
  posts = [],
  readingTimes = {},
  accentStart = 0,
}: {
  posts?: BlogPost[];
  /**
   * Exact reading times by post id, computed from real page blocks upstream.
   * Absent entries fall back to the description estimate, which is only ever
   * a rough floor -- a description is one line, so it rounds to "1 min".
   */
  readingTimes?: Record<string, number>;
  /**
   * Document-order accent index this section's first row should carry.
   * `nth-child` cannot count across sibling `<section>` elements, so the
   * running counter is lifted to the common parent (explorative-homepage.tsx)
   * and handed down here as a start offset (D-V5-05, D-V5-07).
   */
  accentStart?: number;
}) {
  const rows = writingRows(posts, readingTimes);

  return (
    <section className="wrap a-sec" id="writing">
      <h2 className="reveal font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
        02 · Writing
      </h2>
      <div className="structure-section-title" aria-hidden="true">Writing.</div>
      <StructureArt kind="press" essay={rows[0] ? { title: rows[0].title, href: rows[0].href } : undefined} />
      <div className="e-term reveal">
        <div className="hd">~/writing</div>
        {rows.length === 0 ? (
          <p>Nothing here yet. Check back soon.</p>
        ) : (
          rows.map((row, i) => (
            <Link
              key={row.href}
              className="e-post"
              href={row.href}
              style={accentStyle(accentStart + i)}
            >
              <span className="dt">{formatYYYYMM(row.date)}</span>
              <span>{row.title}</span>
              <span className="rd">{row.readTime} min</span>
            </Link>
          ))
        )}
        <Link className="more" href="/writing">
          all posts →
        </Link>
      </div>
    </section>
  );
}
