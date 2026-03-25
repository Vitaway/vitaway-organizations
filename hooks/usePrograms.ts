// hooks/usePrograms.ts
import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/utils';

export interface Program {
  id: number;
  organization_id: number;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  thumbnail_url?: string;
  estimated_duration_hours?: number;
  total_modules: number;
  learning_objectives?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
  stats?: {
    total_enrolled: number;
    completed: number;
    in_progress: number;
    completion_rate: number;
  };
}

export interface ProgramFilters {
  status?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export function usePrograms(filters?: ProgramFilters) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, per_page: 20, current_page: 1, last_page: 1 });

  const fetchPrograms = useCallback(async (pageOrFilters?: number | ProgramFilters, perPage?: number) => {
    setLoading(true);
    setError(null);
    try {
      let params: ProgramFilters;
      if (typeof pageOrFilters === 'number') {
        params = { ...filters, page: pageOrFilters, per_page: perPage || filters?.per_page || 20 };
      } else {
        params = pageOrFilters || filters;
      }
      const response = await apiClient.get('/programs', { params });

      if (response.data?.success) {
        setPrograms(response.data.data.data || []);
        setPagination({
          total: response.data.data.total,
          page: response.data.data.current_page,
          per_page: response.data.data.per_page,
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
        });
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to fetch programs'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createProgram = useCallback(async (data: Partial<Program>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/programs', data);
      if (response.data?.success) {
        setPrograms([response.data.data, ...programs]);
        return response.data.data;
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to create program'));
    } finally {
      setLoading(false);
    }
  }, [programs]);

  const updateProgram = useCallback(async (id: number, data: Partial<Program>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(`/programs/${id}`, data);
      if (response.data?.success) {
        setPrograms(
          programs.map((p) => (p.id === id ? response.data.data : p))
        );
        return response.data.data;
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to update program'));
    } finally {
      setLoading(false);
    }
  }, [programs]);

  const deleteProgram = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(`/programs/${id}`);
      if (response.data?.success) {
        setPrograms(programs.filter((p) => p.id !== id));
        return true;
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to delete program'));
    } finally {
      setLoading(false);
    }
  }, [programs]);

  const publishProgram = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/programs/${id}/publish`);
      if (response.data?.success) {
        setPrograms(
          programs.map((p) => (p.id === id ? response.data.data : p))
        );
        return response.data.data;
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to publish program'));
    } finally {
      setLoading(false);
    }
  }, [programs]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return {
    programs,
    loading,
    error,
    pagination,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    publishProgram,
  };
}
