"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Heart,
  Plane,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  User,
  RotateCw,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PortalHeader } from "./PortalHeader";
import { portalApi, type AuthUser, type ClientCase, type ClientMatch } from "@/lib/portal-api";

interface ClientDashboardProps {
  user: AuthUser;
  token: string;
  onLogout: () => void;
}

interface MatrimonialProfile {
  id: string;
  fullName: string;
  gender: string;
  currentCity: string;
  currentCountry: string;
  currentProfession: string;
  status: string;
  createdAt: string;
  email?: string;
  phone?: string;
}

export function ClientDashboard({ user, token, onLogout }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<"immigration" | "matrimonial">("immigration");
  const [cases, setCases] = useState<ClientCase[]>([]);
  const [matches, setMatches] = useState<ClientMatch[]>([]);
  const [myProfile, setMyProfile] = useState<MatrimonialProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!token) return; // Don't load if no token
    
    // Only load once on mount
    let isMounted = true;
    (async () => {
      if (isMounted) {
        await loadDashboardData();
      }
    })();
    
    // Refresh when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isMounted) {
        loadDashboardData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [casesRes, matchesRes, profileRes] = await Promise.all([
        portalApi.getMyCases(token),
        portalApi.getMyMatches(token),
        portalApi.getMyMatrimonialProfile(token),
      ]);

      console.log("[ClientDashboard] Cases response:", casesRes);
      console.log("[ClientDashboard] Matches response:", matchesRes);
      console.log("[ClientDashboard] Profile response:", profileRes);

      if (casesRes?.data && Array.isArray(casesRes.data)) {
        setCases(casesRes.data);
      } else if (casesRes?.data) {
        setCases([casesRes.data]);
      } else {
        setCases([]);
      }
      
      if (matchesRes?.data && Array.isArray(matchesRes.data)) {
        setMatches(matchesRes.data);
      } else if (matchesRes?.data) {
        setMatches([matchesRes.data]);
      } else {
        setMatches([]);
      }

      if (profileRes?.data) {
        setMyProfile(profileRes.data);
      } else {
        setMyProfile(null);
      }
    } catch (error) {
      console.error("[ClientDashboard] Failed to load dashboard data:", error);
      setCases([]);
      setMatches([]);
      setMyProfile(null);
    } finally {
      setIsRefreshing(false);
      setDataLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-stone-50 py-8">
      <Container className="max-w-6xl">
        {/* Header */}
        <PortalHeader user={user} onLogout={onLogout} />

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

          <button
            type="button"
            onClick={() => loadDashboardData()}
            disabled={isRefreshing}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Tab 1: Immigration Cases */}
        {activeTab === "immigration" && (
          <div className="mt-6 space-y-6">
            {dataLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-immigration-200 border-t-immigration-700" />
                </div>
              </div>
            ) : cases.length === 0 ? (
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
            {dataLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-marriage-200 border-t-marriage-700" />
                </div>
              </div>
            ) : (
              <>
                {/* Show user's own profile first if it exists */}
                {myProfile && (
                  <div className="rounded-2xl border border-marriage-100 bg-marriage-50 p-6">
                    <div className="flex items-center justify-between border-b border-marriage-200 pb-4">
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-marriage-100 px-3 py-1 text-xs font-semibold text-marriage-900">
                          <User className="h-3.5 w-3.5" /> Your Matrimonial Profile
                        </span>
                        <h3 className="mt-2 text-lg font-bold text-stone-900">{myProfile.fullName}</h3>
                        <p className="text-sm text-stone-600">
                          {myProfile.currentProfession} • {myProfile.currentCity}, {myProfile.currentCountry}
                        </p>
                      </div>
                      <span className="rounded-full bg-marriage-100 px-3 py-1 text-xs font-semibold text-marriage-900">
                        {myProfile.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-stone-700">
                      Your profile was created on <strong>{new Date(myProfile.createdAt).toLocaleDateString()}</strong>. Our Senior Matchmaker is reviewing your information to identify compatible profiles.
                    </p>
                  </div>
                )}

                {/* Show matches or message if no profile */}
                {!myProfile ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                    <Heart className="mx-auto h-10 w-10 text-marriage-500" />
                    <h3 className="mt-3 text-lg font-bold text-stone-800">Create Your Profile</h3>
                    <p className="mt-1 text-sm text-stone-500 max-w-md mx-auto">
                      Start by creating or updating your matrimonial profile. Our Senior Matchmaker will personally review it and identify compatible matches.
                    </p>
                    <Link
                      href="/marriage-consultancy"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-marriage-700 px-4 py-2 text-sm font-semibold text-white hover:bg-marriage-800"
                    >
                      Create Profile <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                    <Sparkles className="mx-auto h-10 w-10 text-marriage-500" />
                    <h3 className="mt-3 text-lg font-bold text-stone-800">Matches Coming Soon</h3>
                    <p className="mt-1 text-sm text-stone-500 max-w-md mx-auto">
                      Our Senior Matchmaker is curating hand-selected introductions based on your preferences.
                    </p>
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
                          <Button variant="outline" tone="neutral" className="text-xs border-stone-300">
                            Decline
                          </Button>
                          <Button tone="marriage" className="text-xs">
                            Accept Supervised Introduction
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
