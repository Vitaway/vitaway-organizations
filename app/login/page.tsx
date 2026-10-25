/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mfaCode, setMfaCode] = useState("");
    const [challengeToken, setChallengeToken] = useState("");
    const [debugCode, setDebugCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, verifyMfa } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (challengeToken) {
                await verifyMfa(challengeToken, mfaCode);
                return;
            }
            const result = await login(email, password);
            if (result.mfaRequired) {
                setChallengeToken(result.challengeToken);
                setDebugCode(result.debugCode ?? "");
                setMfaCode("");
            }
        } catch (err: any) {
            setError(err.message || "Invalid email or password");
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
                    <CardTitle className="text-2xl text-center">
                        {challengeToken ? "Check your email" : "Sign in"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {challengeToken
                            ? "Enter the 6-digit code we sent to finish signing in."
                            : "Access your organization dashboard"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-red-800 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        {challengeToken ? (
                            <div className="space-y-2">
                                <Label htmlFor="mfa-code">Verification code</Label>
                                <Input
                                    id="mfa-code"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder="6-digit code"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    required
                                    minLength={6}
                                    maxLength={6}
                                    pattern="\d{6}"
                                    disabled={isLoading}
                                />
                                {debugCode ? (
                                    <p className="text-xs text-muted-foreground">Development code {debugCode}</p>
                                ) : null}
                            </div>
                        ) : (
                            <>
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

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <PasswordInput
                                        id="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    {challengeToken ? "Verifying..." : "Signing in..."}
                                </>
                            ) : (
                                challengeToken ? "Verify code" : "Sign In"
                            )}
                        </Button>
                        {challengeToken ? (
                            <button
                                type="button"
                                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => {
                                    setChallengeToken("");
                                    setMfaCode("");
                                    setDebugCode("");
                                    setError("");
                                }}
                            >
                                Use a different account
                            </button>
                        ) : null}
                    </form>
                </CardContent>
            </Card>
            {/* Footer */}
            <p className="mt-8 text-center text-xs text-muted-foreground">
                &copy; 2026 Vitaway. All rights reserved.
            </p>
        </div>
    );
}
