"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { SessionUser } from "@/lib/types";
import { authApi } from "@/lib/api";
import {
  checkExpiry,
  clearMeta,
  recordLogin,
  touch,
  type ExpiryReason,
} from "@/lib/supabase/session-meta";

export type { ExpiryReason } from "@/lib/supabase/session-meta";

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  expiredReason: ExpiryReason | null;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
  clearExpiry: () => void;
  updateUser: (patch: Partial<SessionUser>) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiredReason, setExpiredReason] = useState<ExpiryReason | null>(null);

  const expire = useCallback(async (reason: ExpiryReason) => {
    clearMeta();
    await authApi.logout();
    setUser(null);
    setExpiredReason(reason);
  }, []);

  // 초기 세션 복원 + 만료 검사 (외부 시스템 동기화)
  useEffect(() => {
    let active = true;
    (async () => {
      const reason = checkExpiry();
      if (reason) {
        await expire(reason);
        if (active) setLoading(false);
        return;
      }
      const restored = await authApi.currentUser();
      if (!active) return;
      if (restored) setUser(restored);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [expire]);

  // 활동 추적 (idle 타이머 갱신) + 주기 만료 검사 (AUTH-3)
  useEffect(() => {
    if (!user) return;
    const onActivity = () => touch();
    const events = ["click", "keydown", "scroll", "mousemove"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    const interval = window.setInterval(() => {
      const reason = checkExpiry();
      if (reason) void expire(reason);
    }, 30_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      window.clearInterval(interval);
    };
  }, [user, expire]);

  const signIn = useCallback((u: SessionUser) => {
    recordLogin();
    setUser(u);
    setExpiredReason(null);
  }, []);

  const signOut = useCallback(() => {
    clearMeta();
    void authApi.logout();
    setUser(null);
    setExpiredReason(null);
  }, []);

  const clearExpiry = useCallback(() => setExpiredReason(null), []);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, expiredReason, signIn, signOut, clearExpiry, updateUser }),
    [user, loading, expiredReason, signIn, signOut, clearExpiry, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
