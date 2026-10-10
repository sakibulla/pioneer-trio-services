"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/password-reset/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to portal after 3 seconds
        setTimeout(() => {
          window.location.href = "/portal";
        }, 3000);
      } else {
        setError(data.message || "Failed to reset password. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-white py-12">
      <Container className="max-w-md">
        <div className="text-center">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900 text-brand-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold text-stone-900">
            Create New Password
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Enter the code from your email and set a new password.
          </p>
        </div>

        {!success ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-center text-2xl font-bold tracking-widest focus:border-brand-500 focus:outline-none"
                  placeholder="000000"
                />
                <p className="mt-1 text-xs text-stone-500">
                  Check your email for the code
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 pr-10 text-sm focus:border-brand-500 focus:outline-none"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Min 8 chars, uppercase, number, special char
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 pr-10 text-sm focus:border-brand-500 focus:outline-none"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-900 text-white hover:bg-brand-800"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-4 border-t border-stone-100 pt-4">
              <Link
                href="/forgot-password"
                className="text-center block text-xs text-brand-700 hover:underline"
              >
                Didn't get a code? Request a new one
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-stone-900">
              Password Reset Successful
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Your password has been updated. Redirecting to login...
            </p>
            <Link
              href="/portal"
              className="mt-6 inline-block w-full rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Go to Login Now
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
