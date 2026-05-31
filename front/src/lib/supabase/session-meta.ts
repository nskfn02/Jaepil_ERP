"use client";

/** AUTH-3 세션 정책 메타 (idle 1시간 / absolute 8시간) — supabase 세션과 별개로 클라이언트 추적 */
const META_KEY = "jaepil-erp-session-meta-v1";

export const IDLE_MS = 60 * 60 * 1000;
export const ABSOLUTE_MS = 8 * 60 * 60 * 1000;

interface Meta {
  loginAt: number;
  lastActiveAt: number;
}

export function recordLogin() {
  const now = Date.now();
  write({ loginAt: now, lastActiveAt: now });
}

export function touch() {
  const m = read();
  if (m) write({ ...m, lastActiveAt: Date.now() });
}

export function clearMeta() {
  try {
    window.localStorage.removeItem(META_KEY);
  } catch {
    /* ignore */
  }
}

export function read(): Meta | null {
  try {
    const raw = window.localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as Meta) : null;
  } catch {
    return null;
  }
}

function write(m: Meta) {
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export type ExpiryReason = "idle" | "absolute";

/** 현재 메타 기준 만료 여부 판정 */
export function checkExpiry(): ExpiryReason | null {
  const m = read();
  if (!m) return null;
  const now = Date.now();
  if (now - m.loginAt > ABSOLUTE_MS) return "absolute";
  if (now - m.lastActiveAt > IDLE_MS) return "idle";
  return null;
}
