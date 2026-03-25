"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChartCard } from "@/components/dashboard/chart-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EngagementMetrics, ApiResponse } from "@/types";
import { Users, Calendar, UserX, AlertCircle } from "lucide-react";
import { getEngagementMetrics, ApiError } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";

export default function EngagementPage() {
  const [data, setData] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'auth' | 'server' | 'network'>('network');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const response = await getEngagementMetrics() as ApiResponse<EngagementMetrics>;
      
      if (response?.success && response.data) {
        setData(response.data);
        setError(null);
      } else {
        setData(null);
        setError(response?.message || "Failed to load engagement metrics");
        setErrorType('server');
      }
    } catch (err: unknown) {
      console.error("Error fetching engagement metrics:", err);
      const message = err instanceof Error ? err.message : String(err);

      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorType('auth');
          setError('You need to login to view this data');
        } else if (err.status >= 500) {
          setErrorType('server');
          setError(err.message);
        } else {
          setErrorType('network');
          setError(err.message || "Failed to fetch engagement metrics");
        }
      } else {
        setErrorType('network');
        setError(message || "Failed to fetch engagement metrics");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading engagement metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engagement & Utilization</h1>
          <p className="text-muted-foreground">Track employee platform usage and participation metrics</p>
        </div>
        <Card className={errorType === 'auth' ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20" : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${errorType === 'auth' ? 'text-yellow-900 dark:text-yellow-400' : 'text-red-900 dark:text-red-400'}`}>
              <AlertCircle className="h-5 w-5" />
              {errorType === 'auth' ? 'Authentication Required' : 'Error Loading Data'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{error}</p>
            <div className="flex gap-2">
              {errorType === 'auth' && !isAuthenticated ? (
                <Button onClick={() => router.push('/login')} size="sm">Go to Login</Button>
              ) : (
                <Button onClick={() => fetchData()} size="sm" disabled={loading}>
                  {loading ? 'Retrying...' : 'Retry'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return <div>Error loading data</div>;
  }

  // Map login_trends to chart format
  const loginTrends = (data.login_trends || []).map((item) => ({
    date: item.date,
    count: item.logins,
  }));

  // Calculate attendance rate from completed and total_booked
  const completionRate = data.appointment_metrics?.completed && data.appointment_metrics?.total_booked
    ? ((data.appointment_metrics.completed / data.appointment_metrics.total_booked) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Engagement & Utilization
        </h1>
        <p className="text-muted-foreground">
          Track employee platform usage and participation metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Weekly Active Users"
          value={(data.weekly_active_users || 0).toLocaleString()}
          icon={Users}
          description="Active in last 7 days"
        />
        <MetricCard
          title="Monthly Active Users"
          value={(data.monthly_active_users || 0).toLocaleString()}
          icon={Users}
          description="Active in last 30 days"
        />
        <MetricCard
          title="Appointment Completion"
          value={`${completionRate}%`}
          icon={Calendar}
          description={`${data.appointment_metrics?.completed || 0} of ${data.appointment_metrics?.total_booked || 0} completed`}
        />
        <MetricCard
          title="30+ Days Inactive"
          value={data.inactivity_flags?.["30_days"] || 0}
          icon={UserX}
          description="Require re-engagement"
        />
      </div>

      {/* Login Frequency Trend */}
      <ChartCard
        title="Login Frequency Trend"
        data={loginTrends}
        type="line"
        dataKey="count"
        xAxisKey="date"
        description="Daily active users over time"
      />

      {/* Appointment Statistics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Booked</span>
              <span className="text-2xl font-bold">
                {data.appointment_metrics?.total_booked || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">
                Completed
              </span>
              <span className="text-2xl font-bold text-green-600">
                {data.appointment_metrics?.completed || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-600">No-Show Rate</span>
              <span className="text-2xl font-bold text-red-600">
                {data.appointment_metrics?.no_show_rate?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-xl font-bold">{completionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inactivity Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Inactivity Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">30+ Days Inactive</span>
                  <span className="text-sm font-bold">
                    {data.inactivity_flags?.["30_days"] || 0}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${
                        ((data.inactivity_flags?.["30_days"] || 0) / Math.max(data.monthly_active_users || 1, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">60+ Days Inactive</span>
                  <span className="text-sm font-bold">
                    {data.inactivity_flags?.["60_days"] || 0}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${
                        ((data.inactivity_flags?.["60_days"] || 0) / Math.max(data.monthly_active_users || 1, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">90+ Days Inactive</span>
                  <span className="text-sm font-bold">
                    {data.inactivity_flags?.["90_days"] || 0}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${
                        ((data.inactivity_flags?.["90_days"] || 0) / Math.max(data.monthly_active_users || 1, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
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
