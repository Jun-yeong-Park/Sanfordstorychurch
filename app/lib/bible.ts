// 성경 본문 — 개역개정(assets/bible/krv.json, 키 "고후3:3") + NIV(niv.json, 키 "47:3:3"). 선데이프로젝트 데이터.
type Book = { nr: number; ko: string; abbr: string; en: string; enAbbr: string };
const B = (nr: number, ko: string, abbr: string, en: string, enAbbr: string): Book => ({ nr, ko, abbr, en, enAbbr });
export const BOOKS: Book[] = [
  B(1,'창세기','창','Genesis','Gen'), B(2,'출애굽기','출','Exodus','Exo'), B(3,'레위기','레','Leviticus','Lev'), B(4,'민수기','민','Numbers','Num'), B(5,'신명기','신','Deuteronomy','Deu'),
  B(6,'여호수아','수','Joshua','Jos'), B(7,'사사기','삿','Judges','Jdg'), B(8,'룻기','룻','Ruth','Rut'), B(9,'사무엘상','삼상','1 Samuel','1Sa'), B(10,'사무엘하','삼하','2 Samuel','2Sa'),
  B(11,'열왕기상','왕상','1 Kings','1Ki'), B(12,'열왕기하','왕하','2 Kings','2Ki'), B(13,'역대상','대상','1 Chronicles','1Ch'), B(14,'역대하','대하','2 Chronicles','2Ch'), B(15,'에스라','스','Ezra','Ezr'),
  B(16,'느헤미야','느','Nehemiah','Neh'), B(17,'에스더','에','Esther','Est'), B(18,'욥기','욥','Job','Job'), B(19,'시편','시','Psalms','Psa'), B(20,'잠언','잠','Proverbs','Pro'),
  B(21,'전도서','전','Ecclesiastes','Ecc'), B(22,'아가','아','Song of Solomon','Son'), B(23,'이사야','사','Isaiah','Isa'), B(24,'예레미야','렘','Jeremiah','Jer'), B(25,'예레미야애가','애','Lamentations','Lam'),
  B(26,'에스겔','겔','Ezekiel','Eze'), B(27,'다니엘','단','Daniel','Dan'), B(28,'호세아','호','Hosea','Hos'), B(29,'요엘','욜','Joel','Joe'), B(30,'아모스','암','Amos','Amo'),
  B(31,'오바댜','옵','Obadiah','Oba'), B(32,'요나','욘','Jonah','Jon'), B(33,'미가','미','Micah','Mic'), B(34,'나훔','나','Nahum','Nah'), B(35,'하박국','합','Habakkuk','Hab'),
  B(36,'스바냐','습','Zephaniah','Zep'), B(37,'학개','학','Haggai','Hag'), B(38,'스가랴','슥','Zechariah','Zec'), B(39,'말라기','말','Malachi','Mal'),
  B(40,'마태복음','마','Matthew','Mat'), B(41,'마가복음','막','Mark','Mar'), B(42,'누가복음','눅','Luke','Luk'), B(43,'요한복음','요','John','Joh'), B(44,'사도행전','행','Acts','Act'),
  B(45,'로마서','롬','Romans','Rom'), B(46,'고린도전서','고전','1 Corinthians','1Co'), B(47,'고린도후서','고후','2 Corinthians','2Co'), B(48,'갈라디아서','갈','Galatians','Gal'), B(49,'에베소서','엡','Ephesians','Eph'),
  B(50,'빌립보서','빌','Philippians','Phi'), B(51,'골로새서','골','Colossians','Col'), B(52,'데살로니가전서','살전','1 Thessalonians','1Th'), B(53,'데살로니가후서','살후','2 Thessalonians','2Th'), B(54,'디모데전서','딤전','1 Timothy','1Ti'),
  B(55,'디모데후서','딤후','2 Timothy','2Ti'), B(56,'디도서','딛','Titus','Tit'), B(57,'빌레몬서','몬','Philemon','Phm'), B(58,'히브리서','히','Hebrews','Heb'), B(59,'야고보서','약','James','Jas'),
  B(60,'베드로전서','벧전','1 Peter','1Pe'), B(61,'베드로후서','벧후','2 Peter','2Pe'), B(62,'요한일서','요일','1 John','1Jo'), B(63,'요한이서','요이','2 John','2Jo'), B(64,'요한삼서','요삼','3 John','3Jo'),
  B(65,'유다서','유','Jude','Jud'), B(66,'요한계시록','계','Revelation','Rev'),
];

export type Ref = { book: number; chapter: number; from?: number; to?: number };

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/^(1|2|3)(st|nd|rd)/, '$1');
const bookIndex = new Map<string, number>();
for (const b of BOOKS) for (const k of [b.ko, b.abbr, b.en, b.enAbbr, b.en.replace('Psalms', 'Psalm'), b.en.replace('Song of Solomon', 'Song of Songs')]) bookIndex.set(norm(k), b.nr);
bookIndex.set('psalm', 19); bookIndex.set('songofsongs', 22); bookIndex.set('sos', 22); bookIndex.set('rev', 66);

/** "고린도후서 3:1–6" · "시편 100편" · "고후 3:3" · "2 Corinthians 3:1-6" · "Psalm 100" → Ref. 못 읽으면 null. */
export function parseRef(input: string | undefined | null): Ref | null {
  if (!input) return null;
  const s = input.replace(/[–—~]/g, '-').replace(/절/g, '').trim();
  const m = /^(.+?)\s*(\d+)\s*(?:편|장)?\s*(?::\s*(\d+)\s*(?:-\s*(\d+))?)?\s*$/.exec(s);
  if (!m) return null;
  const book = bookIndex.get(norm(m[1]));
  if (!book) return null;
  const chapter = +m[2];
  const from = m[3] ? +m[3] : undefined;
  const to = m[4] ? +m[4] : from;
  return { book, chapter, from, to };
}

let krv: Record<string, string> | null = null;
let niv: Record<string, string> | null = null;
// 앱 시작 시 10MB JSON 을 다 파싱하지 않도록 처음 열 때만 require
const data = (lang: 'ko' | 'en') => {
  if (lang === 'ko') return (krv ??= require('@/assets/bible/krv.json') as Record<string, string>);
  return (niv ??= require('@/assets/bible/niv.json') as Record<string, string>);
};

export const bookOf = (nr: number) => BOOKS[nr - 1];

export function refLabel(r: Ref, lang: 'ko' | 'en'): string {
  const b = bookOf(r.book);
  const name = lang === 'ko' ? b.ko : b.en.replace('Psalms', 'Psalm');
  const ch = lang === 'ko' && r.book === 19 && !r.from ? `${r.chapter}편` : `${r.chapter}`;
  if (!r.from) return `${name} ${ch}`;
  return `${name} ${r.chapter}:${r.from}${r.to && r.to !== r.from ? `–${r.to}` : ''}`;
}

export type Verse = { n: number; text: string };
/** from 이 없으면 장 전체. 데이터에 없는 절에서 멈춘다. */
export function getVerses(r: Ref, lang: 'ko' | 'en'): Verse[] {
  const d = data(lang);
  const b = bookOf(r.book);
  const key = (v: number) => (lang === 'ko' ? `${b.abbr}${r.chapter}:${v}` : `${b.nr}:${r.chapter}:${v}`);
  const out: Verse[] = [];
  const start = r.from ?? 1, end = r.from ? (r.to ?? r.from) : 200;
  for (let v = start; v <= end; v++) {
    const text = d[key(v)];
    if (text === undefined) { if (r.from) continue; else break; }
    out.push({ n: v, text });
  }
  return out;
}

// ---------- 성경 탭용: 장 수 · 장 읽기 · 검색 ----------
export const VERSIONS = [
  { id: 'ko' as const, abbr: '개역개정', name: '개역개정판', credit: '개역개정 · 대한성서공회' },
  { id: 'en' as const, abbr: 'NIV', name: 'New International Version', credit: 'Holy Bible, New International Version® · Biblica' },
];
export type Lang = 'ko' | 'en';

const chapterCache: Partial<Record<Lang, number[]>> = {};
/** 책별 장 수 (index = book nr). 데이터에서 한 번만 센다. */
export function chapterCounts(lang: Lang): number[] {
  if (chapterCache[lang]) return chapterCache[lang]!;
  const d = data(lang);
  const counts = new Array(67).fill(0);
  if (lang === 'ko') {
    const byAbbr = new Map(BOOKS.map((b) => [b.abbr, b.nr]));
    for (const k of Object.keys(d)) {
      const m = /^([^\d]+)(\d+):/.exec(k);
      if (!m) continue;
      const nr = byAbbr.get(m[1]);
      if (nr) counts[nr] = Math.max(counts[nr], +m[2]);
    }
  } else {
    for (const k of Object.keys(d)) {
      const [nr, ch] = k.split(':').map(Number);
      counts[nr] = Math.max(counts[nr], ch);
    }
  }
  return (chapterCache[lang] = counts);
}

export type SearchHit = { key: string; ref: string; text: string; book: number; chapter: number; verse: number; lang: Lang };
/** 단순 포함 검색. 결과는 성경 순서, 최대 limit. */
export function searchVerses(q: string, langs: Lang[], limit = 200): SearchHit[] {
  const kw = q.trim();
  if (!kw) return [];
  const out: SearchHit[] = [];
  const kwLower = kw.toLowerCase();
  for (const lang of langs) {
    const d = data(lang);
    for (const k of Object.keys(d)) {
      const text = d[k];
      if (!(lang === 'en' ? text.toLowerCase().includes(kwLower) : text.includes(kw))) continue;
      let book: number, chapter: number, verse: number;
      if (lang === 'ko') {
        const m = /^([^\d]+)(\d+):(\d+)$/.exec(k); if (!m) continue;
        book = BOOKS.find((b) => b.abbr === m[1])?.nr ?? 0; chapter = +m[2]; verse = +m[3];
      } else { [book, chapter, verse] = k.split(':').map(Number); }
      if (!book) continue;
      out.push({ key: lang + k, ref: refLabel({ book, chapter, from: verse }, lang), text, book, chapter, verse, lang });
      if (out.length >= limit) return out;
    }
  }
  return out;
}
