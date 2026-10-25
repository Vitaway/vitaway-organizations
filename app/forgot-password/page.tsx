"use client";

import { useState } from "react";
import { forgotPassword } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const response = await forgotPassword(email);
            if (response.success) {
                const debugCode = response.data?.debugCode;
                setSuccess(
                    debugCode
                        ? `Development code ${debugCode}. Use it on the next screen. The same code is emailed, and sent on WhatsApp or SMS when the account has a phone number.`
                        : "If this address belongs to an organisation administrator, a 6-digit code is on its way by email. Accounts with a phone number also receive it on WhatsApp, with SMS as a fallback."
                );
            } else {
                setError(response.message || "Failed to send a reset code.");
            }
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, "Something went wrong. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-background px-4">
            <div className="flex flex-col items-center justify-center">
                <div className="text-center">
                    <Image src="https://ehr.vitaway.org/logo.png" alt="Vitaway Logo" width={120} height={40} />
                </div>
            </div>
            <Card className="w-full max-w-md bg-card border-border">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
                    <CardDescription className="text-center">
                        We&apos;ll send a 6-digit code to reset your password. It expires in 10 minutes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-red-800 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-start gap-2 p-3 text-sm text-green-800 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>{success}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@organization.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="username"
                                disabled={isLoading}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Sending...
                                </>
                            ) : (
                                "Send reset code"
                            )}
                        </Button>

                        {success ? (
                            <Button asChild className="w-full" variant="outline">
                                <Link href={`/reset-password?email=${encodeURIComponent(email.trim())}`}>
                                    Enter reset code
                                </Link>
                            </Button>
                        ) : null}
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
            <p className="mt-8 text-center text-xs text-muted-foreground">
                &copy; 2026 Vitaway. All rights reserved.
            </p>
        </div>
    );
}
