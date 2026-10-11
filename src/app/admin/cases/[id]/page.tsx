"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader, AlertCircle } from "lucide-react";
import { portalApi } from "@/lib/portal-api";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

interface CaseDetail {
  id: string;
  caseReference: string;
  destinationCountry: string;
  applicationType: string;
  status: string;
  stage: string;
  submittedAt: string;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
  };
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    verified: boolean;
    uploadedAt: string;
  }>;
  assessment: any;
}

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    if (!caseId) return;

    const loadCase = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("pioneer_token");
        if (!token) {
          setError("Not authenticated");
          return;
        }

        // Fetch case details
        const response = await portalApi.getCaseDetails(token, caseId);
        if (response?.data) {
          setCaseDetail(response.data);
          setNewStatus(response.data.status);
        } else {
          setError("Case not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load case details");
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [caseId]);

  const handleStatusUpdate = async () => {
    if (!caseDetail || !newStatus) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem("pioneer_token");
      if (!token) return;

      await portalApi.updateCaseStatus(token, caseId, newStatus);
      setCaseDetail({ ...caseDetail, status: newStatus });
      alert("Case status updated successfully");
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-stone-50 py-8 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-immigration-600" />
      </div>
    );
  }

  if (error || !caseDetail) {
    return (
      <div className="min-h-[80vh] bg-stone-50 py-8">
        <Container>
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <h2 className="text-lg font-bold text-red-900">Error</h2>
              <p className="text-red-700">{error || "Case not found"}</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-stone-50 py-8">
      <Container className="max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Cases
          </Button>
        </div>

        {/* Case Header */}
        <div className="rounded-2xl border border-immigration-200 bg-gradient-to-br from-immigration-50 to-white p-8 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-stone-600 mb-1">Case Reference</p>
              <h1 className="text-3xl font-bold text-immigration-900 font-mono">{caseDetail.caseReference}</h1>
              <p className="text-lg text-stone-700 mt-3">{caseDetail.destinationCountry} — {caseDetail.applicationType}</p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-full bg-immigration-100 px-4 py-2 text-sm font-semibold text-immigration-900 mb-2">
                {caseDetail.status}
              </span>
              <p className="text-xs text-stone-600">Current Stage: {caseDetail.stage}</p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
          <h2 className="text-lg font-bold text-stone-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-stone-600 mb-1">Full Name</p>
              <p className="text-sm font-semibold text-stone-900">{caseDetail.client.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-stone-600 mb-1">Email</p>
              <p className="text-sm font-semibold text-stone-900">{caseDetail.client.email}</p>
            </div>
            <div>
              <p className="text-xs text-stone-600 mb-1">Phone</p>
              <p className="text-sm font-semibold text-stone-900">{caseDetail.client.phone}</p>
            </div>
            <div>
              <p className="text-xs text-stone-600 mb-1">Nationality</p>
              <p className="text-sm font-semibold text-stone-900">{caseDetail.client.nationality}</p>
            </div>
            <div>
              <p className="text-xs text-stone-600 mb-1">Passport Number</p>
              <p className="text-sm font-semibold text-stone-900">{caseDetail.client.passportNumber}</p>
            </div>
            <div>
              <p className="text-xs text-stone-600 mb-1">Date of Birth</p>
              <p className="text-sm font-semibold text-stone-900">
                {new Date(caseDetail.client.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Documents */}
        {caseDetail.documents && caseDetail.documents.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Encrypted Case Documents & Verifications</h2>
            <div className="space-y-3">
              {caseDetail.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-stone-200 p-4 hover:bg-stone-50">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-900">{doc.documentType}</p>
                    <p className="text-xs text-stone-600">{doc.fileName}</p>
                    <p className="text-xs text-stone-500 mt-1">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      doc.verified
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {doc.verified ? "Verified (AES-256 Encrypted)" : "Pending Verification"}
                    </span>
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem("pioneer_token");
                        if (!token) return;
                        setUpdating(true);
                        try {
                          const result = await portalApi.verifyDocument(token, doc.id, !doc.verified);
                          if (result.success) {
                            // Update document in local state
                            setCaseDetail({
                              ...caseDetail,
                              documents: caseDetail.documents.map(d =>
                                d.id === doc.id ? { ...d, verified: !d.verified } : d
                              ),
                            });
                            alert(`Document ${!doc.verified ? 'verified' : 'unverified'} successfully`);
                          } else {
                            alert("Failed to update document: " + result.error);
                          }
                        } finally {
                          setUpdating(false);
                        }
                      }}
                      disabled={updating}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                        doc.verified
                          ? "bg-yellow-600 text-white hover:bg-yellow-700"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {doc.verified ? "Unverify" : "Verify"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Update */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
          <h2 className="text-lg font-bold text-stone-900 mb-4">Update Case Status</h2>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-stone-700 block mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-immigration-500"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <Button
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === caseDetail.status}
              className="bg-immigration-700 text-white hover:bg-immigration-800"
            >
              {updating ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-bold text-stone-900 mb-4">Timeline</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
              <div className="w-2 h-2 rounded-full bg-immigration-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-semibold text-stone-900">Submitted</p>
                <p className="text-xs text-stone-600">{new Date(caseDetail.submittedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
