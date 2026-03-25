import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/utils';

export interface EmployeeProgram {
  id: number;
  organization_id: number;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  thumbnail_url?: string;
  estimated_duration_hours: number;
  total_modules: number;
  learning_objectives?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  modules?: Module[];
  quizzes?: Quiz[];
}

export interface Module {
  id: number;
  program_id: number;
  title: string;
  description?: string;
  content_type: 'text' | 'video' | 'file' | 'mixed';
  content?: string;
  video_url?: string;
  file_url?: string;
  file_type?: string;
  position: number;
  estimated_duration_minutes: number;
  is_required: boolean;
  requires_quiz_pass: boolean;
  quiz?: Quiz;
}

export interface Quiz {
  id: number;
  program_id: number;
  module_id?: number;
  title: string;
  description?: string;
  quiz_type: 'module_quiz' | 'final_quiz';
  passing_score: number;
  max_attempts: number;
  time_limit_minutes?: number;
  is_required: boolean;
  show_correct_answers: boolean;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: number;
  answer_text: string;
}

export interface Enrollment {
  id: number;
  organization_employee_id: number;
  program_id: number;
  status: 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'paused';
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  progress_percentage: number;
  final_score?: number;
  last_accessed_at?: string;
}

export interface EnrollmentProgress {
  module_id: number;
  module_status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  module_completed_at?: string;
  module_completion_percentage: number;
  quiz_id?: number;
  quiz_attempts: number;
  quiz_score?: number;
  quiz_passed: boolean;
}

interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export const useEmployeePrograms = () => {
  const [programs, setPrograms] = useState<Enrollment[]>([]);
  const [currentProgram, setCurrentProgram] = useState<EmployeeProgram | null>(
    null
  );
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [progress, setProgress] = useState<EnrollmentProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const listAssignedPrograms = useCallback(
    async (page = 1, perPage = 10) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(
          `/employee/programs`,
          {
            params: { page, per_page: perPage },
          }
        );

        if (response.data.success) {
          setPrograms(response.data.data.data);
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
          getApiErrorMessage(err, 'Failed to fetch assigned programs')
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    listAssignedPrograms();
  }, [listAssignedPrograms]);

  const getProgram = useCallback(async (programId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(
        `/employee/programs/${programId}`
      );

      if (response.data.success) {
        setCurrentProgram(response.data.data.program);
        setEnrollment(response.data.data.enrollment);
        setProgress(response.data.data.progress);
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err: unknown) {
      const errorMsg =
        getApiErrorMessage(err, 'Failed to fetch program');
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const startProgram = useCallback(async (programId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(
        `/employee/programs/${programId}/start`
      );

      if (response.data.success) {
        setEnrollment(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err: unknown) {
      const errorMsg =
        getApiErrorMessage(err, 'Failed to start program');
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getModule = useCallback(
    async (programId: number, moduleId: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(
          `/employee/programs/${programId}/modules/${moduleId}`
        );

        if (response.data.success) {
          setCurrentModule(response.data.data.module);
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg =
          getApiErrorMessage(err, 'Failed to fetch module');
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const completeModule = useCallback(
    async (programId: number, moduleId: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          `/employee/programs/${programId}/modules/${moduleId}/complete`
        );

        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg =
          getApiErrorMessage(err, 'Failed to complete module');
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getModuleQuiz = useCallback(
    async (programId: number, moduleId: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(
          `/employee/programs/${programId}/modules/${moduleId}/quiz`
        );

        if (response.data.success) {
          setCurrentQuiz(response.data.data.quiz);
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg =
          getApiErrorMessage(err, 'Failed to fetch quiz');
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const submitModuleQuiz = useCallback(
    async (
      programId: number,
      moduleId: number,
      answers: Record<number, number>,
      timeSpentSeconds?: number
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          `/employee/programs/${programId}/modules/${moduleId}/quiz/submit`,
          {
            answers,
            time_spent_seconds: timeSpentSeconds,
          }
        );

        if (response.data.success) {
          // Refresh program data
          await getProgram(programId);
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg =
          getApiErrorMessage(err, 'Failed to submit quiz');
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [getProgram]
  );

  const getFinalQuiz = useCallback(async (programId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(
        `/employee/programs/${programId}/final-quiz`
      );

      if (response.data.success) {
        setCurrentQuiz(response.data.data.quiz);
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err: unknown) {
      const errorMsg =
        getApiErrorMessage(err, 'Failed to fetch final quiz');
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitFinalQuiz = useCallback(
    async (
      programId: number,
      answers: Record<number, number>,
      timeSpentSeconds?: number
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          `/employee/programs/${programId}/final-quiz/submit`,
          {
            answers,
            time_spent_seconds: timeSpentSeconds,
          }
        );

        if (response.data.success) {
          // Refresh program data
          await getProgram(programId);
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg =
          getApiErrorMessage(err, 'Failed to submit final quiz');
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [getProgram]
  );

  return {
    // State
    programs,
    currentProgram,
    currentModule,
    currentQuiz,
    enrollment,
    progress,
    loading,
    error,
    pagination,

    // Methods
    listAssignedPrograms,
    getProgram,
    startProgram,
    getModule,
    completeModule,
    getModuleQuiz,
    submitModuleQuiz,
    getFinalQuiz,
    submitFinalQuiz,
  };
};
