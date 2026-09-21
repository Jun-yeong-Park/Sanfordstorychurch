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
  // sign-in
  '닫기': 'Close', '이메일 주소': 'Email address', '이메일 주소를 확인해 주세요': 'Please check the email address', '코드를 보내지 못했어요': "Couldn't send the code",
  '6자리 코드를 입력해 주세요': 'Enter the 6-digit code', '코드가 맞지 않아요': "That code didn't match", '이메일과 비밀번호를 입력해 주세요': 'Enter email and password', '로그인하지 못했어요': "Couldn't sign in",
  '이메일로 받은 6자리 코드로 들어옵니다. 비밀번호는 없어요.\n나눔 글쓰기와 노트 백업에만 쓰입니다.': 'Sign in with a 6-digit code sent to your email. No password.\nOnly needed for posting on the Wall and backing up notes.',
  '보내는 중…': 'Sending…', '코드 받기': 'Send code', '확인 중…': 'Checking…', '시작하기': 'Continue', '다른 이메일로': 'Use another email', '이메일 코드로 로그인': 'Sign in with email code',
  '으로 보낸 6자리 코드를 입력하세요.': ': enter the 6-digit code we sent.',
  // note / draw
  '권한이 필요해요': 'Permission needed', '설정에서 카메라/사진 접근을 허용해 주세요.': 'Allow camera/photo access in Settings.', '첨부 삭제': 'Delete attachment', '이 첨부를 삭제할까요?': 'Delete this attachment?',
  '사진': 'Photo', '손글씨': 'Handwriting', '저장하지 못했어요': "Couldn't save", '나가기': 'Leave', '저장하지 않고 나갈까요?': 'Leave without saving?', '지움': 'Erase', '굵게': 'Bold', '전체': 'Clear', '모두 지우기': 'Clear all', '전부 지울까요?': 'Clear everything?',
  '기도 카드 · 기도 제목': 'Prayer Card', '설교 중': 'During sermon', '묵상 · 나눔': 'Reflect · Share', '결단': 'Response',
  // wall
  '내용을 적어주세요': 'Please write something', '올리지 못했어요': "Couldn't post", '오류': 'Error', '이름을 적어주세요': 'Please enter your name', '교회 탭 → 내 계정에서 표시 이름을 정해 주세요.': 'Set your display name in Church → My Account.',
  '(표시 이름 없음 — 교회 탭 → 내 계정)': '(No display name — Church → My Account)', '교회 서버(Supabase)를 연결하면 교회 전체가 함께 봅니다 (app/supabase/README.md).': 'Once the church server is connected, everyone will see the Wall together.',
  '부적절한 콘텐츠는 허용하지 않습니다 (무관용).': 'Zero tolerance for objectionable content.',
  '나눔 벽은 성도들이 은혜와 기도 제목을 나누는 곳입니다. 욕설, 혐오 발언, 성적 표현, 위협, 스팸, 타인의 개인정보 게시는 금지되며 발견 즉시 삭제됩니다.': "The Story Wall is for sharing grace and prayer requests among members. Profanity, hate speech, sexual content, threats, spam, or sharing others' private information is strictly prohibited and removed on sight.",
  '익명 글도 같은 규칙이 적용됩니다. 글의 ⋯ 메뉴에서 신고하거나 작성자를 차단할 수 있습니다. 신고된 글은 바로 숨겨지고 24시간 안에 검토하며, 위반자는 정지됩니다. 문의: hello@sanfordstorychurch.com': 'Anonymous posts follow the same rules. Use the ⋯ menu to report a post or block its author. Reported posts are hidden immediately and reviewed within 24 hours; violators are removed. Contact: hello@sanfordstorychurch.com',
  '부적절한 표현이 포함되어 있어 올릴 수 없습니다.': 'Your post contains inappropriate language and cannot be posted.',
  // church
  '웹사이트 마지막 업데이트': 'Website last updated', '교회 서버(Supabase)가 연결되면 로그인이 열립니다.': 'Sign-in opens once the church server is connected.',
  '나눔 벽에 표시됩니다. 노트는 이 계정에 백업됩니다.': 'Shown on the Wall. Notes are backed up to this account.', '나눔 글쓰기와 노트 백업에 로그인이 필요해요.': 'Sign in to post on the Wall and back up your notes.',
  '홈 화면에 추가': 'Add to Home Screen',
  // errors (lib)
  '브라우저에서는 지원하지 않아요. 앱에서 추가해 주세요.': 'Not available in the browser. Use the app.', '설정에서 캘린더 접근을 허용해 주세요.': 'Allow calendar access in Settings.', '쓸 수 있는 캘린더가 없어요.': 'No writable calendar found.',
  '로그인이 필요해요': 'Sign-in required', '나눔 서버 오류: ': 'Wall server error: ',
  '이번 주 결단, 어떻게 되고 있어요?': 'How is your commitment going this week?',
  '익명': 'Anonymous', '익명으로 올라갑니다. 이름은 보이지 않지만 신고·차단은 가능합니다.': 'Posted anonymously. Your name is hidden, but the post can still be reported or blocked.',
  '신고하기': 'Report', '작성자 차단': 'Block user', '내 글 삭제': 'Delete my post', '취소': 'Cancel', '삭제': 'Delete',
  '신고 이유를 골라주세요': 'Why are you reporting this?', '신고가 접수되었습니다. 이 글은 바로 숨겨지며 24시간 안에 검토합니다.': 'Report received. The post is hidden now and will be reviewed within 24 hours.',
  '이 사용자를 차단할까요? 이 사용자의 글이 더 이상 보이지 않습니다.': "Block this user? You won't see their posts anymore.", '차단됨': 'Blocked', '차단 해제': 'Unblock', '차단한 사용자': 'Blocked users', '차단한 사용자가 없습니다': 'No blocked users',
  '이 글을 삭제할까요?': 'Delete this post?',
  '나눔 벽 이용 약속': 'Story Wall Community Rules', '동의하고 계속': 'Agree and continue', '이용약관 보기': 'View Terms of Use', '개인정보 처리방침': 'Privacy Policy', '이용약관': 'Terms of Use',
  '계정 삭제': 'Delete account', '계정을 삭제하면 프로필, 노트 백업, 신고·차단 기록이 즉시 지워지고 되돌릴 수 없습니다. 기기에 있는 노트는 남습니다.': 'Deleting your account permanently removes your profile, note backup, and report/block records. Notes on this device remain.',
  '비밀번호로 로그인': 'Sign in with password', '코드로 로그인': 'Sign in with email code', '비밀번호': 'Password', '로그인': 'Sign in',
  '말씀 노트': 'Sermon Note', '이번 주 찬양': "This Week's Praise", '탭하면 유튜브에서 들을 수 있어요. 가사는 예배 중 화면으로 함께 봅니다.': 'Tap to listen on YouTube. Lyrics are shown on screen during worship.', '성경': 'Bible', '공유': 'Share', '번역본': 'Version', '책 · 장 선택': 'Book · Chapter', '북마크': 'Bookmarks', '검색': 'Search',
  '단어나 구절을 입력하세요': 'Search words or a reference', '검색 결과가 없습니다': 'No results', '북마크가 없습니다. 절을 길게 누르면 저장됩니다.': 'No bookmarks yet. Long-press a verse to save it.',
  '구약': 'Old Testament', '신약': 'New Testament', '이전 장': 'Prev', '다음 장': 'Next', '예배의 흐름': 'Story Flow', '기도 제목 · 함께 기도해 주세요': 'Prayer request · pray with us',
  '나눔 벽에 기도 부탁 올리기': 'Post prayer request to the Wall', '헌금 보고': 'Offering Report', '합계': 'Total',
};

let currentLang: Lang = 'en';
/** 컴포넌트 밖(lib)에서 현재 언어로 번역 */
export const trx = (ko: string) => (currentLang === 'en' ? EN[ko] ?? ko : ko);

type Ctx = { lang: Lang; setLang: (l: Lang) => void; tr: (ko: string) => string; sub: (en: string, ko: string) => string; L: <T extends object>(o: T, key: keyof T & string) => string };
const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  // 기본 영어 (App Store 심사 기준). 한국어는 교회 탭 → Language 에서 선택하면 기기에 저장.
  const [lang, setLangState] = useState<Lang>('en');
  useEffect(() => { AsyncStorage.getItem(KEY).then((v) => v === 'ko' && setLangState('ko')); }, []);
  currentLang = lang;
  const value = useMemo<Ctx>(() => ({
    lang,
    setLang: (l) => { setLangState(l); AsyncStorage.setItem(KEY, l); },
    tr: (ko) => (lang === 'en' ? EN[ko] ?? ko : ko),
    /** 소제목 "Small Groups · 모임" — 영어 모드면 영어만 */
    sub: (en, ko) => (lang === 'en' ? en : `${en} · ${ko}`),
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
