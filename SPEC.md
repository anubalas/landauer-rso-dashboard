# SPEC.md — Landauer RSO Task Dashboard

## 1. Overview

A single-page compliance task management dashboard for Radiation Safety Officers (RSOs).
Built with React 18, TypeScript, and Tailwind CSS. No backend; all data is mock.

---

## 2. Page Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/`  | `DashboardPage` | The only route — full task dashboard with sidebar calendar |

No routing library is strictly needed; a single `App.tsx` renders `DashboardPage`.

---

## 3. TypeScript Interfaces & Data Models

```ts
// ── Enums ────────────────────────────────────────────────────────────────────

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type TaskCategory =
  | 'Equipment'
  | 'Regulation'
  | 'Inventory'
  | 'Training'
  | 'Inspection'
  | 'Reporting';

export type TaskStatus = 'Overdue' | 'Due Today' | 'Upcoming';

// ── Core entities ─────────────────────────────────────────────────────────────

export interface Task {
  id: string;                  // uuid-style, e.g. "task-001"
  title: string;
  description?: string;        // optional one-liner shown on expanded card
  severity: Severity;
  category: TaskCategory;
  status: TaskStatus;
  dueDate: string;             // ISO 8601 date string "YYYY-MM-DD"
  assignee: Assignee;
}

export interface Assignee {
  id: string;
  name: string;
  initials: string;            // derived: "John Doe" → "JD", shown in avatar
}

// ── Calendar ──────────────────────────────────────────────────────────────────

export interface CalendarDay {
  date: string;                // "YYYY-MM-DD"
  dayNumber: number;           // 1–31
  isCurrentMonth: boolean;
  isToday: boolean;
  taskCount: number;           // total tasks due on this date
  hasCritical: boolean;        // true if any Critical task is due this date
}

// ── UI state (local, not persisted) ───────────────────────────────────────────

export interface DashboardState {
  selectedDate: string | null;          // calendar date the user clicked
  isActionCenterOpen: boolean;          // Action Center slide-over visible
  activeSeverityFilter: Severity | null; // null = show all
}
```

---

## 4. Components

### 4.1 `<App />`
**File:** `src/App.tsx`

| Prop | Type | Notes |
|------|------|-------|
| _(none)_ | — | Renders `<DashboardPage />` wrapped in any global providers |

- Holds no state; purely a shell.

---

### 4.2 `<DashboardPage />`
**File:** `src/pages/DashboardPage.tsx`

| Prop | Type | Notes |
|------|------|-------|
| _(none)_ | — | Owns all dashboard UI state |

**State:**
```ts
selectedDate: string | null          // from calendar click
isActionCenterOpen: boolean          // toggled by Action Center button
activeSeverityFilter: Severity | null
```

**Layout:** two-column flex/grid
- Left column (`flex-1`): `<TaskListPanel />`
- Right column (`w-72` fixed): `<CalendarSidebar />`

Renders `<ActionCenterPanel />` conditionally as an overlay.

---

### 4.3 `<Header />`
**File:** `src/components/Header.tsx`

| Prop | Type | Notes |
|------|------|-------|
| `onActionCenterClick` | `() => void` | Opens Action Center panel |
| `onLogout` | `() => void` | No-op in mock; shows console log |

**Visual structure (left → right):**
1. LANDAUER logo text (`font-bold text-navy-900 tracking-widest text-xl`)
2. Spacer
3. Gear icon button (`⚙` or Heroicon `Cog6ToothIcon`, `text-gray-500 hover:text-gray-700`)
4. **Action Center** button — navy background (`bg-[#1a2744]`), white text, bold
5. **Logout** button — orange background (`bg-orange-500`), white text

---

### 4.4 `<TaskListPanel />`
**File:** `src/components/TaskListPanel.tsx`

| Prop | Type | Notes |
|------|------|-------|
| `tasks` | `Task[]` | Full task list |
| `activeSeverityFilter` | `Severity \| null` | Filters displayed tasks |
| `onFilterChange` | `(s: Severity \| null) => void` | Updates parent state |

**Sub-structure:**
- `<SeveritySummaryBar />` — counts per severity, clickable pill filters
- Scrollable task list: maps filtered tasks to `<TaskCard />`

**Filter behaviour:**
- If `activeSeverityFilter` is set, only tasks with that severity are shown.
- Clicking the active filter again resets to `null` (show all).

---

### 4.5 `<SeveritySummaryBar />`
**File:** `src/components/SeveritySummaryBar.tsx`

| Prop | Type | Notes |
|------|------|-------|
| `tasks` | `Task[]` | Used to derive counts |
| `activeFilter` | `Severity \| null` | Highlights selected pill |
| `onFilterChange` | `(s: Severity \| null) => void` | |

Renders four pill buttons:

| Pill | Label | Active bg | Inactive bg |
|------|-------|-----------|-------------|
| Critical | `Critical (n)` | `bg-red-600 text-white` | `bg-red-100 text-red-700` |
| High | `High (n)` | `bg-yellow-500 text-white` | `bg-yellow-100 text-yellow-700` |
| Medium | `Medium (n)` | `bg-blue-500 text-white` | `bg-blue-100 text-blue-700` |
| Low | `Low (n)` | `bg-green-500 text-white` | `bg-green-100 text-green-700` |

---

### 4.6 `<TaskCard />`
**File:** `src/components/TaskCard.tsx`

| Prop | Type | Notes |
|------|------|-------|
| `task` | `Task` | The task to render |

**Visual structure:**
```
┌─[severity border]──────────────────────────────────────┐
│  <SeverityBadge />   Title text (font-semibold)        │
│  Category pill       Due: MM/DD/YYYY   Assignee avatar  │
│  Status tag (Overdue / Due Today / Upcoming)            │
└─────────────────────────────────────────────────────────┘
```

- Left border color = severity color (see §7 color rules).
- Card background: white (`bg-white`), rounded (`rounded-lg`), shadow (`shadow-sm`).
- Hover: `hover:shadow-md transition-shadow`.
- `Status` tag uses same color family as severity for Overdue/Critical overlap; otherwise muted gray.

---

### 4.7 `<SeverityBadge />`
**File:** `src/components/SeverityBadge.tsx`

| Prop | Type | Notes |
|------|------|-------|
| `severity` | `Severity` | |
| `size` | `'sm' \| 'md'` | `'md'` default |

Renders a colored pill/chip:

| Severity | bg | text |
|----------|----|------|
| Critical | `bg-red-100` | `text-red-700` |
| High | `bg-yellow-100` | `text-yellow-700` |
| Medium | `bg-blue-100` | `text-blue-700` |
| Low | `bg-green-100` | `text-green-700` |

---

### 4.8 `<AssigneeAvatar />`
**File:** `src/components/AssigneeAvatar.tsx`

| Prop | Type | Notes |
|------|------|-------|
| `assignee` | `Assignee` | |
| `size` | `'sm' \| 'md'` | `'sm'` default |

Renders a circular div with the assignee's initials.
Background color is deterministically chosen from a palette based on `assignee.id` (e.g. modulo 6 colors).

---

### 4.9 `<CalendarSidebar />`
**File:** `src/components/CalendarSidebar.tsx`

| Prop | Type | Notes |
|------|------|-------|
| `tasks` | `Task[]` | Used to compute dots |
| `selectedDate` | `string \| null` | Highlighted date |
| `onDateSelect` | `(date: string) => void` | |

**Sub-components rendered:**
1. `<CalendarHeader />` — month/year navigation
2. Day-of-week labels row (Su Mo Tu We Th Fr Sa)
3. Calendar grid of `<CalendarDayCell />` components
4. If `selectedDate` is set: `<SelectedDateTaskList />` below the grid

**Logic:**
- Builds a `CalendarDay[]` for the displayed month (including leading/trailing days from adjacent months to fill the grid).
- For each date, counts tasks with matching `dueDate`.

---

### 4.10 `<CalendarHeader />`
**File:** `src/components/CalendarHeader.tsx`

| Prop | Type | Notes |
|------|------|-------|
| `displayMonth` | `Date` | The month being shown |
| `onPrevMonth` | `() => void` | |
| `onNextMonth` | `() => void` | |

Renders `"May 2026"` style label with `<` and `>` chevron buttons.

---

### 4.11 `<CalendarDayCell />`
**File:** `src/components/CalendarDayCell.tsx`

| Prop | Type | Notes |
|------|------|-------|
| `day` | `CalendarDay` | |
| `isSelected` | `boolean` | |
| `onClick` | `() => void` | |

**States:**

| State | Style |
|-------|-------|
| Today | `bg-[#1a2744] text-white rounded-full` |
| Selected (not today) | `bg-orange-500 text-white rounded-full` |
| Out-of-month | `text-gray-300` |
| Has tasks (dot) | Small dot below day number; red if `hasCritical`, else `bg-gray-400` |
| Hover | `hover:bg-gray-100 rounded-full cursor-pointer` |

---

### 4.12 `<SelectedDateTaskList />`
**File:** `src/components/SelectedDateTaskList.tsx`

| Prop | Type | Notes |
|------|------|-------|
| `date` | `string` | The selected date |
| `tasks` | `Task[]` | Already filtered to that date by parent |

Renders heading `"Tasks for [Month DD, YYYY]"` then a compact list of `<TaskCard size="sm" />` or a plain `<p>No tasks due this day.</p>`.

---

### 4.13 `<ActionCenterPanel />`
**File:** `src/components/ActionCenterPanel.tsx`

| Prop | Type | Notes |
|------|------|-------|
| `isOpen` | `boolean` | Controls visibility |
| `criticalTasks` | `Task[]` | Pre-filtered `severity === 'Critical'` tasks |
| `onClose` | `() => void` | |

**Behaviour:**
- Renders as a slide-over panel from the right side of the screen.
- Backdrop overlay: `fixed inset-0 bg-black/30 z-40` (clicking closes the panel).
- Panel: `fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col`.
- Header: "Action Center" title + close `×` button.
- Body: scrollable list of Critical `<TaskCard />` components.
- If no critical tasks: `<p>No critical tasks at this time.</p>`.
- Enter/exit animation: `translate-x-full` → `translate-x-0` via Tailwind `transition-transform`.

---

## 5. File / Folder Structure

```
src/
├── App.tsx
├── main.tsx
├── index.css                   # Tailwind directives
├── data/
│   └── mockTasks.ts            # All mock data exported
├── types/
│   └── index.ts                # All interfaces / types
├── pages/
│   └── DashboardPage.tsx
├── components/
│   ├── Header.tsx
│   ├── TaskListPanel.tsx
│   ├── SeveritySummaryBar.tsx
│   ├── TaskCard.tsx
│   ├── SeverityBadge.tsx
│   ├── AssigneeAvatar.tsx
│   ├── CalendarSidebar.tsx
│   ├── CalendarHeader.tsx
│   ├── CalendarDayCell.tsx
│   ├── SelectedDateTaskList.tsx
│   └── ActionCenterPanel.tsx
└── utils/
    └── calendarUtils.ts        # buildCalendarDays(), formatDate(), etc.
```

---

## 6. Mock Data Structure

**File:** `src/data/mockTasks.ts`

```ts
import { Task } from '../types';

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-001',
    title: 'Annual Dosimeter Calibration — Building A',
    severity: 'Critical',
    category: 'Equipment',
    status: 'Overdue',
    dueDate: '2026-05-01',
    assignee: { id: 'u1', name: 'Maria Santos', initials: 'MS' },
  },
  {
    id: 'task-002',
    title: 'Submit NRC Form 4 — Q1 Report',
    severity: 'Critical',
    category: 'Regulation',
    status: 'Overdue',
    dueDate: '2026-05-03',
    assignee: { id: 'u2', name: 'David Kim', initials: 'DK' },
  },
  {
    id: 'task-003',
    title: 'Replace Expired TLD Badges — Radiology Wing',
    severity: 'High',
    category: 'Inventory',
    status: 'Overdue',
    dueDate: '2026-05-05',
    assignee: { id: 'u3', name: 'Linda Park', initials: 'LP' },
  },
  {
    id: 'task-004',
    title: 'Radiation Safety Training — New Hires Cohort 3',
    severity: 'High',
    category: 'Training',
    status: 'Overdue',
    dueDate: '2026-05-07',
    assignee: { id: 'u1', name: 'Maria Santos', initials: 'MS' },
  },
  {
    id: 'task-005',
    title: 'Quarterly Leak Test — Sealed Sources',
    severity: 'Critical',
    category: 'Inspection',
    status: 'Overdue',
    dueDate: '2026-05-08',
    assignee: { id: 'u4', name: 'James Okafor', initials: 'JO' },
  },
  {
    id: 'task-006',
    title: 'Update Emergency Response Procedures',
    severity: 'Medium',
    category: 'Regulation',
    status: 'Overdue',
    dueDate: '2026-05-10',
    assignee: { id: 'u2', name: 'David Kim', initials: 'DK' },
  },
  {
    id: 'task-007',
    title: 'Survey Meter Inventory Audit',
    severity: 'Medium',
    category: 'Equipment',
    status: 'Overdue',
    dueDate: '2026-05-12',
    assignee: { id: 'u5', name: 'Priya Nair', initials: 'PN' },
  },
  {
    id: 'task-008',
    title: 'Renew Radioactive Material License',
    severity: 'Critical',
    category: 'Regulation',
    status: 'Due Today',
    dueDate: '2026-05-15',
    assignee: { id: 'u4', name: 'James Okafor', initials: 'JO' },
  },
  {
    id: 'task-009',
    title: 'Monthly Radiation Area Survey — Oncology',
    severity: 'High',
    category: 'Inspection',
    status: 'Due Today',
    dueDate: '2026-05-15',
    assignee: { id: 'u3', name: 'Linda Park', initials: 'LP' },
  },
  {
    id: 'task-010',
    title: 'Review Waste Disposal Manifest',
    severity: 'Low',
    category: 'Inventory',
    status: 'Due Today',
    dueDate: '2026-05-15',
    assignee: { id: 'u5', name: 'Priya Nair', initials: 'PN' },
  },
  {
    id: 'task-011',
    title: 'Submit Annual Occupational Dose Report',
    severity: 'Critical',
    category: 'Reporting',
    status: 'Upcoming',
    dueDate: '2026-05-18',
    assignee: { id: 'u2', name: 'David Kim', initials: 'DK' },
  },
  {
    id: 'task-012',
    title: 'Bioassay — Iodine-125 Users',
    severity: 'High',
    category: 'Inspection',
    status: 'Upcoming',
    dueDate: '2026-05-20',
    assignee: { id: 'u1', name: 'Maria Santos', initials: 'MS' },
  },
  {
    id: 'task-013',
    title: 'Fume Hood Certification — Chemistry Lab',
    severity: 'Medium',
    category: 'Equipment',
    status: 'Upcoming',
    dueDate: '2026-05-22',
    assignee: { id: 'u4', name: 'James Okafor', initials: 'JO' },
  },
  {
    id: 'task-014',
    title: 'RSO Annual Self-Audit Submission',
    severity: 'High',
    category: 'Reporting',
    status: 'Upcoming',
    dueDate: '2026-05-25',
    assignee: { id: 'u5', name: 'Priya Nair', initials: 'PN' },
  },
  {
    id: 'task-015',
    title: 'TLD Badge Exchange — All Monitored Personnel',
    severity: 'Low',
    category: 'Inventory',
    status: 'Upcoming',
    dueDate: '2026-05-28',
    assignee: { id: 'u3', name: 'Linda Park', initials: 'LP' },
  },
];
```

---

## 7. UI Behaviour Rules

### 7.1 Severity Color System

| Severity | Left border | Badge bg | Badge text | Summary pill (active) |
|----------|-------------|----------|------------|-----------------------|
| Critical | `border-red-600` | `bg-red-100` | `text-red-700` | `bg-red-600 text-white` |
| High | `border-yellow-400` | `bg-yellow-100` | `text-yellow-700` | `bg-yellow-500 text-white` |
| Medium | `border-blue-400` | `bg-blue-100` | `text-blue-700` | `bg-blue-500 text-white` |
| Low | `border-green-500` | `bg-green-100` | `text-green-700` | `bg-green-500 text-white` |

### 7.2 Status Tag Colors

| Status | bg | text |
|--------|----|------|
| Overdue | `bg-red-50` | `text-red-600 font-semibold` |
| Due Today | `bg-orange-50` | `text-orange-600 font-semibold` |
| Upcoming | `bg-gray-100` | `text-gray-500` |

### 7.3 Brand Colors (Tailwind arbitrary values)

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#1a2744` | Header bg, Action Center button bg, today cell bg |
| Orange | `#f97316` (`orange-500`) | Logout button, selected calendar date |

### 7.4 Calendar Interaction

1. Clicking a date with tasks: sets `selectedDate`, shows `<SelectedDateTaskList />` below calendar.
2. Clicking the same date again: clears `selectedDate` (toggle).
3. Clicking a date with no tasks: still sets `selectedDate`; `<SelectedDateTaskList />` shows the "no tasks" empty state.
4. Navigating months (prev/next): clears `selectedDate`.
5. Calendar dots: one small dot per date that has ≥1 task. Dot is `bg-red-500` if any Critical task is due, else `bg-slate-400`.

### 7.5 Action Center Panel

1. Clicking **Action Center** button in header opens the slide-over.
2. Panel slides in from the right (`translate-x-full → translate-x-0`, 300ms ease).
3. Clicking the backdrop or `×` button closes the panel (reverse animation).
4. Panel shows only `severity === 'Critical'` tasks; uses the same `<TaskCard />`.
5. Panel header count badge shows number of critical tasks: `"Action Center (3)"`.

### 7.6 Severity Filter (Summary Bar)

1. Clicking a severity pill filters the task list to that severity only.
2. Clicking the active pill again resets to show all.
3. While a filter is active, the pill shows the active (filled) style; others dim.
4. Filter does NOT affect the calendar dots (calendar always reflects all tasks).

### 7.7 Task Card

- Cards are NOT expandable in v1 — no click/expand interaction on the card itself.
- Cards are rendered in the order they appear in `MOCK_TASKS` (no client-side sort needed in v1).
- `border-l-4` left accent in severity color.

### 7.8 Responsive

- Minimum supported width: 1024px (no mobile breakpoint required in v1).
- The right sidebar is fixed width `w-72`; the task list fills remaining space.

---

## 8. Utility Functions (`src/utils/calendarUtils.ts`)

```ts
// Returns CalendarDay[] for the grid of the given month
// (fills leading/trailing days from adjacent months to complete weeks)
buildCalendarDays(year: number, month: number, tasks: Task[]): CalendarDay[]

// "2026-05-15" → "May 15, 2026"
formatDisplayDate(isoDate: string): string

// "2026-05-15" → Date object at local midnight
parseISODate(isoDate: string): Date

// Date → "YYYY-MM-DD"
toISODateString(date: Date): string

// Returns tasks whose dueDate === date
getTasksForDate(tasks: Task[], date: string): Task[]
```

---

## 9. Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}
```

No third-party component libraries. No date libraries (native `Date` API is sufficient).
Heroicons (SVG inline) may be used for the gear/close/chevron icons — no npm package needed, just paste the SVG.

---

## 10. Out of Scope (v1)

- Backend / API calls
- Authentication / login flow
- Persistent state (localStorage, etc.)
- Task creation, editing, or deletion
- Sorting or advanced filtering beyond severity pills
- Mobile / responsive layout below 1024px
- Real-time updates or WebSocket integration
- Pagination (render all mock tasks in one scrollable list)

---

## 11. Visual Fidelity Rules

Everything in this section is derived directly from the screenshot.
A developer who has never seen the screenshot should be able to reproduce
the layout pixel-accurately from these rules alone.

---

### 11.1 Page Shell

| Token | Value |
|-------|-------|
| Page background | `#f3f4f6` (Tailwind `gray-100`) — warm light gray, NOT white |
| Page font family | System sans-serif stack: `ui-sans-serif, system-ui, -apple-system, sans-serif` (Inter-like) |
| Page font size base | `14px` |
| Page min-width | `1024px` |
| Overall layout | CSS grid: header full-width top row; below = two columns (`1fr` task list + `288px` sidebar) |
| Column gap | `16px` (`gap-4`) |
| Body padding | `16px` horizontal, `0` vertical (padding is on the inner panels, not the page) |

---

### 11.2 Header Bar

```
┌──────────────────────────────────────────────────────────────────────────┐
│ LANDAUER                                    ⚙   Action Center   Logout  │
└──────────────────────────────────────────────────────────────────────────┘
```

| Token | Value |
|-------|-------|
| Background | `#1a2744` — deep navy (not black; clear blue undertone) |
| Height | `48px` exactly |
| Horizontal padding | `24px` (`px-6`) left and right |
| Vertical alignment | `items-center` flex row |
| Logo text "LANDAUER" | `font-bold`, `tracking-widest`, `text-white`, `text-[17px]`, ALL CAPS |
| Logo margin-right | `auto` (pushes right-side controls to far right) |
| Right-side control gap | `12px` (`gap-3`) between the three right-side elements |

**Gear icon button:**
- Icon: `20×20px` outline cog SVG, `text-gray-300`
- No visible background, no border
- Hover: `text-white`
- Cursor: `pointer`

**Action Center button:**
- Background: `#f97316` (Tailwind `orange-500`) — same orange as the logo accent
- Text: `text-white font-semibold text-[13px]`
- Padding: `px-4 py-1.5`
- Border-radius: `6px` (`rounded-md`)
- No border
- Hover: `bg-orange-600`

**Logout button:**
- Background: `#1e3a5f` (a lighter navy than the header, ~20% lighter than `#1a2744`)
- Text: `text-white font-medium text-[13px]`
- Padding: `px-4 py-1.5`
- Border-radius: `6px`
- A `1px solid rgba(255,255,255,0.2)` border gives it separation from header bg
- Hover: `bg-[#243d6a]`

---

### 11.3 Severity Summary / Filter Bar

A full-width strip that sits immediately below the header, above the two-column content area.

| Token | Value |
|-------|-------|
| Background | `#ffffff` (white) |
| Height | `44px` |
| Horizontal padding | `24px` (matches header) |
| Bottom border | `1px solid #e5e7eb` (`border-gray-200`) |
| Top border | none |
| Layout | flex row, `items-center`, `gap-3` |
| Leading label | `"Tasks:"` in `text-gray-500 text-[12px] font-medium uppercase tracking-wide` |

**Each severity pill:**
- Shape: `rounded-full`
- Padding: `px-3 py-1`
- Font: `text-[12px] font-semibold`
- Border: `1px solid` (same hue as bg, ~30% darker)

| Severity | Inactive bg | Inactive text | Inactive border | Active bg | Active text |
|----------|-------------|---------------|-----------------|-----------|-------------|
| Critical | `#fee2e2` | `#b91c1c` | `#fca5a5` | `#dc2626` | `#ffffff` |
| High | `#fef9c3` | `#92400e` | `#fde68a` | `#d97706` | `#ffffff` |
| Medium | `#dbeafe` | `#1e40af` | `#93c5fd` | `#2563eb` | `#ffffff` |
| Low | `#dcfce7` | `#166534` | `#86efac` | `#16a34a` | `#ffffff` |

- Pill count number is wrapped in a slightly darker inline `<span>` with `font-bold`.
- Active pill has no border (border merges into bg).

---

### 11.4 Task List Column

| Token | Value |
|-------|-------|
| Top padding | `16px` |
| Bottom padding | `24px` |
| Right padding | `0` (gap comes from page column gap) |
| Gap between cards | `8px` (`gap-2`) — tight stacking |
| Scroll | `overflow-y: auto` with `max-height: calc(100vh - 92px)` (viewport minus header + filter bar) |

---

### 11.5 Task Card

```
┌─[4px border]──────────────────────────────────────────┐
│  Title text (semi-bold, ~14px)          [Severity pill]│
│  [Category chip]   Due: DD/MM/YYYY   [●  Assignee]     │
└────────────────────────────────────────────────────────┘
```

| Token | Value |
|-------|-------|
| Background | `#ffffff` |
| Border-radius | `8px` (`rounded-lg`) |
| Box shadow | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` (`shadow-sm`) |
| Padding | `12px 14px` (`py-3 px-3.5`) |
| Left border width | `4px solid` |
| Left border color | Severity color (see table below) |
| Border (remaining 3 sides) | `1px solid #e5e7eb` (`border border-gray-200`) |
| Hover shadow | `0 4px 6px rgba(0,0,0,0.07)` (`hover:shadow-md`) |
| Hover transition | `transition-shadow duration-150` |
| Min-height | `64px` |

**Left border colors by severity:**

| Severity | Border color |
|----------|-------------|
| Critical | `#dc2626` (`red-600`) |
| High | `#d97706` (`amber-600`) |
| Medium | `#2563eb` (`blue-600`) |
| Low | `#16a34a` (`green-600`) |

**Title row (top row of card):**

| Element | Style |
|---------|-------|
| Title text | `text-[13.5px] font-semibold text-gray-900 leading-tight` |
| Title max-width | `calc(100% - 88px)` (leaves room for severity badge) |
| Title overflow | `line-clamp-2` (max 2 lines, ellipsis) |
| Severity badge | floated right / `ml-auto`, `flex-shrink-0` |

**Severity badge on card:**

- Shape: `rounded-full`
- Padding: `px-2 py-0.5`
- Font: `text-[11px] font-semibold`
- Same color values as the filter pill inactive state (colored background, dark text):

| Severity | bg | text |
|----------|----|------|
| Critical | `#fee2e2` | `#b91c1c` |
| High | `#fef9c3` | `#92400e` |
| Medium | `#dbeafe` | `#1e40af` |
| Low | `#dcfce7` | `#166534` |

**Meta row (bottom row of card, ~6px below title row):**

| Element | Style |
|---------|-------|
| Category chip | `rounded-full bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 font-medium` |
| Due date | `text-[11px] text-gray-500 ml-2` — prefixed with `"Due: "` |
| Assignee avatar | `w-5 h-5` circle, `ml-auto flex-shrink-0` |
| Assignee name | `text-[11px] text-gray-500 ml-1` |
| Row layout | `flex items-center flex-wrap gap-x-1 gap-y-1` |

**Status tag — appears on Overdue / Due Today cards only:**

Rendered as a small inline text tag in the meta row, immediately after the due date:

| Status | text | font |
|--------|------|------|
| Overdue | `text-red-600` + `"Overdue"` | `text-[10px] font-bold uppercase` |
| Due Today | `text-orange-500` + `"Due Today"` | `text-[10px] font-bold uppercase` |
| Upcoming | _(no tag shown)_ | — |

---

### 11.6 Assignee Avatar

| Token | Value |
|-------|-------|
| Shape | `rounded-full` circle |
| Size (sm, used in card) | `20×20px` (`w-5 h-5`) |
| Size (md, used elsewhere) | `28×28px` (`w-7 h-7`) |
| Font | `text-[9px] font-bold text-white` (sm), `text-[11px] font-bold text-white` (md) |
| Letter spacing | `tracking-tight` |
| Background | Deterministic from `assignee.id % 6`: `['#6366f1','#0891b2','#059669','#d97706','#dc2626','#7c3aed']` |

---

### 11.7 Calendar Sidebar

```
┌──────────────────────────────┐
│  <  May 2026  >              │
│  Su Mo Tu We Th Fr Sa        │
│  [grid of 35–42 day cells]   │
│                              │
│  [Selected date task list]   │
└──────────────────────────────┘
```

| Token | Value |
|-------|-------|
| Container width | `288px` (`w-72`) fixed |
| Container background | `#ffffff` |
| Container border | `1px solid #e5e7eb` |
| Container border-radius | `10px` (`rounded-xl`) |
| Container padding | `14px` (`p-3.5`) |
| Top offset | `16px` (matches task list top padding) |
| Position | `sticky top-4` so it stays in view while tasks scroll |
| Box shadow | `0 1px 4px rgba(0,0,0,0.06)` |

**Calendar header (month nav row):**

| Token | Value |
|-------|-------|
| Layout | `flex items-center justify-between` |
| Month + Year label | `text-[14px] font-bold text-gray-800` — e.g. `"May 2026"` |
| Nav buttons `<` `>` | `w-6 h-6 rounded-full flex items-center justify-center` |
| Nav button icon | `<` and `>` chevron, `16px`, `text-gray-500` |
| Nav button hover | `bg-gray-100` |
| Bottom margin | `mb-2` |

**Day-of-week label row:**

| Token | Value |
|-------|-------|
| Labels | `Su Mo Tu We Th Fr Sa` — two-letter caps |
| Font | `text-[10px] font-medium text-gray-400 uppercase` |
| Layout | 7-column CSS grid, each cell `text-center` |
| Row margin-bottom | `4px` (`mb-1`) |

**Day cell grid:**

| Token | Value |
|-------|-------|
| Grid | `grid grid-cols-7` |
| Cell size | `32×32px` (`w-8 h-8`) |
| Cell layout | `flex items-center justify-center relative` |
| Cell cursor | `pointer` if `isCurrentMonth`, else `default` |

**Day number states:**

| State | Style |
|-------|-------|
| Normal (current month) | `text-[12px] text-gray-700` |
| Out-of-month | `text-[12px] text-gray-300` — no hover, no dot |
| Today (not selected) | `w-7 h-7 rounded-full bg-[#1a2744] text-white text-[12px] font-bold` |
| Selected (not today) | `w-7 h-7 rounded-full bg-orange-500 text-white text-[12px] font-bold` |
| Selected + Today | `w-7 h-7 rounded-full bg-orange-500 text-white text-[12px] font-bold` (orange overrides navy) |
| Hover (unselected, in-month) | `hover:bg-gray-100 rounded-full` |

**Task dot indicator (below day number):**

- Position: `absolute bottom-0.5 left-1/2 -translate-x-1/2`
- Size: `5×5px` (`w-1.5 h-1.5`) `rounded-full`
- Color: `bg-red-500` if `hasCritical === true`, else `bg-slate-400`
- Only shown when `taskCount > 0` AND `isCurrentMonth === true`
- One dot always, regardless of task count (count is not indicated by dot count)

---

### 11.8 Selected Date Task List (below calendar)

Rendered inside the calendar sidebar panel, below the grid, separated by:
- `mt-3 pt-3 border-t border-gray-200`

| Token | Value |
|-------|-------|
| Heading | `"Tasks — May 15"` style; `text-[12px] font-semibold text-gray-600 mb-2` |
| Empty state | `"No tasks due."` in `text-[12px] text-gray-400 italic` |
| Task items | Compact list: each item is a single-line flex row |
| Item layout | `flex items-center gap-2 py-1.5` |
| Item left dot | `w-2 h-2 rounded-full flex-shrink-0` in severity color |
| Item title | `text-[12px] text-gray-800 truncate` |
| Item separator | `border-b border-gray-100` on all but last item |

---

### 11.9 Action Center Panel

```
┌───────────────────────────────────────────────────────┐  ← right edge
│  Action Center (3)                              [×]   │
│  ─────────────────────────────────────────────────    │
│  [TaskCard — Critical only]                           │
│  [TaskCard — Critical only]                           │
│  …                                                    │
└───────────────────────────────────────────────────────┘
```

| Token | Value |
|-------|-------|
| Panel width | `384px` (`w-96`) |
| Panel background | `#ffffff` |
| Panel border-left | `1px solid #e5e7eb` |
| Panel box-shadow | `-4px 0 16px rgba(0,0,0,0.12)` |
| Backdrop | `fixed inset-0 bg-black/30 z-40` |
| Panel z-index | `z-50` |
| Slide animation | `transform translate-x-full → translate-x-0`, `transition-transform duration-300 ease-in-out` |
| Panel header height | `56px`, `flex items-center justify-between px-5` |
| Panel header bg | `#1a2744` (same navy as main header) |
| Panel title | `"Action Center"` + count badge; `text-white font-bold text-[15px]` |
| Count badge | `inline-flex bg-orange-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5 ml-2` |
| Close button `×` | `text-gray-300 hover:text-white text-[20px] leading-none cursor-pointer` |
| Panel body padding | `16px` |
| Panel body scroll | `overflow-y: auto` |
| Gap between task cards | `8px` |
| Task cards in panel | Full-width; same `<TaskCard>` component — no visual difference from main list |

---

### 11.10 Typography Scale Summary

| Use | Size | Weight | Color |
|-----|------|--------|-------|
| Header logo | `17px` | `700` | `#ffffff` |
| Section heading | `14px` | `700` | `#111827` |
| Task card title | `13.5px` | `600` | `#111827` |
| Badge / chip text | `11px` | `600` | (severity-specific) |
| Meta / label text | `11px` | `400` | `#6b7280` |
| Calendar month label | `14px` | `700` | `#1f2937` |
| Calendar day-of-week | `10px` | `500` | `#9ca3af` |
| Calendar date number | `12px` | `400` (normal) / `700` (today) | `#374151` |
| Status tag (Overdue) | `10px` | `700` | `#dc2626` |
| Status tag (Due Today) | `10px` | `700` | `#f97316` |

---

### 11.11 Spacing & Sizing Reference

| Context | Value |
|---------|-------|
| Header height | `48px` |
| Filter bar height | `44px` |
| Content top padding | `16px` below filter bar |
| Card left border | `4px` |
| Card border-radius | `8px` |
| Card internal padding | `12px 14px` |
| Card vertical gap | `8px` |
| Calendar container width | `288px` |
| Calendar cell size | `32×32px` |
| Calendar today circle | `28×28px` centered in cell |
| Calendar dot size | `5×5px` |
| Calendar padding | `14px` |
| Action Center panel width | `384px` |
