import axios from 'axios';
import { supabase } from '../config/supabase';

const baseURL = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
// 공개 조회에는 로그인이 필요하지 않습니다.
export const publicApi = axios.create({ baseURL, timeout: 60000, withCredentials: false });
export const authApi = axios.create({ baseURL, timeout: 60000, withCredentials: false });

for (const client of [publicApi, authApi]) {
  client.interceptors.request.use((config) => {
    if (!baseURL) throw new Error('VITE_API_BASE_URL을 확인하고 Vite를 다시 시작하세요.');
    return config;
  });
}
// 인터셉터는 실제 요청을 보내기 직전에 실행되는 공통 처리입니다.
// 각 화면이 토큰 첨부 코드를 반복하지 않고 인증용 HTTP 인스턴스를 사용하게 합니다.
authApi.interceptors.request.use(async (config) => {
  // [이론: HTTP 무상태성] 새 요청마다 자격 증표를 제시합니다.
  // getSession은 브라우저 상태를 읽는 동작이며 최종 검증은 서버가 수행합니다.
  const { data, error } = await supabase?.auth.getSession()
    ?? { data: { session: null }, error: null };
  if (error) throw error;
  if (data.session) config.headers.Authorization = `Bearer ${data.session.access_token}`;
  return config;
});
