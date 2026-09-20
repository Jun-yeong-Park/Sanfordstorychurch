// 자동 생성 — ../bulletin/data.js 를 ./sync.sh 가 복사한 것. 직접 고치지 말고 data.js 를 고치세요.
/* eslint-disable */
// ============================================================
// Sanford Story Church — 주보 데이터 (매주 이 파일만 수정)
// index.html(인쇄용 A4 접지) 과 온라인 주보가 이 파일을 공유합니다.
// 값 안에 <b>굵게</b>, <br> 같은 간단한 HTML 사용 가능.
// ============================================================
export const BULLETIN = {
  issue: {
    volume: "VOL. 1  ·  NO. 1",
    date: "2026년 9월 27일",
    dateEn: "SEPTEMBER 27, 2026",
    dateISO: "2026-09-27",       // make.sh 가 PDF 파일명에 씀
    service: "주일 오후 6:00",
    serviceEn: "Sunday 6:00 PM",
    label: "LAUNCH SUNDAY",          // 특별한 주가 아니면 "SUNDAY WORSHIP"
  },

  sermon: {
    title: "하나님의 이야기가 당신의 삶에서 시작됩니다",
    titleEn: "GOD'S STORY BEGINS IN YOUR LIFE",
    scripture: "고린도후서 3:1–6",
    scriptureEn: "2 Corinthians 3:1–6",
    preacher: "정경원 목사",
    // P2 하단 '오늘의 말씀' 박스
    excerpt: "너희는 우리로 말미암아 나타난 그리스도의 편지니 이는 먹으로 쓴 것이 아니요 오직 살아 계신 하나님의 영으로 쓴 것이며 돌판에 쓴 것이 아니요 오직 육의 마음판에 쓴 것이라",
    excerptRef: "고후 3:3",
    excerptEn: "You show that you are a letter from Christ, the result of our ministry, written not with ink but with the Spirit of the living God, not on tablets of stone but on tablets of human hearts.",
    excerptRefEn: "2 Cor 3:3",
    // 앱 전용: 설교 다시 듣기. 유튜브 링크 / mp3 주소. 없으면 "" 로 두세요.
    video: "",
    audio: "",
  },

  // 예배 순서 — 4부 구조 (His / Your / Deep / Our Story). 축도까지 약 1시간.
  order: [
    {
      tag: "01", name: "HIS STORY", sub: "Welcome & Word · 복음의 중심", subEn: "Welcome & Word",
      items: [
        { name: "예배로의 부름", nameEn: "Call to Worship", detail: "웰컴", detailEn: "Welcome", by: "다 같이" },
        // 앱 전용: songs — 이번 주 찬양. artist(선택) · url(유튜브, 비우면 앱에서 검색으로 열림). 앱 주보 탭 "이번 주 찬양"에 모아 보임.
        { name: "찬양", nameEn: "Praise", detail: "합심 · 슬픈 마음 있는 사람 · 온 땅의 주인 · 우리 보좌 앞에 모였네", detailEn: "4 songs", by: "허강현",
          songs: [
            { title: "합심", artist: "", url: "https://www.youtube.com/watch?v=bLpFLJ2p60o" },
            { title: "슬픈 마음 있는 사람", artist: "", url: "https://www.youtube.com/watch?v=hgbn4t-4Gwo" },
            { title: "온 땅의 주인", artist: "", url: "https://youtu.be/To9WjSWeDB0" },
            { title: "우리 보좌 앞에 모였네", artist: "", url: "https://youtu.be/kTfuRV8eGXk" },
          ] },
        { name: "말씀", nameEn: "Sermon", detail: "하나님의 이야기가 당신의 삶에서 시작됩니다", detailEn: "God's Story Begins in Your Life", by: "정경원 목사" },
      ],
    },
    {
      tag: "02", name: "YOUR STORY", sub: "Reflection & Sharing · 말씀 적용", subEn: "Reflection & Sharing",
      items: [
        { name: "말씀 적용 · 나눔", nameEn: "Reflect & Share", detail: "노트 작성 후 옆자리 분과 나눔 (10분)", detailEn: "Write your note, then share with the person next to you (10 min)", by: "다 같이" },
      ],
    },
    {
      tag: "03", name: "DEEP STORY", sub: "Response & Blessing · 결단", subEn: "Response & Blessing",
      items: [
        { name: "결단 찬양 · 봉헌", nameEn: "Response Songs · Offering", detail: "", detailEn: "", by: "허강현", songs: [] },
        { name: "기도", nameEn: "Prayer", detail: "", by: "정경원 목사" },
        { name: "축도", nameEn: "Benediction", detail: "민수기 6:24–26", detailEn: "Numbers 6:24–26", by: "정경원 목사" },
      ],
    },
    {
      tag: "04", name: "OUR STORY", sub: "Fellowship · 신실한 공동체", subEn: "Fellowship",
      items: [
        { name: "광고", nameEn: "Announcements", detail: "", by: "정경원 목사" },
        { name: "식탁 교제", nameEn: "Dinner Together", detail: "함께 저녁을 나눕니다", detailEn: "We share dinner together", by: "다 같이" },
      ],
    },
  ],

  // 교회 소식
  news: [
    { title: "스토리교회 첫 예배", titleEn: "Our First Worship", body: "오늘 스토리교회의 첫 이야기가 시작됩니다. 함께해 주신 모든 분께 감사드립니다.", bodyEn: "Today the first story of Story Church begins. Thank you to everyone who joined us." },
    { title: "Pastor's Table", body: "다음 주일 예배 전 5:00PM, 새가족과 담임목사가 함께하는 식사 자리가 있습니다. 웰컴팀에 신청해 주세요.", bodyEn: "Next Sunday at 5:00 PM, newcomers share a meal with the pastor before worship. Sign up with the welcome team." },
    { title: "Coffee Break 런칭", titleEn: "Coffee Break Launch", body: "10월부터 평일 저녁 소그룹 'Coffee Break'가 시작됩니다. 장소는 샌포드 지역 카페, 자세한 안내는 다음 주에.", bodyEn: "Our weeknight small group 'Coffee Break' starts in October at a local Sanford café. Details next week." },
  ],

  // 소그룹 / 모임
  groups: [
    { name: "Coffee Break", desc: "누구나 오는 열린 소그룹", descEn: "Open small group for anyone", when: "평일 저녁 · 지역 카페", whenEn: "Weeknights · local café", contact: "박준영" },
    { name: "222 Discipleship", desc: "1:1 · 1:2 제자훈련", descEn: "1-on-1 · 1-on-2 discipleship", when: "개별 약속", whenEn: "By appointment", contact: "정경원 목사" },
    { name: "PRS", desc: "Public Reading of Scripture · 성경 함께 읽기", descEn: "Public Reading of Scripture", when: "준비 중", whenEn: "Coming soon", contact: "박준영" },
  ],

  // 다음 주 예고
  // 헌금 보고 — 매주 투명 공개. amount 는 숫자(달러).
  offering: {
    week: "9월 20일",
    items: [
      { name: "주일헌금 Sunday", amount: 0 },
      { name: "십일조 Tithe", amount: 0 },
      { name: "감사헌금 Thanksgiving", amount: 0 },
      { name: "선교헌금 Mission", amount: 0 },
    ],
    note: "재정 보고서는 분기별로 온 성도에게 공유됩니다. 문의: 허강현",
  },

  nextWeek: {
    date: "10월 4일",
    dateEn: "October 4",
    scripture: "고린도후서 3:7–18",
    scriptureEn: "2 Corinthians 3:7–18",
    title: "수건을 벗은 얼굴로",
    titleEn: "With Unveiled Faces",
    serving: "찬양 허강현 · 웰컴 박준영 · 친교 섬김팀",
    servingEn: "Praise: Kanghyeon Heo · Welcome: Junyeong Park · Fellowship: serving team",
  },

  // 기도 제목
  prayers: [
    "샌포드 지역의 3040 가정과 비행학교 학생들에게 복음이 전해지도록",
    "섬김팀의 건강과 섬김이 지치지 않도록",
    "예배 장소와 재정이 필요에 따라 채워지도록",
  ],
  prayersEn: [
    "That the gospel reaches young families and flight-school students in Sanford",
    "For the serving team's health and strength",
    "That a worship space and finances are provided as needed",
  ],

  // 섬기는 분들
  team: [
    { role: "담임목사", roleEn: "Lead Pastor", name: "정경원 Kyong Won Jung" },
    { role: "코디네이터", roleEn: "Coordinator", name: "박준영 Junyeong Park" },
    { role: "전도", roleEn: "Outreach", name: "허강현 Kanghyeon Heo" },
  ],
  thisWeek: [
    { role: "찬양 인도", roleEn: "Worship Lead", name: "허강현" },
    { role: "웰컴", roleEn: "Welcome", name: "박준영" },
    { role: "친교 셋업", roleEn: "Fellowship Setup", name: "섬김팀" },
  ],

  // 앱 전용: 일정 (교회 탭 · "내 캘린더에 추가"). date: YYYY-MM-DD, time: HH:MM (24h), durationMin: 분
  events: [
    { date: "2026-09-27", time: "18:00", durationMin: 120, title: "스토리교회 첫 예배", titleEn: "Story Church Launch Sunday", place: "예배 장소", placeEn: "Worship venue", desc: "함께 저녁을 나눕니다.", descEn: "Dinner together after worship." },
    { date: "2026-10-04", time: "17:00", durationMin: 60, title: "Pastor's Table", titleEn: "Pastor's Table", place: "예배 장소", placeEn: "Worship venue", desc: "새가족과 담임목사의 식사 자리. 웰컴팀에 신청.", descEn: "Newcomers dine with the pastor. Sign up with the welcome team." },
    { date: "2026-10-04", time: "18:00", durationMin: 120, title: "주일 예배", titleEn: "Sunday Worship", place: "예배 장소", placeEn: "Worship venue", desc: "고린도후서 3:7–18 · 수건을 벗은 얼굴로", descEn: "2 Corinthians 3:7–18 · With Unveiled Faces" },
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
    givingEn: "Giving: Zelle  hello@sanfordstorychurch.com  ·  offering box on site",
    tagline: "God's Story begins in your life.",
    taglineKo: "하나님의 이야기가 당신의 삶에서 시작됩니다.",
  },
};
