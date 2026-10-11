"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PortalHeader } from "./PortalHeader";
import type { AuthUser } from "@/lib/portal-api";

interface QuickInquiry {
  id: string;
  submitterName: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
  submittedAt: string;
}

interface PendingAssessment {
  id: string;
  clientName: string;
  destinationCountry: string;
  applicationType: string;
  submittedAt: string;
  status: string;
}

interface CoordinatorDashboardProps {
  user: AuthUser;
  token: string;
  onLogout: () => void;
}

export function CoordinatorDashboard({ user, token, onLogout }: CoordinatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"inquiries" | "assessments">("inquiries");
  const [inquiries, setInquiries] = useState<QuickInquiry[]>([]);
  const [assessments, setAssessments] = useState<PendingAssessment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setDataLoading(true);
    try {
      // Placeholder: These will call actual API methods once implemented
      // const inquiriesRes = await portalApi.getQuickInquiries(token);
      // const assessmentsRes = await portalApi.getPendingAssessments(token);
      
      // For now, show empty/loading state
      setInquiries([]);
      setAssessments([]);
    } catch {
      // Error handling
    } finally {
      setDataLoading(false);
    }
  };

  const handleAcceptAssessment = async (assessmentId: string) => {
    // Placeholder: Will call portalApi.acceptAssessment(token, assessmentId)
    console.log("Accepting assessment:", assessmentId);
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
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "inquiries"
                ? "bg-brand-700 text-white shadow"
                : "bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            Quick Inquiries ({inquiries.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("assessments")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "assessments"
                ? "bg-immigration-700 text-white shadow"
                : "bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Clock className="h-4 w-4" />
            Full Assessments ({assessments.length})
          </button>
        </div>

        {/* Tab 1: Quick Inquiries */}
        {activeTab === "inquiries" && (
          <div className="mt-6 space-y-6">
            {dataLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
                </div>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-stone-400" />
                <h3 className="mt-3 text-lg font-bold text-stone-800">No Quick Inquiries</h3>
                <p className="mt-1 text-sm text-stone-500">
                  You have no pending quick inquiries at this time.
                </p>
              </div>
            ) : (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-brand-800">
                          {inquiry.id}
                        </span>
                        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                          PENDING
                        </span>
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-stone-900">
                        {inquiry.submitterName}
                      </h2>
                      <p className="mt-1 text-xs text-stone-500">{inquiry.email}</p>
                      {inquiry.phone && (
                        <p className="text-xs text-stone-500">{inquiry.phone}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-stone-500">
                      Submitted {new Date(inquiry.submittedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Inquiry Type: <span className="text-stone-900">{inquiry.inquiryType}</span>
                    </p>
                    <div className="mt-2 rounded-lg bg-stone-50 p-3 text-sm text-stone-800">
                      {inquiry.message}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2 pt-2">
                    <Button variant="outline" tone="neutral" className="text-xs">
                      Archive
                    </Button>
                    <Button tone="brand" className="text-xs">
                      Process Inquiry
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Full Assessments */}
        {activeTab === "assessments" && (
          <div className="mt-6 space-y-6">
            {dataLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-immigration-200 border-t-immigration-700" />
                </div>
              </div>
            ) : assessments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <Clock className="mx-auto h-10 w-10 text-stone-400" />
                <h3 className="mt-3 text-lg font-bold text-stone-800">No Pending Assessments</h3>
                <p className="mt-1 text-sm text-stone-500">
                  All assigned assessments have been accepted or resolved.
                </p>
              </div>
            ) : (
              assessments.map((assessment) => (
                <div key={assessment.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-immigration-800">
                          {assessment.id}
                        </span>
                        <span className="rounded-full bg-immigration-100 px-2.5 py-0.5 text-xs font-semibold text-immigration-800">
                          {assessment.status}
                        </span>
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-stone-900">
                        {assessment.clientName}
                      </h2>
                      <p className="mt-1 text-xs text-stone-600">
                        {assessment.destinationCountry} — {assessment.applicationType}
                      </p>
                    </div>
                    <div className="text-right text-xs text-stone-500">
                      Submitted {new Date(assessment.submittedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      tone="neutral" 
                      className="text-xs"
                    >
                      Review Details
                    </Button>
                    <Button 
                      tone="immigration" 
                      className="text-xs"
                      onClick={() => handleAcceptAssessment(assessment.id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Accept Assessment
                    </Button>
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
