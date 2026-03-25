// hooks/useModules.ts
import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";

export interface ProgramModule {
  id: number;
  program_id: number;
  title: string;
  description?: string;
  content_type: "text" | "video" | "file" | "mixed";
  content?: string;
  video_url?: string;
  file_url?: string;
  file_type?: string;
  position: number;
  estimated_duration_minutes?: number;
  is_required: boolean;
  requires_quiz_pass: boolean;
  created_at: string;
  updated_at: string;
  quiz?: Record<string, unknown>;
}

export function useModules(programId: number | null) {
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    if (!programId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(
        `/programs/${programId}/modules`,
      );
      if (response.data?.success) {
        setModules(response.data.data || []);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to fetch modules"));
    } finally {
      setLoading(false);
    }
  }, [programId]);

  const createModule = useCallback(
    async (data: Partial<ProgramModule>) => {
      if (!programId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post(
          `/programs/${programId}/modules`,
          data,
        );
        if (response.data?.success) {
          setModules([...modules, response.data.data]);
          return response.data.data;
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Failed to create module"));
      } finally {
        setLoading(false);
      }
    },
    [programId, modules],
  );

  const updateModule = useCallback(
    async (moduleId: number, data: Partial<ProgramModule>) => {
      if (!programId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.put(
          `/programs/${programId}/modules/${moduleId}`,
          data,
        );
        if (response.data?.success) {
          setModules(
            modules.map((m) => (m.id === moduleId ? response.data.data : m)),
          );
          return response.data.data;
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Failed to update module"));
      } finally {
        setLoading(false);
      }
    },
    [programId, modules],
  );

  const deleteModule = useCallback(
    async (moduleId: number) => {
      if (!programId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.delete(
          `/programs/${programId}/modules/${moduleId}`,
        );
        if (response.data?.success) {
          setModules(modules.filter((m) => m.id !== moduleId));
          return true;
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Failed to delete module"));
      } finally {
        setLoading(false);
      }
    },
    [programId, modules],
  );

  const reorderModules = useCallback(
    async (orderedModules: Array<{ id: number; position: number }>) => {
      if (!programId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post(
          `/programs/${programId}/modules/reorder`,
          { modules: orderedModules },
        );
        if (response.data?.success) {
          // Refetch modules after reorder
          await fetchModules();
          return true;
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Failed to reorder modules"));
      } finally {
        setLoading(false);
      }
    },
    [programId, fetchModules],
  );

  return {
    modules,
    loading,
    error,
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
  };
}
