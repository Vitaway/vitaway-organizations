import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";

export interface Assignment {
  id: number;
  program_id: number;
  assignee_type: "employee" | "role" | "department" | "group";
  assignee_id: number;
  assigned_at: string;
  expires_at?: string;
  max_attempts?: number;
  assigned_by: number;
  created_at: string;
  updated_at: string;
}

export interface AssignedEmployee {
  id: number;
  organization_employee_id: number;
  program_id: number;
  status: "enrolled" | "in_progress" | "completed" | "failed" | "paused";
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  progress_percentage: number;
  final_score?: number;
  last_accessed_at?: string;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export const useAssignments = (programId?: number) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignedEmployees, setAssignedEmployees] = useState<
    AssignedEmployee[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchAssignments = useCallback(
    async (page = 1, perPage = 20) => {
      if (!programId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(
          `/programs/${programId}/assignments`,
          {
            params: { page, per_page: perPage },
          },
        );

        if (response.data.success) {
          setAssignments(response.data.data.data);
          setPagination({
            total: response.data.data.total,
            per_page: response.data.data.per_page,
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
          });
        } else {
          setError(response.data.message);
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Failed to fetch assignments"));
      } finally {
        setLoading(false);
      }
    },
    [programId],
  );

  const fetchAssignedEmployees = useCallback(
    async (page = 1, perPage = 20) => {
      if (!programId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(
          `/programs/${programId}/assigned-employees`,
          {
            params: { page, per_page: perPage },
          },
        );

        if (response.data.success) {
          setAssignedEmployees(response.data.data.data);
          setPagination({
            total: response.data.data.total,
            per_page: response.data.data.per_page,
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
          });
        } else {
          setError(response.data.message);
        }
      } catch (err: unknown) {
        setError(
          getApiErrorMessage(err, "Failed to fetch assigned employees"),
        );
      } finally {
        setLoading(false);
      }
    },
    [programId],
  );

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const assignToEmployee = useCallback(
    async (employeeId: number, expiresAt?: string, maxAttempts?: number) => {
      if (!programId) throw new Error("Program ID required");

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          `/programs/${programId}/assign-employee`,
          {
            employee_id: employeeId,
            expires_at: expiresAt,
            max_attempts: maxAttempts,
          },
        );

        if (response.data.success) {
          setAssignments((prev) => [...prev, response.data.data]);
          await fetchAssignedEmployees();
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg =
          getApiErrorMessage(err, "Failed to assign program to employee");
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [programId, fetchAssignedEmployees],
  );

  const assignToRole = useCallback(
    async (roleId: number, expiresAt?: string, maxAttempts?: number) => {
      if (!programId) throw new Error("Program ID required");

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          `/programs/${programId}/assign-role`,
          {
            role_id: roleId,
            expires_at: expiresAt,
            max_attempts: maxAttempts,
          },
        );

        if (response.data.success) {
          setAssignments((prev) => [...prev, response.data.data]);
          await fetchAssignedEmployees();
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg =
          getApiErrorMessage(err, "Failed to assign program to role");
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [programId, fetchAssignedEmployees],
  );

  const assignToDepartment = useCallback(
    async (departmentId: number, expiresAt?: string, maxAttempts?: number) => {
      if (!programId) throw new Error("Program ID required");

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          `/programs/${programId}/assign-department`,
          {
            department_id: departmentId,
            expires_at: expiresAt,
            max_attempts: maxAttempts,
          },
        );

        if (response.data.success) {
          setAssignments((prev) => [...prev, response.data.data]);
          await fetchAssignedEmployees();
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg =
          getApiErrorMessage(err, "Failed to assign program to department");
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [programId, fetchAssignedEmployees],
  );

  const removeAssignment = useCallback(
    async (assignmentId: number) => {
      if (!programId) throw new Error("Program ID required");

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.delete(
          `/programs/${programId}/assignments/${assignmentId}`,
        );

        if (response.data.success) {
          setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
          await fetchAssignedEmployees();
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg =
          getApiErrorMessage(err, "Failed to remove assignment");
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [programId, fetchAssignedEmployees],
  );

  const updateAssignment = useCallback(
    async (assignmentId: number, expiresAt?: string, maxAttempts?: number) => {
      if (!programId) throw new Error("Program ID required");

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.put(
          `/programs/${programId}/assignments/${assignmentId}`,
          {
            expires_at: expiresAt,
            max_attempts: maxAttempts,
          },
        );

        if (response.data.success) {
          setAssignments((prev) =>
            prev.map((a) => (a.id === assignmentId ? response.data.data : a)),
          );
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg =
          getApiErrorMessage(err, "Failed to update assignment");
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [programId],
  );

  return {
    assignments,
    assignedEmployees,
    loading,
    error,
    pagination,
    fetchAssignments,
    fetchAssignedEmployees,
    assignToEmployee,
    assignToRole,
    assignToDepartment,
    removeAssignment,
    updateAssignment,
  };
};
