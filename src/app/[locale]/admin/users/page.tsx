"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Users, MoreHorizontal, Shield, Ban, CheckCircle } from "lucide-react";
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
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { trpc } from "@/lib/trpc/client";

/** Admin user management page with search, role filter, and user actions. */
export default function AdminUsersPage() {
  const t = useTranslations("admin.users");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.admin.listUsers.useQuery(
    { page, limit: 25 },
    { retry: false }
  );

  const users = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const filteredUsers =
    roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  const roleColor: Record<string, string> = {
    BUYER: "bg-blue-100 text-blue-700",
    SELLER: "bg-green-100 text-green-700",
    DEALER: "bg-purple-100 text-purple-700",
    ADMIN: "bg-red-100 text-red-700",
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
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {t("activate")}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}
