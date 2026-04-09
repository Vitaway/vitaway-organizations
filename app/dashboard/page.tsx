"use client";

import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { PageLoading } from "@/components/ui/page-loading";
import { PageError } from "@/components/ui/page-error";
import { Users, Activity, TrendingUp, BookOpen } from "lucide-react";
import { DashboardMetrics, ApiResponse } from "@/types";
import { getDashboardMetrics } from "@/lib/api-client";
import { useApiQuery } from "@/hooks/useApiQuery";

// ---------------------------------------------------------------------------
// Data fetching / mapping
// ---------------------------------------------------------------------------

async function loadMetrics(): Promise<DashboardMetrics> {
  const response = (await getDashboardMetrics()) as ApiResponse<DashboardMetrics>;

  if (!response?.success || !response.data) {
    throw new Error(response?.message || "Dashboard API returned an error.");
  }

  // Map snake_case API response to camelCase TypeScript interface
  const d = response.data as unknown as {
    total_employees?: number;
    active_users?: number;
    inactive_users?: number;
    engagement_rate?: number;
    program_participation_rate?: number;
    risk_distribution?: {
      low_risk?: number;
      medium_risk?: number;
      high_risk?: number;
      critical_risk?: number;
    };
    outcome_indicators?: {
      avg_health_improvement?: number;
      program_completion_rate?: number;
      cost_savings_estimated?: number;
    };
  };

  return {
    totalEmployees: d.total_employees ?? 0,
    activeUsers: d.active_users ?? 0,
    inactiveUsers: d.inactive_users ?? 0,
    engagementRate: d.engagement_rate ?? 0,
    programParticipationRate: d.program_participation_rate ?? 0,
    riskDistribution: {
      low: d.risk_distribution?.low_risk ?? 0,
      medium: d.risk_distribution?.medium_risk ?? 0,
      high: d.risk_distribution?.high_risk ?? 0,
      critical: d.risk_distribution?.critical_risk ?? 0,
    },
    outcomeIndicators: d.outcome_indicators
      ? {
          avgHealthImprovement: d.outcome_indicators.avg_health_improvement ?? 0,
          programCompletionRate: d.outcome_indicators.program_completion_rate ?? 0,
          costSavingsEstimated: d.outcome_indicators.cost_savings_estimated ?? 0,
        }
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardOverview() {
  const { data: metrics, loading, error, errorType, retry } = useApiQuery(loadMetrics);

  if (loading) return <PageLoading message="Loading dashboardâ€¦" />;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm">
            Key metrics and performance indicators for your organization
          </p>
        </div>
        <PageError error={error} errorType={errorType} onRetry={retry} />
      </div>
    );
  }

  if (!metrics) return null;

  const riskDistributionData = [
    { name: "Low", value: metrics.riskDistribution.low },
    { name: "Medium", value: metrics.riskDistribution.medium },
    { name: "High", value: metrics.riskDistribution.high },
    { name: "Critical", value: metrics.riskDistribution.critical },
  ];

  const engagementTrendData = [{ name: "Current", value: metrics.engagementRate }];

  const outcomeData = metrics.outcomeIndicators
    ? [
        { name: "Health Improvement", value: metrics.outcomeIndicators.avgHealthImprovement },
        { name: "Completion Rate", value: metrics.outcomeIndicators.programCompletionRate },
        { name: "Cost Savings", value: metrics.outcomeIndicators.costSavingsEstimated },
      ]
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">
          Monitor your organization&apos;s health and engagement metrics
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Employees"
          value={metrics.totalEmployees.toLocaleString()}
          icon={Users}
          description="Enrolled in platform"
        />
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers.toLocaleString()}
          icon={Activity}
          description={`${metrics.inactiveUsers} inactive`}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${metrics.engagementRate}%`}
          icon={TrendingUp}
          description="Last 30 days"
        />
        <MetricCard
          title="Program Participation"
          value={`${metrics.programParticipationRate}%`}
          icon={BookOpen}
          description="Enrolled in at least one program"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <ChartCard
          title="Risk Category Distribution"
          data={riskDistributionData}
          type="pie"
          colors={["#10b981", "#f59e0b", "#ef4444", "#dc2626"]}
          description="Employee risk categorization (non-diagnostic)"
        />
        <ChartCard
          title="Engagement Trend"
          data={engagementTrendData}
          type="line"
          description="Weekly engagement rate percentage"
        />
      </div>

      {/* Outcome Indicators */}
      {outcomeData && (
        <ChartCard
          title="Health Outcome Indicators"
          data={outcomeData}
          type="bar"
          colors={["#10b981", "#3b82f6", "#ef4444"]}
          description="Employee health outcome trends"
        />
      )}

      {/* Summary stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Estimated Cost Savings</h3>
          <p className="mt-2 text-2xl font-bold">
            ${metrics.outcomeIndicators?.costSavingsEstimated?.toLocaleString() ?? "â€”"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Projected annual savings from preventive care</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Avg Health Improvement</h3>
          <p className="mt-2 text-2xl font-bold">
            {metrics.outcomeIndicators?.avgHealthImprovement ?? "â€”"}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Aggregated population health indicator</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Program Completion Rate</h3>
          <p className="mt-2 text-2xl font-bold">
            {metrics.outcomeIndicators?.programCompletionRate ?? "â€”"}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Programs completed across organization</p>
        </div>
      </div>
    </div>
  );
}

