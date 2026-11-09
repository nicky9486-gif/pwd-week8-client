import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authAPIService } from '../services/authApi';
import { authConfigured } from '../config/supabase';
import { messageOf } from '../utils/errorMessage';
import type { SocialProvider } from '../types/auth';

export default function SocialLoginButtons() {
  const [redirecting, setRedirecting] = useState<SocialProvider | null>(null);
  const [message, setMessage] = useState('');
  const providers = useQuery({
    queryKey: ['auth-providers'], queryFn: authAPIService.getProviders,
    staleTime: 60000, retry: false,
  });
  if (providers.isPending) return <p>소셜 로그인 설정 조회 중...</p>;
  if (providers.isError) return <div role="alert">
    <p>소셜 로그인 설정을 확인하지 못했습니다. 이메일 로그인은 계속 사용할 수 있습니다.</p>
    <button type="button" onClick={() => void providers.refetch()}>설정 다시 조회</button>
  </div>;
  const buttons = [
    { key: 'google', provider: 'google', label: 'Google로 계속하기', color: '#4052a2' },
    { key: 'naver', provider: 'custom:naver', label: '네이버로 계속하기', color: '#03a852' },
  ] as const;
  return <section aria-label="소셜 로그인">
    <h3>소셜 계정으로 계속하기</h3>
    <div style={{ display: 'grid', gap: '.75rem' }}>{buttons.map((item) => {
      const enabled = authConfigured && providers.data.data[item.key].enabled;
      return <button key={item.key} type="button" style={{ background: item.color }}
        disabled={!enabled || redirecting !== null} onClick={() => {
          setMessage(''); setRedirecting(item.provider);
          void authAPIService.socialLogin(item.provider).catch((error: unknown) => {
            setMessage(messageOf(error)); setRedirecting(null);
          });
        }}>
        {redirecting === item.provider ? '로그인 페이지로 이동 중...' : item.label}
        {!enabled && ' (설정되지 않음)'}
      </button>;
    })}</div>
    {message && <p role="alert">{message}</p>}
  </section>;
}
