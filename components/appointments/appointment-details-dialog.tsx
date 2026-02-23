/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { updateAppointmentStatus } from "@/lib/api-client";
import { X, Calendar, Clock, User, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface AppointmentDetailsDialogProps {
    appointment: Appointment | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    showActions?: boolean;
}

export function AppointmentDetailsDialog({
    appointment,
    isOpen,
    onClose,
    onUpdate,
    showActions = false,
}: AppointmentDetailsDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancellationReason, setCancellationReason] = useState("");

    if (!isOpen || !appointment) return null;

    const formattedDate = appointment.appointment_date
        ? format(new Date(appointment.appointment_date), "EEEE, MMMM dd, yyyy")
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

    const handleStatusUpdate = async (newStatus: string) => {
        if (newStatus === "cancelled" && !cancellationReason.trim()) {
            setError("Please provide a cancellation reason");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = (await updateAppointmentStatus(appointment.id, {
                status: newStatus,
                ...(newStatus === "cancelled" && { cancellation_reason: cancellationReason }),
            })) as any;

            if (response.success) {
                onUpdate?.();
                setShowCancelForm(false);
                setCancellationReason("");
                onClose();
            }
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Failed to update appointment status");
        } finally {
            setLoading(false);
        }
    };

    const canConfirm = appointment.status === "scheduled";
    const canComplete = appointment.status === "confirmed" || appointment.status === "scheduled";
    const canCancel = appointment.status !== "cancelled" && appointment.status !== "completed";

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">Appointment Details</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Appointment Type & Status */}
                    <div>
                        <h3 className="text-2xl font-semibold text-foreground mb-2">
                            {appointmentTypeLabels[appointment.appointment_type] || appointment.appointment_type}
                        </h3>
                        <AppointmentStatusBadge status={appointment.status} />
                    </div>

                    {/* Date & Time */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center text-muted-foreground text-sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span className="font-medium">Date</span>
                            </div>
                            <p className="text-foreground pl-6">{formattedDate}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center text-muted-foreground text-sm">
                                <Clock className="w-4 h-4 mr-2" />
                                <span className="font-medium">Time</span>
                            </div>
                            <p className="text-foreground pl-6">
                                {formattedTime} ({appointment.duration_minutes} minutes)
                            </p>
                        </div>
                    </div>

                    {/* Provider */}
                    {(appointment.provider_details || appointment.provider) && (
                        <div className="space-y-1">
                            <div className="flex items-center text-muted-foreground text-sm">
                                <User className="w-4 h-4 mr-2" />
                                <span className="font-medium">Provider</span>
                            </div>
                            <div className="pl-6">
                                {appointment.provider_details && (
                                    <>
                                        <p className="text-foreground font-medium">{appointment.provider_details.name}</p>
                                        <p className="text-muted-foreground text-sm">{appointment.provider_details.email}</p>
                                    </>
                                )}
                                {appointment.provider && !appointment.provider_details && (
                                    <>
                                        <p className="text-foreground font-medium">
                                            {appointment.provider.firstname} {appointment.provider.lastname}
                                        </p>
                                        <p className="text-muted-foreground text-sm">{appointment.provider.email}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Employee (for admin view) */}
                    {appointment.employee && (
                        <div className="space-y-1">
                            <div className="flex items-center text-muted-foreground text-sm">
                                <User className="w-4 h-4 mr-2" />
                                <span className="font-medium">Employee</span>
                            </div>
                            <div className="pl-6">
                                <p className="text-foreground font-medium">
                                    {appointment.employee.firstname} {appointment.employee.lastname}
                                </p>
                                <p className="text-muted-foreground text-sm">{appointment.employee.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {appointment.notes && (
                        <div className="space-y-1">
                            <div className="flex items-center text-muted-foreground text-sm">
                                <FileText className="w-4 h-4 mr-2" />
                                <span className="font-medium">Notes</span>
                            </div>
                            <p className="text-foreground pl-6 whitespace-pre-wrap">{appointment.notes}</p>
                        </div>
                    )}

                    {/* Cancellation Reason */}
                    {appointment.cancellation_reason && (
                        <div className="space-y-1">
                            <div className="flex items-center text-destructive text-sm">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                <span className="font-medium">Cancellation Reason</span>
                            </div>
                            <p className="text-foreground pl-6">{appointment.cancellation_reason}</p>
                        </div>
                    )}

                    {/* Cancel Form */}
                    {showCancelForm && (
                        <div className="border border-border rounded-lg p-4 space-y-3">
                            <h4 className="font-medium text-foreground">Cancel Appointment</h4>
                            <textarea
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                placeholder="Please provide a reason for cancellation..."
                                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-20"
                                maxLength={500}
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowCancelForm(false);
                                        setCancellationReason("");
                                    }}
                                    size="sm"
                                >
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => handleStatusUpdate("cancelled")}
                                    disabled={loading || !cancellationReason.trim()}
                                    size="sm"
                                >
                                    {loading ? "Cancelling..." : "Confirm Cancellation"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {showActions && !showCancelForm && (
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                            {canConfirm && (
                                <Button
                                    onClick={() => handleStatusUpdate("confirmed")}
                                    disabled={loading}
                                    variant="default"
                                >
                                    {loading ? "Confirming..." : "Confirm Appointment"}
                                </Button>
                            )}
                            {canComplete && (
                                <Button
                                    onClick={() => handleStatusUpdate("completed")}
                                    disabled={loading}
                                    variant="secondary"
                                >
                                    {loading ? "Completing..." : "Mark as Completed"}
                                </Button>
                            )}
                            {canCancel && (
                                <Button
                                    onClick={() => setShowCancelForm(true)}
                                    disabled={loading}
                                    variant="destructive"
                                >
                                    Cancel Appointment
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {!showActions && (
                    <div className="p-6 border-t border-border">
                        <Button onClick={onClose} variant="outline" className="w-full">
                            Close
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
