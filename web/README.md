# Sanford Story Church — Website Starter Kit

브랜드 보드에서 추출한 에셋 + 디자인 토큰 + Claude Code용 가이드.

## 폴더 구조

```
sanford-story-church/
├── CLAUDE.md                     # Claude Code가 따를 프로젝트 규칙
├── README.md
├── docs/
│   └── brand-guide.md            # 전체 브랜드 & 디자인 시스템 문서
├── styles/
│   └── tokens.css                # 컬러/폰트/스페이싱 토큰 + 버튼 스타일
└── assets/
    ├── brand/
    │   └── brand-board-full.png  # 원본 브랜드 보드
    ├── logo/
    │   ├── logo-primary-on-navy.png    # 네이비 배경용 풀 로고 (태그라인 없음)
    │   ├── logo-primary-on-light.png   # 라이트 배경용 풀 로고 (태그라인 없음)
    │   ├── lockup-horizontal-light.png # 가로 락업
    │   └── lockup-vertical-light.png   # 세로 락업
    ├── emblem/
    │   ├── emblem-navy-box.png         # 네이비 박스 엠블럼
    │   ├── emblem-orange-on-cream.png  # 오렌지 단독 엠블럼
    │   ├── icon-orange.png             # 아이콘 변형 4종
    │   ├── icon-navy.png
    │   ├── icon-circle-navy.png
    │   └── icon-app-rounded.png
    ├── favicon/
    │   ├── favicon-32.png / 48 / 96 / 128   (업스케일 없음)
    │   └── favicon-source-170.png           # 원본 해상도 소스
    ├── colors/
    │   └── palette.png
    └── applications/             # 실물 적용 예시 (참고용)
        ├── exterior-signage.png
        ├── apparel.png
        └── presentation-slide.png
```

## 사용법 (Claude Code)

1. 이 폴더를 프로젝트 루트로 열기
2. Claude Code가 자동으로 `CLAUDE.md`를 읽음
3. 예: "docs/brand-guide.md 기준으로 홈페이지를 만들어줘"

## 컬러

| 이름 | HEX | 용도 |
|---|---|---|
| Story Orange | #FF9A1F | 강조, CTA, 액센트 |
| Story Navy | #0F1E34 | 다크 배경, 본문 타이포, 푸터 |
| Warm Cream | #F4F0E6 | 라이트 배경 (순백 대신 우선 사용) |
| Stone Gray | #D7D9DD | 보더, 디바이더 (절제해서) |

폰트: **Bebas Neue** (대형 헤드라인) / **Montserrat** (본문·UI)

> 참고: 태그라인 "YOUR STORY. GOD'S PLAN."은 현재 미사용 — 모든 에셋에서 제외됨. 파비콘은 원본 해상도(170px) 이하로만 생성 (업스케일 금지).
