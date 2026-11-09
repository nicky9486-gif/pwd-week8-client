import { authApi, publicApi } from './http';
import { requireSupabase } from '../config/supabase';
import type { ApiResponse } from '../types';
import type { AppUser, Credentials, ProviderState, SignUpInput, SocialProvider, UserType } from '../types/auth';

export const authAPIService = {
  register: async ({ email, password, name }: SignUpInput) => {
    const { data, error } = await requireSupabase().auth.signUp({
      email: email.trim(), password,
      options: { data: { name: name.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    return data;
  },
  login: async ({ email, password }: Credentials) => {
    // [이론: 계정·인증] 이메일은 계정 지정, 비밀번호는 제시하는 증거입니다.
    // 해시·솔트 저장과 대조는 Supabase Auth가 담당합니다.
    const { data, error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    return data;
  },
  logout: async () => {
    // [이론: 로그아웃·철회] 현재 세션의 갱신 자격 철회와 브라우저 보관 상태 정리를 요청합니다.
    // 이미 발급된 액세스 토큰은 만료 전까지 유효할 수 있습니다.
    const { error } = await requireSupabase().auth.signOut({ scope: 'local' });
    if (error) throw error;
  },
  // Axios 응답의 .data는 서버 응답 본문입니다. 본문의 data.user는 호출한 쪽에서 읽습니다.
  getCurrentUser: async () => (await authApi.get<ApiResponse<{ user: AppUser }>>('/api/auth/me')).data,
  getAllUsers: async () => (await authApi.get<ApiResponse<{ users: AppUser[] }>>('/api/users/all')).data,
  changeUserType: async (id: string, userType: UserType) =>
    (await authApi.put<ApiResponse<{ user: AppUser }>>(`/api/users/${id}/type`, { userType })).data,
  updateProfile: async (payload: { name: string; avatar?: string }) =>
    (await authApi.put<ApiResponse<{ user: AppUser }>>('/api/users/profile', payload)).data,
  deactivateAccount: async () => (await authApi.delete('/api/users/account')).data as unknown,
  changePassword: async (currentPassword: string, password: string) => {
    const { error } = await requireSupabase().auth.updateUser({ current_password: currentPassword, password });
    if (error) throw error;
  },
  getProviders: async () => (await publicApi.get<ApiResponse<ProviderState>>('/api/auth/providers')).data,
  socialLogin: async (provider: SocialProvider) => {
    const { error } = await requireSupabase().auth.signInWithOAuth({
      provider, options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  },
};
