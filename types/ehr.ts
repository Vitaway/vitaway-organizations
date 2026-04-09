/**
 * EHR Integration Types
 * Shared data models used at the vitaway-employeer ↔ vitaway-ehr boundary.
 *
 * API contract:
 *   Base URL: process.env.NEXT_PUBLIC_EHR_API_URL (default: https://ehr.vitaway.org/api)
 *   Auth:     Bearer token issued by vitaway-ehr for organization admins
 *   Guard:    auth:organization_admins (Sanctum)
 *   Prefix:   /api/organization/employee/:externalId/*
 */

// ---------------------------------------------------------------------------
// Core / primitives
// ---------------------------------------------------------------------------

export interface EhrApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Health records
// ---------------------------------------------------------------------------

export interface EhrHealthRecord {
  id: number;
  employee_id: number;
  recorded_at: string; // ISO 8601
  bmi: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  blood_glucose_mmol: number | null;
  cholesterol_mmol: number | null;
  heart_rate_bpm: number | null;
  notes: string | null;
  recorded_by: string | null;
}

export type HealthRiskLevel = "low" | "medium" | "high" | "critical";

export interface EhrRiskScore {
  employee_id: number;
  overall_risk: HealthRiskLevel;
  cardiovascular_risk: HealthRiskLevel | null;
  metabolic_risk: HealthRiskLevel | null;
  last_assessed_at: string | null;
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type AppointmentType = "checkup" | "followup" | "specialist" | "telehealth" | "other";

export interface EhrAppointment {
  id: number;
  employee_id: number;
  provider_name: string;
  provider_specialty: string | null;
  appointment_type: AppointmentType;
  scheduled_at: string; // ISO 8601
  duration_minutes: number;
  status: AppointmentStatus;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Benefits
// ---------------------------------------------------------------------------

export type BenefitStatus = "active" | "inactive" | "pending" | "terminated";

export interface EhrBenefit {
  id: number;
  employee_id: number;
  benefit_type: string;
  plan_name: string;
  start_date: string;
  end_date: string | null;
  status: BenefitStatus;
  provider: string | null;
}

// ---------------------------------------------------------------------------
// Employee profile (aggregate)
// ---------------------------------------------------------------------------

export interface EhrEmployeeProfile {
  /** Maps to `Employee.employee_id` in the employer system */
  external_id: string;
  firstname: string;
  lastname: string;
  email: string;
  organization_code: string;
  risk_score: EhrRiskScore | null;
  latest_health_record: EhrHealthRecord | null;
  upcoming_appointments: EhrAppointment[];
  active_benefits: EhrBenefit[];
}

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

export type SyncStatus = "synced" | "pending" | "failed" | "never";

export interface EhrSyncStatus {
  employee_id: number;
  last_synced_at: string | null;
  sync_status: SyncStatus;
  error_message: string | null;
}

// ---------------------------------------------------------------------------
// Population health (aggregated from EHR → employer view)
// ---------------------------------------------------------------------------

export interface EhrPopulationSummary {
  total_enrolled: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  avg_bmi: number | null;
  avg_blood_pressure_systolic: number | null;
  chronic_conditions_prevalence: Record<string, number>;
  generated_at: string;
}
