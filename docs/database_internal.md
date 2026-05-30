# 데이터베이스 설계서 — 내부 노트 (구현용)

> **대상**: 사내 ERP — 인증·인사 모듈 (MVP)
> **대상 DBMS**: PostgreSQL 17 (Supabase)
> **작성일**: 2026-05-30
> **참고**: 고객 제출용 명세는 database.md. 본 문서는 구현 산출물(트리거·인덱스·RLS·함수)을 정리한 내부 노트이며 고객 문서에 노출하지 않는다.

---

## 1. 트리거

| 트리거 | 대상 테이블 | 시점 | 동작 |
|--------|-----------|------|------|
| trg_set_updated_at | employees, common_codes | BEFORE UPDATE | updated_at = now() 자동 갱신 |
| trg_validate_employee_code_type | employees | BEFORE INSERT/UPDATE | department_code_id는 code_type=department, position_code_id는 code_type=position 코드인지 검증. 불일치 시 예외 |
| trg_guard_immutable | employees, common_codes | BEFORE UPDATE | employee_number(사번)·code(코드값) 변경 시도 차단 — 불변 강제 (HR-2, HR-6) |
| trg_guard_resign | employees | BEFORE UPDATE | employment_status가 resigned → active로 바뀌는 전이 차단 — 퇴사 비가역 (HR-7) |

> 단일 common_codes 테이블에서 부서/직급 FK의 유형 정합성은 일반 FK로 강제할 수 없어 trg_validate_employee_code_type로 보강한다. (대안: UNIQUE(id, code_type) + 생성 컬럼 기반 복합 FK)

---

## 2. 인덱스

| 테이블 | 인덱스 | 목적 |
|-------|--------|------|
| employees | (department_code_id) | 부서 필터 (HR-9) |
| employees | (employment_status) | 재직상태 필터 (HR-9) |
| employees | (name) 또는 pg_trgm GIN | 이름 검색 (HR-9, 부분일치 시 trgm) |
| employees | (role), (is_active) | 권한·활성 필터 (선택) |
| common_codes | (code_type, sort_order) | 유형별 정렬 목록 (HR-4) |

> employee_number, email은 UNIQUE 제약으로 인덱스가 자동 생성되어 사번/식별자 조회를 커버한다.

---

## 3. RLS 정책

| 테이블 | 동작 | 정책 |
|-------|------|------|
| employees | SELECT (본인) | id = auth.uid() — 본인 인사정보 조회 (HR-11, RBAC-2) |
| employees | ALL (관리자) | is_admin() = true — 전체 조회·관리 (HR-8/9/10, RBAC-1) |
| common_codes | SELECT | 로그인 사용자 전체 조회 (폼 선택 소스) |
| common_codes | INSERT/UPDATE/DELETE | is_admin() = true (HR-1~3) |

> 헬퍼 함수 is_admin() — SECURITY DEFINER로 employees에서 현재 사용자의 role을 조회한다 (employees RLS 자기참조 재귀 회피).

---

## 4. 함수

| 함수 | 시그니처 | 동작 |
|------|---------|------|
| generate_employee_number | (p_hire_year int) returns text | employee_number_seq에 ON CONFLICT 원자적 UPSERT로 다음 순번 발급 후 사번 포맷(연도-순번 4자리)으로 반환 (ACCT-2) |

---

## 5. 애플리케이션/Server Action 처리

DB 트리거·RLS로 강제하지 않고 서버 로직(서비스 롤)에서 처리하는 흐름.

| 처리 | 내용 |
|------|------|
| 사번 로그인 | 사번 → employees.email 조회 → 인증 서비스 signIn(email, pw). is_active=false면 인증 후 거부 (AUTH-1) |
| 계정 자동 생성 | auth.users 생성(서비스 롤) → 동일 id로 employees INSERT를 트랜잭션 처리, must_change_password=true (ACCT-1, HR-5) |
| 비밀번호 초기화 | 관리자 요청 시 인증 admin API로 임시 비밀번호 설정 + must_change_password=true (ACCT-7) |
| 계정 재활성화 | employment_status=active인 경우에만 is_active=true 허용 (ACCT-5) |
