import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PortraitStory } from "@/components/home/portrait-story";

// Verify the actual fallback path, including browsers without canvas support.
beforeEach(() => vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("PortraitStory fallback and controls", () => {
  it("retains a readable introduction and original photo when canvas is unavailable", () => {
    const { container } = render(<PortraitStory><h1>Monty Singer</h1></PortraitStory>);
    expect(screen.getByRole("heading", { name: "Monty Singer" })).toBeDefined();
    expect(screen.getByAltText("Monty holding mushrooms in his growing setup")).toBeDefined();
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("switches photographs and exposes reversible motion controls", () => {
    render(<PortraitStory><p>Introduction</p></PortraitStory>);
    const hike = screen.getByRole("button", { name: "The hike" });
    fireEvent.click(hike);
    expect(hike.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByAltText("Monty hiking in front of the Teton Range")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Pause dots" }));
    expect(screen.getByRole("button", { name: "Resume dots" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Resume dots" }));
    expect(screen.getByRole("button", { name: "Pause dots" }).getAttribute("aria-pressed")).toBe("false");
  });
});
