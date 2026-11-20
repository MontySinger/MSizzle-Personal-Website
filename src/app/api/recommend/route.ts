import { createInboxEntry } from "@/lib/notion-inbox";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body?.url !== "string" || body.url.length > 2048) {
    return Response.json({ error: "Enter a link of up to 2,048 characters." }, { status: 400 });
  }
  const url = URL.parse(body.url.trim());
  if (!url || !["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    return Response.json({ error: "Paste a link beginning with https:// or http://." }, { status: 400 });
  }
  if (typeof body.note !== "string" || body.note.length > 500) {
    return Response.json({ error: "Keep your note under 501 characters." }, { status: 400 });
  }
  if (body.website) return Response.json({ ok: true });
  try {
    await createInboxEntry({
      message: [url.href, body.note.trim()].filter(Boolean).join("\n\n"),
      path: "/recommend",
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Your link couldn’t be saved. Please try again." }, { status: 503 });
  }
}
