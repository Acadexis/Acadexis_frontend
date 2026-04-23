# AGENT.md — Acadexis Contributor & AI Agent Guide

> This document is the source-of-truth playbook for **any AI coding agent** (Lovable, Cursor, Claude Code, Aider, Copilot Workspace, Devin, etc.) and any human contributor working on the **Acadexis** codebase.
>
> Read this **before** making changes. It encodes the architectural decisions, conventions, and guardrails that keep the project coherent.

---

## 1. Project Snapshot

**Acadexis** is a SaaS platform that bridges **University Lecturers**, **Students**, and **AI**. Lecturers upload curriculum PDFs/Docx; students get an AI Study Lab whose answers are grounded in those materials with citations.

| Layer | Tech |
|---|---|
| Frontend | **Nextjs + TypeScript 5** |
| Styling | **Tailwind CSS v4** (semantic HSL tokens), shadcn/ui |
| State | **Zustand** (`src/store/useAppStore.ts`) |
| Forms | **React Hook Form + Zod** |
| Animation | **Framer Motion** |
| Charts | **Recharts** |
| Data layer (current) | **Mock API** in `src/services/api.ts` mirroring Django models |
| Backend (target) | **Django 5 + DRF + PostgreSQL + pgvector + Celery + Channels** — see `BACKEND_GUIDE.md` |
| Routing | App Router |
| Testing |  |

**Roles:** `student` and `lecturer` — the entire dashboard is **role-based**. Sidebar, routes, and most pages branch on the active role from the Zustand store.

---

## 2. Repository Map

```
src/
├── App.tsx                       # Route table (role-aware redirects live here)
├── main.tsx
├── index.css                     # Design tokens (HSL CSS vars) — edit colors HERE
├── components/
│   ├── DashboardLayout.tsx       # Role-based sidebar + profile dropdown + topbar
│   ├── NavLink.tsx
│   └── ui/                       # shadcn primitives — DO NOT edit casually
├── hooks/
├── lib/
│   ├── constants.ts              # ALL UI strings live here (no hardcoded text in JSX)
│   └── utils.ts
├── pages/
│   ├── LandingPage.tsx
│   ├── AuthPage.tsx              # Multi-step cascading registration
│   ├── NotFound.tsx
│   └── dashboard/
│       ├── StudentOverview.tsx   # role: student → "Overview"
│       ├── MyCourses.tsx         # role: student → "My Library"
│       ├── StudyLab.tsx          # Session cards
│       ├── StudySession.tsx      # 3-col chat (questions | chat | references/PDF)
│       ├── CourseCatalog.tsx     # student → "Course Catalog"
│       ├── CourseDetail.tsx
│       ├── AggregatePage.tsx     # student → "Study Analytics"
│       ├── BookmarksPage.tsx     # student → "Bookmarks"
│       ├── LecturerOverview.tsx  # role: lecturer → "Dashboard"
│       ├── ManageCourses.tsx     # lecturer → "My Courses"
│       ├── CreateCourse.tsx
│       ├── KnowledgeHub.tsx      # lecturer → "Uploads"
│       ├── ManageStudentsPage.tsx
│       ├── StruggleHeatmap.tsx   # lecturer → "Analytics"
│       ├── ProfilePage.tsx
│       ├── SettingsPage.tsx
│       ├── NotificationsPage.tsx
│       ├── ContactPage.tsx
│       ├── ReportPage.tsx
│       └── AdminRequestPage.tsx  # Lecturer → admin elevation request
├── services/api.ts               # Mock data + async functions (Promise-based)
├── store/useAppStore.ts          # Zustand: user, role, notifications, etc.
└── test/
BACKEND_GUIDE.md                  # Django implementation blueprint
playwright.config.ts
vitest.config.ts
```

---

## 3. Non-Negotiable Rules

These rules are **enforced**. Violations should be rejected in code review.

### 3.1 Design System
- **Never** write raw color classes (`text-white`, `bg-black`, `text-gray-500`, hex codes).
- **Always** use semantic tokens defined in `src/index.css` and `tailwind.config.ts`: `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, etc.
- All colors **must** be HSL. Add new tokens to `index.css` first, then expose them in `tailwind.config.ts`.
- Aesthetic: **Stewardship** — teal/blue primary, whites, slate grays. Calm, academic, trustworthy.

### 3.2 UI Text Centralization
- **No hardcoded user-facing strings** in components.
- All copy lives in `src/lib/constants.ts` under the `UI_TEXT` object.
- Adding a new page? Add a new `UI_TEXT.<pageKey>` namespace first.

### 3.3 Loading & Empty States
- Every async action **must** show a skeleton/spinner.
- Every list **must** have an explicit empty state (icon + message + optional CTA).
- Use shadcn `Skeleton` for placeholders.

### 3.4 Role-Based Rendering
- Read role from `useAppStore`. Never duplicate role logic — centralize in `DashboardLayout` for navigation and in route guards in `App.tsx`.
- Sidebar items (authoritative):
  - **Student:** Overview, My Library, The Study Lab, Course Catalog, Study Analytics, Bookmarks
  - **Lecturer:** Dashboard, My Courses, Uploads, Manage Students, Analytics
- Profile actions (Settings, Notifications, Help & Support, Profile, Logout) belong in the **profile avatar dropdown**, not the sidebar.

### 3.5 Data Layer Contract
- `src/services/api.ts` is the **only** place that simulates network I/O.
- All exports are `async` and return Promises — components must `await` them.
- Interfaces in this file are the **source of truth** and **must mirror** the Django models in `BACKEND_GUIDE.md`. When you add a field on one side, update the other.
- When the real Django backend is wired in, only `src/services/api.ts` changes — components stay untouched.

### 3.6 File Hygiene
- Components stay **small and focused**. If a page exceeds ~250 lines, split into sub-components in a co-located folder.
- Never edit `src/components/ui/*` casually — those are shadcn primitives.
- Never store secrets in code. Use Lovable Cloud secrets / Django env vars.

### 3.7 Security
- **Roles are stored server-side** in a dedicated `user_roles` table (see `BACKEND_GUIDE.md`). Never gate on `localStorage` or client-only flags for real authorization.
- The frontend role flag drives **UX only**, never trust it for permissioning.

---

## 4. Architectural Patterns

### 4.1 Routing (`src/App.tsx`)
- Public routes: `/`, `/auth`
- Dashboard routes are nested under `/dashboard/*` and wrapped by `DashboardLayout`.
- Role-aware landing: after login, redirect to `/dashboard/overview` (student) or `/dashboard/dashboard` (lecturer).
- Dynamic routes use params (e.g. `study-lab/study-session/:sessionId`, `courses/:courseId`).

### 4.2 State (`src/store/useAppStore.ts`)
- Global: current user, role, auth status, notifications, theme.
- Local UI state stays in components (`useState`).
- Server-state caching is **not** in scope for the mock layer. When Django is live, introduce **TanStack Query** rather than expanding Zustand.

### 4.3 Forms
- React Hook Form + Zod schema **always**. Schema lives next to the form.
- Show field-level errors using shadcn `FormMessage`.
- Submit buttons disable while `isSubmitting`.

### 4.4 Animation
- Framer Motion for page-level transitions, panel slides (PDF viewer, side panels), and list item enter/exit.
- Prefer `AnimatePresence` for mount/unmount transitions.
- Keep durations 150–300ms; honor `prefers-reduced-motion`.

### 4.5 Charts
- Recharts only. Wrap in shadcn `ChartContainer` from `src/components/ui/chart.tsx`.
- Colors come from the design tokens (`hsl(var(--primary))` etc.), never hard-coded.

---

## 5. Feature-Specific Conventions

### 5.1 Study Lab (`StudyLab.tsx` + `StudySession.tsx`)
- Dashboard: card grid of past sessions with refined title, course, first 3 referenced docs, date, **confidence %** (color-coded).
- Session view: **3-column** layout — Question Blocks (left, scrollable; click scrolls chat to message), Chat (center, markdown-rendered), References (right).
- Clicking a PDF reference opens a **PDF viewer** that slides in via `AnimatePresence`, shrinking the chat column.
- After the **3rd user question**, trigger the feedback dialog (star rating + optional note). Track via a `useRef` counter.
- **Chat rendering**: AI replies **must** render markdown (use `react-markdown`). Always send the **full conversation history** to the AI endpoint for context.

### 5.2 Auth Flow (`AuthPage.tsx`)
- Multi-step registration with **cascading selects**: University → Faculty → Department → Level (student) or Title (lecturer).
- Each step validates before advancing. Use the api layer for cascading data.

### 5.3 Knowledge Hub / Uploads (Lecturer)
- Drag-and-drop area + file list with status (`processing`, `ready`, `failed`).
- Files trigger a Celery RAG ingestion pipeline on the backend (see `BACKEND_GUIDE.md` § Celery tasks).

### 5.4 Notifications
- Bell icon shows a **red radial dot + shake animation** when `unreadCount > 0`. Animation pauses on hover.

### 5.5 Bookmarks
- Saved AI answers and PDF snippets. Each item links back to its source session/material.

### 5.6 Admin Elevation Request (Lecturer)
- Specialized form with justification, requested permissions checklist, and supporting links.

---

## 6. Workflow Checklist for AI Agents

Follow this loop for **every** task:

1. **Understand scope.** Re-read the user's request. If broad/ambiguous, ask clarifying questions before coding.
2. **Read before writing.** Open every file you intend to modify. Never edit blind.
3. **Check the rules** in §3 of this document.
4. **Plan parallel work.** Batch independent file reads and edits in parallel tool calls.
5. **Mock-first.** Add/extend types and functions in `src/services/api.ts` before touching components.
6. **Centralize copy.** Add strings to `UI_TEXT` first.
7. **Implement.** Prefer `search-replace` over full rewrites. Keep components small.
8. **Verify.** Check console logs / network / build output. For visual artifacts, screenshot and inspect.
9. **Update memory.** If the user states a preference, constraint, or design decision, persist it to `mem://`.
10. **Summarize tersely.** Wrap your final summary in `<final-text>` tags. One short paragraph + bullet list of touched files.

### Anti-patterns (do **not** do)
- ❌ Adding a new color directly in a component (`className="bg-[#0ea5e9]"`).
- ❌ Hardcoding "Welcome back!" in JSX instead of `UI_TEXT.dashboard.welcome`.
- ❌ Building a parallel state store when Zustand already covers it.
- ❌ Touching `src/components/ui/*` to change app-level behavior.
- ❌ Re-introducing previously rejected ideas (check memory first).
- ❌ Storing roles or permissions client-side as the source of truth.
- ❌ Skipping loading skeletons.
- ❌ Sequential tool calls when parallel calls would work.

---

## 7. Backend Integration Contract

The Django backend (see `BACKEND_GUIDE.md`) is the **eventual** source of truth. Today the frontend talks to `src/services/api.ts`. The migration plan:

1. Replace mock function bodies with `fetch` calls to the Django endpoints documented in `BACKEND_GUIDE.md`.
2. Add JWT storage + refresh in an `apiClient` wrapper.
3. Introduce **TanStack Query** for caching/invalidation.
4. Stream Study Lab AI responses via SSE (`/api/studylab/sessions/<id>/stream/`).
5. Wire Channels WebSocket for real-time notifications.

**Field-name parity is mandatory.** When you change a TS interface in `src/services/api.ts`, also update the matching Django serializer field, and vice versa.

---

## 8. Testing

- **Unit / component:** Vitest. Co-locate tests as `Component.test.tsx` or under `src/test/`.
- **E2E:** Playwright. Config in `playwright.config.ts`, fixtures in `playwright-fixture.ts`.
- A change is not "done" until the relevant signal (build pass, test pass, screenshot review) is verified.

---

## 9. Memory & Long-Term Decisions

This project uses persistent memory at `mem://`. Core rules and feature memos already exist (see `.lovable/memory/index.md`). When the user:

- States a **preference** → save under `mem://preference/...`
- Rejects an idea → save under `mem://constraint/...` with the reason
- Defines visual decisions → `mem://design/...`
- Defines feature behavior → `mem://feature/...`

Always check existing memories before proposing something the user may have already vetoed.

---

## 10. Quick Reference

| Need | Where |
|---|---|
| Add a UI string | `src/lib/constants.ts` → `UI_TEXT` |
| Add a color | `src/index.css` (HSL var) → `tailwind.config.ts` |
| Add an API endpoint mock | `src/services/api.ts` |
| Add a route | `src/App.tsx` |
| Add a sidebar link | `src/components/DashboardLayout.tsx` (role-branched) |
| Change global state | `src/store/useAppStore.ts` |
| Read backend contract | `BACKEND_GUIDE.md` |
| Read project memory | `.lovable/memory/index.md` |

---

## 11. Tone & Communication (for chat-based agents)

- Reply in the language the **user** writes in.
- Keep prose under ~2 lines unless asked for depth.
- Discuss before implementing for broad requests; implement directly for narrow ones.
- After tool calls, end with a `<final-text>` summary. One short paragraph.
- Suggest publishing only after meaningful milestones.

---

_Last updated alongside the project's role-based sidebar refactor and `BACKEND_GUIDE.md` creation. Keep this file in sync whenever architectural conventions change._
