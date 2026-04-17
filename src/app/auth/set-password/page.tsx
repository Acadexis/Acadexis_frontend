"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeftIcon, Eye, EyeOff, ShieldCogIcon } from "lucide-react";
import apiService from "@/services/apiService";
import { tokenStorage } from "@/services/api-client";
import AuthNavbar from "@/components/AuthNavbar";
import AuthFooter from "@/components/AuthFooter";

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const passwordSchema = z
  .object({
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

type PasswordFormData = z.infer<typeof passwordSchema>;

// ─── Password strength ────────────────────────────────────────────────────────
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (!password) return { score: 0, label: "", color: "bg-gray-200" };
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
function EyeToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0f173e] transition-colors p-1"
    >
      {show ? (
        <EyeOff size={18} strokeWidth={1.8} />
      ) : (
        <Eye size={18} strokeWidth={1.8} />
      )}
    </button>
  );
}

export default function SetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const payload = { password: data.password };
      const response = await apiService.post("/auth/register", payload);
      const { tokens } = response.data as {
        tokens: { accessToken: string; refreshToken: string };
      };

      tokenStorage.setToken(tokens.accessToken);
      tokenStorage.setRefreshToken(tokens.refreshToken);
      // Add navigation or success state here
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        "Registration failed. Please try again.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#eef2f0]">
      <AuthNavbar />

      <div className=" flex items-center justify-center  px-4 py-10">
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(34,197,94,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(15,23,62,0.06) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-4 justify-center">
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_32px_rgba(15,23,62,0.08)] overflow-hidden w-full max-w-[440px]">
            <div className="flex flex-col">
              <div className="h-1.5 bg-[#0f173e] flex-shrink-0" />
            </div>

            <div className="px-8 py-8">
              <header className="flex flex-col items-center gap-3 text-center mb-12">
                <h1 className="text-[2rem] font-bold text-[#0f173e] tracking-tight leading-tight font-serif">
                  Set a new password
                </h1>
                <p className="text-gray-500 leading-relaxed max-w-[300px]">
                  Your new password must be different from the previous one.
                </p>
              </header>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-6 mb-6"
              >
                {serverError && (
                  <div
                    className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
                    role="alert"
                  >
                    {serverError}
                  </div>
                )}

                {/* Password */}
                <Field label="NEW PASSWORD" error={errors.password?.message}>
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
                  {passwordValue.length > 0 && (
                    <div className="mt-2 flex gap-1.5 items-center">
                      {[1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            i <= strength.score ? strength.color : "bg-gray-200"
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
                  label="CONFIRM NEW PASSWORD"
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
                  className="w-full flex items-center justify-center gap-2 bg-[#0f173e] hover:bg-[#1a2456] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3.5 text-base transition-all duration-200 mt-2 mb-4"
                >
                  {isLoading ? (
                    <>
                      <Spinner light />
                      Updating password…
                    </>
                  ) : (
                    "Update password →"
                  )}
                </button>
              </form>

              <div className="rounded-md bg-gray-100">
                <div className="flex">
                  <div className="w-1.5 bg-green-500 flex-shrink-0 rounded-l-md" />

                  <div className="flex items-start gap-4 px-4 py-3 text-black text-sm rounded-b-lg">
                    <ShieldCogIcon size={45} className="text-green-500" />
                    <p className="text-gray-700 text-sm">
                      We use advanced encryption to secure your identity. After
                      updating, you will be logged out of all active sessions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <a
            href="/auth/login"
            className="flex items-center justify-center gap-2 text-green-500 mt-4"
          >
            <ArrowLeftIcon size={16} /> Back to Login
          </a>
        </div>
      </div>

      <AuthFooter />
    </main>
  );
}
