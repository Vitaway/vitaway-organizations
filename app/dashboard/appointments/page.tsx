"use client";

import { useState, useEffect } from "react";
import { Appointment, AppointmentStatistics } from "@/types";
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

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [statistics, setStatistics] = useState<AppointmentStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [filterTab, setFilterTab] = useState("upcoming");

    useEffect(() => {
        fetchAppointments();
        fetchStatistics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, filterTab]);

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any =
                activeTab === "all"
                    ? await getOrganizationAppointments({
                        filter: filterTab,
                        per_page: 50,
                    })
                    : await getMyAppointments({
                        filter: filterTab,
                        per_page: 50,
                    });

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

    const fetchStatistics = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await getAppointmentStatistics() as any;
            if (response.success && response.data) {
                setStatistics(response.data);
            }
        } catch (err) {
            console.error("Failed to load statistics:", err);
        }
    };

    const handleViewDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
    };

    const handleAppointmentUpdate = () => {
        fetchAppointments();
        fetchStatistics();
        setSelectedAppointment(null);
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Appointments Management</h1>
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
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{statistics.scheduled}</p>
                                <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-success">{statistics.confirmed}</p>
                                <p className="text-xs text-muted-foreground mt-1">Confirmed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-muted">{statistics.completed}</p>
                                <p className="text-xs text-muted-foreground mt-1">Completed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-destructive">{statistics.cancelled}</p>
                                <p className="text-xs text-muted-foreground mt-1">Cancelled</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">{statistics.total}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md">
                        {error}
                    </div>
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
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="mt-4 text-muted-foreground">Loading appointments...</p>
                            </div>
                        ) : (
                            <AppointmentList
                                appointments={appointments}
                                showProvider={true}
                                showEmployee={true}
                                onViewDetails={handleViewDetails}
                                emptyMessage="No appointments found in your organization."
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="mine" className="mt-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="mt-4 text-muted-foreground">Loading appointments...</p>
                            </div>
                        ) : (
                            <AppointmentList
                                appointments={appointments}
                                showProvider={false}
                                showEmployee={true}
                                onViewDetails={handleViewDetails}
                                emptyMessage="No appointments booked with you."
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>

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
