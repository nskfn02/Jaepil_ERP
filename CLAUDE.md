# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 저장소 구성

이 저장소는 두 영역으로 나뉜다:

- `docs/` — 한국어 설계 문서. 코드를 고치기 전에 관련 문서를 먼저 확인할 것.
  - `requirements.md` (요구사항, AUTH/RBAC/ACCT/HR ID 체계) · `features.md` (기능, FEAT-* ID, 요구사항과 매핑) · `database.md` (PostgreSQL 스키마) · `erd.md` · `tech_stack.md` · `wbs.md` · `github.md`
- `front/` — 실제 애플리케이션 (Next.js 16 + React 19). **모든 명령은 `front/`에서 실행한다.**

## 명령어 (`front/`에서 실행)

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드 (타입체크 포함)
npm run start    # 빌드 결과 실행
npm run lint     # eslint (eslint-config-next, flat config)
```

테스트 프레임워크는 없다. 검증은 `npm run build`(타입체크)와 `npm run lint`, 그리고 브라우저 동작 확인으로 한다.

### 환경 변수 (`front/.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — 없으면 Supabase 클라이언트가 런타임에 실패한다.
- `NEXT_PUBLIC_COMPANY_DOMAIN` — 사번→이메일 합성 도메인 (기본 `jaepil.co.kr`).

## 아키텍처 (여러 파일을 함께 봐야 이해되는 부분)

이 앱은 **로그인 기반 사내 ERP(인증·인사 모듈)** 이며, 다음 설계 결정이 코드 전반을 지배한다.

### 1. 전 컴포넌트 클라이언트 렌더 (SSR 미사용)

인증 상태가 오직 클라이언트(`localStorage`)에만 존재하므로 SSR/프리렌더의 이점이 없다. `src/components/providers.tsx`의 `AppProviders`는 `useSyncExternalStore` 기반 mount 판별로 **마운트 완료 후에만** 자식을 렌더하여 SSR 단계에서 `useAuth`가 호출되지 않게 막는다. 거의 모든 파일이 `"use client"`다. **서버 컴포넌트·route handler·서버 데이터 페칭을 추가하지 말 것** — 인증이 그 단계에서 동작하지 않는다.

### 2. 두 개의 API 레이어 (동일 인터페이스)

- `src/lib/api.ts` — **Supabase 백엔드, 현재 활성.** 모든 페이지가 `@/lib/api`에서 import한다.
- `src/lib/mock/` (`api.ts`/`store.ts`/`seed.ts`) — 인메모리+localStorage mock. 동일한 `authApi`/`codeApi`/`employeeApi`/`accountApi` 시그니처를 갖지만 **현재 어디서도 import하지 않는다**(과거 개발용). API 인터페이스를 바꾸면 두 레이어를 함께 맞추되, 실제 동작은 `lib/api.ts`만 사용된다는 점에 유의.

두 레이어 모두 `ApiError(code, message)` 패턴으로 에러를 던지고, snake_case DB row를 camelCase 뷰모델로 변환한다(`toView`/`toCode`). 도메인 타입은 `src/lib/types.ts`에 정의(`Role`, `Employee`, `EmployeeView`, `SessionUser`, `Paginated<T>` 등).

### 3. Supabase 접근 분리: RLS 직접 접근 vs Edge Function

`lib/api.ts`는 두 경로로 백엔드에 접근한다:

- **조회·수정·역할변경·활성토글·퇴사·코드 CRUD** → RLS 하에서 Supabase 클라이언트 직접 접근.
- **`auth.users`를 다루는 작업**(계정 생성, 비밀번호 초기화, 본인 비번 변경) → `admin-ops` **Edge Function**을 `invokeAdmin()`으로 호출(service_role 필요). Edge Function 코드는 이 저장소가 아니라 Supabase에 배포되어 있다.

마지막 관리자 보호, 퇴사 계정 재활성화 차단 등 핵심 불변식은 **DB 트리거/CHECK 제약이 최종 강제**한다(`lib/api.ts`는 UX용 사전 검증만 함). 에러 메시지 문자열 매칭으로 `LAST_ADMIN`/`RESIGNED` 등을 분류하므로 DB 측 메시지를 바꾸면 클라이언트 분기도 확인할 것.

### 4. 인증·세션·라우트 가드

- `src/lib/auth-context.tsx` — `AuthProvider`/`useAuth`. 초기 세션 복원, 활동 추적, 주기적 만료 검사.
- `src/lib/supabase/session-meta.ts` — Supabase 세션과 **별개로** localStorage에 idle(1시간)/absolute(8시간) 타이머를 추적한다(AUTH-3 정책). 활동 이벤트로 `touch()`, 30초마다 `checkExpiry()`.
- `src/lib/rbac.ts` — `NAV_ITEMS`(사이드바), `ROUTE_RULES`/`canAccess()`(경로 가드), `landingFor()`(역할별 기본 랜딩). 역할은 `ADMIN`/`USER`.
- `src/components/layout/app-shell.tsx` — 페이지 셸. 미로그인 시 `/login` 리다이렉트, `mustChangePassword`면 `/me/password`로 강제 이동, `canAccess` 실패 시 `<Forbidden>` 표시. 새 관리자 화면을 추가하면 **`rbac.ts`의 `NAV_ITEMS`와 `ROUTE_RULES` 양쪽**을 갱신해야 한다.

### 5. UI

외부 UI 라이브러리 없이 `src/components/ui/`에 자체 컴포넌트 라이브러리를 두고, 각 컴포넌트마다 **CSS Module**을 짝지운다. Tailwind CSS 4는 preflight(브라우저 정규화)만 사용하고 스타일은 CSS 변수 디자인 토큰으로 한다. 클래스 병합은 `src/lib/utils.ts`의 `cn()`(경량 clsx 대체).

관리자 목록 화면(직원/계정/코드)은 페이지네이션이 아니라 **무한 스크롤**이다. `src/lib/use-infinite-scroll.ts`(IntersectionObserver) + `components/ui/infinite-loader.tsx`로 구현하고, 페이지당 20건씩 누적 로드한다.

## 중요 주의사항

- **Next.js 16은 학습 데이터의 버전과 다르다.** `front/AGENTS.md`(및 `front/CLAUDE.md`가 이를 참조)의 지시대로, Next 관련 코드를 작성하기 전에 `front/node_modules/next/dist/docs/`의 해당 가이드를 읽고 deprecation 경고를 따를 것.
- **React Compiler 활성화** (`next.config.ts`의 `reactCompiler: true` + `babel-plugin-react-compiler`). 수동 메모이제이션을 추가하기 전에 컴파일러가 처리하는지 고려할 것.
- 경로 별칭 `@/*` → `front/src/*` (`tsconfig.json`).
- 기본 브랜치는 `master`, 개발은 `develop`. `develop`에서 작업 후 `master`로 병합한다.
