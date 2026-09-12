// 주보 탭 — 이번 주 주보 + 지난 주보 링크
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import TopBar from '@/components/TopBar';
import BulletinView from '@/components/BulletinView';
import { getBulletin } from '@/lib/bulletin';
import { useLang } from '@/lib/i18n';
import { c, f } from '@/lib/theme';

export default function BulletinScreen() {
  const router = useRouter();
  const { tr } = useLang();
  return (
    <View style={{ flex: 1, backgroundColor: c.cream }}>
      <TopBar />
      <BulletinView D={getBulletin()} isCurrent header={
        <Pressable onPress={() => router.push('/archive')} style={s.archive}>
          <Text style={s.archiveT}>{tr('지난 주보')} ›</Text>
        </Pressable>
      } />
    </View>
  );
}
const s = StyleSheet.create({
  archive: { backgroundColor: c.cream, paddingHorizontal: 22, paddingTop: 10, alignItems: 'flex-end' },
  archiveT: { fontFamily: f.en, fontSize: 10.5, letterSpacing: 1.5, color: c.orange, textTransform: 'uppercase' },
});
