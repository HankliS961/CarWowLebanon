"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { trpc } from "@/lib/trpc/client";

const PAGE_SIZE = 50;

/** Admin audit log page showing all admin actions with filtering and pagination. */
export default function AdminLogsPage() {
  const t = useTranslations("admin.logs");
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs, isLoading } = trpc.admin.getLogs.useQuery(
    { page, limit: PAGE_SIZE },
    { retry: false }
  );

  const logList = logs ?? [];

  // Client-side filtering: action filter + search on action/targetType
  const filteredLogs = logList.filter((log) => {
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      log.action.toLowerCase().includes(query) ||
      (log.targetType ?? "").toLowerCase().includes(query) ||
      (log.admin.name ?? "").toLowerCase().includes(query) ||
      (log.admin.email ?? "").toLowerCase().includes(query);
    return matchesAction && matchesSearch;
  });

  // Paginate the filtered results client-side
  const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(logList.map((log) => log.action)));

  // Calculate total pages from filtered data length
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

  const actionColor: Record<string, string> = {
    VERIFY_DEALER: "bg-green-100 text-green-700",
    SUSPEND_USER: "bg-red-100 text-red-700",
    DELETE_LISTING: "bg-red-100 text-red-700",
    REJECT_DEALER: "bg-red-100 text-red-700",
    SUSPEND_DEALER: "bg-red-100 text-red-700",
    CHANGE_USER_ROLE: "bg-purple-100 text-purple-700",
    MODERATE_LISTING_APPROVE: "bg-green-100 text-green-700",
    MODERATE_LISTING_REMOVE: "bg-red-100 text-red-700",
    MODERATE_LISTING_WARN: "bg-amber-100 text-amber-700",
    TOGGLE_FEATURED: "bg-amber-100 text-amber-700",
    PUBLISH_CONTENT: "bg-blue-100 text-blue-700",
    UPDATE_SETTINGS: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("filterByAction")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((action) => (
              <SelectItem key={action} value={action}>
                {action.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        {paginatedLogs.length === 0 && !isLoading ? (
          <div className="p-6">
            <EmptyState icon={ScrollText} title="No audit logs found" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="hidden md:table-cell">Details</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <div className="h-10 animate-pulse rounded bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  : paginatedLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <p className="text-sm font-medium">
                            {log.admin.name || log.admin.email}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              actionColor[log.action] ??
                              "bg-gray-100 text-gray-700"
                            }
                          >
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.targetType && (
                            <span className="text-sm text-muted-foreground">
                              {log.targetType}
                              {log.targetId && (
                                <span className="ml-1 text-xs">
                                  ({log.targetId.slice(0, 8)}...)
                                </span>
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden max-w-[200px] md:table-cell">
                          {log.details && (
                            <p className="truncate text-xs text-muted-foreground">
                              {JSON.stringify(log.details)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={filteredLogs.length}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </Card>
    </div>
  );
}
