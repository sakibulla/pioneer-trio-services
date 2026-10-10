/**
 * API Client Utility for Pioneer Trio Services
 * Handles all communication with the backend API
 */

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Generic API client function
 * @param endpoint - The API endpoint (e.g., '/contact/general')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Parsed JSON response
 */
export async function apiClient<T = any>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Get auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data;
  if (isJson) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Handle HTTP errors
  if (!response.ok) {
    const errorMessage = typeof data === 'object' ? data.error || data.message : data;
    const error = new Error(errorMessage || `HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data as T;
}

/**
 * GET request
 */
export async function get<T = any>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function post<T = any>(
  endpoint: string,
  body?: Record<string, any>
): Promise<T> {
  return apiClient<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function put<T = any>(
  endpoint: string,
  body?: Record<string, any>
): Promise<T> {
  return apiClient<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request
 */
export async function patch<T = any>(
  endpoint: string,
  body?: Record<string, any>
): Promise<T> {
  return apiClient<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function del<T = any>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: 'DELETE' });
}

/**
 * Upload file
 */
export async function uploadFile<T = any>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  // Add additional form fields
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Upload failed');
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data as T;
}

/**
 * Get API base URL
 */
export function getApiUrl(): string {
  return API_URL;
}

/**
 * Auth API calls
 */
export const auth = {
  register: (data: { email: string; password: string; name?: string }) =>
    post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    post('/auth/login', data),

  logout: () => post('/auth/logout'),

  refresh: () => post('/auth/refresh'),

  forgotPassword: (email: string) =>
    post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    post('/auth/reset-password', { token, password }),
};

/**
 * Contact API calls
 */
export const contact = {
  submitGeneral: (data: {
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) => post('/contact/general', data),

  submitImmigration: (data: any) =>
    post('/contact/immigration', data),

  submitMatrimonial: (data: any) =>
    post('/contact/matrimonial', data),

  subscribe: (email: string) =>
    post('/contact/subscribe', { email }),
};

/**
 * Immigration API calls
 */
export const immigration = {
  submitAssessment: (data: any) =>
    post('/immigration/assessments', data),

  getCases: (filters?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    return get(`/immigration/cases${params.toString() ? '?' + params : ''}`);
  },

  getCase: (caseId: string) =>
    get(`/immigration/cases/${caseId}`),

  updateCase: (caseId: string, data: any) =>
    put(`/immigration/cases/${caseId}`, data),

  uploadDocument: (caseId: string, file: File) =>
    uploadFile(`/immigration/cases/${caseId}/documents`, file, {
      caseId,
    }),

  submitQCReview: (caseId: string, data: any) =>
    post(`/immigration/cases/${caseId}/qc-review`, data),

  addNote: (caseId: string, note: string, noteType?: string) =>
    post(`/immigration/cases/${caseId}/notes`, { note, noteType }),
};

/**
 * Matrimonial API calls
 */
export const matrimonial = {
  submitProfile: (data: any) =>
    post('/matrimonial/profiles', data),

  getProfile: (profileId: string) =>
    get(`/matrimonial/profiles/${profileId}`),

  updateProfile: (profileId: string, data: any) =>
    put(`/matrimonial/profiles/${profileId}`, data),

  uploadPhoto: (profileId: string, file: File) =>
    uploadFile(`/matrimonial/profiles/${profileId}/photos`, file, {
      profileId,
    }),

  getMyMatches: () =>
    get('/matrimonial/matches/my-matches'),

  respondToMatch: (matchId: string, response: 'INTERESTED' | 'NOT_INTERESTED') =>
    post(`/matrimonial/matches/${matchId}/respond`, { response }),
};

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL.replace('/api/v1', '')}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
