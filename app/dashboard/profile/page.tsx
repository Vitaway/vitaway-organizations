/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Mail, Phone, MapPin } from "lucide-react";
import { getOrganizationProfile, updateOrganizationProfile } from "@/lib/api-client";

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
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const response = (await getOrganizationProfile()) as any;
      if (response?.success && response.data) {
        const data = response.data;
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setCountry(data.country || "");
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const response = (await updateOrganizationProfile({
        name,
        email,
        phone,
        address,
        city,
        country,
      })) as any;
      if (response?.success) {
        setSuccess("Profile updated successfully");
        fetchProfile();
      } else {
        setError(response?.message || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Profile</h1>
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
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{success}</div>
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
