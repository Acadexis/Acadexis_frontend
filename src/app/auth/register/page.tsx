"use client";

import { useRouter } from "next/navigation";
import { Landmark, UserSquare2, GraduationCap } from "lucide-react";

export default function RoleSelectPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col bg-[#eef2f0] px-4">
      {/* Top nav */}
      <nav className="flex justify-center pt-6 pb-2">
        <span className="text-sm font-medium text-[#0f173e] tracking-wide">
          The Academic Curator
        </span>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center mt-10 gap-4">
        <div className="w-[64px] h-[64px] rounded-2xl bg-[#0f173e] flex items-center justify-center text-green-400">
          <Landmark size={28} strokeWidth={1.6} />
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-[#0f173e] tracking-tight leading-[1.15] font-serif max-w-[520px]">
          Welcome to Academic Curator
        </h1>

        <p className="text-gray-500 text-base max-w-[320px] leading-relaxed">
          Choose how you want to use the platform
        </p>
      </section>

      {/* Role cards */}
      <section className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12 w-full max-w-[700px] mx-auto">
        {/* Lecturer */}
        <button
          onClick={() => router.push("/auth/register/lecturer")}
          className="group w-full sm:w-[280px] bg-white rounded-2xl p-7 text-left shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(15,23,62,0.07)] hover:shadow-[0_4px_24px_rgba(15,23,62,0.14)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 cursor-pointer border border-transparent hover:border-green-100"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
            <UserSquare2 size={20} strokeWidth={1.6} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#0f173e] font-serif">Lecturer</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Upload materials, create AI tutors, and track student performance
            </p>
          </div>
          <span className="text-sm font-medium text-green-600 group-hover:gap-2 flex items-center gap-1.5 transition-all">
            Start as Educator
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </span>
        </button>

        {/* Student */}
        <button
          onClick={() => router.push("/auth/register/student")}
          className="group w-full sm:w-[280px] bg-white rounded-2xl p-7 text-left shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(15,23,62,0.07)] hover:shadow-[0_4px_24px_rgba(15,23,62,0.14)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 cursor-pointer border border-transparent hover:border-green-100"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
            <GraduationCap size={20} strokeWidth={1.6} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#0f173e] font-serif">Student</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Learn from course materials, chat with AI, and take quizzes
            </p>
          </div>
          <span className="text-sm font-medium text-green-600 flex items-center gap-1.5 transition-all">
            Start Learning
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </span>
        </button>
      </section>

      {/* Quote block */}
      <div className="mx-auto mt-8 max-w-[640px] w-full bg-white rounded-xl px-6 py-4 border-l-4 border-green-400 shadow-sm">
        <p className="text-sm text-gray-600 leading-relaxed italic">
          "Our AI curator adapts to your specific role, ensuring whether you're
          architecting a course or mastering a subject, the interface stays
          focused on your unique academic goals."
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-10 pb-6 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-[700px] mx-auto w-full">
        <p className="text-xs text-gray-400 order-last sm:order-first">
          © 2024 The Academic Curator. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          {["Terms of Service", "Privacy Policy", "Help Center"].map((t) => (
            <a
              key={t}
              href="#"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {t}
            </a>
          ))}
          <span className="text-xs text-gray-500">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
            >
              Log in
            </a>
          </span>
        </div>
      </footer>
    </main>
  );
}