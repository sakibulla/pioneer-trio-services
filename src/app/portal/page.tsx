"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ClientDashboard } from "@/components/portal/ClientDashboard";
import { CoordinatorDashboard } from "@/components/portal/CoordinatorDashboard";
import { MatchmakerDashboard } from "@/components/portal/MatchmakerDashboard";
import { AdminDashboard } from "@/components/portal/AdminDashboard";
import { portalApi, type AuthUser } from "@/lib/portal-api";

declare global {
  interface Window {
    google?: any;
  }
}

export default function ClientPortalPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth Form States
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const savedToken = portalApi.getToken();
    const savedUser = portalApi.getCurrentUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadGSI = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          callback: handleGoogleSignIn,
        });
        
        // Retry rendering button until element exists (guards against hydration race)
        const renderButton = () => {
          const btn = document.getElementById("google-signin-btn");
          if (btn && btn.children.length === 0) {
            window.google.accounts.id.renderButton(btn, {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "signin_with",
            });
          } else if (!btn) {
            // Element not ready yet, retry after a short delay
            setTimeout(renderButton, 100);
          }
        };
        
        renderButton();
      }
    };

    // Only load GSI once on mount, not on every user/token change
    if (!user && !token && typeof window !== "undefined") {
      // Check if script already exists
      if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = loadGSI;
        document.head.appendChild(script);

        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
      } else {
        // Script already loaded, just render button
        loadGSI();
      }
    }
  }, []); // Empty dependency array - only run once on mount

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);

    try {
      if (isLoginView) {
        const res = await portalApi.login(email, password);
        if (res?.success && res.data?.accessToken) {
          portalApi.setToken(res.data.accessToken, res.data.user);
          setToken(res.data.accessToken);
          setUser(res.data.user);
          setLoading(false);
        } else {
          setAuthError(res?.message || "Invalid credentials or account issue.");
        }
      } else {
        const res = await portalApi.register({ email, password, firstName, lastName });
        if (res?.success && res.data?.accessToken) {
          portalApi.setToken(res.data.accessToken, res.data.user);
          setToken(res.data.accessToken);
          setUser(res.data.user);
          setLoading(false);
        } else {
          setAuthError(res?.message || "Registration failed. Please check form.");
        }
      }
    } catch {
      setAuthError("Could not reach backend authentication server. Ensure server is online.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    portalApi.clearToken();
    setToken(null);
    setUser(null);
  };

  const handleGoogleSignIn = async (response: any) => {
    if (!response.credential) {
      setAuthError("Google sign-in failed. Please try again.");
      return;
    }

    setAuthError("");
    setGoogleLoading(true);

    try {
      const res = await portalApi.googleLogin(response.credential);
      if (res?.success && res.data?.accessToken) {
        portalApi.setToken(res.data.accessToken, res.data.user);
        setToken(res.data.accessToken);
        setUser(res.data.user);
        setLoading(false);
      } else {
        setAuthError(res?.message || "Google sign-in failed. Please try again.");
      }
    } catch (err) {
      setAuthError("Could not reach authentication server. Ensure server is online.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // 1. Unauthenticated Login / Register View
  if (!user || !token) {
    return (
      <div className="min-h-[80vh] bg-stone-50 py-12">
        <Container className="max-w-xl">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900 text-brand-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-serif text-3xl font-bold text-stone-900">
              Pioneer Trio Client Portal
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Secure case tracking, document verification, and matchmaking introductions for global Bangladeshis.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex border-b border-stone-200 pb-4">
              <button
                type="button"
                className={`flex-1 pb-2 text-center text-sm font-semibold transition-colors ${
                  isLoginView
                    ? "border-b-2 border-brand-700 text-brand-700"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                onClick={() => {
                  setIsLoginView(true);
                  setAuthError("");
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`flex-1 pb-2 text-center text-sm font-semibold transition-colors ${
                  !isLoginView
                    ? "border-b-2 border-brand-700 text-brand-700"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                onClick={() => {
                  setIsLoginView(false);
                  setAuthError("");
                }}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              {!isLoginView && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                      placeholder="Sakib"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                      placeholder="Hasan"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {isLoginView && (
                  <div className="mt-2 text-right">
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={authSubmitting}
                className="w-full bg-brand-900 text-white hover:bg-brand-800"
              >
                {authSubmitting ? "Connecting..." : isLoginView ? "Sign In to Portal" : "Create My Portal Account"}
              </Button>
            </form>

            <div className="mt-4">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-stone-200" />
                <span className="mx-3 text-xs text-stone-400">or continue with</span>
                <div className="flex-grow border-t border-stone-200" />
              </div>
              <div className="mt-3">
                {googleLoading ? (
                  <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-50 py-2.5 text-sm text-stone-500">
                    Signing in with Google...
                  </div>
                ) : (
                  <div id="google-signin-btn" className="flex justify-center" />
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // 2. Role-based Dashboard Routing
  if (loading) {
    return (
      <div className="min-h-[80vh] bg-stone-50 flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-200 border-t-brand-700" />
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  const normalizedRole = user.role?.toLowerCase() || '';
  switch (normalizedRole) {
    case "client":
      return <ClientDashboard user={user} token={token} onLogout={handleLogout} />;
    case "coordinator":
      return <CoordinatorDashboard user={user} token={token} onLogout={handleLogout} />;
    case "matchmaker":
      return <MatchmakerDashboard user={user} token={token} onLogout={handleLogout} />;
    case "admin":
      return <AdminDashboard user={user} token={token} onLogout={handleLogout} />;
    default:
      return (
        <div className="min-h-[80vh] bg-stone-50 py-12">
          <Container className="max-w-2xl">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-red-600" />
              <h2 className="mt-3 text-lg font-bold text-red-900">Unknown Role</h2>
              <p className="mt-2 text-sm text-red-700">
                Your account role ({user.role}) is not recognized. Please contact support for assistance.
              </p>
              <Button
                onClick={handleLogout}
                className="mt-4"
              >
                Sign Out
              </Button>
            </div>
          </Container>
        </div>
      );
  }
}
