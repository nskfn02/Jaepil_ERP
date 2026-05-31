"use client";

import type {
  CodeType,
  CommonCode,
  CredentialResult,
  EmployeeCreateInput,
  EmployeeFilter,
  EmployeeUpdateInput,
  EmployeeView,
  Paginated,
  Role,
  SessionUser,
} from "@/lib/types";
import { supabase, emailFromEmployeeNumber } from "@/lib/supabase/client";

/**
 * Supabase 백엔드 API. mock/api.ts와 동일한 인터페이스를 제공한다.
 * - 조회·수정·역할변경·활성토글·퇴사·코드 CRUD: RLS 하에서 클라이언트 직접 접근
 * - auth.users를 다루는 작업(계정생성·비번초기화·본인 비번변경): admin-ops Edge Function
 */

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/* ── DB row(snake) → 뷰모델(camel) 매핑 ───────────────────────────── */

interface EmployeeRow {
  id: string;
  employee_number: string;
  email: string;
  name: string;
  department_code_id: string;
  position_code_id: string;
  hire_date: string;
  phone: string | null;
  role: Role;
  employment_status: "active" | "resigned";
  is_active: boolean;
  must_change_password: boolean;
  resigned_at: string | null;
  created_at: string;
  updated_at: string;
  department?: { name: string } | null;
  position?: { name: string } | null;
}

const EMP_SELECT =
  "*, department:department_code_id(name), position:position_code_id(name)";

function toView(r: EmployeeRow): EmployeeView {
  return {
    id: r.id,
    employeeNumber: r.employee_number,
    email: r.email,
    name: r.name,
    departmentCodeId: r.department_code_id,
    positionCodeId: r.position_code_id,
    hireDate: r.hire_date,
    phone: r.phone,
    role: r.role,
    employmentStatus: r.employment_status,
    isActive: r.is_active,
    mustChangePassword: r.must_change_password,
    resignedAt: r.resigned_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    departmentName: r.department?.name ?? "-",
    positionName: r.position?.name ?? "-",
  };
}

interface CodeRow {
  id: string;
  code_type: CodeType;
  code: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function toCode(r: CodeRow): CommonCode {
  return {
    id: r.id,
    codeType: r.code_type,
    code: r.code,
    name: r.name,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** Edge Function 호출 헬퍼 (admin-ops) */
async function invokeAdmin<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-ops", { body });
  if (error) {
    // Edge Function이 4xx/5xx로 응답하면 메시지 추출 시도
    let msg = error.message;
    let code = "EDGE";
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const j = await ctx.json();
        msg = j.message ?? msg;
        code = j.error ?? code;
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(code, msg);
  }
  const d = data as { error?: string; message?: string } & T;
  if (d && d.error) throw new ApiError(d.error, d.message ?? "처리 중 오류가 발생했습니다.");
  return d as T;
}

/* ── 프로필 로드 (세션 → SessionUser) ─────────────────────────────── */

async function loadProfile(userId: string): Promise<SessionUser> {
  const { data, error } = await supabase
    .from("employees")
    .select(EMP_SELECT)
    .eq("id", userId)
    .single();
  if (error || !data) throw new ApiError("NO_PROFILE", "사용자 프로필을 찾을 수 없습니다.");
  const v = toView(data as EmployeeRow);
  return {
    id: v.id,
    employeeNumber: v.employeeNumber,
    name: v.name,
    role: v.role,
    mustChangePassword: v.mustChangePassword,
    departmentName: v.departmentName,
    positionName: v.positionName,
  };
}

/* ───────────────────────── 인증 ───────────────────────── */

export const authApi = {
  /** FEAT-AUTH-01 로그인 — 사번/비밀번호, 비활성 거부 */
  async login(employeeNumber: string, password: string): Promise<SessionUser> {
    const email = emailFromEmployeeNumber(employeeNumber.trim());
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      throw new ApiError("INVALID_CREDENTIALS", "사번 또는 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.");
    }
    // 프로필 + 활성 여부 확인
    let profile: SessionUser;
    try {
      profile = await loadProfile(data.user.id);
    } catch {
      await supabase.auth.signOut();
      throw new ApiError("NO_PROFILE", "사용자 프로필을 찾을 수 없습니다. 관리자에게 문의하세요.");
    }
    // 비활성 계정 거부
    const { data: activeRow } = await supabase
      .from("employees")
      .select("is_active")
      .eq("id", data.user.id)
      .single();
    if (activeRow && activeRow.is_active === false) {
      await supabase.auth.signOut();
      throw new ApiError("INACTIVE", "비활성화된 계정입니다. 관리자에게 문의하세요.");
    }
    return profile;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  /** 현재 세션 복원 → SessionUser (없으면 null) */
  async currentUser(): Promise<SessionUser | null> {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    try {
      return await loadProfile(data.session.user.id);
    } catch {
      return null;
    }
  },

  /** ACCT-06 본인 비밀번호 변경 (+ must_change 해제) — Edge Function */
  async changePassword(_employeeId: string, currentPassword: string, newPassword: string): Promise<void> {
    await invokeAdmin({ action: "changePassword", currentPassword, newPassword });
  },
};

/* ───────────────────── 공통 코드 ───────────────────── */

export const codeApi = {
  async list(codeType?: CodeType): Promise<CommonCode[]> {
    let q = supabase.from("common_codes").select("*");
    if (codeType) q = q.eq("code_type", codeType);
    const { data, error } = await q.order("code_type").order("sort_order");
    if (error) throw new ApiError("LIST", error.message);
    return (data as CodeRow[]).map(toCode);
  },

  async create(input: { codeType: CodeType; code: string; name: string }): Promise<CommonCode> {
    // 동일 유형 내 다음 정렬 순서
    const { data: existing } = await supabase
      .from("common_codes")
      .select("sort_order")
      .eq("code_type", input.codeType)
      .order("sort_order", { ascending: false })
      .limit(1);
    const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

    const { data, error } = await supabase
      .from("common_codes")
      .insert({ code_type: input.codeType, code: input.code, name: input.name, sort_order: nextOrder })
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") throw new ApiError("DUPLICATE", "동일 유형에 이미 존재하는 코드값입니다.");
      throw new ApiError("CREATE", error.message);
    }
    return toCode(data as CodeRow);
  },

  async update(id: string, name: string): Promise<CommonCode> {
    const { data, error } = await supabase
      .from("common_codes")
      .update({ name })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new ApiError("UPDATE", error.message);
    return toCode(data as CodeRow);
  },

  async remove(id: string): Promise<void> {
    const refs = await this.refCount(id);
    if (refs > 0) {
      throw new ApiError("REFERENCED", `이 코드를 참조하는 직원이 ${refs}명 있습니다. 해당 직원들의 부서/직급을 먼저 변경한 뒤 다시 시도하세요.`);
    }
    const { error } = await supabase.from("common_codes").delete().eq("id", id);
    if (error) {
      if (error.code === "23503") throw new ApiError("REFERENCED", "이 코드를 참조하는 직원이 있어 삭제할 수 없습니다.");
      throw new ApiError("DELETE", error.message);
    }
  },

  async refCount(id: string): Promise<number> {
    const { count } = await supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .or(`department_code_id.eq.${id},position_code_id.eq.${id}`);
    return count ?? 0;
  },
};

/* ───────────────────────── 직원 ───────────────────────── */

export const employeeApi = {
  async list(filter: EmployeeFilter = {}): Promise<Paginated<EmployeeView>> {
    const { keyword, departmentCodeId, employmentStatus, page = 1, pageSize = 6 } = filter;
    let q = supabase.from("employees").select(EMP_SELECT, { count: "exact" });

    if (keyword?.trim()) {
      const k = keyword.trim();
      q = q.or(`name.ilike.%${k}%,employee_number.ilike.%${k}%`);
    }
    if (departmentCodeId) q = q.eq("department_code_id", departmentCodeId);
    if (employmentStatus) q = q.eq("employment_status", employmentStatus);

    const from = (page - 1) * pageSize;
    q = q.order("employee_number", { ascending: false }).range(from, from + pageSize - 1);

    const { data, error, count } = await q;
    if (error) throw new ApiError("LIST", error.message);
    return { items: (data as EmployeeRow[]).map(toView), total: count ?? 0, page, pageSize };
  },

  async get(id: string): Promise<EmployeeView> {
    const { data, error } = await supabase.from("employees").select(EMP_SELECT).eq("id", id).single();
    if (error || !data) throw new ApiError("NOT_FOUND", "직원을 찾을 수 없습니다.");
    return toView(data as EmployeeRow);
  },

  /** HR-5 + ACCT-01/02 등록 — Edge Function (사번 채번 + 계정 자동 생성) */
  async create(input: EmployeeCreateInput): Promise<{ credential: CredentialResult }> {
    const res = await invokeAdmin<CredentialResult>({
      action: "createEmployee",
      name: input.name,
      departmentCodeId: input.departmentCodeId,
      positionCodeId: input.positionCodeId,
      hireDate: input.hireDate,
      phone: input.phone ?? "",
      role: input.role,
    });
    return { credential: res };
  },

  /** HR-6 수정 — 사번 불변 (RLS: 관리자) */
  async update(id: string, input: EmployeeUpdateInput): Promise<EmployeeView> {
    const { data, error } = await supabase
      .from("employees")
      .update({
        name: input.name,
        department_code_id: input.departmentCodeId,
        position_code_id: input.positionCodeId,
        hire_date: input.hireDate,
        phone: input.phone || null,
      })
      .eq("id", id)
      .select(EMP_SELECT)
      .single();
    if (error) throw new ApiError("UPDATE", error.message);
    return toView(data as EmployeeRow);
  },

  /** HR-7 퇴사 처리 — 비가역, 계정 비활성화 연동 */
  async resign(id: string): Promise<void> {
    const { error } = await supabase
      .from("employees")
      .update({ employment_status: "resigned", is_active: false, resigned_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new ApiError("RESIGN", error.message);
  },
};

/* ───────────────────── 계정 관리 ───────────────────── */

export const accountApi = {
  async list(page = 1, pageSize = 5): Promise<Paginated<EmployeeView>> {
    const from = (page - 1) * pageSize;
    const { data, error, count } = await supabase
      .from("employees")
      .select(EMP_SELECT, { count: "exact" })
      .order("employee_number", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw new ApiError("LIST", error.message);
    return { items: (data as EmployeeRow[]).map(toView), total: count ?? 0, page, pageSize };
  },

  /** ACCT-03 역할 변경 — 마지막 관리자 보호는 DB 트리거가 강제 */
  async changeRole(id: string, role: Role): Promise<void> {
    const { error } = await supabase.from("employees").update({ role }).eq("id", id);
    if (error) {
      if (error.message.includes("마지막")) throw new ApiError("LAST_ADMIN", "마지막 관리자는 일반으로 변경할 수 없습니다.");
      throw new ApiError("ROLE", error.message);
    }
  },

  /** ACCT-04/05 활성/비활성 — 퇴사 계정 재활성화는 CHECK/트리거가 차단 */
  async setActive(id: string, active: boolean): Promise<void> {
    if (active) {
      // 퇴사 계정 재활성화 사전 차단 (UX 메시지)
      const { data } = await supabase.from("employees").select("employment_status").eq("id", id).single();
      if (data?.employment_status === "resigned") {
        throw new ApiError("RESIGNED", "퇴사 처리된 계정은 재활성화할 수 없습니다.");
      }
    }
    const { error } = await supabase.from("employees").update({ is_active: active }).eq("id", id);
    if (error) {
      if (error.message.includes("퇴사")) throw new ApiError("RESIGNED", "퇴사 처리된 계정은 재활성화할 수 없습니다.");
      if (error.message.includes("마지막")) throw new ApiError("LAST_ADMIN", "마지막 활성 관리자는 비활성화할 수 없습니다.");
      throw new ApiError("ACTIVE", error.message);
    }
  },

  /** ACCT-07 비밀번호 초기화 — Edge Function */
  async resetPassword(id: string): Promise<CredentialResult> {
    return invokeAdmin<CredentialResult>({ action: "resetPassword", employeeId: id });
  },
};
