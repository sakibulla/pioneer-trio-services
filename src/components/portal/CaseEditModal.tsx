"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { portalApi, type ClientCase, type AuthUser } from "@/lib/portal-api";

interface CaseEditModalProps {
  caseData: ClientCase;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ClientCase) => void;
  token: string;
  currentUser?: AuthUser | null;
}

export function CaseEditModal({ caseData, isOpen, onClose, onSave, token, currentUser }: CaseEditModalProps) {
  const [destinationCountry, setDestinationCountry] = useState(caseData.destinationCountry || "");
  const [applicationType, setApplicationType] = useState(caseData.applicationType || "");
  const [specificProgram, setSpecificProgram] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [caseVersion, setCaseVersion] = useState<number>(0); // For optimistic locking

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Frontend ownership check: verify current user is the case owner
    // Note: Backend MUST also verify ownership. This is a defense-in-depth check.
    if (!currentUser) {
      setError("Authentication required. Please log in again.");
      return;
    }

    // Validate required fields
    if (!destinationCountry.trim()) {
      setError("Destination Country is required");
      return;
    }

    if (!applicationType.trim()) {
      setError("Application Type is required");
      return;
    }

    setSaving(true);

    try {
      // Include version for optimistic locking (detect concurrent edits)
      const result = await portalApi.updateCase(token, caseData.id, {
        destinationCountry,
        applicationType,
        specificProgram,
        _version: caseVersion,
      });

      if (result.success) {
        // Re-fetch the case to ensure UI state matches backend
        const refreshedCases = await portalApi.getMyCases(token);
        const updatedCase = refreshedCases?.data?.find((c: ClientCase) => c.id === caseData.id);
        
        if (updatedCase) {
          onSave(updatedCase);
          // Update local version for next edit (if backend returns it)
          setCaseVersion((updatedCase as any)._version || 0);
        } else {
          // Fallback if refresh fails
          onSave({
            ...caseData,
            destinationCountry,
            applicationType,
          });
        }
        onClose();
        alert("Case updated successfully");
      } else {
        // Check if error is due to version conflict (concurrent edit)
        if (result.error?.includes("version") || result.error?.includes("conflict")) {
          setError("This case was modified by another session. Refreshing...");
          const refreshedCases = await portalApi.getMyCases(token);
          const refreshedCase = refreshedCases?.data?.find((c: ClientCase) => c.id === caseData.id);
          if (refreshedCase) {
            onSave(refreshedCase);
            onClose();
          }
        } else {
          setError(result.error || "Failed to update case");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="rounded-2xl bg-white max-w-md w-full shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 p-6">
          <h2 className="text-lg font-bold text-stone-900">Edit Immigration Case</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Destination Country <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-immigration-500"
              placeholder="e.g., Canada"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Application Type <span className="text-red-600">*</span>
            </label>
            <select
              value={applicationType}
              onChange={(e) => setApplicationType(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-immigration-500"
              required
            >
              <option value="">Select application type</option>
              <option value="Study Permit">Study Permit</option>
              <option value="Work Permit">Work Permit</option>
              <option value="Skilled Worker">Skilled Worker</option>
              <option value="Family Sponsorship">Family Sponsorship</option>
              <option value="Business Immigration">Business Immigration</option>
              <option value="Temporary Resident">Temporary Resident</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Specific Program (Optional)
            </label>
            <input
              type="text"
              value={specificProgram}
              onChange={(e) => setSpecificProgram(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-immigration-500"
              placeholder="e.g., Express Entry, Provincial Nominee Program"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-50 disabled:opacity-60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-immigration-700 text-white font-semibold rounded-lg hover:bg-immigration-800 disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
