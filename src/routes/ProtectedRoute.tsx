import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Route guard: renders `children` only for a signed-in session (real or
// guest). Redirects to /login if there's no session at all, and — when
// `blockGuest` is set — redirects guests back to "/" for routes that need a
// real account (e.g. /profile).
function ProtectedRoute({
  children,
  blockGuest,
}: {
  children: ReactNode;
  blockGuest?: boolean;
}) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (blockGuest && user.isGuest) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default ProtectedRoute;
