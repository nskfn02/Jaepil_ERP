# 작업 현황 및 다음 단계 (Next)

> **대상**: 사내 ERP — 인사/근태 관리 모듈
> **작성일**: 2026-05-25
> **타임라인**: 2주 (개발·문서화·발표·보고 포함)

본 문서는 지금까지 진행한 작업과 앞으로 진행해야 할 작업을 정리합니다.

---

## 1. 완료된 작업

### 1.1 문서 작성 (7개)

| 문서 | 상태 | 핵심 내용 |
|------|------|---------|
| `requirements.md` | ✅ 확정 | 요구사항 분석서 — 26 REQ (HR 2 + AT 8 + OT 8 + CM 8) + 개발 우선순위 1~5차 |
| `features.md` | ✅ 확정 | 기능 정의서 — 37 FEAT, 모든 REQ 100% 커버 |
| `database.md` | ✅ 확정 | DB 설계서 — 10 테이블 + 9 트리거 + RLS Policy + 무결성 제약 |
| `tech_stack.md` | ✅ 확정 | Next.js 16 + TypeScript + Supabase(PG 17) + Vercel + Tailwind CSS |
| `github.md` | ✅ 확정 | 저장소·브랜치 전략·커밋 규칙·PR 정책 |
| `erd.md` | ✅ 확정 | ERD 시각화 — 도메인 분류도 + 전체 ERD + 결재 허브 흐름도 (Mermaid 3 다이어그램) |
| `design.md` | ✅ Phase 6 완료 | 디자인 시스템 — Phase 1~6 완료 (Atoms 17 / Molecules 15 / Organisms 15 / Templates 5 / Pages 11) |

### 1.2 Figma 디자인 시스템

**파일**: [Jaepil ERP — Design System](https://www.figma.com/design/oe5ywfbN8WWVutzhB0n0HW) (Professional Plan)

| 페이지 | 작업 항목 | 완료 / 목표 |
|------|--------|------|
| 1. Foundation | Color Variables | 40 / **50** (Chart 8 + Skeleton 2 추가 필요) |
| 1. Foundation | Spacing Variables | 10개 |
| 1. Foundation | Radius Variables | 7개 |
| 1. Foundation | Layout Variables | 11개 |
| 1. Foundation | Opacity Variables | 0 / **5** (Hover·Focus·Dragged·Scrim·Disabled — 신규) |
| 1. Foundation | Border Width Variables | 0 / **4** (Thin·Medium·Thick·X-Thick — 신규) |
| 1. Foundation | Z-Index Variables | 0 / **9** (base~tooltip — 신규) |
| 1. Foundation | Motion Duration Variables | 0 / **12** (Short 1~4·Medium 1~4·Long 1~2·X-Long 1~2 — 신규) |
| 1. Foundation | Motion Easing Variables | 0 / **6** (Standard / Emphasized·Linear — 신규) |
| 1. Foundation | Elevation Effect Styles | 6개 (Level 0~5) |
| 1. Foundation | Typography Text Styles | 21 / **21** (Tracking 보강 필요 — 기존 스타일 수정) |
| 1. Foundation | **Atoms** | **17개** (Group 1~4) |
| 2. Components | **Molecules** | **15개** (Group 1~3) |
| 2. Components | **Organisms** | **15개** (Group 1~3) |
| 2. Components | **Templates** | **5개** |
| 3. Pages (Mock UI) | **Pages** | **11 / 11개** (Group 1·2·3 완료) |

### 1.3 Phase 진행 현황

| Phase | 단계 | 상태 |
|-------|------|------|
| Phase 1 | 디자인 토큰 | 🔄 문서 100% 완료 / Figma Variables 보강 진행 중 (Color 8·Skeleton 2·Opacity 5·BorderWidth 4·Z-Index 9·Motion Duration 12·Motion Easing 6 = 신규 46개 등록 + Typography Tracking 21개 보정 필요) |
| Phase 2 | Atoms (17개) | ✅ 완료 |
| Phase 3 | Molecules (15개) | ✅ 완료 |
| Phase 4 | Organisms (15개) | ✅ 완료 |
| Phase 5 | Templates (5개) | ✅ 완료 |
| Phase 6 | Pages Mock UI (11개) | ✅ 완료 — 11/11 (100%) |
| Phase 7 | Figma 인터랙티브 프로토타입 | ✅ 완료 (PC 전용, 모바일·태블릿 미지원) |
| Phase 8 | 상사 컨펌 + 수정 반영 | 🔄 즉시 진행 |

---

## 2. 즉시 진행 — Phase 8 (상사 컨펌)

Phase 6·7 모두 **2026-05-25 완료**.
- Phase 6: 11/11 페이지 Mock UI 완성 (Group 2의 4개 페이지 풀빌드 보완 포함)
- Phase 7: 데스크탑 프로토타입 — **101개 reactions** + **6개 Flow Starting Points** 설정 완료

곧바로 Phase 8 (상사 컨펌)으로 이어 진행합니다.

---

## 3. 단기 작업 (Phase 7~8)

### 3.1 Phase 7 — Figma 인터랙티브 프로토타입 (✅ 데스크탑 완료)

| 작업 | 상태 | 비고 |
|------|------|------|
| 페이지 간 클릭 연결 (Sidebar) | ✅ | 11개 페이지 사이드바 메뉴 → 해당 페이지 (대시보드·내 인사정보·출퇴근·휴가·야근 신청·야근 리포트·결재함) |
| Header 로고 + 알림벨 클릭 | ✅ | 로고 → 대시보드 / 알림벨 → 결재함 |
| 핵심 흐름 1 — 휴가 결재 | ✅ | 대시보드 → 휴가 → 결재 상신 → 결재함(승인자) → 승인 |
| 핵심 흐름 2 — 야근 결재 | ✅ | 대시보드 → 야근 신청 → 결재 상신 → 결재함 |
| 핵심 흐름 3 — 인사변경 결재 | ✅ | 내 인사정보 → 변경 요청 → 결재 상신 → 결재함 |
| Flow Starting Points | ✅ | 6개 등록 (Login / Dashboard / 휴가 결재 / 야근 결재 / 결재함 / 야근 리포트) |
| 페이지 구조 평탄화 | ✅ | Group 프레임/Section 제거 — 모든 11개 페이지 프레임을 페이지 최상위로 이동 (Figma 프로토타입 navigation 요건) |

### 3.2 Phase 8 — 상사 컨펌

| 작업 | 내용 |
|------|------|
| 발표 자료 정리 | erd.md + design.md를 Notion에 임베드 |
| Figma 시연 | 프로토타입 클릭 데모 + 디자인 시스템 카탈로그 |
| 피드백 수집 | 디자인·UX·구조 측면 의견 수렴 |
| 수정 반영 | 1~2 이터레이션 후 확정 |

---

## 4. 중기 작업 (상사 요청 미완료 + 코드 구현 준비)

### 4.1 상사 가이드라인 미완료 항목

| 작업 | 상태 | 비고 |
|------|------|------|
| Vercel 배포 | ⏳ 미시작 | 도메인 + Vercel 프로젝트 생성 + Supabase 연결 환경변수 |
| Supabase 프로젝트 생성 | ⏳ 미시작 | database.md 스키마 SQL 마이그레이션 |
| DB 접근 가이드 | ⏳ 미시작 | Supabase URL·anon key 공유 + 접속 방법 명세 |
| 요구사항 Notion DB 변환 | ⏳ 미시작 | requirements.md를 Notion Database (필터·정렬 가능) 형식으로 |
| WBS 작성 | ⏳ 미시작 | 1차~5차 작업 분해 + 담당자·일정·완료 기준 |
| Notion 페이지 정리 | 🔄 일부 | erd.md·design.md 임베드 / 모든 문서 한 곳 정리 |

### 4.2 코드 구현 준비

| 작업 | 산출물 |
|------|------|
| Next.js 16 프로젝트 init | `npx create-next-app@latest` |
| Tailwind config 적용 | design.md 부록 A 코드 복사 |
| shadcn/ui 설정 | `npx shadcn@latest init` + 17 Atoms 매핑 |
| Supabase 스키마 적용 | database.md 명세 → SQL 마이그레이션 |
| 환경변수 설정 | `.env.local` (Supabase URL/anon key) + Vercel 환경변수 |
| 폰트 로드 | Noto Sans KR Google Fonts 또는 Pretendard CDN |

---

## 5. 장기 작업 (개발 1~5차)

본 코드 구현은 디자인 컨펌 후 시작.

### 5.1 1차 — 인증·권한·인프라 (Foundation)

| 작업 | FEAT |
|------|------|
| Supabase Auth 세션 기반 로그인 | FEAT-CM-01·02·03 |
| 사번 → 이메일 매핑 로직 | FEAT-CM-01 |
| RLS Policy 설정 | FEAT-CM-04 |
| 반응형 레이아웃 (AppLayout) | FEAT-CM-11 |
| 본인 인사정보 조회 | FEAT-HR-01 |

### 5.2 2차 — 결재 시스템 (Approval Infrastructure)

| 작업 | FEAT |
|------|------|
| 결재 기안 폼 | FEAT-CM-05 |
| 결재 승인·반려 | FEAT-CM-06·07 |
| 결재함 (탭별 조회) | FEAT-CM-08 |
| 인앱 알림 (벨 + 드롭다운) | FEAT-CM-09·10 |
| 결재자 자동 지정 로직 | (database.md 비즈니스 규칙) |

### 5.3 3차 — 근태·휴가 (Attendance & Leave)

| 작업 | FEAT |
|------|------|
| 출근/퇴근 체크인 | FEAT-AT-01·02 |
| 일별·월별 조회 | FEAT-AT-03·04 |
| 휴가 신청 폼 | FEAT-AT-07 |
| 휴가 결재 승인 시 차감 트리거 | FEAT-AT-08 |
| 잔여 연차 위젯 | FEAT-AT-09 |
| 휴가 이력 조회 | FEAT-AT-10 |
| 부서 휴가 캘린더 | FEAT-AT-11 |
| 연차 자동 부여 (pg_cron) | FEAT-AT-12·13 |

### 5.4 4차 — 초과근무 (Overtime)

| 작업 | FEAT |
|------|------|
| 야근 사전/사후 신청 | FEAT-OT-01·02 |
| 야근 신청 결재 | FEAT-OT-03 |
| 주 52시간 한도 **강제 차단 트리거** (trg_enforce_overtime_52h_cap + trg_enforce_attendance_52h_cap) | FEAT-OT-04 |
| 사전 검증 RPC (validate_weekly_hours) + 클라이언트 Submit 버튼 disabled 로직 | FEAT-OT-04 |
| Cap-hit 종료 시각 안내 메시지 컴포넌트 | FEAT-OT-04 |
| 야근 시간 집계 트리거 | FEAT-OT-05 |
| 야근 누적 위젯 | FEAT-OT-06 |
| 실제 시간 입력 | FEAT-OT-09 |

### 5.5 5차 — 부가 기능·리포트 (Supplementary)

| 작업 | FEAT |
|------|------|
| 인사정보 변경 요청 + 자동 반영 트리거 | FEAT-HR-02·03·04 |
| 부서 출퇴근 현황 조회 | FEAT-AT-05 |
| 지각/조퇴 색상 표시 | FEAT-AT-06 |
| 부서별·전사 야근 리포트 | FEAT-OT-07·08 |

---

## 6. 작업 우선순위 요약

| 우선순위 | 작업 | 예상 소요 |
|------|------|------|
| **1순위** (이번 주) | Phase 8 상사 컨펌 + 피드백 수정 반영 | 1~2일 |
| **2순위** (이번 주) | Supabase 프로젝트 + DB 스키마 적용 + Vercel 초기 배포 | 1~2일 |
| **3순위** (다음 주) | Notion 정리 + WBS + Vercel 배포 | 2일 |
| **4순위** (다음 주) | 디자인 토큰 확장 (Opacity/Border/Z-Index/Motion) | 1일 |
| **5순위** (다음 주) | 1차~5차 코드 구현 (디자인 컨펌 후 우선순위 단계별로) | 잔여 일정 |

---

## 7. 통계 요약

| 지표 | 수치 |
|------|------|
| 작성 문서 | 7개 (next.md 포함 시 8개) |
| design.md 분량 | ~1650+ 줄 |
| Figma Variables (현재) | 68개 |
| Figma Variables (목표 — 보강 후) | 114개 (+46: Color 8·Skeleton 2·Opacity 5·BorderWidth 4·Z-Index 9·MotionDuration 12·MotionEasing 6) |
| Figma Effect Styles | 6개 |
| Figma Text Styles | 21개 (Tracking 보정 적용 필요) |
| Atoms | 17개 |
| Molecules | 15개 |
| Organisms | 15개 |
| Templates | 5개 |
| Pages Mock UI | 11 / 11개 (100%) |
| **합계 컴포넌트** | **63 / 63개 (100%)** |
| Figma 프로토타입 Reactions | 101개 |
| Figma Flow Starting Points | 6개 |
