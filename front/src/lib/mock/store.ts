"use client";

import type { CommonCode, Employee } from "@/lib/types";
import { seedCommonCodes, seedCredentials, seedEmployees } from "./seed";

/**
 * 인메모리 mock 저장소 (브라우저 세션 동안 유지, localStorage 백업).
 * 추후 Supabase 클라이언트로 교체할 단일 지점.
 */
const STORAGE_KEY = "jaepil-erp-mock-v1";

interface DbShape {
  employees: Employee[];
  commonCodes: CommonCode[];
  credentials: Record<string, { password: string; employeeId: string }>;
}

function freshDb(): DbShape {
  return {
    employees: structuredClone(seedEmployees),
    commonCodes: structuredClone(seedCommonCodes),
    credentials: structuredClone(seedCredentials),
  };
}

let db: DbShape | null = null;

function load(): DbShape {
  if (db) return db;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        db = JSON.parse(raw) as DbShape;
        return db;
      }
    } catch {
      /* ignore */
    }
  }
  db = freshDb();
  persist();
  return db;
}

function persist() {
  if (typeof window !== "undefined" && db) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      /* ignore */
    }
  }
}

export const store = {
  get: () => load(),
  save: persist,
  reset: () => {
    db = freshDb();
    persist();
  },
};
