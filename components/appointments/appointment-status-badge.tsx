import { cn } from "@/lib/utils";

interface AppointmentStatusBadgeProps {
  status: string;
  className?: string;
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: {
      label: "Scheduled",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-success/10 text-success border-success/20",
    },
    completed: {
      label: "Completed",
      className: "bg-muted text-muted-foreground border-border",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    no_show: {
      label: "No Show",
      className: "bg-warning/10 text-warning border-warning/20",
    },
  };

  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
