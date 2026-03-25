/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Client for Organization Dashboard
 * All API calls must include organization context for tenant isolation
 */

import { PaginationParams } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/organization";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Token management
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
  document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  document.cookie = "auth_token=; path=/; max-age=0";
}

function clearAuthStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
  localStorage.removeItem("organization");
  localStorage.removeItem("role");
  localStorage.removeItem("permissions");
  document.cookie = "auth_token=; path=/; max-age=0";
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    // Get response text first to handle JSON parsing errors better
    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || response.statusText };
      }
      
      // If unauthorized, remove token
      if (response.status === 401) {
        clearAuthStorage();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
      }
      
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      );
    }

    // Parse successful response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(
        `Invalid JSON response from server: ${parseError instanceof Error ? parseError.message : "Unable to parse response"}`
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Authentication
export async function login(email: string, password: string) {
  const response = await fetchApi<any>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  if (response.success && response.data.token) {
    setToken(response.data.token);
  }
  
  return response;
}

export async function logout() {
  try {
    await fetchApi("/auth/logout", { method: "POST" });
  } finally {
    removeToken();
  }
}

export async function refreshToken() {
  const response = await fetchApi<any>("/auth/refresh", { method: "POST" });
  if (response?.success && response.data?.token) {
    setToken(response.data.token);
  }
  return response;
}

export async function forgotPassword(email: string) {
  return fetchApi<{ success: boolean; message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(data: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  return fetchApi<{ success: boolean; message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Organization Profile
export async function getOrganizationProfile() {
  return fetchApi("/profile");
}

export async function updateOrganizationProfile(data: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}) {
  return fetchApi("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Dashboard Metrics
export async function getDashboardMetrics(): Promise<any> {
  return fetchApi("/dashboard/overview");
}

// Population Health
export async function getPopulationHealth() {
  return fetchApi("/analytics/population-health");
}

// Engagement Metrics
export async function getEngagementMetrics() {
  return fetchApi("/analytics/engagement");
}

// Employee Management
export async function getEmployees(params?: Partial<PaginationParams>) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("per_page", params.limit.toString());
  
  const url = `/employees${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchApi(url);
}

export async function addEmployee(data: {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  employee_identifier?: string;
  initial_programs?: string[];
  password?: string;
}) {
  return fetchApi("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function bulkUploadEmployees(file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/employees/bulk`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || "Upload failed", errorData);
  }

  return response.json();
}

export async function assignEmployeeToProgram(
  employeeId: string,
  programs: string[]
) {
  return fetchApi(`/employees/${employeeId}/programs`, {
    method: "POST",
    body: JSON.stringify({ programs }),
  });
}

export async function sendNotification(data: {
  recipient_type: "all" | "specific" | "segment";
  title: string;
  message: string;
  delivery_method?: "email" | "in_app" | "both";
  recipient_ids?: string[];
}) {
  return fetchApi("/notifications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Programs & Learning Management
export async function getPrograms(params?: { status?: string; per_page?: number; page?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  const url = `/programs${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchApi(url);
}

export async function getProgram(programId: number) {
  return fetchApi(`/programs/${programId}`);
}

export async function getProgramModules(programId: number) {
  return fetchApi(`/programs/${programId}/modules?per_page=100`);
}

export async function getProgramModule(programId: number, moduleId: number) {
  return fetchApi(`/programs/${programId}/modules/${moduleId}`);
}

export async function getProgramQuizzes(programId: number) {
  return fetchApi(`/programs/${programId}/quizzes?per_page=100`);
}

export async function getProgramQuiz(programId: number, quizId: number) {
  return fetchApi(`/programs/${programId}/quizzes/${quizId}`);
}

export async function createProgram(data: {
  name: string;
  description?: string;
  category?: string;
  duration_weeks?: number;
  is_active?: boolean;
  status?: string;
  thumbnail_url?: string;
  assigned_roles?: string[];
}) {
  return fetchApi("/programs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProgram(programId: number, data: {
  name?: string;
  description?: string;
  category?: string;
  duration_weeks?: number;
  is_active?: boolean;
  status?: string;
  thumbnail_url?: string;
  assigned_roles?: string[];
}) {
  return fetchApi(`/programs/${programId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProgram(programId: number) {
  return fetchApi(`/programs/${programId}`, {
    method: "DELETE",
  });
}

export async function createProgramModule(programId: number, data: {
  title: string;
  content_type: "text" | "video" | "file";
  content_text?: string;
  content_url?: string;
  content_file_path?: string;
  position?: number;
  is_required?: boolean;
  estimated_minutes?: number;
}) {
  return fetchApi(`/programs/${programId}/modules`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProgramModule(programId: number, moduleId: number, data: {
  title?: string;
  content_type?: "text" | "video" | "file";
  content_text?: string;
  content_url?: string;
  content_file_path?: string;
  position?: number;
  is_required?: boolean;
  estimated_minutes?: number;
}) {
  return fetchApi(`/programs/${programId}/modules/${moduleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProgramModule(programId: number, moduleId: number) {
  return fetchApi(`/programs/${programId}/modules/${moduleId}`, {
    method: "DELETE",
  });
}

export async function createProgramQuiz(programId: number, data: {
  module_id?: number | null;
  title: string;
  description?: string;
  passing_score?: number;
  max_attempts?: number | null;
  is_active?: boolean;
  questions?: any[];
}) {
  return fetchApi(`/programs/${programId}/quizzes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProgramQuiz(programId: number, quizId: number, data: {
  title?: string;
  description?: string;
  passing_score?: number;
  max_attempts?: number | null;
  is_active?: boolean;
  questions?: any[];
}) {
  return fetchApi(`/programs/${programId}/quizzes/${quizId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProgramQuiz(programId: number, quizId: number) {
  return fetchApi(`/programs/${programId}/quizzes/${quizId}`, {
    method: "DELETE",
  });
}

export async function assignProgram(programId: number, data: {
  employee_ids?: number[];
  roles?: string[];
  assign_all?: boolean;
}) {
  return fetchApi(`/programs/${programId}/assign`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProgramProgress(programId: number, params?: { per_page?: number; page?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  const url = `/programs/${programId}/progress${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchApi(url);
}

// Reports
export async function getReports(params?: Partial<PaginationParams>) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("per_page", params.limit.toString());
  
  const url = `/reports${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchApi(url);
}

export async function generateReport(data: {
  report_type: "population_health" | "engagement" | "roi" | "risk_summary" | "program_completion";
  date_range_start?: string;
  date_range_end?: string;
  format: "pdf" | "excel" | "csv";
  include_charts?: boolean;
}) {
  return fetchApi("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function downloadReport(reportId: string) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error("Download failed");
  }

  return response.blob();
}

// Audit Logs
export async function getExportAuditLogs(params?: {
  date_start?: string;
  date_end?: string;
  format?: "csv" | "pdf";
}) {
  const queryParams = new URLSearchParams();
  if (params?.date_start) queryParams.append("date_start", params.date_start);
  if (params?.date_end) queryParams.append("date_end", params.date_end);
  if (params?.format) queryParams.append("format", params.format);
  
  const url = `/audit/exports${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchApi(url);
}

export async function getAccessLogs(params?: {
  date_start?: string;
  user_id?: string;
  per_page?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.date_start) queryParams.append("date_start", params.date_start);
  if (params?.user_id) queryParams.append("user_id", params.user_id);
  if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
  
  const url = `/audit/access${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchApi(url);
}

// Appointments - Employee Endpoints
export async function getAvailableProviders(type?: string) {
  const queryParams = new URLSearchParams();
  if (type) queryParams.append("type", type);
  
  const url = `/employee/appointments/available-providers${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchApi(url);
}

export async function bookAppointment(data: {
  provider_id: number;
  provider_type: string;
  appointment_type: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  notes?: string;
}) {
  return fetchApi("/employee/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getEmployeeAppointments(params?: {
  status?: string;
  type?: string;
  filter?: string;
  per_page?: number;
  page?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.type) queryParams.append("type", params.type);
  if (params?.filter) queryParams.append("filter", params.filter);
  if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  
  const url = `/employee/appointments${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchApi(url);
}

// Appointments - Admin Endpoints
export async function getOrganizationAppointments(params?: {
  status?: string;
  type?: string;
  provider_id?: number;
  filter?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.type) queryParams.append("type", params.type);
  if (params?.provider_id) queryParams.append("provider_id", params.provider_id.toString());
  if (params?.filter) queryParams.append("filter", params.filter);
  if (params?.start_date) queryParams.append("start_date", params.start_date);
  if (params?.end_date) queryParams.append("end_date", params.end_date);
  if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  
  const url = `/appointments${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchApi(url);
}

export async function getMyAppointments(params?: {
  status?: string;
  type?: string;
  filter?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.type) queryParams.append("type", params.type);
  if (params?.filter) queryParams.append("filter", params.filter);
  if (params?.start_date) queryParams.append("start_date", params.start_date);
  if (params?.end_date) queryParams.append("end_date", params.end_date);
  if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  
  const url = `/appointments/my-appointments${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchApi(url);
}

export async function getAppointmentDetails(appointmentId: number) {
  return fetchApi(`/appointments/${appointmentId}`);
}

export async function updateAppointmentStatus(
  appointmentId: number,
  data: {
    status: string;
    notes?: string;
    cancellation_reason?: string;
  }
) {
  return fetchApi(`/appointments/${appointmentId}/status`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getAppointmentStatistics(params?: {
  start_date?: string;
  end_date?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append("start_date", params.start_date);
  if (params?.end_date) queryParams.append("end_date", params.end_date);
  
  const url = `/appointments/statistics${queryParams.toString() ? `?${queryParams}` : ""}`;
  return fetchApi(url);
}

export async function getAvailablePartners() {
  return fetchApi("/appointments/available-partners");
}

/**
 * Axios-style API client wrapper for use in hooks
 * Provides .get(), .post(), .put(), .delete() methods
 * that wrap fetchApi with a consistent response shape
 */
export const apiClient = {
  async get(endpoint: string, config?: { params?: Record<string, any> }) {
    let url = endpoint;
    if (config?.params) {
      const queryParams = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const qs = queryParams.toString();
      if (qs) url += `?${qs}`;
    }
    const result = await fetchApi<any>(url);
    return { data: result };
  },

  async post(endpoint: string, data?: any) {
    const result = await fetchApi<any>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    return { data: result };
  },

  async put(endpoint: string, data?: any) {
    const result = await fetchApi<any>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
    return { data: result };
  },

  async delete(endpoint: string) {
    const result = await fetchApi<any>(endpoint, {
      method: "DELETE",
    });
    return { data: result };
  },
};

export { ApiError, getToken, setToken, removeToken, clearAuthStorage };
