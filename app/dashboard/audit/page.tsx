/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getAccessLogs, getExportAuditLogs } from "@/lib/api-client";

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

export default function AuditLogsPage() {
  // Access logs tab
  const [accessLogs, setAccessLogs] = useState<AuditLog[]>([]);
  const [accessMeta, setAccessMeta] = useState<PaginationMeta | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessPage, setAccessPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("");

  // Export logs tab
  const [exportLogs, setExportLogs] = useState<any[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchAccessLogs = useCallback(async () => {
    try {
      setAccessLoading(true);
      setError(null);
      const params: any = { per_page: 20 };
      if (dateFilter) params.date_start = dateFilter;

      const response = (await getAccessLogs(params)) as any;
      if (response?.success) {
        setAccessLogs(response.data || []);
        setAccessMeta(response.meta || null);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to load access logs");
    } finally {
      setAccessLoading(false);
    }
  }, [dateFilter]);

  const fetchExportLogs = useCallback(async () => {
    try {
      setExportLoading(true);
      const response = (await getExportAuditLogs()) as any;
      if (response?.success) {
        setExportLogs(response.data || []);
      }
    } catch {
      // Export logs may not be available
    } finally {
      setExportLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccessLogs();
  }, [accessPage, fetchAccessLogs]);

  useEffect(() => {
    fetchExportLogs();
  }, [fetchExportLogs]);

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "login":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "logout":
        return "bg-muted text-muted-foreground";
      case "data_export":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "settings_change":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Monitor access activity and data exports for your organization</p>
      </div>

      <Tabs defaultValue="access" className="space-y-4">
        <TabsList>
          <TabsTrigger value="access">Access Logs</TabsTrigger>
          <TabsTrigger value="exports">Export History</TabsTrigger>
        </TabsList>

        {/* Access Logs Tab */}
        <TabsContent value="access" className="space-y-4">
          {/* Filter */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFilter">Filter from date</Label>
                  <Input
                    id="dateFilter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
                <Button onClick={() => { setAccessPage(1); fetchAccessLogs(); }}>
                  <Search className="h-4 w-4 mr-2" /> Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
          )}

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {accessLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                </div>
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

                  {/* Pagination */}
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
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                </div>
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
                      {exportLogs.map((log: any, idx: number) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-3">{log.filename || log.data?.filename || "N/A"}</td>
                          <td className="py-3">{log.total_records || log.data?.total_records || "—"}</td>
                          <td className="py-3 text-muted-foreground">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
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
