# 데이터베이스 설계서 (Database Design)

> **대상**: 사내 ERP — 인사/근태 관리 모듈
> **작성일**: 2026-05-24

본 문서는 시스템이 어떤 데이터를 어떻게 분리·보관하며, 누가 어디까지 접근할 수 있는지를 설명합니다.

---

## 데이터 저장 영역 (총 10개)

| # | 영역 | 항목 | 테이블명 | 보관 내용 |
|---|------|------|--------|---------|
| 1 | 사용자·조직 | 부서 | departments | 부서 정보, 부서장(manager_id) |
| 2 | 사용자·조직 | 임직원 | employees | 사번, 이름, 부서, 직급, 입사일, 연락처 |
| 3 | 내 인사정보 | 인사정보 변경 요청 | employee_info_change_requests | 변경 항목, 사유, 결재 연결 |
| 4 | 근태 관리 | 출퇴근 기록 | attendance_records | 일자별 출근·퇴근 시각, 근무 시간, 지각·조퇴 여부 |
| 5 | 근태 관리 | 연차 잔여 | vacation_remain | 연차 잔여량 (누적, 소멸 없음. 1달 만근 시 1일 / 1년 만근 시 15일 자동 부여) |
| 6 | 근태 관리 | 휴가 신청 | vacation_requests | 휴가 유형(연차/반차/공가), 기간, 사유, 결재 연결, 상태 |
| 7 | 초과근무 관리 | 야근/특근 신청 | overtime_requests | 근무일, 근무위치, 업무 내용, 예상/실제 시간, 사유, 실제 입력 상태, 결재 연결 (모든 야근은 수당으로 보상) |
| 8 | 공통 | 결재 문서 | approval_documents | 모든 결재 신청(휴가·야근·인사정보)의 상태·승인자·반려 사유 |
| 9 | 공통 | 인앱 알림 | notifications | 결재 요청·승인·반려 등 알림 |
| 10 | 공통 | 회사 설정 | company_settings | 정규 근무시간 등 회사 정책 상수 (key-value) |

---

## 휴가 유형 (4종)

| 유형 | 코드 | 신청 단위 | 차감 단위 | 잔여 관리 | 결재 라우팅 |
|------|------|---------|---------|---------|---------|
| 연차 | annual | 1.0일 | 1.0일 | 연차 잔여에서 차감 | 부서장 |
| 오전 반차 | half_am | 0.5일 | 0.5일 | 연차 잔여에서 차감 | 부서장 |
| 오후 반차 | half_pm | 0.5일 | 0.5일 | 연차 잔여에서 차감 | 부서장 |
| 공가 | public | 1.0일 | 차감 없음 | 잔여 변동 없음 | 관리자 (admin) |

---

## 연차 부여 규칙

| 시점 | 부여량 | 비고 |
|------|------|------|
| 매월 입사일 동일 일자 | 1일 | 1달 만근 가산. pg_cron이 매일 입사일 일자가 도래한 직원을 찾아 자동 부여 |
| 매년 입사일 동일 일자 | 15일 | 1년 만근 가산. 입사 1주년부터 매년 부여 |
| 충돌 시 (월·연 부여일 동일) | 16일 | 단순 합산 누적 (월 1일 + 연 15일) |

> 부여된 연차는 누적되어 소멸되지 않음(임의 구현, 근로기준법 제60조 제7항과 다름). 근속 가산은 별도로 두지 않고 1년 만근 시 15일 부여로 일원화.

---

## 접근 권한 (Row Level Security)

데이터베이스 레벨에서 자동으로 접근 범위를 제한하여, 애플리케이션 버그가 있어도 권한 외 데이터가 노출되지 않도록 보호합니다.

| 데이터 영역 | 일반 사용자 | 부서장 | 관리자 |
|-----------|----------|--------|--------|
| 본인 데이터 (출퇴근·휴가·야근·잔여 등) | 본인만 | 본인 + 부서원 | 전체 |
| 마스터 데이터 (부서) | 조회만 가능 | 조회만 가능 | 조회·수정 |
| 결재 문서 | 본인 기안 | 본인 기안 + 결재 담당 | 전체 |

---

## 데이터 보호 요약

| 항목 | 보호 방식 |
|------|---------|
| 로그인 비밀번호 | 단방향 암호화(bcrypt) — 평문 저장 안 함 |
| 통신 | HTTPS(TLS) 암호화 |
| 백업 | 일 1회 자동, 30일 보관 |

---

## 테이블 명세

> NULL 열의 N = 필수, Y = 선택. 키 열 표기: PK(기본키) / FK(외래키) / UQ(고유 제약).

### 1. departments — 부서

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 부서 ID |
| name | text | N | UQ | 부서명 |
| manager_id | uuid | Y | FK → employees.id | 부서장 (1명, 휴가/야근 결재 자동 라우팅 대상) |
| created_at | timestamptz | N |  | 생성 시각 |

### 2. employees — 임직원

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 임직원 ID |
| email | text | N | UQ | 로그인 이메일 |
| employee_number | text | N | UQ | 사번 |
| name | text | N |  | 이름 |
| department_id | uuid | N | FK → departments.id | 소속 부서 |
| position | text | N |  | 직급 |
| hire_date | date | N |  | 입사일 |
| phone | text | Y |  | 연락처 |
| role | text | N |  | 역할 (employee/manager/admin) |
| is_active | boolean | N |  | 재직 여부 |
| created_at | timestamptz | N |  | 생성 시각 |

### 3. employee_info_change_requests — 인사정보 변경 요청

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 요청 ID |
| employee_id | uuid | N | FK → employees.id | 요청자 |
| changes | jsonb | N |  | 변경 항목 (필드별 이전·이후 값) |
| reason | text | Y |  | 변경 사유 |
| approval_document_id | uuid | N | FK → approval_documents.id | 결재 문서 |
| created_at | timestamptz | N |  | 신청 시각 |

### 4. attendance_records — 출퇴근 기록

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 기록 ID |
| employee_id | uuid | N | FK → employees.id, UQ (employee_id, work_date) | 임직원 |
| work_date | date | N |  | 근무일 |
| check_in_at | timestamptz | Y |  | 출근 시각 |
| check_out_at | timestamptz | Y |  | 퇴근 시각 |
| work_hours | numeric(4,2) | Y |  | 근무 시간 |
| is_late | boolean | N |  | 지각 여부 |
| is_early_leave | boolean | N |  | 조퇴 여부 |
| created_at | timestamptz | N |  | 생성 시각 |

### 5. vacation_remain — 연차 잔여 (누적)

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 잔여 ID |
| employee_id | uuid | N | FK → employees.id, UQ | 임직원 (직원당 1행) |
| granted | numeric(6,1) | N |  | 누적 부여량 (매년 부여 시마다 가산) |
| used | numeric(6,1) | N |  | 누적 사용량 |
| remaining | numeric(6,1) | N |  | 잔여량 (반정규화, granted - used) |
| created_at | timestamptz | N |  | 생성 시각 |
| updated_at | timestamptz | N |  | 최종 변경 시각 |

> 연차만 관리. 모든 야근은 수당으로 보상되므로 대체휴무 잔여는 관리하지 않음.

### 6. vacation_requests — 휴가 신청

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 신청 ID |
| employee_id | uuid | N | FK → employees.id | 신청자 |
| leave_type | text | N |  | 휴가 유형 (annual/half_am/half_pm/public) |
| start_date | date | N |  | 시작일 |
| end_date | date | N |  | 종료일 |
| total_days | numeric(5,1) | N |  | 차감 일수 (트리거 자동 계산 — leave_type별 규칙 적용) |
| reason | text | Y |  | 사유 |
| status | text | N |  | 신청 상태 (pending/approved/rejected/cancelled). approval_documents.status와 동기화 |
| approval_document_id | uuid | N | FK → approval_documents.id | 결재 문서 |
| created_at | timestamptz | N |  | 신청 시각 |

### 7. overtime_requests — 야근/특근 신청

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 신청 ID |
| employee_id | uuid | N | FK → employees.id | 신청자 |
| work_date | date | N |  | 야근 근무일 |
| work_location | text | N |  | 근무위치 (자유 텍스트, 예: 본사, 재택, 외근지명) |
| task_description | text | N |  | 야근이 필요한 업무 내용 |
| expected_start_time | timestamptz | Y |  | 예상 시작 시각 (사전 신청 시 NOT NULL, 사후 신청 시 NULL) |
| expected_end_time | timestamptz | Y |  | 예상 종료 시각 (사전 신청 시 NOT NULL, 사후 신청 시 NULL) |
| actual_start_time | timestamptz | Y |  | 실제 시작 시각 (사전: 야근 종료 후 입력 / 사후: 신청 시 입력) |
| actual_end_time | timestamptz | Y |  | 실제 종료 시각 (사전: 야근 종료 후 입력 / 사후: 신청 시 입력) |
| total_hours | numeric(4,2) | Y |  | 실제 야근 총 시간 (반정규화, actual 기준 자동 계산) |
| request_type | text | N |  | 신청 유형 (before/after) |
| actual_input_status | text | N |  | 실제 시간 입력 상태 (pending/completed). 사후 신청은 처음부터 completed |
| reason | text | Y |  | 사유 (사후 신청 또는 당일/익일 외 필수) |
| exceeds_52h_cap | boolean | N |  | 주 52시간 한도 도달/초과 여부 (진단용). 트리거에서 자동 산출 — true 자체는 저장 차단 사유가 됨 (legacy 컬럼명: exceeds_52h_warning) |
| approval_document_id | uuid | N | FK → approval_documents.id | 결재 문서 |
| created_at | timestamptz | N |  | 신청 시각 |

> 모든 야근은 수당으로 보상됨. 보상 방식 선택 컬럼 없음. 대체휴무는 운영하지 않음.

### 8. approval_documents — 결재 문서

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 결재 문서 ID |
| type | text | N |  | 유형 (leave/overtime/info_change) |
| drafter_id | uuid | N | FK → employees.id | 기안자 |
| approver_id | uuid | N | FK → employees.id | 결재자 |
| title | text | N |  | 문서 제목 |
| status | text | N |  | 상태 (pending/approved/rejected) |
| approved_at | timestamptz | Y |  | 승인 시각 |
| reject_reason | text | Y |  | 반려 사유 |
| created_at | timestamptz | N |  | 기안 시각 |

### 9. notifications — 인앱 알림

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| id | uuid | N | PK | 알림 ID |
| recipient_id | uuid | N | FK → employees.id | 수신자 |
| type | text | N |  | 알림 유형 (approval_request/approval_approved/approval_rejected/info_change_applied/leave_granted) |
| title | text | N |  | 제목 |
| message | text | N |  | 메시지 본문 |
| link_url | text | Y |  | 클릭 시 이동할 URL |
| is_read | boolean | N |  | 읽음 여부 |
| read_at | timestamptz | Y |  | 읽음 시각 |
| created_at | timestamptz | N |  | 생성 시각 |

### 10. company_settings — 회사 정책 상수

| 컬럼명 | 타입 | NULL | 키 | 설명 |
|--------|------|------|----|------|
| key | text | N | PK | 설정 키 (예: work_start_time, work_end_time, weekly_max_hours) |
| value | text | N |  | 설정 값 (예: "09:00", "18:00", "52", "MONDAY"). week_start_day는 "MONDAY" 고정(ISO 8601 / 근로기준법 운용 관행) |
| description | text | Y |  | 설명 |
| updated_at | timestamptz | N |  | 최종 변경 시각 |

> 정규 근무시간(09:00~18:00), 주 최대 근로 시간(52h, 법정 40h + 연장 12h, 휴일근로 포함 합산 — 근로기준법 제53조), 주 시작 요일(MONDAY) 등 회사 정책 상수를 보관. 트리거 함수는 본 테이블 값을 참조하여 지각·조퇴·52시간 한도 **강제 차단** 판정. 기본 시드 키: `work_start_time`, `work_end_time`, `weekly_max_hours`, `week_start_day`.

---

## 무결성 제약

### 검증 정책 (기본 원칙)

| 원칙 | 적용 |
|------|------|
| 이중 검증 | 모든 데이터 삽입·수정은 **프론트엔드 검증 + DB CHECK 제약** 양쪽에서 이중 검증. 프론트엔드는 UX 즉시 피드백용, DB는 최종 안전망 |
| 타임존 | 모든 timestamptz는 KST(Asia/Seoul) 기준으로 저장·표시. Supabase 세션 타임존 = Asia/Seoul 설정 |
| 트랜잭션 | 결재 문서와 업무 데이터는 항상 트랜잭션으로 묶어 원자적으로 처리 (Server Action 또는 PostgreSQL 함수) |

### CHECK 제약

| 테이블 | 컬럼 | 제약 |
|-------|------|------|
| employees | role | role IN ('employee','manager','admin') |
| attendance_records | check_in/out | check_out_at IS NULL OR check_in_at IS NULL OR check_in_at <= check_out_at |
| vacation_remain | granted, used | granted >= 0 AND used >= 0 (used > granted 허용 — 연차 당겨쓰기) |
| vacation_requests | leave_type | leave_type IN ('annual','half_am','half_pm','public') |
| vacation_requests | status | status IN ('pending','approved','rejected','cancelled') |
| vacation_requests | 기간 | start_date <= end_date |
| vacation_requests | 반차 단일일 | leave_type IN ('half_am','half_pm') → start_date = end_date |
| overtime_requests | request_type | request_type IN ('before','after') |
| overtime_requests | actual_input_status | actual_input_status IN ('pending','completed') |
| overtime_requests | 예상 시각 | expected_start_time IS NULL OR expected_end_time IS NULL OR expected_start_time < expected_end_time |
| overtime_requests | 실제 시각 | actual_start_time IS NULL OR actual_end_time IS NULL OR actual_start_time < actual_end_time |
| overtime_requests | total_hours | total_hours IS NULL OR total_hours > 0 |
| overtime_requests | 사전 신청 필수 | request_type='before' → expected_start_time NOT NULL AND expected_end_time NOT NULL |
| overtime_requests | 사후 신청 필수 | request_type='after' → actual_start_time NOT NULL AND actual_end_time NOT NULL AND actual_input_status='completed' |
| overtime_requests | 사후 신청 3일 이내 | request_type='after' → (created_at::date - work_date) <= 3 |
| approval_documents | type | type IN ('leave','overtime','info_change') |
| approval_documents | status | status IN ('pending','approved','rejected','cancelled') |
| approval_documents | 자기결재 방지 | drafter_id <> approver_id |
| notifications | type | type IN ('approval_request','approval_approved','approval_rejected','info_change_applied','leave_granted') |

### 상태-필드 일관성 (조건부 CHECK)

| 테이블 | 조건 |
|-------|------|
| approval_documents | (status='approved' ↔ approved_at NOT NULL) AND (status='rejected' ↔ reject_reason NOT NULL) |
| overtime_requests | actual_input_status='completed' ↔ (actual_start_time NOT NULL AND actual_end_time NOT NULL) |
| notifications | (is_read=true ↔ read_at NOT NULL) |

### UNIQUE 제약 (중복 방지)

| 테이블 | 컬럼 조합 | 목적 |
|-------|--------|------|
| attendance_records | (employee_id, work_date) | 1일 1건만 |
| vacation_remain | (employee_id) | 직원당 1행 (누적 잔여) |

### EXCLUDE 제약 (휴가 기간 겹침 방지)

| 테이블 | 제약 | 목적 |
|-------|------|------|
| vacation_requests | EXCLUDE USING gist (employee_id WITH =, daterange(start_date, end_date, '[]') WITH &&) WHERE (status NOT IN ('rejected','cancelled')) | 같은 직원의 유효 휴가 신청 기간 겹침 차단. status 컬럼이 vacation_requests에 있으므로 EXCLUDE에서 직접 참조 가능. 애플리케이션 Server Action에서도 동일 검증 수행 |

### FK ON DELETE 정책

| FK | 정책 | 이유 |
|----|------|------|
| employees.department_id → departments | RESTRICT | 부서 삭제 전 소속 직원 재배치 필수 |
| attendance_records.employee_id → employees | RESTRICT | 근태 이력 보존 (직원은 is_active=false로 비활성 처리) |
| vacation_remain.employee_id → employees | RESTRICT | 연차 잔여 이력 보존 |
| vacation_requests.employee_id → employees | RESTRICT | 휴가 이력 보존 |
| overtime_requests.employee_id → employees | RESTRICT | 야근 이력 보존 |
| employee_info_change_requests.employee_id → employees | RESTRICT | 변경 이력 보존 |
| approval_documents.drafter_id / approver_id → employees | RESTRICT | 결재 이력 보존 |
| notifications.recipient_id → employees | RESTRICT | 알림 이력 보존 |
| vacation_requests.approval_document_id → approval_documents | CASCADE | 결재 삭제 시 신청도 함께 삭제 (정상 케이스에서는 결재 삭제 발생 안 함) |
| overtime_requests.approval_document_id → approval_documents | CASCADE | 동일 |
| employee_info_change_requests.approval_document_id → approval_documents | CASCADE | 동일 |

### 트리거 함수 (반정규화 자동 동기화)

| 트리거 | 대상 | 동작 |
|--------|------|------|
| trg_calc_work_hours | attendance_records (BEFORE INSERT/UPDATE) | check_in/out 변경 시 work_hours 자동 계산, is_late/is_early_leave 자동 판정 (정규 근무시간은 company_settings의 work_start_time/work_end_time 참조) |
| trg_calc_overtime_actual_hours | overtime_requests (BEFORE INSERT/UPDATE) | actual_start_time AND actual_end_time 모두 NOT NULL일 때 total_hours = actual_end - actual_start 자동 계산. 둘 중 하나라도 NULL이면 total_hours = NULL. exceeds_52h_cap 재판정만 수행 (차단은 별도 트리거 담당) |
| **trg_enforce_overtime_52h_cap** | overtime_requests (BEFORE INSERT/UPDATE) | **하드 차단 트리거**. 사전 신청(request_type='before') 시 expected_start_time/expected_end_time 기준, 사후 신청 및 실제 입력 시 actual_start_time/actual_end_time 기준으로 해당 신청 시간(분 단위)을 계산. 해당 주(주 시작=월요일, 종료=일요일)의 attendance_records.work_hours 합 + 다른 overtime_requests의 시간 합 + 이번 입력값 합이 weekly_max_hours를 초과하면 RAISE EXCEPTION '주 52시간 한도 초과: 등록 가능한 종료 시각은 %L까지입니다 (남은 %s분). 추가 근무는 관리자와 협의가 필요합니다.' 발생. 메시지의 cap-hit 종료 시각은 (weekly_max_hours - 기존 누적)을 분으로 환산하여 expected_start_time/actual_start_time에 더한 값 |
| **trg_enforce_attendance_52h_cap** | attendance_records (BEFORE INSERT/UPDATE) | **하드 차단 트리거**. check_out_at이 갱신될 때 해당 주의 work_hours 합 + 본 행의 work_hours가 weekly_max_hours를 초과하면 check_out_at을 cap-hit 시각으로 자동 조정(clip) 후 NOTICE 발생. check_in_at 갱신 시 이미 해당 주 누적이 한도 이상이면 RAISE EXCEPTION '주 52시간 한도 도달: 추가 출근 체크인이 차단되었습니다. 관리자에게 문의하세요.' |

### RPC 함수 (클라이언트 사전 검증용)

| 함수 | 시그니처 | 동작 |
|------|---------|------|
| `validate_weekly_hours(p_user_id uuid, p_target_date date, p_additional_minutes int)` | returns table(blocked boolean, remaining_minutes int, cap_hit_time timestamptz, message text) | 클라이언트가 야근 신청·출근 체크인 제출 **전에 호출**. 해당 주(월~일)의 기존 합산 + p_additional_minutes 가 weekly_max_hours를 초과하는지 검증. 초과 시 blocked=true, cap_hit_time = 시작 시각 + remaining_minutes, message = "등록 가능한 종료 시각은 21:48까지입니다 (잔여 N분). 추가 근무는 관리자와 협의가 필요합니다." 반환. Submit 버튼 disabled 처리, 인라인 안내 메시지 표시에 사용. DB 트리거가 최종 안전망 |
| trg_calc_vacation_days | vacation_requests (BEFORE INSERT/UPDATE) | leave_type별 total_days 자동 계산: annual = end_date - start_date + 1, half_am/half_pm = 0.5, public = end_date - start_date + 1 (잔여 차감 없음). 사용자 입력값 무시 |
| trg_sync_vacation_request_status | approval_documents (AFTER UPDATE status) | type='leave'인 경우 연결된 vacation_requests.status를 approval_documents.status와 동일하게 동기화 (pending→approved/rejected/cancelled) |
| trg_calc_leave_remaining | vacation_remain (BEFORE INSERT/UPDATE) | remaining = granted - used 자동 계산 (또는 컬럼을 GENERATED ALWAYS AS (granted - used) STORED로 정의) |
| trg_apply_leave_on_approval | approval_documents (AFTER UPDATE status→'approved') | type='leave' AND vacation_requests.leave_type IN ('annual','half_am','half_pm')인 경우 vacation_remain.used에 total_days 가산. leave_type='public'은 차감 없음 (잔여 변동 무시) |
| trg_apply_info_change_on_approval | approval_documents (AFTER UPDATE status→'approved') | type='info_change'인 경우 employee_info_change_requests.changes의 새 값을 employees 테이블에 자동 반영. **허용 필드 화이트리스트**: name, phone만 허용. 그 외 필드(email/사번/부서/직급/role/입사일 등)는 trigger에서 reject |
| trg_grant_monthly_leave | pg_cron (매일 00:30 KST 실행) | 오늘 일자가 입사일의 일(day)과 같고 입사 1주년 미도래 직원에게 vacation_remain.granted += 1. 동시에 notifications에 leave_granted 알림 생성 |
| trg_grant_yearly_leave | pg_cron (매일 00:30 KST 실행) | 오늘 월·일이 입사일과 같고 입사 1주년 이상 직원에게 vacation_remain.granted += 15. 월 부여일과 충돌 시 월 1일 + 연 15일 = 16일 단순 합산. 동시에 leave_granted 알림 생성 |

### RLS Policy로 데이터 잠금

| 테이블 | 정책 | 목적 |
|-------|------|------|
| vacation_requests | UPDATE/DELETE 차단: status IN ('approved','rejected','cancelled')인 경우 | 결재 완료·반려·취소 후 데이터 수정 차단. status는 vacation_requests 자체 컬럼이라 즉시 평가 가능 |
| employee_info_change_requests | UPDATE/DELETE 차단: 연결된 approval_documents.status가 'pending'이 아닌 경우 | 결재 완료/반려/취소 후 데이터 수정 차단 |
| overtime_requests | UPDATE 제한: approval_documents.status='approved' AND actual_input_status='pending'인 경우 actual_start_time/actual_end_time/actual_input_status만 업데이트 허용, 그 외 컬럼은 잠금. approval_documents.status IN ('rejected','cancelled')이거나 actual_input_status='completed'인 경우 모든 컬럼 잠금 | 사전 승인 후 실제 시간 입력은 허용하되 다른 필드 위변조 방지. 완료·반려·취소 후엔 전면 잠금 |

### 결재 취소 처리 정책

| 상황 | 처리 방식 |
|------|---------|
| status enum | approval_documents.status, vacation_requests.status 모두 'cancelled'를 정식 상태로 포함 |
| 승인된 휴가를 취소하고 싶을 때 | approval_documents.status='cancelled'로 변경 → trg_sync_vacation_request_status가 vacation_requests.status도 'cancelled'로 동기화 → 별도 환원 트리거(또는 Server Action)에서 vacation_remain.used 차감 환원 |
| 승인된 야근을 취소하고 싶을 때 | approval_documents.status='cancelled'로 변경. overtime_requests는 잔여 환원 대상이 없으므로 추가 처리 불요 |
| 승인된 인사정보 변경을 취소 | 이미 employees에 반영된 변경은 자동 롤백되지 않음. 새 변경 요청으로 원상 복구 신청 필요 |
| 권한 | 취소 권한은 기안자 본인 또는 admin. 부서장은 취소 권한 없음 (감사 추적성 확보) |

### 비즈니스 규칙 (애플리케이션 책임)

| 규칙 | 검증 위치 |
|------|---------|
| 사번 로그인 흐름 | 프론트엔드에서 사번 입력 → Server Action이 employees 테이블에서 사번 → email 조회 → Supabase Auth에 email + 비밀번호로 로그인. 이메일 직접 입력도 병행 허용 |
| 결재자 자동 지정 | type='leave' AND leave_type IN ('annual','half_am','half_pm') → 신청자 소속 부서의 departments.manager_id. type='leave' AND leave_type='public' → role='admin'인 임직원(인사담당자) 중 한 명. type='overtime' → 부서장. type='info_change' → admin. Server Action에서 자동 세팅 |
| 휴가 신청 시 잔여가 음수가 되면 사유(reason) 필수, 그렇지 않으면 선택 | 프론트엔드 폼 검증 + Server Action (공가는 차감 없으므로 무관) |
| 결재-업무 1:1 동시 생성 | Server Action 트랜잭션 또는 PostgreSQL RPC 함수 |
| approval_documents.type ↔ 연결된 업무 테이블 정합성 | Server Action에서 type별 분기 처리, 결재 처리 함수에서 type 확인 |
| 휴가 기간 겹침 검증 (사전 차단) | 프론트엔드 + Server Action에서 사전 조회 후 안내 (DB EXCLUDE는 최종 안전망) |
| 정규 근무시간(09:00~18:00) | company_settings 테이블의 work_start_time/work_end_time을 SSOT로 사용. 트리거 함수는 본 테이블 값 참조하여 회사 정책 변경 시 코드 수정 없이 반영 가능 |
| 야근 실제 시간 입력 책임 | 사전 승인된 야근 건의 실제 시간 입력은 근무자 본인 책임. 시스템에서 별도 알림이나 강제 입력은 하지 않음 |
| 야근 52시간 **하드 차단** 기준 | **주 경계**: 월요일 00:00 ~ 일요일 23:59 (근로기준법 운용 관행, company_settings.week_start_day='MONDAY'). **합산 대상**: attendance_records.work_hours + overtime_requests의 사전 신청 예상 시간(승인되었거나 대기 중) + 사후 신청 실제 시간 + 휴일·야간 근로 시간 모두 포함 (근로기준법 제53조·제56조). **차단 시점**: ① 사전 신청 제출 시 `trg_enforce_overtime_52h_cap`이 RAISE EXCEPTION ② 사후 신청·실제 시간 입력 시 동일 트리거 ③ 출근 체크인 시 `trg_enforce_attendance_52h_cap`이 RAISE EXCEPTION ④ 결재자 승인 시점도 동일 트리거가 재검증 (결재 승인이 사업주 위반으로 이어질 수 있어 결재자 강제 승인 불가). **Cap-hit 처리**: 한도 초과 시 신청 가능한 종료 시각을 분 단위로 산출해 사용자에게 표시 — "등록 가능한 종료 시각은 21:48까지입니다. 추가 근무는 관리자와 협의가 필요합니다." 형태 |
| 연차 자동 부여 | pg_cron + trg_grant_monthly_leave / trg_grant_yearly_leave 활용. 매월 입사일자에 1일, 입사 1주년부터 매년 입사일자에 15일 부여 (충돌 시 16일 합산). 부여 시 vacation_remain.granted 가산 + notifications 발송 |
| 연차 사용 기한 | 시스템상 사용 기한 없음 (누적 방식). 부여된 연차는 소멸되지 않고 입사 이후 계속 누적. 본 정책은 임의 구현이며 근로기준법 제60조 제7항의 1년 소멸 규정과는 다름 — 회사 자체 정책으로 운용 |
| 휴가 유형별 처리 | annual(연차)=1일 단위 차감, half_am/half_pm(반차)=0.5일 차감 (반드시 단일 일자만 신청 가능), public(공가)=차감 없음 + 관리자 결재 |
| 야근 보상 방식 | 모든 야근은 수당으로 보상 (근로기준법 제56조 기준 통상임금의 50% 가산). 대체휴무는 운영하지 않음 (근로기준법 제57조의 근로자대표 서면 합의 부재). 실제 수당 지급은 외부 급여 시스템에서 처리 |
| 인사정보 변경 허용 필드 | name, phone만 허용. trg_apply_info_change_on_approval에서 화이트리스트 검증. 그 외 필드 변경 시 트리거에서 예외 발생, 결재 승인 자체가 롤백됨 |
