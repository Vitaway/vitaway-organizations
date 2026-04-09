"use client";

import { AlertCircle, ServerCrash, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ErrorType } from "@/hooks/useApiQuery";

interface PageErrorProps {
  error: string;
  errorType?: ErrorType;
  onRetry?: () => void;
  retrying?: boolean;
}

const CONFIG = {
  auth: {
    icon: AlertCircle,
    cardCls: "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20",
    titleCls: "text-yellow-900 dark:text-yellow-400",
    heading: "Authentication Required",
  },
  server: {
    icon: ServerCrash,
    cardCls: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20",
    titleCls: "text-red-900 dark:text-red-400",
    heading: "Server Error",
  },
  network: {
    icon: WifiOff,
    cardCls: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20",
    titleCls: "text-red-900 dark:text-red-400",
    heading: "Connection Error",
  },
  validation: {
    icon: AlertCircle,
    cardCls: "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20",
    titleCls: "text-orange-900 dark:text-orange-400",
    heading: "Validation Error",
  },
} as const;

/**
 * Unified error state component. Renders a contextual card based on `errorType`.
 * Shows a login redirect for auth errors and a retry button for other errors.
 */
export function PageError({ error, errorType = "network", onRetry, retrying = false }: PageErrorProps) {
  const router = useRouter();
  const { icon: Icon, cardCls, titleCls, heading } = CONFIG[errorType];

  return (
    <Card className={cardCls}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 text-base ${titleCls}`}>
          <Icon className="h-5 w-5 flex-shrink-0" />
          {heading}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{error}</p>
        <div className="flex flex-wrap gap-2">
          {errorType === "auth" ? (
            <Button size="sm" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          ) : onRetry ? (
            <Button size="sm" onClick={onRetry} disabled={retrying}>
              {retrying ? "Retrying…" : "Try Again"}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
