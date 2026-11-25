import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import React from "react";

vi.mock("@/app/current-carry/shelf", () => ({ CarryShelf: () => null }));

// Mock motion/react — no real animation in test env
vi.mock("motion/react", () => ({ useReducedMotion: () => false }));

// Mock Hero: renders its own light hero band
vi.mock("@/components/home/hero", () => ({
  Hero: function HeroMock() {
    return React.createElement("section", { "data-testid": "hero" });
  },
}));

// Mock ScrollReveals: headless but must render a node for assertion
vi.mock("@/components/home/scroll-reveals", () => ({
  ScrollReveals: function ScrollRevealsMock() {
    return React.createElement("div", { "data-testid": "scroll-reveals" });
  },
}));

// Mock all section components — not under test here. Building/Writing mocks
// render an element bearing their real self-wrapping id, mirroring how the
// actual components self-wrap (Plans 21-02/21-03).
vi.mock("@/components/home/section-building", () => ({
  SectionBuilding: function SectionBuildingMock() {
    return React.createElement(
      "section",
      { id: "building", "data-testid": "section-building" },
      "Building content"
    );
  },
}));
vi.mock("@/components/home/section-writing", () => ({
  SectionWriting: function SectionWritingMock() {
    return React.createElement(
      "section",
      { id: "writing", "data-testid": "section-writing" },
      "Writing content"
    );
  },
}));
vi.mock("@/components/home/section-loves", () => ({
  SectionLoves: function SectionLovesMock() {
    return React.createElement("span", null, "Loves content");
  },
}));

describe("ExplorativeHomepage orchestrator (21-05 rebuilt band structure)", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows the travel map even when the pinboard has no entries", async () => {
    const { ExplorativeHomepage } = await import("@/components/home/explorative-homepage");
    render(<ExplorativeHomepage />);
    const map = within(screen.getByRole("region", { name: "19 countries Monty has visited" }));
    expect(map.getAllByRole("button")).toHaveLength(19);
    expect(map.getByRole("button", { name: "Singapore" })).toBeTruthy();
    expect(map.getByRole("button", { name: "Netherlands · Amsterdam" })).toBeTruthy();
    expect(map.queryByRole("button", { name: "North Korea" })).toBeNull();
  });

  it("mounts ScrollReveals island", async () => {
    const { ExplorativeHomepage } = await import(
      "@/components/home/explorative-homepage"
    );
    const { getByTestId } = render(React.createElement(ExplorativeHomepage));
    expect(getByTestId("scroll-reveals")).toBeTruthy();
  });

  it("HP-04: zero band-dark classes anywhere in the rendered tree", async () => {
    const { ExplorativeHomepage } = await import(
      "@/components/home/explorative-homepage"
    );
    const { container } = render(React.createElement(ExplorativeHomepage));
    expect(container.querySelectorAll('[class*="band-dark"]').length).toBe(0);
  });

  it("id=loves exists in the DOM (footer /#loves fragment link contract)", async () => {
    const { ExplorativeHomepage } = await import(
      "@/components/home/explorative-homepage"
    );
    const { container } = render(React.createElement(ExplorativeHomepage));
    expect(container.querySelector("#loves")).toBeTruthy();
  });

  it("id=building exists in the DOM", async () => {
    const { ExplorativeHomepage } = await import(
      "@/components/home/explorative-homepage"
    );
    const { container } = render(React.createElement(ExplorativeHomepage));
    expect(container.querySelector("#building")).toBeTruthy();
  });

  it("id=writing exists in the DOM", async () => {
    const { ExplorativeHomepage } = await import(
      "@/components/home/explorative-homepage"
    );
    const { container } = render(React.createElement(ExplorativeHomepage));
    expect(container.querySelector("#writing")).toBeTruthy();
  });

  it("HP-05: no subscribe CTA anywhere in the rendered tree", async () => {
    const { ExplorativeHomepage } = await import(
      "@/components/home/explorative-homepage"
    );
    render(React.createElement(ExplorativeHomepage));
    expect(screen.queryByText(/subscribe/i)).toBeNull();
  });
});
