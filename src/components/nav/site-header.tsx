"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { useScrolledPast } from "@/hooks/use-scrolled-past";
import { NAV_LINKS, activeNavLabel } from "@/components/nav/nav-links";

/**
 * SiteHeader — the single sticky nav rendered on every route (quick task
 * 260916-lqq), replacing the four divergent nav behaviours that previously
 * coexisted: a static desktop bar rendered on non-home routes only, a
 * scroll-gated desktop fixed bar, a mobile bar with its own scroll gate on
 * home only, and a pathname-based suppression that hid all desktop nav on
 * `/` until 80% of the viewport had scrolled away.
 *
 * `position: sticky` — occupies layout space (unlike the old `fixed` bars),
 * so the previous 64px `pt-16` main offset is gone; see layout.tsx. Never
 * translates offscreen on any route or scroll position. `is-solid` (from
 * useScrolledPast(24, 8)) swaps the background/border from transparent to
 * solid once scrolled past 24px, with an 8px exit for hysteresis.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isSolid = useScrolledPast(24, 8);
  const activeLabel = activeNavLabel(pathname);

  const closeDrawer = () => setOpen(false);

  return (
    <>
      <header className={cn("site-header", isSolid && "is-solid")}>
        <Link
          href="/"
          onClick={closeDrawer}
          className="inline-flex items-center leading-none text-base font-normal uppercase tracking-widest md:text-[22px] md:font-bold md:normal-case md:tracking-tight"
        >
          Monty Singer
        </Link>

        <nav aria-label="Primary" className="hidden items-stretch md:flex">
          <ul className="flex list-none items-stretch text-[15px]">
            {NAV_LINKS.map((link) => {
              if (link.external) {
                return (
                  <li key={link.href} className="flex">
                    <a
                      href={link.href}
                      className="nav-cell"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              }

              const isActive = activeLabel === link.label;
              return (
                <li key={link.href} className="flex">
                  <Link
                    href={link.href}
                    className={cn("nav-cell", isActive && "nav-cell--active")}
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          className="flex min-h-[44px] min-w-[44px] items-center justify-center md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          )}
        </button>
      </header>

      {open && (
        <>
          {/* Backdrop — dims page below drawer; tap anywhere here closes the drawer */}
          <div
            className="fixed inset-0 top-[var(--header-h)] z-[8980] bg-black/20 md:hidden"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          {/* Drawer — sits above backdrop, under the header's own z-index */}
          <div className="fixed left-0 right-0 top-[var(--header-h)] z-[8990] border-b border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg md:hidden">
            <nav className="flex flex-col px-6 py-4">
              {NAV_LINKS.map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex min-h-[48px] items-center border-b border-[var(--color-border)] py-3 text-base uppercase tracking-wide last:border-b-0"
                    onClick={closeDrawer}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex min-h-[48px] items-center border-b border-[var(--color-border)] py-3 text-base uppercase tracking-wide last:border-b-0"
                    onClick={closeDrawer}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
