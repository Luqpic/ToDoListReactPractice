# Login/Authentication Flow — Design

Date: 2026-08-24

## Goal

Add a login/signup flow to the To-Do List app so tasks are gated behind
authentication and scoped per user, while teaching the core concepts
(state management, form handling/validation, session persistence,
protected routes) rather than reaching for an off-the-shelf auth
package. This is a learning project — the author wants to implement
unfamiliar patterns themselves rather than have code handed to them.

## Scope decisions

These were settled via clarifying questions before design:

- **No real backend.** Auth is fully mocked client-side. All "server"
  logic lives in one module (`lib/auth.ts`) so it can later be swapped
  for real `fetch` calls without touching the rest of the app.
- **Signup + Login**, not login-only. Users register themselves;
  there is no seeded/hardcoded account.
- **Per-user task lists.** Tasks are namespaced by user id, not shared
  globally as they are today.
- **Session persists across browser restarts** (stored in
  `localStorage`, not `sessionStorage`).
- **Routing via `react-router-dom`** (new dependency) — real URLs for
  `/login`, `/signup`, `/`, so "protected route" is a routing concept,
  not just an `if` in `App.tsx`.
- **Forms use plain `useState` + hand-written validators** — no
  react-hook-form/zod. Deliberate: the point is to feel what a form
  library normally hides before adopting one.
- **After login, always redirect to `/`** — no "return to original
  destination" logic. There's only one protected route today, so the
  `location.state` redirect-back pattern would be complexity with no
  visible payoff.
- **No test framework added.** Verification is manual (see Testing).

## New dependency

- `react-router-dom` — the only new package. Everything else (Context
  API, forms, password hashing via `crypto.subtle.digest`) uses what's
  already installed or built into the browser.

## File structure

New files:

- `src/lib/auth.ts` — the mock "backend": reads/writes users and the
  session in `localStorage`. Pure functions, no React.
- `src/context/AuthContext.tsx` — `AuthProvider` + `useAuth()` hook.
  Thin React adapter over `lib/auth.ts`.
- `src/routes/ProtectedRoute.tsx` — route guard.
- `src/pages/LoginPage.tsx`, `src/pages/SignupPage.tsx` — new forms.
- `src/pages/TodoPage.tsx` — the current `App.tsx` body moves here
  unchanged in behavior, just relocated and reading the current user's
  id from `useAuth()` for task scoping.

Changed:

- `src/App.tsx` — becomes router configuration (`/login`, `/signup`,
  `/`) wrapped in `AuthProvider`. No more task/list logic here.

## Data model (localStorage)

- `todo-users` — array of `{ id, email, passwordHash }`. Passwords are
  never stored in plaintext; hashed with `crypto.subtle.digest`
  (Web Crypto API, no package needed) as a baseline good habit, even
  though this is a toy project with no real security stakes.
- `todo-session` — `{ userId, email }` for whoever is currently logged
  in. Presence of this key means "logged in"; absence means "logged
  out."
- Task storage key changes from the fixed `"todo-tasks"` to
  `` `todo-tasks-${userId}` ``, scoping tasks to the logged-in user.

## Auth logic (`lib/auth.ts`)

Pure functions, easy to reason about in isolation and to later replace
with real API calls:

- `signup(email, password)` — hash the password, reject if the email
  already exists in `todo-users`, otherwise append the new user, write
  a session for them, and return the user.
- `login(email, password)` — hash the input password, find a user by
  email, compare hashes. On any mismatch (no such user, or wrong
  password) throw **one generic error** (`"Invalid email or
  password"`) — deliberately not distinguishing "wrong password" from
  "no such account," since revealing that distinction tells an
  attacker which part of their guess was right.
- `logout()` — clear `todo-session`.
- `getSession()` — read `todo-session` back out; used once when the
  app first loads to restore a session after a page refresh.

`todo-users` and `todo-session` reads are wrapped in try/catch: a
`JSON.parse` failure (e.g. hand-edited devtools storage) is treated as
"no users / no session" rather than crashing the app on load. This is
stricter than the existing task-loading code (which doesn't guard
`JSON.parse`), justified because "can't load the page at all" is a
worse failure mode for auth than "list is empty" is for tasks.

## State management (`AuthContext.tsx`)

- `AuthProvider` wraps the whole app (inside `App.tsx`, outside the
  router). Holds `user` state (`{ id, email } | null`), initialized by
  calling `getSession()` in `useState`'s initializer — this is what
  makes a refresh keep you logged in.
- Exposes `login`, `signup`, `logout`, each calling into `lib/auth.ts`
  and then updating `user` state on success (or letting the thrown
  error propagate to the caller for the form to display).
- `useAuth()` is `useContext(AuthContext)` with a guard that throws if
  called outside the provider, so a missing `<AuthProvider>` fails
  loudly at the call site instead of silently returning `undefined`.
- `AuthContext` contains **no auth logic itself** — it only adapts
  `lib/auth.ts`'s functions to React state. This separation is what
  would let a real backend replace `lib/auth.ts` later without
  touching `AuthContext` or any component that calls `useAuth()`.

## Routing & `ProtectedRoute`

Routes defined in `App.tsx`:

```
/login   → LoginPage
/signup  → SignupPage
/        → ProtectedRoute wraps TodoPage
```

`ProtectedRoute` reads `useAuth().user`. If `null`, it renders
`<Navigate to="/login" replace />` instead of its children. `replace`
swaps the current history entry rather than pushing a new one, so the
back button after being redirected to `/login` doesn't bounce back to
the protected page.

After a successful login, the app always navigates to `/` — no
capture-and-restore of the originally requested destination.

## Forms (`LoginPage`, `SignupPage`)

Each form manages its own fields via `useState` (`email`, `password`,
plus `confirmPassword` for signup). Validators (`isValidEmail`,
`isValidPassword`, etc.) are plain functions defined outside the
components, shared between the two forms, and testable independently
of any rendering.

Pattern:

- Field-level errors are computed on submit, then re-validated live
  after the first failed submit attempt (avoids nagging on first
  keystrokes while still giving fast feedback after a mistake).
- A single `formError` holds errors that can only be known by actually
  calling `login`/`signup` (invalid credentials, email already
  registered) — distinct from field-level validation errors, since
  these can't be determined client-side in advance.
- On submit: run validators, bail out on failure; otherwise call
  `login`/`signup` from `useAuth()`, catch a thrown error into
  `formError`. On success, `user` becomes non-null, and the router
  (via `ProtectedRoute` no longer redirecting away) carries the user
  to `/`.

Client-side validation here is purely a UX nicety (immediate feedback,
no round trip) — worth internalizing even against a mock backend,
since in a real app the server must always re-validate regardless of
what the client checked.

## Error handling summary

- Signup: empty fields / bad email format / short password / mismatched
  confirmation → field errors. Email already registered → `formError`.
- Login: empty fields / bad email format → field errors. No match →
  single generic `formError`.
- Corrupted `localStorage`: treated as empty state, not a crash (see
  Auth logic section).
- Logout: clears session; `ProtectedRoute` handles the resulting
  redirect automatically via re-render.

## Testing

No test framework exists in this project yet. Verification is a
manual pass once built:

1. Sign up a new user.
2. Refresh the page — still logged in.
3. Log out.
4. Navigate directly to `/` — redirected to `/login`.
5. Log back in — lands on `/`.
6. Sign up a second user — confirm their task list is empty/separate
   from the first user's.
