"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_LOGOUT_EVENT,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
} from "@/services/api";
import { authService } from "@/services/auth.service";
import type { AuthUser, LoginPayload } from "@/types/auth";
import { useToast } from "@/providers/ToastProvider";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
  setSession: (token: string, user: AuthUser) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const setSession = useCallback((nextToken: string, nextUser: AuthUser) => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = window.localStorage.getItem(AUTH_TOKEN_KEY);

    if (!currentToken) {
      clearSession();
      return null;
    }

    try {
      const nextUser = await authService.me();
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
      setToken(currentToken);
      setUser(nextUser);
      return nextUser;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authService.login(payload);
      setSession(response.accessToken, response.user);
      return response.user;
    },
    [setSession],
  );

  const logout = useCallback(() => {
    clearSession();
    router.push("/login");
  }, [clearSession, router]);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = window.localStorage.getItem(AUTH_USER_KEY);

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        clearSession();
      }
    }

    if (storedToken) {
      void refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [clearSession, refreshUser]);

  useEffect(() => {
    const handleLogout = () => {
      clearSession();
      showToast("error", "Votre session a expire. Veuillez vous reconnecter.");
      router.push("/login");
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    };
  }, [clearSession, router, showToast]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "ADMIN",
      isLoading,
      login,
      logout,
      refreshUser,
      setSession,
    }),
    [isLoading, login, logout, refreshUser, setSession, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
