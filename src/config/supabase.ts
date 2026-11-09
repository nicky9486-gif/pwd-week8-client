import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
export const authConfigured = Boolean(
  url && key && !url.includes('your-project') && !key.includes('replace_with'),
);
export const supabase = authConfigured ? createClient(url, key, {
  auth: {
    // [이론: 세션·보관] SDK session은 토큰·사용자 정보의 묶음이며 세션 ID 문자열과 다릅니다.
    // 새로고침 뒤 복원을 위해 브라우저 저장소에 보관합니다.
    persistSession: true,
    // [이론: 갱신] 새 토큰을 요청합니다. 기존 JWT의 만료 시각을 늘리는 처리가 아닙니다.
    autoRefreshToken: true,
    // /auth/callback에서는 뒤에서 작성할 콜백 처리기가 코드를 한 번만 교환합니다.
    detectSessionInUrl: window.location.pathname !== '/auth/callback',
    flowType: 'pkce',
  },
}) : null;

export function requireSupabase() {
  if (!supabase) throw new Error('Supabase 환경변수를 확인하고 Vite를 다시 시작하세요.');
  return supabase;
}
