"use client";

import { useState } from "react"; // 1. Import useState
import { ArrowLeftIcon, ArrowRightIcon, MessageSquare, LockOpenIcon } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";
import AuthFooter from "@/components/AuthFooter";

// Move EmailNotification outside or keep it as a sub-component
function EmailNotification() {
  return (
    <div className="relative w-full max-w-[480px] flex flex-col items-center gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="w-[52px] h-[52px] rounded-full bg-green-500 flex items-center justify-center text-[#0f173e] shadow-md">
          <MessageSquare size={26} strokeWidth={1.8} />
        </div>
        <h1 className="text-[2rem] font-bold text-[#0f173e] tracking-tight leading-tight font-serif">
          Check Your Inbox
        </h1>
        <p className="text-gray-500 leading-relaxed max-w-[300px]">
          If an account exists for the email you entered, you should receive a password reset link shortly.
        </p>
      </header>

      <div className="w-full  p-8 flex flex-col items-center gap-4 text-center">
        <a 
        href="/auth/login"
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#0f173e] hover:bg-[#1a2456] active:scale-[0.99] text-white font-medium rounded-xl py-3.5 transition-all"
              >
                Return to Login
              </a>
        <p className="text-sm text-gray-500">Didn't receive the email?</p>
        <button 
          onClick={() => window.location.reload()} // Simple way to let them try again
          className="text-green-500 font-medium hover:underline"
        >
          Resend link
        </button>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false); // 2. Add state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle your API logic here
    setIsSubmitted(true); // 3. Toggle state on success
  };

  return (
        <main className="min-h-screen flex flex-col justify-between bg-[#eef2f0]"> 
        <AuthNavbar />
    
        <div className=" flex items-center justify-center  px-4 py-10">
      {/* Background radial accents */}
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(34,197,94,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(15,23,62,0.06) 0%, transparent 60%)" }} aria-hidden="true" />

      {/* 4. Conditional Rendering */}
      {isSubmitted ? (
        <EmailNotification />
      ) : (
        <div className="relative w-full max-w-[480px] flex flex-col items-center gap-6">
          <header className="flex flex-col items-center gap-3 text-center">
            <div className="w-[52px] h-[52px] rounded-full bg-[#0f173e] flex items-center justify-center text-green-500 shadow-md">
              <LockOpenIcon size={26} strokeWidth={1.8} />
            </div>
            <h1 className="text-[2rem] font-bold text-[#0f173e] tracking-tight leading-tight font-serif">
              Reset Your Password
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[300px]">
              Enter your university email address and we'll send you a link.
            </p>
          </header>

          <div className="w-full bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1 mb-8">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
                  University Email
                </label>
                <input
                  required
                  type="email"
                  id="email"
                  placeholder="professor@university.edu"
                  className="border-b border-gray-300 text-[#0f173e] text-sm py-2 px-1 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#0f173e] hover:bg-[#1a2456] active:scale-[0.99] text-white font-medium rounded-xl py-3.5 transition-all"
              >
                Send reset link
                <ArrowRightIcon size={16} />
              </button>
            </form>
          </div>

          <a href="/auth/login" className="flex items-center gap-2 text-green-500">
            <ArrowLeftIcon size={16} /> Return to Login
          </a>
        </div>
      )}
      </div>

      <AuthFooter />
    </main>
  );
}
