"use client";

import { ArrowLeftIcon, CircleAlert } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";
import AuthFooter from "@/components/AuthFooter";

export default function ExpiredLinkNotification() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#eef2f0]">

      <AuthNavbar />

      <div className=" flex items-center justify-center  px-4 py-10">
      {/* Background radial accents */}
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(34,197,94,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(15,23,62,0.06) 0%, transparent 60%)" }} aria-hidden="true" />


      <div className="relative w-full max-w-[480px] flex flex-col items-center gap-6">
        <div className="w-[70px] h-[70px] rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-sm">
          <CircleAlert size={30} strokeWidth={1.8} />
        </div>
        <div className=" bg-white rounded-2xl shadow-md flex flex-col items-center p-8 gap-6">
          <header className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-[2rem] font-bold text-[#0f173e] tracking-tight leading-tight font-serif">
              Invalid or Expired Link
            </h1>
            <p className="text-gray-500 leading-relaxed max-w-[300px]">
              The password reset link you used is either invalid or has expired.
              Please request a new one to reset your password.
            </p>
          </header>

          <div className="w-full  p-8 flex flex-col items-center gap-4 text-center">
            <a
              href="/auth/forgot-password"
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#0f173e] hover:bg-[#1a2456] active:scale-[0.99] text-white font-medium rounded-xl py-3.5 transition-all"
            >
              Request a new link
            </a>
            <a
              href="/auth/login"
              className="text-green-500 font-medium flex items-center gap-2 hover:underline mt-4"
            >
              <ArrowLeftIcon size={16} />
              Return to Login
            </a>
          </div>
        </div>

        <p className=" text-gray-400 flex items-center gap-1 mt-4">
          <CircleAlert size={16} className="inline" />
          Security measure: resent links expires after 24 hours.
        </p>
      </div>
        </div>

      <AuthFooter />

    </main>
  );
}
