import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SectionBuilding } from "@/components/home/section-building";
import type { Project } from "@/lib/notion-projects";

afterEach(() => {
  cleanup();
});

function makeProject(overrides: Partial<Project> = {}): Project {
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

describe("SectionBuilding (21-02 Swiss numbered index)", () => {
  it("with no projects prop, renders exactly one row: the hardcoded Prometheus row", () => {
    render(<SectionBuilding />);

    // Index rows only — the trailing "all projects" link is not a row.
    const rows = screen.getAllByRole("link").filter((el) =>
      el.classList.contains("a-row")
    );
    expect(rows).toHaveLength(1);

    expect(screen.getByText("001")).toBeDefined();
    expect(screen.getByText("Prometheus", { selector: ".a-row .ttl" })).toBeDefined();
    expect(
      screen.getByText(
        "AI integrations and education. Practical leverage, not hype."
      )
    ).toBeDefined();
    expect(screen.getByText("Current")).toBeDefined();

    const link = rows[0];
    expect(link.getAttribute("href")).toBe("https://prometheus.today");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("with a projects array of length N, renders N+1 rows: row 001 Prometheus then 002..00(N+1) from projects", () => {
    const projects: Project[] = [
      makeProject({
        id: "p1",
        slug: "project-one",
        title: "Project One",
        description: "First project description.",
        tags: ["AI"],
        lastEdited: "2025-06-01T00:00:00.000Z",
      }),
      makeProject({
        id: "p2",
        slug: "project-two",
        title: "Project Two",
        description: "Second project description.",
        tags: [],
        lastEdited: "2024-11-20T00:00:00.000Z",
      }),
    ];

    render(<SectionBuilding projects={projects} />);

    const rows = screen.getAllByRole("link").filter((el) =>
      el.classList.contains("a-row")
    );
    expect(rows).toHaveLength(3);

    // Every numeral is exactly 3 digits, zero-padded.
    expect(screen.getByText("001")).toBeDefined();
    expect(screen.getByText("002")).toBeDefined();
    expect(screen.getByText("003")).toBeDefined();

    // Row 001 is always Prometheus, first.
    expect(rows[0].getAttribute("href")).toBe("https://prometheus.today");

    // Row 002: project with a tag uses tags[0] as status.
    expect(screen.getByText("Project One")).toBeDefined();
    expect(screen.getByText("First project description.")).toBeDefined();
    expect(rows[1].getAttribute("href")).toBe("/building/project-one");
    expect(screen.getByText("AI")).toBeDefined();

    // Row 003: project without a tag falls back to the UTC year of lastEdited.
    expect(screen.getByText("Project Two")).toBeDefined();
    expect(screen.getByText("Second project description.")).toBeDefined();
    expect(rows[2].getAttribute("href")).toBe("/building/project-two");
    expect(screen.getByText("2024")).toBeDefined();

    // Notion-derived rows are not external — no target/rel.
    expect(rows[1].getAttribute("target")).toBeNull();
    expect(rows[2].getAttribute("target")).toBeNull();
  });

  it("every numeral matches /^\\d{3}$/, never '1.' or '01'", () => {
    const projects: Project[] = [makeProject({ id: "p1", slug: "p1" })];
    render(<SectionBuilding projects={projects} />);

    const nums = document.querySelectorAll(".a-row .num");
    expect(nums).toHaveLength(2);
    nums.forEach((el) => {
      expect(el.textContent).toMatch(/^\d{3}$/);
    });
  });

  it("caps the index at three rows and offers a way through to the full list", () => {
    const projects: Project[] = Array.from({ length: 8 }, (_, i) =>
      makeProject({
        id: `p${i}`,
        slug: `project-${i}`,
        title: `Project ${i}`,
      })
    );

    render(<SectionBuilding projects={projects} />);

    const rows = screen.getAllByRole("link").filter((el) =>
      el.classList.contains("a-row")
    );
    expect(rows).toHaveLength(3);

    // Prometheus plus the first two Notion projects; the rest are dropped.
    expect(screen.getByText("Prometheus", { selector: ".a-row .ttl" })).toBeDefined();
    expect(screen.getByText("Project 0")).toBeDefined();
    expect(screen.getByText("Project 1")).toBeDefined();
    expect(screen.queryByText("Project 2")).toBeNull();
    expect(screen.queryByText("004")).toBeNull();

    const more = screen.getByText(/all projects/i);
    expect(more.getAttribute("href")).toBe("/building");
  });

  it("does not render a 'This site' row", () => {
    render(<SectionBuilding projects={[makeProject()]} />);
    expect(screen.queryByText(/This site/i)).toBeNull();
  });

  it("does not import or render RailBox, Photo, or the retired photo/motion classes", () => {
    const { container } = render(<SectionBuilding projects={[makeProject()]} />);

    expect(container.querySelector('[data-testid="rail-box"]')).toBeNull();
    expect(container.querySelector('[data-testid="photo"]')).toBeNull();
    expect(container.querySelector(".shadowed")).toBeNull();
    expect(container.querySelector(".slide")).toBeNull();
    expect(container.querySelector(".beat-grid")).toBeNull();
    expect(container.querySelector(".prometheus-shot")).toBeNull();
  });

  it("wraps every row in .a-row, reachable via :focus-visible as a plain <a href>", () => {
    const { container } = render(<SectionBuilding projects={[makeProject()]} />);
    const rows = container.querySelectorAll("a.a-row");
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      expect(row.tagName).toBe("A");
      expect(row.getAttribute("href")).toBeTruthy();
    });
  });
});
