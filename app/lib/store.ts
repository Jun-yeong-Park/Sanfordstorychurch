// 이 기기 저장소 — 노트 텍스트(AsyncStorage) + 첨부 파일(documentDirectory/attachments)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { getBulletin, issueId } from '@/lib/bulletin';
import { isConfigured, supabase } from '@/lib/supabase';
import { trx } from '@/lib/i18n';

export type Note = {
  issue: string;            // YYYY-MM-DD
  title: string; scripture: string; preacher: string;
  outline: string[];        // (구버전 호환) 예전 개요별 칸. 새 노트는 빈 배열.
  text: Record<string, string>;  // his / my / deep / prayer / followup  (+구버전 o0… free story)
  updated_at: string | null;
};

/** 인쇄 주보 P3 말씀 노트와 같은 3단 흐름 — 문구는 bulletin/index.html pageNotes() 와 맞춘다 */
export const NOTE_STEPS = [
  { key: 'his',  n: 1, en: 'HIS STORY',  ko: '하나님의 이야기', tag: '설교 중',   q: '오늘 말씀에서 발견한 하나님 · 마음에 남는 구절',
    enKo: "God's Story", tagEn: 'During the sermon', qEn: 'What you saw of God today · a verse that stayed with you' },
  { key: 'my',   n: 2, en: 'MY STORY',   ko: '나의 이야기',     tag: '묵상 · 나눔', q: '이 말씀이 내 삶에 던지는 질문과 나의 답',
    enKo: 'My Story', tagEn: 'Reflect · Share', qEn: 'The question this Word asks of my life, and my answer' },
  { key: 'deep', n: 3, en: 'DEEP STORY', ko: '깊어진 이야기',   tag: '결단',       q: '내려놓을 것 · 붙들 것 · 하나님께 드리는 나의 결단',
    enKo: 'Deep Story', tagEn: 'Response', qEn: 'What to let go · what to hold on to · my commitment to God' },
] as const;
export type Attachment = { id: string; issue: string; kind: 'photo' | 'drawing'; uri: string; created_at: string };

const NOTES = 'notes.v1';
const ATTS = 'attachments.v1';

export function newNote(issue: string): Note {
  const b = getBulletin();
  const cur = issue === issueId(b);
  return {
    issue,
    title: cur ? b.sermon.title : '',
    scripture: cur ? b.sermon.scripture : '',
    preacher: cur ? b.sermon.preacher : '',
    outline: [],
    text: {},
    updated_at: null,
  };
}

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try { const s = await AsyncStorage.getItem(key); return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}

export async function listNotes(): Promise<Note[]> {
  const all = await readJSON<Record<string, Note>>(NOTES, {});
  return Object.values(all).sort((a, b) => b.issue.localeCompare(a.issue));
}
export async function getNote(issue: string): Promise<Note | null> {
  return (await readJSON<Record<string, Note>>(NOTES, {}))[issue] ?? null;
}
export async function saveNote(n: Note): Promise<Note> {
  const all = await readJSON<Record<string, Note>>(NOTES, {});
  n.updated_at = new Date().toISOString();
  all[n.issue] = n;
  await AsyncStorage.setItem(NOTES, JSON.stringify(all));
  backup(n).catch(() => {});   // 백업은 부가 — 실패해도 로컬 저장은 끝났다
  return n;
}

// ---- 서버 백업 (로그인했을 때만, 텍스트만 — 사진·손글씨는 기기에) ----
async function userId(): Promise<string | null> {
  if (!isConfigured) return null;
  return (await supabase.auth.getSession()).data.session?.user.id ?? null;
}
async function backup(n: Note) {
  const uid = await userId();
  if (!uid) return;
  await supabase.from('notes').upsert({ user_id: uid, issue: n.issue, data: n, updated_at: n.updated_at }, { onConflict: 'user_id,issue' });
}
/** 로그인 직후: 서버와 로컬을 합친다 — 같은 주보면 updated_at 이 최신인 쪽이 이긴다. */
export async function syncNotesWithServer(uid: string) {
  const { data, error } = await supabase.from('notes').select('issue, data, updated_at').eq('user_id', uid);
  if (error) throw error;
  const local = await readJSON<Record<string, Note>>(NOTES, {});
  const toPush: Note[] = [];
  for (const row of data ?? []) {
    const remote = row.data as Note;
    const mine = local[row.issue];
    if (!mine || (mine.updated_at ?? '') < (remote.updated_at ?? '')) local[row.issue] = remote;
    else if ((mine.updated_at ?? '') > (remote.updated_at ?? '')) toPush.push(mine);
  }
  const remoteIssues = new Set((data ?? []).map((r) => r.issue));
  for (const n of Object.values(local)) if (!remoteIssues.has(n.issue)) toPush.push(n);
  await AsyncStorage.setItem(NOTES, JSON.stringify(local));
  if (toPush.length) await supabase.from('notes').upsert(toPush.map((n) => ({ user_id: uid, issue: n.issue, data: n, updated_at: n.updated_at })), { onConflict: 'user_id,issue' });
}
/** 첨부만 있고 노트가 없으면 목록에 안 보이므로, 첨부 시 노트 행을 만들어 둔다 */
export async function touchNote(issue: string) {
  await saveNote((await getNote(issue)) ?? newNote(issue));
}

const dir = () => {
  const d = new Directory(Paths.document, 'attachments');
  if (!d.exists) d.create({ idempotent: true });
  return d;
};
export async function listAttachments(issue: string): Promise<Attachment[]> {
  return (await readJSON<Attachment[]>(ATTS, [])).filter((a) => a.issue === issue).sort((a, b) => a.created_at.localeCompare(b.created_at));
}
export async function countAttachments(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const a of await readJSON<Attachment[]>(ATTS, [])) out[a.issue] = (out[a.issue] ?? 0) + 1;
  return out;
}
/** 임시 uri(카메라·캡처)의 파일을 앱 문서 폴더로 복사해 영구 보관 */
export async function addAttachment(issue: string, kind: Attachment['kind'], tmpUri: string): Promise<Attachment> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ext = kind === 'drawing' ? 'png' : (tmpUri.split('.').pop()?.toLowerCase().slice(0, 4) || 'jpg');
  const dest = new File(dir(), `${id}.${ext}`);
  new File(tmpUri).copy(dest);
  const a: Attachment = { id, issue, kind, uri: dest.uri, created_at: new Date().toISOString() };
  const all = await readJSON<Attachment[]>(ATTS, []);
  await AsyncStorage.setItem(ATTS, JSON.stringify([...all, a]));
  await touchNote(issue);
  return a;
}
export async function removeAttachment(a: Attachment) {
  try { const f = new File(a.uri); if (f.exists) f.delete(); } catch {}
  const all = await readJSON<Attachment[]>(ATTS, []);
  await AsyncStorage.setItem(ATTS, JSON.stringify(all.filter((x) => x.id !== a.id)));
}

export function noteToText(n: Note): string {
  const L = [n.title, `${n.scripture} · ${n.preacher} · ${n.issue}`, ''];
  for (const st of NOTE_STEPS) { const v = n.text[st.key]; if (v) L.push(`${st.n}. ${st.en} · ${trx(st.ko)}`, v, ''); }
  // 구버전 노트 (개요별 칸 · 자유 노트 · Story Card)
  n.outline.forEach((pt, i) => { const v = n.text['o' + i]; if (v) L.push(pt, v, ''); });
  if (n.text.free) L.push(trx('노트'), n.text.free, '');
  if (n.text.story) L.push('My Story Card · 오늘의 결단', n.text.story, '');
  if (n.text.followup) L.push(trx('결단 돌아보기'), n.text.followup, '');
  if (n.text.prayer) L.push(trx('기도 카드 · 기도 제목'), n.text.prayer, '');
  L.push('— Sanford Story Church · Story App');
  return L.join('\n');
}
