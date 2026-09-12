// "내 캘린더에 추가" — 기본 캘린더에 일정 생성
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

export type ChurchEvent = { date: string; time: string; durationMin?: number; title: string; titleEn?: string; place?: string; placeEn?: string; desc?: string; descEn?: string };

export const eventStart = (e: ChurchEvent) => {
  const [y, m, d] = e.date.split('-').map(Number);
  const [hh, mm] = (e.time || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
};

export async function addToCalendar(e: ChurchEvent, title: string, place: string, notes: string): Promise<void> {
  if (Platform.OS === 'web') throw new Error('브라우저에서는 지원하지 않아요. 앱에서 추가해 주세요.');
  const perm = await Calendar.requestCalendarPermissionsAsync();
  if (!perm.granted) throw new Error('설정에서 캘린더 접근을 허용해 주세요.');
  let calendarId: string;
  if (Platform.OS === 'ios') calendarId = (await Calendar.getDefaultCalendarAsync()).id;
  else {
    const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const writable = cals.find((c) => c.allowsModifications && c.isPrimary) ?? cals.find((c) => c.allowsModifications);
    if (!writable) throw new Error('쓸 수 있는 캘린더가 없어요.');
    calendarId = writable.id;
  }
  const start = eventStart(e);
  const end = new Date(start.getTime() + (e.durationMin ?? 60) * 60 * 1000);
  await Calendar.createEventAsync(calendarId, { title, startDate: start, endDate: end, location: place, notes, alarms: [{ relativeOffset: -120 }] });
}
