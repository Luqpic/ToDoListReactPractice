# To-Do List React

A to-do list web app built with React, TypeScript, and Vite. Sign up, log in, or continue as a guest, then add, edit, complete, delete, search, filter, multi-select, and drag-to-reorder your tasks. Every account gets its own task list and profile (display name, bio, avatar), plus a live analytics dashboard showing completion progress.

**Live demo:** [to-do-list-react-practice-ruddy.vercel.app](https://to-do-list-react-practice-ruddy.vercel.app)

## Features

- Email/password signup and login (session persisted in `localStorage`, no backend)
- **Guest mode** — "Continue as Guest" skips authentication entirely. A guest's tasks live in `sessionStorage` instead of `localStorage`, so they survive a page refresh but are gone once the tab closes; guests can't set a display name/avatar and the Profile page is hidden and blocked
- Protected routes — the to-do list requires a session (real or guest); Profile requires a real account
- Tasks are scoped per user (each account, and each guest session, has its own saved list)
- Add, edit, complete/incomplete, and delete tasks via a per-task popover menu, or right-click a task to enter multi-select mode
- Multi-select mode: select individual tasks or all of them, then bulk-delete or drag the whole selection as a group
- Search tasks and filter by All / Active / Completed
- Drag-and-drop reordering via `@dnd-kit`, with a floating drag-overlay clone (grip + checkbox + text) that fades in/out so nothing appears to vanish mid-drag (available when viewing the unfiltered, unsearched list)
- Profile page (real accounts only): edit display name, short bio, and pick from a set of emoji avatars; change password; danger zone to reset all tasks or permanently delete the account
- Confirmation dialogs before destructive actions — deleting a task, bulk-deleting, resetting tasks, deleting an account, or logging out
- Toast notification with an Undo action when a task is created
- Animated page transitions between routes, plus animated list reordering, selection-toolbar slide-in, and container height changes
- Live analytics dashboard: a progress bar plus completed/total/remaining counts that update instantly as tasks change
- Tasks persist across page reloads using `localStorage` (or `sessionStorage` for guests)
- Styled with Tailwind CSS v4 and shadcn/ui components (built on `@base-ui/react`)

## Prerequisites

- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (required by Vite 8)
- npm (comes bundled with Node.js)

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the development server**

   ```bash
   npm run dev
   ```

   Vite will print a local URL (usually `http://localhost:5173`). Open it in your browser to use the app.

3. **Build for production**

   ```bash
   npm run build
   ```

   The optimized static files are output to the `dist/` folder.

4. **Preview the production build locally**

   ```bash
   npm run preview
   ```

## Available Scripts

| Command           | Description                              |
|--------------------|-------------------------------------------|
| `npm run dev`      | Starts the Vite dev server with hot reload |
| `npm run build`    | Type-checks and builds the app for production |
| `npm run preview`  | Serves the production build locally       |
| `npm run lint`     | Runs ESLint over the project              |

## Tech Stack

- React 19 + TypeScript
- Vite (build tool / dev server)
- Tailwind CSS v4 + shadcn/ui (built on `@base-ui/react` primitives)
- react-router-dom v7 (routing)
- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop task reordering (single and multi-select group drags)
- Motion (`motion/react`) — page transitions, list add/remove animations, drag-overlay fade, and layout/height animations
- lucide-react / remixicon (icons)
- Deployed on Vercel

## How It Works

### Routing & authentication

`main.tsx` wraps the app in a `BrowserRouter`. `App.tsx` declares four routes: `/login`, `/signup`, `/` (the to-do list), and `/profile`. The whole app is wrapped in `AuthProvider` (`src/context/AuthContext.tsx`), which exposes `user`, `login`, `signup`, `continueAsGuest`, `logout`, and the profile/account actions via the `useAuth()` hook.

There's no real backend — `src/lib/auth.ts` simulates one using `localStorage`: signup hashes the password (SHA-256) and stores it in a `todo-users` list; login checks the hash and writes a `todo-session` entry; `getSession()` reads it back on page load so a session survives a refresh. Guest mode is a parallel, lighter-weight session: `continueAsGuest()` writes a fixed `{ id: "guest", isGuest: true }` user to `sessionStorage` instead, and real vs. guest sessions are kept mutually exclusive — starting one clears the other, so a stale login can't resurface underneath an active guest session (or vice versa) after a refresh.

`/` and `/profile` are wrapped in `ProtectedRoute` (`src/routes/ProtectedRoute.tsx`), which checks `useAuth().user` and redirects to `/login` if there's no session at all. `/profile` additionally passes `blockGuest`, redirecting a guest session back to `/` — guests have no account to manage. `AppShell` (`src/components/AppShell.tsx`) wraps both routes' content in the top nav bar (`src/components/NavMenubar.tsx`), which hides the Profile tab for guests and shows a "Log in" link in its place, since that's otherwise the only way for a guest to reach `/login` again.

### Task state and lifting state up

`TodoPage.tsx` is the single source of truth for the task list — it's the only place that holds the `task` state and the only place that calls `setTask`. Everything else is a child that either reads that state via props or asks the parent to change it via callback props:

- `TaskList` (`src/components/task.tsx`) renders one task, with a popover menu (edit/delete) and a checkbox to toggle completion, and calls `onDelete` / `onEdit` / `onToggle`, which `TodoPage` passes down already bound to its own `setTask` logic.
- `AnalyticsDashboard` (`src/components/AnalyticsDashboard.tsx`) receives the same `task` array as a `tasks` prop and derives `total`, `completed`, `remaining`, and a completion `percent` from it — it holds no state of its own.

Because the state lives in the common parent (`TodoPage`) instead of inside `TaskList`, a second, unrelated component (`AnalyticsDashboard`) can read the exact same data without any duplication, extra context, or prop drilling through unrelated components. Every mutation (`addtask`, `toggleComplete`, `editTask`, `deleteTask`, `bulkDelete`) calls `setTask` in `TodoPage`, which re-renders both children automatically — that's what makes the dashboard update live with no extra plumbing.

Tasks are persisted per session: a `useEffect` writes `task` under a key scoped to the user (`todo-tasks-${user.id}`) — to `localStorage` for a real account, or `sessionStorage` for a guest — so different accounts (and guest sessions) never see each other's tasks.

Right-clicking a task, or clicking it once already in that mode, enters **selection mode** (`selectionMode` / `selectedIds` state in `TodoPage`): tasks show a checkbox instead of their normal drag handle behavior, and a toolbar appears to select all, bulk-delete, or drag the whole selection as one group.

Deleting a task, bulk-deleting, and logging out all go through an `AlertDialog` confirmation step before actually mutating state. Adding a task also fires a toast (`src/components/ui/toast.tsx`, built on `@base-ui/react`'s `Toast` primitive) with an "Undo" action that removes the just-added task.

### Search, filtering, and drag-and-drop

`TodoPage` also owns `search` and `filter` state and derives `filteredTask` from `task` on every render. Reordering is only enabled when `filter === "All"` and the search box is empty (`canReorder`) — dragging a filtered/searched subset would make index-based reordering ambiguous against the full underlying list.

Reordering runs on **`@dnd-kit`**, with **Motion** (`motion/react`) handling everything else (list add/remove, height, page transitions):

- `DndContext` + `SortableContext` (in `TodoPage`) track the draggable set and drive `handleDragStart` / `handleDragEnd`, which commits the new order into `setTask` — including group reordering when a drag starts from a multi-selected task.
- Each `TaskList` row uses dnd-kit's `useSortable()` hook (`src/components/task.tsx`) for its live drag transform, and is wrapped in `AnimatePresence` so it animates in/out when added, deleted, or filtered out of view.
- A `DragOverlay` renders a floating clone of the dragged task (grip + checkbox + text, plus a count badge for a group drag) that follows the cursor, with a custom `dropAnimation` that fades it out as it eases into its final position — this is what keeps a drop from looking like the real row briefly disappears.
- `AnimatedHeight` (`src/components/AnimatedHeight.tsx`) measures its children with a `ResizeObserver` and animates the container's height, so the card smoothly resizes as the task list grows/shrinks.
- `PageTransition` (`src/components/PageTransition.tsx`), combined with `AnimatePresence` in `App.tsx`, cross-fades/slides between routes on navigation.

### Account management

`ProfilePage.tsx` (real accounts only — guests are redirected before they ever reach it) lets a user edit their display name, short bio, and avatar (picked from a fixed emoji set), all persisted via `updateProfile()`. A separate tab handles changing the password and two destructive "danger zone" actions — resetting all tasks or permanently deleting the account — each behind its own `AlertDialog` confirmation.

## Deployment

The app is deployed to Vercel as a static SPA build:

- **Live URL:** https://to-do-list-react-practice-ruddy.vercel.app
- `vercel.json` rewrites every path to `/index.html`, so client-side routes handled by `react-router-dom` (e.g. `/login`, `/signup`) don't 404 on a direct load or refresh.
- Build command is the default `npm run build` (`tsc -b && vite build`), output directory `dist/`.

## Project Structure

```
src/
  components/
    task.tsx                 # single task row (drag handle, popover edit/delete menu, toggle,
                              # selection checkbox)
    AnalyticsDashboard.tsx    # progress bar + completed/total/remaining summary
    AnimatedHeight.tsx        # animates a container's height as its content changes
    AppShell.tsx              # wraps protected pages with the top nav bar
    NavMenubar.tsx            # Task List / Profile tab switcher; guest "Log in" link
    PageTransition.tsx        # per-route enter/exit animation wrapper
    ui/                       # shadcn/ui primitives (button, card, input, select, checkbox,
                               # progress, popover, alert-dialog, toast, button-group, separator,
                               # tabs, avatar, badge, label, context-menu, ...)
  context/
    AuthContext.tsx           # session state (real or guest) + useAuth() hook
  lib/
    auth.ts                   # localStorage-backed signup/login/session logic, guest sessions
    validators.ts              # email/password validation
  pages/
    LoginPage.tsx / SignupPage.tsx
    TodoPage.tsx               # owns task/search/filter/selection state, the app's main screen
    ProfilePage.tsx            # display name/bio/avatar, change password, danger zone
  routes/
    ProtectedRoute.tsx         # redirects to /login when logged out; can also block guests
  App.tsx                      # route declarations, AnimatePresence-driven page transitions
  main.tsx                     # app entry point, BrowserRouter

vercel.json                    # SPA rewrite config for Vercel deployment
```
