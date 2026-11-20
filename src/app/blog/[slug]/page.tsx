import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPublishedPosts, getPostBySlug, getBlocks } from '@/lib/notion'
import { NotionRenderer } from '@/components/notion/notion-renderer'
import { calculateReadingTime } from '@/utils/reading-time'
import { NewsletterCta } from '@/components/blog/newsletter-cta'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { RelatedEssays } from '@/components/blog/related-essays'
import { PageHero, PageCrumb } from '@/components/v3/page-hero'
import { RuleStrong } from '@/components/v3/rule-strong'
import { buildBlogPostMetadata, deriveDescriptionFromBlocks } from '@/lib/seo/blog-metadata'
import { buildBlogPostingSchema } from '@/lib/seo/schemas'
import { JsonLd } from '@/components/seo/json-ld'
import { extractTextFromBlock } from '@/utils/notion-text'
import { formatMonthYear } from '@/lib/dates'
import type { Metadata } from 'next'
import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'

export const revalidate = 1800; // 30 minutes

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    return []
  }
  try {
    const posts = await getPublishedPosts()
    return posts.map((post) => ({ slug: post.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }
  // Blocks feed the content-derived description fallback. The page body fetches
  // the same blocks for reading time; Next dedupes identical fetches within a
  // request and ISR caps how often this runs, so it costs no extra Notion call.
  // A failure here must not take down metadata generation -- degrade to the
  // template description instead.
  const blocks = await getBlocks(post.id).catch(() => [])
  return buildBlogPostMetadata(post, blocks)
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const blocks = await getBlocks(post.id)
  const readingTime = calculateReadingTime(blocks)

  // Same precedence the metadata uses, so the JSON-LD description and the
  // <meta> description never disagree.
  const description =
    post.description || deriveDescriptionFromBlocks(blocks) ||
    `An essay by Monty Singer: ${post.title}.`
  const wordCount = blocks
    .map(extractTextFromBlock)
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  return (
    <>
      {/* Article markup: headline, dates, author, cover image (260728-kcg).
          Posts previously emitted only the breadcrumb below. */}
      <JsonLd
        data={buildBlogPostingSchema({
          title: post.title,
          slug: post.slug,
          description,
          date: post.date,
          lastEdited: post.lastEdited,
          coverPageId: post.cover ? post.id : null,
          wordCount,
        })}
      />

      {/* Semantic breadcrumb nav + JSON-LD (sr-only); Writing points to /writing per D-14 */}
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Writing', href: '/writing' },
          { name: post.title },
        ]}
      />

      {/* With a cover the crumb leads, then the cover, then the title sits
          flush against the cover's bottom edge. Without one the crumb stays
          inside PageHero and keeps the standing top padding. */}
      {post.cover && (
        <div className="px-6 pt-10 md:px-40 md:pt-16">
          <PageCrumb>Home / Writing</PageCrumb>
        </div>
      )}

      {/* Inset cover image (D-02) — only when post.cover exists */}
      {post.cover && (
        <div className="relative mx-6 h-[min(48svh,24rem)] border border-[var(--color-border-strong)] md:mx-40 md:h-[min(48svh,30rem)]">
          {/* unoptimized (260723-g2q Task 4, see card-cover.tsx for the full
              reasoning): /api/notion-cover already resizes/webp-encodes
              server-side, so Next's optimizer would just do that work again. */}
          <Image
            src={`/api/notion-cover?pageId=${post.id}`}
            alt={`${post.title} cover`}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      {/* PageHero: breadcrumb line + title (D-14) */}
      <div className="px-6 md:px-40">
        <PageHero
          title={post.title}
          crumb={post.cover ? undefined : "Home / Writing"}
          flush={Boolean(post.cover)}
        />

        {/* Meta row: reading time · publish date · optional first tag */}
        <div className="flex flex-wrap items-center gap-[18px] font-mono text-xs text-[var(--color-text-muted)] mb-6 -mt-6">
          <span>{readingTime} min read</span>
          {post.date && (
            <>
              <span className="text-[var(--color-text-muted)]">.</span>
              <span>{formatMonthYear(post.date)}</span>
            </>
          )}
          {post.tags?.[0] && (
            <>
              <span className="text-[var(--color-text-muted)]">.</span>
              <span>{post.tags[0]}</span>
            </>
          )}
        </div>
      </div>

      <RuleStrong />

      {/* Prose section (IN-01/IN-02) — NotionRenderer is UNCHANGED */}
      <article className="mx-auto max-w-[68ch] px-6 pb-16 pt-8 md:px-0">
        <div className="prose max-w-none">
          <NotionRenderer blocks={blocks as (BlockObjectResponse & { children?: BlockObjectResponse[] })[]} />
        </div>

        <NewsletterCta />
        <RelatedEssays currentSlug={slug} />
      </article>
    </>
  )
}
