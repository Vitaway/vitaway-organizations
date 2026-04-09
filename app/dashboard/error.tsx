"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Dashboard-scoped error boundary. Renders within the dashboard shell
 * (sidebar stays visible) so the user retains navigation context.
 */
export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex items-start justify-center p-6 sm:p-10">
      <Card className="w-full max-w-lg border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            Page Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This page encountered an unexpected error. You can try to reload it or
            navigate to another section using the sidebar.
          </p>
          {process.env.NODE_ENV !== "production" && (
            <pre className="text-xs font-mono text-destructive border border-destructive/20 rounded-md p-3 bg-destructive/5 whitespace-pre-wrap break-all">
              {error.message}
            </pre>
          )}
          <Button onClick={reset} size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reload page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
