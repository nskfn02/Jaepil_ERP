type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | Record<string, boolean | null | undefined>
  | ClassValue[];

/** Tailwind 클래스 병합 헬퍼 (의존성 없는 경량 clsx 대체) */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue) => {
    if (!v) return;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (typeof v === "object") {
      for (const [k, on] of Object.entries(v)) if (on) out.push(k);
    }
  };
  inputs.forEach(walk);
  return out.join(" ");
}

/** 입사연도 + 순번으로 사번 포맷 (예: 2026-0001) */
export function formatEmployeeNumber(year: number, seq: number): string {
  return `${year}-${String(seq).padStart(4, "0")}`;
}

/** 임시 비밀번호 생성 (영문 대소문자+숫자+기호 8자) */
export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const symbols = "!@#$%";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  out += symbols[Math.floor(Math.random() * symbols.length)];
  out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/** 사번 → 로그인 이메일 합성 */
export function emailFromEmployeeNumber(employeeNumber: string): string {
  return `${employeeNumber}@jaepil.co.kr`;
}

/** 한국어 휴대폰 형식 검증 (010-0000-0000) */
export function isValidPhone(phone: string): boolean {
  return /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g, ""));
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
