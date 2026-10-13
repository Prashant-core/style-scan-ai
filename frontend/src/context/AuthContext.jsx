"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, tokenStore } from "@/utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the site opens, check if the visitor is already logged in
  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!tokenStore.access && !tokenStore.refresh) {
        if (active) setLoading(false);
        return;
      }
      try {
        const me = await api.get("/api/users/me");
        if (active) setUser(me);
      } catch (error) {
        // Only log the visitor out if the server says the session is not valid.
        // If the server is just offline, keep the tokens.
        if (error.status === 401) tokenStore.clear();
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (identifier, password) => {
    const data = await api.post("/api/auth/login", { identifier, password }, { auth: false });
    tokenStore.set(data.access_token, data.refresh_token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ fullName, username, email, password }) => {
    const data = await api.post(
      "/api/auth/register",
      { full_name: fullName, username, email, password },
      { auth: false },
    );
    tokenStore.set(data.access_token, data.refresh_token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const updateName = useCallback(async (fullName) => {
    const updated = await api.patch("/api/users/me", { full_name: fullName });
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateName }),
    [user, loading, login, register, logout, updateName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}