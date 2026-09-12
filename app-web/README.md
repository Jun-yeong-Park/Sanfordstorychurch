# Story App — 웹(PWA) 버전

`../app/`(Expo iOS 앱)과 같은 기능을 빌드 없이 브라우저에서 쓰는 버전. iPhone Safari "홈 화면에 추가"로 앱처럼 설치됩니다.
주보 보기 · 설교 노트(자동 저장) · 손글씨(캔버스) · 종이 주보 사진 첨부 · 나눔 벽 · 교회 안내.

```
app-web/
├── index.html / app.css / app.js   # 화면 (해시 라우터: #bulletin #notes #wall #church)
├── db.js        # IndexedDB — 노트·사진·손글씨 (이 기기에만)
├── wall.js      # 나눔 벽 — config.js 에 Supabase 키 있으면 교회 전체 공유
├── config.js    # Supabase URL / anon 키
├── sw.js + manifest.webmanifest    # 오프라인 · 홈 화면 설치
├── data/bulletin.js   # ★ 자동 생성 — ../bulletin/data.js 복사본
├── supabase/    # schema.sql (posts) + README
└── sync.sh      # 웹사이트 변경 확인 + 주보 데이터 복사
```

로컬 실행: `cd ~/develop/sanford/app-web && ./sync.sh && python3 -m http.server 8767` → http://localhost:8767
배포: Netlify 에 이 폴더를 올리면 끝 (예: app.sanfordstorychurch.com). Supabase 스키마는 `../app/supabase/schema.sql` 과 호환(posts 테이블 동일).
