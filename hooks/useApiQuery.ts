"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ApiError } from "@/lib/api-client";

export type ErrorType = "auth" | "server" | "network" | "validation";

export interface UseApiQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  errorType: ErrorType;
  retry: () => void;
}

/**
 * Centralized data-fetching hook with unified error classification.
 *
 * The `fetcher` function should throw on both HTTP errors (ApiError) and
 * logical failures (e.g. response.success === false). Successful results are
 * returned as `data`.
 *
 * @example
 * const { data, loading, error, errorType, retry } = useApiQuery(async () => {
 *   const res = await getEmployees({ page }) as ApiResponse<Employee[]>;
 *   if (!res?.success || !res.data) throw new Error(res?.message ?? "Failed");
 *   return res.data;
 * }, [page]);
 */
export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>("network");

  // Keep fetcher stable without triggering re-runs when deps are unchanged
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorType("auth");
          setError("Authentication required. Please log in again.");
        } else if (err.status === 422) {
          setErrorType("validation");
          setError(err.message || "Invalid input. Please check your data.");
        } else if (err.status >= 500) {
          setErrorType("server");
          setError(
            err.message || "A server error occurred. Please try again later.",
          );
        } else {
          setErrorType("network");
          setError(err.message || "Request failed. Please try again.");
        }
      } else {
        setErrorType("network");
        setError(
          message || "Unable to reach the server. Check your connection.",
        );
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, deps); // deps controls when the query re-runs

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, errorType, retry: run };
}
