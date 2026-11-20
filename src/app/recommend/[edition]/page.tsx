import { notFound } from "next/navigation";
import { editions } from "../editions";
import { Experience } from "../experience";

type Props = { params: Promise<{ edition: string }> };
export async function generateMetadata({ params }: Props) {
  const { edition } = await params;
  const name = editions.find(([id]) => id === edition)?.[1];
  return { title: { absolute: `${name ?? "Pinboard"} · Things I Love` }, alternates: { canonical: `/recommend/${edition}` } };
}
export default async function EditionPage({ params }: Props) {
  const { edition } = await params;
  if (!editions.some(([id]) => id === edition)) notFound();
  return <Experience theme={edition} />;
}
