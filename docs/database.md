# 데이터베이스 설계서 (Database Design)

> **대상**: 사내 ERP — 인증·인사·근태·휴가 모듈
> **대상 DBMS**: PostgreSQL 17 (Supabase)
> **작성일**: 2026-05-30
> **개정일**: 2026-06-03 (근태·결재·휴가·감사·알림 도메인 및 3단계 권한 반영)

본 문서는 시스템이 어떤 데이터를 어떤 테이블에 분리·보관하는지를 설명합니다. 테이블 간 관계도(ERD)는 별도 문서를 참조합니다. 모든 시각은 UTC(`timestamptz`)로 저장하되, 출퇴근·근태판정·만근·연차 적립·세션 만료 등 **모든 일(日) 경계 판정과 표시는 KST(Asia/Seoul) 기준**으로 변환한다.

---

## 데이터 저장 영역 (총 15개)

| # | 영역 | 항목 | 테이블명 | 보관 내용 |
|---|------|------|---------|---------|
| 1 | 사용자·조직 | 부서·직급 코드 | common_codes | 부서·직급 공통 코드 (코드값·명칭·유형) |
| 2 | 사용자·조직 | 임직원 | employees | 사번·이름·부서·직급·입사일·연락처·역할·재직상태 |
| 3 | 공통 | 사번 채번 | employee_number_seq | 입사연도별 사번 발급 순번 |
| 4 | 인증 | 로그인 자격증명 | auth.users | 로그인 이메일·암호화된 비밀번호·세션 (Supabase 인증 관리) |
| 5 | 근태 | 공휴일 | holidays | 회사 공휴일·휴무일 (소정근로일 산출 기준) |
| 6 | 근태 | 근태 기록 | attendances | 일자별 출퇴근 시각·근태상태·실근무시간·마감 |
| 7 | 결재 | 전자결재 | approval_requests | 공통 전자결재 — 요청유형·신청자·승인자·상태·결재결과 |
| 8 | 결재(근태) | 근태 보정 | attendance_corrections | 보정 대상 근태기록·보정값 (결재 서브타입) |
| 9 | 휴가 | 휴가 종류 | leave_types | 휴가 종류 코드·속성(차감·유급·증빙·한도·반차) |
| 10 | 결재(휴가) | 휴가 신청 | leave_requests | 종류·기간·반차·차감일수·증빙 (결재 서브타입) |
| 11 | 휴가 | 연차 적립·소멸 | leave_grants | 월/연 자동적립·수동조정·소멸 원장 (FIFO 소비) |
| 12 | 휴가 | 연차 잔액 | leave_balances | 직원별 현재 연차 잔액 요약 (역정규화) |
| 13 | 휴가 | 증빙 첨부 | attachments | 증빙 파일 메타데이터 (Supabase Storage 연계) |
| 14 | 인가 | 감사 로그 | audit_logs | 주요 변경 이력 (행위자·시각·대상·내용, append-only) |
| 15 | 결재 | 알림 | notifications | 결재 대기/승인/반려/재배정 알림 (미확인 표시) |

> 7~10은 공통 전자결재 구조다. `approval_requests`(슈퍼타입)에 결재 공통 워크플로를 두고, 근태 보정(`attendance_corrections`)과 휴가(`leave_requests`)가 동일 PK로 1:1 연결되는 서브타입이다.

---

## 데이터 보호 요약

| 항목 | 보호 방식 |
|------|---------|
| 로그인 비밀번호 | 단방향 암호화(bcrypt) — 평문 저장 안 함 |
| 통신 | HTTPS(TLS) 암호화 |
| 세션 | Supabase 인증 서비스가 발급·만료 관리 (idle 1시간 / absolute 8시간 정책은 클라이언트가 추적) |
| 권한 통제 | Row Level Security(RLS)로 역할(ADMIN/MANAGER/USER)·본인·부서 스코프를 DB 레벨에서 강제 |
| 증빙 파일 | private 버킷 저장, **신청자 본인과 지정 결재자만** 열람(전사 관리자 포함 그 외 차단), 퇴사 후 3년 보관 뒤 파기 |
| 감사 로그 | 역할변경·계정 활성토글·결재 승인/반려·연차 수동조정·근태 보정 등 주요 변경을 append-only로 보존 |

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
| hire_date | date | N |  | 입사일 (연차 적립 응당일 기준) |
| phone | text | Y |  | 연락처 |
| role | text | N |  | 역할 — ADMIN(전사 관리자) / MANAGER(부서 관리자) / USER(일반). 부서 관리자의 결재·조회 스코프는 본인 소속 부서(department_code_id)다 |
| employment_status | text | N |  | 재직 상태 — active(재직) / resigned(퇴사). 퇴사는 되돌릴 수 없음 |
| is_active | boolean | N |  | 계정 사용 가능 여부 (로그인 허용/차단) |
| must_change_password | boolean | N |  | 다음 로그인 시 비밀번호 변경 필요 여부 (임시 비밀번호 발급 시 사용) |
| resigned_at | timestamptz | Y |  | 퇴사 처리 시각 (퇴사 상태일 때만 기록) |
| created_at | timestamptz | N |  | 등록 시각 |
| updated_at | timestamptz | N |  | 최종 수정 시각 |

**역할 계층**: ADMIN(전사 관리) > MANAGER(부서 관리자, 같은 부서원 근태·휴가 조회 및 결재) > USER(본인 자원). MANAGER의 부서 스코프는 별도 매핑 없이 본인 `department_code_id`로 정의된다.

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

> 연도가 바뀌면 순번은 0001부터 다시 시작한다. `generate_employee_number()`가 upsert로 원자 채번한다.

### 4. auth.users — 로그인 자격증명 (Supabase 인증 관리)

로그인 이메일과 암호화된 비밀번호, 세션은 Supabase 인증 서비스가 관리한다. 애플리케이션은 이 영역을 직접 수정하지 않고 인증 API(또는 admin-ops Edge Function)를 통해 연동한다.

| 항목 | 내용 |
|------|------|
| 식별자 | employees.id와 동일한 값으로 1:1 연결 |
| 이메일 | 인증용 식별자 (사번 기반 자동 합성, employees.email과 동일) |
| 비밀번호 | 단방향 암호화(bcrypt)로 저장 — 평문 보관하지 않음 |
| 세션 | 로그인 세션 발급·만료를 인증 서비스가 처리 |

> **로그인 식별자 정책**: 사용자는 사번으로 로그인한다. 인증 서비스가 요구하는 이메일은 시스템이 사번 기반(사번@회사도메인)으로 자동 합성하여 저장하며, 로그인 시 사번 → 이메일 변환 후 인증에 위임한다.

### 5. holidays — 공휴일·휴무일

회사 공휴일·휴무일을 등록한다. 근태 자동판정(근무 의무 없는 날)과 만근 판정의 소정근로일 산출 기준 데이터다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 공휴일 식별자 |
| holiday_date | date | N | UQ | 공휴일·휴무일 날짜 (KST) |
| name | text | N |  | 명칭 (예: 설날, 광복절 대체공휴일) |
| is_substitute | boolean | N |  | 대체공휴일 여부 (기본 false) |
| created_at | timestamptz | N |  | 등록 시각 |

> 소정근로일 = 평일(월~금) 중 holidays에 없는 날. 관리자가 등록·삭제(ATT-11)하며, 임시공휴일·선거일도 지정 시 여기에 추가한다.

### 6. attendances — 근태 기록

직원별·일자별 출퇴근과 자동 판정된 근태 상태를 보관한다. 출근 시 1건 생성되거나 일 마감(아래 자동화)이 결근·퇴근누락 행을 생성한다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 근태 식별자 |
| employee_id | uuid | N | FK → employees.id | 대상 직원 |
| work_date | date | N | UQ* | 근무 일자 (KST). employee_id와 **복합 UQ** `(employee_id, work_date)`로 직원·일자당 1건(당일 중복출근 차단). 단독 UQ 아님 |
| check_in_at | timestamptz | Y |  | 출근 기록 시각 (서버 시각) |
| check_out_at | timestamptz | Y |  | 퇴근 기록 시각 (check_out ≥ check_in) |
| status | text | N |  | 근태 상태(자동 판정) — present(정상) / late(지각) / early_leave(조퇴) / late_early_leave(지각+조퇴) / absent(결근) / missing_checkout(퇴근누락) / leave(종일 휴가) |
| work_minutes | int | Y |  | 실근무 시간(분), 휴게 제외 — 마감 시 산출(역정규화) |
| leave_day_type | text | Y |  | 휴가 적용 구분 — full(종일) / am_half(오전반차) / pm_half(오후반차). NULL=휴가 무관 |
| leave_request_id | uuid | Y | FK → leave_requests.approval_request_id | 휴가 연동 시 원천 신청 |
| is_closed | boolean | N |  | 일 마감 확정 여부 (기본 false) |
| note | text | Y |  | 비고 |
| created_at | timestamptz | N |  | 생성 시각 |
| updated_at | timestamptz | N |  | 최종 수정 시각 |

> 반차 사용일은 근무 의무 반일을 기준으로 판정한 `present/late/early_leave`에 `leave_day_type=am_half|pm_half`를 함께 기록한다(종일 휴가는 status=leave + leave_day_type=full). 근태 기록의 직접 수정은 막고, 보정은 전자결재(아래 8)로만 이뤄진다.

### 7. approval_requests — 전자결재 (공통)

근태 보정과 휴가 신청이 공유하는 공통 전자결재 워크플로. 신청자가 지정한 승인자(같은 부서의 부서 관리자)의 결재함을 통해 승인/반려된다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 결재 식별자 |
| request_type | text | N |  | 요청 유형 — attendance_correction(근태 보정) / leave(휴가) |
| requester_id | uuid | N | FK → employees.id | 신청자 |
| approver_id | uuid | N | FK → employees.id | 지정 승인자 (부재 시 재배정 가능) |
| status | text | N |  | 상태 — pending / approved / rejected / cancelled (기본 pending) |
| reason | text | Y |  | 신청 사유 |
| decided_by | uuid | Y | FK → employees.id | 실제 결재자 (재배정 시 approver_id와 다를 수 있음) |
| decided_at | timestamptz | Y |  | 결재(승인/반려) 시각 |
| reject_reason | text | Y |  | 반려 사유 |
| created_at | timestamptz | N |  | 신청 시각 |
| updated_at | timestamptz | N |  | 최종 수정 시각 |

> **상태 흐름**: pending → approved / rejected / cancelled. 종결 상태는 원칙적으로 불가역(guard 트리거)이나, **휴가에 한해 approved → cancelled 전이를 예외 허용**한다(휴가 시작일 이전일 때만, LEAVE-7). 그 외 취소는 승인 전(pending)에만 가능하다. 휴가 승인 후 취소 시 차감 잔액은 자동 환원된다.

### 8. attendance_corrections — 근태 보정 (결재 서브타입)

근태 보정 결재의 페이로드. `approval_requests`와 동일 PK로 1:1 연결된다(request_type=attendance_correction).

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| approval_request_id | uuid | N | PK, FK → approval_requests.id | 결재 식별자 (1:1) |
| attendance_id | uuid | N | FK → attendances.id | 보정 대상 근태 기록 |
| requested_check_in_at | timestamptz | Y |  | 보정 출근 시각 |
| requested_check_out_at | timestamptz | Y |  | 보정 퇴근 시각 |
| requested_status | text | Y |  | 보정 근태 상태 |

> 동일 근태 기록에 대기(pending) 보정이 있으면 중복 제출 차단. 승인 시 보정값이 대상 근태에 원자 반영된다(아래 자동화 `apply_attendance_correction`).

### 9. leave_types — 휴가 종류

휴가 종류와 종류별 속성을 공통 코드로 관리한다. 관리자가 등록·수정·삭제하며, 참조하는 신청이 있으면 삭제가 차단된다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 종류 식별자 |
| code | text | N | UQ | 종류 코드 (예: ANNUAL, AM_HALF, SICK). 등록 후 불변 |
| name | text | N |  | 종류 명칭 |
| deducts_annual | boolean | N |  | 연차 잔액 차감 여부 (연차·반차만 true) |
| is_paid | boolean | N |  | 유급 여부 |
| requires_proof | boolean | N |  | 증빙 필요 여부 |
| proof_guide | text | Y |  | 증빙 안내 문구 |
| max_days | numeric(5,1) | Y |  | 한도 일수 (§9-5 기준). NULL=통지 기간 기준(고정 한도 없음) |
| half_day_period | text | Y |  | 반차 구분 — am(오전반차) / pm(오후반차). NULL=종일 종류 |
| is_active | boolean | N |  | 사용 여부 (기본 true) |
| sort_order | int | N |  | 표시 순서 |
| created_at | timestamptz | N |  | 생성 시각 |
| updated_at | timestamptz | N |  | 최종 수정 시각 |

### 10. leave_requests — 휴가 신청 (결재 서브타입)

휴가 신청 결재의 페이로드. `approval_requests`와 동일 PK로 1:1 연결된다(request_type=leave).

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| approval_request_id | uuid | N | PK, FK → approval_requests.id | 결재 식별자 (1:1) |
| employee_id | uuid | N | FK → employees.id | 신청자 (= approval_requests.requester_id, 신청 후 불변 — 기간중복 배제제약용 역정규화) |
| leave_type_id | uuid | N | FK → leave_types.id | 휴가 종류 |
| start_date | date | N |  | 휴가 시작일 (신청일 이후, 당일 포함) |
| end_date | date | N |  | 휴가 종료일 (end ≥ start) |
| deducted_days | numeric(4,1) | N |  | 차감 일수 — 기간 내 소정근로일만, 반차 0.5 |
| attachment_id | uuid | Y | FK → attachments.id | 증빙 파일 (단일, 증빙 필요 종류는 필수) |

> 동일 직원의 휴가 중복은 `guard_leave_request` 트리거가 **일·반일 슬롯 단위**로 차단한다(pending·approved 한정): 종일 휴가는 해당 일자의 다른 모든 휴가와 충돌, 오전/오후 반차는 같은 반일 슬롯 및 종일과 충돌하되 **오전반차+오후반차의 같은 날 공존은 허용**(합계 1일). 다일 종일 구간 겹침은 btree_gist 기반 배제제약으로도 보강한다. 잔액 차감·복원은 아래 자동화 `settle_leave_balance`가 처리한다.

### 11. leave_grants — 연차 적립·소멸 원장

월/연 자동적립과 관리자 수동조정을 적립 단위로 기록한다. 사용분을 발생 순(FIFO)으로 소비하며, 발생일부터 1년 경과 시 미사용분이 소멸된다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 적립 식별자 |
| employee_id | uuid | N | FK → employees.id | 대상 직원 |
| source | text | N |  | 적립 원천 — monthly_accrual(월 1일) / annual_accrual(연 15일) / manual(수동조정) |
| granted_days | numeric(4,1) | N |  | 적립 일수 (manual은 음수 조정 가능) |
| used_days | numeric(4,1) | N |  | 소비된 일수 (FIFO, 기본 0) |
| effective_date | date | N |  | 발생일 |
| expires_at | date | N |  | 만료일 (발생일 + 1년) |
| status | text | N |  | active(유효) / exhausted(소진) / expired(소멸) |
| created_by | uuid | Y | FK → employees.id | 수동조정 행위자 (자동 적립은 NULL) |
| note | text | Y |  | 사유·비고 (소멸·조정 내역) |
| created_at | timestamptz | N |  | 생성 시각 |
| updated_at | timestamptz | N |  | 최종 수정 시각 |

### 12. leave_balances — 연차 잔액 요약

직원별 현재 연차 잔여를 빠르게 조회하기 위한 요약(역정규화). leave_grants의 활성 잔여 합과 일치하도록 트리거로 유지한다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| employee_id | uuid | N | PK, FK → employees.id | 직원 (1:1) |
| balance | numeric(5,1) | N |  | 현재 잔여 연차 (활성 grant의 granted−used 합) |
| updated_at | timestamptz | N |  | 최종 갱신 시각 |

> 직원 등록(HR-5) 시 잔액 레코드를 0으로 초기화한다. 부여·사용·복원·소멸·수동조정 시 트리거가 재계산한다.

### 13. attachments — 증빙 첨부

휴가 증빙 파일의 메타데이터. 실제 파일은 Supabase Storage의 private 버킷에 저장하고, 본 테이블은 경로와 속성만 보관한다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 첨부 식별자 |
| storage_object_path | text | N | UQ | private 버킷 내 파일 경로 |
| file_name | text | N |  | 원본 파일명 |
| mime_type | text | N |  | 허용 형식 — application/pdf / image/jpeg / image/png |
| byte_size | int | N |  | 파일 크기(바이트), 최대 10MB |
| uploaded_by | uuid | N | FK → employees.id | 업로더(신청자) |
| retain_until | date | Y |  | 보관 만료일 (업로더 퇴사 후 3년) |
| created_at | timestamptz | N |  | 업로드 시각 |

> **연결 방향(단일 진실원천)**: 휴가↔증빙 1:1은 `leave_requests.attachment_id` 한쪽으로만 표현한다(역방향 FK 없음 — 순환 참조 제거). 흐름은 ① 신청자가 파일 업로드(attachments 생성, 이 시점엔 업로더만 접근) → ② 휴가 신청 제출 시 `leave_requests.attachment_id`로 연결 → ③ 이후 지정 결재자가 결재함 미리보기로 열람.
> **접근통제**: 신청자 본인과, 그 첨부를 참조하는 휴가의 지정 결재자만 열람(전사 관리자 포함 그 외 차단). 결재자 판별은 `leave_requests.attachment_id = 해당 첨부`를 역참조하는 SECURITY DEFINER 헬퍼로 평가하며, 메타데이터 행과 Storage 객체 양쪽에 동일 정책을 적용한다. 1건 단일 첨부로 한정한다.

### 14. audit_logs — 감사 로그

역할 변경·계정 활성/비활성·결재 승인/반려·연차 수동조정·근태 보정 등 주요 변경을 추적한다. 정의자 함수(트리거)만 기록하는 append-only 테이블이다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | bigint | N | PK | 식별자 (identity, 단조 증가) |
| actor_id | uuid | Y | FK → employees.id | 행위자 (시스템 자동 변경은 NULL) |
| action | text | N |  | 행위 종류 (예: role_change, account_deactivate, approval_approve, leave_manual_adjust, attendance_correction) |
| target_type | text | Y |  | 대상 유형 (employee / approval / leave_grant / attendance) |
| target_id | uuid | Y |  | 대상 식별자 |
| detail | jsonb | Y |  | 변경 전/후 등 상세 |
| created_at | timestamptz | N |  | 발생 시각 |

### 15. notifications — 결재 알림

승인자에게 대기 결재를, 신청자에게 승인·반려·재배정 결과를 표시하기 위한 알림. 미확인 건수를 화면에 표시한다.

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 알림 식별자 |
| recipient_id | uuid | N | FK → employees.id | 수신자 |
| type | text | N |  | 유형 — approval_pending / approval_approved / approval_rejected / approval_reassigned |
| approval_request_id | uuid | Y | FK → approval_requests.id | 관련 결재 |
| message | text | Y |  | 표시 메시지 |
| is_read | boolean | N |  | 확인 여부 (기본 false) |
| read_at | timestamptz | Y |  | 확인 시각 |
| created_at | timestamptz | N |  | 생성 시각 |

---

## 무결성 제약

### CHECK 제약

| 테이블 | 컬럼 | 허용값 |
|-------|------|-------|
| common_codes | code_type | department, position |
| employees | role | ADMIN, MANAGER, USER |
| employees | employment_status | active, resigned |
| attendances | status | present, late, early_leave, late_early_leave, absent, missing_checkout, leave |
| attendances | leave_day_type | full, am_half, pm_half (NULL 허용) |
| attendances | (시각) | check_out_at ≥ check_in_at (둘 다 있을 때) |
| approval_requests | request_type | attendance_correction, leave |
| approval_requests | status | pending, approved, rejected, cancelled |
| leave_types | half_day_period | am, pm (NULL 허용) |
| leave_requests | (기간) | end_date ≥ start_date / deducted_days ≥ 0 |
| leave_grants | source | monthly_accrual, annual_accrual, manual |
| leave_grants | status | active, exhausted, expired |
| leave_grants | (소비) | used_days ≥ 0 |
| attachments | mime_type | application/pdf, image/jpeg, image/png |
| attachments | byte_size | ≤ 10485760 (10MB) |
| leave_balances | balance | ≥ 0 (잔액 음수 불가) |
| notifications | type | approval_pending, approval_approved, approval_rejected, approval_reassigned |

### UNIQUE 제약

| 테이블 | 컬럼 조합 | 목적 |
|-------|---------|------|
| common_codes | (code_type, code) | 동일 유형 내 코드값 중복 방지 |
| employees | (employee_number) | 사번 시스템 전체 유일 |
| employees | (email) | 로그인 이메일 유일 |
| attendances | (employee_id, work_date) | 직원·일자당 1건 (당일 중복 출근 차단) |
| holidays | (holiday_date) | 동일 날짜 중복 등록 방지 |
| leave_types | (code) | 휴가 종류 코드 유일 |
| attachments | (storage_object_path) | 저장 경로 유일 |
| leave_balances | (employee_id) | 직원당 잔액 1건 (PK) |

### 배제 제약 (EXCLUDE)

| 테이블 | 제약 | 목적 |
|-------|------|------|
| leave_requests | (종일 구간) EXCLUDE USING gist (employee_id =, daterange(start_date, end_date, '[]') &&) WHERE status ∈ {pending, approved} AND 종일 | 종일 휴가 기간 중복 차단 (btree_gist). 반차 슬롯 충돌은 `guard_leave_request` 트리거가 보강 — 오전+오후 반차 공존 허용, 같은 반일 중복·종일과의 충돌 차단 |

### FK ON DELETE 정책

| FK | 정책 | 이유 |
|----|------|------|
| employees.department_code_id / position_code_id → common_codes | RESTRICT | 참조 직원이 있는 코드 삭제 차단 |
| employees.id → auth.users | CASCADE | 인증 사용자 삭제 시 프로필 제거 (운영상 삭제 대신 비활성/퇴사 사용) |
| attendances.employee_id → employees | CASCADE | 직원 데이터에 종속 |
| attendances.leave_request_id → leave_requests | SET NULL | 휴가 신청 정리 시 근태 행은 보존 |
| approval_requests.requester_id / approver_id / decided_by → employees | RESTRICT | 결재 이력 보존 (직원은 삭제 대신 퇴사 처리) |
| attendance_corrections.approval_request_id → approval_requests | CASCADE | 서브타입은 슈퍼타입에 종속 |
| attendance_corrections.attendance_id → attendances | CASCADE | 대상 근태에 종속 |
| leave_requests.approval_request_id → approval_requests | CASCADE | 서브타입은 슈퍼타입에 종속 |
| leave_requests.leave_type_id → leave_types | RESTRICT | 참조하는 신청이 있으면 종류 삭제 차단(LEAVE-1) |
| leave_requests.employee_id → employees | RESTRICT | 신청 이력 보존 |
| leave_requests.attachment_id → attachments | SET NULL | 첨부 정리 시 신청 보존 |
| leave_grants.employee_id → employees | CASCADE | 직원 잔액 데이터에 종속 |
| leave_balances.employee_id → employees | CASCADE | 직원 잔액 데이터에 종속 |
| attachments.uploaded_by → employees | RESTRICT | 증빙 보존 |
| audit_logs.actor_id → employees | SET NULL | 행위자 삭제와 무관하게 로그 보존 |
| notifications.recipient_id → employees | CASCADE | 수신자에 종속 |
| notifications.approval_request_id → approval_requests | CASCADE | 결재에 종속 |

### 상태 일관성 (트리거 강제)

| 테이블 | 조건 |
|-------|------|
| employees | resigned → is_active=false 이고 resigned_at 기록 / active → resigned_at 비움 (퇴사 비가역). 마지막 활성 ADMIN은 권한 회수·비활성화 **및 퇴사(is_active=false 동반)** 불가 |
| approval_requests | 전이는 pending → approved/rejected/cancelled. **예외**: request_type=leave는 approved → cancelled 허용(해당 휴가 start_date > 오늘 KST일 때만 — LEAVE-7). 그 외 종결 상태는 불변. **decided_by·decided_at는 approved/rejected 전이에만 필수**(결재자 결정). approved → cancelled(신청자 취소)는 원 승인 기록(decided_by·decided_at)을 보존하고, 취소 행위자·시각은 audit_logs로 남긴다 |
| attendances | status=leave ↔ leave_day_type=full. 직접 UPDATE 차단(보정 결재 경로만 허용) |
| leave_requests | requires_proof 종류는 attachment_id 필수. deducts_annual 종류는 신청 시 잔액 충분(차감 후 음수 불가). start_date ≥ 신청일(KST). 일·반일 슬롯 중복 불가 |
| leave_grants | used_days ≤ granted_days. expires_at < 오늘(KST)이면 status=expired로 전이, 미사용분 소멸. 수동 음수 조정(source=manual, granted_days<0)은 결과 잔액이 0 미만이면 차단 |
| leave_balances | 항상 활성 grant의 (granted−used) 합과 일치(트리거 유지), 0 미만 불가 |

---

## 자동화 (트리거·함수·예약작업)

기존 패턴(`set_updated_at()`, guard 트리거, `is_admin()` 류 SECURITY DEFINER 헬퍼)을 그대로 확장한다. 모든 함수는 `search_path`를 고정하고, RLS 헬퍼는 STABLE SECURITY DEFINER로 둔다.

### RLS·권한 헬퍼

| 함수 | 역할 |
|------|------|
| is_admin() | 현재 사용자가 활성 ADMIN인지 (기존) |
| is_manager() | 현재 사용자가 활성 MANAGER인지 |
| current_department_id() | 현재 사용자의 부서 코드 ID |
| my_department_member_ids() | 현재 MANAGER 부서원 employee_id 집합 (조인 대신 세트 멤버십으로 RLS 최적화) |

### 트리거 함수

| 함수 | 시점 | 역할(요구사항) |
|------|------|--------------|
| set_updated_at() | BEFORE UPDATE (전 테이블) | updated_at 갱신 (기존) |
| judge_attendance_status() | 출퇴근 기록 시 | 표준 근무(09:00~18:00·휴게 12:00~13:00·소정근로 8h) 기준 상태·실근무분 판정. 반차일은 반일 기준 (ATT-3) |
| apply_attendance_correction() | 보정 결재 승인 시 | 대상 근태에 보정값 원자 반영 (ATT-9) |
| settle_leave_balance() | 휴가 신청 제출/반려/취소 시 | 차감 종류는 제출 즉시 차감·반려/취소(승인 후 시작 전 포함) 시 복원, FIFO grant 배분 (LEAVE-10) |
| sync_leave_to_attendance() | 휴가 결재 승인 시 | 승인 휴가일을 근태에 반영 — `(employee_id, work_date)` UPSERT(멱등). 종일=status=leave·leave_day_type=full(기존 출근행 있으면 덮어쓰되 집계 비소급), 반차=기존/신규 행에 leave_day_type=am_half/pm_half 부가(근무 반일 판정 유지). 일 마감이 먼저 만든 absent 행도 덮어씀 (LEAVE-11) |
| init_leave_balance_on_hire() | 직원 등록 시 | leave_balances 0 초기화 (HR-5) |
| cancel_pending_on_resign() | 퇴사 처리 시 | 본인이 올린 대기 결재·휴가 자동 취소 (HR-7) |
| reassign_approver() | 승인자 퇴사·비활성 시 | 같은 부서 다른 MANAGER로 재배정(없으면 ADMIN으로 확대). 결재함 접근은 `approver_id` 기준이므로 확대된 ADMIN도 동일 경로로 결재 가능 (APPR-6) |
| guard_approval_status() | BEFORE UPDATE approval_requests | 상태 흐름 강제 — pending→종결. 단 휴가 approved→cancelled는 서브타입 leave_requests의 start_date>오늘(KST)일 때만 허용 |
| guard_leave_request() | BEFORE INSERT/UPDATE leave_requests | 증빙 필수(requires_proof)·시작일(≥오늘)·잔액 초과·**일/반일 슬롯 중복** 검증 |
| guard_last_admin() / guard_resign() / guard_*_immutable() | BEFORE UPDATE employees·codes | 기존 불변식 — 마지막 활성 ADMIN의 권한회수·비활성화 **및 퇴사(is_active=false 동반)** 차단, 퇴사 비가역, 코드/사번 불변 |
| notify_approval_*() | 결재 INSERT·상태 변경 시 | 승인자·신청자 알림 생성 (APPR-7) |
| audit_*() | 주요 변경 시 | audit_logs 기록 (RBAC-4) |

### 예약작업 (pg_cron — KST 보정)

`pg_cron`은 UTC로 동작하므로 KST 일 경계에 맞춰 UTC 시각을 지정한다. 적립·만근 판정은 각 시점의 확정 근태를 기준으로 하며 사후 보정을 소급하지 않는다.

| 작업 | 주기(예) | 역할(요구사항) |
|------|---------|--------------|
| close_daily_attendance() | 매일 1회 (KST 자정 직후 ≈ UTC 15:xx) | 소정근로일의 미출근→결근, 미퇴근→퇴근누락 확정·실근무분 집계 (ATT-12) |
| accrue_monthly_leave() | 매일 (응당일 스캔) | 입사 1~11개월 직원의 응당일에 직전 1개월 만근(is_full_attendance) 시 1일 적립 (LEAVE-3) |
| accrue_annual_leave() | 매일 (응당일 스캔) | 입사 1년 응당일에 직전 1년 만근 시 15일 적립 (LEAVE-4) |
| expire_leave_grants() | 매일 | expires_at 경과 grant를 expired로 전이·미사용분 소멸·잔액 갱신 (LEAVE-5) |

> 만근 판정 헬퍼 `is_full_attendance(employee_id, 기간)`: 대상 기간 소정근로일에서 승인 종일 휴가일(status=leave)을 제외한 모든 날이 정상 출근(status=present)일 때 만근. 반차일(leave_day_type=am_half/pm_half)은 `leave_day_type`으로 미사용 반일을 식별해 그 반일에 근태 기록이 있고 지각·조퇴가 아니면 인정, 결근·퇴근누락·미기록이면 미달 (LEAVE-2). 판정은 status 기준으로 일원화한다.

---

## 접근통제(RLS) 요약

모든 public 테이블에 RLS를 켜고 `TO authenticated`로 정책을 둔다. 성능을 위해 `auth.uid()`와 헬퍼 함수는 `(select …)`로 래핑하고, 부서 스코프는 세트 멤버십으로 평가한다.

| 테이블 | SELECT | INSERT / UPDATE / DELETE |
|--------|--------|--------------------------|
| common_codes / leave_types / holidays | 인증 사용자 전체 | 관리자만 |
| employees | 관리자 전체 / 본인 / 매니저=같은 부서 | 관리자만 (계정 작업) |
| attendances | 본인 / 관리자 / 매니저=같은 부서(부서현황 ATT-13) | 본인 출퇴근 INSERT; 직접 UPDATE 차단(보정 결재만) |
| approval_requests · 서브타입 | 신청자 본인 / **지정 승인자(`approver_id`=현재 사용자)** / 관리자 / 매니저=부서(부서현황) | 신청자 INSERT·취소; 승인/반려 UPDATE는 `approver_id`=현재 사용자(재배정 MANAGER·확대 ADMIN 동일 경로) 또는 is_admin() |
| leave_balances / leave_grants | 본인 / 관리자 / 매니저=부서 | 시스템(정의자 함수)·관리자만 |
| notifications | 수신자 본인 | 본인 읽음 처리(UPDATE) |
| audit_logs | 관리자만 | 정의자 함수만 (API INSERT 불가) |
| attachments | 업로더 본인 + 지정 결재자만 (관리자 포함 그 외 차단) | 업로더 INSERT |

> **결재 접근 경로**: 결재함 접근·결재(UPDATE)는 `approver_id`=현재 사용자로 판별하므로, APPR-6로 ADMIN에게 확대 배정된 경우에도 그 ADMIN은 동일 경로로 결재한다(부서 일치 불요). 매니저의 `부서현황` 스코프(ATT-13·LEAVE-13 조회)는 이와 별개다. APPR-1에서 같은 부서 MANAGER도 ADMIN도 없는 극단은 신청 제출 자체를 막아야 하며(앱 사전검증), DB는 NOT NULL `approver_id`로 미지정 신청을 거부한다.
> **Storage**: private 버킷의 `storage.objects`에도 동일 정책(신청자·결재자만 열람)을 적용한다. 증빙은 민감정보(진단서 등) 보호를 위해 전사 관리자도 접근 불가가 의도된 예외다.

---

## 정규화 / 역정규화 설계

- **정규화(3NF)**: 부서·직급(common_codes)과 휴가 종류(leave_types)를 코드로 정규화하여 추가·변경이 참조 테이블에 영향을 주지 않게 한다. 결재는 슈퍼타입(approval_requests)/서브타입(attendance_corrections·leave_requests)으로 분리하여 유형별 희소 NULL 컬럼을 제거하고 단일 결재함 조회를 가능하게 한다.
- **의도적 역정규화**:
  1. `leave_balances.balance` — leave_grants 원장의 활성 잔여 합을 트리거로 미리 계산·보관해 잔액 조회를 O(1)로 만든다.
  2. `attendances.status` · `work_minutes` — 출퇴근·휴게·공휴일·휴가로부터 매번 재계산하지 않도록 판정 결과를 저장(목록·집계·만근 판정 가속).
  3. `leave_requests.employee_id` — 신청자(=requester_id, 신청 후 불변)를 함께 보관하여 휴가 기간 중복 배제제약(EXCLUDE)을 단일 테이블에서 강제한다.
  4. `notifications` — 결재 이벤트로부터 파생되는 알림을 구체화(미확인 표시 UX).
- **기각한 역정규화**: 근태·결재 행에 부서 스냅샷을 저장하는 안은 부서 이동(HR-6) 시 정합성 위험이 있어 채택하지 않고, RLS 부서 스코프는 `my_department_member_ids()` 세트 헬퍼로 대체한다(현재 부서 기준 일관 평가).

---

## 인덱스·최적화

| 테이블 | 인덱스 | 용도 |
|-------|--------|------|
| attendances | UQ(employee_id, work_date), (work_date), (status) | 본인·기간·상태 조회, 일 마감, 관리자 필터 |
| approval_requests | (approver_id, status), (requester_id, status) | 결재함(APPR-2)·내 요청(APPR-5) |
| leave_requests | gist 배제제약, (leave_type_id) | 기간중복·종류 참조 |
| leave_grants | (employee_id, status, expires_at) | FIFO 소비·소멸 스캔 |
| leave_balances | PK(employee_id) | 잔액 조회 |
| notifications | (recipient_id, is_read) | 미확인 알림 |
| audit_logs | (created_at desc), (target_type, target_id) | 이력 조회 |
| employees | (department_code_id), 이름·사번 검색 | 매니저 부서 스코프·검색(HR-9) |

- RLS에서 참조하는 모든 컬럼(employee_id·approver_id·requester_id·recipient_id·department_code_id)에 인덱스를 둔다.
- 무한 스크롤 목록(직원·근태·휴가·결재함)은 정렬 키(생성/일자) + 키셋 또는 LIMIT/OFFSET 20건 단위. RLS 정책은 보안용이며 클라이언트 쿼리는 명시 필터(`.eq`)를 함께 건다.
- **필요 확장**: `pg_cron`(예약작업), `btree_gist`(휴가 배제제약), 필요 시 `pg_trgm`(이름·사번 부분검색). 적용 단계에서 활성화한다.

---

## KST 시각 처리

- 저장은 UTC `timestamptz`. 일자 컬럼(work_date·effective_date 등)과 모든 판정은 `(ts AT TIME ZONE 'Asia/Seoul')::date` 변환으로 KST 기준 산출한다.
- 표준 근무시간 09:00~18:00, 점심 휴게 12:00~13:00(1시간), 소정근로 8시간 — 근태 판정·집계·만근 모두 실근무(휴게 제외)·KST 기준.
- 예약작업(pg_cron)은 UTC로 실행되므로 KST 일 경계(자정·응당일)에 대응하는 UTC 시각으로 스케줄을 등록한다.

---

## 초기 데이터 (시드)

시스템 최초 배포 시 아래 순서로 기초 데이터를 생성한다. 의존 순서를 지켜야 한다.

| 순서 | 작업 |
|------|------|
| 1 | 기본 부서·직급 공통 코드 등록 (common_codes) |
| 2 | 관리자 인증 계정 생성 (auth.users) |
| 3 | 관리자 직원 레코드 생성 (employees) — 역할=ADMIN, 사번·부서·직급·입사일 부여, leave_balances 초기화 |
| 4 | 휴가 종류 등록 (leave_types) — 아래 13종 기본 시드 |
| 5 | 공휴일 등록 (holidays) — requirements.md §8의 2026~2027 법정 공휴일·대체공휴일 전체 |

**휴가 종류 기본 시드 (leave_types, §9-4·§9-5 기준 — requires_proof는 권장 기본값이며 관리자가 조정)**

| code | 명칭 | 연차차감 | 유급 | 증빙 | 한도(max_days) |
|------|------|:------:|:----:|:----:|------|
| ANNUAL | 연차 | Y | 유급 | 불요 | 적립 기준(월1/최대11·1년이상15) |
| AM_HALF | 오전반차 | Y | 유급 | 불요 | 0.5 (half_day_period=am) |
| PM_HALF | 오후반차 | Y | 유급 | 불요 | 0.5 (half_day_period=pm) |
| SICK | 병가 | N | 무급 | 필수 | 60 (회사 정책) |
| FAMILY_EVENT | 경조사 | N | 유급(회사) | 필수 | 사유별 1~5 (회사 정책) |
| RESERVE_FORCES | 예비군훈련 | N | 유급 | 필수 | 통지 기준(NULL) |
| CIVIL_DEFENSE | 민방위훈련 | N | 유급 | 필수 | 통지 기준(NULL) |
| MILITARY_EXAM | 병역판정검사 | N | 시간보장 | 필수 | 통지 기준(NULL) |
| MATERNITY | 출산전후휴가 | N | 유급 | 필수 | 90 |
| SPOUSE_MATERNITY | 배우자출산휴가 | N | 유급 | 필수 | 20 |
| INFERTILITY | 난임치료휴가 | N | 일부유급 | 필수 | 6 |
| FAMILY_CARE | 가족돌봄휴가 | N | 무급 | 불요 | 10 |
| PARENTAL_LEAVE | 육아휴직 | N | 무급 | 필수 | 회사·법정 기준 |

> **연차 차감 종류의 한도**: ANNUAL·AM_HALF·PM_HALF의 실제 한도는 종류별 max_days가 아니라 적립된 **연차 잔액**(leave_balances)이다. max_days는 차감 단위(반차 0.5)·표시용이며, LEAVE-6 한도 검증은 차감 종류=잔액 초과 차단, 비차감 종류=종류별 max_days 초과 차단으로 분기한다.
> **증빙 정책**: 본인 재량 휴가(연차·반차·가족돌봄)는 불요, 외부 사건 사유(출산·산재·예비군·경조사·병가 등)는 필수가 권장 기본값이다(requirements.md §9-4). 관리자가 leave_types 등록 시 `requires_proof`·`proof_guide`·`max_days`를 조정한다.
> **추가 종류**: 위 13종은 requirements.md §7-1의 기본 시드다. §9에만 등장하는 유산·사산휴가·생리휴가·공의 직무·산재 요양 등은 운영 시 관리자가 LEAVE-1로 추가한다.
