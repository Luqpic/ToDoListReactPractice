import { createContext, useContext, useState, type ReactNode } from "react";
import {
  getSession,
  getGuestSession,
  login as loginRequest,
  signup as signupRequest,
  logout as logoutRequest,
  continueAsGuest as continueAsGuestRequest,
  updateUserProfile as updateProfileRequest,
  changePassword as changePasswordRequest,
  deleteAccount as deleteAccountRequest,
  type User,
} from "@/lib/auth";

// Shape of what useAuth() exposes: the current session plus every action
// that can change it.
interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  continueAsGuest: () => User;
  logout: () => void;
  updateProfile: (
    updates: Partial<Pick<User, "name" | "bio" | "avatar">>,
  ) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Holds the current session (real user or guest) in React state and exposes
// every auth action through useAuth(), so components never touch
// src/lib/auth.ts (or localStorage/sessionStorage) directly.
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initial session: prefer a real logged-in user (localStorage), otherwise
  // fall back to a guest session (sessionStorage) if one is still active.
  const [user, setUser] = useState<User | null>(
    () => getSession() ?? getGuestSession(),
  );

  const login = async (email: string, password: string) => {
    const session = await loginRequest(email, password);
    setUser(session);
    return session;
  };

  const signup = async (email: string, password: string) => {
    const session = await signupRequest(email, password);
    setUser(session);
    return session;
  };

  // Starts a guest session (no signup/login, no persisted account).
  const continueAsGuest = () => {
    const guest = continueAsGuestRequest();
    setUser(guest);
    return guest;
  };

  // Clears whichever session is active (real or guest) and returns to
  // signed-out state.
  const logout = () => {
    logoutRequest();
    setUser(null);
  };

  // Profile edits (name/bio/avatar) only apply to real accounts — guests
  // never reach the screen that calls this (see ProtectedRoute's blockGuest).
  const updateProfile = async (
    updates: Partial<Pick<User, "name" | "bio" | "avatar">>,
  ) => {
    if (!user) throw new Error("No authenticated user");
    const updated = await updateProfileRequest(user.id, updates);
    setUser(updated);
    return updated;
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    if (!user) throw new Error("No authenticated user");
    await changePasswordRequest(user.id, currentPassword, newPassword);
  };

  const deleteAccount = () => {
    if (!user) return;
    deleteAccountRequest(user.id);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        continueAsGuest,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook for reading the session and calling auth actions from any component;
// throws if used outside <AuthProvider> so a missing provider fails loudly.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
