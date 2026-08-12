# CLAUDE.md — Sanford Story Church Website

이 저장소는 Sanford Story Church 공식 웹사이트 프로젝트입니다.
작업 전 반드시 `docs/brand-guide.md`를 읽고 그대로 따르세요.

---

## PART 1 — 작업 원칙 (Behavioral Guidelines)

**Tradeoff:** 이 원칙들은 속도보다 신중함을 우선합니다. 사소한 작업에는 판단껏 적용하세요.

### 1. Think Before Coding
**추측하지 말 것. 혼란을 숨기지 말 것. 트레이드오프를 드러낼 것.**

구현 전에:
- 가정을 명시적으로 밝히기. 불확실하면 질문하기.
- 해석이 여러 가지면 제시하기 — 조용히 하나를 고르지 말 것.
- 더 단순한 방법이 있으면 말하기. 필요하면 반박하기.
- 불명확한 게 있으면 멈추고, 무엇이 헷갈리는지 말하고, 질문하기.

### 2. Simplicity First
**문제를 해결하는 최소한의 코드. 사변적인 것은 금지.**

- 요청받지 않은 기능 추가 금지.
- 한 번만 쓰이는 코드에 추상화 금지.
- 요청받지 않은 "유연성", "설정 가능성" 금지.
- 일어날 수 없는 시나리오에 대한 에러 처리 금지.
- 200줄이 50줄이 될 수 있으면 다시 쓰기.

자문: "시니어 엔지니어가 이거 과하다고 할까?" → Yes면 단순화.

### 3. Surgical Changes
**필요한 것만 건드리기. 내가 만든 잔해만 치우기.**

기존 코드 수정 시:
- 인접 코드/주석/포맷을 "개선"하지 말 것.
- 고장나지 않은 것을 리팩토링하지 말 것.
- 기존 스타일에 맞출 것 (내 취향과 달라도).
- 무관한 데드 코드를 발견하면 언급만 하고 삭제하지 말 것.

내 변경으로 생긴 고아 코드:
- 내 변경 때문에 안 쓰이게 된 import/변수/함수는 제거.
- 원래 있던 데드 코드는 요청 없이 제거 금지.

테스트: 변경된 모든 줄이 사용자 요청으로 직접 소급 가능해야 함.

### 4. Goal-Driven Execution
**성공 기준을 정의하고, 검증될 때까지 반복.**

작업을 검증 가능한 목표로 변환:
- "검증 추가" → "잘못된 입력에 대한 테스트를 쓰고, 통과시키기"
- "버그 수정" → "버그를 재현하는 테스트를 쓰고, 통과시키기"
- "X 리팩토링" → "전후로 테스트 통과 확인"

여러 단계 작업은 간단한 계획 먼저:
```
1. [단계] → 검증: [체크]
2. [단계] → 검증: [체크]
3. [단계] → 검증: [체크]
```

---

## PART 2 — 브랜드 절대 규칙

- 로고를 새로 디자인하거나 브랜드 스타일을 바꾸지 말 것
- 브랜드 컬러 외 임의 색상 추가 금지 (`styles/tokens.css`의 토큰만 사용)
- Bebas Neue = 대형 헤드라인 전용 / Montserrat = 본문·UI (긴 문단에 Bebas Neue 금지)
- 필(pill) 버튼, 과한 그라데이션, 과한 드롭섀도, 파스텔 톤 금지
- 네이비 섹션과 크림 섹션을 번갈아 배치해 리듬을 만들 것 (전체 네이비 X, 전체 크림 X)
- **태그라인 "YOUR STORY. GOD'S PLAN."은 현재 사용하지 않음 — 로고, 헤드라인, 카피 어디에도 넣지 말 것**

## 에셋 위치

- `assets/logo/` — 풀 로고 (다크/라이트 배경용, 가로/세로 락업) — 태그라인 미포함
- `assets/emblem/` — S 엠블럼 단독 마크 및 아이콘 변형 4종
- `assets/favicon/` — 파비콘 32/48/96/128 + 원본 해상도 소스 (170px)
- `assets/colors/palette.png` — 컬러 팔레트 참고 이미지
- `assets/applications/` — 실물 적용 예시 (참고용, 사이트에 직접 사용 X)
- `assets/brand/brand-board-full.png` — 전체 브랜드 보드 원본

## 이미지 처리 규칙

- **업스케일링 금지.** 모든 래스터 에셋은 원본 해상도 이하로만 사용.
- 파비콘 소스는 170px — 그보다 큰 사이즈(192/512 등)가 필요하면
  고해상도 원본이나 SVG를 확보한 후 생성할 것. 억지로 키우지 말 것.
- 투명 배경이 필요하면 SVG로 정밀 트레이싱하되, 원본 형태를 그대로 유지할 것.

## 로고 사용 규칙

- 다크(네이비) 배경 → `logo-primary-on-navy.png`
- 라이트(크림/화이트) 배경 → `logo-primary-on-light.png` 또는 `lockup-horizontal-light.png`
- 모바일 헤더 / 파비콘 / 소셜 아바타 → `assets/emblem/` 아이콘
- 로고 변형(늘리기, 회전, 그림자, 외곽선, 색 변경) 절대 금지

## 홈페이지 구조 (brand-guide.md §11 참조)

1. HERO (네이비) — 대형 헤드라인 + CTA: PLAN YOUR VISIT
2. OUR STORY (크림) — 2 Corinthians 3:3, "We are His Living Story."
3. FOUR PILLARS — His Story / Living Story / Spiritual Training / Faithful Community
4. NEW HERE / PLAN YOUR VISIT — 예배 시간, 위치, 안내
5. SERMONS (네이비) — "THE STORY WE LIVE."
6. MINISTRIES (크림) — Kids, Youth, Young Adults, Small Groups, Discipleship, Missions
7. EVENTS — 날짜 강조
8. FINAL CTA (네이비) — "YOUR STORY IS PART OF A GREATER STORY."
9. FOOTER (딥 네이비 #0F1E34)

※ 헤드라인 카피는 brand-guide.md의 후보 중에서 선택하되, 태그라인 문구는 제외.

## 기술 메모

- CSS는 `styles/tokens.css`를 import해서 시작
- 데스크톱 최대 콘텐츠 폭 1280px, 모바일 좌우 패딩 20–24px
- 모션은 soft fade / translateY reveal / line drawing 수준으로만, 절제해서
