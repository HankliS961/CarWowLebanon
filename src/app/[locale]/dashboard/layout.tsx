"use client";

import { RoleGate } from "@/components/auth/RoleGate";

/**
 * Buyer dashboard layout.
 * Accessible to any authenticated user (BUYER, SELLER, DEALER, ADMIN).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate allowedRoles={["BUYER", "SELLER", "DEALER", "ADMIN"]}>
      {children}
    </RoleGate>
  );
}
