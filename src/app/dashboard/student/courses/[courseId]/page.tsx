

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Play,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";
import apiService, { Course, Module, Recommendation } from "@/services/apiService";

interface ModuleWithIcon extends Module {
  iconComponent?: React.ComponentType<any>;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  );
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [aiDismissed, setAiDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch course data
        const courseRes = await apiService.courses.getById(courseId);
        setCourse(courseRes.data);

        // Fetch modules for this course
        const modulesRes = await apiService.courses.getModules(courseId);
        setModules(modulesRes.data);

        // Fetch recommendations
        const recsRes = await apiService.courses.getRecommendations(courseId);
        if (recsRes.data.length > 0) {
          setRecommendation(recsRes.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch course data:", err);
        setError("Failed to load course data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="max-w-[1500px] mx-auto px-8 py-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-green-600" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-[1500px] mx-auto px-8 py-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-red-600 font-semibold">{error || "Course not found"}</p>
          <button
            onClick={() => router.back()}
            className="text-green-600 hover:text-green-700 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get featured and side modules
  const featuredModule = modules.find((m) => m.id === course.featuredModuleId);
  const sideModules = modules.filter((m) => m.id !== course.featuredModuleId);

  return (
    <div className="max-w-[1500px] mx-auto px-8 py-8 flex flex-col gap-8">
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium tracking-wide uppercase">
        <Link
          href="/dashboard/student/courses"
          className="hover:text-green-600 transition-colors"
        >
          Courses
        </Link>
        <ChevronRight size={13} strokeWidth={2.5} />
        <span className="text-gray-600">{course.title}</span>
      </nav>

      {/* ── Course Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <h1 className="text-4xl font-bold text-[#0f173e] tracking-tight leading-tight font-serif">
              {course.title}
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[480px]">
              {course.description}
            </p>
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-1.5 items-end shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-green-600 uppercase">
                Progress: {course.progress}%
              </span>
            </div>
            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-700"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Latest Modules ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0f173e] font-serif">
            Latest Modules
          </h2>
          <button
            onClick={() => setShowCurriculum((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
          >
            View curriculum
            <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        </div>

        {/* Curriculum drawer */}
        {showCurriculum && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {course.curriculum.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-5 py-3.5 border-b last:border-0 border-gray-50 transition-colors ${
                  item.active
                    ? "bg-green-50"
                    : item.locked
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50 cursor-pointer"
                }`}
              >
                <span className="w-5 h-5 shrink-0">
                  {item.done ? (
                    <CheckCircle2
                      size={18}
                      className="text-green-500"
                      strokeWidth={2}
                    />
                  ) : item.locked ? (
                    <Lock
                      size={16}
                      className="text-gray-400"
                      strokeWidth={1.8}
                    />
                  ) : (
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                        item.active
                          ? "border-green-500 text-green-600"
                          : "border-gray-300 text-gray-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                  )}
                </span>
                <span
                  className={`text-sm flex-1 font-medium ${
                    item.active ? "text-green-700" : "text-gray-700"
                  }`}
                >
                  {item.title}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={11} strokeWidth={2} />
                  {item.duration}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Main two-col grid */}
        <div className="grid grid-cols-[1fr_260px] gap-4">
          {/* ── Featured hero module ────────────────────────────────────── */}
          {featuredModule && (
            <div className="relative rounded-2xl overflow-hidden bg-[#0f173e] min-h-[300px] flex flex-col justify-end p-7 group">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a2456] via-[#0f173e] to-[#071028]" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-8 left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

              {/* Content */}
              <div className="relative z-10 flex flex-col gap-4">
                {featuredModule.tag && (
                  <span className="self-start text-[10px] font-bold tracking-widest text-green-400 bg-green-400/15 border border-green-400/25 px-3 py-1 rounded-full uppercase">
                    {featuredModule.tag}
                  </span>
                )}
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold text-white leading-tight font-serif">
                    {featuredModule.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed max-w-[380px]">
                    {featuredModule.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <button className="flex items-center gap-2 bg-white text-[#0f173e] font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-green-50 active:scale-[0.97] transition-all duration-150">
                    <Play size={14} strokeWidth={2.5} fill="currentColor" />
                    Start Learning
                  </button>
                  {featuredModule.duration && (
                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                      <Clock size={13} strokeWidth={1.8} />
                      {featuredModule.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Side module cards ───────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {sideModules.length > 0 ? (
              sideModules.map((mod) => (
                <div
                  key={mod.id}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-green-600">
                    <BookOpen size={17} strokeWidth={1.8} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-[#0f173e]">
                      {mod.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    {mod.studyGroup ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          {/* Avatar stack */}
                          <div className="flex -space-x-1.5">
                            {["bg-orange-400", "bg-blue-400", "bg-purple-400"].map(
                              (c, i) => (
                                <span
                                  key={i}
                                  className={`w-5 h-5 rounded-full ${c} border-2 border-white`}
                                />
                              )
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">
                            +{mod.memberCount}
                          </span>
                        </div>
                        <button className="text-[11px] font-bold text-green-600 hover:text-green-700 uppercase tracking-wide transition-colors">
                          Join Study Group
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-gray-400">
                          {mod.completed} / {mod.total} Lessons
                        </span>
                        <button className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-400 flex items-center justify-center transition-colors border border-gray-100">
                          <ArrowRight size={14} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-5 border border-gray-100 text-center text-gray-500">
                No additional modules available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── AI Recommendation ─────────────────────────────────────────── */}
      {!aiDismissed && recommendation && (
        <section className="relative bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Left green accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400" />

          {/* Faint AI orb decoration */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-[6px] border-gray-100 flex items-center justify-center opacity-40">
            <div className="w-10 h-10 rounded-full border-[4px] border-gray-200 flex items-center justify-center">
              <Sparkles size={14} className="text-gray-300" />
            </div>
          </div>

          <div className="px-8 py-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={15} strokeWidth={2} className="text-green-500" />
                <h3 className="text-sm font-bold text-[#0f173e]">
                  Recommended for you
                </h3>
              </div>
              <button
                onClick={() => setAiDismissed(true)}
                className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
              >
                Dismiss
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed max-w-[520px]">
              {recommendation.body}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {recommendation.actions.map((action) => (
                <button
                  key={action.label}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150 active:scale-[0.97] ${
                    action.primary
                      ? "bg-[#0f173e] text-white hover:bg-[#1a2456]"
                      : action.accent
                      ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Continue Learning strip ────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0f173e] font-serif">
            More in this Course
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {course.curriculum.slice(2, 5).map((item) => {
            const statusMap: { [key: string]: { tag: string; color: string } } =
              {
                next: {
                  tag: "Next up",
                  color: "bg-blue-50 text-blue-600 border-blue-100",
                },
                coming: {
                  tag: "Coming up",
                  color: "bg-purple-50 text-purple-600 border-purple-100",
                },
                locked: {
                  tag: "Locked",
                  color: "bg-gray-50 text-gray-400 border-gray-100",
                },
              };

            const status = item.locked
              ? "locked"
              : !item.done && !item.active
              ? "coming"
              : "next";
            const { tag, color } = statusMap[status];

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col gap-3 hover:shadow-sm transition-shadow"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <BookOpen size={15} strokeWidth={1.8} className="text-gray-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className={`self-start text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full border ${color}`}
                  >
                    {tag}
                  </span>
                  <p className="text-sm font-semibold text-[#0f173e] leading-snug">
                    {item.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom spacer for floating AI button */}
      <div className="h-16" />
    </div>
  );
}