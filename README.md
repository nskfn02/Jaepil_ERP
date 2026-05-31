# 재필 ERP (Jaepil ERP)

> 사내 ERP의 **인증·인사 모듈** — 관리자 기반 계정 관리, 로그인 인증, 임직원 인사 정보 관리 (MVP)

🔗 **배포 주소** : https://jaepil-erp.vercel.app

## 주요 기능

- **인증** — 사번·비밀번호 로그인, 비활성 계정 거부, 세션 자동 만료(유휴 1시간 / 절대 8시간)
- **인가** — 역할(관리자·일반) 기반 라우트·메뉴 접근 제어, 본인 자원 소유권 검증
- **계정 관리** — 계정 자동 생성, 역할 변경, 활성/비활성 토글, 비밀번호 변경·초기화
- **공통 코드** — 부서·직급 코드 등록/수정/삭제(참조 무결성 보호)
- **직원 관리** — 등록(사번 자동 채번 + 계정 자동 생성), 수정, 퇴사 처리, 목록(무한 스크롤)·검색·상세 조회

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16 (App Router) · React 19 · TypeScript 5 |
| 스타일링 | CSS Modules + 디자인 토큰 (Tailwind CSS 4는 preflight만 사용) |
| 백엔드 | Supabase — PostgreSQL 17 · Auth · RLS · Edge Functions(`admin-ops`) |

## 시작하기

> 모든 명령은 `front/` 디렉터리에서 실행한다. (Node.js 20 이상)

```bash
cd front
npm install
npm run dev     # http://localhost:3000
```

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (타입 체크 포함) |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint 검사 |

### 환경 변수 (`front/.env.local`)

| 변수 | 필수 | 설명 |
|------|:----:|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon(public) 키 |
| `NEXT_PUBLIC_COMPANY_DOMAIN` | ⬜ | 사번 → 이메일 합성 도메인 (기본 `jaepil.co.kr`) |

### 데모 계정

| 역할 | 사번 | 비밀번호 |
|------|------|----------|
| 관리자 | `2025-0001` | `admin123` |
| 일반 | `2026-0001` | `user1234` |

## 프로젝트 구조

```
Jaepil_ERP/
├── docs/      # 설계 문서 (요구사항·기능·DB·ERD·기술스택)
├── front/     # Next.js 애플리케이션
│   └── src/
│       ├── app/          # 페이지 (login, employees, accounts, codes, me)
│       ├── components/   # 레이아웃 · UI 컴포넌트
│       └── lib/          # API · 인증 · RBAC · 도메인 타입
└── CLAUDE.md
```

**핵심 설계**

- 모든 화면은 클라이언트 렌더링 — 인증 상태가 `localStorage`에만 존재하여 SSR을 사용하지 않는다.
- 백엔드 접근 2경로 — 일반 데이터는 RLS 하에서 Supabase 직접 접근, 계정·비밀번호 작업은 `admin-ops` Edge Function 호출.
- `employees`를 단일 진실 공급원(SSOT)으로 두고, 인증은 `auth.users`(1:1)에 위임.

## 관련 문서

`docs/` 폴더의 전체 문서 목록.

| 문서 | 설명 |
|------|------|
| [요구사항 정의서](docs/requirements.md) | 인증·인가·계정·인사 요구사항 (AUTH/RBAC/ACCT/HR) |
| [기능 정의서](docs/features.md) | 기능 명세 (FEAT-*) 및 요구사항 매핑 |
| [데이터베이스 설계서](docs/database.md) | 테이블 명세·무결성 제약·시드 데이터 |
| [ERD](docs/erd.md) | 개체-관계도 및 데이터 흐름 |
| [기술 스택](docs/tech_stack.md) | 아키텍처 및 기술 선정 근거 |
| [파일 구조 명세](docs/file_structure.md) | `front/` 디렉터리·파일별 역할 |
| [작업 분해 구조(WBS)](docs/wbs.md) | 프로젝트 일정·진행 현황 |
| [저장소 연동 정보](docs/github.md) | GitHub 저장소·브랜치 전략 |
| [배포 현황 보고](docs/deploy.md) | 배포 결과·접속 정보 |
| [사용 가이드](docs/use_guide.md) | 배포 환경 워크플로우별 기능 검증 안내 |

## 저장소

기본 브랜치 `master`(배포 기준), 개발 브랜치 `develop` — `develop`에서 개발 후 `master`로 병합한다.
