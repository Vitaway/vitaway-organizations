"use client";

import { useState, useCallback } from "react";
import { Appointment, AppointmentStatistics, ApiResponse } from "@/types";
import {
    getOrganizationAppointments,
    getMyAppointments,
    getAppointmentStatistics,
} from "@/lib/api-client";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { AppointmentDetailsDialog } from "@/components/appointments/appointment-details-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Calendar, CheckCircle, BarChart3, Users } from "lucide-react";
import { PageLoading } from "@/components/ui/page-loading";
import { PageError } from "@/components/ui/page-error";
import { useApiQuery } from "@/hooks/useApiQuery";

export default function AdminAppointmentsPage() {
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [filterTab, setFilterTab] = useState("upcoming");

    // â€”â€”â€” Appointments list â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
    const loadAppointments = useCallback(async () => {
        const response = (
            activeTab === "all"
                ? await getOrganizationAppointments({ filter: filterTab, per_page: 50 })
                : await getMyAppointments({ filter: filterTab, per_page: 50 })
        ) as ApiResponse<{ data: Appointment[] } | Appointment[]>;
        if (!response?.success) throw new Error("Failed to load appointments");
        const data = response.data;
        return Array.isArray(data) ? data : (data as { data: Appointment[] }).data ?? [];
    }, [activeTab, filterTab]);

    const {
        data: appointments,
        loading,
        error,
        errorType,
        retry: retryAppointments,
    } = useApiQuery(loadAppointments, [activeTab, filterTab]);

    // â€”â€”â€” Statistics â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
    const { data: statistics, retry: retryStatistics } = useApiQuery(async () => {
        const response = (await getAppointmentStatistics()) as ApiResponse<AppointmentStatistics>;
        return response?.success ? (response.data ?? null) : null;
    }, []);

    const handleViewDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
    };

    const handleAppointmentUpdate = () => {
        retryAppointments();
        retryStatistics();
        setSelectedAppointment(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Appointments Management</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage appointments within your organization
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{statistics.total}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-primary" />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Upcoming</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{statistics.upcoming}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-primary" />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{statistics.completed}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completion Rate</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {statistics.completion_rate.toFixed(1)}%
                                </p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-success" />
                        </div>
                    </Card>
                </div>
            )}

            {/* Status Breakdown */}
            {statistics && (
                <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-4">Status Breakdown</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {(
                            [
                                { label: "Scheduled", value: statistics.scheduled },
                                { label: "Confirmed", value: statistics.confirmed },
                                { label: "Completed", value: statistics.completed },
                                { label: "Cancelled", value: statistics.cancelled },
                                { label: "Total", value: statistics.total },
                            ] as const
                        ).map(({ label, value }) => (
                            <div key={label} className="text-center">
                                <p className="text-2xl font-bold text-primary">{value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Appointments Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="all" className="gap-2">
                        <Users className="w-4 h-4" />
                        All Appointments
                    </TabsTrigger>
                    <TabsTrigger value="mine" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        My Appointments
                    </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
                        <TabsList className="grid w-full max-w-sm grid-cols-2">
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                            <TabsTrigger value="past">Past</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <TabsContent value="all" className="mt-6">
                    {loading ? (
                        <PageLoading message="Loading appointments" />
                    ) : error ? (
                        <PageError error={error} errorType={errorType} onRetry={retryAppointments} />
                    ) : (
                        <AppointmentList
                            appointments={appointments ?? []}
                            showProvider={true}
                            showEmployee={true}
                            onViewDetails={handleViewDetails}
                            emptyMessage="No appointments found in your organization."
                        />
                    )}
                </TabsContent>

                <TabsContent value="mine" className="mt-6">
                    {loading ? (
                        <PageLoading message="Loading appointments" />
                    ) : error ? (
                        <PageError error={error} errorType={errorType} onRetry={retryAppointments} />
                    ) : (
                        <AppointmentList
                            appointments={appointments ?? []}
                            showProvider={false}
                            showEmployee={true}
                            onViewDetails={handleViewDetails}
                            emptyMessage="No appointments booked with you."
                        />
                    )}
                </TabsContent>
            </Tabs>

            {/* Details Dialog */}
            <AppointmentDetailsDialog
                appointment={selectedAppointment}
                isOpen={!!selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
                onUpdate={handleAppointmentUpdate}
                showActions={true}
            />
        </div>
    );
}
