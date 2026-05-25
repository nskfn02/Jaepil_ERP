# 디자인 시스템 (Atomic Design)

> **대상**: 사내 ERP — 인사/근태 관리 모듈
> **작성일**: 2026-05-25
> **방법론**: Atomic Design (Brad Frost) + Material Design 3 (Google)

본 문서는 디자인 토큰(Phase 1)부터 Pages(Phase 6)까지 단계별로 채워나갑니다. 현재 Phase 1만 정의된 상태이며, 이후 단계는 진행 시 추가됩니다.

---

## 개요

### 의사결정 요약

| 항목 | 결정 |
|------|------|
| 컴포넌트 라이브러리 | shadcn/ui + Tailwind CSS |
| 디자인 도구 | Figma + Figma MCP |
| 컬러 시스템 | Material Design 3 (Source Color: Google Blue `#0061A4`) |
| 다크 모드 | 라이트 only |
| 한국어 폰트 | Noto Sans KR |
| 페이지 폭 | Max 1280px / 12 Column Grid |
| 반응형 대응 | PC 전용 (1280px 이상). 모바일·태블릿 미지원. PC 모니터 해상도별 fluid 레이아웃 |
| 진행 방식 | Atomic Design 단계별 + Figma 프로토타입 컨펌 |

### 디자인 원칙

| 원칙 | 적용 |
|------|------|
| 명료성 (Clarity) | 라벨·아이콘·여백을 통해 한눈에 이해 가능 |
| 일관성 (Consistency) | 토큰 기반 — 모든 화면이 같은 컬러·간격·타이포 |
| 효율성 (Efficiency) | 결재·근태 등 반복 작업의 클릭 수 최소화 |
| 신뢰성 (Trust) | Material 3의 차분한 블루 톤으로 비즈니스 신뢰감 |
| 적응성 (Adaptive) | PC 모니터 해상도(1280~4K+)에서 fluid하게 콘텐츠 영역이 확장. 최대 콘텐츠 폭 1280px |

---

## Phase 1 — 디자인 토큰

### 1. 컬러 시스템

#### 1.1 Primary 계열 (Material 3, Source Color `#0061A4`)

| 토큰 | Hex | 사용처 |
|------|------|--------|
| Primary | `#0061A4` | 주요 버튼·링크·강조 요소 |
| On Primary | `#FFFFFF` | Primary 위 텍스트·아이콘 |
| Primary Container | `#D1E4FF` | Primary 약한 강조 (선택된 항목 배경) |
| On Primary Container | `#001D36` | Primary Container 위 텍스트 |

#### 1.2 Secondary 계열

| 토큰 | Hex | 사용처 |
|------|------|--------|
| Secondary | `#535F70` | 보조 버튼·태그 |
| On Secondary | `#FFFFFF` | Secondary 위 텍스트 |
| Secondary Container | `#D7E3F7` | 보조 강조 배경 |
| On Secondary Container | `#101C2B` | Secondary Container 위 텍스트 |

#### 1.3 Tertiary 계열

| 토큰 | Hex | 사용처 |
|------|------|--------|
| Tertiary | `#6B5778` | 액센트·구분 컴포넌트 |
| On Tertiary | `#FFFFFF` | Tertiary 위 텍스트 |
| Tertiary Container | `#F3DAFF` | Tertiary 약한 강조 배경 |
| On Tertiary Container | `#251431` | Tertiary Container 위 텍스트 |

#### 1.4 Error / 결재 상태

| 토큰 | Hex | 사용처 |
|------|------|--------|
| Error | `#BA1A1A` | 에러 메시지·반려 상태 |
| On Error | `#FFFFFF` | Error 위 텍스트 |
| Error Container | `#FFDAD6` | 반려 상태 배경 |
| On Error Container | `#410002` | Error Container 위 텍스트 |

#### 1.5 Surface / Background (배경)

| 토큰 | Hex | 사용처 |
|------|------|--------|
| Background | `#FDFCFF` | 페이지 전체 배경 |
| On Background | `#1A1C1E` | 본문 텍스트 |
| Surface | `#FDFCFF` | 카드·다이얼로그 배경 |
| On Surface | `#1A1C1E` | Surface 위 텍스트 |
| Surface Variant | `#DFE2EB` | 보조 배경 (구분 영역) |
| On Surface Variant | `#43474E` | Surface Variant 위 텍스트 |
| Outline | `#73777F` | Border·구분선 |
| Outline Variant | `#C3C7CF` | 약한 구분선 |
| Inverse Surface | `#2F3033` | Snackbar·Toast 배경 (반전 톤) |
| Inverse On Surface | `#F1F0F4` | Inverse Surface 위 텍스트 |
| Inverse Primary | `#9FCAFF` | Inverse Surface 위 강조 액션, Dark 배경 Focus Ring |
| Scrim | `#000000` (opacity 32%) | Modal·Drawer·Bottom Sheet 배경 dim |

#### 1.6 Semantic (Material 3 확장 — 상태 표시)

WCAG AA 대비비(4.5:1) 충족하도록 보정된 컬러 세트. 검증 결과는 §7.5 참조.

| 토큰 | Hex | 사용처 (결재 상태 매핑) |
|------|------|--------|
| Success | `#2E7D32` | 승인 (approved) |
| On Success | `#FFFFFF` | Success 위 텍스트 |
| Success Container | `#C8E6C9` | 승인 배경 |
| On Success Container | `#1B5E20` | Success Container 위 텍스트 |
| Warning | `#ED6C02` | 대기 (pending), 52시간 임박 (40~52h 잔여 시간 표시) |
| On Warning | `#1F1300` | Warning 위 텍스트 (대비비 확보를 위해 어두운 갈색) |
| Warning Container | `#FFE0B2` | 대기 배경 |
| On Warning Container | `#5D3E00` | Warning Container 위 텍스트 |
| Info | `#01579B` | 정보 알림 (대비비 강화를 위해 진한 톤) |
| On Info | `#FFFFFF` | Info 위 텍스트 |
| Info Container | `#B3E5FC` | 정보 배경 |
| On Info Container | `#01579B` | Info Container 위 텍스트 |

#### 1.7 결재·근태 상태별 컬러 매핑

| 상태 | 컬러 토큰 |
|------|--------|
| pending (대기) | Warning |
| approved (승인) | Success |
| rejected (반려) | Error |
| cancelled (취소) | Outline (Neutral) |
| 지각 (is_late) | Warning |
| 조퇴 (is_early_leave) | Warning |
| 주 52시간 임박 (40~52h) | Warning |
| 주 52시간 한도 도달 (=52h, 시스템 차단) | Error |

#### 1.8 Chart 카테고리 팔레트

차트(Bar / Line / Pie)의 카테고리 구분용 시퀀스 컬러. Recharts·Chart.js 등의 라이브러리 기본 팔레트 대신 본 토큰을 사용. 색약(남성 약 8%, 여성 약 0.5%) 사용자 가독성을 위해 명도·색상이 모두 달라지도록 선택.

| 토큰 | Hex | 비고 |
|------|------|------|
| Chart 1 | `#0061A4` | Primary (메인 데이터) |
| Chart 2 | `#6B5778` | Tertiary |
| Chart 3 | `#2E7D32` | Success |
| Chart 4 | `#ED6C02` | Warning |
| Chart 5 | `#9C27B0` | 보라 — 보조 시리즈 |
| Chart 6 | `#0288D1` | 청록 — 보조 시리즈 |
| Chart 7 | `#C2185B` | 자홍 — 보조 시리즈 |
| Chart 8 | `#5D4037` | 갈색 — 보조 시리즈 |

> 9개 이상 카테고리는 시각 인지 한계 초과 → 디자인 단계에서 그룹화 또는 "기타" 처리. 사용 예: FEAT-OT-07/08 부서별 야근 추이 Bar Chart.

#### 1.9 Skeleton (로딩 자리 표시자)

데이터 fetch 중 컨텐츠 자리에 노출하는 회색 블록. shimmer 애니메이션과 결합 (§8.3 참조).

| 토큰 | Hex | 사용처 |
|------|------|--------|
| Skeleton Base | `#E4E6EB` | 자리 표시자 기본 배경 |
| Skeleton Highlight | `#F2F4F7` | shimmer 하이라이트 이동 컬러 |

> 사용 예: 결재함 첫 로딩·대시보드 위젯·테이블 행 자리 표시.

---

### 2. 타이포그래피

#### 2.1 폰트 패밀리

| 종류 | 폰트 |
|------|------|
| 기본 (한글·영문 통합) | **Noto Sans KR** |
| 모노스페이스 (사번·코드 표시) | Roboto Mono |
| Weight 사용 범위 | 400 (Regular), 500 (Medium), 700 (Bold) |

#### 2.2 Type Scale (Material 3)

PC 전용 단일 스케일. 모든 모니터 해상도에서 동일 크기 적용.

| 토큰 | font-size / line-height | Weight | 사용처 |
|------|------|------|--------|
| Headline Large | 32 / 40 | 700 | 페이지 메인 타이틀 |
| Headline Medium | 28 / 36 | 700 | 섹션 제목 |
| Headline Small | 24 / 32 | 700 | 카드 헤더 |
| Title Large | 22 / 28 | 500 | 다이얼로그 제목 |
| Title Medium | 16 / 24 | 500 | 리스트 항목 제목 |
| Title Small | 14 / 20 | 500 | 강조 라벨 |
| Body Large | 16 / 24 | 400 | 본문 (긴 문장) |
| Body Medium | 14 / 20 | 400 | 일반 본문 |
| Body Small | 12 / 16 | 400 | 캡션·메타 정보 |
| Label Large | 14 / 20 | 500 | 버튼 |
| Label Medium | 12 / 16 | 500 | 작은 버튼·Chip |
| Label Small | 11 / 16 | 500 | 미세 라벨 (Badge) |

> 단위: px

#### 2.3 Letter Spacing (Tracking)

Material 3 표준 자간 값. 영문·숫자(사번·시간·금액) 가독성과 한글-라틴 혼용 균형을 위한 미세 조정.

| 토큰 | Tracking | 비고 |
|------|---------|------|
| Headline (Large / Medium / Small) | 0 | 큰 타이틀은 자간 조정 불필요 |
| Title Large | 0 | |
| Title Medium | 0.15px | 리스트 항목 가독성 보정 |
| Title Small | 0.1px | |
| Body Large | 0.5px | 영문 본문 자간 확보 |
| Body Medium | 0.25px | |
| Body Small | 0.4px | 캡션·메타 정보 |
| Label Large | 0.1px | 버튼 라벨 |
| Label Medium | 0.5px | 작은 버튼·Chip — 자간 강조 |
| Label Small | 0.5px | Badge — 자간 강조 |

> 한글 단독 텍스트에는 영향 미미하나 사번(`A-1234`)·날짜(`2026-05-25`)·시간(`09:00`) 등 영숫자 표기에서 가독성 차이 큼.

#### 2.4 한글 타이포 보정

Noto Sans KR은 ascender / descender가 라틴 폰트보다 커서 동일 line-height에서 상하 공백이 좁아 보임. 한글 비중 70% 이상인 본 ERP 특성을 반영한 보정 정책.

| 항목 | 값 | 비고 |
|------|------|------|
| line-height 추가 보정 | ×1.05 (한글 비중 ≥70% 화면) | Body Medium 20 → 21px |
| word-break | `keep-all` | 한글 단어 중간 줄바꿈 방지 |
| word-wrap | `break-word` | 너무 긴 영문 URL·코드 강제 줄바꿈 |
| 숫자 표기 | `font-feature-settings: "tnum"` | 표·통계의 숫자 폭 일정 (Tabular Numbers) |
| 한자 fallback | Noto Serif KR → 시스템 한자 폰트 | 사명·인명 한자 표기 시 |

```css
/* 전역 정책 */
body {
  word-break: keep-all;
  word-wrap: break-word;
}
table, .stat-value, .time-value, .employee-no {
  font-feature-settings: "tnum";
}
```

---

### 3. 간격 시스템 (Spacing)

#### 3.1 기본 토큰

기본 단위 4px (Material 3 4dp 기반, Tailwind 기본 단위와 일치).

| 토큰 | Value | Tailwind | 사용처 |
|------|------|---------|--------|
| 1 | 4px | `space-1` | 아이콘과 텍스트 사이 |
| 2 | 8px | `space-2` | 작은 inner padding |
| 3 | 12px | `space-3` | 표 셀 padding |
| 4 | 16px | `space-4` | 기본 inner padding |
| 5 | 20px | `space-5` | 카드 padding |
| 6 | 24px | `space-6` | 큰 inner padding |
| 8 | 32px | `space-8` | 섹션 간격 |
| 12 | 48px | `space-12` | 큰 섹션 간격 |
| 16 | 64px | `space-16` | 페이지 상하 여백 |
| 24 | 96px | `space-24` | 페이지 최상위 여백 |

#### 3.2 PC 전용 간격 규칙

| 항목 | 값 |
|------|------|
| 페이지 좌우 여백 | 24px (콘텐츠 폭 1280px 초과 시 자동 중앙 정렬) |
| 페이지 상하 여백 | 32px |
| 카드 padding | 24px |
| 섹션 간격 | 48px |
| 폼 필드 간격 | 24px |
| 리스트 항목 간격 | 12px |

---

### 4. Shape (Border Radius)

| 토큰 | Value | 사용처 |
|------|------|--------|
| None | 0 | 표·구분선 |
| Extra Small | 4px | Chip, Badge, Tag |
| Small | 8px | Button, Input, 작은 Card |
| Medium | 12px | Card, Dialog Action |
| Large | 16px | Dialog, Bottom Sheet, 큰 Card |
| Extra Large | 28px | FAB, Hero Card |
| Full | 9999px | Pill Button, Avatar |

---

### 5. Elevation (Shadow)

Material 3 elevation level. 시각적 깊이로 컴포넌트 간 위계를 표현.

| 토큰 | CSS box-shadow | 사용처 |
|------|------|--------|
| Level 0 | none | 평평한 표면 (페이지 배경) |
| Level 1 | `0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)` | 기본 Card, Resting Button |
| Level 2 | `0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)` | Hovered Card, Top App Bar |
| Level 3 | `0 1px 3px rgba(0,0,0,0.3), 0 4px 8px 3px rgba(0,0,0,0.15)` | FAB, 작은 Dialog |
| Level 4 | `0 2px 3px rgba(0,0,0,0.3), 0 6px 10px 4px rgba(0,0,0,0.15)` | Navigation Drawer |
| Level 5 | `0 4px 4px rgba(0,0,0,0.3), 0 8px 12px 6px rgba(0,0,0,0.15)` | Modal, Bottom Sheet |

---

### 6. Layout (PC 전용)

#### 6.1 페이지 폭

| 항목 | 값 |
|------|------|
| Min Width | 1280px (그 이하는 미지원) |
| Max content width | 1280px (콘텐츠 영역) |
| Viewport ≥ 1280px | 콘텐츠 1280 + 좌우 자동 여백 (중앙 정렬) |

#### 6.2 Grid

| 항목 | 값 |
|------|------|
| Column 수 | 12 |
| Gutter (column 간 간격) | 24px |
| 좌우 여백 | 24px |

#### 6.3 PC 해상도 단계 (선택적 fluid 보정)

콘텐츠는 1280px 폭으로 고정. 뷰포트가 더 넓을 때는 좌우 자동 여백으로 중앙 정렬. 1280px 미만은 미지원 (안내 메시지 또는 가로 스크롤).

| 해상도 단계 | 뷰포트 폭 | 적용 |
|------|------|------|
| 표준 | 1280 ~ 1440px | 콘텐츠 1280 + 좌우 0~80px 여백 |
| 와이드 | 1440 ~ 1920px | 콘텐츠 1280 + 좌우 자동 (중앙 정렬) |
| 울트라 와이드 | ≥ 1920px | 콘텐츠 1280 + 좌우 자동, 사이드바·헤더는 풀폭 |
| 미지원 | < 1280px | 안내 메시지 표시 |

#### 6.4 컴포넌트 동작 (PC 전용)

| 컴포넌트 | 동작 |
|--------|------|
| Sidebar | 240px 고정 (햄버거 버튼으로 토글 가능 — 콘텐츠 영역 확장용) |
| Header | 풀 헤더 (로고 + 좌측 햄버거 토글 + 우측 알림·프로필) |
| Table (출퇴근·결재함) | 풀 테이블 |
| Form (휴가/야근 신청) | 2 column grid (좌: 입력 / 우: 보조 위젯) |
| Dialog | 중앙 모달 (Max 480px) |
| Calendar (휴가) | 월간 풀 뷰 + 우측 선택 일자 상세 패널 |
| Button | size md 기본 (높이 40px) — 입력·결재 등 주요 영역은 lg(48px) |

#### 6.5 인터랙티브 영역 최소 사이즈

PC 마우스 환경 기준 단일 사이즈.

| 환경 | 최소 크기 | 비고 |
|------|--------|------|
| PC (마우스) | **32 × 32 px** | 일반 컨트롤. WCAG 2.1 SC 2.5.5 (Target Size) AAA 충족 |
| 주요 액션 (Submit·Button md/lg) | 40 × 40 px 이상 | 클릭 정확도 추가 확보 |

<!-- §6.6 Safe Area — 모바일·태블릿 미지원으로 제거됨 (2026-05-25) -->

---

### 7. State & Interaction (상태와 인터랙션)

#### 7.1 Iconography (아이콘 시스템)

| 항목 | 값 |
|------|------|
| 아이콘 라이브러리 | **Material Symbols** (Google 공식, Material 3 정합) |
| 기본 스타일 | Outlined (Filled는 선택·강조 상태에만) |
| 기본 사이즈 | 24px |
| 사이즈 단계 | 18 / 20 / 24 / 32 / 40 px |
| Weight | 400 (Regular) |
| 사용법 | `<span class="material-symbols-outlined">home</span>` 또는 `@material-symbols/svg-400` npm 패키지 |

> shadcn/ui 기본은 lucide-react이나, Material 3 정합성을 위해 Material Symbols 채택. `material-symbols` CSS 패키지를 import하여 사용.

#### 7.2 Focus State (키보드 포커스 표시)

WCAG 2.1 SC 2.4.7 (Focus Visible) 준수. 마우스 클릭에는 표시 안 되고 키보드 Tab 시에만 표시 (`:focus-visible` 의사 클래스 활용).

##### 배경별 Focus Ring 색상

| 배경 | Focus Ring 색상 | 사용처 |
|------|----------|--------|
| 흰색·연한 Surface (밝은 배경) | Primary `#0061A4` | Outlined/Text Button, Input, Card |
| Primary 배경 (어두운 배경) | Inverse Primary `#9FCAFF` | Filled Primary Button, Primary 위 IconButton |
| Error 배경 | On Error `#FFFFFF` | Filled Error Button |
| Inverse Surface (Snackbar) | Inverse Primary `#9FCAFF` | Snackbar 액션 버튼 |

##### 요소별 Focus 표시 방식

| 요소 | Focus 표시 방식 |
|------|----------|
| Button, IconButton | outline 2px solid (배경별 색상) + outline-offset 2px |
| Input, Textarea | border 2px solid Primary + box-shadow 0 0 0 4px Primary Container |
| Checkbox, Switch, Radio | outline 2px solid Primary + outline-offset 2px |
| Link | underline + color: Primary |
| Tab | bottom border 3px solid Primary |
| Card (focusable) | outline 2px solid Primary + outline-offset 4px |

기본 CSS:
```css
:focus-visible {
  outline: 2px solid #0061A4;
  outline-offset: 2px;
}
/* Dark 배경(Filled Primary Button 등)에서는 Inverse Primary 사용 */
.bg-primary :focus-visible {
  outline-color: #9FCAFF;
}
```

#### 7.3 State Layer (Material 3)

모든 인터랙티브 요소에 적용되는 투명도 오버레이. 컴포넌트가 사용자 입력에 어떻게 반응하는지 일관성 있게 표현.

##### State별 Opacity

| State | Opacity | 적용 시점 |
|-------|--------|---------|
| Default | 0% | 평상시 |
| Hover | 8% | 마우스 호버 |
| Focus | 12% | 키보드 포커스 |
| Pressed | 12% | 클릭·터치 중 |
| Dragged | 16% | 드래그 중 |

##### 오버레이 색상 (컴포넌트별)

| 컴포넌트 | 오버레이 색상 |
|--------|----------|
| Filled Button (Primary 배경) | On Primary `#FFFFFF` |
| Outlined Button / Text Button (흰 배경) | Primary `#0061A4` |
| Card / List Item | On Surface `#1A1C1E` |

##### Disabled 상태 (별도 처리)

State Layer가 아닌 컴포넌트 컬러 자체를 변형하여 표현. Material 3 표준 사양.

| 적용 위치 | 적용 방식 | CSS 예시 |
|--------|---------|---------|
| 텍스트 | On Surface 색상의 opacity 38% | `color: rgba(26, 28, 30, 0.38);` |
| 아이콘 | On Surface 색상의 opacity 38% | 동일 |
| 배경 (Filled Button) | On Surface 색상의 opacity 12% | `background: rgba(26, 28, 30, 0.12);` |
| 테두리 (Outlined Button) | On Surface 색상의 opacity 12% | `border-color: rgba(26, 28, 30, 0.12);` |
| 인터랙션 차단 | pointer-events 차단 + 커서 변경 | `pointer-events: none; cursor: not-allowed;` |

> Disabled 컴포넌트는 위 4가지를 모두 적용. Hover/Focus/Pressed State Layer는 자동으로 동작 안 함 (pointer-events: none).

#### 7.4 Z-Index Scale

컴포넌트 간 z-index 충돌 방지를 위한 표준 토큰.

| Token | Z-Index | 사용처 |
|-------|---------|--------|
| base | 0 | 일반 컨텐츠 |
| dropdown | 10 | Select 옵션, Menu 드롭다운 |
| sticky | 20 | Sticky 헤더, 테이블 헤더 |
| fixed | 30 | Top App Bar, Bottom Action Bar |
| drawer | 40 | Side Drawer, Navigation Drawer |
| modal-overlay | 50 | Modal 배경 dim |
| modal | 51 | Modal 본체 |
| toast | 60 | Toast 알림 |
| tooltip | 70 | Tooltip (최상위) |

#### 7.5 WCAG AA 대비비 검증

본 컬러 시스템의 핵심 조합 검증 결과 (대비비 ≥ 4.5:1 = AA 통과).

| 조합 | 대비비 | WCAG | 조치 |
|------|------|----------|------|
| Primary `#0061A4` + On Primary `#FFFFFF` | 7.5:1 | ✅ AAA | 유지 |
| Primary Container `#D1E4FF` + On Primary Container `#001D36` | 13.0:1 | ✅ AAA | 유지 |
| Error `#BA1A1A` + On Error `#FFFFFF` | 5.5:1 | ✅ AA | 유지 |
| Success `#2E7D32` + On Success `#FFFFFF` | 5.1:1 | ✅ AA | 유지 |
| Warning `#ED6C02` + On Warning `#1F1300` | 8.3:1 | ✅ AAA | **보정 적용** (On Warning 흰색→어두운 갈색) |
| Info `#01579B` + On Info `#FFFFFF` | 6.8:1 | ✅ AAA | **보정 적용** (Info 톤 진하게) |
| Surface Variant `#DFE2EB` + On Surface Variant `#43474E` | 7.0:1 | ✅ AAA | 유지 |

#### 7.6 Opacity Tokens (투명도 토큰)

State Layer · Disabled · Scrim 등 본 문서 전반에 사용되는 투명도 값을 단일 토큰으로 통합. 컴포넌트 작업 시 8%·12% 등을 직접 하드코딩하지 않고 본 토큰을 참조.

| 토큰 | Value | 사용처 |
|------|------|--------|
| Hover | 0.08 (8%) | State Layer Hover §7.3 |
| Focus / Pressed | 0.12 (12%) | State Layer Focus·Pressed §7.3 / Disabled 배경·테두리 §7.3 |
| Dragged | 0.16 (16%) | State Layer Dragged §7.3 |
| Scrim | 0.32 (32%) | Modal·Drawer 배경 dim §1.5 |
| Disabled Content | 0.38 (38%) | Disabled 텍스트·아이콘 §7.3 |

#### 7.7 Border Width Tokens (테두리 두께)

본 문서 전반에 분산된 1px·2px·3px·4px 사용을 단일화.

| 토큰 | Value | 사용처 |
|------|------|--------|
| None | 0 | 테두리 없음 |
| Thin | 1px | Divider §2.9 · Input 기본 border · Table 셀 |
| Medium | 2px | Focus Ring §7.2 · Input focused border |
| Thick | 3px | Tab active underline (Molecule TabItem §3.5) |
| Extra Thick | 4px | Sidebar active 좌측 indicator (Organism Sidebar §4.2) |

---

### 8. Motion (모션 — Duration · Easing)

Material 3 Motion Spec 기반. 컴포넌트 상태 전환(Hover·Pressed), 화면 전이(Dialog·Drawer), 로딩 표시(Spinner), 알림(Toast) 등 모든 애니메이션은 본 섹션 토큰만 사용. 직접 `0.2s`·`0.3s` 등을 하드코딩하지 않음.

#### 8.1 Duration (지속 시간)

| 토큰 | Value | 사용 시점 |
|------|------|---------|
| Short 1 | 50ms | 미세 피드백 (Chip 선택) |
| Short 2 | 100ms | State Layer fade (Hover·Focus) |
| Short 3 | 150ms | Button press · Tooltip 표시 |
| Short 4 | 200ms | Switch 토글 · 작은 fade |
| Medium 1 | 250ms | 일반 transition · Tab indicator slide |
| Medium 2 | 300ms | Dialog open · Snackbar 표시 |
| Medium 3 | 350ms | Card 확장 |
| Medium 4 | 400ms | 큰 transition |
| Long 1 | 450ms | Drawer slide |
| Long 2 | 500ms | Bottom Sheet open |
| Extra Long 1 | 700ms | (현재 미사용 — 모바일 미지원으로 인한 페이지 전환 효과 미사용) |
| Extra Long 2 | 1000ms | 강조 alert · 튜토리얼 step |

#### 8.2 Easing (이징 — 변화 곡선)

| 토큰 | cubic-bezier | 사용 |
|------|--------------|------|
| Standard | `cubic-bezier(0.2, 0, 0, 1)` | 화면 내 자연 이동 (기본) |
| Standard Decelerate | `cubic-bezier(0, 0, 0, 1)` | 화면 안으로 진입 (Drawer open, Dialog appear) |
| Standard Accelerate | `cubic-bezier(0.3, 0, 1, 1)` | 화면 밖으로 퇴장 (Drawer close, Dialog dismiss) |
| Emphasized Decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1)` | 강조 진입 (Bottom Sheet) |
| Emphasized Accelerate | `cubic-bezier(0.3, 0, 0.8, 0.15)` | 강조 퇴장 |
| Linear | `linear` | Spinner linear 이동 · Skeleton shimmer |

#### 8.3 컴포넌트별 Motion 매핑

| 컴포넌트 / 상황 | Duration | Easing |
|--------------|---------|--------|
| State Layer (Hover·Focus·Pressed) | Short 2 (100ms) | Standard |
| Button press 피드백 | Short 3 (150ms) | Standard |
| Switch thumb 이동 | Short 4 (200ms) | Standard |
| Tooltip 표시 / 숨김 | Short 3 (150ms) | Standard |
| Dialog open · Snackbar 표시 | Medium 2 (300ms) | Decelerate (open) / Accelerate (close) |
| Drawer · Sidebar slide | Long 1 (450ms) | Emphasized Decelerate / Accelerate |
| Bottom Sheet | Long 2 (500ms) | Emphasized Decelerate |
| Card hover elevation 상승 | Short 4 (200ms) | Standard |
| Tab indicator slide | Medium 1 (250ms) | Standard |
| Spinner Linear 좌→우 | 1500ms (infinite) | Standard |
| Skeleton shimmer 좌→우 | 1500ms (infinite) | Linear |
| Toast in / out | Medium 2 (300ms) | Decelerate / Accelerate |

#### 8.4 Reduced Motion 정책 (접근성)

WCAG 2.1 SC 2.3.3 (Animation from Interactions) 준수. 사용자 OS 설정 `prefers-reduced-motion: reduce`에 따라 자동 조정.

| 항목 | 일반 | Reduced |
|------|------|---------|
| Duration | §8.1 표대로 | 0.01ms (즉시) |
| Easing | §8.2 표대로 | Linear |
| Spinner linear 이동 | 1.5s translateX | 유지 (필수 indeterminate 피드백) |
| Skeleton shimmer | 좌→우 이동 | 정적 배경 (이동 제거) |
| Page 전환 | slide + fade | fade only |
| Drawer · Sidebar slide | slide in | fade in (no slide) |
| Snackbar · Toast | slide up | fade in |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  /* 필수 indeterminate 표시는 유지 */
  .spinner {
    animation-duration: revert !important;
    animation-iteration-count: revert !important;
  }
}
```

---

## 부록 A — Tailwind Config 매핑 (참고)

shadcn/ui 사용 시 `tailwind.config.ts`에 다음과 같이 토큰을 매핑합니다.

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0061A4', foreground: '#FFFFFF', container: '#D1E4FF', 'container-foreground': '#001D36' },
        secondary: { DEFAULT: '#535F70', foreground: '#FFFFFF', container: '#D7E3F7', 'container-foreground': '#101C2B' },
        tertiary: { DEFAULT: '#6B5778', foreground: '#FFFFFF', container: '#F3DAFF', 'container-foreground': '#251431' },
        error: { DEFAULT: '#BA1A1A', foreground: '#FFFFFF', container: '#FFDAD6', 'container-foreground': '#410002' },
        success: { DEFAULT: '#2E7D32', foreground: '#FFFFFF', container: '#C8E6C9', 'container-foreground': '#1B5E20' },
        warning: { DEFAULT: '#ED6C02', foreground: '#1F1300', container: '#FFE0B2', 'container-foreground': '#5D3E00' },
        info: { DEFAULT: '#01579B', foreground: '#FFFFFF', container: '#B3E5FC', 'container-foreground': '#01579B' },
        background: '#FDFCFF',
        foreground: '#1A1C1E',
        surface: { DEFAULT: '#FDFCFF', foreground: '#1A1C1E', variant: '#DFE2EB', 'variant-foreground': '#43474E' },
        outline: { DEFAULT: '#73777F', variant: '#C3C7CF' },
        inverse: { surface: '#2F3033', 'on-surface': '#F1F0F4', primary: '#9FCAFF' },
        scrim: '#000000',
      },
      fontFamily: {
        sans: ['"Noto Sans KR"', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
      spacing: {
<!-- safe-area utilities removed (PC only) -->
      },
      borderRadius: {
        xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '28px',
      },
      boxShadow: {
        'm3-1': '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
        'm3-2': '0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)',
        'm3-3': '0 1px 3px rgba(0,0,0,0.3), 0 4px 8px 3px rgba(0,0,0,0.15)',
        'm3-4': '0 2px 3px rgba(0,0,0,0.3), 0 6px 10px 4px rgba(0,0,0,0.15)',
        'm3-5': '0 4px 4px rgba(0,0,0,0.3), 0 8px 12px 6px rgba(0,0,0,0.15)',
      },
      zIndex: {
        base: '0',
        dropdown: '10',
        sticky: '20',
        fixed: '30',
        drawer: '40',
        'modal-overlay': '50',
        modal: '51',
        toast: '60',
        tooltip: '70',
      },
      screens: {
        sm: '600px',
        md: '1240px',
      },
      opacity: {
        hover: '0.08',
        focus: '0.12',
        pressed: '0.12',
        dragged: '0.16',
        scrim: '0.32',
        'disabled-content': '0.38',
        'disabled-bg': '0.12',
      },
      borderWidth: {
        thin: '1px',
        medium: '2px',
        thick: '3px',
        'x-thick': '4px',
      },
      transitionDuration: {
        'short-1': '50ms',
        'short-2': '100ms',
        'short-3': '150ms',
        'short-4': '200ms',
        'medium-1': '250ms',
        'medium-2': '300ms',
        'medium-3': '350ms',
        'medium-4': '400ms',
        'long-1': '450ms',
        'long-2': '500ms',
        'x-long-1': '700ms',
        'x-long-2': '1000ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
        'standard-decel': 'cubic-bezier(0, 0, 0, 1)',
        'standard-accel': 'cubic-bezier(0.3, 0, 1, 1)',
        'emphasized-decel': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'emphasized-accel': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      },
    },
  },
};
```

<!-- Safe Area utility 사용 예 제거됨 (PC 전용) -->

---

## 부록 B — Figma Variables 설정 가이드

Figma에서 다음 6개 Variable Collection을 만들고 위 토큰을 그대로 등록합니다. 컴포넌트 작업 시 이 변수를 사용하면 토큰이 변경될 때 모든 컴포넌트가 자동 갱신됩니다.

| Collection | 변수 종류 | 등록 토큰 |
|-----------|--------|---------|
| Color | Color | Primary~Tertiary, Error, Surface, Outline, Semantic, Chart 1~8, Skeleton 2 (총 50개) |
| Spacing | Number | 4, 8, 12, 16, 20, 24, 32, 48, 64, 96 (총 10개) |
| Radius | Number | 0, 4, 8, 12, 16, 28, 9999 (총 7개) |
| Typography | String / Number | Font family, weight, size, line-height, **letter-spacing(tracking)** (Type Style로 등록, Device별 mode 분리) |
| Elevation | Effect | Level 0~5 (총 6개) |
| Layout | Number | Min Width(1280), Max Content(1280), Column(12), Gutter(24), Target(32/40) — PC 전용 |
| Opacity | Number (Float) | Hover 0.08 · Focus·Pressed 0.12 · Dragged 0.16 · Scrim 0.32 · Disabled Content 0.38 (총 5개) |
| Border Width | Number | Thin 1 · Medium 2 · Thick 3 · Extra Thick 4 (총 4개) |
| Z-Index | Number | base 0 · dropdown 10 · sticky 20 · fixed 30 · drawer 40 · modal-overlay 50 · modal 51 · toast 60 · tooltip 70 (총 9개) |
| Motion / Duration | Number (ms) | Short 1~4 · Medium 1~4 · Long 1~2 · Extra Long 1~2 (총 12개) |
| Motion / Easing | String | Standard · Standard Decelerate · Standard Accelerate · Emphasized Decelerate · Emphasized Accelerate · Linear (총 6개) |

> PC 전용이므로 Typography Mode 분리 불필요 — 단일 스케일 사용.

---

## Phase 2 — Atoms (17개)

원자(Atom)는 더 이상 쪼갤 수 없는 가장 작은 UI 단위로, Phase 1에서 정의한 토큰만 사용하여 구성됩니다. 모든 인터랙티브 Atom은 default·hover·focus·pressed·disabled 5개 상태를 갖습니다.

### 2.1 Button (버튼)

| 항목 | 값 |
|------|------|
| 용도 | 사용자 액션 트리거 (제출·취소·이동 등) |
| Variants | filled (강조) / outlined (보조) / text (약함) / elevated (Surface 위) |
| Sizes | sm (32px height) / md (40px, 기본) / lg (48px) |
| Material 3 Anatomy | Container + Label + (선택) Leading Icon + Trailing Icon |
| 토큰 매핑 | bg: Primary (filled) / border: Outline + bg: Surface (outlined) / 라벨: Label Large / 라운드: Small 8px / 패딩: 24px (md) |
| States | default → hover (state-layer 8%) → focus (Ring 2px, 배경별 색상 §7.2) → pressed (12%) → disabled (text 38%·bg 12% §7.3) |
| shadcn/ui | `Button` (variant=default/secondary/outline/ghost) |

### 2.2 IconButton (아이콘 버튼)

| 항목 | 값 |
|------|------|
| 용도 | 단일 아이콘 액션 (벨·X·메뉴 등) |
| Variants | filled / outlined / standard (Surface 위) |
| Sizes | sm (32×32) / md (40×40, 기본) / lg (48×48) |
| Touch Target | PC 마우스 ≥32px (§6.5 준수) |
| Material 3 Anatomy | Container + Icon (24px 기본) |
| 토큰 매핑 | Icon 24px Outlined (sm은 18px) / **라운드: Small 8px** (ERP 그리드 일관성 — 모든 IconButton 동일) / bg·border: variant별 |
| States | Button과 동일 |
| shadcn/ui | `Button` + Material Symbols 아이콘 (size="icon" variant) |

### 2.3 Input (입력 필드)

| 항목 | 값 |
|------|------|
| 용도 | 텍스트 입력 (이메일·사번·비밀번호·사유 등) |
| Variants | outlined (M3 권장 기본) / filled |
| Types | text / password / email / number / search |
| Sizes | md (56px height) — M3 표준 단일 |
| Material 3 Anatomy | Container + Floating Label + Supporting Text + Leading/Trailing Icon (옵션) |
| 토큰 매핑 | border: Outline / bg: Surface / 라벨: Body Medium / 입력값: Body Large / 라운드: Extra Small 4px / 패딩: 좌우 16px |
| States | default / hover (border On Surface) / focus (border 2px Primary + label Primary) / error (border Error + Supporting Text Error) / disabled (38%·12%) |
| shadcn/ui | `Input` + 커스텀 Label/SupportingText wrapper |

### 2.4 Label (라벨)

| 항목 | 값 |
|------|------|
| 용도 | 폼 요소(Input·Checkbox·Switch) 텍스트 라벨 |
| Variants | required (필수, * 표시) / optional (선택) |
| 토큰 매핑 | 텍스트: Body Medium / 색상: On Surface / required asterisk: Error 색상 |
| shadcn/ui | `Label` |

### 2.5 Icon (아이콘)

| 항목 | 값 |
|------|------|
| 용도 | 모든 시각 아이콘 (메뉴·상태·액션) |
| 라이브러리 | Material Symbols (Outlined 기본 / Filled은 선택 상태에만) |
| Sizes | 18 / 20 / 24 (기본) / 32 / 40 px |
| 색상 | `currentColor` (부모에서 상속) |
| 사용법 | `<span class="material-symbols-outlined">home</span>` |
| shadcn/ui | 별도 (Material Symbols React 컴포넌트) |

### 2.6 Badge (배지)

| 항목 | 값 |
|------|------|
| 용도 | 상태 표시 (결재 상태·알림 카운트) |
| Variants | filled / outlined / dot (점 표시) |
| Color Tokens | primary / success / warning / error / neutral |
| Sizes | sm (16px height) / md (20px, 기본) |
| Material 3 Anatomy | Label only 또는 Dot |
| 토큰 매핑 | bg: Container / 텍스트: On Container / 텍스트: Label Small / 라운드: Extra Small 4px / 패딩: 좌우 6px |
| 사용 예 | "승인"(Success) · "대기"(Warning) · "반려"(Error) · "취소"(Neutral) |
| shadcn/ui | `Badge` (variant + color 확장) |

### 2.7 Avatar (아바타)

| 항목 | 값 |
|------|------|
| 용도 | 사용자 식별 (프로필 이미지·이니셜) |
| Variants | image (사진) / initial (이니셜) / placeholder (기본 아이콘) |
| Sizes | sm (24px) / md (40px, 기본) / lg (64px) |
| 토큰 매핑 | bg: Tertiary Container (initial) / 텍스트: On Tertiary Container / 라운드: Full / 텍스트: Title Medium |
| shadcn/ui | `Avatar`, `AvatarImage`, `AvatarFallback` |

### 2.8 Spinner (로딩 인디케이터 — Indeterminate)

| 항목 | 값 |
|------|------|
| 용도 | **작업 시간 미지** 상태의 비동기 진행 표시 (인증 중, 결재 처리 중, 데이터 fetch) |
| Variants | **linear only** — 좌→우 이동 좁은 막대 (circular 미사용) |
| Sizes | width 가변, 높이 4px |
| Material 3 Anatomy | Indeterminate Progress Indicator (Track 전체 노출 변형) |
| 토큰 매핑 | Track: Primary Container `#D1E4FF` (전체 노출) / Indicator: Primary `#0061A4` / 두께 4px / 라운드: Full |
| 애니메이션 | 1.5s 좌→우 이동, 막대 30% 너비 (M3 기본 유지). 정지 프레임은 카탈로그용 |
| shadcn/ui | 없음 — 자체 CSS 키프레임 구현 (`@keyframes` translateX) |
| 구별 | **Progress Bar(§2.13)와 분리**: 진행률 모를 때만 사용 |
| 본 ERP 결정 사유 | circular indeterminate(호 길이 25~75% 변동)는 시각적 산만 + 점유 면적 대비 정보량 낮음 → 본 ERP는 **linear 단일 variant**로 통일. 인라인 로딩에는 단순한 텍스트("처리 중…") 또는 Skeleton(§별도)으로 대체 |

### 2.9 Divider (구분선)

| 항목 | 값 |
|------|------|
| 용도 | 컨텐츠 영역 분리 |
| Variants | horizontal / vertical |
| 토큰 매핑 | 색상: Outline Variant `#C3C7CF` / 두께: 1px |
| 사용 예 | 리스트 항목 사이·섹션 사이 |
| shadcn/ui | `Separator` |

### 2.10 Chip (칩/태그)

| 항목 | 값 |
|------|------|
| 용도 | 필터·선택 항목·삭제 가능 태그 |
| Variants | filled (선택됨) / outlined (미선택) |
| Sizes | md (32px height) — M3 표준 단일 |
| Material 3 Anatomy | Container + (선택) Leading Icon + Label + (선택) Trailing X Icon |
| 토큰 매핑 | bg: Secondary Container (filled) / Surface + border Outline (outlined) / 라벨: Label Large / 라운드: Small 8px / 패딩: 좌우 12px |
| States | default / hover / focus / pressed / selected / disabled |
| shadcn/ui | 없음 — Badge 응용 또는 자체 정의 |

### 2.11 Tooltip (툴팁)

| 항목 | 값 |
|------|------|
| 용도 | 호버 시 부가 설명 표시 |
| Positions | top / right / bottom / left |
| Material 3 Anatomy | Container + Label |
| 토큰 매핑 | bg: Inverse Surface `#2F3033` / 텍스트: Inverse On Surface `#F1F0F4` / 라운드: Extra Small 4px / 패딩: 8px / 텍스트: Body Small |
| Trigger | PC hover 0.5s 후 표시 |
| shadcn/ui | `Tooltip`, `TooltipTrigger`, `TooltipContent` |

### 2.12 Switch (스위치)

| 항목 | 값 |
|------|------|
| 용도 | On/Off 이진 설정 |
| Sizes | md (52×32px) — M3 표준 단일 |
| Material 3 Anatomy | Track + Thumb |
| 토큰 (off) | Track bg: Surface Variant / Track border: Outline / Thumb: Outline |
| 토큰 (on) | Track bg: Primary / Thumb: On Primary / Icon (옵션): On Primary |
| 토큰 (disabled) | opacity 12%·38% (§7.3 Disabled) |
| States | default / hover (Thumb State Layer 8%) / focus / pressed / disabled |
| shadcn/ui | `Switch` |

### 2.13 Progress Bar (진행률 표시 — Determinate)

| 항목 | 값 |
|------|------|
| 용도 | **진행률 명시** 작업의 시각화 (52시간 대비 야근 누적 게이지, 잔여 연차, 업로드 진행률 등) |
| Variants | **linear only** — 가로 막대 차오름 (circular 미사용) |
| Sizes | width 가변, 높이 8px |
| Material 3 Anatomy | Track (전체 노출) + Indicator (진행률만큼 채워진 영역) + Percentage Label |
| 토큰 매핑 | Track: Primary Container `#D1E4FF` / Indicator: Primary `#0061A4` / 높이 8px / 라운드: Full (양 끝 둥글게) |
| Percentage Label | **막대 우측 외부에 표시** — HORIZONTAL 레이아웃, gap 8px / Label Large 폰트 / 형식 `60%` / 컬러: On Surface / 예: `[████████░░░░░░░] 60%` |
| 상태 | 0~100%. 100% 도달 시 Indicator만 Success 색상으로 전환 (옵션) / Track은 그대로 |
| shadcn/ui | `Progress`를 HORIZONTAL Stack으로 감싸 우측에 `<span>%` 라벨 추가 |
| 사용 예 (본 ERP) | FEAT-OT-06 야근 누적 시간 위젯 (주 52시간 게이지) · FEAT-AT-09 잔여 연차 조회 위젯 · 파일 업로드 진행률 |
| 구별 | **Spinner(§2.8)와 분리**: 진행률 알 때만 사용 |
| 본 ERP 결정 사유 | circular determinate는 가로 막대 대비 정보 가독성이 낮고(작은 사이즈에서 % 라벨 가시성 저하), 같은 페이지에서 linear와 혼용 시 시각 통일성 깨짐 → 본 ERP는 **linear 단일 variant + 우측 % 라벨**로 통일. Track은 Primary Container로 항상 완전 노출 |

### 2.14 Textarea (다중 줄 입력)

| 항목 | 값 |
|------|------|
| 용도 | **여러 줄 텍스트 입력** (사유·업무 내용·메모·반려 사유 등) |
| Variants | outlined (M3 권장 기본) / filled |
| Sizes | min-height 80px (4 줄), max-height 가변 (resize 가능) |
| Material 3 Anatomy | Container + Floating Label + Supporting Text + Character Counter (옵션) |
| 토큰 매핑 | Input(§2.3)과 동일 — border: Outline / bg: Surface / 라벨: Body Medium / 입력값: Body Large / 라운드: Extra Small 4px / 패딩: 좌우 16px, 상하 12px |
| States | default / hover / focus / error / disabled |
| 사용 예 | 휴가 사유·야근 업무 내용·인사정보 변경 사유·결재 반려 사유 |
| shadcn/ui | `Textarea` |

### 2.15 Select (드롭다운 선택)

| 항목 | 값 |
|------|------|
| 용도 | 옵션 리스트에서 단일 선택 (휴가 유형·부서 필터·결재자 등) |
| Variants | outlined (기본) / filled |
| Sizes | md (56px height) — Input과 동일 |
| Material 3 Anatomy | Container + Label + Selected Value + Trailing Chevron Icon + Menu (open 시) |
| 토큰 매핑 | bg: Surface / border: Outline / Chevron: On Surface / Menu: Surface Container + Outline border + Elevation Level 2 |
| States | default / hover / focus / open (chevron 회전 + menu) / error / disabled |
| Menu 항목 | Body Medium / 좌우 패딩 16px / hover State Layer 8% |
| 사용 예 | 휴가 유형(연차/오전반차/오후반차/공가)·부서 필터·결재자 지정 |
| shadcn/ui | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` |

### 2.16 Card (콘텐츠 컨테이너 Shell)

| 항목 | 값 |
|------|------|
| 용도 | 모든 콘텐츠를 감싸는 표준 컨테이너 (인사정보·결재·위젯·통계 등) |
| Variants | filled (Surface bg) / outlined (Surface bg + Outline border) / elevated (Surface bg + Elevation Level 1) |
| Sizes | width 가변 / padding 24px (PC 단일 값) — §3.2 |
| Material 3 Anatomy | Container only (콘텐츠는 Molecule·Organism이 채움) |
| 토큰 매핑 | bg: Surface / 라운드: Medium 12px / border (outlined): Outline Variant / shadow (elevated): Elevation Level 1 |
| 상태 | static / hoverable (Elevation Level 2 + State Layer) / pressable (Elevation Level 3) |
| 사용 예 | 인사정보 카드 (FEAT-HR-01)·결재 카드 (FEAT-CM-08)·대시보드 위젯 |
| shadcn/ui | `Card`, `CardHeader`, `CardContent`, `CardFooter` (구조 골격만 — 콘텐츠는 Molecule) |

### 2.17 Radio (단일 선택)

| 항목 | 값 |
|------|------|
| 용도 | 옵션 중 하나만 선택 (사전/사후 신청·변경 필드 선택 등) |
| Sizes | md (20×20px outer / 10px inner dot) — M3 표준 단일 |
| Material 3 Anatomy | Outer ring + Inner dot (선택 시 표시) |
| 토큰 (off) | Outer: Outline / Inner: 없음 |
| 토큰 (on) | Outer: Primary / Inner: Primary |
| 토큰 (disabled) | opacity 38% |
| States | default / hover (State Layer 8%) / focus / pressed / checked / disabled |
| 사용 예 | 야근 신청 유형(사전/사후)·인사정보 변경 필드 선택 |
| shadcn/ui | `RadioGroup`, `RadioGroupItem` |

---

### Atoms 카탈로그 요약

| # | Atom | 사용 빈도 | Atoms·Molecules·Organisms에서의 역할 |
|---|------|--------|----------------------------------|
| 1 | Button | ★★★★★ | 모든 액션 / 결재·신청·로그인 폼 |
| 2 | IconButton | ★★★★ | 헤더 알림벨·메뉴·Chip 삭제 |
| 3 | Input | ★★★★★ | 모든 입력 폼 / FormField 구성원 |
| 4 | Label | ★★★★★ | Input·Switch·Checkbox 라벨 |
| 5 | Icon | ★★★★★ | 네비게이션·상태·액션 표시 |
| 6 | Badge | ★★★★★ | 결재 상태·알림 카운트·근태 상태 |
| 7 | Avatar | ★★★★ | 헤더 프로필·결재 카드·부서 휴가 캘린더 |
| 8 | Spinner (Indeterminate) | ★★★ | 비동기 로딩 (결재 처리·인증 중·데이터 fetch) |
| 9 | Divider | ★★★ | 사이드바·리스트 구분 |
| 10 | Chip | ★★★ | 휴가 유형 필터·결재함 탭 보조 |
| 11 | Tooltip | ★★ | 약어·아이콘 의미 안내 |
| 12 | Switch | ★★ | 설정·알림 토글 |
| 13 | Progress Bar (Determinate) | ★★★★ | 52시간 게이지·연차 사용률·업로드 진행률 |
| 14 | Textarea | ★★★★★ | 사유·업무 내용·반려 사유 다중 줄 입력 |
| 15 | Select | ★★★★ | 휴가 유형·부서 필터·결재자 지정 드롭다운 |
| 16 | Card | ★★★★★ | 모든 콘텐츠 컨테이너 (인사정보·결재·위젯) |
| 17 | Radio | ★★★ | 야근 사전/사후 선택·변경 필드 선택 |

> 모든 Atom은 §Phase 1 디자인 토큰만 사용하며, 직접 색상·크기를 하드코딩하지 않습니다.

---

## Phase 3 — Molecules (15개)

분자(Molecule)는 원자(Atom) 여러 개의 조합으로, 특정 기능 단위를 형성합니다. 본 ERP는 5개 도메인(인증·인사·근태·초과근무·결재)에 사용되는 분자 15개를 정의합니다.

### Group 1: Form & Input (5개)

#### 3.1 FormField (라벨 + 입력 + 보조 텍스트)

| 항목 | 값 |
|------|------|
| 용도 | Label + Input + Supporting/Error Text 조합 — 모든 폼 입력의 표준 구성 |
| 구성 원자 | Label (§2.4) + Input (§2.3) + Body Small Text (Supporting) |
| Variants | required / optional / disabled / error |
| 레이아웃 | Vertical Stack, gap 4px |
| States | default → focus (Input Primary border + Label Primary) → error (Input Error border + Error supporting) → disabled (38%) |
| 사용 예 | 로그인 폼·휴가 신청 폼·인사정보 변경 폼 |

#### 3.2 SearchBox (검색 입력)

| 항목 | 값 |
|------|------|
| 용도 | 결재함·부서 직원 검색 등 검색 기능 |
| 구성 원자 | Input (§2.3) + Icon (search, leading) + IconButton (close, trailing — value 입력 시 표시) |
| Variants | default / with-value (clear 버튼 노출) |
| 레이아웃 | Horizontal: [search icon] [Input] [clear IconButton] |
| States | default / focused / has-value / disabled |
| 사용 예 | 결재함 검색·부서원 검색 |

#### 3.3 DateRangePicker (기간 선택)

| 항목 | 값 |
|------|------|
| 용도 | 휴가·야근·근태 조회 시작일/종료일 선택 |
| 구성 원자 | Input × 2 + Icon (calendar_today) + Text "~" |
| Variants | single (단일 일자) / range (기간) |
| 레이아웃 | Horizontal: [시작일 Input] ~ [종료일 Input] [Calendar Icon] |
| States | default / focus / error (시작 > 종료) / disabled |
| 사용 예 | 휴가 신청 기간·근태 조회 기간 |

#### 3.4 SwitchField (라벨 + 스위치)

| 항목 | 값 |
|------|------|
| 용도 | 알림 토글·설정 토글 |
| 구성 원자 | Label (§2.4) + Switch (§2.12) + (선택) Body Small (설명) |
| 레이아웃 | Horizontal: [Label + Description] [Switch] (양쪽 끝 정렬) |
| States | off / on / disabled |
| 사용 예 | "결재 이메일 알림" 토글·"근무 시간 표시" 설정 |

#### 3.5 TabItem (탭 항목)

| 항목 | 값 |
|------|------|
| 용도 | 결재함 탭·근태 조회 일/월 탭 |
| 구성 원자 | Text (Label Large) + (선택) Badge (카운트) + Active 하단 Border 3px |
| Variants | default / active (Primary 색 + 하단 border) / disabled |
| States | default / hover / focus / active / disabled |
| 사용 예 | "대기 / 완료 / 반려" 결재함 탭 |

### Group 2: Display & Status (5개)

#### 3.6 UserCard (사용자 카드)

| 항목 | 값 |
|------|------|
| 용도 | 사용자 정보 표시 (이름·부서·직급) — 헤더 프로필 메뉴·결재 카드·부서원 리스트 |
| 구성 원자 | Avatar (§2.7) + Body Large (이름) + Body Small (부서·직급) |
| Variants | sm (Avatar 24px) / md (40px) / lg (64px) |
| 레이아웃 | Horizontal — [Avatar] [Name + Sub-info Stack] |
| States | default / hover (선택적 — Card hover State Layer) |
| 사용 예 | 헤더 프로필·결재 기안자 표시·부서원 리스트 |

#### 3.7 StatCard (통계 카드)

| 항목 | 값 |
|------|------|
| 용도 | 대시보드 위젯 — 큰 숫자 + 라벨 + 추세 표시 |
| 구성 원자 | Card (§2.16) + Label Large (라벨) + Headline Large (Value) + Badge (Trend, 선택) + Icon (선택) |
| Variants | default / with-trend (Badge 표시) / with-icon (좌측 아이콘) |
| 레이아웃 | Vertical: [Label] [Value 큰 숫자] [Trend Badge] |
| 사용 예 | 대시보드 — "이번 달 야근 12.5h"·"잔여 연차 8일"·"미처리 결재 3건" |

#### 3.8 NotificationItem (알림 항목)

| 항목 | 값 |
|------|------|
| 용도 | 인앱 알림 드롭다운 / 알림 페이지 한 항목 |
| 구성 원자 | Icon (좌측) + Body Medium (제목) + Body Small (메시지) + Body Small (시간, 우측) + (선택) Dot Badge (미확인) |
| Variants | unread (Primary Container 배경) / read (Surface 배경) |
| 레이아웃 | Horizontal: [Icon] [Title + Message Stack] [Time + Dot] |
| 사용 예 | 헤더 알림 벨 클릭 시 드롭다운 리스트 / 알림 페이지 (FEAT-CM-09/10) |

#### 3.9 StatusBadgeGroup (상태 배지 그룹)

| 항목 | 값 |
|------|------|
| 용도 | 한 항목의 여러 상태 동시 표시 |
| 구성 원자 | Badge (§2.6) × 2~3개 |
| 레이아웃 | Horizontal, gap 4~8px |
| 사용 예 | "지각 + 반차" (근태 동시 표시)·"신규 + 긴급" (결재 우선순위) |

#### 3.10 EmptyState (빈 상태)

| 항목 | 값 |
|------|------|
| 용도 | 데이터 없을 때 안내 ("결재 대기 없음"·"이번 달 야근 없음"·"검색 결과 없음") |
| 구성 원자 | Icon (큰 사이즈 64px, Outline Variant 색) + Title (Headline Small) + Body Medium (설명) + (선택) Button (액션) |
| Variants | default / with-action |
| 레이아웃 | Vertical 중앙 정렬 |
| 사용 예 | 결재함·휴가 이력·검색 결과 빈 상태 |

### Group 3: Time, Approval, Widget (5개)

#### 3.11 AttendanceRow (출퇴근 리스트 한 행)

| 항목 | 값 |
|------|------|
| 용도 | 일자별 출퇴근 기록 표시 — 일/월별 조회 한 항목 |
| 구성 원자 | Title Small (일자) + Body Medium (출근/퇴근 시각) + Title Medium (근무 시간) + Badge (지각/조퇴, 선택) + Divider 하단 |
| 레이아웃 | Horizontal: [일자] [출근 ~ 퇴근] [근무 시간] [상태 Badge] |
| Variants | normal / late (Warning Badge) / early-leave (Warning Badge) / no-record |
| 사용 예 | AttendancePage 일별 리스트·DepartmentAttendancePage 부서원별 |

#### 3.12 OvertimeRow (야근 리스트 한 행)

| 항목 | 값 |
|------|------|
| 용도 | 야근 신청·이력 한 항목 — 신청자·관리자용 리스트 |
| 구성 원자 | Title Small (일자) + Body Medium (위치·업무 요약) + Title Medium (시간) + Badge (사전/사후) + Badge (대기/승인/반려) |
| 레이아웃 | Horizontal: [일자] [업무] [시간] [Badge group] |
| Variants | pending / approved / rejected (52h 초과 variant 제거 — 시스템상 발생 불가) |
| 사용 예 | OvertimeRequestPage 본인 이력·OvertimeReportPage |

#### 3.13 ApprovalActionBar (결재 액션 바)

| 항목 | 값 |
|------|------|
| 용도 | 결재 카드 하단 — 반려/승인 액션 |
| 구성 원자 | Button (outlined, "반려") + Button (filled, "승인") + (선택) IconButton (more_vert) |
| 레이아웃 | Horizontal, 우측 정렬, gap 8px |
| Variants | 일반 (반려·승인) / detailed (반려 시 사유 Textarea 펼침) |
| States | default / processing (Spinner) / locked (disabled — 결재 권한 없음) |
| 사용 예 | 결재함 카드 하단·결재 상세 Dialog |

#### 3.14 LeaveRemainingWidget (잔여 연차 위젯)

| 항목 | 값 |
|------|------|
| 용도 | 대시보드 — 잔여 연차 + 사용률 |
| 구성 원자 | Card (§2.16) + Title Medium ("잔여 연차") + Headline Large (숫자) + Body Small ("일") + Linear Progress Bar (사용률) + Body Small (granted·used 표시) |
| 레이아웃 | Vertical: [라벨] [큰 숫자 + 단위] [Progress Bar] [상세 텍스트] |
| 사용 예 | DashboardPage·MyInfoPage (FEAT-AT-09) |

#### 3.15 FiftyTwoHourMeter (주 52시간 게이지)

| 항목 | 값 |
|------|------|
| 용도 | 주 52시간 한도 대비 현재 누적 시간 시각화. **시스템상 52h 초과는 발생할 수 없음** — DB 트리거가 차단하므로 게이지는 0~52h 범위만 표시 |
| 구성 원자 | Card + Title Medium ("이번 주 누적") + Headline Large (시간) + Body Small ("/ 52h") + Linear Progress Bar + Body Small (잔여 시간 / 잠금 메시지) + 잠금 아이콘(52h 도달 시) |
| 색상 변화 | 0~40h: Primary / 40~50h: Warning / 50~52h: Warning + "X시간 남음" 메시지 / 52h 도달: Error + 잠금 아이콘 + "한도 도달 — 추가 야근 신청 불가" |
| 메시지 카피 | ≥40h: "주 52시간 한도까지 Xh 남음" / =52h: "주 52시간 한도 도달 — 추가 근무는 관리자와 협의가 필요합니다 (근로기준법 제53조)" |
| 사용 예 | DashboardPage·OvertimeRequestPage 상단 (FEAT-OT-06) |

---

## Phase 4 — Organisms (15개)

유기체(Organism)는 분자·원자가 결합된 더 복잡한 단위로, 페이지의 핵심 영역을 구성합니다. 5개 도메인의 유기체 15개를 정의합니다.

### Group 1: Layout & Auth (5개)

#### 4.1 Header (헤더)

| 항목 | 값 |
|------|------|
| 용도 | 모든 페이지 상단 — 로고·알림·프로필 |
| 구성 | Logo + 좌측 햄버거 IconButton (Sidebar 토글) + 우측: 알림 IconButton + UserCard |
| 레이아웃 | Horizontal 좌우 정렬 / 높이 64px / Elevation Level 2 |
| 레이아웃 | PC 전용 풀 헤더 64px 고정 |
| 사용 예 | 모든 페이지 상단 |

#### 4.2 Sidebar (사이드바)

| 항목 | 값 |
|------|------|
| 용도 | 좌측 네비게이션 — 메뉴 분류 + 현재 위치 표시 |
| 구성 | 메뉴 항목 (Icon + Label + Active 표시) + Divider + (선택) 푸터 |
| 레이아웃 | Vertical 240px 고정. 햄버거 IconButton으로 토글 가능 (Header 좌측) |
| 메뉴 항목 | 대시보드·내 인사정보·근태 관리·초과근무·결재함·설정 |
| Active 표시 | Primary Container 배경 + Primary 텍스트 + 좌측 4px Primary border |
| 사용 예 | 모든 페이지 좌측 |

#### 4.3 LoginForm (로그인 폼)

| 항목 | 값 |
|------|------|
| 용도 | 로그인 페이지 메인 폼 |
| 구성 | Logo + Headline Small (제목) + FormField × 2 (이메일/사번 + 비밀번호) + Button (로그인) + Link (비밀번호 찾기) + Error (선택) |
| 레이아웃 | Card 컨테이너 + Vertical Stack / 폭 400px 고정 (PC 단일 값) |
| 사용 예 | LoginPage |

#### 4.4 InfoCard (인사 기본정보 카드)

| 항목 | 값 |
|------|------|
| 용도 | 본인 인사정보 표시 |
| 구성 | Card + UserCard (lg) + 필드 그리드 (사번·입사일·연락처·역할 등) + Button ("변경 요청") |
| 레이아웃 | Vertical / 폭 100% / 패딩 24px |
| 사용 예 | MyInfoPage (FEAT-HR-01) |

#### 4.5 CheckInPanel (출근/퇴근 체크 패널)

| 항목 | 값 |
|------|------|
| 용도 | 출근 체크인 + 퇴근 체크아웃 액션 |
| 구성 | Card + 현재 시각 (Headline Medium) + 오늘 출근/퇴근 상태 (Body + Badge) + Button × 2 (출근/퇴근) |
| Variants | not-checked-in / checked-in (출근 Button disabled) / checked-out (둘 다 disabled) |
| 사용 예 | DashboardPage·AttendancePage 상단 (FEAT-AT-01/02) |

### Group 2: Forms (5개)

#### 4.6 ChangeRequestForm (인사정보 변경 폼)

| 항목 | 값 |
|------|------|
| 용도 | 본인 인사정보 변경 요청 (이름·연락처 등) → 결재 기안 |
| 구성 | Card + Headline Small + Select (변경 필드) + Input (현재 값, 읽기 전용) + Input (새 값) + Textarea (사유) + Button (제출) |
| Variants | default / submitting (Spinner) / submitted (성공) |
| 사용 예 | InfoChangeRequestPage (FEAT-HR-02) |

#### 4.7 VacationRequestForm (휴가 신청 폼)

| 항목 | 값 |
|------|------|
| 용도 | 휴가 신청 + 잔여 연차 확인 |
| 구성 | Card (메인) + Select (휴가 유형) + DateRangePicker + Textarea (사유) + Button (신청) + Card (사이드 — LeaveRemainingWidget) |
| Variants | default / insufficient-leave (잔여 부족 경고 + 사유 필수) |
| 사용 예 | VacationRequestPage (FEAT-AT-07) |

#### 4.8 OvertimeRequestForm (야근 신청 폼)

| 항목 | 값 |
|------|------|
| 용도 | 야근 사전·사후 신청 |
| 구성 | Card (메인) + Radio (사전/사후) + Input (근무위치) + Textarea (업무 내용) + Date/Time Inputs + Button (신청) + Card (사이드 — FiftyTwoHourMeter) |
| Variants | before (사전 — 예상 시간) / after (사후 — 실제 시간 + 사유) |
| 사용 예 | OvertimeRequestPage (FEAT-OT-01/02) |

#### 4.9 VacationCalendar (휴가 캘린더)

| 항목 | 값 |
|------|------|
| 용도 | 부서 휴가 일정 시각화 (월간 캘린더) |
| 구성 | Card + 헤더 (월 표시 + 좌우 navigate IconButton) + 요일 헤더 + 7×N 일자 그리드 (각 셀에 Avatar 또는 Badge 표시) |
| Variants | desktop (월간 풀 뷰) / mobile (주간 또는 리스트) |
| 사용 예 | VacationCalendarPage (FEAT-AT-11) |

#### 4.10 AttendanceTable (출퇴근 테이블)

| 항목 | 값 |
|------|------|
| 용도 | 일별 출퇴근 기록 리스트 |
| 구성 | Card + 테이블 헤더 (일자·출근·퇴근·근무시간·상태) + AttendanceRow × N + Pagination |
| Variants | full-table (PC 단일) |
| 사용 예 | AttendancePage·DepartmentAttendancePage (FEAT-AT-03) |

### Group 3: Approval & Reports (5개)

#### 4.11 ApprovalCard (결재 카드)

| 항목 | 값 |
|------|------|
| 용도 | 결재함 한 항목 — 기안자·내용·액션 |
| 구성 | Card + (UserCard sm·기안자) + Badge (유형: 휴가/야근/인사변경) + Body (내용 요약) + 기간/일자 + ApprovalActionBar (Molecule) |
| Variants | pending (액션 바 활성) / approved (Success Badge) / rejected (Error Badge + 반려 사유) / cancelled |
| 사용 예 | ApprovalInboxList의 각 항목 |

#### 4.12 ApprovalInboxList (결재함 리스트)

| 항목 | 값 |
|------|------|
| 용도 | 결재함 전체 — 탭 + 카드 리스트 |
| 구성 | TabItem 바 (대기/완료/반려, 카운트 Badge 포함) + ApprovalCard × N + (선택) EmptyState (빈 상태) + Pagination |
| 사용 예 | ApprovalInboxPage (FEAT-CM-08) |

#### 4.13 OvertimeReportTable (야근 리포트 표)

| 항목 | 값 |
|------|------|
| 용도 | 부서별·전사 야근 통계 (관리자·부서장용) |
| 구성 | Card + 필터 영역 (DateRangePicker + 부서 Select) + 통계 카드 row (StatCard × 3) + 차트 placeholder + 부서별/직원별 표 |
| Variants | by-department (부서장용 — 본인 부서) / company-wide (관리자용 — 전사) |
| 사용 예 | OvertimeReportPage (FEAT-OT-07/08) |

#### 4.14 NotificationDropdown (알림 드롭다운)

| 항목 | 값 |
|------|------|
| 용도 | 헤더 알림벨 클릭 시 표시되는 드롭다운 |
| 구성 | Card (Elevation Level 3) + 헤더 ("알림" + 모두 읽음 IconButton) + NotificationItem × N + Divider + "전체 알림 보기" Link |
| 위치 | 헤더 알림벨 하단 우측 정렬, 폭 360px |
| Variants | with-items / empty (EmptyState 표시) |
| 사용 예 | Header 알림벨 클릭 시 (FEAT-CM-09/10) |

<!-- §4.15 BottomActionBar 제거됨 — 모바일 미지원 (2026-05-25). Form 페이지의 제출 버튼은 폼 카드 내부에 inline으로 배치 -->

---

## Phase 5 — Templates (5개)

템플릿(Template)은 콘텐츠 없는 페이지 골격 — Organism의 배치 규칙을 정의합니다. Pages(§Phase 6)는 Template에 실제 데이터를 채워 완성합니다.

### 5.1 AppLayout (앱 기본 레이아웃)

| 항목 | 값 |
|------|------|
| 용도 | 모든 일반 페이지의 기본 골격 |
| 구성 | Header (상단 고정 64px) + Sidebar (좌측 240px, 햄버거로 토글 가능) + Main 영역 (스크롤) |
| 레이아웃 | PC 전용 — 콘텐츠 1280 + 좌우 자동 여백. Sidebar 토글로 콘텐츠 영역 확장 가능 |
| 사용 예 | 거의 모든 페이지 |

### 5.2 AuthLayout (인증 레이아웃)

| 항목 | 값 |
|------|------|
| 용도 | Header·Sidebar 없는 단독 페이지 (인증) |
| 구성 | 풀스크린 Background + 중앙 정렬 Container (단일 카드 컴포넌트) |
| 레이아웃 | PC 전용 — 중앙 400px 카드, 뷰포트가 넓어도 카드 폭은 고정 |
| 사용 예 | LoginPage |

### 5.3 FormPageLayout (폼 페이지 레이아웃)

| 항목 | 값 |
|------|------|
| 용도 | 데이터 입력·신청 페이지 |
| 구성 | AppLayout + Main: [Page Title + (선택) 부제] + Form 영역 + 액션 Bar (폼 카드 내부 우측 정렬) |
| 사용 예 | VacationRequestPage·OvertimeRequestPage·InfoChangeRequestPage |

### 5.4 ListPageLayout (리스트 페이지 레이아웃)

| 항목 | 값 |
|------|------|
| 용도 | 데이터 조회·리스트 페이지 |
| 구성 | AppLayout + Main: [Page Title] + Filter 영역 (DateRangePicker / Select / SearchBox) + 리스트 영역 (Table 또는 Card grid) + Pagination |
| 사용 예 | ApprovalInboxPage·AttendancePage·DepartmentAttendancePage·VacationCalendarPage |

### 5.5 DashboardLayout (대시보드 레이아웃)

| 항목 | 값 |
|------|------|
| 용도 | 대시보드 — 위젯 그리드 |
| 구성 | AppLayout + Main: [Page Title + 인사말] + CheckInPanel + Widget Grid (StatCard × 3 + LeaveRemainingWidget + FiftyTwoHourMeter + 최근 알림 NotificationItem list) |
| 레이아웃 | PC 전용 3-column grid |
| 사용 예 | DashboardPage |

---

## Phase 6 — Pages Mock UI (11개)

페이지(Page)는 Template에 실제 콘텐츠를 채운 완성된 화면입니다. 본 ERP의 11개 핵심 화면 + 본 단계의 Figma 산출물이 **발표용 시연 자료**가 됩니다.

### Group 1: 인증·대시보드·인사 (4개)

#### 6.1 LoginPage

| 항목 | 값 |
|------|------|
| Template | AuthLayout (§5.2) |
| 구성 | LoginForm (4.3) 중앙 정렬 |
| URL | /login |
| 권한 | 비로그인 사용자 |
| 연계 FEAT | FEAT-CM-01 (사번/이메일 로그인)·FEAT-CM-02 (세션 갱신) |

#### 6.2 DashboardPage

| 항목 | 값 |
|------|------|
| Template | DashboardLayout (§5.5) |
| 구성 | Header + Sidebar + Main: 인사말 + CheckInPanel + StatCard × 3 (잔여 연차·이번 달 야근·미처리 결재) + LeaveRemainingWidget + FiftyTwoHourMeter + 최근 알림 |
| URL | / |
| 권한 | 전체 |
| 연계 FEAT | FEAT-AT-01/02·FEAT-AT-09·FEAT-OT-06·FEAT-CM-09 |

#### 6.3 MyInfoPage

| 항목 | 값 |
|------|------|
| Template | AppLayout (§5.1) |
| 구성 | Header + Sidebar + Main: 페이지 제목 + InfoCard (4.4) + 변경 요청 이력 리스트 |
| URL | /my-info |
| 권한 | 일반/부서장/관리자 |
| 연계 FEAT | FEAT-HR-01·FEAT-HR-03 |

#### 6.4 InfoChangeRequestPage

| 항목 | 값 |
|------|------|
| Template | FormPageLayout (§5.3) |
| 구성 | Header + Sidebar + Main: 페이지 제목 + ChangeRequestForm (4.6) + 안내 메시지 (결재 흐름 설명) |
| URL | /my-info/change |
| 권한 | 일반 |
| 연계 FEAT | FEAT-HR-02·FEAT-HR-04 |

### Group 2: 근태·휴가 (4개)

#### 6.5 AttendancePage

| 항목 | 값 |
|------|------|
| Template | ListPageLayout (§5.4) |
| 구성 | Header + Sidebar + Main: 제목 + CheckInPanel (상단) + DateRangePicker 필터 + AttendanceTable + Pagination |
| URL | /attendance |
| 권한 | 일반/부서장/관리자 |
| 연계 FEAT | FEAT-AT-01·FEAT-AT-02·FEAT-AT-03·FEAT-AT-04·FEAT-AT-06 |

#### 6.6 VacationRequestPage

| 항목 | 값 |
|------|------|
| Template | FormPageLayout (§5.3) |
| 구성 | Header + Sidebar + Main: 제목 + VacationRequestForm + LeaveRemainingWidget (사이드) + 휴가 사용 이력 |
| URL | /vacation/request |
| 권한 | 일반 |
| 연계 FEAT | FEAT-AT-07·FEAT-AT-08·FEAT-AT-09·FEAT-AT-10 |

#### 6.7 VacationCalendarPage

| 항목 | 값 |
|------|------|
| Template | AppLayout (§5.1) |
| 구성 | Header + Sidebar + Main: 제목 + 부서원 Select 필터 + VacationCalendar (월간) |
| URL | /vacation/calendar |
| 권한 | 일반/부서장 |
| 연계 FEAT | FEAT-AT-11 |

#### 6.10 DepartmentAttendancePage

| 항목 | 값 |
|------|------|
| Template | ListPageLayout (§5.4) |
| 구성 | Header + Sidebar + Main: 제목 + 부서 Select + SearchBox + 부서원별 출퇴근 표 + Pagination |
| URL | /department/attendance |
| 권한 | 부서장/관리자 |
| 연계 FEAT | FEAT-AT-05 |

### Group 3: 초과근무·결재 (3개)

#### 6.8 OvertimeRequestPage

| 항목 | 값 |
|------|------|
| Template | FormPageLayout (§5.3) |
| 구성 | Header + Sidebar(active=야근 신청) + Main: 제목 + 그리드[좌: OvertimeRequestForm (4.8, Radio 사전/사후 + 일자/시작/종료/위치/업무내용/예상시간 + 결재상신 Button) / 우: FiftyTwoHourMeter (3.15, 38.5h/52h Warning) + 안내 Tip Card] + 최근 야근 이력 Card (Chip 필터 + OvertimeRow × N) |
| URL | /overtime/request |
| 권한 | 일반 |
| 연계 FEAT | FEAT-OT-01·FEAT-OT-02·FEAT-OT-04·FEAT-OT-06·FEAT-OT-09 |

#### 6.9 ApprovalInboxPage

| 항목 | 값 |
|------|------|
| Template | ListPageLayout (§5.4) |
| 구성 | Header + Sidebar(active=결재함, pending count badge) + Main: 제목 + [일괄 승인 / 기안하기] Button 우상단 + Tab Bar (대기 3 · 완료 12 · 반려 1 · 내 기안 5) + Filter Row (SearchBox + 유형 Select + 기간 Select + 총건수) + ApprovalCard × N + Pagination |
| ApprovalCard 구조 | Top: UserCard(기안자) + Badge(긴급/유형/상태) ‖ Body: Title + 디테일 패널(기간·내용 요약) ‖ Footer: 결재선 체인(아바타 + 단계) + ActionBar [상세·반려·승인] |
| URL | /approval/inbox |
| 권한 | 전체 (사용자별 결재 라인) |
| 연계 FEAT | FEAT-CM-05·FEAT-CM-06·FEAT-CM-07·FEAT-CM-08 |

#### 6.11 OvertimeReportPage

| 항목 | 값 |
|------|------|
| Template | ListPageLayout (§5.4) — 관리자/부서장 전용 |
| 구성 | Header + Sidebar(active=야근 리포트) + Main: 제목 + [Excel 내보내기 / PDF 보고서] Button 우상단 + Filter Card (기간 DateRangePicker + 부서 Select + 범위 Select + 필터 적용) + StatCard × 4 (전사 야근 시간 · 평균 1인당 · **한도 도달 인원** · 미처리 신청) + Chart Card (부서별 야근 시간 추이 — 일/주/월 Chip + Bar Chart + 범례) + Table Card (부서별 상세 표 — 부서·인원·누적·평균/인·**한도 도달 Badge**·전월대비 Badge·상세 링크) |
| URL | /overtime/report |
| 권한 | 부서장 (본인 부서) / 관리자 (전사) |
| 연계 FEAT | FEAT-OT-04·FEAT-OT-05·FEAT-OT-07·FEAT-OT-08 |

---

## 다음 단계

| Phase | 진행 예정 |
|-------|---------|
| **Phase 2** | Atoms — 약 12개 (Button, Input, Label, Icon, Badge, Avatar, Spinner, Divider, Tag, Tooltip, IconButton, Switch) |
| Phase 3 | Molecules — 약 15개 |
| Phase 4 | Organisms — 약 15개 |
| Phase 5 | Templates — 약 5개 |
| Phase 6 | Pages Mock UI — 11개 |
| Phase 7 | Figma 인터랙티브 프로토타입 |
| Phase 8 | 상사 컨펌 + 수정 반영 |
