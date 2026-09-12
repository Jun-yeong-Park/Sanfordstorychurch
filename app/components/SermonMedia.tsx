// 설교 다시 듣기 — 유튜브 링크는 앱으로 열고, mp3 는 안에서 재생
import { useEffect } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useLang } from '@/lib/i18n';
import { c, f } from '@/lib/theme';
import { Btn } from './ui';

export default function SermonMedia({ video, audio }: { video?: string; audio?: string }) {
  const { tr } = useLang();
  if (!video && !audio) return null;
  return (
    <View style={{ gap: 10, marginTop: 14 }}>
      {!!video && <Btn label={'▶  ' + tr('설교 영상 (YouTube)')} variant="ghost" onPress={() => Linking.openURL(video)} />}
      {!!audio && <AudioPlayer uri={audio} />}
    </View>
  );
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function AudioPlayer({ uri }: { uri: string }) {
  const { tr } = useLang();
  const player = useAudioPlayer({ uri });
  const st = useAudioPlayerStatus(player);
  useEffect(() => { setAudioModeAsync({ playsInSilentMode: true }).catch(() => {}); }, []);
  const fg = c.navy;
  const pct = st.duration ? Math.min(100, (st.currentTime / st.duration) * 100) : 0;
  return (
    <View style={[s.box, { borderColor: fg }]}>
      <Pressable onPress={() => (st.playing ? player.pause() : player.play())} style={[s.play, { backgroundColor: c.orange }]}>
        <Text style={{ color: c.navy, fontSize: 16, fontWeight: '700' }}>{st.playing ? '❚❚' : '▶'}</Text>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[s.label, { color: fg }]}>{tr('설교 다시 듣기')}</Text>
        <View style={[s.bar, { backgroundColor: c.gray }]}><View style={[s.fill, { width: `${pct}%` }]} /></View>
        <Text style={[s.time, { color: fg }]}>{mmss(st.currentTime)} / {st.isLoaded ? mmss(st.duration) : '--:--'}</Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 6, padding: 12 },
  play: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700' },
  bar: { height: 4, borderRadius: 2, marginTop: 7, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: c.orange },
  time: { fontFamily: f.en, fontSize: 10, letterSpacing: 1, marginTop: 5 },
});
