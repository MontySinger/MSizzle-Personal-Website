import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Pinboard } from "@/components/home/pinboard";
import type { LoveItem } from "@/lib/notion-loves";

function make(partial: Partial<LoveItem> & Pick<LoveItem, "id" | "type">): LoveItem {
  return {
    category: partial.type,
    title: "Title",
    subtitle: "",
    note: "",
    url: "",
    youtubeId: null,
    cover: null,
    order: null,
    published: true,
    lastEdited: "2026-01-01",
    ...partial,
  };
}

const ITEMS: LoveItem[] = [
  make({ id: "p1", type: "Place", title: "Big Sur", note: "I go to reset.", cover: "https://notion.so/x.jpg" }),
  make({ id: "b1", type: "Book", title: "The Book", subtitle: "An Author" }),
  make({
    id: "y1",
    type: "YouTube",
    title: "A talk",
    subtitle: "Conference",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    note: "Re-watched more than any other.",
  }),
  make({ id: "h1", type: "Thing", title: "Mushrooms", subtitle: "Since a dorm room" }),
  make({ id: "m1", type: "Movie", title: "Fight Club", subtitle: "Fincher", cover: "https://notion.so/p.jpg" }),
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Pinboard (sketch 012)", () => {
  it("shows a cached cover that finished loading before hydration", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(420);
    const { container } = render(<Pinboard items={[ITEMS[0]]} />);
    expect((container.querySelector("img") as HTMLImageElement).style.opacity).toBe("1");
  });

  it("opens a mobile note once per tap and closes it with the close button", () => {
    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      matches: query === "(max-width: 760px)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    const { container } = render(<Pinboard items={[ITEMS[0]]} />);
    const card = container.querySelector(".pb-card")!;
    fireEvent.pointerDown(card);
    fireEvent.pointerUp(card);
    fireEvent.click(card);
    expect(card.classList.contains("is-open")).toBe(true);
    const close = screen.getByRole("button", { name: "Close" });
    fireEvent.pointerDown(close);
    fireEvent.pointerUp(close);
    fireEvent.click(close);
    expect(card.classList.contains("is-open")).toBe(false);
  });

  it("renders one card per item", () => {
    const { container } = render(<Pinboard items={ITEMS} />);
    expect(container.querySelectorAll(".pb-card").length).toBe(ITEMS.length);
  });

  it("renders a Movie as a portrait card tagged Film", () => {
    const { container } = render(<Pinboard items={ITEMS} />);
    const movie = container.querySelector(".pb-card--movie");
    expect(movie).not.toBeNull();
    expect(movie!.textContent).toContain("Film");
  });

  it("renders the Movie title/author inside a solid pb-book-caption backing bar (260726-kjp)", () => {
    const { container } = render(<Pinboard items={ITEMS} />);
    const movie = container.querySelector(".pb-card--movie");
    expect(movie).not.toBeNull();
    const caption = movie!.querySelector(".pb-book-caption");
    expect(caption).not.toBeNull();
    const title = caption!.querySelector(".pb-book-title");
    expect(title).not.toBeNull();
    expect(caption!.textContent).toContain("Fight Club");
  });

  it("renders a YouTube thumbnail from the video id", () => {
    const { container } = render(<Pinboard items={ITEMS} />);
    const img = container.querySelector('img[src*="img.youtube.com/vi/dQw4w9WgXcQ"]');
    expect(img).not.toBeNull();
  });

  it("renders the Notion cover proxy for a Place with a cover", () => {
    // jsdom's CSS attribute-value selector matching does not reliably match
    // literal "&" inside a quoted attribute value (verified empirically
    // against this exact repo/jsdom version), so exact src comparison is done
    // via getAttribute rather than a `[src="..."]` selector.
    const { container } = render(<Pinboard items={ITEMS} />);
    const imgs = Array.from(container.querySelectorAll("img"));
    const img = imgs.find((el) => el.getAttribute("src") === "/api/notion-cover?pageId=p1&w=420");
    expect(img).not.toBeUndefined();
  });

  it("requests a Movie-type cover at its 2x retina width (260723-g2q Task 3)", () => {
    const { container } = render(<Pinboard items={ITEMS} />);
    const imgs = Array.from(container.querySelectorAll("img"));
    const img = imgs.find((el) => el.getAttribute("src") === "/api/notion-cover?pageId=m1&w=300");
    expect(img).not.toBeUndefined();
  });

  it("Place cover img reserves its frame slot, decodes async, and fades in on load (260723-g2q Task 2)", () => {
    const { container } = render(<Pinboard items={ITEMS} />);
    const img = container.querySelector(
      'img[src^="/api/notion-cover?pageId=p1"]'
    ) as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute("width")).toBe("210");
    expect(img.getAttribute("height")).toBe("150");
    expect(img.getAttribute("decoding")).toBe("async");
    expect(getComputedStyle(img).opacity).toBe("0");
    fireEvent.load(img);
    expect(getComputedStyle(img).opacity).toBe("1");
  });

  it("renders a fallback swatch for an item with no cover", () => {
    const { container } = render(<Pinboard items={[make({ id: "b1", type: "Book" })]} />);
    expect(container.querySelector(".pb-swatch")).not.toBeNull();
  });

  it("includes the note text and an external Open link with safe rel", () => {
    render(<Pinboard items={ITEMS} />);
    expect(screen.getByText(/Re-watched more than any other/)).toBeDefined();
    const open = screen
      .getAllByRole("link")
      .find((a) => a.getAttribute("href") === "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(open).toBeDefined();
    expect(open!.getAttribute("target")).toBe("_blank");
    expect(open!.getAttribute("rel")).toContain("noopener");
    expect(open!.getAttribute("rel")).toContain("noreferrer");
  });

  it("does not render a note panel when the item has no note", () => {
    const { container } = render(<Pinboard items={[make({ id: "b1", type: "Book", note: "" })]} />);
    expect(container.querySelector(".pb-note")).toBeNull();
  });
});
