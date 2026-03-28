"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileText, Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { trpc } from "@/lib/trpc/client";

type ContentTab = "blogPosts" | "carReviews" | "guides";

/** Admin content management page for blog posts, car reviews, and guides. */
export default function AdminContentPage() {
  const t = useTranslations("admin.content");
  const [activeTab, setActiveTab] = useState<ContentTab>("blogPosts");
  const [page, setPage] = useState(1);

  const { data: blogData, isLoading: blogLoading } = trpc.content.listBlogPosts.useQuery(
    { page, limit: 25 },
    { enabled: activeTab === "blogPosts", retry: false }
  );

  const { data: reviewData, isLoading: reviewLoading } = trpc.content.listCarReviews.useQuery(
    { page, limit: 25 },
    { enabled: activeTab === "carReviews", retry: false }
  );

  const isLoading = activeTab === "blogPosts" ? blogLoading : reviewLoading;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ContentTab); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="blogPosts">{t("tabs.blogPosts")}</TabsTrigger>
          <TabsTrigger value="carReviews">{t("tabs.carReviews")}</TabsTrigger>
          <TabsTrigger value="guides">{t("tabs.guides")}</TabsTrigger>
        </TabsList>

        {/* Blog Posts Tab */}
        <TabsContent value="blogPosts" className="mt-4">
          <Card>
            {(blogData?.posts?.length ?? 0) === 0 && !blogLoading ? (
              <div className="p-6">
                <EmptyState icon={FileText} title="No blog posts found" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Views</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogLoading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={6}>
                              <div className="h-10 animate-pulse rounded bg-muted" />
                            </TableCell>
                          </TableRow>
                        ))
                      : (blogData?.posts ?? []).map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <p className="font-medium">{post.titleEn}</p>
                              <p className="text-xs text-muted-foreground">{post.slug}</p>
                            </TableCell>
                            <TableCell className="capitalize text-sm">
                              {post.category.replace(/_/g, " ").toLowerCase()}
                            </TableCell>
                            <TableCell className="text-sm">
                              {post.author.name || "Unknown"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={post.status} />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {post.viewsCount}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {post.status === "DRAFT" ? (
                                  <Button size="sm">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    {t("publish")}
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="outline">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    {t("unpublish")}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
                {blogData && (
                  <DataTablePagination
                    currentPage={page}
                    totalPages={blogData.totalPages}
                    onPageChange={setPage}
                    totalItems={blogData.total}
                    pageSize={25}
                  />
                )}
              </>
            )}
          </Card>
        </TabsContent>

        {/* Car Reviews Tab */}
        <TabsContent value="carReviews" className="mt-4">
          <Card>
            {(reviewData?.reviews ?? []).length === 0 && !reviewLoading ? (
              <div className="p-6">
                <EmptyState icon={FileText} title="No car reviews found" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Make/Model</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={5}>
                            <div className="h-10 animate-pulse rounded bg-muted" />
                          </TableCell>
                        </TableRow>
                      ))
                    : (reviewData?.reviews ?? []).map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{review.titleEn}</TableCell>
                          <TableCell>{review.make} {review.model} {review.year}</TableCell>
                          <TableCell>{review.author.name || "Unknown"}</TableCell>
                          <TableCell>
                            <StatusBadge status={review.status} />
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="mt-4">
          <Card>
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title="No guides found"
                description="Guides are managed through the CMS. Integration coming soon."
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
