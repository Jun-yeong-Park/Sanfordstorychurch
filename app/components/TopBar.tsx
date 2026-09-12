import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { c, f } from '@/lib/theme';
import { getBulletin } from '@/lib/bulletin';

export default function TopBar({ right }: { right?: string }) {
  const { top } = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingTop: top + 8 }]}>
      <Image source={require('@/assets/mark.png')} style={s.mark} resizeMode="contain" />
      <Text style={s.word}>SANFORD <Text style={{ color: c.orange }}>STORY</Text> CHURCH</Text>
      <Text style={s.right}>{right ?? getBulletin().issue.dateEn}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingBottom: 10, backgroundColor: c.cream, borderBottomWidth: 1, borderBottomColor: c.gray },
  mark: { width: 20, height: 26 },
  word: { fontFamily: f.display, fontSize: 17, color: c.ink, letterSpacing: 1.2 },
  right: { marginLeft: 'auto', fontFamily: f.en, fontSize: 10, letterSpacing: 1.5, color: c.inkDim },
});
