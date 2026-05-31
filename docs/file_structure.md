# 파일 구조 명세 (front)

> **대상**: 사내 ERP 프론트엔드 (`front/`)
> **스택**: Next.js 16 (App Router) · React 19 · TypeScript 5 · CSS Modules · Supabase

폴더·파일별 역할을 우측 주석으로 정리한다. `node_modules/`, `.next/`(빌드 산출물) 등 자동 생성 디렉터리는 제외한다.

**공통 규칙**

- 각 화면(`app/**/page.tsx`)과 UI 컴포넌트는 `이름.tsx`(로직)와 `이름.module.css`(전용 스타일)를 한 쌍으로 둔다. 아래 트리에서 UI 컴포넌트는 `.tsx`만 표기하며, 동명의 `.module.css`가 짝으로 존재한다.
- 경로 별칭 `@/*` → `src/*`.
- 거의 모든 컴포넌트가 `"use client"`(클라이언트 렌더링).

---

## 디렉터리 트리

```text
front/
├── public/                        — 정적 에셋 (create-next-app 기본 SVG)
│   ├── file.svg / globe.svg / next.svg / vercel.svg / window.svg
│
├── src/
│   ├── app/                       — App Router: 라우트·페이지·전역 스타일
│   │   ├── layout.tsx             — 루트 레이아웃 (html/body, AppProviders 주입, 메타데이터)
│   │   ├── page.tsx               — 루트(/) : 로그인 여부에 따라 역할별 랜딩으로 리다이렉트
│   │   ├── globals.css            — 전역 스타일 + Tailwind preflight + 디자인 토큰(CSS 변수)
│   │   ├── home.module.css        — 루트 페이지 스타일(스피너 중앙 정렬)
│   │   ├── favicon.ico            — 파비콘
│   │   │
│   │   ├── login/                 — 로그인
│   │   │   └── page.tsx           — 사번·비밀번호 인증, 세션 만료 안내, 데모 계정 표기
│   │   │
│   │   ├── employees/             — 직원 관리 (관리자)
│   │   │   ├── page.tsx           — 직원 목록 : 검색·부서/재직 필터·무한 스크롤
│   │   │   ├── employees.module.css     — 목록 화면 스타일
│   │   │   ├── employee-form.module.css — 등록/수정 폼 공용 스타일
│   │   │   ├── new/
│   │   │   │   └── page.tsx       — 직원 등록 (사번 자동 채번 + 계정 자동 생성)
│   │   │   └── [id]/              — 특정 직원 (동적 경로)
│   │   │       ├── page.tsx       — 직원 상세 (인사정보 + 계정·퇴사 관리 탭)
│   │   │       ├── detail.module.css     — 상세 화면 스타일
│   │   │       └── edit/
│   │   │           └── page.tsx   — 직원 정보 수정 (사번 불변)
│   │   │
│   │   ├── accounts/              — 계정 관리 (관리자)
│   │   │   └── page.tsx           — 역할 변경·활성/비활성 토글·비밀번호 초기화
│   │   │
│   │   ├── codes/                 — 공통 코드 관리 (관리자)
│   │   │   └── page.tsx           — 부서/직급 코드 등록·수정·삭제
│   │   │
│   │   └── me/                    — 내 정보 (본인)
│   │       ├── page.tsx           — 내 인사정보 조회 (읽기 전용)
│   │       └── password/
│   │           └── page.tsx       — 비밀번호 변경 (임시 비밀번호 변경 강제 포함)
│   │
│   ├── components/
│   │   ├── providers.tsx          — AppProviders : 마운트 후 렌더 + Auth·Toast Provider 합성
│   │   │
│   │   ├── layout/                — 앱 셸 구성 요소
│   │   │   ├── app-shell.tsx      — 인증 가드(미로그인/비번변경 리다이렉트) + 사이드바·탑바 셸
│   │   │   ├── sidebar.tsx        — 좌측 네비게이션 (역할별 메뉴 노출)
│   │   │   ├── topbar.tsx         — 상단 바 (페이지 제목·사용자·로그아웃)
│   │   │   └── forbidden.tsx      — 권한 부족(403) 접근 거부 화면
│   │   │
│   │   └── ui/                    — 자체 UI 컴포넌트 라이브러리 (각 .tsx + .module.css 한 쌍)
│   │       ├── alert.tsx          — 인라인 알림 박스 (info/error 등)
│   │       ├── avatar.tsx         — 이름 이니셜 아바타
│   │       ├── badge.tsx          — 상태 배지 (재직/퇴사 등)
│   │       ├── breadcrumb.tsx     — 현재 위치 경로 표시
│   │       ├── button.tsx         — 버튼 (variant·fullWidth·loading)
│   │       ├── card.tsx           — 카드 컨테이너
│   │       ├── checkbox.tsx       — 체크박스
│   │       ├── confirm-dialog.tsx — 확인 다이얼로그 (예/아니오)
│   │       ├── credential-box.tsx — 생성된 사번·임시 비밀번호 표시·복사
│   │       ├── date-picker.tsx    — 날짜 선택 입력
│   │       ├── dropdown-menu.tsx  — 행 액션 드롭다운 메뉴
│   │       ├── empty-state.tsx    — 빈 목록 안내
│   │       ├── form-field.tsx     — 라벨+입력 래퍼 (에러 메시지)
│   │       ├── icon.tsx           — SVG 아이콘 세트
│   │       ├── infinite-loader.tsx— 무한 스크롤 sentinel + 로딩/종료 표시
│   │       ├── info-row.tsx       — 라벨-값 한 줄 표시 (상세/내 정보)
│   │       ├── input.tsx          — 텍스트 입력
│   │       ├── label.tsx          — 폼 라벨
│   │       ├── modal.tsx          — 모달 다이얼로그
│   │       ├── page-header.tsx    — 페이지 제목+설명+액션 영역
│   │       ├── password-input.tsx — 비밀번호 입력 (표시 토글)
│   │       ├── radio.tsx          — 라디오 버튼
│   │       ├── search-input.tsx   — 검색 입력 (아이콘 포함)
│   │       ├── select.tsx         — 셀렉트 박스
│   │       ├── skeleton.tsx       — 로딩 스켈레톤
│   │       ├── spinner.tsx        — 로딩 스피너
│   │       ├── switch.tsx         — 토글 스위치 (활성/비활성)
│   │       ├── table.tsx          — 테이블 (Table/THead/TBody/TR/TH/TD)
│   │       ├── tabs.tsx           — 탭 전환
│   │       ├── textarea.tsx       — 멀티라인 입력
│   │       └── toast.tsx          — 토스트 알림 + ToastViewport
│   │
│   └── lib/                       — 도메인 로직·상태·유틸 (UI 비의존)
│       ├── api.ts                 — Supabase 백엔드 API (auth/code/employee/account, 활성)
│       ├── types.ts               — 도메인 타입 (Role·Employee·SessionUser·Paginated 등)
│       ├── auth-context.tsx       — 인증 컨텍스트 (세션 복원·활동 추적·만료 검사)
│       ├── toast-context.tsx      — 토스트 컨텍스트 (전역 알림 발행)
│       ├── rbac.ts                — 네비게이션 메뉴·라우트 가드·역할별 랜딩
│       ├── utils.ts               — 유틸 (cn·사번 포맷·임시 비번 생성·연락처 검증 등)
│       ├── use-infinite-scroll.ts — 무한 스크롤 훅 (IntersectionObserver)
│       │
│       ├── supabase/
│       │   ├── client.ts          — 브라우저용 Supabase 클라이언트 + 사번→이메일 합성
│       │   └── session-meta.ts    — 세션 정책 메타 (idle 1h / absolute 8h 추적)
│       │
│       └── mock/                  — 인메모리 Mock API (개발용, 현재 미사용)
│           ├── api.ts             — api.ts와 동일 인터페이스의 Mock 구현
│           ├── store.ts           — 인메모리 + localStorage 저장소
│           └── seed.ts            — 시드 데이터 (부서·직급·직원·자격증명)
│
├── AGENTS.md                      — AI 에이전트 규칙 (Next.js 16 주의사항)
├── CLAUDE.md                      — Claude Code 가이드 (AGENTS.md 참조)
├── README.md                      — create-next-app 기본 안내
│
├── package.json                   — 의존성·스크립트 (dev/build/start/lint)
├── package-lock.json              — 의존성 잠금
├── tsconfig.json                  — TypeScript 설정 (strict, @/* 별칭)
├── tsconfig.tsbuildinfo           — TS 증분 빌드 캐시 (자동 생성)
├── next.config.ts                 — Next.js 설정 (React Compiler 활성화)
├── next-env.d.ts                  — Next.js 타입 선언 (자동 생성)
├── eslint.config.mjs              — ESLint 설정 (eslint-config-next, flat config)
└── postcss.config.mjs             — PostCSS 설정 (Tailwind CSS 4)
```

---

## 영역별 요약

| 영역 | 경로 | 역할 |
|------|------|------|
| 라우트·페이지 | `src/app/` | 화면 단위 (로그인·직원·계정·코드·내 정보) + 전역 스타일 |
| 레이아웃 | `src/components/layout/` | 인증 가드·사이드바·탑바·접근 거부 등 앱 셸 |
| UI 컴포넌트 | `src/components/ui/` | 외부 의존 없는 자체 디자인 시스템 (컴포넌트당 .tsx + .module.css) |
| 도메인 로직 | `src/lib/` | API·타입·인증/토스트 컨텍스트·RBAC·유틸·훅 |
| 백엔드 연동 | `src/lib/supabase/` | Supabase 클라이언트·세션 정책 |
| Mock | `src/lib/mock/` | 개발용 인메모리 API (현재 화면에서 미사용) |
| 설정 | `front/*.{ts,mjs,json}` | 빌드·타입·린트·스타일 도구 설정 |
