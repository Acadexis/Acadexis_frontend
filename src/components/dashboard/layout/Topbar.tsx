"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, HelpCircle, X } from "lucide-react";
import Link from "next/link";

// ─── Props ────────────────────────────────────────────────────────────────────
interface TopBarProps {
  userName?: string;
  userInitials?: string;
  avatarColor?: string;
  notificationCount?: number;
  onSearch?: (query: string) => void;
}

export default function TopBar({
  userName = "Student",
  userInitials = "S",
  avatarColor = "bg-orange-400",
  notificationCount = 0,
  onSearch,
}: TopBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-6 py-8 bg-white border-b border-gray-100 gap-4">
      <div className="flex gap-24 items-center flex-1">
              {/* Brand */}
      <Link
        href="/dashboard/student"
        className="text-md font-bold text-[#0f173e] tracking-tight shrink-0 hover:text-green-600 transition-colors"
      >
        The Academic Curator
      </Link>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className={`flex items-center gap-2 flex-1 max-w-[400px] bg-gray-100 rounded-full p-3 transition-all duration-200 ${
          isFocused ? "ring-2 ring-green-400/50 bg-white shadow-sm" : ""
        }`}
      >
        <Search size={14} strokeWidth={2} className="text-gray-400 shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search study materials..."
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1 min-w-0"
          aria-label="Search study materials"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X size={13} strokeWidth={2} />
          </button>
        )}
      </form>

      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifsRef}>
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="relative p-2 text-gray-400 hover:text-[#0f173e] hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.8} />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50">
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Notifications
              </p>
              {notificationCount === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">
                  No new notifications
                </p>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-600 border-t border-gray-50">
                  You have {notificationCount} new notification
                  {notificationCount > 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help */}
        <Link
          href="/support"
          className="p-2 text-gray-400 hover:text-[#0f173e] hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Help"
        >
          <HelpCircle size={18} strokeWidth={1.8} />
        </Link>

        {/* Avatar */}
        <Link
          href="/dashboard/student/settings"
          className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity shrink-0`}
          aria-label={`${userName}'s profile`}
          title={userName}
        >
          {userInitials}
        </Link>
      </div>
    </header>
  );
}