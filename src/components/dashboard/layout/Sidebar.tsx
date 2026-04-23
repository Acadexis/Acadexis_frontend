"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Library,
  Archive,
  ClipboardList,
  Settings,
  Sparkles,
  LogOut,
  HelpCircle,
} from "lucide-react";

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Courses", href: "/dashboard/student/courses", icon: BookOpen },
  { label: "Library", href: "/dashboard/student/library", icon: Library },
  { label: "Study Vault", href: "/dashboard/student/vault", icon: Archive },
  { label: "AI Tutor", href: "/dashboard/student/ai-tutor", icon: Sparkles },
  { label: "Quizzes", href: "/dashboard/student/quizzes", icon: ClipboardList },
  { label: "Settings", href: "/dashboard/student/settings", icon: Settings },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────
interface SidebarProps {
  userName?: string;
  userSubtitle?: string;
  onAITutorClick?: () => void;
}

export default function Sidebar({
  userName = "Athenaeum Portal",
  userSubtitle = "Undergraduate Studies",
  onAITutorClick,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-full flex flex-col w-[280px] bg-white py-6 px-4 shrink-0">
      {" "}
      {/* User identity */}
      <div className="mb-8 px-2">
        <p className="text-sm font-bold text-[#0f173e] leading-tight">
          {userName}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{userSubtitle}</p>
      </div>
      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard/student" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-all duration-150 group ${
                isActive
                  ? "text-green-600 bg-green-50"
                  : "text-gray-500 hover:text-[#0f173e] hover:bg-gray-50"
              }`}
            >
              <Icon
                size={17}
                strokeWidth={1.8}
                className={
                  isActive
                    ? "text-green-600 font-bold"
                    : "text-gray-400 group-hover:text-gray-600"
                }
              />
              {label}

                            {/* Active indicator bar */}
              <span
                className={`absolute right-0 w-[6px] h-full rounded-r-lg bg-green-500 transition-opacity duration-150 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </nav>
      {/* AI Tutor button */}
      <button
        onClick={onAITutorClick}
        className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 px-4 rounded-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-200 shadow-sm shadow-green-200"
      >
        <Sparkles size={15} strokeWidth={2} />
        AI Tutor
      </button>
      {/* Bottom links */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-0.5">
        <Link
          href="/support"
          className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <HelpCircle size={14} strokeWidth={1.8} />
          Support
        </Link>
        <button
          onClick={() => {
            // Clear tokens and redirect
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }}
          className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
        >
          <LogOut size={14} strokeWidth={1.8} />
          Logout
        </button>
      </div>
    </aside>
  );
}
