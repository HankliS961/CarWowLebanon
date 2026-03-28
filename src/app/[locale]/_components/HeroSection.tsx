"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Car, CarFront, DollarSign, Import } from "lucide-react";

const TABS = [
  { key: "buyNew", labelKey: "tabBuyNew", icon: CarFront, href: "/cars/new" },
  { key: "buyUsed", labelKey: "tabBuyUsed", icon: Car, href: "/cars/used" },
  { key: "sell", labelKey: "tabSell", icon: DollarSign, href: "/sell-my-car" },
  { key: "import", labelKey: "tabImport", icon: Import, href: "/cars/import" },
] as const;

const POPULAR_MAKES = [
  "Toyota", "Kia", "Hyundai", "Mercedes-Benz", "BMW",
  "Nissan", "Honda", "Land Rover", "BYD", "Chery",
];

const BUDGET_RANGES = [
  { label: "< $10,000", min: 0, max: 10000 },
  { label: "$10,000 - $20,000", min: 10000, max: 20000 },
  { label: "$20,000 - $40,000", min: 20000, max: 40000 },
  { label: "$40,000 - $60,000", min: 40000, max: 60000 },
  { label: "$60,000+", min: 60000, max: undefined },
];

export function HeroSection() {
  const t = useTranslations("home.hero");
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("buyNew");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");

  const handleSearch = () => {
    const tab = TABS.find((tab) => tab.key === activeTab);
    if (activeTab === "sell") {
      router.push("/sell-my-car");
      return;
    }

    const params = new URLSearchParams();
    if (selectedMake) params.set("make", selectedMake.toLowerCase());

    const budget = BUDGET_RANGES.find((b) => b.label === selectedBudget);
    if (budget) {
      if (budget.min > 0) params.set("minPrice", String(budget.min));
      if (budget.max) params.set("maxPrice", String(budget.max));
    }

    const basePath = tab?.href || "/cars";
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  return (
    <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-charcoal px-4 py-16 text-white md:py-24 lg:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[url('/images/hero-pattern.svg')] bg-cover bg-center" />
      </div>

      <div className="container relative mx-auto max-w-4xl text-center">
        {/* Headline */}
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-base text-teal-100 sm:text-lg md:text-xl">
          {t("subtitle")}
        </p>

        {/* Search widget */}
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
          {/* Tab bar */}
          <div className="flex border-b">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors sm:text-sm",
                    activeTab === tab.key
                      ? "border-b-2 border-teal-500 bg-teal-50 text-teal-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xs:inline">{t(tab.labelKey)}</span>
                </button>
              );
            })}
          </div>

          {/* Search form */}
          {activeTab !== "sell" ? (
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:gap-2">
              {/* Make selector */}
              <div className="flex-1">
                <label htmlFor="hero-make" className="mb-1 block text-start text-xs font-medium text-gray-500">
                  {t("selectMake")}
                </label>
                <select
                  id="hero-make"
                  value={selectedMake}
                  onChange={(e) => setSelectedMake(e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-charcoal focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">{t("selectMake")}</option>
                  {POPULAR_MAKES.map((make) => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>

              {/* Budget selector */}
              <div className="flex-1">
                <label htmlFor="hero-budget" className="mb-1 block text-start text-xs font-medium text-gray-500">
                  {t("budget")}
                </label>
                <select
                  id="hero-budget"
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-charcoal focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">{t("anyBudget")}</option>
                  {BUDGET_RANGES.map((budget) => (
                    <option key={budget.label} value={budget.label}>{budget.label}</option>
                  ))}
                </select>
              </div>

              {/* Search button */}
              <Button
                onClick={handleSearch}
                size="lg"
                className="h-10 bg-amber-500 px-6 text-white hover:bg-amber-600"
              >
                <Search className="me-2 h-4 w-4" />
                {t("searchButton")}
              </Button>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="mb-4 text-sm text-gray-600">
                {t("subtitle")}
              </p>
              <Button
                onClick={() => router.push("/sell-my-car")}
                size="lg"
                className="bg-amber-500 px-8 text-white hover:bg-amber-600"
              >
                {t("tabSell")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
