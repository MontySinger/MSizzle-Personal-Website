import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SectionAdvice } from "@/components/home/section-advice";

afterEach(cleanup);

describe("Advice section", () => {
  it("has its own named section and heading, with a separate action", () => {
    render(<SectionAdvice accentIndex={6} />);
    const section = screen.getByRole("region", { name: "Unsolicited advice." });
    expect(section.querySelector("h2")).toBeTruthy();
    const link = screen.getByRole("link", { name: "Say it" });
    expect(link.getAttribute("href")).toBe("/advice");
    expect(link.querySelector("h2")).toBeNull();
    expect(screen.getByText("Anonymous. No login.")).toBeTruthy();
  });
});
