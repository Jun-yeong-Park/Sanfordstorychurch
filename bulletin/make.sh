#!/bin/bash
# 주보 PDF 빌드: data.js 수정 후  ./make.sh  한 번.
# 출력: 주보-YYYY-MM-DD.pdf (날짜는 data.js 의 issue.dateISO, 없으면 오늘)
set -e
cd "$(dirname "$0")"
PORT=8766
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# data.js 에서 예배 날짜(YYYY-MM-DD) 추출
DATE=$(grep -oE 'dateISO:\s*"[0-9]{4}-[0-9]{2}-[0-9]{2}"' data.js | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -1)
[ -z "$DATE" ] && DATE=$(date +%F)

# 서버 (이미 떠 있으면 재사용)
if ! curl -s -o /dev/null "http://localhost:$PORT/"; then
  python3 -m http.server $PORT >/dev/null 2>&1 &
  SERVER=$!; trap 'kill $SERVER 2>/dev/null' EXIT
  sleep 1
fi

OUT="주보-$DATE.pdf"
"$CHROME" --headless=new --no-pdf-header-footer --print-to-pdf="$PWD/$OUT" \
  --virtual-time-budget=4000 "http://localhost:$PORT/" 2>/dev/null
echo "✓ $OUT"

# 설교노트 낱장 (A5) — 제목/날짜가 data.js 를 따르므로 매주 같이 생성
for V in 1 4; do
  "$CHROME" --headless=new --no-pdf-header-footer --print-to-pdf="$PWD/말씀노트-안$V-$DATE.pdf" \
    --virtual-time-budget=4000 "http://localhost:$PORT/note-sheet.html?v=$V" 2>/dev/null
  echo "✓ 말씀노트-안$V-$DATE.pdf"
done

# 안내지는 내용이 고정이라 없을 때만
if [ ! -f "말씀노트-안내.pdf" ]; then
  "$CHROME" --headless=new --no-pdf-header-footer --print-to-pdf="$PWD/말씀노트-안내.pdf" \
    --virtual-time-budget=4000 "http://localhost:$PORT/note-guide.html" 2>/dev/null
  echo "✓ 말씀노트-안내.pdf"
fi
