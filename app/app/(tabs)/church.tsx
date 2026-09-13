// 교회 — 예배 안내 · 일정 · 모임 · 내 계정(로그인 · 표시 이름 · 언어)
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import TopBar from '@/components/TopBar';
import Events from '@/components/Events';
import { Body, Btn, Display, KV, SecHead, Section, Sub } from '@/components/ui';
import { deleteMyAccount, getProfile, setDisplayName, useAuth } from '@/lib/auth';
import { listBlocked, unblockUser, type Blocked } from '@/lib/wall';
import { PRIVACY_URL, TERMS_URL } from '@/lib/moderation';
import { getBulletin } from '@/lib/bulletin';
import { useLang } from '@/lib/i18n';
import { isConfigured } from '@/lib/supabase';
import meta from '@/data/site-meta.json';
import { c } from '@/lib/theme';

const SITE = 'https://sanfordstorychurch.com';

export default function ChurchScreen() {
  const D = getBulletin();
  const ch = D.church;
  const router = useRouter();
  const { lang, setLang, tr, L } = useLang();
  const { session, signOut } = useAuth();
  const [name, setName] = useState('');
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const load = useCallback(() => { if (session) { getProfile(session.user.id).then((p) => setName(p?.display_name ?? '')); listBlocked().then(setBlocked).catch(() => {}); } }, [session]);
  useEffect(load, [load]);

  const link = (label: string, url: string) => <Text onPress={() => Linking.openURL(url)} style={s.link}>{label}</Text>;
  const onDelete = () => Alert.alert(tr('계정 삭제'), tr('계정을 삭제하면 프로필, 노트 백업, 신고·차단 기록이 즉시 지워지고 되돌릴 수 없습니다. 기기에 있는 노트는 남습니다.'), [
    { text: tr('취소'), style: 'cancel' },
    { text: tr('계정 삭제'), style: 'destructive', onPress: async () => { try { await deleteMyAccount(); } catch (e) { Alert.alert('오류', (e as Error).message); } } },
  ]);
  const saveName = async () => {
    if (!session) return;
    try { await setDisplayName(session.user.id, name.trim()); Alert.alert(tr('표시 이름'), tr('저장')); } catch (e) { Alert.alert('오류', (e as Error).message); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.cream }}>
      <TopBar right="SANFORD · FL" />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Section tone="beige" style={{ paddingVertical: 36, alignItems: 'center' }}>
          <Image source={require('@/assets/logo-on-light.png')} style={s.logo} resizeMode="contain" />
          <Display size={32} color={c.ink} style={{ marginTop: 24, textAlign: 'center' }}>GOD'S STORY{'\n'}BEGINS IN <Text style={{ color: c.orange }}>YOUR LIFE.</Text></Display>
          <Body dim size={14} style={{ marginTop: 8, textAlign: 'center' }}>{lang === 'en' ? ch.tagline : ch.taglineKo}</Body>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
            <Btn label="WEBSITE ↗" onPress={() => Linking.openURL(lang === 'en' ? SITE + '/en/' : SITE)} />
            <Btn label="INSTAGRAM" variant="ghost" onPress={() => Linking.openURL('https://instagram.com/' + ch.instagram.replace('@', ''))} />
          </View>
        </Section>

        <Section>
          <SecHead en="VISIT" ko={tr('예배 안내')} />
          <KV rows={[
            [tr('예배'), L(D.issue, 'service')],
            [tr('장소'), link(ch.address, 'https://maps.apple.com/?q=' + encodeURIComponent(ch.address))],
            [tr('이메일'), link(ch.email, 'mailto:' + ch.email)],
            [tr('헌금'), L(ch, 'giving')],
            [tr('소속'), ch.legal],
          ]} />
          <Body dim size={12} style={{ marginTop: 14 }}>{lang === 'en' ? 'Website last updated' : '웹사이트 마지막 업데이트'} {meta.siteLastCommit.slice(0, 10)}</Body>
        </Section>

        <Section tone="beige">
          <SecHead en="EVENTS" ko={tr('일정')} />
          <Events events={D.events ?? []} />
        </Section>

        <Section>
          <Sub first>Small Groups · {tr('모임')}</Sub>
          {D.groups.map((g) => (
            <View key={g.name} style={s.grp}>
              <Body size={14.5}><Text style={{ fontWeight: '700' }}>{g.name}</Text> · {L(g, 'desc')}</Body>
              <Body dim size={13}>{L(g, 'when')} · {g.contact}</Body>
            </View>
          ))}
          <Sub>Serving · {tr('섬기는 분들')}</Sub><KV rows={D.team.map((x) => [L(x, 'role'), x.name] as [string, string])} />
        </Section>

        <Section tone="beige">
          <SecHead en="MY ACCOUNT" ko={tr('내 계정')} />
          {!isConfigured ? (
            <Body dim size={13.5}>{lang === 'en' ? 'Sign-in is off until the church server is connected.' : '교회 서버(Supabase)가 연결되면 로그인이 열립니다.'}</Body>
          ) : session ? (
            <View>
              <Body dim size={13}>{session.user.email}</Body>
              <Body bold size={14} style={{ marginTop: 14 }}>{tr('표시 이름')}</Body>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <TextInput value={name} onChangeText={setName} maxLength={20} placeholder={tr('이름')} placeholderTextColor={c.inkDim} style={s.input} />
                <Btn label={tr('저장')} small onPress={saveName} />
              </View>
              <Body dim size={12.5} style={{ marginTop: 8 }}>{lang === 'en' ? 'Shown on the Wall. Notes are backed up to your account.' : '나눔 벽에 표시됩니다. 노트는 이 계정에 백업됩니다.'}</Body>
              <Body bold size={14} style={{ marginTop: 18 }}>{tr('차단한 사용자')}</Body>
              {blocked.length === 0 ? <Body dim size={12.5}>{tr('차단한 사용자가 없습니다')}</Body> : blocked.map((b) => (
                <View key={b.blocked_id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                  <Body dim size={12.5} style={{ flex: 1 }}>{b.blocked_id.slice(0, 8)}… · {b.created_at.slice(0, 10)}</Body>
                  <Btn label={tr('차단 해제')} variant="ghost" small onPress={async () => { await unblockUser(b.blocked_id); load(); }} />
                </View>
              ))}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <Btn label={tr('로그아웃')} variant="ghost" small onPress={signOut} />
                <Btn label={tr('계정 삭제')} variant="ghost" small onPress={onDelete} style={{ borderColor: '#B91C1C' }} />
              </View>
            </View>
          ) : (
            <View>
              <Body dim size={13.5}>{lang === 'en' ? 'Sign in to post on the Wall and back up your notes.' : '나눔 글쓰기와 노트 백업에 로그인이 필요해요.'}</Body>
              <Btn label={tr('로그인 (이메일 코드)')} onPress={() => router.push('/signin')} style={{ alignSelf: 'flex-start', marginTop: 12 }} />
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 20 }}>
            <Pressable onPress={() => Linking.openURL(PRIVACY_URL)}><Body size={13} style={s.link}>{tr('개인정보 처리방침')}</Body></Pressable>
            <Pressable onPress={() => Linking.openURL(TERMS_URL)}><Body size={13} style={s.link}>{tr('이용약관')}</Body></Pressable>
          </View>
          <Body bold size={14} style={{ marginTop: 22 }}>{tr('언어')} · Language</Body>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {(['ko', 'en'] as const).map((l) => (
              <Pressable key={l} onPress={() => setLang(l)} style={[s.chip, lang === l && s.chipOn]}><Text style={[s.chipT, lang === l && { color: c.navy }]}>{l === 'ko' ? '한국어' : 'English'}</Text></Pressable>
            ))}
          </View>
        </Section>

        <Section><Body dim size={12}>Story App v{Constants.expoConfig?.version ?? '0.1.0'}</Body></Section>
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  logo: { width: '62%', height: 84 },
  link: { fontSize: 14.5, lineHeight: 22, fontWeight: '600', color: c.ink, textDecorationLine: 'underline', textDecorationColor: c.orange },
  grp: { paddingVertical: 9, borderTopWidth: 1, borderTopColor: c.line },
  input: { flex: 1, borderBottomWidth: 1.5, borderBottomColor: c.navy, color: c.ink, fontSize: 15, paddingVertical: 8 },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 4, borderWidth: 1.5, borderColor: c.navy },
  chipOn: { backgroundColor: c.orange, borderColor: c.orange },
  chipT: { fontSize: 13, fontWeight: '700', color: c.ink },
});
