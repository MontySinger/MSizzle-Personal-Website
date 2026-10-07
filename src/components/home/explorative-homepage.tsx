import { StructureHero } from "./structure-hero";
import { ScrollReveals } from "./scroll-reveals";
import { SectionBuilding } from "./section-building";
import { SectionWriting } from "./section-writing";
import { SectionLoves } from "./section-loves";
import { SectionAdvice } from "./section-advice";
import type { Project } from "@/lib/notion-projects";
import type { BlogPost } from "@/lib/notion";
import type { LoveItem } from "@/lib/notion-loves";
import { homepageAccentOffsets } from "@/lib/homepage-rows";

/**
 * ExplorativeHomepage: mono homepage orchestrator (Server Component).
 *
 * Band order (HP-04): Hero -> 01 Building -> 02 Writing -> 03 Things I Love -> Unsolicited advice,
 * all on one continuous bone ground -- no dark-ground class anywhere. Building
 * and Writing each render their own <section> wrapper internally; only Things
 * I Love needs an orchestrator-level wrapper (it doesn't self-wrap), and that
 * wrapper is the sole element on the page that MUST carry id="loves" verbatim
 * (site-wide footer's /#loves link depends on it).
 *
 * Islands mounted here:
 *   ScrollReveals: headless IO island toggling .in on .reveal.
 *
 * page.tsx fetches the Notion/RSS data (Featured projects, published posts,
 * Monty Monthly issues, Things I Love items) and passes it down; this
 * orchestrator stays a sync Server Component and forwards it to each band.
 * Every prop defaults to [] so the tree renders fine with no props (and in
 * tests).
 */
type Props = {
  projects?: Project[];
  posts?: BlogPost[];
  loves?: LoveItem[];
  /** Type-select option order from Notion; drives Organize-by-topic bands. */
  loveCategories?: string[];
  /** Exact post reading times by post id; falls back to an estimate when absent. */
  readingTimes?: Record<string, number>;
};

export function ExplorativeHomepage({
  projects = [],
  posts = [],
  loves = [],
  loveCategories = [],
  readingTimes = {},
}: Props) {
  // The accent rotation counter runs continuously in document order across
  // Building, Writing, and Advice (D-V5-05). CSS `nth-child` cannot count across
  // sibling <section> elements, so the counter has to be lifted to this
  // common parent and handed down as each band's start offset. The `loves`
  // offset is returned here even though Phase 22 owns the pinboard -- it is
  // part of the contract so Phase 22 does not have to re-derive it.
  const { building: buildingAccentStart, writing: writingAccentStart, loves: adviceAccentIndex } =
    homepageAccentOffsets(projects, posts);

  return (
    <div className="homepage structure-home min-h-screen bg-bg">
      {/* Fixed islands: mounted first so they overlay all bands */}
      <ScrollReveals />

      <StructureHero />

      <SectionBuilding projects={projects} accentStart={buildingAccentStart} />

      <SectionWriting
        posts={posts}
        readingTimes={readingTimes}
        accentStart={writingAccentStart}
      />

      {/* Extra top room: the Writing log ends in small mono type and the
          pinboard opens with dense tiles, so the two need a wider gap than
          the standard band rhythm to read as separate sections. */}
      <section className="band pt-40 md:pt-64" id="loves">
        <SectionLoves items={loves} categoryOrder={loveCategories} />
      </section>

      <SectionAdvice accentIndex={adviceAccentIndex} />

      {/* Footer is the single site-wide SiteFooter, rendered by app/layout.tsx. */}
    </div>
  );
}
