import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/trpc/server";
import { generateBlogPostMetadata } from "@/lib/seo/metadata";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/utils";
import { estimateReadingTime, formatReadingTime } from "@/lib/content/reading-time";
import { extractTableOfContents, injectHeadingIds } from "@/lib/content/toc";
import { BLOG_CATEGORIES } from "@/types/content";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { SocialShare } from "@/components/blog/SocialShare";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Calendar, User, Clock, ArrowRight, Tag } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await api.content.getBlogPostBySlug({ slug });
  if (!post) return {};

  const isAr = locale === "ar";
  return generateBlogPostMetadata(
    {
      title: isAr ? post.titleAr : post.titleEn,
      excerpt: isAr ? post.excerptAr : post.excerptEn,
      imageUrl: post.featuredImageUrl,
      seoTitle: isAr ? post.seoTitleAr : post.seoTitleEn,
      seoDescription: isAr ? post.seoDescriptionAr : post.seoDescriptionEn,
      slug: post.slug,
    },
    locale
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const isAr = locale === "ar";

  const post = await api.content.getBlogPostBySlug({ slug });
  if (!post) notFound();

  const title = isAr ? post.titleAr : post.titleEn;
  const content = isAr ? post.contentAr : post.contentEn;
  const excerpt = isAr ? post.excerptAr : post.excerptEn;
  const readingTime = estimateReadingTime(content);
  const contentWithIds = injectHeadingIds(content);
  const tocItems = extractTableOfContents(contentWithIds);
  const tags = (post.tags as string[]) || [];
  const url = absoluteUrl(`/${locale}/blog/${slug}`);

  const categoryMeta = BLOG_CATEGORIES.find((c) => c.dbValue === post.category);
  const categoryLabel = categoryMeta
    ? isAr ? categoryMeta.labelAr : categoryMeta.labelEn
    : post.category;
  const categorySlug = categoryMeta?.slug || post.category.toLowerCase();

  // Fetch related posts
  const relatedPosts = await api.content.getRelatedPosts({
    postId: post.id,
    category: post.category,
    limit: 3,
  });

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(isAr ? "ar-LB" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Blog", labelAr: "المدونة", href: "/blog" },
    {
      label: categoryMeta?.labelEn || post.category,
      labelAr: categoryMeta?.labelAr || post.category,
      href: `/blog/${categorySlug}`,
    },
    { label: isAr ? post.titleAr : post.titleEn, labelAr: post.titleAr },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <JsonLd
        data={generateArticleSchema({
          headline: title,
          description: excerpt || title,
          authorName: post.author.name || "CarSouk Team",
          datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          imageUrl: post.featuredImageUrl || undefined,
          url,
          section: categoryLabel,
        })}
      />
      <JsonLd
        data={generateBreadcrumbSchema(
          breadcrumbs.map((b) => ({
            name: isAr ? b.labelAr : b.label,
            url: b.href ? absoluteUrl(`/${locale}${b.href}`) : undefined,
          }))
        )}
      />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      {/* Featured Image */}
      {post.featuredImageUrl && (
        <div className="container mx-auto px-4 py-4">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl">
            <Image
              src={post.featuredImageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1400px) 100vw, 1400px"
              priority
            />
          </div>
        </div>
      )}

      {/* Article Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <Link href={`/blog/${categorySlug}`}>
            <Badge className="mb-3 bg-teal-500 text-white hover:bg-teal-600">
              {categoryLabel}
            </Badge>
          </Link>
          <h1 className="text-3xl font-bold text-charcoal md:text-4xl">
            {title}
          </h1>

          {/* Author & Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name || ""}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="font-medium text-foreground">
                {post.author.name || (isAr ? "فريق كارسوق" : "CarSouk Team")}
              </span>
            </div>
            {formattedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatReadingTime(readingTime, locale)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content + Sidebar */}
      <div className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_250px]">
            {/* Article Body */}
            <article className="min-w-0">
              <div
                className="prose prose-lg max-w-none prose-headings:text-charcoal prose-a:text-teal-500 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Social Share */}
              <div className="mt-6 border-t pt-6">
                <SocialShare url={url} title={title} />
              </div>

              {/* Author Bio */}
              <div className="mt-8 rounded-lg border bg-card p-6">
                <div className="flex items-start gap-4">
                  {post.author.image ? (
                    <Image
                      src={post.author.image}
                      alt={post.author.name || ""}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                      <User className="h-8 w-8 text-teal-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {post.author.name || (isAr ? "فريق كارسوق" : "CarSouk Team")}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isAr
                        ? "كاتب في فريق كارسوق التحريري، متخصص في سوق السيارات اللبناني."
                        : "Writer at CarSouk editorial team, specializing in the Lebanese automotive market."}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 rounded-lg bg-teal-50 p-6 text-center">
                <h3 className="text-lg font-semibold text-charcoal">
                  {isAr ? "هل تبحث عن سيارة؟" : "Looking for a car?"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isAr
                    ? "تصفح سوقنا واعثر على سيارتك المثالية"
                    : "Browse our marketplace and find your perfect car"}
                </p>
                <Button asChild className="mt-4 bg-teal-500 text-white hover:bg-teal-600">
                  <Link href="/cars">
                    {isAr ? "ابحث في السوق" : "Search Marketplace"}
                    <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            </article>

            {/* Sticky Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <TableOfContents items={tocItems} />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-xl font-bold text-charcoal">
              {isAr ? "مقالات ذات صلة" : "Related Posts"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => (
                <BlogPostCard
                  key={rp.id}
                  slug={rp.slug}
                  titleEn={rp.titleEn}
                  titleAr={rp.titleAr}
                  excerptEn={rp.excerptEn}
                  excerptAr={rp.excerptAr}
                  category={rp.category}
                  featuredImageUrl={rp.featuredImageUrl}
                  publishedAt={rp.publishedAt?.toISOString() || null}
                  author={{
                    name: rp.author.name,
                    image: rp.author.image,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
