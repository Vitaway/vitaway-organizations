import { Appointment } from "@/types";
import { Card } from "@/components/ui/card";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { format } from "date-fns";

interface AppointmentCardProps {
  appointment: Appointment;
  showProvider?: boolean;
  showEmployee?: boolean;
  onViewDetails?: (appointment: Appointment) => void;
}

export function AppointmentCard({
  appointment,
  showProvider = true,
  showEmployee = false,
  onViewDetails,
}: AppointmentCardProps) {
  const formattedDate = appointment.appointment_date
    ? format(new Date(appointment.appointment_date), "MMM dd, yyyy")
    : "N/A";

  const formattedTime = appointment.appointment_time
    ? appointment.appointment_time.substring(0, 5)
    : "N/A";

  const appointmentTypeLabels: Record<string, string> = {
    coaching: "Coaching",
    mental_health: "Mental Health",
    nutrition: "Nutrition",
    general: "General",
    consultation: "Consultation",
  };

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetails?.(appointment)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm text-foreground">
            {appointmentTypeLabels[appointment.appointment_type] || appointment.appointment_type}
          </h3>
          <AppointmentStatusBadge status={appointment.status} className="mt-1" />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-muted-foreground">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center text-muted-foreground">
          <Clock className="w-4 h-4 mr-2" />
          <span>
            {formattedTime} ({appointment.duration_minutes} min)
          </span>
        </div>

        {showProvider && appointment.provider_details && (
          <div className="flex items-center text-muted-foreground">
            <User className="w-4 h-4 mr-2" />
            <span>{appointment.provider_details.name}</span>
          </div>
        )}

        {showProvider && appointment.provider && (
          <div className="flex items-center text-muted-foreground">
            <User className="w-4 h-4 mr-2" />
            <span>
              {appointment.provider.firstname} {appointment.provider.lastname}
            </span>
          </div>
        )}

        {showEmployee && appointment.employee && (
          <div className="flex items-center text-muted-foreground">
            <User className="w-4 h-4 mr-2" />
            <span>
              {appointment.employee.firstname} {appointment.employee.lastname}
            </span>
          </div>
        )}

        {appointment.notes && (
          <div className="flex items-start text-muted-foreground">
            <FileText className="w-4 h-4 mr-2 mt-0.5" />
            <span className="text-xs line-clamp-2">{appointment.notes}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
