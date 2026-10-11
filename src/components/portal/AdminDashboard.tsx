"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Heart, Mail, BarChart3, Users, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PortalHeader } from "./PortalHeader";
import { portalApi, type AuthUser } from "@/lib/portal-api";

interface AdminCaseItem {
  id: string;
  clientName: string;
  destinationCountry: string;
  status: string;
  coordinator?: string;
  submittedAt: string;
}

interface AdminLeadItem {
  id: string;
  submitterName: string;
  inquiryType: string;
  email: string;
  status: string;
  submittedAt: string;
}

interface AdminProfileItem {
  id: string;
  fullName: string;
  status: string;
  matchmakerAssigned?: string;
  createdAt: string;
}

interface AdminAnalytics {
  totalCases: number;
  activeCases: number;
  pendingAssessments: number;
  totalLeads: number;
  totalProfiles: number;
  verifiedProfiles: number;
  coordinatorsCount: number;
  matchmakersCount: number;
}

interface AdminDashboardProps {
  user: AuthUser;
  token: string;
  onLogout: () => void;
}

export function AdminDashboard({ user, token, onLogout }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"analytics" | "cases" | "leads" | "profiles">("analytics");
  const [cases, setCases] = useState<AdminCaseItem[]>([]);
  const [leads, setLeads] = useState<AdminLeadItem[]>([]);
  const [profiles, setProfiles] = useState<AdminProfileItem[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    totalCases: 0,
    activeCases: 0,
    pendingAssessments: 0,
    totalLeads: 0,
    totalProfiles: 0,
    verifiedProfiles: 0,
    coordinatorsCount: 0,
    matchmakersCount: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [dataErrors, setDataErrors] = useState<{ cases?: string; leads?: string; profiles?: string }>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setDataLoading(true);
    setDataErrors({});
    try {
      // Use Promise.allSettled to handle partial failures - if one fails, others still load
      const results = await Promise.allSettled([
        portalApi.getAllCases(token),
        portalApi.getAllLeads(token),
        portalApi.getAllProfiles(token),
      ]);
      
      const casesRes = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
      const leadsRes = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
      const profilesRes = results[2].status === 'fulfilled' ? results[2].value : { data: [] };
      
      // Track which endpoints failed for UI indicators
      const newErrors: typeof dataErrors = {};
      if (results[0].status === 'rejected') {
        newErrors.cases = `Cases failed to load: ${results[0].reason?.message || 'Unknown error'}`;
      }
      if (results[1].status === 'rejected') {
        newErrors.leads = `Leads failed to load: ${results[1].reason?.message || 'Unknown error'}`;
      }
      if (results[2].status === 'rejected') {
        newErrors.profiles = `Profiles failed to load: ${results[2].reason?.message || 'Unknown error'}`;
      }
      
      console.log("[AdminDashboard] Cases response:", casesRes);
      console.log("[AdminDashboard] Leads response:", leadsRes);
      console.log("[AdminDashboard] Profiles response:", profilesRes);
      
      // Process cases data - handle both array and nested formats
      let casesData = (casesRes?.data || []) as any[];
      if (casesData && typeof casesData === 'object' && !Array.isArray(casesData) && 'items' in casesData) {
        casesData = (casesData as any).items;
      }
      
      const formattedCases: AdminCaseItem[] = casesData.map((c) => ({
        id: c.id || c.caseReference || "N/A",
        clientName: c.clientName || c.client?.fullName || "Unknown",
        destinationCountry: c.destinationCountry || "N/A",
        status: c.status || "SUBMITTED",
        coordinator: c.coordinator?.email || undefined,
        submittedAt: c.submittedAt || new Date().toISOString(),
      }));
      
      // Process leads data
      const leadsData = (leadsRes?.data || []) as any[];
      const formattedLeads: AdminLeadItem[] = leadsData.map((l) => ({
        id: l.id || "N/A",
        submitterName: l.submitterName || l.name || "Unknown",
        inquiryType: l.inquiryType || l.type || "General",
        email: l.email || "N/A",
        status: l.status || "NEW",
        submittedAt: l.submittedAt || l.createdAt || new Date().toISOString(),
      }));
      
      // Process profiles data
      const profilesData = (profilesRes?.data || []) as any[];
      const formattedProfiles: AdminProfileItem[] = profilesData.map((p) => ({
        id: p.id || "N/A",
        fullName: p.fullName || "Unknown",
        status: p.status || "PENDING",
        matchmakerAssigned: undefined,
        createdAt: p.createdAt || new Date().toISOString(),
      }));
      
      // Set data and errors
      setCases(formattedCases);
      setLeads(formattedLeads);
      setProfiles(formattedProfiles);
      setDataErrors(newErrors);
      
      // Calculate analytics
      const activeCasesCount = formattedCases.filter(
        (c) => c.status === "ACTIVE" || c.status === "UNDER_REVIEW"
      ).length;
      const pendingCasesCount = formattedCases.filter(
        (c) => c.status === "SUBMITTED"
      ).length;
      const verifiedProfilesCount = formattedProfiles.filter(
        (p) => p.status === "APPROVED"
      ).length;
      
      setAnalytics({
        totalCases: formattedCases.length,
        activeCases: activeCasesCount,
        pendingAssessments: pendingCasesCount,
        totalLeads: formattedLeads.length,
        totalProfiles: formattedProfiles.length,
        verifiedProfiles: verifiedProfilesCount,
        coordinatorsCount: 0,
        matchmakersCount: 0,
      });
    } catch (err) {
      console.error("[AdminDashboard] Error loading data:", err);
      setCases([]);
      setLeads([]);
      setProfiles([]);
      setDataErrors({
        cases: "Failed to load cases",
        leads: "Failed to load leads",
        profiles: "Failed to load profiles",
      });
    } finally {
      setDataLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-stone-50 py-8">
      <Container className="max-w-6xl">
        {/* Header */}
        <PortalHeader user={user} onLogout={onLogout} />

        {/* Admin Service Tabs */}
        <div className="mt-8 flex gap-3 border-b border-stone-200 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "analytics"
                ? "bg-brand-700 text-white shadow"
                : "bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics & Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cases")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap relative ${
              activeTab === "cases"
                ? "bg-immigration-700 text-white shadow"
                : "bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Plane className="h-4 w-4" />
            All Immigration Cases ({cases.length})
            {dataErrors.cases && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" title={dataErrors.cases} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap relative ${
              activeTab === "leads"
                ? "bg-brand-700 text-white shadow"
                : "bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Mail className="h-4 w-4" />
            All Leads ({leads.length})
            {dataErrors.leads && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" title={dataErrors.leads} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profiles")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap relative ${
              activeTab === "profiles"
                ? "bg-marriage-700 text-white shadow"
                : "bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Heart className="h-4 w-4" />
            All Profiles ({profiles.length})
            {dataErrors.profiles && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" title={dataErrors.profiles} />
            )}
          </button>
        </div>

        {/* Tab 1: Analytics & Overview */}
        {activeTab === "analytics" && (
          <div className="mt-6">
            {dataLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Immigration Cases */}
                <div className="rounded-2xl border border-immigration-200 bg-gradient-to-br from-immigration-50 to-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Plane className="h-8 w-8 text-immigration-600" />
                    <span className="text-xs font-semibold text-immigration-700 bg-immigration-100 px-2 py-1 rounded">
                      Immigration
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-1">Total Cases</p>
                  <p className="text-3xl font-bold text-immigration-900 mb-3">{analytics.totalCases}</p>
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Active: {analytics.activeCases}</span>
                    <span>Pending: {analytics.pendingAssessments}</span>
                  </div>
                </div>

                {/* Matrimonial Profiles */}
                <div className="rounded-2xl border border-marriage-200 bg-gradient-to-br from-marriage-50 to-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Heart className="h-8 w-8 text-marriage-600" />
                    <span className="text-xs font-semibold text-marriage-700 bg-marriage-100 px-2 py-1 rounded">
                      Matrimonial
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-1">Total Profiles</p>
                  <p className="text-3xl font-bold text-marriage-900 mb-3">{analytics.totalProfiles}</p>
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Verified: {analytics.verifiedProfiles}</span>
                  </div>
                </div>

                {/* Leads & Inquiries */}
                <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Mail className="h-8 w-8 text-brand-600" />
                    <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-1 rounded">
                      Inquiries
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-1">Total Leads</p>
                  <p className="text-3xl font-bold text-brand-900 mb-3">{analytics.totalLeads}</p>
                  <div className="text-xs text-stone-600">
                    <span>All contact submissions</span>
                  </div>
                </div>

                {/* Team Overview */}
                <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="h-8 w-8 text-stone-600" />
                    <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-1 rounded">
                      Team
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-1">Active Staff</p>
                  <p className="text-3xl font-bold text-stone-900 mb-3">
                    {analytics.coordinatorsCount + analytics.matchmakersCount}
                  </p>
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Coordinators: {analytics.coordinatorsCount}</span>
                    <span>Matchmakers: {analytics.matchmakersCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: All Immigration Cases */}
        {activeTab === "cases" && (
          <div className="mt-6 space-y-4">
            {dataErrors.cases && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Failed to load cases</p>
                  <p className="text-xs mt-1">{dataErrors.cases}</p>
                </div>
              </div>
            )}
            {dataLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-immigration-200 border-t-immigration-700" />
                </div>
              </div>
            ) : cases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <Plane className="mx-auto h-10 w-10 text-stone-400" />
                <h3 className="mt-3 text-lg font-bold text-stone-800">No Immigration Cases</h3>
                <p className="mt-1 text-sm text-stone-500">
                  No immigration cases have been submitted yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Case ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Client Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Destination</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Coordinator</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => router.push(`/admin/cases/${c.id}`)}
                        className="border-b border-stone-100 hover:bg-immigration-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-immigration-800">{c.id}</td>
                        <td className="px-4 py-3 text-stone-900">{c.clientName}</td>
                        <td className="px-4 py-3 text-stone-900">{c.destinationCountry}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-immigration-100 px-2 py-1 text-immigration-800 font-semibold">
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-600">{c.coordinator || "Unassigned"}</td>
                        <td className="px-4 py-3 text-stone-500">
                          {new Date(c.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: All Leads */}
        {activeTab === "leads" && (
          <div className="mt-6 space-y-4">
            {dataErrors.leads && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Failed to load leads</p>
                  <p className="text-xs mt-1">{dataErrors.leads}</p>
                </div>
              </div>
            )}
            {dataLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
                </div>
              </div>
            ) : leads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <Mail className="mx-auto h-10 w-10 text-stone-400" />
                <h3 className="mt-3 text-lg font-bold text-stone-800">No Leads</h3>
                <p className="mt-1 text-sm text-stone-500">
                  No contact form submissions or inquiry leads have been received.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Lead ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Submitter Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Inquiry Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="px-4 py-3 font-mono font-bold text-brand-800">{l.id}</td>
                        <td className="px-4 py-3 text-stone-900">{l.submitterName}</td>
                        <td className="px-4 py-3 text-stone-600">{l.email}</td>
                        <td className="px-4 py-3 text-stone-900">{l.inquiryType}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-brand-100 px-2 py-1 text-brand-800 font-semibold">
                            {l.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500">
                          {new Date(l.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: All Matrimonial Profiles */}
        {activeTab === "profiles" && (
          <div className="mt-6 space-y-4">
            {dataErrors.profiles && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Failed to load profiles</p>
                  <p className="text-xs mt-1">{dataErrors.profiles}</p>
                </div>
              </div>
            )}
            {dataLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-marriage-200 border-t-marriage-700" />
                </div>
              </div>
            ) : profiles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <Heart className="mx-auto h-10 w-10 text-stone-400" />
                <h3 className="mt-3 text-lg font-bold text-stone-800">No Matrimonial Profiles</h3>
                <p className="mt-1 text-sm text-stone-500">
                  No matrimonial profiles have been created yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Profile ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Full Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Matchmaker Assigned</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => router.push(`/admin/profiles/${p.id}`)}
                        className="border-b border-stone-100 hover:bg-marriage-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-marriage-800">{p.id}</td>
                        <td className="px-4 py-3 text-stone-900">{p.fullName}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-marriage-100 px-2 py-1 text-marriage-800 font-semibold">
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-600">{p.matchmakerAssigned || "Unassigned"}</td>
                        <td className="px-4 py-3 text-stone-500">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
