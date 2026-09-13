// 로그인 — 이메일 6자리 코드 (비밀번호 없음). 나눔 글쓰기·노트 백업에만 필요.
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Btn, Display, Eyebrow, Section } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { c } from '@/lib/theme';

export default function SignInScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    const e = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(e)) return Alert.alert('이메일 주소를 확인해 주세요');
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: e, options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return Alert.alert('코드를 보내지 못했어요', error.message);
    setEmail(e); setStep('code');
  };
  const verify = async () => {
    if (code.trim().length < 6) return Alert.alert('6자리 코드를 입력해 주세요');
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) return Alert.alert('코드가 맞지 않아요', error.message);
    router.back();
  };

  const signInPw = async () => {
    const e = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(e) || !password) return Alert.alert('이메일과 비밀번호를 입력해 주세요');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: e, password });
    setBusy(false);
    if (error) return Alert.alert('로그인하지 못했어요', error.message);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Section tone="beige" style={{ paddingTop: top + 14 }}>
        <Pressable onPress={() => router.back()}><Eyebrow>← 닫기</Eyebrow></Pressable>
        <Display size={34} color={c.ink} style={{ marginTop: 10 }}>SIGN IN</Display>
        <Body dim size={14} style={{ marginTop: 8 }}>이메일로 받은 6자리 코드로 들어옵니다. 비밀번호는 없어요.{'\n'}나눔 글쓰기와 노트 백업에만 쓰입니다.</Body>
      </Section>
      <ScrollView contentContainerStyle={{ padding: 22 }} keyboardShouldPersistTaps="handled">
        {step === 'email' ? (
          <View>
            <TextInput value={email} onChangeText={setEmail} placeholder="이메일 주소" placeholderTextColor={c.inkDim} keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false} editable={!busy} onSubmitEditing={sendCode} returnKeyType="send" style={s.input} />
            <Btn label={busy ? '보내는 중…' : '코드 받기'} onPress={sendCode} disabled={busy} style={{ marginTop: 14 }} />
            <Pressable onPress={() => setStep('password')} style={{ marginTop: 18, alignSelf: 'center' }}><Body dim size={13} style={{ textDecorationLine: 'underline' }}>비밀번호로 로그인 · Sign in with password</Body></Pressable>
          </View>
        ) : step === 'password' ? (
          <View>
            <TextInput value={email} onChangeText={setEmail} placeholder="이메일 주소" placeholderTextColor={c.inkDim} keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false} editable={!busy} style={s.input} />
            <TextInput value={password} onChangeText={setPassword} placeholder="비밀번호 · Password" placeholderTextColor={c.inkDim} secureTextEntry autoCapitalize="none" editable={!busy} onSubmitEditing={signInPw} returnKeyType="done" style={s.input} />
            <Btn label={busy ? '확인 중…' : '로그인'} onPress={signInPw} disabled={busy} style={{ marginTop: 14 }} />
            <Btn label="이메일 코드로 로그인" variant="ghost" onPress={() => setStep('email')} disabled={busy} style={{ marginTop: 10 }} />
          </View>
        ) : (
          <View>
            <Body dim size={14}>{email} 으로 보낸 6자리 코드를 입력하세요.</Body>
            <TextInput value={code} onChangeText={setCode} placeholder="000000" placeholderTextColor={c.gray} keyboardType="number-pad" autoComplete="one-time-code" maxLength={6} editable={!busy} onSubmitEditing={verify} returnKeyType="done" style={[s.input, s.code]} />
            <Btn label={busy ? '확인 중…' : '시작하기'} onPress={verify} disabled={busy} style={{ marginTop: 14 }} />
            <Btn label="다른 이메일로" variant="ghost" onPress={() => { setStep('email'); setCode(''); }} disabled={busy} style={{ marginTop: 10 }} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  input: { backgroundColor: c.white, borderWidth: 1.5, borderColor: c.gray, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: c.ink, marginTop: 14 },
  code: { fontSize: 24, letterSpacing: 8, textAlign: 'center' },
});
