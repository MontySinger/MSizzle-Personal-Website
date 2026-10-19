import {
  SITE_URL,
  canonical,
  IDENTITY_SENTENCE,
  PERSON_ID,
  ORG_ID,
  PERSON_IMAGE,
} from './site'

/**
 * A pointer to the Person node rather than a copy of it. Anywhere Monty shows
 * up in someone else's schema (site publisher, article author, company
 * founder), emit this: the shared @id is what tells a crawler these are all
 * the same entity instead of four unlinked strings (quick task 260921-ed0).
 */
export function personRef() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Monty Singer',
    url: SITE_URL,
  } as const
}

export function buildPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Monty Singer',
    url: SITE_URL,
    description: IDENTITY_SENTENCE,
    image: PERSON_IMAGE,
    email: 'mailto:monty@prometheus.today',
    jobTitle: 'Founder',
    knowsAbout: [
      'Artificial intelligence',
      'AI integrations',
      'Entrepreneurship',
      'Writing',
      'Biology',
      'Self-improvement',
    ],
    worksFor: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'Prometheus',
      url: 'https://prometheus.today',
    },
    sameAs: [
      'https://linkedin.com/in/monty-singer',
      'https://github.com/MontySinger',
      'https://x.com/themontysinger',
    ],
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Georgetown University',
    },
  } as const
}

/**
 * Emitted once from the root layout. Names the site as an entity and ties it
 * back to the Person node, which is what lets Google treat montysinger.com and
 * "Monty Singer" as the same thing rather than two unrelated strings.
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Monty Singer',
    url: SITE_URL,
    publisher: personRef(),
  } as const
}

/**
 * Prometheus as its own entity, emitted once from the root layout beside the
 * WebSite node. `founder` points at the Person @id, which closes the loop:
 * Person worksFor Organization, Organization founder Person.
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Prometheus',
    url: 'https://prometheus.today',
    description:
      'An applied AI company: AI integrations and education for businesses.',
    founder: personRef(),
  } as const
}

export type BlogPostingInput = {
  title: string
  slug: string
  description: string
  /** Notion `Date` property, ISO. Empty when unset. */
  date?: string
  /** Notion page last_edited_time, ISO. */
  lastEdited?: string
  /** Notion page id; present only when the post has a cover image. */
  coverPageId?: string | null
  wordCount?: number
}

/**
 * Article markup for a post. Before this, posts emitted only BreadcrumbList --
 * no datePublished, author, or image, which are exactly the fields that earn a
 * date stamp and rich-result eligibility in search (quick task 260728-kcg).
 *
 * `dateModified` falls back to `datePublished` because Schema.org treats a
 * dateModified earlier than datePublished as invalid, and Notion's
 * last_edited_time is occasionally unset on imported pages.
 */
export function buildBlogPostingSchema(post: BlogPostingInput) {
  const url = canonical(`/blog/${post.slug}`)
  const datePublished = post.date || post.lastEdited || undefined

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: personRef(),
    publisher: personRef(),
  }

  if (datePublished) {
    node.datePublished = datePublished
    node.dateModified = post.lastEdited || datePublished
  }
  if (post.coverPageId) {
    node.image = `${SITE_URL}/api/notion-cover?pageId=${post.coverPageId}`
  }
  if (post.wordCount && post.wordCount > 0) {
    node.wordCount = post.wordCount
  }

  return node
}

export type ProjectSchemaInput = {
  title: string
  slug: string
  description: string
  /** Notion page id; present only when the project has a cover image. */
  coverPageId?: string | null
  /** Notion page last_edited_time, ISO. */
  lastEdited?: string
  tags?: string[]
  /** The project's own site, when it has one. */
  externalUrl?: string
}

/**
 * CreativeWork markup for a /building page. Projects previously emitted only a
 * breadcrumb, so a crawler had no way to tell what the page was about or who
 * made it (quick task 260921-ed0). `sameAs` carries the project's own URL,
 * which is how a crawler links this page to the live thing it describes.
 */
export function buildProjectSchema(project: ProjectSchemaInput) {
  const url = canonical(`/building/${project.slug}`)

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: personRef(),
  }

  if (project.coverPageId) {
    node.image = `${SITE_URL}/api/notion-cover?pageId=${project.coverPageId}`
  }
  if (project.lastEdited) {
    node.dateModified = project.lastEdited
  }
  if (project.tags && project.tags.length > 0) {
    node.keywords = project.tags.join(', ')
  }
  if (project.externalUrl && /^https?:\/\//i.test(project.externalUrl)) {
    node.sameAs = project.externalUrl
  }

  return node
}

export type FaqItem = { question: string; answer: string }

export function buildFaqPageSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  }
}

export type BreadcrumbItem = { name: string; href?: string }

export function buildBreadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => {
      const node: Record<string, unknown> = {
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
      }
      if (item.href) node.item = canonical(item.href)
      return node
    }),
  }
}
