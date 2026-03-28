import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { api } from "@/lib/trpc/server";
import { absoluteUrl } from "@/lib/utils";
import { BLOG_CATEGORIES } from "@/types/content";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BreadcrumbNav } from "@/components/shared/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebsiteSchema } from "@/lib/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, TrendingUp, ArrowRight } from "lucide-react";

interface BlogIndexPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: BlogIndexPageProps): Promise<Metadata> {
  const { locale } = await params;
  const title = "CarSouk Blog — Car Guides, News & Tips for Lebanon";
  const description =
    "Read the latest car buying guides, import tips, market news, and expert advice for the Lebanese automotive market.";
  const url = absoluteUrl(`/${locale}/blog`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "CarSouk",
      type: "website",
    },
  };
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: BlogIndexPageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10);
  const isAr = locale === "ar";

  const [postsData, popularPosts] = await Promise.all([
    api.content.listBlogPosts({ page, limit: 9 }),
    api.content.getPopularPosts({ limit: 5 }),
  ]);

  const breadcrumbs = [
    { label: "Home", labelAr: "الرئيسية", href: "/" },
    { label: "Blog", labelAr: "المدونة" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={generateWebsiteSchema()} />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbs} />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 py-8 text-center">
        <div className="mx-auto max-w-2xl">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-teal-500" />
          <h1 className="text-3xl font-bold text-charcoal md:text-4xl">
            {isAr
              ? "مدونة كارسوق — أدلة السيارات والأخبار والنصائح"
              : "CarSouk Blog — Car Guides, News & Tips"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {isAr
              ? "اقرأ أحدث أدلة شراء السيارات ونصائح الاستيراد وأخبار السوق"
              : "Read the latest car buying guides, import tips, and market news for Lebanon"}
          </p>
        </div>
      </section>

      {/* Category Pills */}
      <div className="container mx-auto px-4 pb-4">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          <Link href="/blog">
            <Badge
              variant="secondary"
              className="cursor-pointer whitespace-nowrap bg-teal-500 text-white hover:bg-teal-600"
            >
              {isAr ? "الكل" : "All"}
            </Badge>
          </Link>
          {BLOG_CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/blog/${cat.slug}`}>
              <Badge
                variant="outline"
                className="cursor-pointer whitespace-nowrap hover:bg-teal-50 hover:text-teal-500"
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Posts Grid */}
          <div className="lg:col-span-2">
            {postsData.posts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
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
                      avatarUrl: post.author.avatarUrl,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-card p-12 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="text-lg font-semibold">
                  {isAr ? "لا توجد مقالات بعد" : "No posts yet"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isAr
                    ? "ترقبوا المحتوى القادم قريبا"
                    : "Stay tuned for upcoming content"}
                </p>
              </div>
            )}

            {/* Pagination */}
            {postsData.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Button variant="outline" asChild>
                    <Link href={`/blog?page=${page - 1}`}>
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
                    <Link href={`/blog?page=${page + 1}`}>
                      {isAr ? "التالي" : "Next"}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 flex flex-col gap-6">
              {/* Popular Posts */}
              <div className="rounded-lg border bg-card p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <TrendingUp className="h-4 w-4 text-teal-500" />
                  {isAr ? "الأكثر قراءة" : "Popular Posts"}
                </h3>
                <ul className="flex flex-col gap-3">
                  {popularPosts.map((post, i) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-start gap-3 text-sm text-foreground hover:text-teal-500 transition-colors"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-500">
                          {i + 1}
                        </span>
                        <span className="line-clamp-2">
                          {isAr ? post.titleAr : post.titleEn}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter Signup */}
              <div className="rounded-lg border bg-teal-50 p-5">
                <h3 className="text-sm font-semibold text-charcoal">
                  {isAr ? "اشترك في النشرة الإخبارية" : "Subscribe to Our Newsletter"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAr
                    ? "احصل على أحدث أخبار السيارات والنصائح"
                    : "Get the latest car news and tips delivered to your inbox"}
                </p>
                <form className="mt-3 flex flex-col gap-2">
                  <Input
                    type="email"
                    placeholder={isAr ? "بريدك الإلكتروني" : "Your email"}
                    className="text-sm"
                  />
                  <Button size="sm" className="bg-teal-500 text-white hover:bg-teal-600">
                    {isAr ? "اشترك" : "Subscribe"}
                  </Button>
                </form>
              </div>

              {/* Categories */}
              <div className="rounded-lg border bg-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  {isAr ? "الأقسام" : "Categories"}
                </h3>
                <ul className="flex flex-col gap-2">
                  {BLOG_CATEGORIES.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/blog/${cat.slug}`}
                        className="flex items-center justify-between text-sm text-muted-foreground hover:text-teal-500 transition-colors"
                      >
                        <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="rounded-lg bg-charcoal p-5 text-white">
                <h3 className="text-sm font-semibold">
                  {isAr ? "هل تبحث عن سيارة؟" : "Looking for a car?"}
                </h3>
                <p className="mt-1 text-xs text-white/70">
                  {isAr
                    ? "ابحث في سوقنا عن أفضل الصفقات"
                    : "Search our marketplace for the best deals"}
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-3 w-full bg-amber-500 text-white hover:bg-amber-600"
                >
                  <Link href="/cars">
                    {isAr ? "تصفح السيارات" : "Browse Cars"}
                    <ArrowRight className="ms-1 h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
