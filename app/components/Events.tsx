// 일정 목록 + "캘린더에 추가"
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { addToCalendar, eventStart, type ChurchEvent } from '@/lib/calendar';
import { useLang } from '@/lib/i18n';
import { c, f } from '@/lib/theme';
import { Body, Empty } from './ui';

const WD_KO = ['일', '월', '화', '수', '목', '금', '토'], WD_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Events({ events }: { events: ChurchEvent[] }) {
  const { lang, tr, L } = useLang();
  const [added, setAdded] = useState<Set<string>>(new Set());
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const list = [...events].filter((e) => eventStart(e).getTime() >= today.getTime() - 86400000).sort((a, b) => eventStart(a).getTime() - eventStart(b).getTime());
  if (!list.length) return <Empty>{tr('일정이 없습니다')}</Empty>;
  const fg = c.ink;

  const add = async (e: ChurchEvent) => {
    const key = e.date + e.time + e.title;
    try {
      await addToCalendar(e, L(e, 'title'), L(e, 'place'), L(e, 'desc'));
      setAdded(new Set([...added, key]));
    } catch (err) { Alert.alert(tr('캘린더에 추가'), (err as Error).message); }
  };

  return (
    <View>
      {list.map((e) => {
        const d = eventStart(e), key = e.date + e.time + e.title;
        const wd = lang === 'en' ? WD_EN[d.getDay()] : WD_KO[d.getDay()];
        const time = d.toLocaleTimeString(lang === 'en' ? 'en-US' : 'ko-KR', { hour: 'numeric', minute: '2-digit' });
        return (
          <View key={key} style={[s.row, { borderTopColor: c.line }]}>
            <View style={s.date}>
              <Text style={[s.day, { color: c.orange }]}>{d.getDate()}</Text>
              <Text style={[s.mon, { color: c.inkDim }]}>{lang === 'en' ? d.toLocaleString('en-US', { month: 'short' }).toUpperCase() : `${d.getMonth() + 1}월`} · {wd}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Body bold size={15}>{L(e, 'title')}</Body>
              <Body dim size={13}>{time}{e.place ? ` · ${L(e, 'place')}` : ''}</Body>
              {!!e.desc && <Body dim size={13}>{L(e, 'desc')}</Body>}
              <Pressable onPress={() => add(e)} disabled={added.has(key)} style={[s.btn, { borderColor: added.has(key) ? c.orange : fg }]}>
                <Text style={[s.btnT, { color: added.has(key) ? c.orange : fg }]}>{added.has(key) ? '✓ ' + tr('추가됨') : '+ ' + tr('캘린더에 추가')}</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, paddingVertical: 14, borderTopWidth: 1 },
  date: { width: 58, alignItems: 'center' },
  day: { fontFamily: f.display, fontSize: 34, lineHeight: 36 },
  mon: { fontFamily: f.en, fontSize: 9.5, letterSpacing: 1, marginTop: 2 },
  btn: { alignSelf: 'flex-start', marginTop: 8, borderWidth: 1.5, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 10 },
  btnT: { fontSize: 12, fontWeight: '700' },
});
