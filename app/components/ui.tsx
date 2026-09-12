import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { c, f, sp } from '@/lib/theme';

type Tone = 'cream' | 'beige' | 'white' | 'orange';
const bgOf = (tone: Tone) => (tone === 'beige' ? c.beige : tone === 'white' ? c.white : tone === 'orange' ? c.orange : c.cream);

/** 크림 / 베이지 / 화이트 섹션을 번갈아 쌓고, 주황은 한 화면에 한 블록만 (강조) */
export function Section({ tone = 'cream', children, style }: { tone?: Tone; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.section, { backgroundColor: bgOf(tone) }, style]}>{children}</View>;
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.eyebrow, style]}>{children}</Text>;
}

export function Display({ children, size = 30, color = c.ink, style }: { children: ReactNode; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: f.display, fontSize: size, lineHeight: size * 1.0, color, letterSpacing: size * 0.01 }, style]}>{children}</Text>;
}

/** "STORY FLOW  예배의 흐름" 식 섹션 머리 */
export function SecHead({ en, ko }: { en: string; ko: string }) {
  return (
    <View style={s.secHead}>
      <Display color={c.ink}>{en}</Display>
      <Text style={[s.secKo, { color: c.inkDim }]}>{ko}</Text>
    </View>
  );
}

export function Sub({ children, first }: { children: ReactNode; first?: boolean }) {
  return <Text style={[s.eyebrow, { marginTop: first ? 0 : sp.xl, marginBottom: sp.sm }]}>{children}</Text>;
}

/** 한글 본문 — 시스템 폰트 */
export function Body({ children, dim, size = 15, bold, style }: { children: ReactNode; dim?: boolean; size?: number; bold?: boolean; style?: StyleProp<TextStyle> }) {
  const color = dim ? c.inkDim : c.ink;
  return <Text style={[{ fontSize: size, lineHeight: size * 1.6, color, fontWeight: bold ? '700' : '400' }, style]}>{children}</Text>;
}

export function Btn({ label, onPress, variant = 'primary', small, disabled, style }: {
  label: string; onPress: () => void; variant?: 'primary' | 'ghost'; small?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const ghost = variant === 'ghost';
  const line = c.navy;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn, small && s.btnSmall,
        ghost ? { borderColor: line, backgroundColor: 'transparent' } : { borderColor: c.orange, backgroundColor: c.orange },
        (pressed || disabled) && { opacity: 0.55 },
        style,
      ]}
    >
      <Text style={[s.btnText, small && { fontSize: 13 }, { color: ghost ? line : c.navy }]}>{label}</Text>
    </Pressable>
  );
}

export function KV({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <View>
      {rows.map(([k, v], i) => (
        <View key={i} style={[s.kvRow, { borderTopColor: c.line }]}>
          <Text style={[s.kvKey, { color: c.inkDim }]}>{k}</Text>
          {typeof v === 'string' ? <Text style={[s.kvVal, { color: c.ink }]}>{v}</Text> : <View style={{ flex: 1 }}>{v}</View>}
        </View>
      ))}
    </View>
  );
}

/** accent = 이번 주 카드 — 주황 바탕 */
export function Card({ children, accent, onPress, style }: { children: ReactNode; accent?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const base = [s.card, accent && { backgroundColor: c.orange, borderColor: c.orange }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.8 }]}>{children}</Pressable>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <Text style={s.empty}>{children}</Text>;
}

const s = StyleSheet.create({
  section: { paddingVertical: sp.xl, paddingHorizontal: sp.lg },
  eyebrow: { fontFamily: f.en, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.orange },
  secHead: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: sp.md },
  secKo: { fontSize: 13, fontWeight: '600' },
  btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  btnSmall: { paddingVertical: 10, paddingHorizontal: 14 },
  btnText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  kvRow: { flexDirection: 'row', gap: 12, paddingVertical: 7, borderTopWidth: 1 },
  kvKey: { width: 92, fontSize: 14.5, lineHeight: 22 },
  kvVal: { flex: 1, fontSize: 14.5, lineHeight: 22, fontWeight: '600' },
  card: { backgroundColor: c.white, borderWidth: 1, borderColor: c.gray, borderRadius: 8, padding: 18, marginTop: sp.md },
  empty: { textAlign: 'center', paddingVertical: 30, color: c.inkDim, fontSize: 14 },
});
