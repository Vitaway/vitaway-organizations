"use client";

import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { PageLoading } from "@/components/ui/page-loading";
import { PageError } from "@/components/ui/page-error";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Report, ExportHistory, ApiResponse } from "@/types";
import { FileText, Download, Calendar } from "lucide-react";
import { getReports, generateReport, downloadReport, getExportAuditLogs } from "@/lib/api-client";
import { useApiQuery } from "@/hooks/useApiQuery";

export default function ReportsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // â€”â€”â€” Report list (read) â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
  const {
    data: reportData,
    loading,
    error,
    errorType,
    retry: refetchReports,
  } = useApiQuery(async () => {
    const res = (await getReports({ page: currentPage })) as ApiResponse<{ data: Report[]; last_page: number }>;
    if (!res?.success || !res.data) throw new Error(res?.message || "Failed to load reports.");
    return { reports: res.data.data || [], totalPages: res.data.last_page || 1 };
  }, [currentPage]);

  const reports = reportData?.reports ?? [];
  const totalPages = reportData?.totalPages ?? 1;

  // â€”â€”â€” Export history (read) â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
  const { data: exportHistoryData, loading: exportLoading } = useApiQuery(async () => {
    const res = (await getExportAuditLogs()) as ApiResponse<ExportHistory[] | { data: ExportHistory[] }>;
    if (!res?.success || !res.data) return [];
    return Array.isArray(res.data) ? res.data : (res.data as { data: ExportHistory[] }).data ?? [];
  }, []);

  const exportHistory = exportHistoryData ?? [];

  // â€”â€”â€” Generate form state â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
  const [reportType, setReportType] = useState<string>("");
  const [reportFormat, setReportFormat] = useState<string>("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);

  async function handleGenerateReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportType || !reportFormat) {
      setGenerateError("Please select a report type and format");
      return;
    }
    setGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(null);
    try {
      const response = await generateReport({
        report_type: reportType as "population_health" | "engagement" | "roi" | "risk_summary" | "program_completion",
        format: reportFormat as "pdf" | "excel" | "csv",
        ...(dateStart && { date_range_start: dateStart }),
        ...(dateEnd && { date_range_end: dateEnd }),
      }) as ApiResponse<unknown>;

      if (response?.success) {
        setGenerateSuccess("Report generation started. Check the Generated Reports tab.");
        setReportType("");
        setReportFormat("");
        setDateStart("");
        setDateEnd("");
        refetchReports();
      } else {
        setGenerateError(response?.message || "Failed to generate report");
      }
    } catch (err: unknown) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadReport(report: Report) {
    try {
      const blob = await downloadReport(report.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${report.reportType}-${report.id}.${report.format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: unknown) {
      console.error("Download failed:", err);
    }
  }

  const reportColumns = [
    { key: "reportType", label: "Report Type" },
    {
      key: "format",
      label: "Format",
      render: (value: unknown) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {String(value)}
        </span>
      ),
    },
    {
      key: "generatedAt",
      label: "Generated",
      render: (value: unknown) => new Date(String(value)).toLocaleString(),
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => {
        const v = String(value);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              v === "COMPLETED"
                ? "bg-green-100 text-green-800"
                : v === "GENERATING"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {v}
          </span>
        );
      },
    },
    {
      key: "downloadUrl",
      label: "Action",
      render: (_value: unknown, row: Report) =>
        row.status === "COMPLETED" ? (
          <Button variant="outline" size="sm" onClick={() => handleDownloadReport(row)}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        ) : null,
    },
  ];

  const exportColumns = [
    { key: "dataType", label: "Data Type" },
    { key: "format", label: "Format" },
    { key: "recordCount", label: "Records", render: (value: unknown) => Number(value).toLocaleString() },
    { key: "exportedBy", label: "Exported By" },
    { key: "exportedAt", label: "Exported At", render: (value: unknown) => new Date(String(value)).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports &amp; Exports</h1>
        <p className="text-muted-foreground">
          Generate reports and export data for internal review and compliance
        </p>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          <TabsTrigger value="generate">Generate New Report</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>View and download previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <PageLoading message="Loading reports" />
              ) : error ? (
                <PageError error={error} errorType={errorType} onRetry={refetchReports} />
              ) : (
                <DataTable
                  data={reports}
                  columns={reportColumns}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  emptyMessage="No reports generated yet"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>Create a formal summary report for internal review</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleGenerateReport}>
                {generateError && (
                  <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-sm">
                    {generateError}
                  </div>
                )}
                {generateSuccess && (
                  <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-sm">
                    {generateSuccess}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Report Type *</Label>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(
                        [
                          { value: "population_health", label: "Population Health Summary", desc: "Aggregated health metrics and risk distribution" },
                          { value: "engagement", label: "Engagement Analytics", desc: "Platform usage and participation metrics" },
                          { value: "program_completion", label: "Program Completion", desc: "Employee program progress and completion rates" },
                          { value: "roi", label: "ROI Analysis", desc: "Return on investment for wellness programs" },
                          { value: "risk_summary", label: "Risk Summary", desc: "Health risk stratification overview" },
                        ] as const
                      ).map(({ value, label, desc }) => (
                        <label key={value} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                          <input
                            type="radio"
                            name="reportType"
                            value={value}
                            checked={reportType === value}
                            onChange={(e) => setReportType(e.target.value)}
                            className="h-4 w-4"
                          />
                          <div>
                            <p className="font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Format *</Label>
                    <div className="flex gap-3">
                      {(["pdf", "excel", "csv"] as const).map((fmt) => (
                        <label key={fmt} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="reportFormat"
                            value={fmt}
                            checked={reportFormat === fmt}
                            onChange={(e) => setReportFormat(e.target.value)}
                            className="h-4 w-4"
                          />
                          <span className="font-medium uppercase text-sm">{fmt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dateStart">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Date Range Start
                      </Label>
                      <input
                        id="dateStart"
                        type="date"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateEnd">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Date Range End
                      </Label>
                      <input
                        id="dateEnd"
                        type="date"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={generating || !reportType || !reportFormat}>
                  {generating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>Audit trail for all data exports from your organization</CardDescription>
            </CardHeader>
            <CardContent>
              {exportLoading ? (
                <PageLoading message="Loading export history" />
              ) : (
                <DataTable
                  data={exportHistory}
                  columns={exportColumns}
                  currentPage={1}
                  totalPages={1}
                  onPageChange={() => {}}
                  emptyMessage="No export history recorded"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
