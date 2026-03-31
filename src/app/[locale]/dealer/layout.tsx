"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DealerSidebar } from "@/components/dealer/dealer-sidebar";
import { DealerTopbar } from "@/components/dealer/dealer-topbar";
import { RoleGate } from "@/components/auth/RoleGate";
import { trpc } from "@/lib/trpc/client";

/**
 * Dealer portal layout.
 * Only accessible to users with DEALER or ADMIN role.
 */
export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: dealer } = trpc.dealers.getMyProfile.useQuery(undefined, {
    retry: false,
  });

  return (
    <RoleGate allowedRoles={["DEALER", "ADMIN"]}>
      <div className="flex h-[calc(100vh-6rem)] overflow-hidden">
        <DealerSidebar
          locale={locale}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DealerTopbar
            onMenuClick={() => setSidebarOpen(true)}
            dealerName={dealer?.companyName ?? "My Dealership"}
            logoUrl={dealer?.logoUrl ?? undefined}
          />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </RoleGate>
  );
}
