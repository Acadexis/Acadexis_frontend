import { AxiosRequestConfig, AxiosResponse } from "axios";
import apiClient from "./api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Standardised shape every service method resolves to */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

/** Shape returned by the login endpoint */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Minimal user shape — extend to match your backend */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// ─── Course Types ─────────────────────────────────────────────────────────────

export interface CurriculumItem {
  id: string;
  title: string;
  duration: string;
  done: boolean;
  active: boolean;
  locked: boolean;
}

export interface Module {
  id: string;
  courseId: string;
  icon?: string;
  tag?: string;
  title: string;
  description: string;
  duration?: string;
  completed?: number;
  total?: number;
  studyGroup?: boolean;
  memberCount?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  featuredModuleId: string;
  curriculum: CurriculumItem[];
}

export interface Recommendation {
  id: string;
  courseId: string;
  studentId: string;
  body: string;
  actions: Array<{
    label: string;
    primary?: boolean;
    accent?: boolean;
  }>;
}

// ─── Service ──────────────────────────────────────────────────────────────────

const apiService = {
  // ── Generic HTTP verbs ──────────────────────────────────────────────────────

  get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return apiClient.get<T>(url, config);
  },

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return apiClient.post<T>(url, data, config);
  },

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return apiClient.put<T>(url, data, config);
  },

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return apiClient.patch<T>(url, data, config);
  },

  delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return apiClient.delete<T>(url, config);
  },

  // ── Auth ────────────────────────────────────────────────────────────────────

  auth: {
    /** Email + password login */
    login(payload: LoginPayload): Promise<AxiosResponse<LoginResponse>> {
      return apiClient.post<LoginResponse>("/auth/login", payload);
    },

    /** Logout — invalidates refresh token on the server */
    logout(): Promise<AxiosResponse<void>> {
      return apiClient.post<void>("/auth/logout");
    },

    /** Get the Google OAuth redirect URL for university SSO */
    getGoogleAuthUrl(): Promise<AxiosResponse<{ url: string }>> {
      return apiClient.get<{ url: string }>("/auth/google/university");
    },

    /** Exchange Google OAuth code for tokens (called on the callback page) */
    googleCallback(code: string): Promise<AxiosResponse<LoginResponse>> {
      return apiClient.post<LoginResponse>("/auth/google/callback", { code });
    },

    /** Request a password-reset email */
    forgotPassword(email: string): Promise<AxiosResponse<{ message: string }>> {
      return apiClient.post<{ message: string }>("/auth/forgot-password", { email });
    },

    /** Complete password reset with the token from the email */
    resetPassword(
      token: string,
      newPassword: string
    ): Promise<AxiosResponse<{ message: string }>> {
      return apiClient.post<{ message: string }>("/auth/reset-password", {
        token,
        newPassword,
      });
    },
  },

  // ── User / Profile ──────────────────────────────────────────────────────────

  user: {
    /** Get the currently authenticated user's profile */
    me(): Promise<AxiosResponse<User>> {
      return apiClient.get<User>("/users/me");
    },

    /** Update profile fields */
    update(data: Partial<User>): Promise<AxiosResponse<User>> {
      return apiClient.patch<User>("/users/me", data);
    },

    /** Change password (requires current password) */
    changePassword(
      currentPassword: string,
      newPassword: string
    ): Promise<AxiosResponse<{ message: string }>> {
      return apiClient.post<{ message: string }>("/users/me/change-password", {
        currentPassword,
        newPassword,
      });
    },
  },

  // ── Courses ──────────────────────────────────────────────────────────────────

  courses: {
    /** Get all courses */
    getAll(): Promise<AxiosResponse<Course[]>> {
      return apiClient.get<Course[]>("/courses");
    },

    /** Get a specific course by ID */
    getById(courseId: string): Promise<AxiosResponse<Course>> {
      return apiClient.get<Course>(`/courses/${courseId}`);
    },

    /** Get modules for a course */
    getModules(courseId: string): Promise<AxiosResponse<Module[]>> {
      return apiClient.get<Module[]>(`/modules?courseId=${courseId}`);
    },

    /** Get a specific module by ID */
    getModuleById(moduleId: string): Promise<AxiosResponse<Module>> {
      return apiClient.get<Module>(`/modules/${moduleId}`);
    },

    /** Get recommendations for a course */
    getRecommendations(courseId: string): Promise<AxiosResponse<Recommendation[]>> {
      return apiClient.get<Recommendation[]>(`/recommendations?courseId=${courseId}`);
    },
  },
};

export default apiService;