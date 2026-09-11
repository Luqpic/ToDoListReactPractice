import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import AppShell from "@/components/AppShell";
import TodoPage from "./pages/TodoPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Background from "./assets/Background.svg";
import { Toaster } from "@/components/ui/toast";

function App() {
  // `location` is re-read on every navigation so it can key the <Routes>
  // below, which is what lets AnimatePresence detect a route change and
  // play an exit/enter transition instead of swapping instantly.
  const location = useLocation();

  return (
    // AuthProvider makes useAuth() (session state, login/signup/guest/logout)
    // available to every route, including the ones rendered inside it below.
    <AuthProvider>
      <div className="relative min-h-screen w-full">
        {/* Full-page background image, sits behind all routed content */}
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url(${Background})` }}
        />
        {/* mode="wait" holds the outgoing page's exit animation until it
            finishes before mounting the next page, so routes cross-fade
            instead of overlapping. */}
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* Public routes: reachable whether or not the user is logged in */}
            <Route
              path="/login"
              element={
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              }
            />
            <Route
              path="/signup"
              element={
                <PageTransition>
                  <SignupPage />
                </PageTransition>
              }
            />
            {/* Main to-do list: requires a session (real or guest), wrapped in
                AppShell so it gets the top nav bar. */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <PageTransition>
                      <TodoPage />
                    </PageTransition>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            {/* Account settings: requires a real session — `blockGuest` bounces
                guest sessions back to "/" since there's no account to manage. */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute blockGuest>
                  <AppShell>
                    <PageTransition>
                      <ProfilePage />
                    </PageTransition>
                  </AppShell>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
        <p className="watermark">Practicing React Project by Luqman Hayyan</p>
      </div>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
