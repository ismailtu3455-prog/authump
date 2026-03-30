"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";

import { ApiError, apiRequest } from "@/lib/api";
import type { Plan, User } from "@/lib/types";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  updatePlan: (plan: Plan) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_STORAGE_KEY = "ump-share-token";

type AuthResponse = {
  token: string;
  user: User;
};

type UserResponse = {
  user: User;
};

function shouldClearSession(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSession = (nextToken: string | null, nextUser: User | null) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    startTransition(() => {
      setToken(nextToken);
      setUser(nextUser);
    });
  };

  const loadUser = async (sessionToken: string) => {
    try {
      const response = await apiRequest<UserResponse>("/api/user", {
        token: sessionToken,
      });

      startTransition(() => {
        setToken(sessionToken);
        setUser(response.user);
      });

      return response.user;
    } catch (error) {
      if (shouldClearSession(error)) {
        syncSession(null, null);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    let active = true;

    void (async () => {
      try {
        const response = await apiRequest<UserResponse>("/api/user", {
          token: storedToken,
        });

        if (!active) {
          return;
        }

        startTransition(() => {
          setToken(storedToken);
          setUser(response.user);
        });
      } catch (error) {
        if (active && shouldClearSession(error)) {
          syncSession(null, null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    syncSession(response.token, response.user);
  };

  const register = async (email: string, password: string) => {
    const response = await apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    syncSession(response.token, response.user);
  };

  const refreshUser = async () => {
    if (!token) {
      return null;
    }

    return loadUser(token);
  };

  const updatePlan = async (plan: Plan) => {
    if (!token) {
      throw new Error("Login required.");
    }

    const response = await apiRequest<UserResponse>("/api/user/plan", {
      method: "PATCH",
      body: JSON.stringify({ plan }),
      token,
    });

    startTransition(() => {
      setUser(response.user);
    });
  };

  const logout = () => {
    syncSession(null, null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        refreshUser,
        updatePlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
