import { createContext, useContext, useState, type ReactNode } from "react";
import {
  getSession,
  login as loginRequest,
  signup as signupRequest,
  logout as logoutRequest,
  type User,
} from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSession());

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

  const logout = () => {
    logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
