// 나눔 벽 콘텐츠 관리 — Apple Guideline 1.2 (UGC): 약관 동의 · 욕설 필터 · 신고 · 차단
// 서버 목록(supabase/schema.sql contains_blocked_words)과 같게 유지.
const BLOCKED_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'pussy', 'nigger', 'nigga', 'faggot', 'retard', 'whore', 'slut', 'porn',
  '시발', '씨발', '씨팔', '시팔', 'ㅅㅂ', 'ㅆㅂ', '병신', 'ㅄ', 'ㅂㅅ', '존나', '좆', '조까', '개새끼', '새끼야', '미친년', '미친놈',
  '쳐죽', '엿먹', '닥쳐', '뒤져라', '디져라', '창녀', '창놈', '섹스', 'tlqkf', '느금마', '니애미', '씹새', '씹년', '씹할',
];
export function containsBlockedWords(text: string): boolean {
  const t = text.toLowerCase();
  return BLOCKED_WORDS.some((w) => t.includes(w));
}

export const REPORT_REASONS = [
  { key: 'spam',       ko: '스팸 · 광고',        en: 'Spam or ads' },
  { key: 'hate',       ko: '혐오 · 차별 발언',    en: 'Hate speech' },
  { key: 'harassment', ko: '괴롭힘 · 욕설',       en: 'Harassment or abuse' },
  { key: 'sexual',     ko: '음란 · 성적 표현',    en: 'Sexual content' },
  { key: 'violence',   ko: '폭력 · 위험',         en: 'Violence or danger' },
  { key: 'other',      ko: '기타',               en: 'Other' },
] as const;

export const EULA_VERSION = 1;
export const TERMS_URL = 'https://sanfordstorychurch.com/terms';
export const PRIVACY_URL = 'https://sanfordstorychurch.com/privacy';
export const ABUSE_EMAIL = 'hello@sanfordstorychurch.com';
