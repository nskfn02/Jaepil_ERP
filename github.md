# GitHub 연동 정보 (GitHub Integration)

> **대상**: 사내 ERP — 인사/근태 관리 모듈
> **작성일**: 2026-05-24

---

## 저장소 정보

| 항목 | 값 |
|------|------|
| 저장소 URL | https://github.com/nskfn02/Jaepil_ERP |
| 기본 브랜치 | master |
| 가시성 | Public |
| 라이선스 | 공개 |

---

## 브랜치 전략

| 브랜치 | 역할 | 비고 |
|--------|------|------|
| master | 운영 배포 브랜치 | Vercel Production 자동 배포 |
| develop | 통합 개발 브랜치 | Vercel Preview 자동 배포 |
| feature/{영역}-{기능ID} | 기능 단위 작업 브랜치 | 예: feature/HR-FEAT-HR-01 |
| hotfix/{이슈ID} | 운영 긴급 수정 | master에서 분기 후 PR로 병합 |

---

## 커밋 메시지 규칙 (Conventional Commits)

| 타입 | 용도 | 예시 |
|------|------|------|
| feat | 새 기능 추가 | feat(HR): 인사 기본정보 조회 화면 구현 (FEAT-HR-01) |
| fix | 버그 수정 | fix(AT): 휴가 잔여 차감 누락 수정 |
| refactor | 리팩토링 (동작 변경 없음) | refactor(PY): 급여 산출 로직 분리 |
| chore | 빌드/설정/의존성 변경 | chore: Supabase CLI v1.x 업그레이드 |
| docs | 문서 변경 | docs: requirements.md 의사결정 반영 |
| test | 테스트 추가/수정 | test(OT): 52시간 한도 강제 차단 트리거 단위 테스트 (RAISE EXCEPTION 검증) |

---

## PR (Pull Request) 규칙

| 항목 | 내용 |
|------|------|
| 진행 방식 | 작업 브랜치에서 develop으로 PR 생성 후 바로 merge |
| Merge 커밋 메시지 형식 | {작업 브랜치명}에서 {완료한 작업}을 완료하고 merge |
| 예시 1 | feature/HR-FEAT-HR-01에서 인사 기본정보 조회 화면 구현을 완료하고 merge |
| 예시 2 | feature/AT-FEAT-AT-01에서 출근 체크인 기능을 완료하고 merge |
| 예시 3 | hotfix/login-session에서 세션 만료 버그 수정을 완료하고 merge |

---

## CI/CD 연동

| 단계 | 트리거 | 동작 |
|------|--------|------|
| Preview 배포 | develop 또는 PR 브랜치 push | Vercel이 미리보기 URL 자동 생성 |
| Production 배포 | master push | Vercel이 운영 환경 자동 배포 |
| DB 마이그레이션 | Supabase CLI 수동 실행 | supabase db push로 운영 DB 반영 |
| 환경 변수 | Vercel·Supabase Dashboard 관리 | .env는 저장소에 커밋 금지 |
