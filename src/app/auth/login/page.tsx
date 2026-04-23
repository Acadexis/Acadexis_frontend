"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import apiService from "@/services/apiService"; // adjust to your actual path

// ─── Validation Schema ────────────────────────────────────────────────────────
const loginSchema = z.object({
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
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  // ── Credential login ────────────────────────────────────────────────────────
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await apiService.post("/auth/login", {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      // Handle successful login — e.g. store token, redirect
      // router.push("/dashboard");
      console.log("Login successful", response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Invalid credentials. Please try again.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google SSO ──────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setServerError(null);

    try {
      const response = await apiService.get("/auth/google/university");
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      setServerError("Failed to initiate Google login. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#eef2f0] px-4 py-10">
      {/* Subtle background radial accents */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(34,197,94,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(15,23,62,0.06) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[480px] flex flex-col items-center gap-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col items-center gap-3 text-center mb-4">
          <div className="w-[52px] h-[52px] rounded-[14px] bg-[#0f173e] flex items-center justify-center text-green-500">
            <GraduationCap size={24} strokeWidth={1.8} />
          </div>

          <h1 className="text-[2rem] font-bold text-[#0f173e] tracking-tight leading-tight font-serif">
            Acadexis
          </h1>

          <p className="text-sm text-gray-500 leading-relaxed max-w-[300px]">
            Sign in to your lecturer workspace to manage your digital
            athenaeum.
          </p>
        </header>

        {/* ── Card ───────────────────────────────────────────────────────── */}
        <div className="w-full bg-white rounded-4xl px-8 py-9 flex flex-col gap-5">
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
            className="flex flex-col gap-8"
          >
            {/* Email */}
            <div className="flex flex-col gap-3">
              <label htmlFor="email" className="text-sm font-medium text-gray-900">
                University Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="professor.name@university.edu"
                className={`w-full bg-transparent border-0 border-b pb-1.5 text-[0.9375rem] text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-b-[#0f173e] ${
                  errors.email ? "border-b-red-500" : "border-b-gray-300"
                }`}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-0.5" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-3">
              <label htmlFor="password" className="text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full bg-transparent border-0 border-b pb-1.5 pr-8 text-[0.9375rem] text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-b-[#0f173e] ${
                    errors.password ? "border-b-red-500" : "border-b-gray-300"
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0f173e] transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.8} />
                  ) : (
                    <Eye size={18} strokeWidth={1.8} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-0.5" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#0f173e] cursor-pointer"
                  {...register("rememberMe")}
                />
                Remember me
              </label>
              <a
                href="/auth/forgot-password"
                className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#0f173e] hover:bg-[#1a2456] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3.5 text-base transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Spinner light />
                  Signing in…
                </>
              ) : (
                "Log in to your workspace →"
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
            onClick={handleGoogleLogin}
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
        </div>

        {/* Footer note */}
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <a
            href="/auth/register"
            className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
          >
            Register
          </a>
        </p>

        {/* Legal footer */}
        <footer className="flex flex-col items-center gap-1.5 mt-6">
          <div className="flex items-center gap-5 flex-wrap justify-center">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Help Center", href: "/help" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[0.8125rem] text-gray-400 hover:text-gray-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-[0.8125rem] text-gray-400">
            © {new Date().getFullYear()} The Digital Athenaeum. All academic rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
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
