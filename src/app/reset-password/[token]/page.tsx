"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Password validation rules
  const passwordRules = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
  };

  const isPasswordValid =
    Object.values(passwordRules).every(Boolean) && password === confirmPassword;

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch(
          `https://pioneer-backend-5qhe.onrender.com/api/password-reset/validate?token=${token}`
        );

        if (res.ok) {
          const data = await res.json();
          setTokenValid(data.valid !== false);
        } else {
          setTokenValid(false);
        }
      } catch (err) {
        setTokenValid(false);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      validateToken();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setError("");
    setValidating(true);

    try {
      const res = await fetch(
        "https://pioneer-backend-5qhe.onrender.com/api/password-reset/confirm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => router.push("/portal"), 3000);
      } else {
        setError("Failed to reset password. Please try again or request a new link.");
      }
    } catch (err) {
      setError("Could not reach the server. Please try again later.");
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 dark:bg-stone-900">
        <Container className="max-w-md">
          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:shadow-xl dark:shadow-black/20">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-900 dark:border-brand-900/20 dark:border-t-brand-500" />
            </div>
            <p className="mt-4 text-center text-sm text-stone-600 dark:text-stone-400">
              Validating reset link...
            </p>
          </div>
        </Container>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 dark:bg-stone-900">
        <Container className="max-w-md">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
              Invalid Reset Link
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              This password reset link has expired or is invalid. Please request a new one.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:shadow-xl dark:shadow-black/20">
            <Link
              href="/forgot-password"
              className="block w-full rounded-full border-2 border-brand-600 px-6 py-3 text-center text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 dark:border-brand-500 dark:text-brand-400 dark:hover:bg-brand-900/30"
            >
              Request New Reset Link
            </Link>
            <Link
              href="/portal"
              className="mt-3 block w-full rounded-full border-2 border-stone-300 px-6 py-3 text-center text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Back to Portal
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 dark:bg-stone-900">
        <Container className="max-w-md">
          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:shadow-xl dark:shadow-black/20">
            <div className="flex justify-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h2 className="mt-4 text-center font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
              Password Reset Successfully
            </h2>
            <p className="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
              Your password has been updated. You'll be redirected to the portal shortly.
            </p>
            <div className="mt-6">
              <Link
                href="/portal"
                className="block w-full rounded-full bg-brand-900 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-800 dark:bg-brand-800 dark:hover:bg-brand-700"
              >
                Go to Portal Now
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 dark:bg-stone-900">
      <Container className="max-w-md">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900 text-brand-300 dark:bg-brand-800 dark:text-brand-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
            Create New Password
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Enter a strong password to secure your account.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:shadow-xl dark:shadow-black/20">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-4 py-2 pr-10 text-sm transition-colors focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-400 dark:hover:text-stone-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-4 py-2 pr-10 text-sm transition-colors focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-400 dark:hover:text-stone-300"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-900/50">
              <p className="mb-3 text-xs font-semibold text-stone-700 dark:text-stone-300">
                Password must contain:
              </p>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                <li className="flex items-center gap-2">
                  {passwordRules.minLength ? (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-stone-400" />
                  )}
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  {passwordRules.hasUppercase ? (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-stone-400" />
                  )}
                  One uppercase letter (A-Z)
                </li>
                <li className="flex items-center gap-2">
                  {passwordRules.hasNumber ? (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-stone-400" />
                  )}
                  One number (0-9)
                </li>
                <li className="flex items-center gap-2">
                  {passwordRules.hasSpecial ? (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-stone-400" />
                  )}
                  One special character (!@#$%^&*)
                </li>
                {password && confirmPassword && (
                  <li className="flex items-center gap-2">
                    {password === confirmPassword ? (
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    Passwords match
                  </li>
                )}
              </ul>
            </div>

            <Button
              type="submit"
              disabled={!isPasswordValid || validating}
              className="w-full bg-brand-900 text-white hover:bg-brand-800 disabled:opacity-60 dark:bg-brand-800 dark:hover:bg-brand-700"
            >
              {validating ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-stone-500 dark:text-stone-400">
            Remember your password?{" "}
            <Link
              href="/portal"
              className="font-medium text-brand-700 hover:underline dark:text-brand-400"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
