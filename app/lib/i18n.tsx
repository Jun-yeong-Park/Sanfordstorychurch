// 한국어/영어 — 주보 데이터는 `…En` 필드, UI 문구는 아래 사전. 없으면 한글 그대로.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'ko' | 'en';
const KEY = 'lang';

const EN: Record<string, string> = {
  '주보': 'Bulletin', '노트': 'Notes', '나눔': 'Wall', '교회': 'Church',
  '예배 순서': 'Order of Worship', '오늘의 말씀': "Today's Scripture", '오늘의 설교': "Today's Sermon", '교회 소식': 'Church News',
  '모임': 'Small Groups', '기도 제목': 'Prayer', '다음 주': 'Next Week', '섬기는 분들': 'Serving', '날짜': 'Date', '본문': 'Scripture', '제목': 'Title', '섬김': 'Serving',
  '설교 노트 쓰기': 'Write Sermon Notes', '본문 읽기': 'Read the Passage', '지난 주보': 'Past Bulletins', '설교 다시 듣기': 'Listen Again', '설교 영상 (YouTube)': 'Sermon Video (YouTube)',
  '설교 노트': 'Sermon Notes', '지난 노트': 'Past Notes', '아직 노트 없음': 'No notes yet', '저장': 'Saved', '첨부': 'Attached', '열기': 'Open',
  '노트·사진·손글씨는 이 기기에만 저장됩니다. 나누고 싶은 내용은 [나눔]에 올리거나 [공유]로 보내세요.': 'Notes, photos and handwriting stay on this device. Share to the Wall or via Share when you want.',
  '로그인하면 노트가 서버에 백업됩니다.': 'Sign in to back up your notes.',
  '자유 노트': 'Free Notes', '들으며 마음에 남은 말씀, 질문': 'What stayed with you, questions',
  'My Story Card · 오늘의 결단': "My Story Card · Today's Commitment", '오늘 말씀을 들고 이번 주 내 삶에서 살아낼 한 가지': 'One thing to live out this week',
  '결단 돌아보기': 'Looking Back', '주중에 한 줄 — 결단이 어떻게 되고 있나요?': 'Midweek: how is your commitment going?',
  '테이블 나눔 · 중보기도에서 함께 기도할 것': 'For table sharing and intercession',
  '주보 사진 · 손글씨': 'Bulletin photo · Handwriting', '📷 종이 주보 찍기': '📷 Photo of paper bulletin', '🖼 앨범': '🖼 Library', '✍️ 손글씨': '✍️ Handwriting',
  '아직 첨부가 없어요. 종이 주보에 적은 메모를 찍어 두거나 손글씨로 남겨보세요.': 'Nothing attached yet. Snap your paper bulletin or write by hand.',
  '공유하기 (카톡 · 메시지)': 'Share (Messages · KakaoTalk)', '나눔 벽에 결단 올리기': 'Post commitment to the Wall',
  '은혜 나눔 · 기도': 'Sharing · Prayer', '은혜 나눔': 'Sharing', '기도 부탁': 'Prayer Request', '이름': 'Name', '올리기': 'Post',
  '오늘 말씀에서 받은 은혜 한 가지, 또는 함께 기도할 제목': 'One thing you received today, or a prayer request',
  '첫 이야기를 올려보세요.': 'Be the first to share.', '불러오는 중…': 'Loading…', '아멘': 'Amen',
  '지금은 이 기기에만 저장됩니다.': 'Saved on this device only for now.', '로그인하고 나누기': 'Sign in to share',
  '예배 안내': 'Visit', '예배': 'Worship', '장소': 'Location', '이메일': 'Email', '헌금': 'Giving', '소속': 'Affiliation',
  '일정': 'Events', '캘린더에 추가': 'Add to calendar', '추가됨': 'Added', '일정이 없습니다': 'No upcoming events',
  '내 계정': 'My Account', '로그인 (이메일 코드)': 'Sign in (email code)', '로그아웃': 'Sign out', '표시 이름': 'Display name', '언어': 'Language',
  '주일': 'Sunday', '개역개정': 'KRV', '장 전체 보기': 'Whole chapter', '구절만 보기': 'Passage only',
  '지난 주보가 없습니다': 'No past bulletins yet',
  '말씀 노트': 'Sermon Note', '예배의 흐름': 'Story Flow', '기도 제목 · 함께 기도해 주세요': 'Prayer request · pray with us',
  '나눔 벽에 기도 부탁 올리기': 'Post prayer request to the Wall', '헌금 보고': 'Offering Report', '합계': 'Total',
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; tr: (ko: string) => string; L: <T extends object>(o: T, key: keyof T & string) => string };
const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');
  useEffect(() => { AsyncStorage.getItem(KEY).then((v) => v === 'en' && setLangState('en')); }, []);
  const value = useMemo<Ctx>(() => ({
    lang,
    setLang: (l) => { setLangState(l); AsyncStorage.setItem(KEY, l); },
    tr: (ko) => (lang === 'en' ? EN[ko] ?? ko : ko),
    L: (o, key) => {
      const en = (o as Record<string, unknown>)[key + 'En'];
      const ko = (o as Record<string, unknown>)[key];
      return String(lang === 'en' && en ? en : ko ?? '');
    },
  }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
export function useLang(): Ctx {
  const v = useContext(LangContext);
  if (!v) throw new Error('useLang outside LangProvider');
  return v;
}
