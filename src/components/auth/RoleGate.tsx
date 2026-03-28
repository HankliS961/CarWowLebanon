"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGateProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

/**
 * Client-side role gate that redirects unauthorized users.
 * Checks the session role against allowedRoles.
 * Shows a loading spinner while session loads.
 */
export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace(`/${locale}/auth/login`);
      return;
    }

    const userRole = (session?.user as { role?: string })?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to homepage with no access
      router.replace(`/${locale}?error=unauthorized`);
    }
  }, [status, session, allowedRoles, router, locale]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userRole = (session?.user as { role?: string })?.role;
  if (!session || !userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
