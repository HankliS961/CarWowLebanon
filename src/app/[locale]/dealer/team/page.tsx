"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Users, Plus, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "pending";
  joinedAt: string;
}

/** Dealer team management page for inviting and managing team members. */
export default function DealerTeamPage() {
  const t = useTranslations("dealer.team");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("salesRep");
  const [removeId, setRemoveId] = useState<string | null>(null);

  // Placeholder data
  const members: TeamMember[] = [];

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    toast.success(t("inviteSuccess"));
    setShowInvite(false);
    setInviteEmail("");
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")}>
        <Button onClick={() => setShowInvite(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("inviteMember")}
        </Button>
      </PageHeader>

      <Card>
        {members.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title={t("empty")}
              description={t("emptyDescription")}
              actionLabel={t("inviteMember")}
              onAction={() => setShowInvite(true)}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={member.status === "active" ? "default" : "outline"}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRemoveId(member.id)}
                      aria-label="Remove member"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Invite dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("inviteMember")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-9"
                  placeholder="team@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("role")}</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="salesRep">{t("salesRep")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
              {t("invite")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <ConfirmDialog
        open={!!removeId}
        onOpenChange={(open) => !open && setRemoveId(null)}
        title="Remove Team Member"
        description="Are you sure you want to remove this team member? They will lose access to the dealer portal."
        confirmLabel={t("remove")}
        variant="destructive"
        onConfirm={() => setRemoveId(null)}
      />
    </div>
  );
}
