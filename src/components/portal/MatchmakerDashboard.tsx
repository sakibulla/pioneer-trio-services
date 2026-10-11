"use client";

import { useEffect, useState } from "react";
import { Heart, ThumbsUp, ThumbsDown, Sparkles, User } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PortalHeader } from "./PortalHeader";
import { portalApi, type AuthUser } from "@/lib/portal-api";

interface MatrimonialProfile {
  id: string;
  fullName: string;
  age: number;
  profession: string;
  currentCity: string;
  currentCountry: string;
  photoUrl?: string;
  status: string;
}

interface PotentialMatch {
  id: string;
  profileA: MatrimonialProfile;
  profileB: MatrimonialProfile;
  compatibilityRationale: string;
  status: string;
  suggestedAt: string;
}

interface MatchmakerDashboardProps {
  user: AuthUser;
  token: string;
  onLogout: () => void;
}

export function MatchmakerDashboard({ user, token, onLogout }: MatchmakerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"profiles" | "matches">("profiles");
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>([]);
  const [matches, setMatches] = useState<PotentialMatch[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
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
    setDataLoading(true);
    try {
      const [profilesRes, matchesRes] = await Promise.all([
        portalApi.getMatrimonialProfiles(token),
        portalApi.getMatches(token),
      ]);

      console.log("[MatchmakerDashboard] Profiles response:", profilesRes);
      console.log("[MatchmakerDashboard] Matches response:", matchesRes);

      if (profilesRes?.data && Array.isArray(profilesRes.data)) {
        setProfiles(profilesRes.data);
      } else {
        setProfiles([]);
      }
      
      if (matchesRes?.data && Array.isArray(matchesRes.data)) {
        setMatches(matchesRes.data);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error("[MatchmakerDashboard] Failed to load dashboard data:", error);
      setProfiles([]);
      setMatches([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleApproveMatch = async (matchId: string) => {
    // Placeholder: Will call backend API
    console.log("Approving match:", matchId);
    loadDashboardData();
  };

  const handleDeclineMatch = async (matchId: string) => {
    // Placeholder: Will call backend API
    console.log("Declining match:", matchId);
    loadDashboardData();
  };

  return (
    <div className="min-h-[85vh] bg-stone-50 py-8">
      <Container className="max-w-6xl">
        {/* Header */}
        <PortalHeader user={user} onLogout={onLogout} />

        {/* Service Tabs */}
        <div className="mt-8 flex gap-3 border-b border-stone-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("profiles")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "profiles"
                ? "bg-marriage-700 text-white shadow"
                : "bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            <User className="h-4 w-4" />
            Matrimonial Profiles ({profiles.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matches")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "matches"
                ? "bg-marriage-700 text-white shadow"
                : "bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Heart className="h-4 w-4" />
            Potential Matches ({matches.length})
          </button>
        </div>

        {/* Tab 1: Matrimonial Profiles */}
        {activeTab === "profiles" && (
          <div className="mt-6 space-y-6">
            {dataLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-marriage-200 border-t-marriage-700" />
                </div>
              </div>
            ) : profiles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <User className="mx-auto h-10 w-10 text-stone-400" />
                <h3 className="mt-3 text-lg font-bold text-stone-800">No Matrimonial Profiles</h3>
                <p className="mt-1 text-sm text-stone-500">
                  No verified matrimonial profiles are currently available for review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <div key={profile.id} className="rounded-2xl border border-marriage-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Photo Placeholder */}
                    <div className="h-40 bg-gradient-to-br from-marriage-100 to-marriage-50 flex items-center justify-center border-b border-marriage-100">
                      <div className="h-16 w-16 rounded-full bg-marriage-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-marriage-600" />
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-stone-900">
                          {profile.fullName}
                        </h3>
                        <span className="rounded-full bg-marriage-100 px-2 py-0.5 text-xs font-semibold text-marriage-800">
                          {profile.age}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 mb-3">{profile.profession}</p>

                      <div className="text-xs text-stone-500 space-y-1 mb-4">
                        <p>📍 {profile.currentCity}, {profile.currentCountry}</p>
                        <p className="capitalize">Status: {profile.status}</p>
                      </div>

                      <Button 
                        variant="outline" 
                        tone="marriage"
                        className="w-full text-xs"
                      >
                        View Full Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Potential Matches */}
        {activeTab === "matches" && (
          <div className="mt-6 space-y-6">
            {dataLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-marriage-200 border-t-marriage-700" />
                </div>
              </div>
            ) : matches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <Heart className="mx-auto h-10 w-10 text-stone-400" />
                <h3 className="mt-3 text-lg font-bold text-stone-800">No Pending Matches</h3>
                <p className="mt-1 text-sm text-stone-500">
                  All match proposals have been reviewed. Create new matches by pairing compatible profiles.
                </p>
              </div>
            ) : (
              matches.map((match) => (
                <div key={match.id} className="rounded-2xl border border-marriage-200 bg-white p-6 shadow-sm">
                  {/* Match Proposal Header */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-marriage-50 px-3 py-1 text-xs font-semibold text-marriage-800">
                      <Sparkles className="h-3.5 w-3.5" /> Hand-Curated Match
                    </span>
                    <span className="text-xs text-stone-500">
                      ID: <strong>{match.id}</strong>
                    </span>
                  </div>

                  {/* Profile Comparison */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {/* Profile A */}
                    <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-marriage-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-marriage-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">{match.profileA.fullName}</p>
                          <p className="text-[11px] text-stone-500">{match.profileA.age} yrs</p>
                        </div>
                      </div>
                      <div className="text-xs text-stone-600 space-y-1">
                        <p><strong>Profession:</strong> {match.profileA.profession}</p>
                        <p><strong>Location:</strong> {match.profileA.currentCity}, {match.profileA.currentCountry}</p>
                      </div>
                    </div>

                    {/* Profile B */}
                    <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-marriage-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-marriage-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">{match.profileB.fullName}</p>
                          <p className="text-[11px] text-stone-500">{match.profileB.age} yrs</p>
                        </div>
                      </div>
                      <div className="text-xs text-stone-600 space-y-1">
                        <p><strong>Profession:</strong> {match.profileB.profession}</p>
                        <p><strong>Location:</strong> {match.profileB.currentCity}, {match.profileB.currentCountry}</p>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Rationale */}
                  <div className="rounded-xl bg-marriage-50/50 p-4 border border-marriage-100 mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-marriage-900 mb-2">
                      Matchmaker Compatibility Rationale:
                    </p>
                    <p className="text-sm italic text-stone-800">
                      "{match.compatibilityRationale}"
                    </p>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-stone-500">
                      Status: <span className="font-semibold text-stone-800">{match.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        tone="neutral"
                        className="text-xs"
                        onClick={() => handleDeclineMatch(match.id)}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                        Decline
                      </Button>
                      <Button 
                        tone="marriage"
                        className="text-xs"
                        onClick={() => handleApproveMatch(match.id)}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Approve Match
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
