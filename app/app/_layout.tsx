import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { AuthProvider } from '@/lib/auth';
import { loadBulletin } from '@/lib/bulletin';
import { LangProvider } from '@/lib/i18n';
import { c } from '@/lib/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold });
  const [ready, setReady] = useState(false);
  const router = useRouter();
  useEffect(() => {
    // 서버 주보는 부가 — 실패해도 번들 주보로 앱을 띄운다
    loadBulletin().catch(() => {}).finally(() => setReady(true));
  }, []);
  // 결단 팔로업 알림을 누르면 그 주 노트로
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const issue = res.notification.request.content.data?.issue;
      if (typeof issue === 'string') router.push(`/note/${issue}`);
    });
    return () => sub.remove();
  }, [router]);

  if (!fontsLoaded || !ready) {
    return <View style={{ flex: 1, backgroundColor: c.cream, justifyContent: 'center' }}><ActivityIndicator color={c.orange} /></View>;
  }
  return (
    <SafeAreaProvider>
      <LangProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.cream } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="note/[issue]" />
            <Stack.Screen name="draw/[issue]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
            <Stack.Screen name="bible/[ref]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="signin" options={{ presentation: 'modal' }} />
          </Stack>
        </AuthProvider>
      </LangProvider>
    </SafeAreaProvider>
  );
}
