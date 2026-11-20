// Run by the Mac LaunchAgent. A missed poll is caught up on the next wake.
import { Client } from "@notionhq/client";
import { config } from "dotenv";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";

config({ path: ".env.local", quiet: true });
const directory = join(homedir(), "Library/Application Support/Things I Love");
const stateFile = join(directory, "recommendations-since.txt");
await mkdir(directory, { recursive: true });
async function checkpoint(time) {
  await writeFile(stateFile + ".tmp", time, { mode: 0o600 });
  await rename(stateFile + ".tmp", stateFile);
}
let since;
try {
  since = (await readFile(stateFile, "utf8")).trim();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  since = new Date(Math.floor(Date.now() / 60000) * 60000).toISOString();
  await checkpoint(since);
}
// Notion creation timestamps have minute precision. Only consume complete minutes.
const until = new Date(Math.floor(Date.now() / 60000) * 60000).toISOString();
if (since >= until) process.exit(0);
const notion = new Client({ auth: process.env.NOTION_TOKEN });
let cursor;
let count = 0;
do {
  const batch = await notion.databases.query({
    database_id: process.env.NOTION_INBOX_DB_ID,
    start_cursor: cursor,
    filter: { and: [
      { property: "Page", rich_text: { equals: "/recommend" } },
      { timestamp: "created_time", created_time: { on_or_after: since } },
      { timestamp: "created_time", created_time: { before: until } },
    ] },
  });
  count += batch.results.length;
  cursor = batch.next_cursor;
} while (cursor);
if (count) {
  const message = count === 1 ? "A new favorite is in your Notion inbox." : `${count} new favorites are in your Notion inbox.`;
  execFileSync("/usr/bin/osascript", ["-e", `display notification "${message}" with title "Things I Love"`]);
}
await checkpoint(until);
