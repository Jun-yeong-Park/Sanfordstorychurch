import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** 설정이 없어도 앱은 뜬다 — 나눔 벽만 "이 기기" 모드로, 주보는 번들 데이터로. */
export const isConfigured = url.startsWith('http') && anonKey.length > 20;

export const supabase = createClient(
  isConfigured ? url : 'http://localhost:54321',
  isConfigured ? anonKey : 'not-configured',
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
);
