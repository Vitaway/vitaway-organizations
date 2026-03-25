import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/utils';

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
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  position: number;
  questions?: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation?: string;
  points: number;
  position: number;
  is_active: boolean;
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  explanation?: string;
  position: number;
}

interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export const useQuizzes = (programId?: number) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchQuizzes = useCallback(
    async (page = 1, perPage = 20) => {
      if (!programId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(
          `/programs/${programId}/quizzes`,
          {
            params: { page, per_page: perPage },
          }
        );

        if (response.data.success) {
          setQuizzes(response.data.data.data);
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
        setError(getApiErrorMessage(err, 'Failed to fetch quizzes'));
      } finally {
        setLoading(false);
      }
    },
    [programId]
  );

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const createQuiz = useCallback(
    async (data: Partial<Quiz>) => {
      if (!programId) throw new Error('Program ID required');

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          `/programs/${programId}/quizzes`,
          data
        );

        if (response.data.success) {
          setQuizzes((prev) => [...prev, response.data.data]);
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg = getApiErrorMessage(err, 'Failed to create quiz');
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [programId]
  );

  const updateQuiz = useCallback(
    async (quizId: number, data: Partial<Quiz>) => {
      if (!programId) throw new Error('Program ID required');

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.put(
          `/programs/${programId}/quizzes/${quizId}`,
          data
        );

        if (response.data.success) {
          setQuizzes((prev) =>
            prev.map((q) => (q.id === quizId ? response.data.data : q))
          );
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg = getApiErrorMessage(err, 'Failed to update quiz');
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [programId]
  );

  const deleteQuiz = useCallback(
    async (quizId: number) => {
      if (!programId) throw new Error('Program ID required');

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.delete(
          `/programs/${programId}/quizzes/${quizId}`
        );

        if (response.data.success) {
          setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg = getApiErrorMessage(err, 'Failed to delete quiz');
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [programId]
  );

  const reorderQuizzes = useCallback(
    async (quizOrder: number[]) => {
      if (!programId) throw new Error('Program ID required');

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          `/programs/${programId}/quizzes/reorder`,
          { quiz_order: quizOrder }
        );

        if (response.data.success) {
          await fetchQuizzes();
          return response.data.data;
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: unknown) {
        const errorMsg =
          getApiErrorMessage(err, 'Failed to reorder quizzes');
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [programId, fetchQuizzes]
  );

  return {
    quizzes,
    loading,
    error,
    pagination,
    fetchQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    reorderQuizzes,
  };
};
