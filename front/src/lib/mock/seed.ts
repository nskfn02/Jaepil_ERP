import type { CommonCode, Employee } from "@/lib/types";

/**
 * Mock 시드 데이터 — Figma 화면의 예시 데이터와 일치.
 * 추후 Supabase 연동 시 이 레이어만 교체한다.
 */

export const seedCommonCodes: CommonCode[] = [
  // 부서
  { id: "dep-dev", codeType: "department", code: "DEV", name: "개발팀", sortOrder: 1, createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" },
  { id: "dep-design", codeType: "department", code: "DESIGN", name: "디자인팀", sortOrder: 2, createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" },
  { id: "dep-sales", codeType: "department", code: "SALES", name: "영업팀", sortOrder: 3, createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" },
  { id: "dep-mgmt", codeType: "department", code: "MGMT", name: "경영지원", sortOrder: 4, createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" },
  // 직급
  { id: "pos-staff", codeType: "position", code: "STAFF", name: "사원", sortOrder: 1, createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" },
  { id: "pos-junior", codeType: "position", code: "JUNIOR", name: "주임", sortOrder: 2, createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" },
  { id: "pos-asst", codeType: "position", code: "ASST", name: "대리", sortOrder: 3, createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" },
  { id: "pos-mgr", codeType: "position", code: "MGR", name: "과장", sortOrder: 4, createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" },
  { id: "pos-lead", codeType: "position", code: "LEAD", name: "팀장", sortOrder: 5, createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" },
];

const base = (over: Partial<Employee> & Pick<Employee, "id" | "employeeNumber" | "name" | "departmentCodeId" | "positionCodeId" | "hireDate">): Employee => ({
  email: `${over.employeeNumber}@jaepil.co.kr`,
  phone: "010-1234-5678",
  role: "USER",
  employmentStatus: "active",
  isActive: true,
  mustChangePassword: false,
  resignedAt: null,
  createdAt: "2026-01-02T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
  ...over,
});

const seedEmployeesCurated: Employee[] = [
  base({ id: "emp-admin", employeeNumber: "2025-0001", name: "관리자", departmentCodeId: "dep-mgmt", positionCodeId: "pos-lead", hireDate: "2025-01-02", role: "ADMIN", phone: "010-0000-0000" }),
  base({ id: "emp-1", employeeNumber: "2026-0001", name: "홍길동", departmentCodeId: "dep-dev", positionCodeId: "pos-staff", hireDate: "2026-03-02" }),
  base({ id: "emp-2", employeeNumber: "2026-0002", name: "김민수", departmentCodeId: "dep-design", positionCodeId: "pos-junior", hireDate: "2026-03-02" }),
  base({ id: "emp-3", employeeNumber: "2025-0012", name: "이서연", departmentCodeId: "dep-dev", positionCodeId: "pos-asst", hireDate: "2025-06-01" }),
  base({ id: "emp-4", employeeNumber: "2025-0007", name: "박지훈", departmentCodeId: "dep-mgmt", positionCodeId: "pos-mgr", hireDate: "2025-04-01" }),
  base({ id: "emp-5", employeeNumber: "2024-0003", name: "최유진", departmentCodeId: "dep-sales", positionCodeId: "pos-lead", hireDate: "2024-02-01", employmentStatus: "resigned", isActive: false, resignedAt: "2026-04-30T00:00:00Z" }),
  base({ id: "emp-6", employeeNumber: "2026-0004", name: "정우성", departmentCodeId: "dep-dev", positionCodeId: "pos-staff", hireDate: "2026-05-01" }),
];

/**
 * 무한 스크롤 시연용 추가 직원 — 목록이 20건을 넘어 "최초 20건 + 스크롤 시 다음 20건"
 * 동작을 확인할 수 있도록 mock 데이터를 채운다. (Supabase 연동 시에는 불필요)
 */
const fillerDepartments = ["dep-dev", "dep-design", "dep-sales", "dep-mgmt"];
const fillerPositions = ["pos-staff", "pos-junior", "pos-asst", "pos-mgr", "pos-lead"];
const fillerNames = [
  "강하늘", "윤서준", "임도현", "한지민", "오세훈", "신예은", "배수지", "권혁준",
  "황민재", "송하윤", "문지호", "조은서", "류성민", "남도윤", "서지우", "안준영",
  "유채원", "노태양", "하지원", "곽동훈", "성유빈", "진서윤", "차민재", "표예준",
  "백승호", "도하준", "변지아", "양시우", "구본혁", "선우진", "방예린", "위지안",
  "명재현", "탁우진", "견미래", "사공준", "옥상헌", "추다인",
];
const fillerEmployees: Employee[] = fillerNames.map((name, i) =>
  base({
    id: `emp-${i + 7}`,
    employeeNumber: `2026-${String(i + 5).padStart(4, "0")}`,
    name,
    departmentCodeId: fillerDepartments[i % fillerDepartments.length],
    positionCodeId: fillerPositions[i % fillerPositions.length],
    hireDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-05`,
  })
);

export const seedEmployees: Employee[] = [...seedEmployeesCurated, ...fillerEmployees];

/** 시연용 로그인 자격증명 (mock). 실제로는 Supabase Auth가 검증. */
export const seedCredentials: Record<string, { password: string; employeeId: string }> = {
  "2025-0001": { password: "admin123", employeeId: "emp-admin" },
  "2026-0001": { password: "user1234", employeeId: "emp-1" },
};
