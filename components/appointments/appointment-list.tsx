"use client";

import { Appointment } from "@/types";
import { AppointmentCard } from "./appointment-card";

interface AppointmentListProps {
  appointments: Appointment[];
  showProvider?: boolean;
  showEmployee?: boolean;
  onViewDetails?: (appointment: Appointment) => void;
  emptyMessage?: string;
}

export function AppointmentList({
  appointments,
  showProvider = true,
  showEmployee = false,
  onViewDetails,
  emptyMessage = "No appointments found",
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          showProvider={showProvider}
          showEmployee={showEmployee}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
