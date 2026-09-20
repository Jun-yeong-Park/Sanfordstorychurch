// data.js 에 나오는 성경 구절(설교 본문·오늘의 말씀·예배 순서·다음 주)의 본문을 뽑아
// web/bulletin/verses.js 로 저장 — 온라인 주보의 "본문 읽기" 팝업용 (개역개정, 5MB 전체 대신 필요한 절만)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const w = {}; new Function('window', readFileSync(join(here, 'data.js'), 'utf8'))(w); const D = w.BULLETIN;
const krv = JSON.parse(readFileSync(join(here, '../app/assets/bible/krv.json'), 'utf8'));
const BOOKS = [['창세기','창'],['출애굽기','출'],['레위기','레'],['민수기','민'],['신명기','신'],['여호수아','수'],['사사기','삿'],['룻기','룻'],['사무엘상','삼상'],['사무엘하','삼하'],['열왕기상','왕상'],['열왕기하','왕하'],['역대상','대상'],['역대하','대하'],['에스라','스'],['느헤미야','느'],['에스더','에'],['욥기','욥'],['시편','시'],['잠언','잠'],['전도서','전'],['아가','아'],['이사야','사'],['예레미야','렘'],['예레미야애가','애'],['에스겔','겔'],['다니엘','단'],['호세아','호'],['요엘','욜'],['아모스','암'],['오바댜','옵'],['요나','욘'],['미가','미'],['나훔','나'],['하박국','합'],['스바냐','습'],['학개','학'],['스가랴','슥'],['말라기','말'],['마태복음','마'],['마가복음','막'],['누가복음','눅'],['요한복음','요'],['사도행전','행'],['로마서','롬'],['고린도전서','고전'],['고린도후서','고후'],['갈라디아서','갈'],['에베소서','엡'],['빌립보서','빌'],['골로새서','골'],['데살로니가전서','살전'],['데살로니가후서','살후'],['디모데전서','딤전'],['디모데후서','딤후'],['디도서','딛'],['빌레몬서','몬'],['히브리서','히'],['야고보서','약'],['베드로전서','벧전'],['베드로후서','벧후'],['요한일서','요일'],['요한이서','요이'],['요한삼서','요삼'],['유다서','유'],['요한계시록','계']];
const idx = new Map(); for (const [full, ab] of BOOKS) { idx.set(full, ab); idx.set(ab, ab); }
function parse(ref) {
  const s = String(ref || '').replace(/[–—~]/g, '-').replace(/절/g, '').trim();
  const m = /^(.+?)\s*(\d+)\s*(?:편|장)?\s*(?::\s*(\d+)\s*(?:-\s*(\d+))?)?\s*$/.exec(s);
  if (!m) return null; const ab = idx.get(m[1].replace(/\s+/g, '')); if (!ab) return null;
  const full = BOOKS.find(b => b[1] === ab)[0];
  return { ab, full, ch: +m[2], from: m[3] ? +m[3] : null, to: m[4] ? +m[4] : (m[3] ? +m[3] : null) };
}
const refs = new Set([D.sermon.scripture, D.sermon.excerptRef, D.nextWeek?.scripture, ...D.order.flatMap(p => p.items.map(i => i.detail))].filter(Boolean));
const out = {};
for (const ref of refs) {
  const r = parse(ref); if (!r) continue;
  const verses = []; const start = r.from ?? 1, end = r.from ? r.to : 200;
  for (let v = start; v <= end; v++) { const t = krv[`${r.ab}${r.ch}:${v}`]; if (t === undefined) { if (r.from) continue; break; } verses.push([v, t]); }
  if (verses.length) out[ref] = { label: r.from ? `${r.full} ${r.ch}:${r.from}${r.to && r.to !== r.from ? '–' + r.to : ''}` : `${r.full} ${r.ch}${r.ab === '시' ? '편' : '장'}`, verses };
}
writeFileSync(join(here, '../web/bulletin/verses.js'), '// 자동 생성 (bulletin/extract-verses.mjs) — 개역개정 본문 발췌\nwindow.VERSES = ' + JSON.stringify(out) + ';\n');
console.log('✓ web/bulletin/verses.js:', Object.keys(out).join(' · '));
