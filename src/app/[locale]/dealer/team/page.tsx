"use client";

import { useTranslations } from "next-intl";
import { Users, Clock, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

/** Dealer team management page - currently a coming soon placeholder. */
export default function DealerTeamPage() {
  const t = useTranslations("dealer.team");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      <Card>
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Team Management Coming Soon</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            We are working on team management features that will let you invite team members,
            assign roles like Sales Representative and Manager, and control access to your
            dealership portal.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center rounded-lg border p-4">
              <Users className="mb-2 h-6 w-6 text-primary" />
              <p className="text-sm font-medium">Invite Members</p>
              <p className="text-xs text-muted-foreground">Add your team via email</p>
            </div>
            <div className="flex flex-col items-center rounded-lg border p-4">
              <Wrench className="mb-2 h-6 w-6 text-primary" />
              <p className="text-sm font-medium">Role-Based Access</p>
              <p className="text-xs text-muted-foreground">Control permissions per role</p>
            </div>
            <div className="flex flex-col items-center rounded-lg border p-4">
              <Clock className="mb-2 h-6 w-6 text-primary" />
              <p className="text-sm font-medium">Activity Logs</p>
              <p className="text-xs text-muted-foreground">Track team actions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
