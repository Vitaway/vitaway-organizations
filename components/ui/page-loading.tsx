interface PageLoadingProps {
  message?: string;
}

/**
 * Fullscreen-within-container loading indicator.
 * Drop it as the sole return from any data-fetching component while loading.
 */
export function PageLoading({ message = "Loading…" }: PageLoadingProps) {
  return (
    <div className="flex items-center justify-center h-full min-h-[240px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
