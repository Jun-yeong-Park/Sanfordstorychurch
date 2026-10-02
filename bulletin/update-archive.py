#!/usr/bin/env python3
"""주보 게시판 목록(web/bulletin/archive.js)에 이번 호를 올린다. make.sh 가 부른다."""
import json, re, sys, os

date = sys.argv[1] if len(sys.argv) > 1 else None
here = os.path.dirname(os.path.abspath(__file__))
data = open(os.path.join(here, 'data.js'), encoding='utf-8').read()
out = os.path.join(here, '..', 'web', 'bulletin', 'archive.js')

def field(key):
    m = re.search(key + r':\s*"([^"]*)"', data)
    return m.group(1) if m else ''

iso = date or field('dateISO')
entry = {
    'dateISO': iso, 'date': field('date'), 'dateEn': field('dateEn'),
    'title': field(r'\n    title'), 'titleEn': field(r'\n    titleEn'),
    'scripture': field('scripture'), 'scriptureEn': field('scriptureEn'),
    'preacher': field('preacher'), 'label': field('label'),
    'pdf': '/bulletin/주보-%s.pdf' % iso,
}

items = []
if os.path.exists(out):
    m = re.search(r'=\s*(\[.*\])\s*;', open(out, encoding='utf-8').read(), re.S)
    if m:
        items = json.loads(m.group(1))

items = [x for x in items if x.get('dateISO') != iso]      # 같은 날짜는 갈아끼운다
# PDF 가 실제로 있을 때만 게시판에 올린다 (없는 파일로 가는 링크를 만들지 않기 위해)
pdf_path = os.path.join(here, '..', 'web', entry['pdf'].lstrip('/'))
if os.path.exists(pdf_path):
    items.append(entry)
else:
    print('! %s PDF 가 아직 없어 게시판에 올리지 않음' % iso)
items.sort(key=lambda x: x.get('dateISO', ''), reverse=True)

with open(out, 'w', encoding='utf-8') as f:
    f.write('// 주보 게시판 목록. make.sh 가 주보를 만들 때마다 갱신한다.\n')
    f.write('window.BULLETIN_ARCHIVE = ' + json.dumps(items, ensure_ascii=False, indent=2) + ';\n')

print('✓ web/bulletin/archive.js — %d호' % len(items))

# 주보가 바뀔 때마다 data.js/archive.js 의 주소도 바뀌어야 한다.
# 버전을 손으로 올리지 않으면, 이미 방문한 사람 브라우저는 지난주 것을 계속 보여준다.
import glob, hashlib
# 날짜만 쓰면 같은 주 안에서 내용을 고쳤을 때 주소가 그대로여서 캐시가 안 풀린다.
# 파일 내용 해시를 붙여, data.js/archive.js 가 바뀌면 반드시 주소도 바뀌게 한다.
def short_hash(path):
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()[:8]
web_bulletin = os.path.join(here, '..', 'web', 'bulletin')
stamp = iso + '.' + short_hash(os.path.join(web_bulletin, 'data.js'))
astamp = iso + '.' + short_hash(out)
pages = glob.glob(os.path.join(here, '..', 'web', '*.html')) + \
        glob.glob(os.path.join(here, '..', 'web', 'en', '*.html'))
changed = 0
for page in pages:
    t = open(page, encoding='utf-8').read()
    t2 = re.sub(r'(bulletin/data\.js)\?v=[^"\']*', r'\1?v=' + stamp, t)
    t2 = re.sub(r'(bulletin/archive\.js)\?v=[^"\']*', r'\1?v=' + astamp, t2)
    if t2 != t:
        open(page, 'w', encoding='utf-8').write(t2)
        changed += 1
print('✓ 캐시 버전 data=%s archive=%s — %d개 페이지' % (stamp, astamp, changed))
