"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { portalApi } from "@/lib/portal-api";

interface ProfileDetail {
  id: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: string;
  maritalStatus?: string;
  currentCountry?: string;
  currentCity?: string;
  motherTongue?: string;
  fatherName?: string;
  motherName?: string;
  siblingCount?: number;
  familyBackground?: string;
  educationLevel?: string;
  institution?: string;
  fieldOfStudy?: string;
  currentProfession?: string;
  employmentType?: string;
  annualIncome?: string;
  religionPractice?: string;
  prayerFrequency?: string;
  dietaryPreference?: string;
  smokingHabits?: string;
  drinkingHabits?: string;
  lifestyle?: string;
  hobbies?: string[];
  partnerPreferences?: string;
  ageRange?: string;
  heightRange?: string;
  professionPreference?: string;
  locationPreference?: string;
  photos?: Array<{
    id: string;
    url: string;
    uploadedAt: string;
  }>;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Reject form state
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("pioneer_token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        const res = await portalApi.getProfileDetails(token, profileId);
        if (res.data) {
          setProfile(res.data);
          setError("");
        } else {
          setError("Failed to load profile details");
        }
      } catch (err) {
        console.error("[ProfileDetail] Error loading profile:", err);
        setError("Error loading profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const handleApprove = async () => {
    if (!profileId) return;
    setActionLoading(true);
    setSuccessMessage("");
    try {
      const token = localStorage.getItem("pioneer_token");
      if (!token) {
        setError("No authentication token found.");
        return;
      }

      const res = await portalApi.approveProfile(token, profileId);
      if (res.success) {
        setSuccessMessage("Profile approved successfully!");
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                status: "APPROVED",
                approvedAt: new Date().toISOString(),
              }
            : null
        );
        setTimeout(() => {
          router.push("/admin?tab=profiles");
        }, 1500);
      } else {
        setError(res.error || "Failed to approve profile");
      }
    } catch (err) {
      console.error("[ProfileDetail] Error approving profile:", err);
      setError("Error approving profile. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!profileId || !rejectReason) {
      setError("Please provide a rejection reason");
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

      const res = await portalApi.rejectProfile(token, profileId, rejectReason, rejectNotes);
      if (res.success) {
        setSuccessMessage("Profile rejected successfully!");
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                status: "REJECTED",
                rejectedAt: new Date().toISOString(),
              }
            : null
        );
        setTimeout(() => {
          router.push("/admin?tab=profiles");
        }, 1500);
      } else {
        setError(res.error || "Failed to reject profile");
      }
    } catch (err) {
      console.error("[ProfileDetail] Error rejecting profile:", err);
      setError("Error rejecting profile. Please try again.");
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
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-marriage-200 border-t-marriage-700" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <Container className="max-w-4xl">
          <button
            onClick={() => router.push("/admin?tab=profiles")}
            className="flex items-center gap-2 text-marriage-700 hover:text-marriage-800 mb-6 font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profiles
          </button>
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-stone-400" />
            <h2 className="mt-4 text-lg font-bold text-stone-800">Profile Not Found</h2>
            <p className="mt-2 text-sm text-stone-500">{error || "The profile you're looking for does not exist."}</p>
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
          onClick={() => router.push("/admin?tab=profiles")}
          className="flex items-center gap-2 text-marriage-700 hover:text-marriage-800 mb-6 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profiles
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-marriage-200 bg-gradient-to-r from-marriage-50 to-white p-6">
          <div>
            <h1 className="text-3xl font-bold text-marriage-900">{profile.fullName || "Profile"}</h1>
            <p className="mt-2 text-sm text-stone-600">ID: {profile.id}</p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              profile.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : profile.status === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {profile.status || "PENDING"}
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
          {/* Section A: Personal & Identity */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-stone-900">Personal & Identity</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Full Name</p>
                <p className="mt-1 text-sm text-stone-900">{profile.fullName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Date of Birth</p>
                <p className="mt-1 text-sm text-stone-900">
                  {profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Gender</p>
                <p className="mt-1 text-sm text-stone-900">{profile.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Height</p>
                <p className="mt-1 text-sm text-stone-900">{profile.height || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Marital Status</p>
                <p className="mt-1 text-sm text-stone-900">{profile.maritalStatus || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Mother Tongue</p>
                <p className="mt-1 text-sm text-stone-900">{profile.motherTongue || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Country</p>
                <p className="mt-1 text-sm text-stone-900">{profile.currentCountry || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">City</p>
                <p className="mt-1 text-sm text-stone-900">{profile.currentCity || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Section B: Family Background */}
          {(profile.fatherName || profile.motherName || profile.siblingCount) && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-stone-900">Family Background</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Father's Name</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.fatherName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Mother's Name</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.motherName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Siblings</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.siblingCount || "N/A"}</p>
                </div>
              </div>
              {profile.familyBackground && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-stone-600 uppercase">Background</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.familyBackground}</p>
                </div>
              )}
            </div>
          )}

          {/* Section C: Education & Career */}
          {(profile.educationLevel || profile.currentProfession) && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-stone-900">Education & Career</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Education Level</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.educationLevel || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Institution</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.institution || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Field of Study</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.fieldOfStudy || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Current Profession</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.currentProfession || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Employment Type</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.employmentType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Annual Income</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.annualIncome || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section D: Religious Practice */}
          {(profile.religionPractice || profile.prayerFrequency) && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-stone-900">Religious Practice</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Religion Practice</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.religionPractice || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Prayer Frequency</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.prayerFrequency || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section E: Lifestyle & Values */}
          {(profile.dietaryPreference || profile.smokingHabits || profile.lifestyle) && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-stone-900">Lifestyle & Values</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Dietary Preference</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.dietaryPreference || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Smoking Habits</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.smokingHabits || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Drinking Habits</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.drinkingHabits || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Lifestyle</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.lifestyle || "N/A"}</p>
                </div>
              </div>
              {profile.hobbies && profile.hobbies.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-stone-600 uppercase">Hobbies</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.hobbies.join(", ")}</p>
                </div>
              )}
            </div>
          )}

          {/* Section F: Partner Preferences */}
          {profile.partnerPreferences && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-stone-900">Partner Preferences</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Age Range</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.ageRange || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Height Range</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.heightRange || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Profession Preference</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.professionPreference || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Location Preference</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.locationPreference || "N/A"}</p>
                </div>
              </div>
              {profile.partnerPreferences && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-stone-600 uppercase">Additional Preferences</p>
                  <p className="mt-1 text-sm text-stone-900">{profile.partnerPreferences}</p>
                </div>
              )}
            </div>
          )}

          {/* Section G: Photos */}
          {profile.photos && profile.photos.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-stone-900">Photos</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {profile.photos.map((photo) => (
                  <div key={photo.id} className="rounded-lg overflow-hidden bg-stone-100">
                    <img
                      src={photo.url}
                      alt="Profile photo"
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e7e5e4' width='200' height='200'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section H: Metadata */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <h2 className="mb-4 text-lg font-bold text-stone-900">Metadata</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Created</p>
                <p className="mt-1 text-sm text-stone-900">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-600 uppercase">Updated</p>
                <p className="mt-1 text-sm text-stone-900">
                  {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "N/A"}
                </p>
              </div>
              {profile.approvedAt && (
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Approved At</p>
                  <p className="mt-1 text-sm text-stone-900">{new Date(profile.approvedAt).toLocaleString()}</p>
                </div>
              )}
              {profile.rejectedAt && (
                <div>
                  <p className="text-xs font-semibold text-stone-600 uppercase">Rejected At</p>
                  <p className="mt-1 text-sm text-stone-900">{new Date(profile.rejectedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {profile.status !== "APPROVED" && profile.status !== "REJECTED" && (
          <div className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-stone-900">Admin Actions</h2>

            <div className="flex flex-col gap-3 md:flex-row">
              <Button
                tone="marriage"
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? "Processing..." : "Approve Profile"}
              </Button>
              <Button
                tone="neutral"
                variant="outline"
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={actionLoading}
                className="flex-1"
              >
                {showRejectForm ? "Cancel Reject" : "Reject Profile"}
              </Button>
            </div>

            {/* Reject Form */}
            {showRejectForm && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <h3 className="mb-4 font-semibold text-red-900">Rejection Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">
                      Rejection Reason
                    </label>
                    <select
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                    >
                      <option value="">Select a reason...</option>
                      <option value="STATUS_MOTIVATED">Status Motivated</option>
                      <option value="TRAFFICKING_RISK">Trafficking Risk</option>
                      <option value="FALSE_INFORMATION">False Information</option>
                      <option value="INCOMPLETE_PROFILE">Incomplete Profile</option>
                      <option value="VERIFICATION_FAILED">Verification Failed</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      placeholder="Enter any additional notes..."
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <Button
                    tone="neutral"
                    onClick={handleReject}
                    disabled={actionLoading || !rejectReason}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {actionLoading ? "Processing..." : "Confirm Rejection"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Badge for Approved/Rejected */}
        {(profile.status === "APPROVED" || profile.status === "REJECTED") && (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 text-center">
            <div className="flex justify-center mb-3">
              {profile.status === "APPROVED" ? (
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
            </div>
            <h2 className="text-lg font-bold text-stone-900">
              {profile.status === "APPROVED" ? "Profile Approved" : "Profile Rejected"}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              {profile.status === "APPROVED"
                ? `Approved on ${new Date(profile.approvedAt!).toLocaleString()}`
                : `Rejected on ${new Date(profile.rejectedAt!).toLocaleString()}`}
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
