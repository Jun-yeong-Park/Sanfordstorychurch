#!/usr/bin/env bash
# ============================================================
# 작업 전에 한 번: 웹사이트(web)·라이브 사이트·주보 데이터 최신 상태 확인
#   ./sync.sh   (또는 npm run sync)
# ============================================================
set -e
cd "$(dirname "$0")"
KIT=../web
SITE=https://sanfordstorychurch.com
META=data/site-meta.json

echo "== 웹사이트 저장소 ($KIT) =="
git -C "$KIT" fetch -q origin 2>/dev/null || echo "  (fetch 실패 — 오프라인?)"
BEHIND=$(git -C "$KIT" log --oneline HEAD..origin/main 2>/dev/null | wc -l | tr -d ' ')
if [ "$BEHIND" != "0" ]; then
  echo "  ⚠ 원격에 로컬에 없는 커밋 ${BEHIND}개 — git -C $KIT pull 하세요:"
  git -C "$KIT" log --format='    %ci %s' HEAD..origin/main
else
  echo "  로컬 = 원격 (최신)"
fi
LAST_COMMIT=$(git -C "$KIT" log -1 --format='%ci %s')
echo "  마지막 커밋: $LAST_COMMIT"
DIRTY=$(git -C "$KIT" status --short | grep -v '^??' | wc -l | tr -d ' ')
[ "$DIRTY" != "0" ] && echo "  ⚠ 커밋 안 된 수정 ${DIRTY}개 있음"

echo "== 라이브 사이트 ($SITE) =="
ETAG=$(curl -sI "$SITE/" | awk -F'"' 'tolower($1) ~ /^etag/ {print $2}')
OLD=$(grep -o '"etag": *"[^"]*"' "$META" 2>/dev/null | sed 's/.*: *"//; s/"//')
if [ -z "$ETAG" ]; then echo "  (응답 없음)"
elif [ -z "$OLD" ]; then echo "  처음 확인 (etag $ETAG)"
elif [ "$ETAG" = "$OLD" ]; then echo "  변경 없음 (etag $ETAG)"
else echo "  ★ 라이브 사이트가 바뀌었습니다 (etag $OLD → $ETAG) — 브라우저에서 확인하세요"; fi
if curl -s "$SITE/" | diff -q - "$KIT/index.html" >/dev/null; then echo "  라이브 = 로컬 index.html"
else echo "  ⚠ 라이브와 로컬 index.html 이 다릅니다 (배포 전이거나 로컬 수정 중)"; fi

echo "== 주보 데이터 (../bulletin/data.js → data/bulletin.ts) =="
{
  echo "// 자동 생성 — ../bulletin/data.js 를 ./sync.sh 가 복사한 것. 직접 고치지 말고 data.js 를 고치세요."
  echo "/* eslint-disable */"
  sed 's/^window\.BULLETIN = /export const BULLETIN = /' ../bulletin/data.js
} > data/bulletin.ts
grep -m1 'date:' data/bulletin.ts | sed 's/^ */  /'

cat > "$META" <<JSON
{
  "checkedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "etag": "$ETAG",
  "siteLastCommit": "$LAST_COMMIT"
}
JSON
echo "  → $META 갱신"
