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

  // Coordinator methods
  getQuickInquiries: async (token: string) => {
    const res = await fetch(`${BACKEND_URL}/contact/inquiries?status=PENDING`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getPendingAssessments: async (token: string) => {
    const res = await fetch(`${BACKEND_URL}/immigration/assessments?status=PENDING&assigned_to=me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  acceptAssessment: async (token: string, assessmentId: string) => {
    const res = await fetch(`${BACKEND_URL}/immigration/assessments/${assessmentId}/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.json();
  },

  // Matchmaker methods
  getMatrimonialProfiles: async (token: string) => {
    const res = await fetch(`${BACKEND_URL}/matrimonial/profiles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getMatches: async (token: string) => {
    const res = await fetch(`${BACKEND_URL}/matrimonial/matches?status=PENDING`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Admin methods
  getAllCases: async (token: string) => {
    const res = await fetch(`${BACKEND_URL}/immigration/cases?admin=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getAllLeads: async (token: string) => {
    const res = await fetch(`${BACKEND_URL}/contact/leads?admin=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getAllProfiles: async (token: string) => {
    const res = await fetch(`${BACKEND_URL}/matrimonial/profiles?admin=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getAllAssessments: async (token: string) => {
    const res = await fetch(`${BACKEND_URL}/immigration/assessments?admin=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
