/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Provider } from "@/types";
import { getAvailableProviders, bookAppointment } from "@/lib/api-client";
import { X, Calendar, Clock, User, FileText } from "lucide-react";

interface AppointmentBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AppointmentBookingDialog({
  isOpen,
  onClose,
  onSuccess,
}: AppointmentBookingDialogProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    provider_id: "",
    provider_type: "organization_admin",
    appointment_type: "consultation",
    appointment_date: "",
    appointment_time: "",
    duration_minutes: "30",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  const fetchProviders = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await getAvailableProviders() as any;
      if (response.success && response.data) {
        setProviders(response.data);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to load providers");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = (await bookAppointment({
        provider_id: parseInt(formData.provider_id),
        provider_type: formData.provider_type,
        appointment_type: formData.appointment_type,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        duration_minutes: parseInt(formData.duration_minutes),
        notes: formData.notes || undefined,
      })) as any;

      if (response.success) {
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({
          provider_id: "",
          provider_type: "organization_admin",
          appointment_type: "consultation",
          appointment_date: "",
          appointment_time: "",
          duration_minutes: "30",
          notes: "",
        });
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Book Appointment</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider_id" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Provider *
            </Label>
            <select
              id="provider_id"
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              required
            >
              <option value="">Select a provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} - {provider.email}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="appointment_type">Appointment Type *</Label>
            <select
              id="appointment_type"
              value={formData.appointment_type}
              onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              required
            >
              <option value="consultation">Consultation</option>
              <option value="coaching">Coaching</option>
              <option value="mental_health">Mental Health</option>
              <option value="nutrition">Nutrition</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date *
              </Label>
              <Input
                id="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                min={today}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time *
              </Label>
              <Input
                id="appointment_time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
            <select
              id="duration_minutes"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              required
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes (Optional)
            </Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-20"
              maxLength={500}
              placeholder="Add any additional information..."
            />
            <p className="text-xs text-muted-foreground">
              {formData.notes.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
