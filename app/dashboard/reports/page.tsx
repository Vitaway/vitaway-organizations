"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/data-table";
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

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Generate form state
  const [reportType, setReportType] = useState<string>("");
  const [reportFormat, setReportFormat] = useState<string>("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);

  async function fetchReports() {
    try {
      setLoading(true);
      const response = await getReports({ page: currentPage }) as ApiResponse<{ data: Report[]; last_page: number }>;

      if (response?.success && response.data) {
        setReports(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
      } else {
        setReports([]);
      }
    } catch (err: unknown) {
      console.error("Error fetching reports:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
    fetchExportHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  async function fetchExportHistory() {
    try {
      const response = await getExportAuditLogs() as ApiResponse<ExportHistory[] | { data: ExportHistory[] }>;
      if (response?.success && response.data) {
        setExportHistory(Array.isArray(response.data) ? response.data : response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching export history:", err);
    }
  }

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
        fetchReports();
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
    {
      key: "reportType",
      label: "Report Type",
    },
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
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${v === "COMPLETED"
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
      render: (value: unknown, row: Report) =>
        row.status === "COMPLETED" ? (
          <Button variant="outline" size="sm" onClick={() => handleDownloadReport(row)}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        ) : null,
    },
  ];

  const exportColumns = [
    {
      key: "dataType",
      label: "Data Type",
    },
    {
      key: "format",
      label: "Format",
    },
    {
      key: "recordCount",
      label: "Records",
      render: (value: unknown) => Number(value).toLocaleString(),
    },
    {
      key: "exportedBy",
      label: "Exported By",
    },
    {
      key: "exportedAt",
      label: "Exported At",
      render: (value: unknown) => new Date(String(value)).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Reports & Exports
        </h1>
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
              <CardDescription>
                View and download previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
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
              <CardDescription>
                Create a formal summary report for internal review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleGenerateReport}>
                {generateError && (
                  <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-sm">{generateError}</div>
                )}
                {generateSuccess && (
                  <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-sm">{generateSuccess}</div>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Report Type *</Label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                        <input
                          type="radio"
                          name="reportType"
                          value="population_health"
                          checked={reportType === "population_health"}
                          onChange={(e) => setReportType(e.target.value)}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">Population Health Summary</p>
                          <p className="text-xs text-muted-foreground">
                            Aggregated health metrics and risk distribution
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                        <input
                          type="radio"
                          name="reportType"
                          value="engagement"
                          checked={reportType === "engagement"}
                          onChange={(e) => setReportType(e.target.value)}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">Engagement Analytics</p>
                          <p className="text-xs text-muted-foreground">
                            Platform usage and participation metrics
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                        <input
                          type="radio"
                          name="reportType"
                          value="program_completion"
                          checked={reportType === "program_completion"}
                          onChange={(e) => setReportType(e.target.value)}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">Program Completion</p>
                          <p className="text-xs text-muted-foreground">
                            Health program participation and outcomes
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                        <input
                          type="radio"
                          name="reportType"
                          value="risk_summary"
                          checked={reportType === "risk_summary"}
                          onChange={(e) => setReportType(e.target.value)}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">Risk Summary</p>
                          <p className="text-xs text-muted-foreground">
                            Comprehensive risk overview
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Output Format *</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="format"
                          value="pdf"
                          checked={reportFormat === "pdf"}
                          onChange={(e) => setReportFormat(e.target.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">PDF (Formatted Report)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="format"
                          value="csv"
                          checked={reportFormat === "csv"}
                          onChange={(e) => setReportFormat(e.target.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">CSV (Data Export)</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={dateStart}
                          onChange={(e) => setDateStart(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">to</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={dateEnd}
                          onChange={(e) => setDateEnd(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setReportType(""); setReportFormat(""); setDateStart(""); setDateEnd(""); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={generating}>
                    <FileText className="h-4 w-4 mr-2" />
                    {generating ? "Generating..." : "Generate Report"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>
                Audit trail of all data exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <DataTable
                  data={exportHistory}
                  columns={exportColumns}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  emptyMessage="No export history available"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
