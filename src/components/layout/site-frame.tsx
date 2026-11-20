"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/nav/site-header";
import { VisitSurvey } from "@/components/visit-survey";

export function SiteFrame({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const path = usePathname();
  if (path === "/recommend" || path.startsWith("/recommend/")) return <main>{children}</main>;
  return <>
    <SiteHeader />
    <main>{children}</main>
    {footer}
    <VisitSurvey />
    <span aria-hidden="true" className="fixed right-3 bottom-3 z-50 text-xs opacity-20 select-none">Prometheus</span>
  </>;
}
