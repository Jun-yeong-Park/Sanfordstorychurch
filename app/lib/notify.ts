// 결단(Deep Story) 팔로업 — 주일에 적은 결단을 수요일 저녁 8시에 다시 보여준다.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import type { Note } from './store';

const KEY = 'notify.story';   // { issue, id }
const CHANNEL = 'story';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  if (!cur.canAskAgain) return false;
  return !!(await Notifications.requestPermissionsAsync()).granted;
}

/** 주보 날짜(주일) 다음 수요일 20:00. 이미 지났으면 null. */
function followupTime(issue: string): Date | null {
  const [y, m, d] = issue.split('-').map(Number);
  if (!d) return null;
  const at = new Date(y, m - 1, d, 20, 0, 0);
  at.setDate(at.getDate() + ((3 - at.getDay() + 7) % 7 || 7));   // 다음 수요일
  return at.getTime() > Date.now() ? at : null;
}

/** 노트 저장 때마다 호출 — 결단이 있으면 (재)예약, 없으면 취소. 권한 없으면 조용히 넘어간다. */
export async function syncStoryReminder(note: Note, lang: 'ko' | 'en') {
  if (Platform.OS === 'web') return;
  const prev = JSON.parse((await AsyncStorage.getItem(KEY)) ?? 'null') as { issue: string; id: string } | null;
  if (prev?.issue === note.issue) { await Notifications.cancelScheduledNotificationAsync(prev.id).catch(() => {}); await AsyncStorage.removeItem(KEY); }
  // 결단 = Deep Story (구버전 노트는 story 칸)
  const story = (note.text.deep ?? note.text.story ?? '').trim();
  const at = followupTime(note.issue);
  if (!story || !at) return;
  if (!(await requestPermission())) return;
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Story Card', importance: Notifications.AndroidImportance.DEFAULT });
  const short = story.length > 60 ? story.slice(0, 60) + '…' : story;
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: lang === 'en' ? 'Your Story Card this week' : '이번 주 결단, 어떻게 되고 있어요?',
      body: `“${short}”`,
      data: { issue: note.issue },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
  });
  await AsyncStorage.setItem(KEY, JSON.stringify({ issue: note.issue, id }));
}
