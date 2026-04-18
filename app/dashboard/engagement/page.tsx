"use client";

import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageLoading } from "@/components/ui/page-loading";
import { PageError } from "@/components/ui/page-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EngagementMetrics, ApiResponse } from "@/types";
import { Users, Calendar, UserX } from "lucide-react";
import { getEngagementMetrics } from "@/lib/api-client";
import { useApiQuery } from "@/hooks/useApiQuery";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function loadEngagement(): Promise<EngagementMetrics> {
  const response = (await getEngagementMetrics()) as ApiResponse<EngagementMetrics>;
  if (!response?.success || !response.data) {
    throw new Error(response?.message || "Failed to load engagement metrics.");
  }
  return response.data;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EngagementPage() {
  const { data, loading, error, errorType, retry } = useApiQuery(loadEngagement);

  if (loading) return <PageLoading message="Loading engagement metrics" />;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Engagement &amp; Utilization</h1>
          <p className="text-sm text-muted-foreground">Track employee platform usage and participation metrics</p>
        </div>
        <PageError error={error} errorType={errorType} onRetry={retry} />
      </div>
    );
  }

  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loginTrends = ((data as any).login_trends ?? []).map((item: { date: string; logins: number }) => ({
    date: item.date,
    count: item.logins,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appt = (data as any).appointment_metrics as {
    completed?: number;
    total_booked?: number;
    no_show_rate?: number;
  } | undefined;

  const completionRate =
    appt?.completed && appt?.total_booked
      ? ((appt.completed / appt.total_booked) * 100).toFixed(1)
      : "0";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inactivity = (data as any).inactivity_flags as Record<string, number> | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Engagement &amp; Utilization</h1>
        <p className="text-sm text-muted-foreground">
          Track employee platform usage and participation metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Weekly Active Users"
          value={(d.weekly_active_users ?? 0).toLocaleString()}
          icon={Users}
          description="Active in last 7 days"
        />
        <MetricCard
          title="Monthly Active Users"
          value={(d.monthly_active_users ?? 0).toLocaleString()}
          icon={Users}
          description="Active in last 30 days"
        />
        <MetricCard
          title="Appointment Completion"
          value={`${completionRate}%`}
          icon={Calendar}
          description={`${appt?.completed ?? 0} of ${appt?.total_booked ?? 0} completed`}
        />
        <MetricCard
          title="30+ Days Inactive"
          value={inactivity?.["30_days"] ?? 0}
          icon={UserX}
          description="Require re-engagement"
        />
      </div>

      {/* Login Trend */}
      <ChartCard
        title="Login Frequency Trend"
        data={loginTrends}
        type="line"
        dataKey="count"
        xAxisKey="date"
        description="Daily active users over time"
      />

      {/* Appointments + Inactivity */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Booked</span>
              <span className="text-2xl font-bold">{appt?.total_booked ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">Completed</span>
              <span className="text-2xl font-bold text-green-600">{appt?.completed ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-600">No-Show Rate</span>
              <span className="text-2xl font-bold text-red-600">
                {appt?.no_show_rate?.toFixed(1) ?? 0}%
              </span>
            </div>
            <div className="pt-4 border-t flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-xl font-bold">{completionRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inactivity Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {(["30_days", "60_days"] as const).map((key) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {key === "30_days" ? "30+" : "60+"} Days Inactive
                    </span>
                    <span className="text-sm font-bold">{inactivity?.[key] ?? 0}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${key === "30_days" ? "bg-yellow-500" : "bg-orange-500"}`}
                      style={{
                        width: `${
                          ((inactivity?.[key] ?? 0) /
                            Math.max(d.monthly_active_users ?? 1, 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground pt-3 border-t">
              Consider re-engagement campaigns for inactive users
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

