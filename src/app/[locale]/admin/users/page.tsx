"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Users, MoreHorizontal, Shield, Ban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { trpc } from "@/lib/trpc/client";

const ROLES = ["BUYER", "SELLER", "DEALER", "ADMIN"] as const;

/** Admin user management page with search, role filter, and user actions. */
export default function AdminUsersPage() {
  const t = useTranslations("admin.users");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Role edit dialog state
  const [editRoleUser, setEditRoleUser] = useState<{ id: string; name: string | null; currentRole: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.listUsers.useQuery(
    { page, limit: 25 },
    { retry: false }
  );

  const changeUserRole = trpc.admin.changeUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      utils.admin.listUsers.invalidate();
      setEditRoleUser(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const suspendUser = trpc.admin.suspendUser.useMutation({
    onSuccess: () => {
      toast.success("User suspended successfully");
      utils.admin.listUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const users = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  // Client-side filtering: role filter + search filter on name/email
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (u.name ?? "").toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query);
    return matchesRole && matchesSearch;
  });

  const roleColor: Record<string, string> = {
    BUYER: "bg-blue-100 text-blue-700",
    SELLER: "bg-green-100 text-green-700",
    DEALER: "bg-purple-100 text-purple-700",
    ADMIN: "bg-red-100 text-red-700",
  };

  const handleEditRole = (user: { id: string; name: string | null; role: string }) => {
    setEditRoleUser({ id: user.id, name: user.name, currentRole: user.role });
    setSelectedRole(user.role);
  };

  const handleConfirmRoleChange = () => {
    if (!editRoleUser || !selectedRole) return;
    changeUserRole.mutate({
      userId: editRoleUser.id,
      role: selectedRole as "BUYER" | "SELLER" | "DEALER" | "ADMIN",
    });
  };

  const handleSuspend = (userId: string) => {
    suspendUser.mutate({ userId, reason: "Suspended by admin" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="BUYER">Buyer</SelectItem>
            <SelectItem value="SELLER">Seller</SelectItem>
            <SelectItem value="DEALER">Dealer</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        {filteredUsers.length === 0 && !isLoading ? (
          <div className="p-6">
            <EmptyState icon={Users} title="No users found" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="hidden md:table-cell">Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <div className="h-10 animate-pulse rounded bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || "No name"}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={roleColor[user.role] ?? ""}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isVerified ? "default" : "outline"}>
                            {user.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditRole(user)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleSuspend(user.id)}
                                disabled={suspendUser.isPending}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                {t("suspend")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={total}
              pageSize={25}
            />
          </>
        )}
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={!!editRoleUser} onOpenChange={(open) => !open && setEditRoleUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change role for {editRoleUser?.name || "user"}
            </DialogTitle>
          </DialogHeader>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRoleChange}
              disabled={changeUserRole.isPending || selectedRole === editRoleUser?.currentRole}
            >
              {changeUserRole.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
