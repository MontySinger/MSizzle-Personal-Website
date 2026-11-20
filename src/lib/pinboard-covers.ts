import type { LoveItem } from "./notion-loves";
import versions from "./pinboard-cover-versions.json";

const snapshots: Record<string, string> = versions;
export const frameSizes = {
  Place: { w: 210, h: 150 }, Book: { w: 150, h: 210 },
  Movie: { w: 150, h: 210 }, Thing: { w: 200, h: 120 }, YouTube: { w: 260, h: 146 },
};

export function cardImages(item: LoveItem) {
  const snapshot = snapshots[item.id] ? `/pinboard/${item.id}.webp` : "";
  // Bust the proxy cache when the source page has changed since its local copy.
  const revision = snapshot && item.lastEdited !== snapshots[item.id]
    ? "&v=" + encodeURIComponent(item.lastEdited) : "";
  const live = item.type === "YouTube" && item.youtubeId
    ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`
    : item.cover ? `/api/notion-cover?pageId=${item.id}&w=${frameSizes[item.type].w * 2}${revision}` : "";
  const fallback = "/pinboard/" + item.type.toLowerCase() + ".svg";
  const current = snapshot && item.lastEdited === snapshots[item.id];
  return Array.from(new Set((current ? [snapshot, live, fallback] : [live, snapshot, fallback]).filter(Boolean)));
}
