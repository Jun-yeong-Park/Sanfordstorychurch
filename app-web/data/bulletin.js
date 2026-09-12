// ============================================================
// Sanford Story Church — 주보 데이터 (매주 이 파일만 수정)
// index.html(인쇄용 A4 접지) 과 온라인 주보가 이 파일을 공유합니다.
// 값 안에 <b>굵게</b>, <br> 같은 간단한 HTML 사용 가능.
// ============================================================
window.BULLETIN = {
  issue: {
    volume: "VOL. 1  ·  NO. 1",
    date: "2026년 9월 27일",
    dateEn: "SEPTEMBER 27, 2026",
    service: "주일 오후 6:00",
    label: "LAUNCH SUNDAY",          // 특별한 주가 아니면 "SUNDAY WORSHIP"
  },

  sermon: {
    title: "하나님의 이야기가 당신의 삶에서 시작됩니다",
    titleEn: "GOD'S STORY BEGINS IN YOUR LIFE",
    scripture: "고린도후서 3:1–6",
    scriptureEn: "2 Corinthians 3:1–6",
    preacher: "정경원 목사",
    // 설교노트 페이지의 개요(선택). 비워두면 전체가 빈 줄노트가 됩니다.
    outline: [
      "1. 우리는 그리스도의 편지입니다 (3절)",
      "2. 먹으로가 아니라 성령으로 (3절)",
      "3. 새 언약의 일꾼으로 부르심 (6절)",
    ],
    // 표지 / 예배순서 하단에 들어가는 본문 발췌
    excerpt:
      "너희는 우리로 말미암아 나타난 그리스도의 편지니 이는 먹으로 쓴 것이 아니요 오직 살아 계신 하나님의 영으로 쓴 것이며 돌판에 쓴 것이 아니요 오직 육의 마음판에 쓴 것이라",
    excerptRef: "고후 3:3",
  },

  // 예배 순서 — 3부 구조 (His / Your / Our Story)
  order: [
    {
      tag: "01", name: "HIS STORY", sub: "Word & Praise · 복음의 중심",
      items: [
        { name: "예배로의 부름", detail: "시편 100편", by: "인도자" },
        { name: "찬양", detail: "주의 이름 높이며 · 은혜 · 예수 이름으로", by: "허강현" },
        { name: "대표기도", detail: "", by: "박준영" },
        { name: "성경봉독", detail: "고린도후서 3:1–6", by: "다 같이" },
        { name: "말씀", detail: "하나님의 이야기가 당신의 삶에서 시작됩니다", by: "정경원 목사" },
      ],
    },
    {
      tag: "02", name: "YOUR STORY", sub: "Reflection & Action · 결단과 행동",
      items: [
        { name: "묵상", detail: "말씀 앞에서 잠잠히", by: "" },
        { name: "Story Card", detail: "오늘의 결단 · 기도를 카드에 적어 팰릿 월에", by: "다 같이" },
        { name: "봉헌", detail: "", by: "" },
      ],
    },
    {
      tag: "03", name: "OUR STORY", sub: "Fellowship & Sending · 신실한 공동체",
      items: [
        { name: "테이블 나눔", detail: "오늘 말씀에서 받은 은혜 한 가지", by: "테이블별" },
        { name: "중보기도", detail: "서로의 Story Card를 위해", by: "" },
        { name: "광고", detail: "", by: "박준영" },
        { name: "결단 찬양 · 축도", detail: "", by: "정경원 목사" },
        { name: "식탁 교제", detail: "함께 저녁을 나눕니다", by: "" },
      ],
    },
  ],

  // 교회 소식
  news: [
    { title: "스토리교회 첫 예배", body: "오늘 스토리교회의 첫 이야기가 시작됩니다. 함께해 주신 모든 분께 감사드립니다." },
    { title: "Welcome Story", body: "처음 오신 분은 예배 후 웰컴 테이블에서 웰컴 키트(머그컵 · 드립백 · 손편지)를 받아가세요." },
    { title: "Pastor's Table", body: "다음 주일 예배 전 5:00PM, 새가족과 담임목사가 함께하는 식사 자리가 있습니다. 웰컴팀에 신청해 주세요." },
    { title: "Coffee Break 런칭", body: "10월부터 평일 저녁 소그룹 'Coffee Break'가 시작됩니다. 장소는 샌포드 지역 카페, 자세한 안내는 다음 주에." },
    { title: "주차 안내", body: "건물 뒤편 주차장을 이용해 주세요. 장애인 주차 구역은 비워둡니다." },
  ],

  // 소그룹 / 모임
  groups: [
    { name: "Coffee Break", desc: "누구나 오는 열린 소그룹", when: "평일 저녁 · 지역 카페", contact: "박준영" },
    { name: "222 Discipleship", desc: "1:1 · 1:2 제자훈련", when: "개별 약속", contact: "정경원 목사" },
    { name: "PRS", desc: "Public Reading of Scripture · 성경 함께 읽기", when: "준비 중", contact: "박준영" },
  ],

  // 다음 주 예고
  nextWeek: {
    date: "10월 4일",
    scripture: "고린도후서 3:7–18",
    title: "수건을 벗은 얼굴로",
    serving: "찬양 허강현 · 웰컴 (순번) · 친교 (순번)",
  },

  // 기도 제목
  prayers: [
    "샌포드 지역의 3040 가정과 비행학교 학생들에게 복음이 전해지도록",
    "코어팀의 건강과 순번 사역이 지치지 않도록",
    "예배 장소와 재정이 필요에 따라 채워지도록",
  ],

  // 섬기는 분들
  team: [
    { role: "담임목사", name: "정경원 Kyong Won Jung" },
    { role: "Campus Coordinator", name: "박준영 Junyeong Park" },
    { role: "Ministry Coordinator", name: "허강현 Kanghyeon Heo" },
  ],
  thisWeek: [
    { role: "찬양 인도", name: "허강현" },
    { role: "웰컴", name: "박준영" },
    { role: "친교 셋업", name: "코어팀" },
  ],

  church: {
    nameKo: "샌포드 스토리교회",
    nameEn: "SANFORD STORY CHURCH",
    legal: "Sunday Project Ministry Inc. · CRCNA",
    address: "예배 장소 주소 입력  ·  Sanford, FL 32771",
    web: "sanfordstorychurch.com",
    instagram: "@sundayproject_fl",
    email: "hello@sanfordstorychurch.com",
    giving: "헌금: Zelle  hello@sanfordstorychurch.com  ·  현장 헌금함",
    tagline: "God's Story begins in your life.",
    taglineKo: "하나님의 이야기가 당신의 삶에서 시작됩니다.",
  },
};
