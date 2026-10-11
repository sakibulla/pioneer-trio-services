"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { portalApi } from "@/lib/portal-api";

interface CaseDetail {
  id: string;
  caseReference?: string;
  destinationCountry?: string;
  applicationType?: string;
  status?: string;
  submittedAt?: string;
  updatedAt?: string;
  clientName?: string;
  coordinator?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  assessment?: {
    personalInfo?: {
      fullName?: string;
      dateOfBirth?: string;
      nationality?: string;
      passportNumber?: string;
    };
    travelHistory?: {
      previousCountries?: string[];
      visaDenials?: boolean;
    };
    education?: {
      degree?: string;
      institution?: string;
      fieldOfStudy?: string;
    };
    employment?: {
      currentPosition?: string;
      employer?: string;
      yearsOfExperience?: number;
    };
    language?: {
      englishLevel?: string;
      otherLanguages?: string[];
    };
    financial?: {
      annualIncome?: string;
      sponsor?: string;
      supportingDocuments?: string[];
    };
    dependants?: {
      count?: number;
      details?: string;
    };
  };
  documents?: Array<{
    id: string;
    documentType: string;
    fileName: string;
    verified: boolean;
    uploadedAt: string;
    url?: string;
  }>;
  notes?: Array<{
    id: string;
    note: string;
    noteType: string;
    createdAt: string;
    author?: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Status update form state
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  const statusOptions = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "DOCUMENTS_PENDING",
    "QC_REVIEW",
    "APPROVED",
    "REFERRED",
    "REJECTED",
    "CLOSED",
  ];

  useEffect(() => {
    const loadCase = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("pioneer_token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        const res = await portalApi.getCaseDetails(token, caseId);
        if (res.data) {
          setCaseData(res.data);
          setError("");
        } else {
          setError("Failed to load case details");
        }
      } catch (err) {
        console.error("[CaseDetail] Error loading case:", err);
        setError("Error loading case. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      loadCase();
    }
  }, [caseId]);

  const handleUpdateStatus = async () => {
    if (!caseId || !newStatus) {
      setError("Please select a new status");
      return;
    }

    setActionLoading(true);
    setSuccessMessage("");
    try {
      const token = localStorage.getItem("pioneer_token");
      if (!token) {
        setError("No authentication token found.");
        return;
      }

      const res = await portalApi.updateCaseStatus(token, caseId, newStatus, statusNotes || undefined);
      if (res.success) {
        setSuccessMessage(`Case status updated to ${newStatus}`);
        setCaseData((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        setShowStatusForm(false);
        setNewStatus("");
        setStatusNotes("");
      } else {
        setError(res.error || "Failed to update case status");
      }
    } catch (err) {
      console.error("[CaseDetail] Error updating status:", err);
      setError("Error updating case status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <Container className="max-w-4xl">
          <div className="rounded-2xl border border-stone-200 bg-white p-12">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-immigration-200 border-t-immigration-700" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <Container className="max-w-4xl">
          <button
            onClick={() => router.push("/admin?tab=cases")}
            className="flex items-center gap-2 text-immigration-700 hover:text-immigration-800 mb-6 font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </button>
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-stone-400" />
            <h2 className="mt-4 text-lg font-bold text-stone-800">Case Not Found</h2>
            <p className="mt-2 text-sm text-stone-500">{error || "The case you're looking for does not exist."}</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <Container className="max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.push("/admin?tab=cases")}
          className="flex items-center gap-2 text-immigration-700 hover:text-immigration-800 mb-6 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cases
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-immigration-200 bg-gradient-to-r from-immigration-50 to-white p-6">
          <div>
            <h1 className="text-3xl font-bold text-immigration-900">
              {caseData.caseReference || "Case"}
            </h1>
            <p className="mt-2 text-sm text-stone-600">ID: {caseData.id}</p>
            {caseData.destinationCountry && (
              <p className="mt-1 text-sm text-stone-600">{caseData.destinationCountry}</p>
            )}
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              caseData.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : caseData.status === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : caseData.status === "UNDER_REVIEW"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {caseData.status || "SUBMITTED"}
          </span>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-6">
          {/* Case Overview */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-stone-900">Case Overview</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Case Reference</p>
                <p className="mt-1 text-sm text-stone-900">{caseData.caseReference || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Destination Country</p>
                <p className="mt-1 text-sm text-stone-900">{caseData.destinationCountry || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Application Type</p>
                <p className="mt-1 text-sm text-stone-900">{caseData.applicationType || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Client Name</p>
                <p className="mt-1 text-sm text-stone-900">{caseData.clientName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Submitted</p>
                <p className="mt-1 text-sm text-stone-900">
                  {caseData.submittedAt ? new Date(caseData.submittedAt).toLocaleString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Last Updated</p>
                <p className="mt-1 text-sm text-stone-900">
                  {caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Coordinator Info (if assigned) */}
          {caseData.coordinator && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-stone-900">Assigned Coordinator</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Name</p>
                  <p className="mt-1 text-sm text-stone-900">
                    {`${caseData.coordinator.firstName} ${caseData.coordinator.lastName}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Email</p>
                  <p className="mt-1 text-sm text-stone-900">
                    <a href={`mailto:${caseData.coordinator.email}`} className="text-immigration-600 hover:underline">
                      {caseData.coordinator.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assessment Data */}
          {caseData.assessment && (
            <>
              {caseData.assessment.personalInfo && (
                <div className="rounded-2xl border border-stone-200 bg-white p-6">
                  <h2 className="mb-4 text-lg font-bold text-stone-900">Personal Information</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Full Name</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.personalInfo.fullName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Date of Birth</p>
                      <p className="mt-1 text-sm text-stone-900">
                        {caseData.assessment.personalInfo.dateOfBirth
                          ? new Date(caseData.assessment.personalInfo.dateOfBirth).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Nationality</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.personalInfo.nationality || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Passport Number</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.personalInfo.passportNumber || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {caseData.assessment.education && (
                <div className="rounded-2xl border border-stone-200 bg-white p-6">
                  <h2 className="mb-4 text-lg font-bold text-stone-900">Education</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Degree</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.education.degree || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Institution</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.education.institution || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Field of Study</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.education.fieldOfStudy || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {caseData.assessment.employment && (
                <div className="rounded-2xl border border-stone-200 bg-white p-6">
                  <h2 className="mb-4 text-lg font-bold text-stone-900">Employment</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Current Position</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.employment.currentPosition || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Employer</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.employment.employer || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Years of Experience</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.employment.yearsOfExperience || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {caseData.assessment.language && (
                <div className="rounded-2xl border border-stone-200 bg-white p-6">
                  <h2 className="mb-4 text-lg font-bold text-stone-900">Language Proficiency</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">English Level</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.language.englishLevel || "N/A"}</p>
                    </div>
                    {caseData.assessment.language.otherLanguages && caseData.assessment.language.otherLanguages.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-stone-600 uppercase">Other Languages</p>
                        <p className="mt-1 text-sm text-stone-900">{caseData.assessment.language.otherLanguages.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {caseData.assessment.financial && (
                <div className="rounded-2xl border border-stone-200 bg-white p-6">
                  <h2 className="mb-4 text-lg font-bold text-stone-900">Financial Information</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Annual Income</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.financial.annualIncome || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Sponsor</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.financial.sponsor || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {caseData.assessment.dependants && (
                <div className="rounded-2xl border border-stone-200 bg-white p-6">
                  <h2 className="mb-4 text-lg font-bold text-stone-900">Dependants</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-stone-600 uppercase">Count</p>
                      <p className="mt-1 text-sm text-stone-900">{caseData.assessment.dependants.count || "0"}</p>
                    </div>
                    {caseData.assessment.dependants.details && (
                      <div>
                        <p className="text-xs font-semibold text-stone-600 uppercase">Details</p>
                        <p className="mt-1 text-sm text-stone-900">{caseData.assessment.dependants.details}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Documents */}
          {caseData.documents && caseData.documents.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-stone-900">Case Documents</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Document Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">File Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Uploaded</th>
                      <th className="px-4 py-3 text-left font-semibold text-stone-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseData.documents.map((doc) => (
                      <tr key={doc.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="px-4 py-3 text-stone-900 font-semibold">{doc.documentType}</td>
                        <td className="px-4 py-3 text-stone-900">{doc.fileName}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              doc.verified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {doc.verified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500 text-xs">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-immigration-600 hover:text-immigration-700 font-semibold"
                            >
                              <Download className="h-3 w-3" />
                              View
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Case Notes/History */}
          {caseData.notes && caseData.notes.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-stone-900">Case Notes & History</h2>
              <div className="space-y-3">
                {caseData.notes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-semibold text-stone-600 uppercase">{note.noteType}</p>
                        {note.author && (
                          <p className="text-xs text-stone-500">
                            by {note.author.firstName} {note.author.lastName}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-stone-500">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-stone-900">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Update Section */}
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-stone-900">Update Case Status</h2>

          {!showStatusForm ? (
            <Button
              tone="immigration"
              onClick={() => setShowStatusForm(true)}
              className="w-full md:w-auto"
            >
              Update Status
            </Button>
          ) : (
            <div className="space-y-4 rounded-lg border border-immigration-200 bg-immigration-50 p-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">
                  Current Status: {caseData.status}
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-immigration-500 focus:outline-none"
                >
                  <option value="">Select a new status...</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">
                  Update Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Enter any notes about this status update..."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-immigration-500 focus:outline-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  tone="immigration"
                  onClick={handleUpdateStatus}
                  disabled={actionLoading || !newStatus}
                  className="flex-1"
                >
                  {actionLoading ? "Updating..." : "Confirm Update"}
                </Button>
                <Button
                  tone="neutral"
                  variant="outline"
                  onClick={() => {
                    setShowStatusForm(false);
                    setNewStatus("");
                    setStatusNotes("");
                  }}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
