// 성경 — 선데이프로젝트 앱 방식: 번역본 선택 · 책→장 이동 · 절 탭 형광 · 길게 눌러 북마크 · 글자 크기 · 검색 · 마지막 위치 기억
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopBar from '@/components/TopBar';
import { Icon } from '@/components/icons';
import { Body, Btn, Display, Empty, Eyebrow } from '@/components/ui';
import { BOOKS, VERSIONS, chapterCounts, getVerses, refLabel, searchVerses, type Lang, type SearchHit } from '@/lib/bible';
import { useLang } from '@/lib/i18n';
import { c, f } from '@/lib/theme';

type Pos = { lang: Lang; book: number; chapter: number };
type Bookmark = { key: string; lang: Lang; book: number; chapter: number; verse: number; ref: string; text: string; savedAt: string };
const POS_KEY = 'bible.pos', BM_KEY = 'bible.bookmarks', FONT_KEY = 'bible.font';
const DEFAULT_POS: Pos = { lang: 'ko', book: 47, chapter: 3 };   // 고린도후서 3장 — 교회 핵심 본문
const FONT_MIN = 14, FONT_MAX = 24;

export default function BibleScreen() {
  const { lang: appLang, tr } = useLang();
  const [pos, setPos] = useState<Pos>({ ...DEFAULT_POS, lang: appLang });
  const [font, setFont] = useState(17);
  const [highlight, setHighlight] = useState<Set<number>>(new Set());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showNav, setShowNav] = useState(false);
  const [showBm, setShowBm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const listRef = useRef<ScrollView>(null);

  // 마지막 위치 · 북마크 · 글자 크기 복원
  useEffect(() => {
    AsyncStorage.multiGet([POS_KEY, BM_KEY, FONT_KEY]).then(([[, p], [, b], [, fz]]) => {
      if (p) try { setPos(JSON.parse(p)); } catch {}
      if (b) try { setBookmarks(JSON.parse(b)); } catch {}
      if (fz) setFont(+fz);
    });
  }, []);
  useEffect(() => { AsyncStorage.setItem(POS_KEY, JSON.stringify(pos)); setHighlight(new Set()); listRef.current?.scrollTo({ y: 0, animated: false }); }, [pos]);
  useEffect(() => { AsyncStorage.setItem(FONT_KEY, String(font)); }, [font]);

  const counts = useMemo(() => chapterCounts(pos.lang), [pos.lang]);
  const verses = useMemo(() => getVerses({ book: pos.book, chapter: pos.chapter }, pos.lang), [pos]);
  const book = BOOKS[pos.book - 1];
  const title = refLabel({ book: pos.book, chapter: pos.chapter }, pos.lang);
  const bmKey = (v: number) => `${pos.lang}:${pos.book}:${pos.chapter}:${v}`;
  const isBm = (v: number) => bookmarks.some((b) => b.key === bmKey(v));

  const go = (delta: number) => {
    let { book: b, chapter: ch } = pos;
    ch += delta;
    if (ch < 1) { if (b === 1) return; b -= 1; ch = counts[b]; }
    else if (ch > counts[b]) { if (b === 66) return; b += 1; ch = 1; }
    setPos({ ...pos, book: b, chapter: ch });
  };
  const toggleHighlight = (v: number) => setHighlight((s) => { const n = new Set(s); n.has(v) ? n.delete(v) : n.add(v); return n; });
  const toggleBookmark = useCallback((v: number, text: string) => {
    setBookmarks((prev) => {
      const key = bmKey(v);
      const next = prev.some((b) => b.key === key)
        ? prev.filter((b) => b.key !== key)
        : [{ key, lang: pos.lang, book: pos.book, chapter: pos.chapter, verse: v, ref: refLabel({ book: pos.book, chapter: pos.chapter, from: v }, pos.lang), text, savedAt: new Date().toISOString() }, ...prev];
      AsyncStorage.setItem(BM_KEY, JSON.stringify(next));
      return next;
    });
  }, [pos]);
  const shareSelected = () => {
    const sel = verses.filter((v) => highlight.has(v.n));
    if (!sel.length) return;
    const range = sel.length === 1 ? `${sel[0].n}` : `${sel[0].n}–${sel[sel.length - 1].n}`;
    Share.share({ message: `${sel.map((v) => v.text).join(' ')}\n— ${refLabel({ book: pos.book, chapter: pos.chapter }, pos.lang)}:${range} (${VERSIONS.find((x) => x.id === pos.lang)!.abbr})` });
  };
  const runSearch = (q: string) => { setQuery(q); setHits(q.trim().length >= 2 ? searchVerses(q, [pos.lang]) : []); };
  const openHit = (h: { lang: Lang; book: number; chapter: number; verse: number }) => {
    setShowSearch(false); setShowBm(false);
    setPos({ lang: h.lang, book: h.book, chapter: h.chapter });
    setTimeout(() => setHighlight(new Set([h.verse])), 50);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.cream }}>
      <TopBar right={VERSIONS.find((x) => x.id === pos.lang)!.abbr} />

      {/* 툴바: 번역본 · 책/장 · 글자 · 북마크 · 검색 */}
      <View style={s.tools}>
        {VERSIONS.map((v) => (
          <Pressable key={v.id} onPress={() => setPos({ ...pos, lang: v.id })} style={[s.chip, pos.lang === v.id && s.chipOn]}>
            <Text style={[s.chipT, pos.lang === v.id && { color: c.navy }]}>{v.abbr}</Text>
          </Pressable>
        ))}
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => setFont((x) => Math.max(FONT_MIN, x - 1))} style={s.iconBtn}><Text style={s.iconT}>A−</Text></Pressable>
        <Pressable onPress={() => setFont((x) => Math.min(FONT_MAX, x + 1))} style={s.iconBtn}><Text style={[s.iconT, { fontSize: 15 }]}>A+</Text></Pressable>
        <Pressable onPress={() => setShowBm(true)} style={s.iconBtn}><Icon name="bookmark" color={c.ink} size={20} /></Pressable>
        <Pressable onPress={() => setShowSearch(true)} style={s.iconBtn}><Icon name="search" color={c.ink} size={20} /></Pressable>
      </View>

      {/* 현재 위치 (탭하면 책/장 선택) */}
      <Pressable onPress={() => setShowNav(true)} style={s.where}>
        <Display size={28}>{title}</Display>
        <Text style={s.whereHint}>{tr('책 · 장 선택')} ▾</Text>
      </Pressable>

      <ScrollView ref={listRef} contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: 120 }}>
        {verses.map((v) => {
          const on = highlight.has(v.n), bm = isBm(v.n);
          return (
            <Pressable key={v.n} onPress={() => toggleHighlight(v.n)} onLongPress={() => toggleBookmark(v.n, v.text)} delayLongPress={350}
              style={[s.verse, on && s.verseOn]}>
              {bm ? <View style={{ width: 24, alignItems: 'flex-end', paddingTop: 6 }}><Icon name="bookmark" color={c.navy} size={14} /></View> : <Text style={s.num}>{v.n}</Text>}
              <Text style={{ flex: 1, fontSize: font, lineHeight: font * 1.75, color: c.ink }}>{v.text}</Text>
            </Pressable>
          );
        })}
        <Body dim size={11.5} style={{ marginTop: 22 }}>{VERSIONS.find((x) => x.id === pos.lang)!.credit}</Body>
      </ScrollView>

      {/* 하단: 이전/다음 장, 선택 시 공유 */}
      <View style={s.footer}>
        <Btn label={'‹ ' + tr('이전 장')} variant="ghost" small onPress={() => go(-1)} />
        {highlight.size > 0 ? <Btn label={`${tr('공유')} (${highlight.size})`} small onPress={shareSelected} /> : <Body dim size={12}>{book.ko} {pos.chapter} / {counts[pos.book]}</Body>}
        <Btn label={tr('다음 장') + ' ›'} variant="ghost" small onPress={() => go(1)} />
      </View>

      {/* 책 → 장 선택 */}
      <Modal visible={showNav} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowNav(false)}>
        <Navigator pos={pos} counts={counts} onPick={(b, ch) => { setPos({ ...pos, book: b, chapter: ch }); setShowNav(false); }} onClose={() => setShowNav(false)} />
      </Modal>

      {/* 북마크 */}
      <Modal visible={showBm} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowBm(false)}>
        <Sheet title="BOOKMARKS" ko={tr('북마크')} onClose={() => setShowBm(false)}>
          {bookmarks.length === 0 ? <Empty>{tr('북마크가 없습니다. 절을 길게 누르면 저장됩니다.')}</Empty> : (
            <FlatList data={bookmarks} keyExtractor={(b) => b.key} contentContainerStyle={{ padding: 20 }} renderItem={({ item }) => (
              <Pressable onPress={() => openHit(item)} style={s.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={s.badge}>{VERSIONS.find((x) => x.id === item.lang)!.abbr}</Text>
                  <Text style={s.ref}>{item.ref}</Text>
                  <Pressable onPress={() => { const next = bookmarks.filter((b) => b.key !== item.key); setBookmarks(next); AsyncStorage.setItem(BM_KEY, JSON.stringify(next)); }} hitSlop={10} style={{ marginLeft: 'auto' }}><Text style={{ color: c.inkDim }}>✕</Text></Pressable>
                </View>
                <Body size={14.5} style={{ marginTop: 6 }}>{item.text}</Body>
              </Pressable>
            )} />
          )}
        </Sheet>
      </Modal>

      {/* 검색 */}
      <Modal visible={showSearch} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSearch(false)}>
        <Sheet title="SEARCH" ko={tr('검색')} onClose={() => setShowSearch(false)}>
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            <TextInput value={query} onChangeText={runSearch} placeholder={tr('단어나 구절을 입력하세요')} placeholderTextColor={c.inkDim} autoFocus autoCorrect={false} returnKeyType="search" style={s.search} />
            <Body dim size={12} style={{ marginTop: 8 }}>{VERSIONS.find((x) => x.id === pos.lang)!.abbr} · {hits.length ? `${hits.length}${hits.length >= 200 ? '+' : ''}` : ''}</Body>
          </View>
          {query.trim().length >= 2 && hits.length === 0 ? <Empty>{tr('검색 결과가 없습니다')}</Empty> : (
            <FlatList data={hits} keyExtractor={(h) => h.key} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20 }} renderItem={({ item }) => (
              <Pressable onPress={() => openHit(item)} style={s.card}>
                <Text style={s.ref}>{item.ref}</Text>
                <Body size={14.5} style={{ marginTop: 4 }}>{item.text}</Body>
              </Pressable>
            )} />
          )}
        </Sheet>
      </Modal>
    </View>
  );
}

/** 모달 공통 머리 */
function Sheet({ title, ko, onClose, children }: { title: string; ko: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: c.cream }}>
      <View style={s.sheetH}>
        <Display size={24}>{title}</Display><Text style={s.whereHint}>{ko}</Text>
        <Pressable onPress={onClose} hitSlop={10} style={{ marginLeft: 'auto' }}><Text style={{ fontSize: 18, color: c.ink }}>✕</Text></Pressable>
      </View>
      {children}
    </View>
  );
}

/** 책 → 장 두 단계 */
function Navigator({ pos, counts, onPick, onClose }: { pos: Pos; counts: number[]; onPick: (book: number, ch: number) => void; onClose: () => void }) {
  const { tr } = useLang();
  const [book, setBook] = useState<number | null>(null);
  const name = (nr: number) => (pos.lang === 'ko' ? BOOKS[nr - 1].ko : BOOKS[nr - 1].en);
  if (book === null) {
    const group = (label: string, from: number, to: number) => (
      <View key={label}>
        <Eyebrow style={{ marginTop: 18, marginBottom: 8 }}>{label}</Eyebrow>
        <View style={s.grid}>
          {BOOKS.slice(from - 1, to).map((b) => (
            <Pressable key={b.nr} onPress={() => setBook(b.nr)} style={[s.bookBtn, b.nr === pos.book && s.bookOn]}>
              <Text style={[s.bookT, b.nr === pos.book && { color: c.navy }]}>{pos.lang === 'ko' ? b.ko : b.en}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
    return (
      <Sheet title="BOOKS" ko={tr('책 · 장 선택')} onClose={onClose}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          {group(tr('구약') + ' · Old Testament', 1, 39)}
          {group(tr('신약') + ' · New Testament', 40, 66)}
        </ScrollView>
      </Sheet>
    );
  }
  return (
    <Sheet title={name(book).toUpperCase()} ko={`${counts[book]}${pos.lang === 'ko' ? '장' : ' ch.'}`} onClose={onClose}>
      <Pressable onPress={() => setBook(null)} style={{ paddingHorizontal: 20, paddingTop: 10 }}><Eyebrow>← {tr('책 · 장 선택')}</Eyebrow></Pressable>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={s.grid}>
          {Array.from({ length: counts[book] }, (_, i) => i + 1).map((ch) => (
            <Pressable key={ch} onPress={() => onPick(book, ch)} style={[s.chBtn, book === pos.book && ch === pos.chapter && s.bookOn]}>
              <Text style={[s.chT, book === pos.book && ch === pos.chapter && { color: c.navy }]}>{ch}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Sheet>
  );
}

const s = StyleSheet.create({
  tools: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: c.beige },
  chip: { paddingVertical: 6, paddingHorizontal: 11, borderRadius: 4, borderWidth: 1.5, borderColor: c.navy },
  chipOn: { backgroundColor: c.orange, borderColor: c.orange },
  chipT: { fontSize: 12, fontWeight: '700', color: c.ink },
  iconBtn: { width: 34, height: 32, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  iconT: { fontSize: 13, fontWeight: '700', color: c.ink },
  where: { flexDirection: 'row', alignItems: 'baseline', gap: 10, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 8 },
  whereHint: { fontSize: 12.5, fontWeight: '600', color: c.inkDim },
  verse: { flexDirection: 'row', gap: 10, paddingVertical: 5, paddingHorizontal: 6, marginHorizontal: -6, borderRadius: 6 },
  verseOn: { backgroundColor: c.orangeSoft },
  num: { fontFamily: f.display, fontSize: 15, lineHeight: 28, color: c.orange, width: 24, textAlign: 'right' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: c.cream, borderTopWidth: 1, borderTopColor: c.gray },
  sheetH: { flexDirection: 'row', alignItems: 'baseline', gap: 10, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 12, backgroundColor: c.beige },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bookBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4, backgroundColor: c.white, borderWidth: 1, borderColor: c.gray },
  bookOn: { backgroundColor: c.orange, borderColor: c.orange },
  bookT: { fontSize: 13.5, fontWeight: '600', color: c.ink },
  chBtn: { width: 52, height: 44, borderRadius: 4, backgroundColor: c.white, borderWidth: 1, borderColor: c.gray, alignItems: 'center', justifyContent: 'center' },
  chT: { fontFamily: f.display, fontSize: 18, color: c.ink },
  card: { backgroundColor: c.white, borderWidth: 1, borderColor: c.gray, borderRadius: 8, padding: 14, marginBottom: 10 },
  badge: { fontSize: 10, fontWeight: '700', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 3, backgroundColor: c.beige, color: c.ink, overflow: 'hidden' },
  ref: { fontFamily: f.en, fontSize: 11, letterSpacing: 1, color: c.orange },
  search: { backgroundColor: c.white, borderWidth: 1.5, borderColor: c.gray, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: c.ink },
});
