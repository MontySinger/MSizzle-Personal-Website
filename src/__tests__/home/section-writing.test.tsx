import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { BlogPost } from "@/lib/notion";

import { SectionWriting } from "@/components/home/section-writing";

afterEach(() => cleanup());

function post(overrides: Partial<BlogPost>): BlogPost {
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

describe("SectionWriting", () => {
  it("renders the ~/writing header and empty-state text with no items", () => {
    render(React.createElement(SectionWriting));
    expect(screen.getByText("~/writing")).toBeDefined();
    expect(
      screen.getByText("Nothing here yet. Check back soon.")
    ).toBeDefined();
    expect(document.querySelectorAll(".e-post").length).toBe(0);
  });

  it("renders posts only, sorted newest-first, capped at 5", () => {
    const posts: BlogPost[] = [
      post({ slug: "p1", title: "Post 1", date: "2026-07-01T00:00:00.000Z" }),
      post({ slug: "p2", title: "Post 2", date: "2026-06-01T00:00:00.000Z" }),
      post({ slug: "p3", title: "Post 3", date: "2026-05-01T00:00:00.000Z" }),
      post({ slug: "p4", title: "Post 4", date: "2026-04-01T00:00:00.000Z" }),
      post({ slug: "p5", title: "Post 5", date: "2026-03-01T00:00:00.000Z" }),
      post({ slug: "p6", title: "Post 6", date: "2026-01-01T00:00:00.000Z" }),
    ];

    render(React.createElement(SectionWriting, { posts }));

    const rows = document.querySelectorAll(".e-post");
    expect(rows.length).toBe(5);

    const titles = Array.from(rows).map((row) => row.textContent);
    expect(titles[0]).toContain("Post 1");
    expect(titles[1]).toContain("Post 2");
    expect(titles[2]).toContain("Post 3");
    expect(titles[3]).toContain("Post 4");
    expect(titles[4]).toContain("Post 5");
  });

  it("skips posts with a falsy date entirely", () => {
    const posts: BlogPost[] = [
      post({ slug: "p1", title: "Has date", date: "2026-01-01T00:00:00.000Z" }),
      post({ slug: "p2", title: "No date", date: "" }),
    ];
    render(React.createElement(SectionWriting, { posts }));
    expect(screen.getByText("Has date", { selector: ".e-post span" })).toBeDefined();
    expect(screen.queryByText("No date")).toBeNull();
    expect(document.body.textContent).not.toContain("Invalid Date");
  });

  it("renders each row's date in YYYY-MM format", () => {
    const posts: BlogPost[] = [
      post({ slug: "p1", title: "Dated post", date: "2026-07-15T00:00:00.000Z" }),
    ];
    render(React.createElement(SectionWriting, { posts }));
    expect(screen.getByText("2026-07")).toBeDefined();
  });

  it("renders each row's read time as estimateReadingTime output formatted '{n} min'", () => {
    const longDescription = Array(250).fill("word").join(" ");
    const posts: BlogPost[] = [
      post({
        slug: "p1",
        title: "Long post",
        description: longDescription,
        date: "2026-07-15T00:00:00.000Z",
      }),
    ];
    render(React.createElement(SectionWriting, { posts }));
    // 250 words / 200 = 1.25 -> ceil -> 2
    expect(screen.getByText("2 min")).toBeDefined();
  });

  it("prefers the real per-post reading time over the description estimate", () => {
    const posts: BlogPost[] = [
      post({
        id: "post-1",
        slug: "p1",
        title: "Real post",
        // A one-line description estimates to 1 min; the real body is 9.
        description: "Short summary.",
        date: "2026-07-15T00:00:00.000Z",
      }),
    ];
    render(
      React.createElement(SectionWriting, {
        posts,
        readingTimes: { "post-1": 9 },
      })
    );
    expect(screen.getByText("9 min")).toBeDefined();
    expect(screen.queryByText("1 min")).toBeNull();
  });

  it("falls back to the estimate when a post has no measured reading time", () => {
    const longDescription = Array(250).fill("word").join(" ");
    const posts: BlogPost[] = [
      post({
        id: "missing",
        slug: "p1",
        title: "Unmeasured post",
        description: longDescription,
        date: "2026-07-15T00:00:00.000Z",
      }),
    ];
    render(
      React.createElement(SectionWriting, { posts, readingTimes: {} })
    );
    expect(screen.getByText("2 min")).toBeDefined();
  });

  it("links blog post rows to /blog/{slug} with no target/rel", () => {
    const posts: BlogPost[] = [
      post({ slug: "my-post", title: "My post", date: "2026-07-15T00:00:00.000Z" }),
    ];
    render(React.createElement(SectionWriting, { posts }));
    const link = screen.getByText("My post", { selector: ".e-post span" }).closest("a");
    expect(link?.getAttribute("href")).toBe("/blog/my-post");
    expect(link?.getAttribute("target")).toBeNull();
    expect(link?.getAttribute("rel")).toBeNull();
  });

  it("renders exactly one 'all posts ->' link to /writing after the row list", () => {
    const posts: BlogPost[] = [
      post({ slug: "p1", title: "Post 1", date: "2026-07-15T00:00:00.000Z" }),
    ];
    render(React.createElement(SectionWriting, { posts }));
    const links = screen.getAllByText("all posts →");
    expect(links.length).toBe(1);
    expect(links[0].getAttribute("href")).toBe("/writing");
  });

  it("has no box/frame wrapper class", () => {
    const posts: BlogPost[] = [
      post({ slug: "p1", title: "Post 1", date: "2026-07-15T00:00:00.000Z" }),
    ];
    const { container } = render(
      React.createElement(SectionWriting, { posts })
    );
    expect(container.querySelector('[class*="frame"]')).toBeNull();
    expect(container.querySelector('[class*="box"]')).toBeNull();
  });
});
