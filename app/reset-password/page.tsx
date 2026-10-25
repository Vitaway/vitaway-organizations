"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword, verifyResetCode } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const legacyToken = searchParams.get("token");
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [code, setCode] = useState("");
    const [codeVerified, setCodeVerified] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!/^\d{6}$/.test(code.trim())) {
            setError("Enter the 6-digit code from your email or phone.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await verifyResetCode(email, code);
            if (response.success === false) {
                setError(response.message || "That code was not accepted.");
                return;
            }
            setCodeVerified(true);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, "That code was not accepted."));
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== passwordConfirmation) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Use at least 8 characters.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await resetPassword({ email, code, password });
            if (response.success === false) {
                setError(response.message || "Failed to reset password.");
                return;
            }
            setSuccess(response.message || "Password has been reset successfully.");
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, "Something went wrong. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md bg-card border-border">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                    {codeVerified
                        ? "Choose a new password. The code expires in 10 minutes."
                        : "Enter the 6-digit code from your email. If the account has a phone number, the same code was also sent on WhatsApp or SMS."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {legacyToken ? (
                    <div className="mb-4 flex items-start gap-2 p-3 text-sm text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Reset links are no longer used. Request a 6-digit code and enter it here.</span>
                    </div>
                ) : null}

                <form onSubmit={codeVerified ? handleReset : handleVerify} className="space-y-4">
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
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            disabled={isLoading || codeVerified || !!success}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code">Reset code</Label>
                        <Input
                            id="code"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            required
                            minLength={6}
                            maxLength={6}
                            pattern="\d{6}"
                            disabled={isLoading || codeVerified || !!success}
                        />
                    </div>

                    {codeVerified ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <PasswordInput
                                    id="password"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    disabled={isLoading || !!success}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    placeholder="Confirm new password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    disabled={isLoading || !!success}
                                />
                            </div>
                        </>
                    ) : null}

                    <Button type="submit" className="w-full" disabled={isLoading || !!success}>
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                {codeVerified ? "Resetting..." : "Checking code..."}
                            </>
                        ) : (
                            codeVerified ? "Reset Password" : "Verify code"
                        )}
                    </Button>
                </form>

                <div className="mt-6 flex items-center justify-between text-sm">
                    {codeVerified ? (
                        <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => {
                                setCodeVerified(false);
                                setCode("");
                                setPassword("");
                                setPasswordConfirmation("");
                                setError("");
                            }}
                        >
                            Use a different code
                        </button>
                    ) : (
                        <Link
                            href="/forgot-password"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Request a new code
                        </Link>
                    )}
                    <Link
                        href="/login"
                        className="text-muted-foreground hover:text-foreground transition-colors"
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
