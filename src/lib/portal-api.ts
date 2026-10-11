const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api/v1";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

// Helper to refresh token before it expires
async function refreshTokenIfNeeded(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  
  const token = localStorage.getItem("pioneer_token");
  const refreshToken = localStorage.getItem("pioneer_refresh_token");
  
  console.log("[refreshTokenIfNeeded] Token exists:", !!token, "RefreshToken exists:", !!refreshToken);
  
  if (!token || !refreshToken) {
    console.log("[refreshTokenIfNeeded] Missing token or refreshToken, skipping refresh");
    return null;
  }
  
  try {
    console.log("[refreshTokenIfNeeded] Attempting to refresh token...");
    // Try to refresh the token
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    
    console.log("[refreshTokenIfNeeded] Refresh response status:", res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log("[refreshTokenIfNeeded] Refresh successful, got new token");
      if (data.data?.accessToken) {
        localStorage.setItem("pioneer_token", data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem("pioneer_refresh_token", data.data.refreshToken);
        }
        return data.data.accessToken;
      }
    } else {
      console.warn("[refreshTokenIfNeeded] Refresh failed with status:", res.status);
    }
  } catch (err) {
    console.error("[refreshTokenIfNeeded] Error:", err);
  }
  
  return token;
}

export interface ClientCase {
  id: string;
  caseReference: string;
  destinationCountry: string;
  applicationType: string;
  status: string;
  stage?: string;
  submittedAt?: string;
  coordinator?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  documents?: Array<{
    id: string;
    documentType: string;
    fileName: string;
    verified: boolean;
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

export interface ClientMatch {
  id: string;
  rationale: string;
  status: string;
  matchmaker?: { name: string };
  profileA: {
    id: string;
    fullName: string;
    currentCity: string;
    currentCountry: string;
    currentProfession: string;
  };
  profileB: {
    id: string;
    fullName: string;
    currentCity: string;
    currentCountry: string;
    currentProfession: string;
  };
}

export const portalApi = {
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pioneer_token");
    }
    return null;
  },

  setToken: (token: string, user: AuthUser, refreshToken?: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pioneer_token", token);
      localStorage.setItem("pioneer_user", JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem("pioneer_refresh_token", refreshToken);
      }
    }
  },

  clearToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pioneer_token");
      localStorage.removeItem("pioneer_user");
      localStorage.removeItem("pioneer_refresh_token");
    }
  },

  getCurrentUser: (): AuthUser | null => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pioneer_user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  register: async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getMyCases: async (token: string) => {
    try {
      // Refresh token if needed
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;
      
      console.log("[getMyCases] Using token:", authToken?.substring(0, 20) + "...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/immigration/cases`, {
        headers: { Authorization: `Bearer ${authToken}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.warn("[getMyCases] API error:", res.status, res.statusText);
        return { data: [] };
      }
      
      const json = await res.json();
      console.log("[getMyCases] Response:", json);
      
      // Backend returns { data: { items: [...], total, page, limit, totalPages } }
      if (json.data?.items) return { data: json.data.items };
      if (json.items) return { data: json.items };
      if (json.data && Array.isArray(json.data)) return { data: json.data };
      if (Array.isArray(json)) return { data: json };
      return { data: [] };
    } catch (error) {
      console.error("[getMyCases] Error:", error);
      return { data: [] };
    }
  },

  getMyMatches: async (token: string) => {
    try {
      // Refresh token if needed
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;
      
      console.log("[getMyMatches] Using token:", authToken?.substring(0, 20) + "...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/matrimonial/my-matches`, {
        headers: { Authorization: `Bearer ${authToken}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.warn("[getMyMatches] API error:", res.status, res.statusText);
        return { data: [] };
      }
      
      const json = await res.json();
      console.log("[getMyMatches] Response:", json);
      
      // Handle different response formats from matrimonial endpoint
      if (json.data?.items) return { data: json.data.items };
      if (json.items) return { data: json.items };
      if (json.data && Array.isArray(json.data)) return { data: json.data };
      if (Array.isArray(json)) return { data: json };
      return { data: [] };
    } catch (error) {
      console.error("[getMyMatches] Error:", error);
      return { data: [] };
    }
  },

  getMyMatrimonialProfile: async (token: string) => {
    try {
      // Refresh token if needed
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;
      
      console.log("[getMyMatrimonialProfile] Using token:", authToken?.substring(0, 20) + "...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/matrimonial/my-profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.warn("[getMyMatrimonialProfile] API error:", res.status, res.statusText);
        return { data: null };
      }
      
      const json = await res.json();
      console.log("[getMyMatrimonialProfile] Response:", json);
      
      // Handle response - data is either wrapped in .data or directly in response
      if (json.data) return { data: json.data };
      return { data: json };
    } catch (error) {
      console.error("[getMyMatrimonialProfile] Error:", error);
      return { data: null };
    }
  },

  respondToMatch: async (token: string, matchId: string, response: "INTERESTED" | "NOT_INTERESTED") => {
    const res = await fetch(`${BACKEND_URL}/matrimonial/matches/${matchId}/respond`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ response }),
    });
    return res.json();
  },

  googleLogin: async (idToken: string) => {
    const res = await fetch(`${BACKEND_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    return res.json();
  },

  // Coordinator methods - use existing backend endpoints
  getQuickInquiries: async (token: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/coordinator/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) return { data: [] };
      const json = await res.json();
      // Return empty array as placeholder - actual data from getMyMatches would be available
      return { data: [] };
    } catch {
      return { data: [] };
    }
  },

  getPendingAssessments: async (token: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/immigration/cases?status=SUBMITTED`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) return { data: [] };
      const json = await res.json();
      if (json.data?.items) return { data: json.data.items };
      if (json.items) return { data: json.items };
      return { data: [] };
    } catch {
      return { data: [] };
    }
  },

  acceptAssessment: async (token: string, assessmentId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/immigration/cases/${assessmentId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "UNDER_REVIEW" }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Matchmaker methods
  getMatrimonialProfiles: async (token: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/matrimonial/profiles`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) return { data: [] };
      const json = await res.json();
      if (json.data?.items) return { data: json.data.items };
      if (json.items) return { data: json.items };
      if (json.data && Array.isArray(json.data)) return { data: json.data };
      return { data: [] };
    } catch {
      return { data: [] };
    }
  },

  getMatches: async (token: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/matchmaker/matches`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) return { data: [] };
      const json = await res.json();
      if (json.data?.items) return { data: json.data.items };
      if (json.items) return { data: json.items };
      if (json.data && Array.isArray(json.data)) return { data: json.data };
      return { data: [] };
    } catch {
      return { data: [] };
    }
  },

  // Admin methods
  getAllCases: async (token: string) => {
    try {
      // Refresh token if needed
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/immigration/cases`, {
        headers: { Authorization: `Bearer ${authToken}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) return { data: [] };
      const json = await res.json();
      if (json.data?.items) return { data: json.data.items };
      if (json.items) return { data: json.items };
      return { data: [] };
    } catch {
      return { data: [] };
    }
  },

  getAllLeads: async (token: string) => {
    try {
      // Refresh token if needed
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/contact/submissions`, {
        headers: { Authorization: `Bearer ${authToken}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) return { data: [] };
      const json = await res.json();
      if (json.data?.items) return { data: json.data.items };
      if (json.items) return { data: json.items };
      if (json.data && Array.isArray(json.data)) return { data: json.data };
      return { data: [] };
    } catch {
      return { data: [] };
    }
  },

  getAllProfiles: async (token: string) => {
    try {
      // Refresh token if needed
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/matrimonial/profiles`, {
        headers: { Authorization: `Bearer ${authToken}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) return { data: [] };
      const json = await res.json();
      if (json.data?.items) return { data: json.data.items };
      if (json.items) return { data: json.items };
      if (json.data && Array.isArray(json.data)) return { data: json.data };
      return { data: [] };
    } catch {
      return { data: [] };
    }
  },

  getAllAssessments: async (token: string) => {
    try {
      // Refresh token if needed
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/immigration/cases`, {
        headers: { Authorization: `Bearer ${authToken}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) return { data: [] };
      const json = await res.json();
      if (json.data?.items) return { data: json.data.items };
      if (json.items) return { data: json.items };
      return { data: [] };
    } catch {
      return { data: [] };
    }
  },

  // Admin Profile Detail & Actions
  getProfileDetails: async (token: string, profileId: string) => {
    try {
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;

      const res = await fetch(`${BACKEND_URL}/matrimonial/profiles/${profileId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) return { data: null };
      const json = await res.json();
      return { data: json.data || json };
    } catch (error) {
      console.error("[getProfileDetails] Error:", error);
      return { data: null };
    }
  },

  approveProfile: async (token: string, profileId: string) => {
    try {
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;

      const res = await fetch(`${BACKEND_URL}/matrimonial/profiles/${profileId}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("[approveProfile] Error:", error);
        return { success: false, error };
      }
      const json = await res.json();
      return { success: true, data: json.data || json };
    } catch (error) {
      console.error("[approveProfile] Error:", error);
      return { success: false, error: String(error) };
    }
  },

  rejectProfile: async (token: string, profileId: string, reasonCategory: string, notes: string) => {
    try {
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;

      const res = await fetch(`${BACKEND_URL}/matrimonial/profiles/${profileId}/decline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reasonCategory, notes }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("[rejectProfile] Error:", error);
        return { success: false, error };
      }
      const json = await res.json();
      return { success: true, data: json.data || json };
    } catch (error) {
      console.error("[rejectProfile] Error:", error);
      return { success: false, error: String(error) };
    }
  },

  // Admin Case Detail & Actions
  getCaseDetails: async (token: string, caseId: string) => {
    try {
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;

      const res = await fetch(`${BACKEND_URL}/immigration/cases/${caseId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) return { data: null };
      const json = await res.json();
      return { data: json.data || json };
    } catch (error) {
      console.error("[getCaseDetails] Error:", error);
      return { data: null };
    }
  },

  updateCaseStatus: async (token: string, caseId: string, status: string, notes?: string) => {
    try {
      const currentToken = await refreshTokenIfNeeded();
      const authToken = currentToken || token;

      const res = await fetch(`${BACKEND_URL}/immigration/cases/${caseId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("[updateCaseStatus] Error:", error);
        return { success: false, error };
      }
      const json = await res.json();
      return { success: true, data: json.data || json };
    } catch (error) {
      console.error("[updateCaseStatus] Error:", error);
      return { success: false, error: String(error) };
    }
  },
};
