"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to send reset code. Please try again.");
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
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold text-stone-900">
            Reset Your Password
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Enter your email and we'll send you a reset code.
          </p>
        </div>

        {!submitted ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  placeholder="client@example.com"
                />
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
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>

            <div className="mt-6 border-t border-stone-100 pt-4">
              <p className="text-center text-xs text-stone-500">
                Don't have an account?{" "}
                <Link
                  href="/portal"
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-stone-900">
              Check Your Email
            </h2>
            <p className="mt-3 text-sm text-stone-600">
              We've sent a 6-digit reset code to <strong>{email}</strong>.
            </p>
            <p className="mt-2 text-sm text-stone-600">
              Please check your inbox and follow the instructions to reset your password.
            </p>

            <div className="mt-6 space-y-3 border-t border-stone-200 pt-4">
              <p className="text-xs text-stone-500">
                Didn't receive the code? Check your spam folder.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                  setError("");
                }}
                className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                Try Another Email
              </button>
              <Link
                href="/portal"
                className="block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
