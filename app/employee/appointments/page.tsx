/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Appointment } from "@/types";
import { getEmployeeAppointments } from "@/lib/api-client";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { AppointmentBookingDialog } from "@/components/appointments/appointment-booking-dialog";
import { AppointmentDetailsDialog } from "@/components/appointments/appointment-details-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Calendar, Plus, Clock, CheckCircle, XCircle } from "lucide-react";

export default function EmployeeAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showBookingDialog, setShowBookingDialog] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [activeTab, setActiveTab] = useState("upcoming");

    useEffect(() => {
        fetchAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = (await getEmployeeAppointments({
                filter: activeTab,
                per_page: 50,
            })) as any;

            if (response.success && response.data) {
                setAppointments(response.data.data || response.data);
            }
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const handleBookingSuccess = () => {
        fetchAppointments();
        setShowBookingDialog(false);
    };

    const handleViewDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
    };

    const getStats = () => {
        const scheduled = appointments.filter((a) => a.status === "scheduled").length;
        const confirmed = appointments.filter((a) => a.status === "confirmed").length;
        const completed = appointments.filter((a) => a.status === "completed").length;
        const cancelled = appointments.filter((a) => a.status === "cancelled").length;

        return { scheduled, confirmed, completed, cancelled };
    };

    const stats = getStats();

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
                        <p className="text-muted-foreground mt-1">
                            Book and manage your appointments with organization partners
                        </p>
                    </div>
                    <Button onClick={() => setShowBookingDialog(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Book Appointment
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Scheduled</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stats.scheduled}</p>
                            </div>
                            <Clock className="w-8 h-8 text-primary" />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Confirmed</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stats.confirmed}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stats.completed}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-muted" />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Cancelled</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stats.cancelled}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-destructive" />
                        </div>
                    </Card>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md">
                        {error}
                    </div>
                )}

                {/* Appointments Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="upcoming" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            Upcoming
                        </TabsTrigger>
                        <TabsTrigger value="past" className="gap-2">
                            <Clock className="w-4 h-4" />
                            Past
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="mt-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="mt-4 text-muted-foreground">Loading appointments...</p>
                            </div>
                        ) : (
                            <AppointmentList
                                appointments={appointments}
                                showProvider={true}
                                onViewDetails={handleViewDetails}
                                emptyMessage="No upcoming appointments. Book one to get started!"
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="mt-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="mt-4 text-muted-foreground">Loading appointments...</p>
                            </div>
                        ) : (
                            <AppointmentList
                                appointments={appointments}
                                showProvider={true}
                                onViewDetails={handleViewDetails}
                                emptyMessage="No past appointments found."
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Booking Dialog */}
            <AppointmentBookingDialog
                isOpen={showBookingDialog}
                onClose={() => setShowBookingDialog(false)}
                onSuccess={handleBookingSuccess}
            />

            {/* Details Dialog */}
            <AppointmentDetailsDialog
                appointment={selectedAppointment}
                isOpen={!!selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
                showActions={false}
            />
        </div>
    );
}
