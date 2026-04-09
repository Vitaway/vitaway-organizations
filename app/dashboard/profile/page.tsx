"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Mail, Phone, MapPin } from "lucide-react";
import { getOrganizationProfile, updateOrganizationProfile } from "@/lib/api-client";
import { PageLoading } from "@/components/ui/page-loading";
import { PageError } from "@/components/ui/page-error";
import { useApiQuery } from "@/hooks/useApiQuery";
import { ApiResponse } from "@/types";

interface OrganizationProfile {
  id: number;
  name: string;
  code: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: string;
  subscription_plan: string;
  max_users: number;
  subscription_start_date: string;
  subscription_end_date: string;
  created_at: string;
}

export default function ProfilePage() {
  // â€”â€”â€” Profile (read) â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
  const {
    data: profile,
    loading,
    error,
    errorType,
    retry: retryProfile,
  } = useApiQuery(async () => {
    const response = (await getOrganizationProfile()) as ApiResponse<OrganizationProfile>;
    if (!response?.success || !response.data) throw new Error(response?.message || "Failed to load profile");
    return response.data;
  }, []);

  // â€”â€”â€” Edit form state â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setPhone(profile.phone ?? "");
      setAddress(profile.address ?? "");
      setCity(profile.city ?? "");
      setCountry(profile.country ?? "");
    }
  }, [profile]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);
    setSaving(true);
    try {
      const response = (await updateOrganizationProfile({
        name, email, phone, address, city, country,
      })) as ApiResponse<unknown>;
      if (response?.success) {
        setSaveSuccess("Profile updated successfully");
        retryProfile();
      } else {
        setSaveError((response as { message?: string })?.message || "Failed to update profile");
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoading message="Loading organization profileâ€¦" />;
  if (error) return <PageError error={error} errorType={errorType} onRetry={retryProfile} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Organization Profile</h1>
        <p className="text-muted-foreground">Manage your organization details and subscription</p>
      </div>

      {/* Subscription & Status Card */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {profile.name}
            </CardTitle>
            <CardDescription>Code: {profile.code} &middot; Type: {profile.type}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={profile.status === "active" ? "default" : "secondary"}>
                  {profile.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subscription Plan</p>
                <p className="text-sm font-medium">{profile.subscription_plan || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Users</p>
                <p className="text-sm font-medium">{profile.max_users}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subscription Period</p>
                <p className="text-sm font-medium">
                  {profile.subscription_start_date || "N/A"} &mdash; {profile.subscription_end_date || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Details</CardTitle>
          <CardDescription>Update your organization contact and location information</CardDescription>
        </CardHeader>
        <CardContent>
          {saveError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{saveError}</div>
          )}
          {saveSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{saveSuccess}</div>
          )}
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-1" /> Email
                </Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-1" /> Phone
                </Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="inline h-4 w-4 mr-1" /> Address
                </Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


interface OrganizationProfile {
  id: number;
  name: string;
  code: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: string;
  subscription_plan: string;
  max_users: number;
  subscription_start_date: string;
  subscription_end_date: string;
  created_at: string;
}
