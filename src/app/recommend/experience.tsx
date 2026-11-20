import { getLovesData } from "@/lib/notion-loves";
import { RecommendationForm } from "./recommendation-form";

export async function Experience({ theme }: { theme?: string }) {
  const { items } = await getLovesData().catch(() => ({ items: [] }));
  const picks = items.filter(item => item.published && /^https?:\/\//i.test(item.url))
    .map(({title, subtitle, note, url}) => ({title, subtitle, note, url}));
  return <RecommendationForm initialTheme={theme} picks={picks} />;
}
