# 매주 주보 올리기 (앱 재출시 없음)

앱은 켤 때마다 Supabase `bulletins` 에서 최신 주보를 받습니다. 매주 이 3줄이면 끝.

```bash
cd ~/develop/sanford/bulletin && open data.js      # 1) 내용 수정 (설교·순서·찬양·소식·기도·다음주·일정)
./make.sh                                          # 2) 인쇄용 PDF (주보-YYYY-MM-DD.pdf)
cd ../app && npm run push-bulletin                 # 3) 앱으로 발행
```

3번은 `.env.push` 에 키가 있어야 합니다 (한 번만 설정):
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ…   # Project Settings → API → service_role  (절대 채팅·git 에 올리지 말 것)
```

## 확인
- 발행 후 앱을 완전히 닫았다 열면 새 주보가 보입니다 (번들보다 날짜가 오래된 주보는 무시).
- 잘못 올렸으면 data.js 고치고 다시 push — 같은 날짜면 덮어씁니다.
- 지난 주보는 앱 "지난 주보"에 자동으로 쌓입니다 (서버에 있는 최근 52주).

## 화면·문구·기능 수정 (심사 없이)
JavaScript 만 바뀐 수정은 빌드·심사 없이 바로 배포됩니다:
```bash
cd ~/develop/sanford/app && npx eas-cli update --channel production --message "무엇을 고쳤는지"
```
성도들이 앱을 다음에 열 때 적용됩니다. **새 네이티브 패키지를 추가했거나 app.json 의 version 을 올렸을 때만** `eas build` + `eas submit` 이 다시 필요합니다.
