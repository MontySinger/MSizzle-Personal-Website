import type { Metadata } from "next";
import { SectionBuilding } from "@/components/home/section-building";
import { ScrollReveals } from "@/components/home/scroll-reveals";

export const metadata: Metadata = {
  title: "Building",
  description: "Prometheus: applied AI systems, integrations, and education.",
  alternates: { canonical: "/building" },
  openGraph: {
    title: "Building",
    description: "Prometheus: applied AI systems, integrations, and education.",
    url: "/building",
    type: "website",
  },
};

export default function BuildingPage() {
  return <div className="finished-home finished-building-page"><ScrollReveals /><SectionBuilding standalone /></div>;
}
