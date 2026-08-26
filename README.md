# To-Do List React

A to-do list web app built with React, TypeScript, and Vite. Sign up or log in, then add, edit, complete, delete, search, filter, and drag-to-reorder your tasks. Every account gets its own task list, saved to the browser's local storage, plus a live analytics dashboard showing completion progress.

## Features

- Email/password signup and login (session persisted in `localStorage`, no backend)
- Protected routes — the to-do list is only reachable while logged in
- Tasks are scoped per user (each account has its own saved list)
- Add, edit, complete/incomplete, and delete tasks
- Search tasks and filter by All / Active / Completed
- Drag-and-drop reordering (available when viewing the unfiltered, unsearched list)
- Live analytics dashboard: a progress bar plus completed/total/remaining counts that update instantly as tasks change
- Tasks persist across page reloads using `localStorage`
- Styled with Tailwind CSS v4 and shadcn/ui components

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
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
- @dnd-kit (drag-and-drop task reordering)
- lucide-react / remixicon (icons)

## How It Works

### Routing & authentication

`main.tsx` wraps the app in a `BrowserRouter`. `App.tsx` declares three routes: `/login`, `/signup`, and `/` (the to-do list). The whole app is wrapped in `AuthProvider` (`src/context/AuthContext.tsx`), which exposes `user`, `login`, `signup`, and `logout` via the `useAuth()` hook.

There's no real backend — `src/lib/auth.ts` simulates one using `localStorage`: signup hashes the password (SHA-256) and stores it in a `todo-users` list; login checks the hash and writes a `todo-session` entry; `getSession()` reads it back on page load so a session survives a refresh.

`/` is wrapped in `ProtectedRoute` (`src/routes/ProtectedRoute.tsx`), which checks `useAuth().user` and redirects to `/login` if there's no session, otherwise renders `TodoPage`.

### Task state and lifting state up

`TodoPage.tsx` is the single source of truth for the task list — it's the only place that holds the `task` state and the only place that calls `setTask`. Everything else is a child that either reads that state via props or asks the parent to change it via callback props:

- `TaskList` (`src/components/task.tsx`) renders one task and calls `onDelete` / `onEdit` / `onToggle`, which `TodoPage` passes down already bound to its own `setTask` logic.
- `AnalyticsDashboard` (`src/components/AnalyticsDashboard.tsx`) receives the same `task` array as a `tasks` prop and derives `total`, `completed`, `remaining`, and a completion `percent` from it — it holds no state of its own.

Because the state lives in the common parent (`TodoPage`) instead of inside `TaskList`, a second, unrelated component (`AnalyticsDashboard`) can read the exact same data without any duplication, extra context, or prop drilling through unrelated components. Every mutation (`addtask`, `toggleComplete`, `editTask`, `deleteTask`) calls `setTask` in `TodoPage`, which re-renders both children automatically — that's what makes the dashboard update live with no extra plumbing.

Tasks are persisted per account: a `useEffect` writes `task` to `localStorage` under a key scoped to the logged-in user (`todo-tasks-${user.id}`), so different accounts never see each other's tasks.

### Search, filtering, and drag-and-drop

`TodoPage` also owns `search` and `filter` state and derives `filteredTask` from `task` on every render. Reordering (via `@dnd-kit`'s `DndContext`/`SortableContext`) is only enabled when `filter === "All"` and the search box is empty (`canReorder`) — dragging a filtered/searched subset would make index-based reordering ambiguous against the full underlying list.

## Project Structure

```
src/
  components/
    task.tsx                 # single task row (drag handle, edit/delete/toggle)
    AnalyticsDashboard.tsx    # progress bar + completed/total/remaining summary
    ui/                       # shadcn/ui primitives (button, card, input, select, checkbox, progress)
  context/
    AuthContext.tsx           # auth state + useAuth() hook
  lib/
    auth.ts                   # localStorage-backed signup/login/session logic
    validators.ts              # email/password validation
  pages/
    LoginPage.tsx / SignupPage.tsx
    TodoPage.tsx               # owns task/search/filter state, the app's main screen
  routes/
    ProtectedRoute.tsx         # redirects to /login when logged out
  App.tsx                      # route declarations
  main.tsx                     # app entry point, BrowserRouter
```
