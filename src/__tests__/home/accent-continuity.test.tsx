import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import type { Project } from "@/lib/notion-projects";
import type { BlogPost } from "@/lib/notion";

import { SectionBuilding } from "@/components/home/section-building";
import { SectionWriting } from "@/components/home/section-writing";
import { homepageAccentOffsets } from "@/lib/homepage-rows";

afterEach(() => cleanup());

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: "id-1",
    slug: "some-project",
    title: "Some Project",
    description: "A project description.",
    cover: null,
    image: null,
    emoji: null,
    externalUrl: "",
    tags: [],
    featured: true,
    published: true,
    lastEdited: "2026-03-15T00:00:00.000Z",
    ...overrides,
  };
}

function post(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id: overrides.slug ?? "post-id",
    slug: "post-slug",
    title: "Post title",
    description: "A short description with a handful of words in it.",
    published: true,
    date: "2026-01-15T00:00:00.000Z",
    tags: [],
    cover: null,
    emoji: null,
    lastEdited: "2026-01-15T00:00:00.000Z",
    ...overrides,
  };
}

/** Extracts the --ac value from an element's inline style attribute. */
function acOf(el: Element): string | null {
  const style = el.getAttribute("style") || "";
  const match = style.match(/--ac:\s*([^;]+);?/);
  return match ? match[1].trim() : null;
}

describe("accent continuity (D-V5-05)", () => {
  it("SectionBuilding keeps one Prometheus row at accent index zero regardless of project count", () => {
    const projects: Project[] = [
      project({ id: "p1", slug: "p1" }),
      project({ id: "p2", slug: "p2" }),
    ];
    const { container } = render(<SectionBuilding projects={projects} />);
    const rows = container.querySelectorAll(".a-row");
    expect(rows).toHaveLength(1);
    expect(Array.from(rows).map(acOf)).toEqual(["var(--ac-0)"]);
  });

  it("SectionWriting with 5 dated posts and accentStart={3} produces 5 .e-post elements reading var(--ac-3) through var(--ac-7)", () => {
    const posts: BlogPost[] = Array.from({ length: 5 }, (_, i) =>
      post({ slug: `p${i}`, date: `2026-0${i + 1}-01T00:00:00.000Z` })
    );
    const { container } = render(
      <SectionWriting posts={posts} accentStart={3} />
    );
    const rows = container.querySelectorAll(".e-post");
    expect(rows).toHaveLength(5);
    expect(Array.from(rows).map(acOf)).toEqual([
      "var(--ac-3)",
      "var(--ac-4)",
      "var(--ac-5)",
      "var(--ac-6)",
      "var(--ac-7)",
    ]);
  });

  it("rendering the real Building and Writing sections together via homepageAccentOffsets yields the continuous 0..5 sequence with no reset at the section head", () => {
    const projects: Project[] = [
      project({ id: "p1", slug: "p1" }),
      project({ id: "p2", slug: "p2" }),
    ];
    const posts: BlogPost[] = Array.from({ length: 5 }, (_, i) =>
      post({ slug: `p${i}`, date: `2026-0${i + 1}-01T00:00:00.000Z` })
    );
    const { building, writing } = homepageAccentOffsets(projects, posts);

    const { container } = render(
      <div>
        <SectionBuilding projects={projects} accentStart={building} />
        <SectionWriting posts={posts} accentStart={writing} />
      </div>
    );

    const rows = container.querySelectorAll(".a-row, .e-post");
    const sequence = Array.from(rows).map(acOf);
    expect(sequence).toEqual([
      "var(--ac-0)",
      "var(--ac-1)",
      "var(--ac-2)",
      "var(--ac-3)",
      "var(--ac-4)",
      "var(--ac-5)",
    ]);
    expect(new Set(sequence).size).toBe(sequence.length); // no repeat
  });

  it("with 0 projects, Building renders one row at index 0 and Writing starts at index 1, not 0", () => {
    const posts: BlogPost[] = [post({ slug: "p1" })];
    const { building, writing } = homepageAccentOffsets([], posts);
    expect(building).toBe(0);
    expect(writing).toBe(1);

    const { container } = render(
      <div>
        <SectionBuilding projects={[]} accentStart={building} />
        <SectionWriting posts={posts} accentStart={writing} />
      </div>
    );
    const buildingRow = container.querySelector(".a-row");
    const writingRow = container.querySelector(".e-post");
    expect(acOf(buildingRow!)).toBe("var(--ac-0)");
    expect(acOf(writingRow!)).toBe("var(--ac-1)");
  });

  it("with enough rows to exceed ten, the sequence wraps to var(--ac-0) rather than emitting var(--ac-10)", () => {
    // 3 Building rows (index 0..2) then a Writing accentStart of 9 pushes
    // the 10th row (index 9) to wrap back to 0 at the 11th row (index 10).
    const posts: BlogPost[] = Array.from({ length: 3 }, (_, i) =>
      post({ slug: `p${i}`, date: `2026-0${i + 1}-01T00:00:00.000Z` })
    );
    const { container } = render(
      <SectionWriting posts={posts} accentStart={9} />
    );
    const rows = container.querySelectorAll(".e-post");
    expect(Array.from(rows).map(acOf)).toEqual([
      "var(--ac-9)",
      "var(--ac-0)",
      "var(--ac-1)",
    ]);
  });
});
