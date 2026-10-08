import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { WATCHING_ITEMS } from "@/lib/watching";
import BuildingPage, { metadata } from "@/app/building/page";

vi.mock("@/components/home/scroll-reveals", () => ({ ScrollReveals: () => null }));
afterEach(cleanup);

describe("Building page", () => {
  it("centers Prometheus with its illustration and external destination", () => {
    const { container } = render(<BuildingPage />);
    expect(screen.getByRole("heading", { name: "01 · Building" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Explore Prometheus/ }).getAttribute("href")).toBe("https://prometheus.today");
    expect(container.querySelectorAll(".a-row")).toHaveLength(1);
    expect(screen.queryByText(/Microgrid/i)).toBeNull();
  });
  it("keeps the existing canonical Building URL", () => {
    expect(metadata.alternates?.canonical).toBe("/building");
  });
});

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) =>
    React.createElement("img", { ...props, "data-testid": "next-image" }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement("a", { href, ...props }, children),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Mock Notion loaders
vi.mock("@/lib/notion-projects", () => ({
  getPublishedProjects: vi.fn(),
  getProjectBySlug: vi.fn(),
}));

vi.mock("@/lib/notion", () => ({
  getBlocks: vi.fn(),
}));

// Mock SEO metadata builder for project detail
vi.mock("@/lib/seo/project-metadata", () => ({
  buildProjectMetadata: vi.fn(() => ({ title: "Test Project | Monty Singer" })),
}));

// Mock NotionRenderer to isolate page rendering
vi.mock("@/components/notion/notion-renderer", () => ({
  NotionRenderer: ({ blocks }: { blocks: any[] }) =>
    React.createElement("div", {
      "data-testid": "notion-renderer",
      "data-block-count": blocks.length,
    }),
}));


describe("Watching data", () => {
  // ── Plan 01 data module shape verifications (retained) ──────────────────
  it("WATCHING_ITEMS from @/lib/watching has length 6 (Plan 01 deliverable)", () => {
    expect(WATCHING_ITEMS.length).toBe(6);
  });

  it("every WatchingItem has non-empty id, title, channel, url fields", () => {
    WATCHING_ITEMS.forEach((item) => {
      expect(item.id.length).toBeGreaterThan(0);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.channel.length).toBeGreaterThan(0);
      expect(item.url.length).toBeGreaterThan(0);
    });
  });

  it("every WatchingItem url matches the YouTube watch URL pattern for its id", () => {
    WATCHING_ITEMS.forEach((item) => {
      expect(item.url).toBe(
        `https://www.youtube.com/watch?v=${item.id}`
      );
    });
  });

});

// ── Plan 07: /projects/[slug] detail page tests ─────────────────────────────

const makeMockProject = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: "proj-detail-abc",
  slug: "my-project",
  title: "My Cool Project",
  description: "A detailed project description",
  published: true,
  tags: ["AI", "Product"],
  cover: null,
  image: null,
  emoji: null,
  externalUrl: null,
  featured: false,
  lastEdited: "2026-03-15",
  ...overrides,
});

async function renderProjectDetailPage(slug: string) {
  const { default: ProjectPage } = await import("@/app/building/[slug]/page");
  const element = await (ProjectPage as any)({ params: Promise.resolve({ slug }) });
  render(element as any);
}

describe("/projects/[slug] detail page (Plan 07 / PG-01, PG-04)", () => {
  it("Breadcrumbs Building item href is /building (260706-tx6)", async () => {
    const { getProjectBySlug } = await import("@/lib/notion-projects");
    const { getBlocks } = await import("@/lib/notion");
    vi.mocked(getProjectBySlug).mockResolvedValue(makeMockProject() as any);
    vi.mocked(getBlocks).mockResolvedValue([]);
    await renderProjectDetailPage("my-project");
    const allLinks = document.querySelectorAll("a");
    const hrefs = Array.from(allLinks).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/building");
    expect(hrefs).not.toContain("/projects");
  });

  it("renders project title in PageHero h1 (D-02)", async () => {
    const { getProjectBySlug } = await import("@/lib/notion-projects");
    const { getBlocks } = await import("@/lib/notion");
    vi.mocked(getProjectBySlug).mockResolvedValue(makeMockProject() as any);
    vi.mocked(getBlocks).mockResolvedValue([]);
    await renderProjectDetailPage("my-project");
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).toContain("My Cool Project");
  });

  it("renders cover image with fetchPriority=high when project.cover exists (D-02, nextjs16-fetchpriority-quirk)", async () => {
    const { getProjectBySlug } = await import("@/lib/notion-projects");
    const { getBlocks } = await import("@/lib/notion");
    vi.mocked(getProjectBySlug).mockResolvedValue(
      makeMockProject({ cover: "https://notion.so/some-cover.jpg" }) as any
    );
    vi.mocked(getBlocks).mockResolvedValue([]);
    await renderProjectDetailPage("my-project");
    const imgs = document.querySelectorAll("img");
    const coverImg = Array.from(imgs).find((img) =>
      img.getAttribute("src")?.includes("notion-cover?pageId=proj-detail-abc")
    );
    expect(coverImg).toBeDefined();
    expect(coverImg?.getAttribute("fetchpriority")).toBe("high");
  });

  it("does NOT render cover image when project.cover is null", async () => {
    const { getProjectBySlug } = await import("@/lib/notion-projects");
    const { getBlocks } = await import("@/lib/notion");
    vi.mocked(getProjectBySlug).mockResolvedValue(
      makeMockProject({ cover: null }) as any
    );
    vi.mocked(getBlocks).mockResolvedValue([]);
    await renderProjectDetailPage("my-project");
    const imgs = document.querySelectorAll("img");
    const coverImg = Array.from(imgs).find((img) =>
      img.getAttribute("src")?.includes("notion-cover?pageId=proj-detail-abc")
    );
    expect(coverImg).toBeUndefined();
  });

  it("externalUrl anchor has rel=noopener noreferrer target=_blank (T-16-15)", async () => {
    const { getProjectBySlug } = await import("@/lib/notion-projects");
    const { getBlocks } = await import("@/lib/notion");
    vi.mocked(getProjectBySlug).mockResolvedValue(
      makeMockProject({ externalUrl: "https://github.com/user/my-project" }) as any
    );
    vi.mocked(getBlocks).mockResolvedValue([]);
    await renderProjectDetailPage("my-project");
    const allLinks = document.querySelectorAll("a");
    const externalLink = Array.from(allLinks).find((a) =>
      a.getAttribute("href") === "https://github.com/user/my-project"
    );
    expect(externalLink).toBeDefined();
    expect(externalLink?.getAttribute("rel")).toContain("noopener");
    expect(externalLink?.getAttribute("rel")).toContain("noreferrer");
    expect(externalLink?.getAttribute("target")).toBe("_blank");
  });

  it("NotionRenderer is present with fetched blocks (IN-02)", async () => {
    const { getProjectBySlug } = await import("@/lib/notion-projects");
    const { getBlocks } = await import("@/lib/notion");
    vi.mocked(getProjectBySlug).mockResolvedValue(makeMockProject() as any);
    vi.mocked(getBlocks).mockResolvedValue([
      { id: "blk-1" },
      { id: "blk-2" },
      { id: "blk-3" },
    ] as any);
    await renderProjectDetailPage("my-project");
    const renderer = screen.getByTestId("notion-renderer");
    expect(renderer).toBeDefined();
    expect(renderer.getAttribute("data-block-count")).toBe("3");
  });
});
