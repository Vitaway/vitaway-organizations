// hooks/useLesson.ts
import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";

export interface ProgramLesson {
  id: number;
  module_id: number;
  title: string;
  description?: string | null;
  content_type: "text" | "video" | "file";
  content?: string | null;
  video_url?: string | null;
  file_url?: string | null;
  file_type?: string | null;
  position: number;
  estimated_duration_minutes?: number;
  is_required: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useLesson(programId: number | null, moduleId: number | null) {
  const [lessons, setLessons] = useState<ProgramLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!programId || !moduleId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(
        `/programs/${programId}/modules/${moduleId}/lessons`,
      );
      if (response.data?.success) {
        setLessons(response.data.data || []);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to fetch lessons"));
    } finally {
      setLoading(false);
    }
  }, [programId, moduleId]);

  const createLesson = useCallback(
    async (data: Partial<ProgramLesson>) => {
      if (!programId || !moduleId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post(
          `/programs/${programId}/modules/${moduleId}/lessons`,
          data,
        );
        if (response.data?.success) {
          setLessons([...lessons, response.data.data]);
          return response.data.data;
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Failed to create lesson"));
      } finally {
        setLoading(false);
      }
    },
    [programId, moduleId, lessons],
  );

  const updateLesson = useCallback(
    async (lessonId: number, data: Partial<ProgramLesson>) => {
      if (!programId || !moduleId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.put(
          `/programs/${programId}/modules/${moduleId}/lessons/${lessonId}`,
          data,
        );
        if (response.data?.success) {
          setLessons(
            lessons.map((l) => (l.id === lessonId ? response.data.data : l)),
          );
          return response.data.data;
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Failed to update lesson"));
      } finally {
        setLoading(false);
      }
    },
    [programId, moduleId, lessons],
  );

  const deleteLesson = useCallback(
    async (lessonId: number) => {
      if (!programId || !moduleId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.delete(
          `/programs/${programId}/modules/${moduleId}/lessons/${lessonId}`,
        );
        if (response.data?.success) {
          setLessons(lessons.filter((l) => l.id !== lessonId));
          return true;
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Failed to delete lesson"));
      } finally {
        setLoading(false);
      }
    },
    [programId, moduleId, lessons],
  );

  return {
    lessons,
    loading,
    error,
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
  };
}
