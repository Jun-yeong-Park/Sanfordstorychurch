// 지난 주보 목록
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Card, Empty, Eyebrow, SecHead, Section } from '@/components/ui';
import { getBulletin, issueId, listArchive, type ArchiveItem } from '@/lib/bulletin';
import { useLang } from '@/lib/i18n';
import { c } from '@/lib/theme';

export default function ArchiveScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { lang, tr } = useLang();
  const [items, setItems] = useState<ArchiveItem[] | null>(null);
  useEffect(() => { listArchive().then(setItems); }, []);
  const cur = issueId(getBulletin());
  return (
    <View style={{ flex: 1, backgroundColor: c.cream }}>
      <Section tone="beige" style={{ paddingTop: top + 14 }}>
        <Pressable onPress={() => router.back()}><Eyebrow>← {tr('주보')}</Eyebrow></Pressable>
        <SecHead en="ARCHIVE" ko={tr('지난 주보')} />
      </Section>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {items === null ? <Empty>{tr('불러오는 중…')}</Empty> : items.length === 0 ? <Empty>{tr('지난 주보가 없습니다')}</Empty> : items.map((it) => (
          <Card key={it.issue} accent={it.issue === cur} onPress={() => router.push({ pathname: '/bulletin/[issue]', params: { issue: it.issue } })}>
            <Eyebrow style={it.issue === cur ? { color: c.navy } : undefined}>{lang === 'en' ? it.dateEn : it.date}{it.issue === cur ? ' · THIS SUNDAY' : ''}</Eyebrow>
            <Body bold size={16} style={{ marginTop: 6 }}>{it.title}</Body>
            <Body dim size={13}>{it.scripture} · {it.preacher}</Body>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
