"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { DealerTopbar } from "@/components/dealer/dealer-topbar";
import { RoleGate } from "@/components/auth/RoleGate";

/**
 * Admin panel layout.
 * Only accessible to users with ADMIN role.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleGate allowedRoles={["ADMIN"]}>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar
          locale={locale}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DealerTopbar
            onMenuClick={() => setSidebarOpen(true)}
            dealerName="Admin Panel"
          />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </RoleGate>
  );
}
