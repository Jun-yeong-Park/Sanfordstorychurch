// ============================================================
// Sanford Story Church — 주보 데이터 (매주 이 파일만 수정)
// index.html(인쇄용 A4 접지) 과 온라인 주보가 이 파일을 공유합니다.
// 값 안에 <b>굵게</b>, <br> 같은 간단한 HTML 사용 가능.
// ============================================================
window.BULLETIN = {
  issue: {
    volume: "VOL. 1  ·  NO. 3",
    date: "2026년 10월 11일",
    dateEn: "OCTOBER 11, 2026",
    dateISO: "2026-10-11",       // make.sh 가 PDF 파일명에 씀
    service: "주일 오후 6:00",
    serviceEn: "Sunday 6:00 PM",
    label: "SUNDAY WORSHIP",          // 특별한 주가 아니면 "SUNDAY WORSHIP"
  },

  sermon: {
    title: "인간의 첫 이야기",
    titleEn: "HUMANITY'S FIRST STORY",
    scripture: "창세기 3:3-6",
    scriptureEn: "Genesis 3:3–6",
    preacher: "정경원 목사",
    preacherEn: "Pastor Kyong Won Jung",
    // P2 하단 '오늘의 말씀' 박스
    excerpt: "여자가 그 나무를 본즉 먹음직도 하고 보암직도 하고 지혜롭게 할 만큼 탐스럽기도 한 나무인지라 여자가 그 열매를 따먹고 자기와 함께 있는 남편에게도 주매 그도 먹은지라",
    excerptRef: "창세기 3:6",
    excerptEn: "She took of its fruit, and ate; and she gave some to her husband with her, and he ate.",
    excerptRefEn: "Genesis 3:6",
    // 앱 전용: 설교 다시 듣기. 유튜브 링크 / mp3 주소. 없으면 "" 로 두세요.
    video: "",
    audio: "",
  },

  // 예배 순서 — 4부 구조 (His / Your / Deep / Our Story). 축도까지 약 1시간.
  order: [
    {
      tag: "01", name: "HIS STORY", sub: "Welcome & Word · 복음의 중심", subEn: "Welcome & Word",
      items: [
        { name: "예배로의 부름", nameEn: "Call to Worship", detail: "웰컴", detailEn: "Welcome", by: "다 같이", byEn: "All" },
        // 앱 전용: songs — 이번 주 찬양. artist(선택) · url(유튜브, 비우면 앱에서 검색으로 열림). 앱 주보 탭 "이번 주 찬양"에 모아 보임.
        { name: "찬양", nameEn: "Praise", detail: "주를 바라보며 · 감사와 찬양 드리며 · 감사함으로", detailEn: "3 songs", by: "허강현 전도사", byEn: "Pastor Kanghyeon Heo",
          songs: [
            { title: "주를 바라보며", artist: "", url: "https://youtu.be/i8fTqz-k95Y" },
            { title: "감사와 찬양 드리며", artist: "", url: "https://youtu.be/9T3Ea-jLVJA" },
            { title: "감사함으로", artist: "", url: "https://youtu.be/jm_fUziwymg" },
          ] },
        { name: "말씀", nameEn: "Sermon", detail: "인간의 첫 이야기", detailEn: "Humanity's First Story", by: "정경원 목사", byEn: "Pastor Kyong Won Jung" },
      ],
    },
    {
      tag: "02", name: "YOUR STORY", sub: "Reflection & Sharing · 말씀 적용", subEn: "Reflection & Sharing",
      items: [
        { name: "말씀 적용 · 나눔", nameEn: "Reflect & Share", detail: "노트 작성 후 옆자리 분과 나눔 (10분)", detailEn: "Write your note, then share with the person next to you (10 min)", by: "다 같이", byEn: "All" },
      ],
    },
    {
      tag: "03", name: "DEEP STORY", sub: "Response & Blessing · 결단", subEn: "Response & Blessing",
      items: [
        { name: "결단 찬양 · 봉헌", nameEn: "Response Song · Offering", detail: "주님 말씀하시면", detailEn: "주님 말씀하시면", by: "허강현 전도사", byEn: "Pastor Kanghyeon Heo",
          songs: [{ title: "주님 말씀하시면", artist: "", url: "https://youtu.be/TyC4rhee2S8" }] },
        { name: "축도", nameEn: "Benediction", detail: "민수기 6:24–26", detailEn: "Numbers 6:24–26", by: "정경원 목사", byEn: "Pastor Kyong Won Jung" },
        { name: "파송 찬양", nameEn: "Sending Song", detail: "The Blessing", detailEn: "The Blessing", by: "허강현 전도사", byEn: "Pastor Kanghyeon Heo",
          songs: [{ title: "The Blessing", artist: "", url: "https://youtu.be/mDK9ZrhJA34" }] },
      ],
    },
    {
      tag: "04", name: "OUR STORY", sub: "Fellowship · 신실한 공동체", subEn: "Fellowship",
      items: [
        { name: "광고", nameEn: "Announcements", detail: "", by: "정경원 목사", byEn: "Pastor Kyong Won Jung" },
        { name: "식탁 교제", nameEn: "Dinner Together", detail: "함께 저녁을 나눕니다", detailEn: "We share dinner together", by: "다 같이", byEn: "All" },
      ],
    },
  ],

  // 교회 소식
  news: [
    { title: "친구와 함께 오세요", titleEn: "Bring a Friend",
      body: "이번 주, 소중한 한 사람에게 \"같이 교회 가볼래?\" 하고 마음을 건네보세요.",
      bodyEn: "This week, offer one person who matters to you a simple invitation: \"want to come to church with me?\"" },
    { title: "섬길 자리가 있습니다", titleEn: "A Place to Serve",
      body: "찬양 · 미디어 · 웰컴 · 친교. 한 자리만 맡아 주셔도 됩니다. 섬기고 싶으신 분은 알려주세요.",
      bodyEn: "Worship, media, welcome, hospitality. One place is enough — let us know if you'd like to serve." },
  ],

  // 다음 주 예고
  // 헌금 보고 — 매주 투명 공개. amount 는 숫자(달러).
  offering: {
    week: "10월 4일",
    weekEn: "October 4",
    items: [
      { name: "주일헌금", nameEn: "Sunday Offering", amount: 0 },
      { name: "십일조", nameEn: "Tithe", amount: 0 },
      { name: "감사헌금", nameEn: "Thanksgiving", amount: 110 },
      { name: "선교헌금", nameEn: "Missions", amount: 0 },
    ],
    note: "재정 보고서는 분기별로 온 성도에게 공유됩니다. 문의: 허강현",
    noteEn: "A financial report is shared with the whole congregation quarterly. Contact: Kanghyeon Heo",
  },


  // 기도 제목
  prayers: [
    "샌포드 지역의 3040 가정과 비행학교 학생들에게 복음이 전해지도록",
    "아직 예수님을 알지 못하는 샌포드의 이웃들이 주님을 만나 믿게 되도록",
    "섬김팀의 건강과 섬김이 지치지 않도록",
    "예배 장소와 재정이 필요에 따라 채워지도록",
  ],
  prayersEn: [
    "That the gospel reaches young families and flight-school students in Sanford",
    "That our Sanford neighbors who do not yet know Jesus would meet Him and believe",
    "For the serving team's health and strength",
    "That a worship space and finances are provided as needed",
  ],

  // 섬기는 분들
  team: [
    { role: "담임목사", roleEn: "Lead Pastor", name: "정경원 목사", nameEn: "Pastor Kyong Won Jung",
      edu: "리폼드신학교(RTS) M.Div.", eduEn: "M.Div., Reformed Theological Seminary" },
    { role: "전도사", roleEn: "Pastor", name: "허강현 전도사", nameEn: "Kanghyeon Heo",
      edu: "칼빈신학교 M.Div.", eduEn: "M.Div., Calvin Theological Seminary" },
    { role: "코디네이터", roleEn: "Coordinator", name: "박준영 형제", nameEn: "Junyeong Park" },
  ],
  thisWeek: [
    { role: "찬양 인도", roleEn: "Worship Lead", name: "허강현", nameEn: "Kanghyeon Heo" },
    { role: "웰컴", roleEn: "Welcome", name: "박준영", nameEn: "Junyeong Park" },
    { role: "친교 셋업", roleEn: "Fellowship Setup", name: "섬김팀", nameEn: "Serving Team" },
  ],

  // 앱 전용: 일정 (교회 탭 · "내 캘린더에 추가"). date: YYYY-MM-DD, time: HH:MM (24h), durationMin: 분
  events: [
    { date: "2026-10-04", time: "18:00", durationMin: 120, title: "주일 예배", titleEn: "Sunday Worship", place: "4942 FL-46 #1026, Sanford", placeEn: "4942 FL-46 #1026, Sanford", desc: "하나님의 첫 이야기 · 창세기 1:1", descEn: "God's First Story · Genesis 1:1" },
    { date: "2026-10-11", time: "18:00", durationMin: 120, title: "주일 예배", titleEn: "Sunday Worship", place: "4942 FL-46 #1026, Sanford", placeEn: "4942 FL-46 #1026, Sanford", desc: "인간의 첫 이야기 · 창세기 3:3-6", descEn: "Humanity's First Story · Genesis 3:3–6" },
    { date: "2026-10-18", time: "18:00", durationMin: 120, title: "주일 예배", titleEn: "Sunday Worship", place: "4942 FL-46 #1026, Sanford", placeEn: "4942 FL-46 #1026, Sanford", desc: "", descEn: "" },
  ],

  church: {
    nameKo: "샌포드 스토리교회",
    nameEn: "SANFORD STORY CHURCH",
    legal: "CRCNA",
    address: "4942 FL-46 #1026, Sanford, FL 32771",
    addressEn: "4942 FL-46 #1026, Sanford, FL 32771",
    web: "sanfordstorychurch.com",
    instagram: "@storychurch_sanford",
    email: "sanfordstorychurch@gmail.com",
    giving: "헌금: Zelle  sanfordstorychurch0927@gmail.com<br>수표: \"Sanford Story Church\" 앞 · 7000 Winegard Rd, Orlando FL 32809 우편<br>계좌 이체(Fifth Third Bank)는 별도로 안내드립니다",
    givingEn: "Giving: Zelle  sanfordstorychurch0927@gmail.com<br>Check: payable to \"Sanford Story Church\", mailed to 7000 Winegard Rd, Orlando FL 32809<br>Bank transfer: Fifth Third Bank account details available on request",
    tagline: "God's Story begins in your life.",
    taglineKo: "하나님의 이야기가 당신의 삶에서 시작됩니다.",
  },
};
