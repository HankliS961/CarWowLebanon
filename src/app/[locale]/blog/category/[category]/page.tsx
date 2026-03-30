import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { absoluteUrl } from "@/lib/utils";
import { BLOG_CATEGORIES, type BlogCategorySlug } from "@/types/content";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

interface BlogCategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: BlogCategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const meta = BLOG_CATEGORIES.find((c) => c.slug === category);
  if (!meta) return {};

  const title = `${meta.labelEn} — CarSouk Blog`;
  const description = `Browse ${meta.labelEn.toLowerCase()} articles on CarSouk Blog. Expert advice for the Lebanese automotive market.`;
  const url = absoluteUrl(`/${locale}/blog/category/${category}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "CarSouk", type: "website" },
  };
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: BlogCategoryPageProps) {
  const { locale, category } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10);
  const isAr = locale === "ar";

  const meta = BLOG_CATEGORIES.find((c) => c.slug === category);
  if (!meta) notFound();

  const categoryLabel = isAr ? meta.labelAr : meta.labelEn;

  const postsData = await api.content.listBlogPosts({
    category: meta.slug,
    page,
    limit: 12,
  });

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Blog", labelAr: "المدونة", href: "/blog" },
    { label: meta.labelEn, labelAr: meta.labelAr },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      {/* Heading */}
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-charcoal">
          {categoryLabel}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isAr
            ? `تصفح مقالات ${categoryLabel} في مدونة كارسوق`
            : `Browse ${categoryLabel.toLowerCase()} articles on CarSouk Blog`}
        </p>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 pb-16">
        {postsData.posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {postsData.posts.map((post) => (
              <BlogPostCard
                key={post.id}
                slug={post.slug}
                titleEn={post.titleEn}
                titleAr={post.titleAr}
                excerptEn={post.excerptEn}
                excerptAr={post.excerptAr}
                category={post.category}
                featuredImageUrl={post.featuredImageUrl}
                publishedAt={post.publishedAt?.toISOString() || null}
                author={{
                  name: post.author.name,
                  image: post.author.image,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-12 text-center">
            <h2 className="text-lg font-semibold">
              {isAr ? "لا توجد مقالات في هذا القسم بعد" : "No posts in this category yet"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAr ? "ترقبوا المحتوى القادم" : "Stay tuned for upcoming content"}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/blog">{isAr ? "العودة إلى المدونة" : "Back to Blog"}</Link>
            </Button>
          </div>
        )}

        {/* Pagination */}
        {postsData.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {page > 1 && (
              <Button variant="outline" asChild>
                <Link href={`/blog/category/${category}?page=${page - 1}`}>
                  {isAr ? "السابق" : "Previous"}
                </Link>
              </Button>
            )}
            <span className="px-4 text-sm text-muted-foreground">
              {isAr
                ? `صفحة ${page} من ${postsData.totalPages}`
                : `Page ${page} of ${postsData.totalPages}`}
            </span>
            {page < postsData.totalPages && (
              <Button variant="outline" asChild>
                <Link href={`/blog/category/${category}?page=${page + 1}`}>
                  {isAr ? "التالي" : "Next"}
                </Link>
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
