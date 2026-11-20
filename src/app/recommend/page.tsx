import type { Metadata } from "next";
import { Experience } from "./experience";

export const metadata: Metadata = {
  title: "Recommend a favorite",
  description: "Send Monty a link to something you think he’d enjoy.",
  alternates: { canonical: "/recommend" },
};

export default async function RecommendPage({ searchParams }: {
  searchParams: Promise<{ theme?: string }>;
}) {
  return <Experience theme={(await searchParams).theme} />;
}
