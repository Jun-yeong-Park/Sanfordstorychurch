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
