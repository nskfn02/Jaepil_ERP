import type { Role } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // Icon name
  roles: Role[]; // 접근 가능한 역할
}

/** 사이드바 네비게이션 — 역할별 노출 (RBAC-1) */
export const NAV_ITEMS: NavItem[] = [
  { label: "직원 관리", href: "/employees", icon: "users", roles: ["ADMIN"] },
  { label: "계정 관리", href: "/accounts", icon: "shield", roles: ["ADMIN"] },
  { label: "공통 코드", href: "/codes", icon: "settings", roles: ["ADMIN"] },
  { label: "내 인사정보", href: "/me", icon: "user", roles: ["ADMIN", "USER"] },
  { label: "비밀번호 변경", href: "/me/password", icon: "lock", roles: ["ADMIN", "USER"] },
];

export function navItemsFor(role: Role): NavItem[] {
  return NAV_ITEMS.filter((n) => n.roles.includes(role));
}

/** 경로별 접근 허용 역할 (라우트 가드, RBAC-1) */
const ROUTE_RULES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/employees", roles: ["ADMIN"] },
  { prefix: "/accounts", roles: ["ADMIN"] },
  { prefix: "/codes", roles: ["ADMIN"] },
  { prefix: "/me", roles: ["ADMIN", "USER"] },
];

/** 해당 경로에 역할이 접근 가능한지 (RBAC-1) */
export function canAccess(pathname: string, role: Role): boolean {
  const rule = ROUTE_RULES.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"));
  if (!rule) return true; // 규칙 없는 경로는 허용
  return rule.roles.includes(role);
}

/** 로그인 후 역할별 기본 랜딩 (관리자→직원목록, 일반→내 인사정보) */
export function landingFor(role: Role): string {
  return role === "ADMIN" ? "/employees" : "/me";
}
