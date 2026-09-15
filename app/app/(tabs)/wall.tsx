// 나눔 벽 — 은혜 나눔 · 기도 부탁, 아멘. 서버 모드에선 글쓰기에 로그인 필요.
import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import TopBar from '@/components/TopBar';
import { Body, Btn, Empty, SecHead, Section } from '@/components/ui';
import { getProfile, useAuth } from '@/lib/auth';
import { getBulletin, issueId } from '@/lib/bulletin';
import { useLang } from '@/lib/i18n';
import { getNote } from '@/lib/store';
import { acceptEula, addPost, amen, amened, blockUser, deletePost, eulaAccepted, getName, listPosts, remote, reportPost, setName, type Post } from '@/lib/wall';
import { REPORT_REASONS, TERMS_URL, containsBlockedWords } from '@/lib/moderation';
import { c } from '@/lib/theme';

const fmtTime = (iso: string) => new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function WallScreen() {
  const D = getBulletin();
  const router = useRouter();
  const { lang, tr } = useLang();
  const { session } = useAuth();
  const [showEula, setShowEula] = useState(false);
  const myId = remote ? session?.user.id ?? null : 'me';
  const { from, kind: kindParam } = useLocalSearchParams<{ from?: string; kind?: string }>();
  const [kind, setKind] = useState<Post['kind']>('share');
  const [anon, setAnon] = useState(false);
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
    const author = anon ? tr('익명') : name.trim(), text = body.trim();
    if (!author) return Alert.alert(tr('이름'), remote ? '교회 탭 → 내 계정에서 표시 이름을 정해 주세요.' : '이름을 적어주세요');
    if (!text) return Alert.alert('내용을 적어주세요');
    if (containsBlockedWords(text) || containsBlockedWords(author)) return Alert.alert('', lang === 'en' ? 'Your post contains inappropriate language and cannot be posted.' : '부적절한 표현이 포함되어 있어 올릴 수 없습니다.');
    if (!(await eulaAccepted())) { setShowEula(true); return; }   // 첫 글 전 약관 동의
    setBusy(true);
    try {
      await addPost({ kind, author, body: text, issue: issueId(D), anonymous: anon });
      if (!remote && !anon) await setName(author);
      setBody('');
      await load();
    } catch (e) { Alert.alert('올리지 못했어요', (e as Error).message); }
    setBusy(false);
  };
  const onMenu = (p: Post) => {
    const mine = !!myId && p.user_id === myId;
    if (mine) {
      return Alert.alert(tr('내 글 삭제'), tr('이 글을 삭제할까요?'), [
        { text: tr('취소'), style: 'cancel' },
        { text: tr('삭제'), style: 'destructive', onPress: async () => { try { await deletePost(p.id); await load(); } catch (e) { Alert.alert('오류', (e as Error).message); } } },
      ]);
    }
    Alert.alert(p.anonymous ? tr('익명') : p.author, undefined, [
      { text: tr('신고하기'), onPress: () => onReport(p) },
      ...(p.user_id ? [{ text: tr('작성자 차단'), style: 'destructive' as const, onPress: () => onBlock(p) }] : []),
      { text: tr('취소'), style: 'cancel' },
    ]);
  };
  const onReport = (p: Post) => {
    Alert.alert(tr('신고하기'), tr('신고 이유를 골라주세요'), [
      ...REPORT_REASONS.map((r) => ({ text: lang === 'en' ? r.en : r.ko, onPress: async () => {
        try { await reportPost(p, r.key); Alert.alert('', tr('신고가 접수되었습니다. 이 글은 바로 숨겨지며 24시간 안에 검토합니다.')); await load(); }
        catch (e) { Alert.alert('오류', (e as Error).message); }
      } })),
      { text: tr('취소'), style: 'cancel' },
    ]);
  };
  const onBlock = (p: Post) => {
    Alert.alert(tr('작성자 차단'), tr('이 사용자를 차단할까요? 이 사용자의 글이 더 이상 보이지 않습니다.'), [
      { text: tr('취소'), style: 'cancel' },
      { text: tr('작성자 차단'), style: 'destructive', onPress: async () => { try { await blockUser(p.user_id!); await load(); } catch (e) { Alert.alert('오류', (e as Error).message); } } },
    ]);
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
                <Pressable onPress={() => setAnon(!anon)} style={[s.kind, { marginLeft: 'auto' }, anon && s.anonOn]}>
                  <Text style={[s.kindT, anon && { color: c.cream }]}>{anon ? '🙈 ' : ''}{tr('익명')}</Text>
                </Pressable>
              </View>
              {anon
                ? <Body dim size={13} style={{ paddingVertical: 8 }}>{tr('익명으로 올라갑니다. 이름은 보이지 않지만 신고·차단은 가능합니다.')}</Body>
                : remote
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
                <Body bold size={13} dim={!!p.anonymous}>{p.anonymous ? '🙈 ' + tr('익명') : p.author}</Body>
                <Body dim size={13}>{fmtTime(p.created_at)}</Body>
                <Pressable onPress={() => onMenu(p)} hitSlop={10} style={s.more}><Text style={s.moreT}>{myId && p.user_id === myId ? '✕' : '⋯'}</Text></Pressable>
              </View>
              <Body size={15} style={{ marginTop: 8, lineHeight: 25 }}>{p.body}</Body>
              <Pressable onPress={() => onAmen(p)} style={[s.amen, done.has(p.id) && s.amenOn]}>
                <Text style={[s.amenT, done.has(p.id) && { color: c.navy }]}>🙏 {tr('아멘')} {p.amen_count}</Text>
              </Pressable>
            </View>
          ))}
        </Section>
      </ScrollView>

      {/* 첫 글 전 약관(EULA) 동의 — Apple 1.2 */}
      <Modal visible={showEula} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEula(false)}>
        <View style={{ flex: 1, backgroundColor: c.cream }}>
          <Section tone="beige" style={{ paddingTop: 26 }}>
            <SecHead en="COMMUNITY RULES" ko={tr('나눔 벽 이용 약속')} />
          </Section>
          <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
            {lang === 'en' ? (
              <>
                <Body bold size={15}>Zero tolerance for objectionable content.</Body>
                <Body size={14.5} style={{ marginTop: 10 }}>The Story Wall is for sharing grace and prayer requests among members. Profanity, hate speech, sexual content, threats, spam, or sharing others' private information is strictly prohibited.</Body>
                <Body size={14.5} style={{ marginTop: 10 }}>Anonymous posts follow the same rules. You can report any post with the ⋯ menu and block its author. Reported posts are hidden immediately and reviewed within 24 hours; violators are removed. Contact: hello@sanfordstorychurch.com</Body>
              </>
            ) : (
              <>
                <Body bold size={15}>부적절한 콘텐츠는 허용하지 않습니다 (무관용).</Body>
                <Body size={14.5} style={{ marginTop: 10 }}>나눔 벽은 성도들이 은혜와 기도 제목을 나누는 곳입니다. 욕설, 혐오 발언, 성적 표현, 위협, 스팸, 타인의 개인정보 게시는 금지되며 발견 즉시 삭제됩니다.</Body>
                <Body size={14.5} style={{ marginTop: 10 }}>익명 글도 같은 규칙이 적용됩니다. 글의 ⋯ 메뉴에서 신고하거나 작성자를 차단할 수 있습니다. 신고된 글은 바로 숨겨지고 24시간 안에 검토하며, 위반자는 정지됩니다. 문의: hello@sanfordstorychurch.com</Body>
              </>
            )}
            <Pressable onPress={() => Linking.openURL(TERMS_URL)} style={{ marginTop: 16 }}><Body size={14} style={{ textDecorationLine: 'underline', textDecorationColor: c.orange }}>{tr('이용약관 보기')} ↗</Body></Pressable>
            <Btn label={tr('동의하고 계속')} onPress={async () => { try { await acceptEula(); setShowEula(false); await post(); } catch (e) { Alert.alert('오류', (e as Error).message); } }} style={{ marginTop: 26 }} />
            <Btn label={tr('취소')} variant="ghost" onPress={() => setShowEula(false)} style={{ marginTop: 10 }} />
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  banner: { backgroundColor: c.orangeSoft, borderLeftWidth: 4, borderLeftColor: c.orange, padding: 14, borderRadius: 6, marginBottom: 14 },
  compose: { backgroundColor: c.white, borderWidth: 1, borderColor: c.gray, borderRadius: 8, padding: 16 },
  kind: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 4, borderWidth: 1.5, borderColor: c.gray },
  kindOn: { backgroundColor: c.orange, borderColor: c.orange },
  anonOn: { backgroundColor: c.navy, borderColor: c.navy },
  kindT: { fontSize: 13, fontWeight: '600', color: c.inkDim },
  input: { borderBottomWidth: 1.5, borderBottomColor: c.gray, paddingVertical: 10, fontSize: 15, color: c.ink },
  area: { minHeight: 90, textAlignVertical: 'top', lineHeight: 22 },
  post: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.gray },
  chip: { fontSize: 10.5, fontWeight: '700', paddingVertical: 4, paddingHorizontal: 7, borderRadius: 3, backgroundColor: c.beige, color: c.ink, overflow: 'hidden' },
  amen: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 4, borderWidth: 1.5, borderColor: c.gray },
  amenOn: { borderColor: c.orange, backgroundColor: 'rgba(255,154,31,0.15)' },
  amenT: { fontSize: 13, fontWeight: '600', color: c.inkDim },
  more: { marginLeft: 'auto', width: 30, height: 26, alignItems: 'center', justifyContent: 'center' },
  moreT: { fontSize: 16, color: c.inkDim, fontWeight: '700' },
});
