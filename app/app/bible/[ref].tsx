// 성경 본문 — 개역개정 / NIV (선데이프로젝트 데이터)
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Display, Empty, Eyebrow, Section } from '@/components/ui';
import { getVerses, parseRef, refLabel } from '@/lib/bible';
import { useLang } from '@/lib/i18n';
import { c, f } from '@/lib/theme';

export default function BibleScreen() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { lang: appLang, tr } = useLang();
  const [lang, setLang] = useState<'ko' | 'en'>(appLang);
  const [whole, setWhole] = useState(false);
  const parsed = useMemo(() => parseRef(ref), [ref]);
  const r = parsed && whole ? { book: parsed.book, chapter: parsed.chapter } : parsed;
  const verses = useMemo(() => (r ? getVerses(r, lang) : []), [r, lang]);
  const inRange = (n: number) => !parsed?.from || (n >= parsed.from && n <= (parsed.to ?? parsed.from));

  return (
    <View style={{ flex: 1, backgroundColor: c.cream }}>
      <Section tone="beige" style={{ paddingTop: top + 14, paddingBottom: 18 }}>
        <Pressable onPress={() => router.back()}><Eyebrow>← {tr('본문')}</Eyebrow></Pressable>
        <Display size={30} color={c.ink} style={{ marginTop: 8 }}>{r ? refLabel(r, lang) : ref}</Display>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {(['ko', 'en'] as const).map((l) => (
            <Pressable key={l} onPress={() => setLang(l)} style={[s.chip, lang === l && s.chipOn]}><Text style={[s.chipT, lang === l && { color: c.navy }]}>{l === 'ko' ? '개역개정' : 'NIV'}</Text></Pressable>
          ))}
          {!!parsed?.from && (
            <Pressable onPress={() => setWhole(!whole)} style={[s.chip, { marginLeft: 'auto' }]}><Text style={s.chipT}>{whole ? tr('구절만 보기') : tr('장 전체 보기')}</Text></Pressable>
          )}
        </View>
      </Section>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 50 }}>
        {!r ? <Empty>{ref}</Empty> : verses.length === 0 ? <Empty>—</Empty> : verses.map((v) => (
          <View key={v.n} style={[s.verse, whole && !inRange(v.n) && { opacity: 0.5 }]}>
            <Text style={s.num}>{v.n}</Text>
            <Body size={17} style={{ flex: 1, lineHeight: 30 }}>{v.text}</Body>
          </View>
        ))}
        {!!r && <Body dim size={11.5} style={{ marginTop: 26 }}>{lang === 'ko' ? '개역개정 · 대한성서공회' : 'Holy Bible, New International Version® · Biblica'}</Body>}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 4, borderWidth: 1.5, borderColor: c.navy },
  chipOn: { backgroundColor: c.orange, borderColor: c.orange },
  chipT: { fontSize: 12.5, fontWeight: '700', color: c.ink },
  verse: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  num: { fontFamily: f.display, fontSize: 17, lineHeight: 30, color: c.orange, width: 24, textAlign: 'right' },
});
