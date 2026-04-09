/**
 * EHR Integration Client
 * Handles cross-system API calls: vitaway-employeer → vitaway-ehr.
 *
 * Auth:   Reuses the organization-admin Bearer token already in localStorage.
 * Guard:  auth:organization_admins (Sanctum on the EHR side).
 * Errors: Throws ApiError-compatible errors so useApiQuery classifies them correctly.
 */

import { getToken, ApiError } from "@/lib/api-client";
import type {
  EhrApiResponse,
  EhrEmployeeProfile,
  EhrSyncStatus,
  EhrAppointment,
  EhrHealthRecord,
  EhrPopulationSummary,
} from "@/types/ehr";

const EHR_API_BASE =
  process.env.NEXT_PUBLIC_EHR_API_URL ?? "https://ehr.vitaway.org/api";

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function fetchEhr<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) {
    throw new ApiError(401, "No authentication token available for EHR request.");
  }

  const url = `${EHR_API_BASE}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch (networkErr) {
    throw new Error(
      `EHR system unreachable: ${networkErr instanceof Error ? networkErr.message : "Network error"}`
    );
  }

  const text = await response.text();

  if (!response.ok) {
    let body: { message?: string } = {};
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text || response.statusText };
    }
    throw new ApiError(
      response.status,
      body.message ?? `EHR API ${response.status}: ${response.statusText}`,
      body
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON response from EHR system.");
  }
}

/** Unwrap EhrApiResponse and throw a meaningful error if the payload reports failure. */
function unwrap<T>(response: EhrApiResponse<T>, resource = "data"): T {
  if (!response.success || response.data == null) {
    throw new Error(response.message ?? `Failed to retrieve ${resource} from EHR.`);
  }
  return response.data;
}

// ---------------------------------------------------------------------------
// Employee profile
// ---------------------------------------------------------------------------

/** Fetch the full EHR profile (health record, risk score, appointments, benefits). */
export async function getEhrEmployeeProfile(externalId: string): Promise<EhrEmployeeProfile> {
  const res = await fetchEhr<EhrApiResponse<EhrEmployeeProfile>>(
    `/organization/employee/${encodeURIComponent(externalId)}/profile`
  );
  return unwrap(res, "employee EHR profile");
}

// ---------------------------------------------------------------------------
// Health records
// ---------------------------------------------------------------------------

/** Latest N health records for one employee (default 10). */
export async function getEhrHealthRecords(
  externalId: string,
  limit = 10
): Promise<EhrHealthRecord[]> {
  const res = await fetchEhr<EhrApiResponse<EhrHealthRecord[]>>(
    `/organization/employee/${encodeURIComponent(externalId)}/health-records?limit=${limit}`
  );
  return unwrap(res, "health records");
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

/** All appointments for one employee, optionally filtered by status. */
export async function getEhrEmployeeAppointments(
  externalId: string,
  filter?: "upcoming" | "completed" | "cancelled"
): Promise<EhrAppointment[]> {
  const qs = filter ? `?filter=${filter}` : "";
  const res = await fetchEhr<EhrApiResponse<EhrAppointment[]>>(
    `/organization/employee/${encodeURIComponent(externalId)}/appointments${qs}`
  );
  return unwrap(res, "appointments");
}

// ---------------------------------------------------------------------------
// Population summary
// ---------------------------------------------------------------------------

/** Aggregated population health data from EHR for this organization. */
export async function getEhrPopulationSummary(): Promise<EhrPopulationSummary> {
  const res = await fetchEhr<EhrApiResponse<EhrPopulationSummary>>(
    "/organization/population/summary"
  );
  return unwrap(res, "population summary");
}

// ---------------------------------------------------------------------------
// Sync operations
// ---------------------------------------------------------------------------

/** Check EHR sync status for one employee. */
export async function getEhrSyncStatus(externalId: string): Promise<EhrSyncStatus> {
  const res = await fetchEhr<EhrApiResponse<EhrSyncStatus>>(
    `/organization/employee/${encodeURIComponent(externalId)}/sync-status`
  );
  return unwrap(res, "sync status");
}

/** Trigger an EHR data sync for one employee. */
export async function syncEhrEmployee(externalId: string): Promise<EhrSyncStatus> {
  const res = await fetchEhr<EhrApiResponse<EhrSyncStatus>>(
    `/organization/employee/${encodeURIComponent(externalId)}/sync`,
    { method: "POST" }
  );
  return unwrap(res, "sync result");
}
