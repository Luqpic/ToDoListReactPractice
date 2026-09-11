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

export function AuthProvider({ children }: { children: ReactNode }) {
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

  const continueAsGuest = () => {
    const guest = continueAsGuestRequest();
    setUser(guest);
    return guest;
  };

  const logout = () => {
    logoutRequest();
    setUser(null);
  };

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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
