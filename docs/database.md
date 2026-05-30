# 데이터베이스 설계서 (Database Design)

> **대상**: 사내 ERP — 인증·인사 모듈
> **대상 DBMS**: PostgreSQL 17 (Supabase)
> **작성일**: 2026-05-30

본 문서는 시스템이 어떤 데이터를 어떤 테이블에 분리·보관하는지를 설명합니다. 테이블 간 관계도(ERD)는 별도 문서를 참조합니다.

---

## 데이터 저장 영역 (총 4개)

| # | 영역 | 항목 | 테이블명 | 보관 내용 |
|---|------|------|---------|---------|
| 1 | 사용자·조직 | 부서·직급 코드 | common_codes | 부서·직급 공통 코드 (코드값·명칭·유형) |
| 2 | 사용자·조직 | 임직원 | employees | 사번·이름·부서·직급·입사일·연락처·역할·재직상태 |
| 3 | 공통 | 사번 채번 | employee_number_seq | 입사연도별 사번 발급 순번 |
| 4 | 인증 | 로그인 자격증명 | auth.users | 로그인 이메일·암호화된 비밀번호·세션 (Supabase 인증 관리) |

---

## 데이터 보호 요약

| 항목 | 보호 방식 |
|------|---------|
| 로그인 비밀번호 | 단방향 암호화(bcrypt) — 평문 저장 안 함 |
| 통신 | HTTPS(TLS) 암호화 |
| 세션 | Supabase 인증 서비스가 발급·만료 관리 |

---

## 테이블 명세

> NULL 열의 N = 필수, Y = 선택. 키 열 표기: PK(기본키) / FK(외래키) / UQ(고유 제약).

### 1. common_codes — 부서·직급 공통 코드

부서와 직급을 하나의 코드 테이블에서 유형(code_type)으로 구분하여 관리한다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 코드 식별자 |
| code_type | text | N | UQ | 코드 유형 — department(부서) / position(직급) |
| code | text | N | UQ | 코드값 (관리자 지정). 등록 후 변경 불가 |
| name | text | N |  | 코드 명칭 (수정 가능) |
| sort_order | int | N |  | 목록 표시 순서 |
| created_at | timestamptz | N |  | 생성 시각 |
| updated_at | timestamptz | N |  | 최종 수정 시각 |

### 2. employees — 임직원

임직원의 인사 기본정보와 계정 상태(역할·활성·재직)를 보관한다. 로그인 계정과 1:1로 연결된다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK, FK → auth.users.id | 임직원 식별자. 로그인 계정과 동일 UUID |
| employee_number | text | N | UQ | 사번 (입사연도-순번, 예: 2026-0001). 등록 후 변경 불가 |
| email | text | N | UQ | 로그인 이메일 (사번 기반 자동 합성, auth.users.email과 동일) |
| name | text | N |  | 성명 |
| department_code_id | uuid | N | FK → common_codes.id | 부서 (공통 코드 참조) |
| position_code_id | uuid | N | FK → common_codes.id | 직급 (공통 코드 참조) |
| hire_date | date | N |  | 입사일 |
| phone | text | Y |  | 연락처 |
| role | text | N |  | 역할 — ADMIN(관리자) / USER(일반) |
| employment_status | text | N |  | 재직 상태 — active(재직) / resigned(퇴사). 퇴사는 되돌릴 수 없음 |
| is_active | boolean | N |  | 계정 사용 가능 여부 (로그인 허용/차단) |
| must_change_password | boolean | N |  | 다음 로그인 시 비밀번호 변경 필요 여부 (임시 비밀번호 발급 시 사용) |
| resigned_at | timestamptz | Y |  | 퇴사 처리 시각 (퇴사 상태일 때만 기록) |
| created_at | timestamptz | N |  | 등록 시각 |
| updated_at | timestamptz | N |  | 최종 수정 시각 |

**재직 상태와 계정 활성의 조합**

| 재직 상태 | 계정 활성 | 의미 | 재활성화 |
|----------|:--------:|------|:--------:|
| 재직 | 사용 | 정상 재직 | – |
| 재직 | 차단 | 관리자가 일시 비활성화 | 가능 |
| 퇴사 | 차단 | 퇴사 처리 | 불가 |

### 3. employee_number_seq — 사번 채번 카운터

직원 등록 시 입사연도별로 순번을 자동 발급하여 사번 중복을 방지한다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| year | smallint | N | PK | 입사연도 (예: 2026) |
| last_number | int | N |  | 해당 연도의 마지막 발급 순번 |

> 연도가 바뀌면 순번은 0001부터 다시 시작한다.

### 4. auth.users — 로그인 자격증명 (Supabase 인증 관리)

로그인 이메일과 암호화된 비밀번호, 세션은 Supabase 인증 서비스가 관리한다. 애플리케이션은 이 영역을 직접 수정하지 않고 인증 API를 통해 연동한다.

| 항목 | 내용 |
|------|------|
| 식별자 | employees.id와 동일한 값으로 1:1 연결 |
| 이메일 | 인증용 식별자 (사번 기반 자동 합성, employees.email과 동일) |
| 비밀번호 | 단방향 암호화(bcrypt)로 저장 — 평문 보관하지 않음 |
| 세션 | 로그인 세션 발급·만료를 인증 서비스가 처리 |

> **로그인 식별자 정책**: 사용자는 사번으로 로그인한다. 인증 서비스가 요구하는 이메일은 시스템이 사번 기반(사번@회사도메인)으로 자동 합성하여 저장하며, 로그인 시 사번 → 이메일 변환 후 인증에 위임한다.

---

## 무결성 제약

### CHECK 제약

| 테이블 | 컬럼 | 허용값 |
|-------|------|-------|
| common_codes | code_type | department, position |
| employees | role | ADMIN, USER |
| employees | employment_status | active, resigned |

### UNIQUE 제약

| 테이블 | 컬럼 조합 | 목적 |
|-------|---------|------|
| common_codes | (code_type, code) | 동일 유형 내 코드값 중복 방지 |
| employees | (employee_number) | 사번 시스템 전체 유일 |
| employees | (email) | 로그인 이메일 유일 |

### FK ON DELETE 정책

| FK | 정책 | 이유 |
|----|------|------|
| employees.department_code_id → common_codes | RESTRICT | 참조 직원이 있는 코드 삭제 차단 |
| employees.position_code_id → common_codes | RESTRICT | 참조 직원이 있는 코드 삭제 차단 |
| employees.id → auth.users | CASCADE | 인증 사용자 삭제 시 프로필 제거 (운영상 삭제 대신 비활성/퇴사 사용) |

### 상태 일관성

| 테이블 | 조건 |
|-------|------|
| employees | employment_status = resigned → is_active = false 이고 resigned_at 기록 / employment_status = active → resigned_at 비움 (퇴사는 비가역) |

---

## 초기 데이터 (시드)

시스템 최초 배포 시 아래 순서로 기초 데이터를 생성한다. employees의 부서·직급·입사일이 필수이므로 순서를 지켜야 한다.

| 순서 | 작업 |
|------|------|
| 1 | 기본 부서·직급 공통 코드 등록 (common_codes) |
| 2 | 관리자 인증 계정 생성 (auth.users) |
| 3 | 관리자 직원 레코드 생성 (employees) — 역할=ADMIN, 사번·부서·직급·입사일 부여 |
