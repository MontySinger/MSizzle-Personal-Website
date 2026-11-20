import { cardImages } from "@/lib/pinboard-covers";
import { getLovesData } from "@/lib/notion-loves";
import { RecommendationForm } from "./recommendation-form";

export async function Experience({ theme }: { theme?: string }) {
  const { items } = await getLovesData().catch(() => ({ items: [] }));
  const cards = items.filter(item => item.published && /^https?:\/\//i.test(item.url))
    .map(item => ({id: item.id, title: item.title, subtitle: item.subtitle, url: item.url, images: cardImages(item)}));
  return <RecommendationForm initialTheme={theme} cards={cards} />;
}
