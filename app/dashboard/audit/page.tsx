"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getAccessLogs, getExportAuditLogs } from "@/lib/api-client";
import { PageLoading } from "@/components/ui/page-loading";
import { PageError } from "@/components/ui/page-error";
import { useApiQuery } from "@/hooks/useApiQuery";
import { ApiResponse } from "@/types";

interface AuditLog {
  id: number;
  activity_type: string;
  description: string;
  user_id: number;
  created_at: string;
  activity_data?: Record<string, unknown>;
}

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface ExportLog {
  filename?: string;
  data?: { filename?: string; total_records?: number };
  total_records?: number;
  created_at?: string;
}

export default function AuditLogsPage() {
  const [accessPage, setAccessPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("");

  // â€”â€”â€” Access logs â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
  const {
    data: accessData,
    loading: accessLoading,
    error: accessError,
    errorType: accessErrorType,
    retry: retryAccessLogs,
  } = useApiQuery(async () => {
    const params: { per_page: number; date_start?: string } = { per_page: 20 };
    if (dateFilter) params.date_start = dateFilter;
    const response = (await getAccessLogs(params)) as ApiResponse<AuditLog[]> & { meta?: PaginationMeta };
    if (!response?.success) throw new Error("Failed to load access logs");
    return { logs: (response.data ?? []) as AuditLog[], meta: (response as { meta?: PaginationMeta }).meta ?? null };
  }, [accessPage, dateFilter]);

  const accessLogs = accessData?.logs ?? [];
  const accessMeta = accessData?.meta ?? null;

  // â€”â€”â€” Export logs â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
  const { data: exportLogsData, loading: exportLoading } = useApiQuery(async () => {
    const response = (await getExportAuditLogs()) as ApiResponse<ExportLog[]>;
    return response?.success ? (response.data ?? []) : [];
  }, []);

  const exportLogs = exportLogsData ?? [];

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "login": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "logout": return "bg-muted text-muted-foreground";
      case "data_export": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "settings_change": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Monitor access activity and data exports for your organization</p>
      </div>

      <Tabs defaultValue="access" className="space-y-4">
        <TabsList>
          <TabsTrigger value="access">Access Logs</TabsTrigger>
          <TabsTrigger value="exports">Export History</TabsTrigger>
        </TabsList>

        {/* Access Logs Tab */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFilter">Filter from date</Label>
                  <Input
                    id="dateFilter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
                <Button onClick={() => { setAccessPage(1); retryAccessLogs(); }}>
                  <Search className="h-4 w-4 mr-2" /> Search
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {accessLoading ? (
                <PageLoading message="Loading access logsâ€¦" />
              ) : accessError ? (
                <PageError error={accessError} errorType={accessErrorType} onRetry={retryAccessLogs} />
              ) : accessLogs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No access logs found</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 font-medium">Type</th>
                          <th className="pb-2 font-medium">Description</th>
                          <th className="pb-2 font-medium">User ID</th>
                          <th className="pb-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessLogs.map((log) => (
                          <tr key={log.id} className="border-b last:border-0">
                            <td className="py-3">
                              <Badge className={getActivityBadge(log.activity_type)}>
                                {log.activity_type}
                              </Badge>
                            </td>
                            <td className="py-3">{log.description}</td>
                            <td className="py-3">{log.user_id}</td>
                            <td className="py-3 text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {accessMeta && accessMeta.last_page > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {accessMeta.current_page} of {accessMeta.last_page} &middot; {accessMeta.total} total
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={accessMeta.current_page <= 1}
                          onClick={() => setAccessPage((p) => p - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={accessMeta.current_page >= accessMeta.last_page}
                          onClick={() => setAccessPage((p) => p + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export History Tab */}
        <TabsContent value="exports">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
            </CardHeader>
            <CardContent>
              {exportLoading ? (
                <PageLoading message="Loading export historyâ€¦" />
              ) : exportLogs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No export history</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium">Filename</th>
                        <th className="pb-2 font-medium">Records</th>
                        <th className="pb-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportLogs.map((log, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-3">{log.filename ?? log.data?.filename ?? "N/A"}</td>
                          <td className="py-3">{log.total_records ?? log.data?.total_records ?? "â€”"}</td>
                          <td className="py-3 text-muted-foreground">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : "â€”"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


interface AuditLog {
  id: number;
  activity_type: string;
  description: string;
  user_id: number;
  created_at: string;
  activity_data?: Record<string, any>;
}

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}
