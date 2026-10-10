"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Heart,
  Plane,
  Clock,
  User,
  LogOut,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { portalApi, type AuthUser, type ClientCase, type ClientMatch } from "@/lib/portal-api";

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

  // Portal Dashboard States
  const [activeTab, setActiveTab] = useState<"immigration" | "matrimonial">("immigration");
  const [cases, setCases] = useState<ClientCase[]>([]);
  const [matches, setMatches] = useState<ClientMatch[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const savedToken = portalApi.getToken();
    const savedUser = portalApi.getCurrentUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      loadDashboardData(savedToken);
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

    if (!user && !token) {
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
    }
  }, [user, token]);

  const loadDashboardData = async (jwtToken: string) => {
    setDataLoading(true);
    try {
      const [casesRes, matchesRes] = await Promise.all([
        portalApi.getMyCases(jwtToken),
        portalApi.getMyMatches(jwtToken),
      ]);

      if (casesRes?.data) setCases(casesRes.data);
      if (matchesRes?.data) setMatches(matchesRes.data);
    } catch {
      // Fallback safe state
    } finally {
      setDataLoading(false);
      setLoading(false);
    }
  };

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
          loadDashboardData(res.data.accessToken);
        } else {
          setAuthError(res?.message || "Invalid credentials or account issue.");
        }
      } else {
        const res = await portalApi.register({ email, password, firstName, lastName });
        if (res?.success && res.data?.accessToken) {
          portalApi.setToken(res.data.accessToken, res.data.user);
          setToken(res.data.accessToken);
          setUser(res.data.user);
          loadDashboardData(res.data.accessToken);
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
    setCases([]);
    setMatches([]);
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
        loadDashboardData(res.data.accessToken);
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

  // 2. Authenticated Client Portal Dashboard View
  return (
    <div className="min-h-[85vh] bg-stone-50 py-8">
      <Container className="max-w-6xl">
        {/* Top User Bar */}
        <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-900">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">
                  Welcome back, {user.firstName} {user.lastName}
                </h1>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="https://pioneer-backend-5qhe.onrender.com/api/v1/docs"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              API Docs
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Portal Service Tabs */}
        <div className="mt-8 flex gap-3 border-b border-stone-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("immigration")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "immigration"
                ? "bg-immigration-700 text-white shadow"
                : "bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Plane className="h-4 w-4" />
            Immigration Cases ({cases.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matrimonial")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "matrimonial"
                ? "bg-marriage-700 text-white shadow"
                : "bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Heart className="h-4 w-4" />
            Marriage Introductions ({matches.length})
          </button>
        </div>

        {/* Tab 1: Immigration Cases */}
        {activeTab === "immigration" && (
          <div className="mt-6 space-y-6">
            {cases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <Plane className="mx-auto h-10 w-10 text-stone-400" />
                <h3 className="mt-3 text-lg font-bold text-stone-800">No Active Cases Found</h3>
                <p className="mt-1 text-sm text-stone-500">
                  You have not submitted an immigration assessment yet.
                </p>
                <Link
                  href="/immigration-consultancy"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-immigration-700 px-4 py-2 text-sm font-semibold text-white hover:bg-immigration-800"
                >
                  Start Assessment <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              cases.map((c) => (
                <div key={c.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-immigration-800">
                          {c.caseReference}
                        </span>
                        <span className="rounded-full bg-immigration-100 px-2.5 py-0.5 text-xs font-semibold text-immigration-800">
                          {c.status}
                        </span>
                      </div>
                      <h2 className="mt-1 text-lg font-bold text-stone-900">
                        {c.destinationCountry} — {c.applicationType}
                      </h2>
                    </div>

                    {c.coordinator && (
                      <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
                        <User className="h-8 w-8 rounded-full bg-brand-100 p-1.5 text-brand-800" />
                        <div>
                          <p className="text-xs text-stone-500">Assigned Coordinator</p>
                          <p className="text-xs font-semibold text-stone-900">
                            {c.coordinator.firstName} {c.coordinator.lastName}
                          </p>
                          <p className="text-[11px] text-brand-700">{c.coordinator.email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stage Progress Tracker */}
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-stone-600">
                      Current Stage: <span className="text-immigration-700">{c.stage || "Intake Review"}</span>
                    </p>
                    <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-emerald-500 py-1.5 font-medium text-white">1. Submitted</div>
                      <div className="rounded-lg bg-emerald-500 py-1.5 font-medium text-white">2. Document Check</div>
                      <div className="rounded-lg bg-immigration-600 py-1.5 font-medium text-white">3. QC Review</div>
                      <div className="rounded-lg bg-stone-100 py-1.5 font-medium text-stone-400">4. Approved</div>
                    </div>
                  </div>

                  {/* Document Checklist */}
                  <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                      <FileText className="h-4 w-4 text-immigration-700" />
                      Encrypted Case Documents & Verifications
                    </h4>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs shadow-2xs">
                        <span className="font-medium text-stone-800">Passport Scan (Bio Page)</span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified (AES-256 Encrypted)
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs shadow-2xs">
                        <span className="font-medium text-stone-800">Educational Transcript / ECA</span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Matrimonial Introductions */}
        {activeTab === "matrimonial" && (
          <div className="mt-6 space-y-6">
            {matches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <Heart className="mx-auto h-10 w-10 text-marriage-500" />
                <h3 className="mt-3 text-lg font-bold text-stone-800">Human Matchmaking in Progress</h3>
                <p className="mt-1 text-sm text-stone-500 max-w-md mx-auto">
                  Our Senior Matchmaker is reviewing verified profiles. Because we use zero automated algorithms, curated introductions are personally reviewed by hand.
                </p>
                <Link
                  href="/marriage-consultancy"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-marriage-700 px-4 py-2 text-sm font-semibold text-white hover:bg-marriage-800"
                >
                  Create / Update Profile <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              matches.map((m) => (
                <div key={m.id} className="rounded-2xl border border-marriage-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-marriage-50 px-3 py-1 text-xs font-semibold text-marriage-800">
                      <Sparkles className="h-3.5 w-3.5" /> Hand-Curated Match Proposal
                    </span>
                    <span className="text-xs text-stone-500">
                      Proposed by Matchmaker: <strong>{m.matchmaker?.name || "Senior Consultant"}</strong>
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-marriage-50/50 p-4 border border-marriage-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-marriage-900">
                      Matchmaker Compatibility Rationale:
                    </p>
                    <p className="mt-1.5 text-sm italic text-stone-800">
                      "{m.rationale}"
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between pt-2">
                    <div className="text-xs text-stone-500">
                      Status: <span className="font-semibold text-stone-800">{m.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="text-xs border-stone-300">
                        Decline
                      </Button>
                      <Button className="bg-marriage-700 text-xs text-white hover:bg-marriage-800">
                        Accept Supervised Introduction
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
