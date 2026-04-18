"use client";

import { ChartCard } from "@/components/dashboard/chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { PageError } from "@/components/ui/page-error";
import { ApiResponse } from "@/types";
import { getPopulationHealth } from "@/lib/api-client";
import { useApiQuery } from "@/hooks/useApiQuery";

// ---------------------------------------------------------------------------
// Types (local, only used in this module)
// ---------------------------------------------------------------------------

interface PopulationHealthApiData {
  total_enrolled?: number;
  bmi_distribution?: {
    underweight?: { count?: number };
    normal?: { count?: number };
    overweight?: { count?: number };
    obese?: { count?: number };
  };
  blood_pressure_risk?: { normal?: number; elevated?: number; high?: number };
  diabetes_risk?: { low?: number; moderate?: number; high?: number };
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function loadPopulationHealth(): Promise<PopulationHealthApiData> {
  const response = (await getPopulationHealth()) as ApiResponse<PopulationHealthApiData>;
  if (!response?.success || !response.data) {
    throw new Error(response?.message || "Failed to load population health data.");
  }
  return response.data;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PopulationHealthPage() {
  const { data, loading, error, errorType, retry } = useApiQuery(loadPopulationHealth);

  if (loading) return <PageLoading message="Loading population health data" />;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Population Health Overview</h1>
          <p className="text-sm text-muted-foreground">Aggregated health metrics and risk analysis</p>
        </div>
        <PageError error={error} errorType={errorType} onRetry={retry} />
      </div>
    );
  }

  if (!data) return null;

  const bmiData = data.bmi_distribution
    ? [
        { name: "Underweight", value: data.bmi_distribution.underweight?.count ?? 0 },
        { name: "Normal", value: data.bmi_distribution.normal?.count ?? 0 },
        { name: "Overweight", value: data.bmi_distribution.overweight?.count ?? 0 },
        { name: "Obese", value: data.bmi_distribution.obese?.count ?? 0 },
      ]
    : [];

  const bloodPressureData = data.blood_pressure_risk
    ? [
        { name: "Normal", value: data.blood_pressure_risk.normal ?? 0 },
        { name: "Elevated", value: data.blood_pressure_risk.elevated ?? 0 },
        { name: "High", value: data.blood_pressure_risk.high ?? 0 },
      ]
    : [];

  const diabetesRiskData = data.diabetes_risk
    ? [
        { name: "Low", value: data.diabetes_risk.low ?? 0 },
        { name: "Moderate", value: data.diabetes_risk.moderate ?? 0 },
        { name: "High", value: data.diabetes_risk.high ?? 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Population Health Overview</h1>
        <p className="text-sm text-muted-foreground">
          Aggregated health trends and risk indicators for your organization
        </p>
      </div>

      <ChartCard
        title="BMI Distribution"
        data={bmiData}
        type="bar"
        description={`Body Mass Index distribution across ${data.total_enrolled ?? 0} enrolled employees`}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <ChartCard
          title="Blood Pressure Risk Levels"
          data={bloodPressureData}
          type="pie"
          colors={["#10b981", "#f59e0b", "#ef4444"]}
          description="Aggregated blood pressure risk assessment"
        />
        <ChartCard
          title="Diabetes Risk Indicators"
          data={diabetesRiskData}
          type="pie"
          colors={["#10b981", "#f59e0b", "#ef4444"]}
          description="Diabetes risk screening results"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Enrolled Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{(data.total_enrolled ?? 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Employees with health data in the system</p>
        </CardContent>
      </Card>
    </div>
  );
}

