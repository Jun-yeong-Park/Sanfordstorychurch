// 나눔 벽 — 은혜 나눔 · 기도 부탁, 아멘. 서버 모드에선 글쓰기에 로그인 필요.
import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import TopBar from '@/components/TopBar';
import { Body, Btn, Empty, SecHead, Section } from '@/components/ui';
import { getProfile, useAuth } from '@/lib/auth';
import { getBulletin, issueId } from '@/lib/bulletin';
import { useLang } from '@/lib/i18n';
import { getNote } from '@/lib/store';
import { addPost, amen, amened, getName, listPosts, remote, setName, type Post } from '@/lib/wall';
import { c } from '@/lib/theme';

const fmtTime = (iso: string) => new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function WallScreen() {
  const D = getBulletin();
  const router = useRouter();
  const { tr } = useLang();
  const { session } = useAuth();
  const { from, kind: kindParam } = useLocalSearchParams<{ from?: string; kind?: string }>();
  const [kind, setKind] = useState<Post['kind']>('share');
  const [name, setNameState] = useState('');
  const [body, setBody] = useState('');
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const canPost = !remote || !!session;

  const load = useCallback(async () => {
    try { setPosts(await listPosts()); setError(null); } catch (e) { setError((e as Error).message); }
    setDone(await amened());
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  // 이름: 서버 모드면 프로필 표시 이름, 아니면 이 기기에 저장한 이름
  useEffect(() => {
    if (remote && session) getProfile(session.user.id).then((p) => setNameState(p?.display_name ?? ''));
    else getName().then(setNameState);
  }, [session]);
  // 노트 편집 화면의 "나눔에 결단 올리기" → 결단 문구 미리 채움
  useEffect(() => {
    if (!from) return;
    if (kindParam === 'prayer' || kindParam === 'share') setKind(kindParam);
    getNote(from).then((n) => {
      if (!n) return;
      const v = kindParam === 'prayer' ? n.text.prayer : (n.text.deep ?? n.text.story);
      if (v) setBody(v);
    });
  }, [from, kindParam]);

  const post = async () => {
    const author = name.trim(), text = body.trim();
    if (!author) return Alert.alert(tr('이름'), remote ? '교회 탭 → 내 계정에서 표시 이름을 정해 주세요.' : '이름을 적어주세요');
    if (!text) return Alert.alert('내용을 적어주세요');
    setBusy(true);
    try {
      await addPost({ kind, author, body: text, issue: issueId(D) });
      if (!remote) await setName(author);
      setBody('');
      await load();
    } catch (e) { Alert.alert('올리지 못했어요', (e as Error).message); }
    setBusy(false);
  };
  const onAmen = async (p: Post) => {
    if (done.has(p.id)) return;
    setDone(new Set([...done, p.id]));
    setPosts((ps) => ps?.map((x) => (x.id === p.id ? { ...x, amen_count: x.amen_count + 1 } : x)) ?? null);
    try { await amen(p.id); } catch (e) { Alert.alert('오류', (e as Error).message); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
        <Section>
          <SecHead en="STORY WALL" ko={tr('은혜 나눔 · 기도')} />
          {!remote && (
            <View style={s.banner}>
              <Body size={13}><Text style={{ fontWeight: '700' }}>{tr('지금은 이 기기에만 저장됩니다.')}</Text> 교회 서버(Supabase)를 연결하면 교회 전체가 함께 봅니다 (app/supabase/README.md).</Body>
            </View>
          )}
          {canPost ? (
            <View style={s.compose}>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                {(['share', 'prayer'] as const).map((k) => (
                  <Pressable key={k} onPress={() => setKind(k)} style={[s.kind, kind === k && s.kindOn]}>
                    <Text style={[s.kindT, kind === k && { color: c.navy }]}>{k === 'share' ? tr('은혜 나눔') : tr('기도 부탁')}</Text>
                  </Pressable>
                ))}
              </View>
              {remote
                ? <Body dim size={13} style={{ paddingVertical: 8 }}>{name || '(표시 이름 없음 — 교회 탭 → 내 계정)'}</Body>
                : <TextInput value={name} onChangeText={setNameState} placeholder={tr('이름')} placeholderTextColor={c.inkDim} maxLength={20} style={s.input} />}
              <TextInput value={body} onChangeText={setBody} placeholder={tr('오늘 말씀에서 받은 은혜 한 가지, 또는 함께 기도할 제목')} placeholderTextColor={c.inkDim} maxLength={1000} multiline style={[s.input, s.area]} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Body dim size={12}>{D.issue.dateEn}</Body>
                <Btn label={tr('올리기')} small onPress={post} disabled={busy} />
              </View>
            </View>
          ) : (
            <View style={s.banner}>
              <Body size={13.5}>{tr('로그인하고 나누기')}</Body>
              <Btn label={tr('로그인 (이메일 코드)')} small onPress={() => router.push('/signin')} style={{ alignSelf: 'flex-start', marginTop: 10 }} />
            </View>
          )}

          {error ? <Empty>{error}</Empty> : posts === null ? <Empty>{tr('불러오는 중…')}</Empty> : posts.length === 0 ? <Empty>{tr('첫 이야기를 올려보세요.')}</Empty> : posts.map((p) => (
            <View key={p.id} style={s.post}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[s.chip, p.kind === 'prayer' && { backgroundColor: c.orange, color: c.navy }]}>{p.kind === 'prayer' ? tr('기도 부탁') : tr('은혜 나눔')}</Text>
                <Body bold size={13}>{p.author}</Body>
                <Body dim size={13}>{fmtTime(p.created_at)}</Body>
              </View>
              <Body size={15} style={{ marginTop: 8, lineHeight: 25 }}>{p.body}</Body>
              <Pressable onPress={() => onAmen(p)} style={[s.amen, done.has(p.id) && s.amenOn]}>
                <Text style={[s.amenT, done.has(p.id) && { color: c.navy }]}>🙏 {tr('아멘')} {p.amen_count}</Text>
              </Pressable>
            </View>
          ))}
        </Section>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  banner: { backgroundColor: c.orangeSoft, borderLeftWidth: 4, borderLeftColor: c.orange, padding: 14, borderRadius: 6, marginBottom: 14 },
  compose: { backgroundColor: c.white, borderWidth: 1, borderColor: c.gray, borderRadius: 8, padding: 16 },
  kind: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 4, borderWidth: 1.5, borderColor: c.gray },
  kindOn: { backgroundColor: c.orange, borderColor: c.orange },
  kindT: { fontSize: 13, fontWeight: '600', color: c.inkDim },
  input: { borderBottomWidth: 1.5, borderBottomColor: c.gray, paddingVertical: 10, fontSize: 15, color: c.ink },
  area: { minHeight: 90, textAlignVertical: 'top', lineHeight: 22 },
  post: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.gray },
  chip: { fontSize: 10.5, fontWeight: '700', paddingVertical: 4, paddingHorizontal: 7, borderRadius: 3, backgroundColor: c.beige, color: c.ink, overflow: 'hidden' },
  amen: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 4, borderWidth: 1.5, borderColor: c.gray },
  amenOn: { borderColor: c.orange, backgroundColor: 'rgba(255,154,31,0.15)' },
  amenT: { fontSize: 13, fontWeight: '600', color: c.inkDim },
});
