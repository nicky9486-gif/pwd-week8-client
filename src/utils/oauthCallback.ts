// 코드를 URL에서 읽는 함수는 React 없이 검사할 수 있도록 분리합니다.
export function oauthCallbackError(search = '', hash = ''): string | null {
  for (const value of [search, hash]) {
    const params = new URLSearchParams(value.replace(/^[?#]/, ''));
    const error = params.get('error') ?? params.get('error_code');
    if (error === 'access_denied' || error === 'user_cancelled') {
      return '로그인이 취소되었습니다. 다시 시도하세요.';
    }
    if (error || params.has('error_description')) return '소셜 로그인을 완료하지 못했습니다. 다시 시도하세요.';
  }
  return null;
}
export interface CodeExchanger {
  exchangeCodeForSession: (code: string) => Promise<{
    data: { session: unknown | null }; error: unknown;
  }>;
}
export async function completeAuthCallback(url: URL, auth?: CodeExchanger | null): Promise<string> {
  const providerError = oauthCallbackError(url.search, url.hash);
  if (providerError) return `/login?error=${encodeURIComponent(providerError)}`;
  const code = url.searchParams.get('code');
  if (code && auth) {
    try {
      const { data, error } = await auth.exchangeCodeForSession(code);
      // 이전 세션의 존재가 아니라 이번 일회용 코드 교환의 성공으로 판단합니다.
      if (!error && data.session) return '/dashboard';
    } catch { /* 네트워크 실패도 로그인 화면에서 다시 시작합니다. */ }
  }
  return `/login?error=${encodeURIComponent('인증 정보를 확인하지 못했습니다. 다시 로그인하세요.')}`;
}
