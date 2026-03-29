"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { trpc } from "@/lib/trpc/client";
import {
  MessageSquare,
  Search,
  Clock,
  Building2,
  ChevronRight,
  Loader2,
  Car,
  Phone,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

type FilterStatus = "ALL" | "NEW" | "VIEWED" | "RESPONDED" | "CONVERTED" | "CLOSED";

const STATUS_FILTERS: { value: FilterStatus; key: string }[] = [
  { value: "ALL", key: "filterAll" },
  { value: "NEW", key: "filterNew" },
  { value: "VIEWED", key: "filterViewed" },
  { value: "RESPONDED", key: "filterResponded" },
  { value: "CONVERTED", key: "filterConverted" },
  { value: "CLOSED", key: "filterClosed" },
];

export default function MyInquiriesPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("dashboard.inquiriesPage");
  const td = useTranslations("dashboard");
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [page] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  const { data: inquiries, isLoading } = trpc.inquiries.listMine.useQuery(
    { page, limit: 20 },
    { retry: false }
  );

  const filteredInquiries = filter === "ALL"
    ? (inquiries ?? [])
    : (inquiries ?? []).filter((i) => i.status === filter);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((sf) => (
          <button
            key={sf.value}
            type="button"
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === sf.value
                ? "bg-teal-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            onClick={() => setFilter(sf.value)}
          >
            {t(sf.key)}
          </button>
        ))}
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="mt-12 text-center">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 text-lg font-semibold">{td("noInquiries")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{td("noInquiriesSubtitle")}</p>
          <Button asChild className="mt-6">
            <Link href="/cars">
              <Search className="me-2 h-4 w-4" />
              {td("browseCars")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredInquiries.map((inquiry) => {
            const statusColor = STATUS_COLORS[inquiry.status] ?? STATUS_COLORS.NEW;
            const carTitle = `${inquiry.car.year} ${inquiry.car.make} ${inquiry.car.model}`;
            const dealerName = locale === "ar"
              ? (inquiry.dealer.companyNameAr || inquiry.dealer.companyName)
              : inquiry.dealer.companyName;
            return (
              <Card
                key={inquiry.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setSelectedInquiry(inquiry)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{carTitle}</p>
                      <Badge className={cn(statusColor.bg, statusColor.text, "text-[10px]")}>
                        {inquiry.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {dealerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {inquiry.message && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {inquiry.message}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-w-lg">
          {selectedInquiry && (() => {
            const carTitle = `${selectedInquiry.car.year} ${selectedInquiry.car.make} ${selectedInquiry.car.model}`;
            const dealerName = locale === "ar"
              ? (selectedInquiry.dealer.companyNameAr || selectedInquiry.dealer.companyName)
              : selectedInquiry.dealer.companyName;
            const statusColor = STATUS_COLORS[selectedInquiry.status] ?? STATUS_COLORS.NEW;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-teal-500" />
                    {carTitle}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Status & Dealer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {dealerName}
                    </div>
                    <Badge className={cn(statusColor.bg, statusColor.text, "text-xs")}>
                      {selectedInquiry.status}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Your Message */}
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {locale === "ar" ? "رسالتك" : "Your Message"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {selectedInquiry.message || (locale === "ar" ? "لا توجد رسالة" : "No message")}
                    </p>
                  </div>

                  {/* Dealer Response (if responded) */}
                  {selectedInquiry.status === "RESPONDED" && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          {locale === "ar" ? "رد التاجر" : "Dealer Response"}
                        </p>
                        <div className="mt-1 rounded-md bg-teal-50 p-3">
                          {selectedInquiry.dealerResponse ? (
                            <p className="whitespace-pre-wrap text-sm">
                              {selectedInquiry.dealerResponse}
                            </p>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                              {locale === "ar"
                                ? `تم الرد${selectedInquiry.respondedAt ? ` في ${new Date(selectedInquiry.respondedAt).toLocaleString()}` : ""}`
                                : `Response sent${selectedInquiry.respondedAt ? ` on ${new Date(selectedInquiry.respondedAt).toLocaleString()}` : ""}`}
                            </p>
                          )}
                          {selectedInquiry.dealerResponse && selectedInquiry.respondedAt && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(selectedInquiry.respondedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Contact & Date */}
                  <Separator />
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {locale === "ar" ? "طريقة التواصل:" : "Preferred:"}{" "}
                        {selectedInquiry.preferredContact === "WHATSAPP"
                          ? "WhatsApp"
                          : selectedInquiry.preferredContact === "CALL"
                            ? locale === "ar" ? "اتصال" : "Phone Call"
                            : selectedInquiry.preferredContact === "EMAIL"
                              ? locale === "ar" ? "بريد إلكتروني" : "Email"
                              : locale === "ar" ? "داخل التطبيق" : "In-App"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(selectedInquiry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {/* Dealer contact info */}
                    {(() => {
                      const contact = selectedInquiry.preferredContact;
                      const dealer = selectedInquiry.dealer;
                      const contactValue =
                        contact === "WHATSAPP" && dealer.whatsappNumber
                          ? dealer.whatsappNumber
                          : contact === "CALL" && dealer.phone
                            ? dealer.phone
                            : contact === "EMAIL" && dealer.email
                              ? dealer.email
                              : dealer.phone || dealer.whatsappNumber || dealer.email || null;
                      if (!contactValue) return null;
                      return (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>
                            {locale === "ar" ? "التاجر:" : "Dealer:"}{" "}
                            {contact === "EMAIL" || (!dealer.phone && !dealer.whatsappNumber && dealer.email) ? (
                              <a href={`mailto:${contactValue}`} className="text-teal-600 hover:underline">{contactValue}</a>
                            ) : contact === "WHATSAPP" && dealer.whatsappNumber ? (
                              <a href={`https://wa.me/${dealer.whatsappNumber.replace(/[^0-9]/g, "")}`} className="text-teal-600 hover:underline">{contactValue}</a>
                            ) : (
                              <a href={`tel:${contactValue}`} className="text-teal-600 hover:underline">{contactValue}</a>
                            )}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
