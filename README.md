# Sanford Story Church

```
web/        # 공식 웹사이트 sanfordstorychurch.com (Netlify 자동 배포 — main 브랜치 push 시)
bulletin/   # 주보 · 말씀노트 (data.js 한 파일 수정 → ./make.sh 로 PDF)
app/        # 성도용 iOS 앱 (Expo) — 주보·말씀노트·나눔·교회
app-web/    # 같은 앱의 웹(PWA) 버전
```

- 주보 데이터는 `bulletin/data.js` 하나. 앱은 `app/sync.sh` 로 복사해서 씁니다.
- 브랜드 규칙: `web/docs/brand-guide.md`
