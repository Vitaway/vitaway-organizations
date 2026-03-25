"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== passwordConfirmation) {
            setError("Passwords do not match.");
            return;
        }

        if (!token || !email) {
            setError("Invalid reset link. Please request a new password reset.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await resetPassword({
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            if (response.success) {
                setSuccess(response.message || "Password has been reset successfully.");
                setTimeout(() => router.push("/login"), 3000);
            } else {
                setError(response.message || "Failed to reset password.");
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md bg-card border-border">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                    Enter your new password below.
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
                        <div className="flex items-center gap-2 p-3 text-sm text-green-800 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>{success} Redirecting to login...</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            disabled={isLoading || !!success}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            placeholder="Confirm new password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            minLength={8}
                            disabled={isLoading || !!success}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading || !!success}>
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Resetting...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-background px-4">
            <div className="flex flex-col items-center justify-center">
                <div className="text-center">
                    <Image src="https://ehr.vitaway.org/logo.png" alt="Vitaway Logo" width={120} height={40} />
                </div>
            </div>
            <Suspense fallback={
                <Card className="w-full max-w-md bg-card border-border">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </CardContent>
                </Card>
            }>
                <ResetPasswordForm />
            </Suspense>
            <p className="mt-8 text-center text-xs text-muted-foreground">
                &copy; 2026 Vitaway. All rights reserved.
            </p>
        </div>
    );
}
