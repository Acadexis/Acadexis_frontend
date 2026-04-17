"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import apiService from "@/services/apiService";
import { tokenStorage } from "@/services/api-client";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = "lecturer" | "student";

// ─── Departments (lecturer only) ──────────────────────────────────────────────
const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Medicine",
  "Law",
  "Economics",
  "Arts & Humanities",
  "Social Sciences",
  "Education",
  "Other",
] as const;

// ─── Validation Schema ────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .regex(/^[a-zA-Z\s.'-]+$/, "Name contains invalid characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .refine(
        (val) =>
          val.endsWith(".edu") ||
          val.includes("university") ||
          val.includes("ac."),
        { message: "Please use your university email address" }
      ),

    department: z.string().optional(),

    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────
interface RegisterFormProps {
  role: UserRole;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterForm({ role }: RegisterFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isLecturer = role === "lecturer";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Password strength indicator
  const passwordValue = watch("password", "");
  const strength = getPasswordStrength(passwordValue);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role,
        ...(isLecturer && data.department ? { department: data.department } : {}),
      };

      const response = await apiService.post("/auth/register", payload);
      const { tokens } = response.data as { tokens: { accessToken: string; refreshToken: string } };

      tokenStorage.setToken(tokens.accessToken);
      tokenStorage.setRefreshToken(tokens.refreshToken);

      router.push(isLecturer ? "/dashboard/lecturer" : "/dashboard/student");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? "Registration failed. Please try again.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google SSO ──────────────────────────────────────────────────────────────
  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    setServerError(null);

    try {
      const response = await apiService.auth.getGoogleAuthUrl();
      if (response.data?.url) {
        window.location.href = `${response.data.url}&role=${role}`;
      }
    } catch {
      setServerError("Failed to initiate Google sign-up. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#eef2f0] px-4 py-8">
      {/* Top nav */}
      <nav className="flex justify-center mb-8">
        <a
          href="/register"
          className="text-sm font-medium text-[#0f173e] tracking-wide hover:text-green-600 transition-colors"
        >
          The Academic Curator
        </a>
      </nav>

      <div className="w-full max-w-[620px] mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="text-center flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0f173e] tracking-tight leading-tight font-serif">
            {isLecturer
              ? "Empower your students with AI-assisted learning"
              : "Start your AI-powered learning journey"}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {isLecturer
              ? "Join the next generation of academic innovators. Create your lecturer account to get started."
              : "Access course materials, chat with AI tutors, and track your academic progress."}
          </p>
        </header>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_32px_rgba(15,23,62,0.08)] overflow-hidden">
          {/* Green left accent */}
          <div className="flex">
            <div className="w-1.5 bg-green-400 flex-shrink-0" />

            <div className="flex-1 px-8 py-8 flex flex-col gap-5">
              {/* Server error */}
              {serverError && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-5"
              >
                {/* Full Name */}
                <Field label="FULL NAME" error={errors.fullName?.message}>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    autoComplete="name"
                    className={inputCn(!!errors.fullName)}
                    {...register("fullName")}
                  />
                </Field>

                {/* Email */}
                <Field label="UNIVERSITY EMAIL" error={errors.email?.message}>
                  <input
                    type="email"
                    placeholder="professor@university.edu"
                    autoComplete="email"
                    className={inputCn(!!errors.email)}
                    {...register("email")}
                  />
                </Field>

                {/* Department — lecturer only */}
                {isLecturer && (
                  <Field
                    label="ACADEMIC DEPARTMENT"
                    error={errors.department?.message}
                  >
                    <select
                      className={`${inputCn(!!errors.department)} text-gray-700 bg-white cursor-pointer`}
                      defaultValue=""
                      {...register("department")}
                    >
                      <option value="" disabled>
                        Select department
                      </option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {/* Password */}
                <Field label="PASSWORD" error={errors.password?.message}>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`${inputCn(!!errors.password)} pr-8`}
                      {...register("password")}
                    />
                    <EyeToggle
                      show={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                    />
                  </div>
                  {/* Strength meter */}
                  {passwordValue.length > 0 && (
                    <div className="mt-2 flex gap-1.5 items-center">
                      {[1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            i <= strength.score
                              ? strength.color
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1 min-w-[50px]">
                        {strength.label}
                      </span>
                    </div>
                  )}
                </Field>

                {/* Confirm Password */}
                <Field
                  label="CONFIRM PASSWORD"
                  error={errors.confirmPassword?.message}
                >
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`${inputCn(!!errors.confirmPassword)} pr-8`}
                      {...register("confirmPassword")}
                    />
                    <EyeToggle
                      show={showConfirm}
                      onToggle={() => setShowConfirm((v) => !v)}
                    />
                  </div>
                </Field>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#0f173e] hover:bg-[#1a2456] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3.5 text-base transition-all duration-200 mt-1"
                >
                  {isLoading ? (
                    <>
                      <Spinner light />
                      Creating account…
                    </>
                  ) : isLecturer ? (
                    "Create my lecturer workspace →"
                  ) : (
                    "Create my student account →"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 text-xs text-gray-400 tracking-widest uppercase">
                <span className="flex-1 h-px bg-gray-200" />
                OR
                <span className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google SSO */}
              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 disabled:opacity-70 disabled:cursor-not-allowed text-gray-700 font-medium rounded-xl py-3.5 text-[0.9375rem] transition-all duration-200"
              >
                {isGoogleLoading ? (
                  <>
                    <Spinner />
                    Redirecting…
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    Continue with Google (University account)
                  </>
                )}
              </button>

              {/* Footer note */}
              <p className="text-sm text-gray-500 text-center">
                Already have a lecturer account?{" "}
                <a
                  href="/login"
                  className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
                >
                  Log in
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: "🛡", label: "ACADEMIC VERIFIED" },
            { icon: "🔒", label: "FERPA COMPLIANT" },
            { icon: "🌐", label: "GLOBAL STANDARDS" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-sm text-gray-400">{icon}</span>
              <span className="text-[0.7rem] font-semibold text-gray-400 tracking-wider">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Legal */}
        <p className="text-center text-[0.8125rem] text-gray-400 pb-4">
          © 2024 The Academic Curator. All rights reserved.
        </p>
      </div>
    </main>
  );
}

// ─── Helper: input classnames ─────────────────────────────────────────────────
function inputCn(hasError: boolean) {
  return `w-full bg-transparent border-0 border-b pb-1.5 text-[0.9375rem] text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-b-[#0f173e] appearance-none ${
    hasError ? "border-b-red-500" : "border-b-gray-300"
  }`;
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.6875rem] font-semibold tracking-widest text-gray-500 uppercase">
        {label}
      </span>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Eye toggle button ────────────────────────────────────────────────────────
function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0f173e] transition-colors p-1"
    >
      {show ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
    </button>
  );
}

// ─── Password strength ────────────────────────────────────────────────────────
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-400" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-yellow-400" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-blue-400" };
  return { score: 4, label: "Strong", color: "bg-green-500" };
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ light = false }: { light?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block w-4 h-4 rounded-full border-2 animate-spin ${
        light
          ? "border-white/30 border-t-white"
          : "border-gray-300/40 border-t-gray-600"
      }`}
    />
  );
}

// ─── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}