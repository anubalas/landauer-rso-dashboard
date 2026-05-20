# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Type-check (tsc) then bundle
npm run preview   # Preview the production build
```

There are no lint or test scripts configured.

## Architecture

This is a **Vite + React 18 + TypeScript + Tailwind CSS** single-page application — the Landauer RSO (Radiation Safety Officer) dashboard for managing radiation safety tasks and compliance.

### Authentication

AWS Cognito (ap-south-1) is used directly from the browser via `amazon-cognito-identity-js`. The pool/client IDs are hardcoded in `src/auth/cognitoConfig.ts`. `AuthContext` wraps the whole app and exposes `user`, `session`, `signIn`, and `signOut`. `App.tsx` gates everything behind a login check: authenticated → `DashboardPage`, unauthenticated → `LoginPage`.

### Page/panel hierarchy

```
App
└── DashboardPage            # main layout; owns task state
    ├── Header
    ├── TaskListPanel        # left column; severity filter + task cards
    ├── CalendarSidebar      # right column; month calendar with task dots
    └── ActionCenterPanel    # full-screen overlay (z-50); opened from Header
        └── ComplianceEnginePage  # second overlay (z-60); opened from ActionCenterPanel
```

`DashboardPage` is the single source of truth for the task list. It holds `MOCK_TASKS` from `src/data/mockTasks.ts` plus `extraTasks` added by the Compliance Engine flow. Both arrays are merged into `allTasks` and passed down.

### Compliance Engine flow

1. User opens Action Center → clicks "Review Rules".
2. `ActionCenterPanel` calls `VITE_COMPLIANCE_API_URL` (AWS API Gateway endpoint defined in `.env`), parses the JSON as `ComplianceRule[]`.
3. On success, `ComplianceEnginePage` renders as a stacked overlay.
4. "Create Action Items" converts non-compliant rules into `Task` objects and calls `onAddTasks`, which adds them to `DashboardPage`'s `extraTasks` state.

### Key types (`src/types/index.ts`)

- `Task` — the core entity: `severity` (Critical/High/Medium/Low), `category`, `status` (Overdue/Due Today/Upcoming), ISO `dueDate`, `assignee`.
- `CalendarDay` — pre-computed view model used by calendar components.
- `ComplianceRule` — returned by the API; status is `COMPLIANT | NON_COMPLIANT | NEEDS_REVIEW`.

### Utilities

`src/utils/calendarUtils.ts` provides date helpers (`parseISODate`, `toISODateString`, `formatDisplayDate`) and `buildCalendarDays`, which builds a fixed 42-cell grid (6 rows × 7 cols) annotating each cell with task counts and critical flags.

### Styling

Pure Tailwind utility classes — no component library. The brand primary is `#1a2744` (dark navy). Pixel-exact font sizes (`text-[13px]`) and fixed heights (`h-[60px]`) are used throughout to match the design spec. The `index.css` sets `html, body, #root` to `h-full` so the flex layout fills the viewport.

### Environment

The only required env var is:

```
VITE_COMPLIANCE_API_URL=<AWS API Gateway URL>
```
