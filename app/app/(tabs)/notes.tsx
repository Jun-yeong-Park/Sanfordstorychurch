// 내 설교 노트 목록 — 이번 주(항상 표시) + 지난 노트
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import TopBar from '@/components/TopBar';
import { Body, Card, Eyebrow, SecHead, Section, Sub } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { fmtIssue, getBulletin, issueId } from '@/lib/bulletin';
import { useLang } from '@/lib/i18n';
import { countAttachments, listNotes, newNote, type Note } from '@/lib/store';
import { isConfigured } from '@/lib/supabase';
import { c, f } from '@/lib/theme';

const fmtTime = (iso: string) => new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function NotesScreen() {
  const D = getBulletin();
  const cur = issueId(D);
  const router = useRouter();
  const { lang, tr } = useLang();
  const { session } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useFocusEffect(useCallback(() => {
    let live = true;
    Promise.all([listNotes(), countAttachments()]).then(([n, k]) => { if (live) { setNotes(n); setCounts(k); } });
    return () => { live = false; };
  }, []));

  const thisWeek = notes.find((n) => n.issue === cur) ?? newNote(cur);
  const past = notes.filter((n) => n.issue !== cur);

  const card = (n: Note, accent = false) => (
    <Card key={n.issue} accent={accent} onPress={() => router.push(`/note/${n.issue}`)}>
      <Eyebrow style={accent ? { color: c.navy } : undefined}>{accent ? `This Sunday · ${D.issue.dateEn}` : lang === 'en' ? n.issue : fmtIssue(n.issue)}</Eyebrow>
      <Body bold size={16.5} style={{ marginTop: 6 }}>{n.title || tr('말씀 노트')}</Body>
      {!!n.scripture && <Body dim size={13}>{n.scripture} · {n.preacher}</Body>}
      <View style={s.meta}>
        <Text style={[s.metaT, { color: c.inkDim }]}>{n.updated_at ? tr('저장') + ' ' + fmtTime(n.updated_at) : tr('아직 노트 없음')}</Text>
        {!!counts[n.issue] && <Text style={[s.metaT, { color: c.inkDim }]}>{tr('첨부')} {counts[n.issue]}</Text>}
        <Text style={[s.metaT, { marginLeft: 'auto', color: accent ? c.navy : c.orange }]}>{tr('열기')} →</Text>
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.cream }}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Section>
          <SecHead en="MY NOTES" ko={tr('말씀 노트')} />
          {card(thisWeek, true)}
          {past.length > 0 && <><Sub>{tr('지난 노트')}</Sub>{past.map((n) => card(n))}</>}
          <Body dim size={12.5} style={{ marginTop: 16 }}>
            {tr('노트·사진·손글씨는 이 기기에만 저장됩니다. 나누고 싶은 내용은 [나눔]에 올리거나 [공유]로 보내세요.')}
            {isConfigured && !session ? ' ' + tr('로그인하면 노트가 서버에 백업됩니다.') : ''}
          </Body>
        </Section>
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  meta: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 },
  metaT: { fontFamily: f.en, fontSize: 10.5, letterSpacing: 1 },
});
