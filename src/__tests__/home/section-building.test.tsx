import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SectionBuilding } from "@/components/home/section-building";
import type { Project } from "@/lib/notion-projects";

afterEach(cleanup);

describe("Prometheus Building feature", () => {
  it("renders the Prometheus feature and a working external link", () => {
    const { container } = render(<SectionBuilding />);
    expect(screen.getByRole("heading", { name: "01 · Building" })).toBeTruthy();
    const row = container.querySelector("a.a-row")!;
    expect(row.textContent).toContain("Prometheus");
    expect(row.getAttribute("href")).toBe("https://prometheus.today");
    expect(row.getAttribute("target")).toBe("_blank");
    expect(row.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("does not reintroduce the Microgrid when Notion still returns it", () => {
    const projects = [{ title: "Microgrid Data Center", slug: "data-center", tags: [], lastEdited: "2026-01-01" }] as unknown as Project[];
    const { container } = render(<SectionBuilding projects={projects} />);
    expect(container.querySelectorAll(".a-row")).toHaveLength(1);
    expect(screen.queryByText("Microgrid Data Center")).toBeNull();
    expect(container.querySelector('a[href="/building/data-center"]')).toBeNull();
    expect(screen.queryByText(/all projects/i)).toBeNull();
  });
});
