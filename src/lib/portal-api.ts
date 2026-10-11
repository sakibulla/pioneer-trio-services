const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api/v1";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
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

  setToken: (token: string, user: AuthUser) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pioneer_token", token);
      localStorage.setItem("pioneer_user", JSON.stringify(user));
    }
  },

  clearToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pioneer_token");
      localStorage.removeItem("pioneer_user");
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/immigration/cases`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/matrimonial/my-matches`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/matrimonial/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/immigration/cases`, {
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

  getAllLeads: async (token: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) return { data: [] };
      return { data: [] };
    } catch {
      return { data: [] };
    }
  },

  getAllProfiles: async (token: string) => {
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

  getAllAssessments: async (token: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BACKEND_URL}/immigration/cases`, {
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
};
