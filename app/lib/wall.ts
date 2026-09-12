// 나눔 벽 — Supabase posts (설정 시, 글쓰기는 로그인 필요) / 이 기기 AsyncStorage (미설정 시)
import AsyncStorage from '@react-native-async-storage/async-storage';
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
};
export const remote = isConfigured;
const LOCAL = 'wall.local.v1';
const AMENED = 'wall.amened.v1';
const NAME = 'wall.name';

const local = async (): Promise<Post[]> => { try { return JSON.parse((await AsyncStorage.getItem(LOCAL)) ?? '[]'); } catch { return []; } };
const fail = (e: { message: string } | null) => { if (e) throw new Error('나눔 서버 오류: ' + e.message); };

export async function listPosts(): Promise<Post[]> {
  if (!remote) return (await local()).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(100);
  fail(error);
  return data as Post[];
}
export async function addPost(p: Pick<Post, 'kind' | 'author' | 'body' | 'issue'>): Promise<Post> {
  if (!remote) {
    const row: Post = { ...p, id: `${Date.now()}`, amen_count: 0, created_at: new Date().toISOString() };
    await AsyncStorage.setItem(LOCAL, JSON.stringify([...(await local()), row]));
    return row;
  }
  const uid = (await supabase.auth.getSession()).data.session?.user.id;
  if (!uid) throw new Error('로그인이 필요해요');
  const { data, error } = await supabase.from('posts').insert({ ...p, user_id: uid }).select().single();
  fail(error);
  return data as Post;
}
export async function amen(id: string) {
  const done = await amened();
  if (done.has(id)) return;
  done.add(id);
  await AsyncStorage.setItem(AMENED, JSON.stringify([...done]));
  if (!remote) {
    const rows = (await local()).map((x) => (x.id === id ? { ...x, amen_count: x.amen_count + 1 } : x));
    await AsyncStorage.setItem(LOCAL, JSON.stringify(rows));
    return;
  }
  fail((await supabase.rpc('amen', { post_id: id })).error);
}
export async function amened(): Promise<Set<string>> {
  try { return new Set<string>(JSON.parse((await AsyncStorage.getItem(AMENED)) ?? '[]')); } catch { return new Set(); }
}
export const getName = async () => (await AsyncStorage.getItem(NAME)) ?? '';
export const setName = (n: string) => AsyncStorage.setItem(NAME, n);
