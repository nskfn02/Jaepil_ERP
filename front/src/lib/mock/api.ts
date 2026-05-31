"use client";

import type {
  CommonCode,
  CodeType,
  CredentialResult,
  Employee,
  EmployeeCreateInput,
  EmployeeFilter,
  EmployeeUpdateInput,
  EmployeeView,
  Paginated,
  Role,
  SessionUser,
} from "@/lib/types";
import { emailFromEmployeeNumber, formatEmployeeNumber, generateTempPassword } from "@/lib/utils";
import { store } from "./store";

/** 네트워크 지연 시뮬레이션 (로딩 상태 확인용) */
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function nowISO() {
  return new Date().toISOString();
}

function toView(e: Employee, codes: CommonCode[]): EmployeeView {
  return {
    ...e,
    departmentName: codes.find((c) => c.id === e.departmentCodeId)?.name ?? "-",
    positionName: codes.find((c) => c.id === e.positionCodeId)?.name ?? "-",
  };
}

function toSession(e: Employee, codes: CommonCode[]): SessionUser {
  return {
    id: e.id,
    employeeNumber: e.employeeNumber,
    name: e.name,
    role: e.role,
    mustChangePassword: e.mustChangePassword,
    departmentName: codes.find((c) => c.id === e.departmentCodeId)?.name ?? "-",
    positionName: codes.find((c) => c.id === e.positionCodeId)?.name ?? "-",
  };
}

/* ───────────────────────── 인증 (AUTH) ───────────────────────── */

export const authApi = {
  /** FEAT-AUTH-01 로그인 — 사번/비밀번호, 비활성 거부 */
  async login(employeeNumber: string, password: string): Promise<SessionUser> {
    await delay();
    const db = store.get();
    const cred = db.credentials[employeeNumber];
    if (!cred || cred.password !== password) {
      throw new ApiError("INVALID_CREDENTIALS", "사번 또는 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.");
    }
    const emp = db.employees.find((e) => e.id === cred.employeeId);
    if (!emp) throw new ApiError("INVALID_CREDENTIALS", "사번 또는 비밀번호가 올바르지 않습니다.");
    if (!emp.isActive) {
      throw new ApiError("INACTIVE", "비활성화된 계정입니다. 관리자에게 문의하세요.");
    }
    return toSession(emp, db.commonCodes);
  },

  /** ACCT-06 본인 비밀번호 변경 (+ must_change_password 해제) */
  async changePassword(employeeId: string, currentPw: string, newPw: string): Promise<void> {
    await delay();
    const db = store.get();
    const emp = db.employees.find((e) => e.id === employeeId);
    if (!emp) throw new ApiError("NOT_FOUND", "사용자를 찾을 수 없습니다.");
    const cred = db.credentials[emp.employeeNumber];
    if (cred && cred.password !== currentPw) {
      throw new ApiError("WRONG_PASSWORD", "현재 비밀번호가 올바르지 않습니다.");
    }
    if (cred) cred.password = newPw;
    emp.mustChangePassword = false;
    emp.updatedAt = nowISO();
    store.save();
  },
};

/* ───────────────────── 공통 코드 (COMMON CODES) ───────────────────── */

export const codeApi = {
  /** HR-4 코드 목록 (유형별) */
  async list(codeType?: CodeType): Promise<CommonCode[]> {
    await delay(200);
    const db = store.get();
    return db.commonCodes
      .filter((c) => (codeType ? c.codeType === codeType : true))
      .sort((a, b) => (a.codeType === b.codeType ? a.sortOrder - b.sortOrder : a.codeType.localeCompare(b.codeType)));
  },

  /** HR-1 코드 등록 — 동일 유형 내 코드값 중복 차단 */
  async create(input: { codeType: CodeType; code: string; name: string }): Promise<CommonCode> {
    await delay();
    const db = store.get();
    const dup = db.commonCodes.some((c) => c.codeType === input.codeType && c.code === input.code);
    if (dup) throw new ApiError("DUPLICATE", "동일 유형에 이미 존재하는 코드값입니다.");
    const sameType = db.commonCodes.filter((c) => c.codeType === input.codeType);
    const maxOrder = sameType.reduce((m, c) => Math.max(m, c.sortOrder), 0);
    const code: CommonCode = {
      id: `code-${Date.now()}`,
      codeType: input.codeType,
      code: input.code,
      name: input.name,
      sortOrder: maxOrder + 1,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    db.commonCodes.push(code);
    store.save();
    return code;
  },

  /** HR-2 코드 수정 — 명칭만 (코드값 불변) */
  async update(id: string, name: string): Promise<CommonCode> {
    await delay();
    const db = store.get();
    const code = db.commonCodes.find((c) => c.id === id);
    if (!code) throw new ApiError("NOT_FOUND", "코드를 찾을 수 없습니다.");
    code.name = name;
    code.updatedAt = nowISO();
    store.save();
    return code;
  },

  /** HR-3 코드 삭제 — 참조 직원 있으면 차단 */
  async remove(id: string): Promise<void> {
    await delay();
    const db = store.get();
    const refCount = db.employees.filter((e) => e.departmentCodeId === id || e.positionCodeId === id).length;
    if (refCount > 0) {
      throw new ApiError("REFERENCED", `이 코드를 참조하는 직원이 ${refCount}명 있습니다. 해당 직원들의 부서/직급을 먼저 변경한 뒤 다시 시도하세요.`);
    }
    db.commonCodes = db.commonCodes.filter((c) => c.id !== id);
    store.save();
  },

  /** 코드 참조 직원 수 (UI 안내용) */
  async refCount(id: string): Promise<number> {
    const db = store.get();
    return db.employees.filter((e) => e.departmentCodeId === id || e.positionCodeId === id).length;
  },
};

/* ───────────────────────── 직원 (EMPLOYEES) ───────────────────────── */

export const employeeApi = {
  /** HR-8/9 목록 + 검색·필터 + 페이지네이션 */
  async list(filter: EmployeeFilter = {}): Promise<Paginated<EmployeeView>> {
    await delay();
    const db = store.get();
    const { keyword, departmentCodeId, employmentStatus, page = 1, pageSize = 6 } = filter;
    let rows = db.employees.filter((e) => e.role !== undefined);
    if (keyword?.trim()) {
      const k = keyword.trim().toLowerCase();
      rows = rows.filter((e) => e.name.toLowerCase().includes(k) || e.employeeNumber.includes(k));
    }
    if (departmentCodeId) rows = rows.filter((e) => e.departmentCodeId === departmentCodeId);
    if (employmentStatus) rows = rows.filter((e) => e.employmentStatus === employmentStatus);
    rows = rows.sort((a, b) => b.employeeNumber.localeCompare(a.employeeNumber));
    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize).map((e) => toView(e, db.commonCodes));
    return { items, total, page, pageSize };
  },

  /** HR-10 상세 */
  async get(id: string): Promise<EmployeeView> {
    await delay(200);
    const db = store.get();
    const emp = db.employees.find((e) => e.id === id);
    if (!emp) throw new ApiError("NOT_FOUND", "직원을 찾을 수 없습니다.");
    return toView(emp, db.commonCodes);
  },

  /** HR-5 + ACCT-01/02 등록 — 사번 자동 채번 + 계정 자동 생성(임시 비밀번호) */
  async create(input: EmployeeCreateInput): Promise<{ employee: EmployeeView; credential: CredentialResult }> {
    await delay();
    const db = store.get();
    const year = Number(input.hireDate.slice(0, 4));
    const seq = db.employees.filter((e) => e.employeeNumber.startsWith(`${year}-`)).length + 1;
    const employeeNumber = formatEmployeeNumber(year, seq);
    const tempPw = generateTempPassword();
    const emp: Employee = {
      id: `emp-${Date.now()}`,
      employeeNumber,
      email: emailFromEmployeeNumber(employeeNumber),
      name: input.name,
      departmentCodeId: input.departmentCodeId,
      positionCodeId: input.positionCodeId,
      hireDate: input.hireDate,
      phone: input.phone || null,
      role: input.role,
      employmentStatus: "active",
      isActive: true,
      mustChangePassword: true,
      resignedAt: null,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    db.employees.push(emp);
    db.credentials[employeeNumber] = { password: tempPw, employeeId: emp.id };
    store.save();
    return { employee: toView(emp, db.commonCodes), credential: { employeeNumber, temporaryPassword: tempPw } };
  },

  /** HR-6 수정 — 사번 불변 */
  async update(id: string, input: EmployeeUpdateInput): Promise<EmployeeView> {
    await delay();
    const db = store.get();
    const emp = db.employees.find((e) => e.id === id);
    if (!emp) throw new ApiError("NOT_FOUND", "직원을 찾을 수 없습니다.");
    Object.assign(emp, {
      name: input.name,
      departmentCodeId: input.departmentCodeId,
      positionCodeId: input.positionCodeId,
      hireDate: input.hireDate,
      phone: input.phone || null,
      updatedAt: nowISO(),
    });
    store.save();
    return toView(emp, db.commonCodes);
  },

  /** HR-7 퇴사 처리 — 비가역, 계정 비활성화 연동 */
  async resign(id: string): Promise<void> {
    await delay();
    const db = store.get();
    const emp = db.employees.find((e) => e.id === id);
    if (!emp) throw new ApiError("NOT_FOUND", "직원을 찾을 수 없습니다.");
    if (emp.employmentStatus === "resigned") throw new ApiError("ALREADY", "이미 퇴사 처리된 직원입니다.");
    emp.employmentStatus = "resigned";
    emp.isActive = false;
    emp.resignedAt = nowISO();
    emp.updatedAt = nowISO();
    store.save();
  },
};

/* ───────────────────── 계정 관리 (ACCOUNTS) ───────────────────── */

export const accountApi = {
  /** 계정 목록 (직원과 동일 소스, 관리용 뷰) */
  async list(page = 1, pageSize = 5): Promise<Paginated<EmployeeView>> {
    await delay();
    const db = store.get();
    const rows = db.employees.sort((a, b) => b.employeeNumber.localeCompare(a.employeeNumber));
    const total = rows.length;
    const start = (page - 1) * pageSize;
    return { items: rows.slice(start, start + pageSize).map((e) => toView(e, db.commonCodes)), total, page, pageSize };
  },

  /** ACCT-03 역할 변경 */
  async changeRole(id: string, role: Role): Promise<void> {
    await delay();
    const db = store.get();
    const emp = db.employees.find((e) => e.id === id);
    if (!emp) throw new ApiError("NOT_FOUND", "계정을 찾을 수 없습니다.");
    if (emp.role === "ADMIN" && role === "USER") {
      const adminCount = db.employees.filter((e) => e.role === "ADMIN" && e.isActive).length;
      if (adminCount <= 1) throw new ApiError("LAST_ADMIN", "마지막 관리자는 일반으로 변경할 수 없습니다.");
    }
    emp.role = role;
    emp.updatedAt = nowISO();
    store.save();
  },

  /** ACCT-04/05 활성/비활성 토글 — 퇴사 계정 재활성화 차단 */
  async setActive(id: string, active: boolean): Promise<void> {
    await delay();
    const db = store.get();
    const emp = db.employees.find((e) => e.id === id);
    if (!emp) throw new ApiError("NOT_FOUND", "계정을 찾을 수 없습니다.");
    if (active && emp.employmentStatus === "resigned") {
      throw new ApiError("RESIGNED", "퇴사 처리된 계정은 재활성화할 수 없습니다.");
    }
    emp.isActive = active;
    emp.updatedAt = nowISO();
    store.save();
  },

  /** ACCT-07 비밀번호 초기화 — 임시 비밀번호 발급 */
  async resetPassword(id: string): Promise<CredentialResult> {
    await delay();
    const db = store.get();
    const emp = db.employees.find((e) => e.id === id);
    if (!emp) throw new ApiError("NOT_FOUND", "계정을 찾을 수 없습니다.");
    const tempPw = generateTempPassword();
    db.credentials[emp.employeeNumber] = { password: tempPw, employeeId: emp.id };
    emp.mustChangePassword = true;
    emp.updatedAt = nowISO();
    store.save();
    return { employeeNumber: emp.employeeNumber, temporaryPassword: tempPw };
  },
};
