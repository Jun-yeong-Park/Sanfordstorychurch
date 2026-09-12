// 주보 데이터 — 번들(data/bulletin.ts, ./sync.sh 로 갱신) + Supabase bulletins(있으면 최신 우선) + 로컬 아카이브
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BULLETIN as BUNDLED } from '@/data/bulletin';
import { isConfigured, supabase } from '@/lib/supabase';

export type Bulletin = typeof BUNDLED;
const CACHE = 'bulletin.remote';
const ARCHIVE = 'bulletin.archive.v1';   // { [issue]: Bulletin } — 이 앱이 본 모든 주보

/** "2026년 9월 27일" → "2026-09-27" (노트·첨부·나눔의 키) */
export function issueId(b: Bulletin): string {
  const m = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/.exec(b.issue.date);
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : b.issue.date;
}

/** 값 안의 간단한 HTML(<b>, <br>)은 인쇄판용 — 앱에서는 텍스트로 */
export const t = (s: string | undefined | null) =>
  (s ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');

export const fmtIssue = (id: string) => {
  const [y, m, d] = id.split('-');
  return d ? `${y}년 ${+m}월 ${+d}일` : id;
};

let current: Bulletin = BUNDLED;
export const getBulletin = () => current;

async function readArchive(): Promise<Record<string, Bulletin>> {
  try { return JSON.parse((await AsyncStorage.getItem(ARCHIVE)) ?? '{}'); } catch { return {}; }
}
async function archive(list: Bulletin[]) {
  const all = await readArchive();
  for (const b of list) if (b?.issue?.date) all[issueId(b)] = b;
  await AsyncStorage.setItem(ARCHIVE, JSON.stringify(all));
}

/** 앱 시작 시 한 번: 캐시 → 서버 순으로 최신 주보를 고른다. 번들보다 오래된 건 무시. 본 주보는 모두 아카이브에 쌓는다. */
export async function loadBulletin(): Promise<Bulletin> {
  const seen: Bulletin[] = [BUNDLED];
  try {
    const cached = await AsyncStorage.getItem(CACHE);
    if (cached) { const b = JSON.parse(cached) as Bulletin; pick(b); seen.push(b); }
  } catch {}
  if (isConfigured) {
    const { data } = await supabase.from('bulletins').select('data').order('issue', { ascending: false }).limit(52);
    const rows = (data ?? []).map((r) => r.data as Bulletin);
    seen.push(...rows);
    if (rows[0] && pick(rows[0])) await AsyncStorage.setItem(CACHE, JSON.stringify(rows[0]));
  }
  await archive(seen).catch(() => {});
  return current;
}
function pick(b: Bulletin): boolean {
  if (!b?.issue?.date || issueId(b) < issueId(current)) return false;
  current = b;
  return true;
}

export type ArchiveItem = { issue: string; date: string; dateEn: string; title: string; scripture: string; preacher: string };
export async function listArchive(): Promise<ArchiveItem[]> {
  const all = await readArchive();
  return Object.entries(all)
    .map(([issue, b]) => ({ issue, date: b.issue.date, dateEn: b.issue.dateEn, title: b.sermon.title, scripture: b.sermon.scripture, preacher: b.sermon.preacher }))
    .sort((a, b) => b.issue.localeCompare(a.issue));
}
export async function getArchived(issue: string): Promise<Bulletin | null> {
  if (issue === issueId(current)) return current;
  return (await readArchive())[issue] ?? null;
}
