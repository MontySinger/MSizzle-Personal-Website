import { CarryShelf } from "./shelf";
import { getLovesData } from "@/lib/notion-loves";
export const metadata = { title: "Current carry · Monty Singer", robots: { index: false, follow: false } };
export default async function Page() {
  const { items } = await getLovesData().catch(() => ({ items: [] }));
  return <CarryShelf books={items.filter(item => item.type === "Book" && item.published)} />;
}
