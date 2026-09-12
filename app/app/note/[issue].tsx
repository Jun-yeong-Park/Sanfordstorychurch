// 말씀 노트 편집 — 인쇄 주보 P3 와 같은 His / My / Deep Story 3단 + 기도 카드, 사진·손글씨 첨부, 자동 저장
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import SermonMedia from '@/components/SermonMedia';
import { Body, Btn, Display, Eyebrow, Section } from '@/components/ui';
import { getBulletin, issueId } from '@/lib/bulletin';
import { parseRef } from '@/lib/bible';
import { useLang } from '@/lib/i18n';
import { syncStoryReminder } from '@/lib/notify';
import { NOTE_STEPS, addAttachment, getNote, listAttachments, newNote, noteToText, removeAttachment, saveNote, type Attachment, type Note } from '@/lib/store';
import { c, f, sp } from '@/lib/theme';

const fmtTime = (iso: string) => new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function NoteScreen() {
  const { issue } = useLocalSearchParams<{ issue: string }>();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { lang, tr } = useLang();
  const [note, setNote] = useState<Note | null>(null);
  const [atts, setAtts] = useState<Attachment[]>([]);
  const [saved, setSaved] = useState('');
  const [viewing, setViewing] = useState<Attachment | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getNote(issue).then((n) => {
      if (n) return setNote(n);
      if (issue !== issueId(getBulletin())) return router.back();  // 지난 주 노트가 없으면 만들 수 없음
      setNote(newNote(issue));
    });
  }, [issue, router]);
  // 손글씨 화면에서 돌아오면 첨부 다시 읽기
  useFocusEffect(useCallback(() => { listAttachments(issue).then(setAtts); }, [issue]));

  const edit = (key: string, v: string) => {
    if (!note) return;
    const n = { ...note, text: { ...note.text, [key]: v } };
    setNote(n);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const s = await saveNote(n); setSaved(tr('저장') + ' · ' + fmtTime(s.updated_at!));
      if (key === 'deep' || key === 'story') syncStoryReminder(s, lang).catch(() => {});   // 결단 → 수요일 팔로업 알림
    }, 500);
  };

  const pick = async (camera: boolean) => {
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('권한이 필요해요', '설정에서 카메라/사진 접근을 허용해 주세요.');
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
    const r = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (r.canceled) return;
    await addAttachment(issue, 'photo', r.assets[0].uri);
    setAtts(await listAttachments(issue));
  };
  const del = async (a: Attachment) => {
    Alert.alert('첨부 삭제', '이 첨부를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => { await removeAttachment(a); setViewing(null); setAtts(await listAttachments(issue)); } },
    ]);
  };

  if (!note) return <View style={{ flex: 1, backgroundColor: c.cream }} />;
  const D = getBulletin();
  const isCur = issue === issueId(D);
  // 구버전 노트(개요별 칸 · 자유 노트 · Story Card)에 내용이 있으면 그 칸도 같이 보여준다
  const legacy: { key: string; label: string }[] = [
    ...note.outline.map((pt, i) => ({ key: 'o' + i, label: pt })).filter((f) => note.text[f.key]),
    ...(note.text.free ? [{ key: 'free', label: tr('자유 노트') }] : []),
    ...(note.text.story ? [{ key: 'story', label: tr('My Story Card · 오늘의 결단') }] : []),
  ];
  const scriptureRef = parseRef(note.scripture) ? note.scripture : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Section tone="beige" style={{ paddingTop: top + 14 }}>
          <Pressable onPress={() => router.back()}><Eyebrow>← My Notes · {issue}</Eyebrow></Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
            <Display size={26}>SERMON NOTE</Display><Text style={{ fontSize: 13, fontWeight: '600', color: c.inkDim }}>{tr('말씀 노트')}</Text>
          </View>
          <Body bold size={19} style={{ marginTop: 6, lineHeight: 26 }}>{note.title || tr('말씀 노트')}</Body>
          {!!note.scripture && (
            <Pressable disabled={!scriptureRef} onPress={() => router.push({ pathname: '/bible/[ref]', params: { ref: scriptureRef! } })}>
              <Body dim size={13.5} style={[{ marginTop: 4 }, scriptureRef && { textDecorationLine: 'underline', textDecorationColor: c.orange }]}>📖 {note.scripture} · {note.preacher}</Body>
            </Pressable>
          )}
          {isCur && <SermonMedia video={D.sermon.video} audio={D.sermon.audio} />}
          <Text style={s.saved}>{saved || (note.updated_at ? tr('저장') + ' · ' + fmtTime(note.updated_at) : ' ')}</Text>
        </Section>

        {/* 흐름형 3단 — 인쇄 주보 P3 와 동일 */}
        {NOTE_STEPS.map((st) => (
          <View key={st.key} style={[s.step, st.key === 'deep' && s.stepDeep]}>
            <View style={s.stepH}>
              <Text style={s.stepN}>{st.n}</Text>
              <Display size={20}>{st.en}</Display>
              <Text style={s.stepKo}>{lang === 'en' ? st.enKo : st.ko}</Text>
              <Text style={s.stepTag}>{lang === 'en' ? st.tagEn : st.tag}</Text>
            </View>
            <Body dim size={12.5} style={{ marginTop: 4 }}>{lang === 'en' ? st.qEn : st.q}</Body>
            <TextInput multiline value={note.text[st.key] ?? ''} onChangeText={(v) => edit(st.key, v)} style={s.box} placeholder="…" placeholderTextColor={c.gray} scrollEnabled={false} />
            {st.key === 'deep' && (
              <View style={{ marginTop: 12 }}>
                <Body bold size={13.5}>{tr('결단 돌아보기')}</Body>
                <Body dim size={12.5}>{tr('주중에 한 줄 — 결단이 어떻게 되고 있나요?')}</Body>
                <TextInput multiline value={note.text.followup ?? ''} onChangeText={(v) => edit('followup', v)} style={[s.box, { minHeight: 48 }]} placeholder="…" placeholderTextColor={c.gray} scrollEnabled={false} />
              </View>
            )}
          </View>
        ))}
        {legacy.map((fd) => (
          <View key={fd.key} style={s.field}>
            <Body bold size={14.5}>{fd.label}</Body>
            <TextInput multiline value={note.text[fd.key] ?? ''} onChangeText={(v) => edit(fd.key, v)} style={s.ta} placeholder="…" placeholderTextColor={c.gray} scrollEnabled={false} />
          </View>
        ))}

        {/* 기도 카드 — 인쇄판의 절취 카드. 앱에서는 [나눔]으로 올린다 */}
        <View style={[s.field, s.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <Display size={18}>PRAYER CARD</Display>
            <Text style={{ fontSize: 12, color: c.inkDim, flex: 1 }} numberOfLines={1}>{tr('기도 제목 · 함께 기도해 주세요')}</Text>
          </View>
          <TextInput multiline value={note.text.prayer ?? ''} onChangeText={(v) => edit('prayer', v)} style={[s.box, { minHeight: 64 }]} placeholder="…" placeholderTextColor={c.gray} scrollEnabled={false} />
          <Btn label={tr('나눔 벽에 기도 부탁 올리기')} small onPress={() => router.push({ pathname: '/(tabs)/wall', params: { from: issue, kind: 'prayer' } })} style={{ alignSelf: 'flex-start', marginTop: 10 }} />
        </View>

        <View style={[s.field, { paddingTop: 26 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <Display>ATTACH</Display><Text style={{ fontSize: 13, fontWeight: '600', color: c.inkDim }}>{tr('주보 사진 · 손글씨')}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Btn label={tr('📷 종이 주보 찍기')} variant="ghost" small onPress={() => pick(true)} />
            <Btn label={tr('🖼 앨범')} variant="ghost" small onPress={() => pick(false)} />
            <Btn label={tr('✍️ 손글씨')} variant="ghost" small onPress={() => router.push(`/draw/${issue}`)} />
          </View>
          {atts.length === 0 ? (
            <Body dim size={13.5} style={{ marginTop: 14 }}>{tr('아직 첨부가 없어요. 종이 주보에 적은 메모를 찍어 두거나 손글씨로 남겨보세요.')}</Body>
          ) : (
            <View style={s.grid}>
              {atts.map((a) => (
                <Pressable key={a.id} onPress={() => setViewing(a)} style={s.th}>
                  <Image source={{ uri: a.uri }} style={{ width: '100%', height: '100%' }} />
                  <Text style={s.thTag}>{a.kind === 'photo' ? '사진' : '손글씨'}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={[s.field, { gap: 10, paddingTop: 26 }]}>
          <Btn label={tr('공유하기 (카톡 · 메시지)')} variant="ghost" onPress={() => Share.share({ message: noteToText(note) })} />
          <Btn label={tr('나눔 벽에 결단 올리기')} onPress={() => router.push({ pathname: '/(tabs)/wall', params: { from: issue, kind: 'share' } })} />
        </View>
      </ScrollView>

      <Modal visible={!!viewing} animationType="fade" onRequestClose={() => setViewing(null)}>
        <View style={{ flex: 1, backgroundColor: c.beige, paddingTop: top }}>
          {viewing && <Image source={{ uri: viewing.uri }} style={{ flex: 1, margin: 12 }} resizeMode="contain" />}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingBottom: 30 }}>
            <Btn label="삭제" variant="ghost" small onPress={() => viewing && del(viewing)} />
            <Btn label="닫기" small onPress={() => setViewing(null)} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  saved: { marginTop: 12, fontFamily: f.en, fontSize: 10, letterSpacing: 1.5, color: c.inkDim, textTransform: 'uppercase' },
  field: { paddingHorizontal: sp.lg, paddingTop: 16 },
  ta: { marginTop: 4, minHeight: 84, fontSize: 15.5, lineHeight: 26, color: c.ink, borderBottomWidth: 1.5, borderBottomColor: c.navy, paddingVertical: 6, textAlignVertical: 'top' },
  step: { paddingHorizontal: sp.lg, paddingTop: 22 },
  stepDeep: { backgroundColor: c.beige, paddingBottom: 18, marginTop: 8 },
  stepH: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  stepN: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: c.orange, color: c.orange, textAlign: 'center', lineHeight: 20, fontSize: 12, fontWeight: '700', alignSelf: 'center' },
  stepKo: { fontSize: 13, fontWeight: '600', color: c.inkDim },
  stepTag: { marginLeft: 'auto', fontSize: 11, color: c.inkDim },
  box: { marginTop: 8, minHeight: 110, fontSize: 15.5, lineHeight: 26, color: c.ink, backgroundColor: c.white, borderWidth: 1, borderColor: c.gray, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, textAlignVertical: 'top' },
  card: { marginHorizontal: sp.lg, marginTop: 22, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderWidth: 1.5, borderColor: c.navy, borderStyle: 'dashed', backgroundColor: c.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  th: { width: '31%', aspectRatio: 1, borderRadius: 6, overflow: 'hidden', backgroundColor: c.white, borderWidth: 1, borderColor: c.gray },
  thTag: { position: 'absolute', left: 6, bottom: 6, fontSize: 10, fontWeight: '700', backgroundColor: c.orange, color: c.navy, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 3, overflow: 'hidden' },
});
