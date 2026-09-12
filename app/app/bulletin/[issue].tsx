// 지난 주보 한 호 보기
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BulletinView from '@/components/BulletinView';
import { Eyebrow } from '@/components/ui';
import { getArchived, getBulletin, issueId, type Bulletin } from '@/lib/bulletin';
import { useLang } from '@/lib/i18n';
import { c } from '@/lib/theme';

export default function PastBulletinScreen() {
  const { issue } = useLocalSearchParams<{ issue: string }>();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { tr } = useLang();
  const [D, setD] = useState<Bulletin | null>(null);
  useEffect(() => { getArchived(issue).then((b) => (b ? setD(b) : router.back())); }, [issue, router]);
  if (!D) return <View style={{ flex: 1, backgroundColor: c.cream }} />;
  return (
    <View style={{ flex: 1, backgroundColor: c.cream }}>
      <BulletinView D={D} isCurrent={issue === issueId(getBulletin())} header={
        <Pressable onPress={() => router.back()} style={{ backgroundColor: c.cream, paddingTop: top + 12, paddingHorizontal: 22 }}>
          <Eyebrow>← {tr('지난 주보')}</Eyebrow>
        </Pressable>
      } />
    </View>
  );
}
