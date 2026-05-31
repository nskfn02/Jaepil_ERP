"use client";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** 브라우저용 Supabase 클라이언트 (세션은 localStorage에 자동 보관) */
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export const COMPANY_DOMAIN = process.env.NEXT_PUBLIC_COMPANY_DOMAIN ?? "jaepil.co.kr";

/** 사번 → 로그인 이메일 합성 (사번@회사도메인) */
export function emailFromEmployeeNumber(employeeNumber: string): string {
  return `${employeeNumber}@${COMPANY_DOMAIN}`;
}
