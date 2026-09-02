import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import TodoPage from "./pages/TodoPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Background from "./assets/Background.svg";

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <div className="relative min-h-screen w-full">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url(${Background})` }}
        />
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
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
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <TodoPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
        <p className="watermark">Practicing React Project by Luqman Hayyan</p>
      </div>
    </AuthProvider>
  );
}

export default App;
