"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js global error boundary — caught at the root route segment.
 * Rendered when an unhandled error escapes the component tree.
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to monitoring service in production
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. If this keeps happening, please contact support.
          </p>
          {process.env.NODE_ENV !== "production" && (
            <pre className="mt-3 text-left text-xs font-mono text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5 whitespace-pre-wrap break-all">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
