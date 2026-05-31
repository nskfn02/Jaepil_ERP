/**
 * 도메인 타입 — docs/database.md 스키마 기반
 */

export type Role = "ADMIN" | "USER";
export type EmploymentStatus = "active" | "resigned";
export type CodeType = "department" | "position";

/** common_codes — 부서·직급 공통 코드 */
export interface CommonCode {
  id: string;
  codeType: CodeType;
  code: string; // 등록 후 불변
  name: string; // 수정 가능
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** employees — 임직원 (auth.users와 1:1) */
export interface Employee {
  id: string;
  employeeNumber: string; // 사번 (예: 2026-0001), 불변
  email: string; // 사번 기반 자동 합성
  name: string;
  departmentCodeId: string;
  positionCodeId: string;
  hireDate: string; // YYYY-MM-DD
  phone: string | null;
  role: Role;
  employmentStatus: EmploymentStatus;
  isActive: boolean;
  mustChangePassword: boolean;
  resignedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 목록/상세 표시에 부서·직급 명칭을 합친 뷰 모델 */
export interface EmployeeView extends Employee {
  departmentName: string;
  positionName: string;
}

/** 현재 로그인 사용자 세션 */
export interface SessionUser {
  id: string;
  employeeNumber: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
  departmentName: string;
  positionName: string;
}

/** 직원 등록 입력 */
export interface EmployeeCreateInput {
  name: string;
  departmentCodeId: string;
  positionCodeId: string;
  hireDate: string;
  phone?: string;
  role: Role;
}

/** 직원 수정 입력 (사번 불변) */
export interface EmployeeUpdateInput {
  name: string;
  departmentCodeId: string;
  positionCodeId: string;
  hireDate: string;
  phone?: string;
}

export interface EmployeeFilter {
  keyword?: string; // 이름·사번
  departmentCodeId?: string;
  employmentStatus?: EmploymentStatus;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 계정 자동 생성/비밀번호 초기화 결과 */
export interface CredentialResult {
  employeeNumber: string;
  temporaryPassword: string;
}
