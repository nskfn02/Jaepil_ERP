# 데이터베이스 ERD (Entity-Relationship Diagram)

> **대상**: 사내 ERP — 인증·인사·근태·휴가 모듈
> **대상 DBMS**: PostgreSQL 17 (Supabase)
> **작성일**: 2026-05-30
> **개정일**: 2026-06-03 (근태·결재·휴가·감사·알림 도메인 15개 테이블 반영)

본 문서는 데이터 모델의 구조를 3개 관점(도메인 분류도·전체 ERD·데이터 흐름)으로 시각화하고 핵심 설계 원칙을 정리한다. 테이블·컬럼 상세 명세는 database.md를 단일 출처로 참조한다. 전체 15개 테이블이 6개 도메인(인증·사용자/조직·근태·결재·휴가·인가/시스템)으로 구성되며, **employees가 모든 영역의 중심축**이고 auth.users(인증)와 1:1로 연결된다.

---

## 1. 도메인 분류도

15개 테이블을 6개 영역으로 그룹화하여 전체 윤곽을 보여준다. 거의 모든 관계가 employees로 모인다.

```mermaid
flowchart LR
    subgraph AUTH["인증"]
        AU["auth.users<br/>로그인 자격증명"]
    end
    subgraph ORG["사용자·조직"]
        CC["common_codes<br/>부서·직급 코드"]
        EMP["employees<br/>임직원 (SSOT)"]
    end
    subgraph ATTSG["근태"]
        ATTD["attendances<br/>근태 기록"]
        HOL["holidays<br/>공휴일"]
    end
    subgraph APPRSG["결재"]
        AR["approval_requests<br/>전자결재"]
        AC["attendance_corrections<br/>근태 보정"]
        LR["leave_requests<br/>휴가 신청"]
        NOTI["notifications<br/>알림"]
    end
    subgraph LEAVESG["휴가"]
        LT["leave_types<br/>휴가 종류"]
        LG["leave_grants<br/>연차 적립·소멸"]
        LB["leave_balances<br/>연차 잔액"]
        ATCH["attachments<br/>증빙 첨부"]
    end
    subgraph SYS["인가·시스템"]
        ENS["employee_number_seq<br/>사번 채번"]
        AUD["audit_logs<br/>감사 로그"]
    end

    AU -->|"1:1"| EMP
    CC -->|"부서·직급"| EMP
    ENS -.->|"사번 채번"| EMP
    EMP --> ATTD
    HOL -.->|"소정근로일 기준"| ATTD
    EMP --> AR
    AR --> AC
    AR --> LR
    AC -->|"보정 대상"| ATTD
    LR -->|"휴가 연동"| ATTD
    LT --> LR
    LR -.->|"증빙"| ATCH
    EMP --> LG
    LG --> LB
    AR --> NOTI
    EMP -.->|"행위 기록"| AUD

    style EMP stroke:#0288d1,stroke-width:3px
    style AU stroke:#7b1fa2,stroke-width:2px
    style AR stroke:#ef6c00,stroke-width:2px
    style ENS stroke:#888,stroke-width:1.5px,stroke-dasharray: 5 5
    style HOL stroke:#888,stroke-width:1.5px,stroke-dasharray: 5 5
    style AUD stroke:#888,stroke-width:1.5px,stroke-dasharray: 5 5
```

| 테두리 | 의미 |
|--------|------|
| 파란 굵은 선 (employees) | 모든 영역의 중심축 — 인사·계정·근태·휴가의 단일 진실 공급원(SSOT) |
| 보라 선 (auth.users) | 인증 영역 — Supabase가 관리, employees와 1:1 |
| 주황 선 (approval_requests) | 공통 전자결재 슈퍼타입 — 근태 보정·휴가가 서브타입으로 연결 |
| 회색 점선 (employee_number_seq·holidays·audit_logs) | 직접 FK 없이 함수·판정·기록에 참조되는 보조 테이블 |

---

## 2. 전체 ERD

도메인별로 3개 다이어그램으로 나눠 표기한다. 교차 도메인 FK는 참조 엔티티(핵심 컬럼만)로 연결하며, 컬럼 상세는 database.md를 참조한다.

### 2-1. 인증·인사 코어

```mermaid
erDiagram
    AUTH_USERS ||--|| EMPLOYEES : "1:1 동일 UUID"
    COMMON_CODES ||--o{ EMPLOYEES : "부서 department_code_id"
    COMMON_CODES ||--o{ EMPLOYEES : "직급 position_code_id"
    EMPLOYEES ||--o{ AUDIT_LOGS : "행위자 actor_id"

    AUTH_USERS {
        uuid id PK
        text email
        text encrypted_password
    }
    EMPLOYEES {
        uuid id PK,FK "auth.users.id"
        text employee_number UK
        text email UK
        text name
        uuid department_code_id FK
        uuid position_code_id FK
        date hire_date
        text phone
        text role "ADMIN/MANAGER/USER"
        text employment_status "active/resigned"
        boolean is_active
        boolean must_change_password
        timestamptz resigned_at
        timestamptz created_at
        timestamptz updated_at
    }
    COMMON_CODES {
        uuid id PK
        text code_type "department/position"
        text code "복합UK code_type+code"
        text name
        int sort_order
        timestamptz created_at
        timestamptz updated_at
    }
    EMPLOYEE_NUMBER_SEQ {
        smallint year PK
        int last_number
    }
    AUDIT_LOGS {
        bigint id PK
        uuid actor_id FK
        text action
        text target_type
        uuid target_id
        jsonb detail
        timestamptz created_at
    }
```

> employee_number_seq는 FK 없는 독립 채번 카운터다. audit_logs는 전 도메인의 주요 변경을 기록하는 append-only 테이블로 actor_id로 employees를 참조한다(시스템 자동 변경은 NULL).

### 2-2. 근태·결재

```mermaid
erDiagram
    EMPLOYEES ||--o{ ATTENDANCES : "근태 employee_id"
    EMPLOYEES ||--o{ APPROVAL_REQUESTS : "신청·승인 (requester/approver/decided_by)"
    APPROVAL_REQUESTS ||--|| ATTENDANCE_CORRECTIONS : "보정 서브타입"
    APPROVAL_REQUESTS ||--|| LEAVE_REQUESTS : "휴가 서브타입"
    ATTENDANCES ||--o{ ATTENDANCE_CORRECTIONS : "보정 대상 attendance_id"
    LEAVE_REQUESTS ||--o{ ATTENDANCES : "휴가 연동 leave_request_id"
    APPROVAL_REQUESTS ||--o{ NOTIFICATIONS : "관련 결재"
    EMPLOYEES ||--o{ NOTIFICATIONS : "수신 recipient_id"

    EMPLOYEES {
        uuid id PK
        text employee_number UK
        text role "ADMIN/MANAGER/USER"
        uuid department_code_id FK
    }
    HOLIDAYS {
        uuid id PK
        date holiday_date UK
        text name
        boolean is_substitute
        timestamptz created_at
    }
    ATTENDANCES {
        uuid id PK
        uuid employee_id FK "복합UQ employee_id+work_date"
        date work_date
        timestamptz check_in_at
        timestamptz check_out_at
        text status "present/late/early_leave/late_early_leave/absent/missing_checkout/leave"
        int work_minutes
        text leave_day_type "full/am_half/pm_half"
        uuid leave_request_id FK
        boolean is_closed
        text note
        timestamptz created_at
        timestamptz updated_at
    }
    APPROVAL_REQUESTS {
        uuid id PK
        text request_type "attendance_correction/leave"
        uuid requester_id FK
        uuid approver_id FK
        text status "pending/approved/rejected/cancelled"
        text reason
        uuid decided_by FK
        timestamptz decided_at
        text reject_reason
        timestamptz created_at
        timestamptz updated_at
    }
    ATTENDANCE_CORRECTIONS {
        uuid approval_request_id PK,FK
        uuid attendance_id FK
        timestamptz requested_check_in_at
        timestamptz requested_check_out_at
        text requested_status
    }
    LEAVE_REQUESTS {
        uuid approval_request_id PK,FK
        uuid employee_id FK
        date start_date
        date end_date
    }
    NOTIFICATIONS {
        uuid id PK
        uuid recipient_id FK
        text type "approval_pending/approval_approved/approval_rejected/approval_reassigned"
        uuid approval_request_id FK
        boolean is_read
        timestamptz read_at
        timestamptz created_at
    }
```

> EMPLOYEES·LEAVE_REQUESTS는 참조 엔티티다(전체 컬럼은 2-1·2-3). approval_requests↔employees는 requester_id·approver_id·decided_by 3개 FK이며 다이어그램은 대표 1선으로 표기한다. holidays는 FK 없는 독립 테이블로 근태 자동판정·만근 판정의 소정근로일 산출 기준이다.

### 2-3. 휴가·연차

```mermaid
erDiagram
    APPROVAL_REQUESTS ||--|| LEAVE_REQUESTS : "휴가 서브타입"
    LEAVE_TYPES ||--o{ LEAVE_REQUESTS : "종류 leave_type_id"
    EMPLOYEES ||--o{ LEAVE_REQUESTS : "신청 employee_id"
    LEAVE_REQUESTS |o--o| ATTACHMENTS : "증빙 attachment_id"
    EMPLOYEES ||--o{ LEAVE_GRANTS : "적립 employee_id"
    EMPLOYEES ||--|| LEAVE_BALANCES : "잔액 1:1"
    EMPLOYEES ||--o{ ATTACHMENTS : "업로드 uploaded_by"

    EMPLOYEES {
        uuid id PK
        text employee_number UK
        date hire_date
    }
    APPROVAL_REQUESTS {
        uuid id PK
        text request_type
        text status
    }
    LEAVE_TYPES {
        uuid id PK
        text code UK
        text name
        boolean deducts_annual
        boolean is_paid
        boolean requires_proof
        text proof_guide
        numeric max_days
        text half_day_period "am/pm"
        boolean is_active
        int sort_order
        timestamptz created_at
        timestamptz updated_at
    }
    LEAVE_REQUESTS {
        uuid approval_request_id PK,FK
        uuid employee_id FK
        uuid leave_type_id FK
        date start_date
        date end_date
        numeric deducted_days
        uuid attachment_id FK
    }
    LEAVE_GRANTS {
        uuid id PK
        uuid employee_id FK
        text source "monthly_accrual/annual_accrual/manual"
        numeric granted_days
        numeric used_days
        date effective_date
        date expires_at
        text status "active/exhausted/expired"
        uuid created_by FK
        text note
        timestamptz created_at
        timestamptz updated_at
    }
    LEAVE_BALANCES {
        uuid employee_id PK,FK
        numeric balance
        timestamptz updated_at
    }
    ATTACHMENTS {
        uuid id PK
        text storage_object_path UK
        text file_name
        text mime_type "pdf/jpeg/png"
        int byte_size "최대10MB"
        uuid uploaded_by FK
        date retain_until
        timestamptz created_at
    }
```

> EMPLOYEES·APPROVAL_REQUESTS는 참조 엔티티다(전체 컬럼은 2-1·2-2). leave_requests.attachment_id ↔ attachments는 단방향 1:1(증빙 1건, 역방향 FK 없음 — 순환 제거). leave_balances는 leave_grants 원장의 잔액 요약(역정규화)이다.

---

## 3. 데이터 흐름

### 3-1. 직원 등록

직원 등록 한 번에 인증 계정·인사 프로필·사번·연차 잔액이 함께 생성된다.

```mermaid
flowchart TB
    A["관리자: 직원 등록"]
    B["부서·직급 선택<br/>common_codes 조회"]
    C["사번 채번<br/>employee_number_seq"]
    D["인증 계정 생성<br/>auth.users + 임시 비밀번호"]
    E["직원 레코드 생성<br/>employees (동일 id)"]
    F["연차 잔액 초기화<br/>leave_balances = 0<br/>입사일 기준 적립 스케줄 시작"]

    A --> B --> C --> D --> E --> F

    style E stroke:#0288d1,stroke-width:2px
```

1. 부서·직급을 common_codes에서 선택
2. employee_number_seq로 입사연도 기준 사번 자동 채번 (예: 2026-0001)
3. auth.users에 인증 계정 + 임시 비밀번호 생성
4. 동일 id로 employees 레코드 생성, leave_balances 0 초기화 — 트랜잭션으로 원자 처리

### 3-2. 휴가 신청 → 결재 → 잔액 정산 → 근태 연동

```mermaid
flowchart TB
    LA["본인: 휴가 신청<br/>종류·기간·승인자 지정"]
    LB2["증빙 필요 종류면<br/>attachments 첨부"]
    LC["제출 즉시 잔액 차감<br/>leave_grants FIFO · leave_balances"]
    LD["승인자 결재함<br/>approval_requests (pending)"]
    LE{"결재"}
    LF["승인: 근태 휴가 반영<br/>attendances"]
    LG2["반려·취소: 잔액 복원"]

    LA --> LB2 --> LC --> LD --> LE
    LE -->|"승인"| LF
    LE -->|"반려·취소"| LG2

    style LF stroke:#0288d1,stroke-width:2px
```

> 차감/복원은 트리거 `settle_leave_balance`가 원자 처리(LEAVE-10). 승인 후에도 휴가 시작일 이전이면 취소 가능·잔액 자동 환원(LEAVE-7).

### 3-3. 근태 출퇴근 → 자동판정 · 보정

```mermaid
flowchart TB
    CA["본인: 출근/퇴근 클릭<br/>서버 시각 기록"]
    CB["자동 판정<br/>09:00~18:00·휴게1h·KST<br/>attendances.status"]
    CC["일 마감 (cron)<br/>미출근=결근·미퇴근=퇴근누락"]
    CD["보정 필요 시<br/>보정 요청 (전자결재)"]
    CE["승인 시 원자 반영<br/>attendances 수정"]

    CA --> CB --> CC
    CC -.->|"보정"| CD --> CE

    style CB stroke:#0288d1,stroke-width:2px
```

> 근태 직접 수정은 차단되고 보정은 `attendance_corrections → approval_requests → 승인` 경로로만(ATT-7·9).

### 3-4. 연차 자동 적립 · 소멸 (pg_cron)

```mermaid
flowchart TB
    GA["pg_cron 매일 (KST 보정)"]
    GB["입사 응당일 스캔"]
    GC["만근 판정<br/>소정근로일 - 공휴일·휴가"]
    GD{"만근?"}
    GE["적립<br/>월 1일(최대11) / 연 15일<br/>leave_grants → leave_balances"]
    GF["미부여"]
    GH["만료 grant 소멸<br/>expires_at 경과 → expired<br/>leave_balances 갱신"]

    GA --> GB --> GC --> GD
    GD -->|"만근"| GE
    GD -->|"미달"| GF
    GA --> GH

    style GE stroke:#0288d1,stroke-width:2px
```

> 적립은 각 판정 시점 확정 근태 기준이며 사후 보정을 소급하지 않는다(LEAVE-3·4·5).

---

## 4. 핵심 설계 원칙

| # | 원칙 | 효과 |
|---|------|------|
| 1 | employees를 단일 진실 공급원(SSOT)으로 운용 | 인사·계정·근태·휴가가 employees.id로 일관 식별 |
| 2 | 인증을 auth.users로 위임 (1:1) | 비밀번호·세션을 Supabase가 관리, 애플리케이션 부담 최소화 |
| 3 | 부서·직급을 단일 common_codes로 정규화 | code_type으로 유형 구분, 코드 추가·변경이 employees에 영향 없음 |
| 4 | 재직상태(employment_status)와 계정활성(is_active) 분리 | 일시 비활성(재활성 가능)과 퇴사(비가역)를 구분 |
| 5 | 사번 채번 카운터(employee_number_seq) 분리 | 입사연도별 순번을 원자적으로 발급, 동시 등록 시 사번 충돌 방지 |
| 6 | 전자결재 공통화 (슈퍼타입 approval_requests + 서브타입 attendance_corrections·leave_requests) | 근태 보정·휴가가 단일 결재함·상태흐름 공유, 희소 NULL 제거 |
| 7 | 연차 원장(leave_grants, FIFO 소비) + 잔액 요약(leave_balances) 역정규화 | 발생일·소멸 추적과 O(1) 잔액 조회 양립 |
| 8 | 근태 판정 결과(status·work_minutes) 저장 (역정규화) | 목록·집계·만근 판정 시 재계산 회피 |
| 9 | 3단계 권한(ADMIN>MANAGER>USER) + RLS 부서 스코프 | 부서 관리자는 본인 부서원만, 세트 멤버십으로 조인 없이 평가 |
| 10 | 증빙 접근통제 (신청자·지정 결재자 한정) | 민감정보(진단서 등) 보호 — 전사 관리자도 차단 |
| 11 | KST 판정 + pg_cron 자동화 (일 마감·연차 적립·소멸) | UTC 저장·KST 일경계 판정 일관, 정기 작업 무인 처리 |
