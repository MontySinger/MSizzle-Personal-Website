import type { Project } from "@/lib/notion-projects";
import type { BlogPost } from "@/lib/notion";
import { estimateReadingTime } from "@/utils/reading-time";

/**
 * Row derivation for the Building and Writing homepage bands, moved out of
 * `section-building.tsx` / `section-writing.tsx` verbatim (21.5-02) so the
 * accent-rotation offset math (`homepageAccentOffsets` below) reads the
 * exact same row counts the two sections actually render. Behaviour is
 * unchanged from what those components did inline before this plan.
 *
 * `homepageAccentOffsets` deliberately does NOT use `projects.length` /
 * `posts.length` as a shortcut -- that would be wrong twice over: Building
 * always prepends a hardcoded Prometheus row (so `projects.length`
 * under-counts by one), and both bands cap their row count before rendering
 * (so `projects.length`/`posts.length` over-counts once either array exceeds
 * its cap). Deriving the offsets from `buildingRows` / `writingRows` instead
 * means the counter can never drift from what is actually on the page.
 */

// The public Building section now focuses exclusively on Prometheus.
export const BUILDING_ROW_CAP = 1;
export const WRITING_ROW_CAP = 5;

export type BuildingRow = {
  title: string;
  description: string;
  status: string;
  href: string;
  external: boolean;
};

export type WritingRow = {
  date: string;
  title: string;
  readTime: number;
  href: string;
};

export function buildingRows(projects: Project[]): BuildingRow[] {
  return [
    {
      title: "Prometheus",
      description:
        "AI integrations and education. Practical leverage, not hype.",
      status: "Current",
      href: "https://prometheus.today",
      external: true,
    },
    ...projects.map((project) => ({
      title: project.title,
      description: project.description,
      status:
        project.tags?.[0] ||
        String(new Date(project.lastEdited).getUTCFullYear()),
      href: `/building/${project.slug}`,
      external: false,
    })),
  ].slice(0, BUILDING_ROW_CAP);
}

/** Formats a date string as `YYYY-MM` in UTC. An unparseable date yields "". */
export function formatYYYYMM(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function writingRows(
  posts: BlogPost[],
  readingTimes: Record<string, number> = {}
): WritingRow[] {
  return posts
    .filter((post) => post.date)
    .map((post) => ({
      date: post.date,
      title: post.title,
      readTime: readingTimes[post.id] ?? estimateReadingTime(post.description),
      href: `/blog/${post.slug}`,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, WRITING_ROW_CAP);
}

/**
 * The continuous, document-order accent offsets for each homepage band.
 * `nth-child` cannot count across sibling `<section>` elements, so this
 * counter is computed once, here, from the same row-derivation helpers the
 * sections render from, and handed down as a start index (D-V5-05, D-V5-07,
 * D-V5-09). Building always starts at 0; Writing picks up where Building's
 * rendered row count stopped, so it never resets to 0 at the section head.
 * `loves` is returned even though Phase 22 owns the pinboard -- it is part
 * of the contract now so Phase 22 does not have to re-derive it.
 */
export function homepageAccentOffsets(
  projects: Project[],
  posts: BlogPost[]
): { building: number; writing: number; loves: number } {
  const building = 0;
  const writing = buildingRows(projects).length;
  const loves = writing + writingRows(posts).length;
  return { building, writing, loves };
}
