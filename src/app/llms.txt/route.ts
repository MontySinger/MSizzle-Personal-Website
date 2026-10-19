import { getPublishedPosts } from '@/lib/notion'
import { getPublishedProjects } from '@/lib/notion-projects'
import { SITE_URL, IDENTITY_SENTENCE } from '@/lib/seo/site'

export const revalidate = 1800

/**
 * /llms.txt -- the llmstxt.org file: one plain-markdown page that tells a
 * language model what this site is and where its content lives, without making
 * it parse a heavily animated homepage first (260921-ed0).
 *
 * Shape follows the spec: H1 name, blockquote summary, prose, then link
 * sections. Facts here must match /about and the Person JSON-LD exactly, which
 * is why the summary is IDENTITY_SENTENCE rather than a paraphrase.
 */

/** Notion copy occasionally carries em dashes; site copy never does. */
function clean(text: string): string {
  return text.replace(/—/g, ':').replace(/\s+/g, ' ').trim()
}

function listItem(title: string, url: string, description: string): string {
  const desc = clean(description)
  return desc
    ? `- [${clean(title)}](${url}): ${desc}`
    : `- [${clean(title)}](${url})`
}

export async function GET() {
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = []
  let projects: Awaited<ReturnType<typeof getPublishedProjects>> = []

  if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID) {
    try {
      posts = await getPublishedPosts()
    } catch {}
  }
  if (process.env.NOTION_TOKEN && process.env.NOTION_PROJECTS_DATABASE_ID) {
    try {
      projects = await getPublishedProjects()
    } catch {}
  }

  const lines: string[] = [
    '# Monty Singer',
    '',
    `> ${IDENTITY_SENTENCE}`,
    '',
    `Personal site of Monty Singer. Canonical facts: founder of Prometheus (https://prometheus.today), an applied AI company doing AI integrations and education for businesses. Georgetown University. Writes essays and the Monty Monthly newsletter. Contact: monty@prometheus.today.`,
    '',
    '## Pages',
    `- [About](${SITE_URL}/about): who Monty is, FAQ`,
    `- [Building](${SITE_URL}/building): projects`,
    `- [Writing](${SITE_URL}/writing): essays`,
    `- [Contact](${SITE_URL}/contact)`,
    `- [RSS feed](${SITE_URL}/blog/feed.xml)`,
  ]

  if (posts.length > 0) {
    lines.push('', '## Essays')
    for (const post of posts) {
      lines.push(
        listItem(post.title, `${SITE_URL}/blog/${post.slug}`, post.description ?? '')
      )
    }
  }

  if (projects.length > 0) {
    lines.push('', '## Projects')
    for (const project of projects) {
      lines.push(
        listItem(
          project.title,
          `${SITE_URL}/building/${project.slug}`,
          project.description ?? ''
        )
      )
    }
  }

  lines.push(
    '',
    '## Elsewhere',
    '- Prometheus: https://prometheus.today',
    '- Monty Monthly: https://montymonthly.substack.com',
    '- X: https://x.com/themontysinger',
    '- LinkedIn: https://linkedin.com/in/monty-singer',
    '- GitHub: https://github.com/MontySinger',
    ''
  )

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=1800',
    },
  })
}
