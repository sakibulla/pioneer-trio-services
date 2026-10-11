"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader, AlertCircle, Upload, CheckCircle2, X } from "lucide-react";
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
    verifiedAt?: string;
    uploadedAt: string;
  }>;
  notes?: Array<{
    id: string;
    note: string;
    noteType: string;
    createdAt: string;
    author: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function ClientCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("Passport Scan");
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !caseDetail) return;

    try {
      setUploadingDoc(true);
      setUploadMessage(null);
      const token = localStorage.getItem("pioneer_token");
      if (!token) return;

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("documentType", docType);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api/v1"}/immigration/cases/${caseId}/documents`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to upload document");
      }

      const newDoc = await res.json();
      setCaseDetail({
        ...caseDetail,
        documents: [...caseDetail.documents, newDoc.data],
      });
      setSelectedFile(null);
      setDocType("Passport Scan");
      setUploadMessage({ type: "success", text: "Document uploaded successfully and awaiting admin review" });
    } catch (err: any) {
      setUploadMessage({ type: "error", text: err.message || "Failed to upload document" });
    } finally {
      setUploadingDoc(false);
    }
  };

  const getDocumentStatusLabel = (doc: CaseDetail["documents"][0]): string => {
    if (doc.verified && doc.verifiedAt) {
      return "Verified";
    }
    return "Awaiting Admin Review";
  };

  const getDocumentStatusColor = (doc: CaseDetail["documents"][0]): string => {
    if (doc.verified && doc.verifiedAt) {
      return "bg-emerald-100 text-emerald-800";
    }
    return "bg-yellow-100 text-yellow-800";
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

        {/* Timeline */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
          <h2 className="text-lg font-bold text-stone-900 mb-4">Application Progress</h2>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-lg bg-emerald-500 py-2 font-medium text-white">1. Submitted</div>
            <div className={`rounded-lg py-2 font-medium ${caseDetail.stage === "Document Check" || caseDetail.status !== "SUBMITTED" ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-400"}`}>
              2. Document Check
            </div>
            <div className={`rounded-lg py-2 font-medium ${caseDetail.stage === "QC Review" || caseDetail.status === "APPROVED" ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-400"}`}>
              3. QC Review
            </div>
            <div className={`rounded-lg py-2 font-medium ${caseDetail.status === "APPROVED" || caseDetail.status === "COMPLETED" ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-400"}`}>
              4. Approved
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
          <h2 className="text-lg font-bold text-stone-900 mb-4">Your Information</h2>
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
          </div>
        </div>

        {/* Upload Messages */}
        {uploadMessage && (
          <div className={`rounded-2xl border p-4 mb-6 flex items-start gap-3 ${
            uploadMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}>
            {uploadMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                uploadMessage.type === "success"
                  ? "text-emerald-900"
                  : "text-red-900"
              }`}>
                {uploadMessage.text}
              </p>
            </div>
            <button
              onClick={() => setUploadMessage(null)}
              className="text-stone-400 hover:text-stone-600 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Documents */}
        {caseDetail?.documents && Array.isArray(caseDetail.documents) && caseDetail.documents.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Your Uploaded Documents</h2>
            <div className="space-y-3">
              {caseDetail.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-stone-200 p-4 hover:bg-stone-50">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-900">{doc.documentType}</p>
                    <p className="text-xs text-stone-600">{doc.fileName}</p>
                    <p className="text-xs text-stone-500 mt-1">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getDocumentStatusColor(doc)}`}>
                      {getDocumentStatusLabel(doc)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Document */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
          <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Your Documents
          </h2>
          <p className="text-sm text-stone-600 mb-4">
            Upload required documents for your application. Our admin team will review and verify each document before proceeding with your case.
          </p>
          <form onSubmit={handleDocumentUpload} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-2">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-immigration-500"
              >
                <option>Passport Scan</option>
                <option>Educational Transcript / ECA</option>
                <option>Employment Letter</option>
                <option>Birth Certificate</option>
                <option>Medical Report</option>
                <option>Police Clearance</option>
                <option>IELTS / Language Test</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-2">Select File</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-immigration-500"
                disabled={uploadingDoc}
              />
              <p className="text-xs text-stone-500 mt-1">Accepted: PDF, DOC, DOCX, JPG, PNG, GIF (Max 10MB)</p>
            </div>
            <button
              type="submit"
              disabled={!selectedFile || uploadingDoc}
              className="px-4 py-2 bg-immigration-700 text-white font-semibold rounded-lg hover:bg-immigration-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {uploadingDoc ? "Uploading..." : "Upload Document"}
            </button>
          </form>
        </div>

        {/* Admin Notes */}
        {caseDetail?.notes && Array.isArray(caseDetail.notes) && caseDetail.notes.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Admin Notes</h2>
            <div className="space-y-3">
              {caseDetail.notes.map((note) => (
                <div key={note.id} className="rounded-lg border border-stone-200 p-4 bg-stone-50">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-semibold text-stone-700">
                      {note.author.firstName} {note.author.lastName}
                    </p>
                    <p className="text-xs text-stone-500">{new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-stone-800">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
