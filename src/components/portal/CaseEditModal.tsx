"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { portalApi, type ClientCase } from "@/lib/portal-api";

interface CaseEditModalProps {
  caseData: ClientCase;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ClientCase) => void;
  token: string;
}

export function CaseEditModal({ caseData, isOpen, onClose, onSave, token }: CaseEditModalProps) {
  const [destinationCountry, setDestinationCountry] = useState(caseData.destinationCountry || "");
  const [applicationType, setApplicationType] = useState(caseData.applicationType || "");
  const [specificProgram, setSpecificProgram] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const result = await portalApi.updateCase(token, caseData.id, {
        destinationCountry,
        applicationType,
        specificProgram,
      });

      if (result.success) {
        onSave({
          ...caseData,
          destinationCountry,
          applicationType,
        });
        onClose();
        alert("Case updated successfully");
      } else {
        setError(result.error || "Failed to update case");
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
              Destination Country
            </label>
            <input
              type="text"
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-immigration-500"
              placeholder="e.g., Canada"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Application Type
            </label>
            <select
              value={applicationType}
              onChange={(e) => setApplicationType(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-immigration-500"
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
