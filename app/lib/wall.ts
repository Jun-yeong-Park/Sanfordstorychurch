// 나눔 벽 — Supabase posts (설정 시, 글쓰기는 로그인 + 약관 동의) / 이 기기 AsyncStorage (미설정 시)
// 신고·차단·삭제·약관 동의는 Apple Guideline 1.2 (UGC) 요건 — supabase/schema.sql 참조
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EULA_VERSION } from '@/lib/moderation';
import { isConfigured, supabase } from '@/lib/supabase';

export type Post = {
  id: string;
  kind: 'share' | 'prayer';
  author: string;
  body: string;
  issue: string | null;
  amen_count: number;
  created_at: string;
  user_id?: string | null;
  hidden?: boolean;
};
export const remote = isConfigured;
const LOCAL = 'wall.local.v1';
const AMENED = 'wall.amened.v1';
const NAME = 'wall.name';
const EULA_LOCAL = 'wall.eula';

const local = async (): Promise<Post[]> => { try { return JSON.parse((await AsyncStorage.getItem(LOCAL)) ?? '[]'); } catch { return []; } };
const saveLocal = (rows: Post[]) => AsyncStorage.setItem(LOCAL, JSON.stringify(rows));
const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message.includes('부적절') ? e.message : '나눔 서버 오류: ' + e.message); };
const uid = async () => (await supabase.auth.getSession()).data.session?.user.id ?? null;

export async function listPosts(): Promise<Post[]> {
  if (!remote) return (await local()).filter((p) => !p.hidden).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100);
  fail(error);
  return data as Post[];
}
export async function addPost(p: Pick<Post, 'kind' | 'author' | 'body' | 'issue'>): Promise<Post> {
  if (!remote) {
    const row: Post = { ...p, id: `${Date.now()}`, user_id: 'me', amen_count: 0, created_at: new Date().toISOString() };
    await saveLocal([...(await local()), row]);
    return row;
  }
  const id = await uid();
  if (!id) throw new Error('로그인이 필요해요');
  const { data, error } = await supabase.from('posts').insert({ ...p, user_id: id }).select().single();
  fail(error);
  return data as Post;
}
export async function deletePost(id: string) {
  if (!remote) return saveLocal((await local()).filter((x) => x.id !== id));
  fail((await supabase.from('posts').delete().eq('id', id)).error);
}
export async function amen(id: string) {
  const done = await amened();
  if (done.has(id)) return;
  done.add(id);
  await AsyncStorage.setItem(AMENED, JSON.stringify([...done]));
  if (!remote) return saveLocal((await local()).map((x) => (x.id === id ? { ...x, amen_count: x.amen_count + 1 } : x)));
  fail((await supabase.rpc('amen', { post_id: id })).error);
}
export async function amened(): Promise<Set<string>> {
  try { return new Set<string>(JSON.parse((await AsyncStorage.getItem(AMENED)) ?? '[]')); } catch { return new Set(); }
}
export const getName = async () => (await AsyncStorage.getItem(NAME)) ?? '';
export const setName = (n: string) => AsyncStorage.setItem(NAME, n);

// ---- 약관(EULA) 동의 ----
export async function eulaAccepted(): Promise<boolean> {
  if (!remote) return (await AsyncStorage.getItem(EULA_LOCAL)) === String(EULA_VERSION);
  const id = await uid();
  if (!id) return false;
  const { data } = await supabase.from('profiles').select('eula_version').eq('id', id).maybeSingle();
  return (data?.eula_version ?? 0) >= EULA_VERSION;
}
export async function acceptEula() {
  await AsyncStorage.setItem(EULA_LOCAL, String(EULA_VERSION));
  if (remote) fail((await supabase.rpc('accept_eula')).error);
}

// ---- 신고 · 차단 ----
export async function reportPost(p: Post, reason: string, note?: string) {
  if (!remote) return saveLocal((await local()).map((x) => (x.id === p.id ? { ...x, hidden: true } : x)));
  const id = await uid();
  if (!id) throw new Error('로그인이 필요해요');
  fail((await supabase.from('reports').insert({ reporter_id: id, post_id: p.id, reported_user_id: p.user_id ?? null, reason, note: note ?? null })).error);
}
export async function blockUser(userId: string) {
  if (!remote) return saveLocal((await local()).map((x) => (x.user_id === userId ? { ...x, hidden: true } : x)));
  const id = await uid();
  if (!id) throw new Error('로그인이 필요해요');
  fail((await supabase.from('blocks').insert({ blocker_id: id, blocked_id: userId })).error);
}
export type Blocked = { blocked_id: string; created_at: string };
export async function listBlocked(): Promise<Blocked[]> {
  if (!remote) return [];
  const { data, error } = await supabase.from('blocks').select('blocked_id, created_at').order('created_at', { ascending: false });
  fail(error);
  return (data ?? []) as Blocked[];
}
export async function unblockUser(userId: string) {
  if (!remote) return;
  fail((await supabase.from('blocks').delete().eq('blocked_id', userId)).error);
}
