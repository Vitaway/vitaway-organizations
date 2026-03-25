"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, TrendingUp, AlertCircle } from "lucide-react";
import { DashboardMetrics, ApiResponse } from "@/types";
import { getDashboardMetrics, ApiError } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'auth' | 'server' | 'network'>('network');
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  async function fetchMetrics() {
    try {
      setLoading(true);
      const response = await getDashboardMetrics() as ApiResponse<DashboardMetrics>;

      if (response?.success && response.data) {
        // Map snake_case API response to camelCase TypeScript interface
        const apiData = response.data as unknown as {
          total_employees?: number;
          active_users?: number;
          inactive_users?: number;
          engagement_rate?: number;
          program_participation_rate?: number;
          risk_distribution?: { low_risk?: number; medium_risk?: number; high_risk?: number; critical_risk?: number };
          outcome_indicators?: { avg_health_improvement?: number; program_completion_rate?: number; cost_savings_estimated?: number };
        };
        setMetrics({
          totalEmployees: apiData.total_employees ?? 0,
          activeUsers: apiData.active_users ?? 0,
          inactiveUsers: apiData.inactive_users ?? 0,
          engagementRate: apiData.engagement_rate ?? 0,
          programParticipationRate: apiData.program_participation_rate ?? 0,
          riskDistribution: {
            low: apiData.risk_distribution?.low_risk ?? 0,
            medium: apiData.risk_distribution?.medium_risk ?? 0,
            high: apiData.risk_distribution?.high_risk ?? 0,
            critical: apiData.risk_distribution?.critical_risk ?? 0,
          },
          outcomeIndicators: apiData.outcome_indicators ? {
            avgHealthImprovement: apiData.outcome_indicators.avg_health_improvement ?? 0,
            programCompletionRate: apiData.outcome_indicators.program_completion_rate ?? 0,
            costSavingsEstimated: apiData.outcome_indicators.cost_savings_estimated ?? 0,
          } : undefined,
        });
        setError(null);
      } else {
        setMetrics(null);
        setError(response?.message || "Dashboard API returned an error");
      }
    } catch (err: unknown) {
      console.error("Error fetching metrics:", err);
      const message = err instanceof Error ? err.message : String(err);

      // Detect error type
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorType('auth');
          setError('You need to login to view dashboard metrics');
        } else if (err.status >= 500) {
          setErrorType('server');
          setError(err.message);
        } else {
          setErrorType('network');
          setError(err.message || "Failed to fetch dashboard metrics");
        }
      } else {
        setErrorType('network');
        setError(message || "Failed to fetch dashboard metrics");
      }
      
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isDev = process.env.NODE_ENV !== "production";
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Key metrics and performance indicators for your organization</p>
        </div>
        
        {errorType === 'auth' ? (
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-400">
                <AlertCircle className="h-5 w-5" />
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                You need to be logged in to view dashboard metrics.
                {!isAuthenticated && " Please login to continue."}
              </p>
              <div className="flex gap-2">
                {!isAuthenticated ? (
                  <Button onClick={() => router.push('/login')} size="sm">
                    Go to Login
                  </Button>
                ) : (
                  <Button onClick={() => fetchMetrics()} size="sm" disabled={loading}>
                    {loading ? 'Retrying...' : 'Retry'}
                  </Button>
                )}
              </div>
              {user && (
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Logged in as: {user.email}
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                {errorType === 'server' ? 'Backend Error' : 'Connection Error'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-red-800 dark:text-red-300">
              <p className="font-medium">
                {errorType === 'server' 
                  ? 'The backend encountered an error processing your request.' 
                  : 'We couldn\'t connect to the backend server.'}
              </p>
              <div className="flex gap-2 items-center">
                <button
                  className="inline-flex items-center rounded bg-red-600 dark:bg-red-700 px-3 py-1 text-white text-sm hover:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  onClick={() => setShowDetails((s) => !s)}
                >
                  {showDetails ? "Hide details" : "Show details"}
                </button>
                <button
                  className="inline-flex items-center rounded border border-red-300 bg-card px-3 py-1 text-sm text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  onClick={() => fetchMetrics()}
                  disabled={loading}
                >
                  {loading ? "Retrying..." : "Retry"}
                </button>
              </div>

              {showDetails && (
                <pre className="whitespace-pre-wrap wrap-break-word bg-red-100 dark:bg-red-900/30 p-3 rounded text-xs text-red-900 dark:text-red-300">
                  {isDev ? error : "An internal error occurred. Contact support."}
                </pre>
              )}

              <div>
                <p className="font-semibold mb-1">Troubleshooting</p>
                <ul className="list-disc list-inside ml-2 text-xs space-y-1">
                  <li>Backend URL: <code className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">http://127.0.0.1:8000/api/organization</code></li>
                  <li>Endpoint: <code className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">GET /dashboard/overview</code></li>
                  {errorType === 'server' && (
                    <li className="text-yellow-700 dark:text-yellow-400 font-medium">Check Laravel logs: <code className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">storage/logs/laravel.log</code></li>
                  )}
                  {errorType === 'network' && (
                    <li className="text-yellow-700 dark:text-yellow-400 font-medium">Ensure Laravel is running: <code className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">php artisan serve</code></li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (!metrics) {
    return <div>Error loading metrics</div>;
  }

  const riskDistributionData = [
    { name: "Low", value: metrics.riskDistribution.low },
    { name: "Medium", value: metrics.riskDistribution.medium },
    { name: "High", value: metrics.riskDistribution.high },
    { name: "Critical", value: metrics.riskDistribution.critical },
  ];

  const engagementTrendData = [
    { name: "Current", value: metrics.engagementRate },
  ];

  const outcomeData = metrics.outcomeIndicators ? [
    { name: "Health Improvement", value: metrics.outcomeIndicators.avgHealthImprovement },
    { name: "Completion Rate", value: metrics.outcomeIndicators.programCompletionRate },
    { name: "Cost Savings", value: metrics.outcomeIndicators.costSavingsEstimated },
  ] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Monitor your organization&apos;s health and engagement metrics
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          icon={AlertCircle}
          description="Enrolled in at least one program"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
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

      {/* Outcome Indicators (if available) */}
      {outcomeData && (
        <div className="grid gap-6">
          <ChartCard
            title="Health Outcome Indicators"
            data={outcomeData}
            type="bar"
            colors={["#10b981", "#3b82f6", "#ef4444"]}
            description="Employee health outcome trends"
          />
        </div>
      )}

      {/* Additional Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Estimated Cost Savings
          </h3>
          <p className="mt-2 text-2xl font-bold">
            ${metrics.outcomeIndicators?.costSavingsEstimated?.toLocaleString() ?? '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Projected annual savings from preventive care
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Avg Health Improvement
          </h3>
          <p className="mt-2 text-2xl font-bold">
            {metrics.outcomeIndicators?.avgHealthImprovement ?? '—'}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Aggregated population health indicator
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Program Completion Rate
          </h3>
          <p className="mt-2 text-2xl font-bold">
            {metrics.outcomeIndicators?.programCompletionRate ?? '—'}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Programs completed across organization
          </p>
        </div>
      </div>
    </div>
  );
}
