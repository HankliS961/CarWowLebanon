"use client";

import { TrustBar } from "@/components/shared/TrustBar";
import { Building2, Car, Eye } from "lucide-react";

export function TrustBarSection() {
  const stats = [
    {
      icon: Building2,
      value: "200+",
      label: "Verified Dealers",
      labelAr: "وكيل موثق",
    },
    {
      icon: Car,
      value: "5,000+",
      label: "Cars Listed",
      labelAr: "سيارة معروضة",
    },
    {
      icon: Eye,
      value: "100%",
      label: "Transparent Prices",
      labelAr: "أسعار شفافة",
    },
  ];

  return (
    <div className="container mx-auto -mt-6 max-w-5xl px-4">
      <TrustBar stats={stats} />
    </div>
  );
}
