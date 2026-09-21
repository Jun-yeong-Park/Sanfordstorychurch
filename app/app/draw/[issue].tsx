// 손글씨 메모 — 손가락/애플펜슬로 쓰고 PNG 로 노트에 첨부
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import { addAttachment } from '@/lib/store';
import { useLang } from '@/lib/i18n';
import { c } from '@/lib/theme';

type Stroke = { color: string; width: number; pts: [number, number][] };
const ERASE = 'erase';
const LINE_GAP = 36;

export default function DrawScreen() {
  const { issue } = useLocalSearchParams<{ issue: string }>();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { tr } = useLang();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState(c.navy);
  const [thick, setThick] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [busy, setBusy] = useState(false);
  const cur = useRef<Stroke | null>(null);
  const paper = useRef<View>(null);

  const pt = (e: GestureResponderEvent): [number, number] => [e.nativeEvent.locationX, e.nativeEvent.locationY];
  const start = (e: GestureResponderEvent) => {
    cur.current = { color, width: color === ERASE ? 24 : thick ? 6 : 3, pts: [pt(e)] };
    setStrokes((s) => [...s, cur.current!]);
  };
  const move = (e: GestureResponderEvent) => {
    if (!cur.current) return;
    cur.current = { ...cur.current, pts: [...cur.current.pts, pt(e)] };
    setStrokes((s) => [...s.slice(0, -1), cur.current!]);
  };
  const end = () => { cur.current = null; };
  const d = (s: Stroke) => s.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + (s.pts.length === 1 ? ' l0.1 0' : '');

  const save = async () => {
    if (!strokes.length) return router.back();
    setBusy(true);
    try {
      const uri = await captureRef(paper, { format: 'png', quality: 1, result: 'tmpfile' });
      await addAttachment(issue, 'drawing', uri);
      router.back();
    } catch (e) { Alert.alert(tr('저장하지 못했어요'), (e as Error).message); setBusy(false); }
  };
  const cancel = () => {
    if (!strokes.length) return router.back();
    Alert.alert(tr('나가기'), tr('저장하지 않고 나갈까요?'), [{ text: tr('취소'), style: 'cancel' }, { text: tr('나가기'), style: 'destructive', onPress: () => router.back() }]);
  };

  const Tool = ({ on, onPress, children, style }: { on?: boolean; onPress: () => void; children: React.ReactNode; style?: object }) => (
    <Pressable onPress={onPress} style={[s.tool, on && s.toolOn, style]}>{children}</Pressable>
  );
  const lines = [];
  for (let y = LINE_GAP; y < size.h; y += LINE_GAP) lines.push(<Line key={y} x1={0} y1={y} x2={size.w} y2={y} stroke={c.gray} strokeWidth={1} />);

  return (
    <View style={{ flex: 1, backgroundColor: c.cream }}>
      <View style={[s.tools, { paddingTop: top + 8 }]}>
        <Tool on={color === c.navy} onPress={() => setColor(c.navy)}><View style={[s.sw, { backgroundColor: c.navy }]} /></Tool>
        <Tool on={color === c.orange} onPress={() => setColor(c.orange)}><View style={[s.sw, { backgroundColor: c.orange }]} /></Tool>
        <Tool on={color === ERASE} onPress={() => setColor(ERASE)}><Text style={s.toolT}>{tr('지움')}</Text></Tool>
        <Tool on={thick} onPress={() => setThick(!thick)}><Text style={s.toolT}>{tr('굵게')}</Text></Tool>
        <View style={{ flex: 1 }} />
        <Tool onPress={() => setStrokes((st) => st.slice(0, -1))}><Text style={[s.toolT, { fontSize: 18 }]}>↶</Text></Tool>
        <Tool onPress={() => strokes.length && Alert.alert(tr('모두 지우기'), tr('전부 지울까요?'), [{ text: tr('취소'), style: 'cancel' }, { text: tr('전체'), style: 'destructive', onPress: () => setStrokes([]) }])}><Text style={s.toolT}>{tr('전체')}</Text></Tool>
        <Tool onPress={cancel}><Text style={[s.toolT, { fontSize: 16 }]}>✕</Text></Tool>
        <Pressable onPress={save} disabled={busy} style={[s.tool, s.save, busy && { opacity: 0.5 }]}><Text style={[s.toolT, { color: c.navy, fontWeight: '700' }]}>{tr('저장')}</Text></Pressable>
      </View>

      <View
        ref={paper}
        collapsable={false}
        style={{ flex: 1, backgroundColor: c.cream }}
        onLayout={(e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={start}
        onResponderMove={move}
        onResponderRelease={end}
        onResponderTerminate={end}
      >
        <Svg width="100%" height="100%">
          {lines}
          {strokes.map((st, i) => (
            <Path key={i} d={d(st)} stroke={st.color === ERASE ? c.cream : st.color} strokeWidth={st.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </Svg>
      </View>
      <View style={{ height: bottom, backgroundColor: c.cream }} />
    </View>
  );
}
const s = StyleSheet.create({
  tools: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingBottom: 8, backgroundColor: c.beige, borderBottomWidth: 1, borderBottomColor: c.gray },
  tool: { width: 38, height: 38, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  toolOn: { backgroundColor: 'rgba(255,154,31,0.22)', borderWidth: 1.5, borderColor: c.orange },
  toolT: { fontSize: 12, fontWeight: '600', color: c.cream },
  sw: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.cream },
  save: { width: 'auto', paddingHorizontal: 14, backgroundColor: c.orange },
});
