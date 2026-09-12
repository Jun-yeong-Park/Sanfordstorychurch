// 주보 한 호를 세로로 — 이번 주(탭)와 지난 주보(아카이브)가 같이 쓴다
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Btn, Display, Eyebrow, KV, SecHead, Section, Sub } from '@/components/ui';
import SermonMedia from '@/components/SermonMedia';
import { issueId, t, type Bulletin } from '@/lib/bulletin';
import { parseRef } from '@/lib/bible';
import { useLang } from '@/lib/i18n';
import { c, f } from '@/lib/theme';

type Song = { title: string; url?: string };
const money = (n: number) => '$' + n.toLocaleString('en-US');
/** 예배 순서 항목의 찬양 콘티 (data.js `songs`). 없으면 빈 배열. */
const songsOf = (item: object): Song[] => ((item as { songs?: Song[] }).songs ?? []).filter((x) => x?.title);

export default function BulletinView({ D, isCurrent, header }: { D: Bulletin; isCurrent: boolean; header?: React.ReactNode }) {
  const issue = issueId(D);
  const router = useRouter();
  const { lang, tr, L } = useLang();
  const openRef = (ref: string) => router.push({ pathname: '/bible/[ref]', params: { ref } });
  const scripture = L(D.sermon, 'scripture');
  const prayers = (lang === 'en' && D.prayersEn?.length ? D.prayersEn : D.prayers) ?? [];

  /** 성경 구절로 읽히는 텍스트는 탭하면 본문이 열린다 */
  const RefText = ({ text, dim, size = 13 }: { text: string; dim?: boolean; size?: number }) =>
    parseRef(text)
      ? <Pressable onPress={() => openRef(text)}><Body dim={dim} size={size} style={s.refLink}>{text} ›</Body></Pressable>
      : <Body dim={dim} size={size}>{t(text)}</Body>;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
      {header}
      {/* P1 표지 */}
      <Section tone="cream" style={s.cover}>
        <View style={s.between}><Eyebrow>{L(D.issue, 'label')}</Eyebrow><Eyebrow>{D.issue.volume}</Eyebrow></View>
        <Image source={require('@/assets/logo-on-light.png')} style={s.logo} resizeMode="contain" />
        <Display size={46} color={c.ink} style={{ marginTop: 34 }}>GOD'S STORY{'\n'}BEGINS IN{'\n'}<Text style={{ color: c.orange }}>YOUR LIFE.</Text></Display>
        <Body dim size={14} style={{ marginTop: 10 }}>{lang === 'en' ? D.church.tagline : D.church.taglineKo}</Body>
        <View style={[s.between, s.dateRow]}>
          <View>
            <Display size={30} color={c.ink}>{D.issue.dateEn}</Display>
            {lang === 'ko' && <Body dim size={13} style={{ marginTop: 4 }}>{D.issue.date}</Body>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.svc}>SUNDAY WORSHIP</Text>
            <Body dim size={13}>{L(D.issue, 'service')}</Body>
          </View>
        </View>
        <View style={s.sermonBox}>
          <Text style={s.sermonT}>{t(L(D.sermon, 'title'))}</Text>
          <Body dim size={13.5} style={{ marginTop: 5 }}>{scripture} · {D.sermon.preacher}</Body>
        </View>
      </Section>

      {/* P2 예배 순서 */}
      <Section>
        <SecHead en="STORY FLOW" ko={tr('예배의 흐름')} />
        <Eyebrow style={{ marginBottom: 4 }}>{D.issue.dateEn} · {L(D.issue, 'service')}</Eyebrow>
        {D.order.map((p) => (
          <View key={p.tag} style={{ marginTop: 18 }}>
            <View style={s.partH}>
              <Text style={[s.partTag, { color: c.orange }]}>{p.tag}</Text>
              <Text style={s.partTag}>{p.name}</Text>
              <Text style={s.partSub}>{L(p, 'sub')}</Text>
            </View>
            {p.items.map((i, k) => (
              <View key={k} style={s.item}>
                <View style={{ flex: 1 }}>
                  <Body bold size={14.5}>{t(L(i, 'name'))}</Body>
                  {!!i.detail && !songsOf(i).length && <RefText text={L(i, 'detail')} dim />}
                  {songsOf(i).map((song, j) => (
                    <Pressable key={j} onPress={() => Linking.openURL(song.url || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(song.title + ' 찬양'))} style={s.song}>
                      <Text style={s.songPlay}>▶</Text>
                      <Body size={13.5} style={{ flex: 1 }}>{song.title}</Body>
                      {!song.url && <Text style={s.songHint}>YouTube ↗</Text>}
                    </Pressable>
                  ))}
                </View>
                {!!i.by && <Body size={13} bold>{t(i.by)}</Body>}
              </View>
            ))}
          </View>
        ))}
      </Section>

      {/* 오늘의 말씀 — 한 화면의 유일한 주황 블록 */}
      <Section tone="orange">
        <Eyebrow style={{ color: c.navy }}>Today's Scripture{lang === 'ko' ? ' · 오늘의 말씀' : ''}</Eyebrow>
        <Body size={15.5} style={{ marginTop: 12, lineHeight: 27 }}>{t(L(D.sermon, 'excerpt'))}</Body>
        <Pressable onPress={() => openRef(L(D.sermon, 'excerptRef'))}><Text style={[s.ref, { color: c.navy }]}>{L(D.sermon, 'excerptRef')} ›</Text></Pressable>
      </Section>

      {/* P3 설교 */}
      <Section tone="white">
        <SecHead en="SERMON" ko={tr('오늘의 설교')} />
        <Text style={s.sermonTitle}>{t(L(D.sermon, 'title'))}</Text>
        <Body dim size={14} style={{ marginTop: 6 }}>{lang === 'ko' ? `${D.sermon.scripture} · ${D.sermon.scriptureEn}` : D.sermon.scriptureEn}{'\n'}{D.sermon.preacher}</Body>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <Btn label={'📖  ' + tr('본문 읽기')} variant="ghost" onPress={() => openRef(D.sermon.scripture)} style={{ flex: 1 }} />
          <Btn label={'✍️  ' + tr('말씀 노트')} onPress={() => router.push(`/note/${issue}`)} style={{ flex: 1 }} disabled={!isCurrent} />
        </View>
        <SermonMedia video={D.sermon.video} audio={D.sermon.audio} />
      </Section>

      {/* P4 소식 */}
      <Section>
        <SecHead en="STORY NEWS" ko={tr('교회 소식')} />
        {D.news.map((n, i) => (
          <View key={i} style={s.newsItem}>
            <Text style={s.newsNo}>{String(i + 1).padStart(2, '0')}</Text>
            <View style={{ flex: 1 }}>
              <Body bold size={14.5}>{t(L(n, 'title'))}</Body>
              <Body size={14.5} style={{ lineHeight: 22 }}>{t(L(n, 'body'))}</Body>
            </View>
          </View>
        ))}
      </Section>

      <Section tone="beige">
        <Sub first>Small Groups · {tr('모임')}</Sub>
        {D.groups.map((g) => (
          <View key={g.name} style={[s.grp, { borderTopColor: c.line }]}>
            <Body size={14.5}><Text style={{ fontWeight: '700' }}>{g.name}</Text> · {L(g, 'desc')}</Body>
            <Body dim size={13}>{L(g, 'when')} · {g.contact}</Body>
          </View>
        ))}
        <Sub>Prayer · {tr('기도 제목')}</Sub>
        {prayers.map((p, i) => (
          <View key={i} style={[s.pr, { borderTopColor: c.line }]}>
            <View style={s.prDot} />
            <Body size={14.5} style={{ flex: 1 }}>{t(p)}</Body>
          </View>
        ))}
      </Section>

      <Section>
        <Sub first>Next Week · {tr('다음 주')}</Sub>
        <KV rows={[[tr('날짜'), L(D.nextWeek, 'date')], [tr('본문'), <RefText text={L(D.nextWeek, 'scripture')} size={14.5} />], [tr('제목'), t(L(D.nextWeek, 'title'))], [tr('섬김'), L(D.nextWeek, 'serving')]]} />
        <Sub>Serving · {tr('섬기는 분들')}</Sub>
        <KV rows={[...D.team, ...D.thisWeek].map((x) => [L(x, 'role'), x.name] as [string, string])} />
        {!!D.offering && (
          <>
            <Sub>Offering · {tr('헌금 보고')} ({D.offering.week})</Sub>
            <View style={s.offRow}>
              {D.offering.items.map((o) => (
                <View key={o.name} style={s.offCell}><Text style={s.offName}>{o.name}</Text><Text style={s.offAmt}>{money(o.amount)}</Text></View>
              ))}
              <View style={[s.offCell, s.offTotal]}><Text style={s.offName}>{tr('합계')} Total</Text><Text style={[s.offAmt, { color: c.orange }]}>{money(D.offering.items.reduce((a, o) => a + o.amount, 0))}</Text></View>
            </View>
            <Body dim size={12} style={{ marginTop: 8 }}>{t(D.offering.note)}</Body>
          </>
        )}
      </Section>

      <Section tone="beige" style={{ paddingBottom: 34, borderTopWidth: 4, borderTopColor: c.orange }}>
        <Image source={require('@/assets/logo-on-light.png')} style={[s.logo, { width: '44%', height: 60, marginTop: 0, marginBottom: 16, alignSelf: 'flex-start' }]} resizeMode="contain" />
        <Body size={13} style={{ lineHeight: 22 }}>
          <Text style={{ fontWeight: '700' }}>{D.church.nameKo} {D.church.nameEn}</Text>{'\n'}
          {D.church.address}{'\n'}
          <Text style={{ color: c.orange, fontWeight: '600' }}>{D.church.web}</Text> · {D.church.instagram}{'\n'}
          {D.church.email}{'\n'}{L(D.church, 'giving')}
        </Body>
        <Body dim size={12} style={{ marginTop: 8 }}>{D.church.legal}</Body>
      </Section>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cover: { paddingTop: 30, paddingHorizontal: 22 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  logo: { width: '68%', height: 92, alignSelf: 'center', marginTop: 30 },
  dateRow: { marginTop: 28, borderTopWidth: 1.5, borderTopColor: c.navy, paddingTop: 16 },
  svc: { fontFamily: f.en, fontSize: 11, letterSpacing: 1.5, color: c.orange, marginBottom: 2 },
  sermonBox: { marginTop: 18, backgroundColor: c.orange, borderRadius: 6, paddingVertical: 14, paddingHorizontal: 16 },
  sermonT: { fontSize: 18, fontWeight: '700', lineHeight: 25, color: c.navy },
  partH: { flexDirection: 'row', alignItems: 'baseline', gap: 8, borderBottomWidth: 1.5, borderBottomColor: c.navy, paddingBottom: 6, marginBottom: 4 },
  partTag: { fontFamily: f.display, fontSize: 24, color: c.ink },
  partSub: { marginLeft: 'auto', fontSize: 11, color: c.inkDim, fontWeight: '500', textAlign: 'right', flexShrink: 1 },
  item: { flexDirection: 'row', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: c.line, borderStyle: 'dotted' },
  refLink: { textDecorationLine: 'underline', textDecorationColor: c.orange },
  song: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  songPlay: { color: c.orange, fontSize: 10, width: 14 },
  songHint: { fontFamily: f.en, fontSize: 9, letterSpacing: 1, color: c.inkDim },
  ref: { textAlign: 'right', fontFamily: f.en, fontSize: 11, letterSpacing: 1.5, marginTop: 12, color: c.orange },
  sermonTitle: { fontSize: 21, fontWeight: '700', lineHeight: 29, color: c.ink },
  offRow: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: c.gray, borderRadius: 6, overflow: 'hidden', backgroundColor: c.white },
  offCell: { width: '50%', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderRightWidth: 1, borderColor: c.gray },
  offTotal: { backgroundColor: c.cream },
  offName: { fontSize: 11.5, color: c.inkDim },
  offAmt: { fontSize: 17, fontWeight: '700', color: c.ink, marginTop: 2 },
  newsItem: { flexDirection: 'row', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.line, borderStyle: 'dotted' },
  newsNo: { fontFamily: f.display, fontSize: 22, color: c.orange, width: 30, lineHeight: 26 },
  grp: { paddingVertical: 9, borderTopWidth: 1 },
  pr: { flexDirection: 'row', gap: 10, paddingVertical: 8, borderTopWidth: 1, alignItems: 'flex-start' },
  prDot: { width: 7, height: 7, backgroundColor: c.orange, marginTop: 8 },
});
