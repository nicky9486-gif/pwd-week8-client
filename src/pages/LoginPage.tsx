import SocialLoginButtons from '../components/SocialLoginButtons';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authConfigured } from '../config/supabase';
import AccountPanel from '../components/AccountPanel';
import type { Credentials } from '../types/auth';

export default function LoginPage() {
  const { login, loading, isAuthenticated, authError } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Credentials>();
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const callbackError = search.get('error');
  if (loading) return <p>로그인 상태 확인 중...</p>;
  // 취소·실패가 있으면 남아 있는 이전 세션보다 이번 콜백의 오류를 우선 표시합니다.
  if (isAuthenticated && !callbackError) return <Navigate to="/dashboard" replace />;
  return <AccountPanel>
    <h2>로그인</h2>
    {!authConfigured && <p role="alert">Supabase 환경변수를 설정한 뒤 다시 실행하세요.</p>}
    {(message || callbackError || authError) && <p role="alert">{message || callbackError || authError}</p>}
    <form noValidate onSubmit={handleSubmit(async (input) => {
      setMessage('');
      const result = await login(input);
      if (result.success) navigate('/dashboard', { replace: true });
      else setMessage(result.message);
    })}>
      <label>이메일<input type="email" autoComplete="email" {...register('email', {
        required: '이메일을 입력해주세요.',
        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: '올바른 이메일 형식이 아닙니다.' },
      })} /></label>
      {errors.email && <p role="alert">{errors.email.message}</p>}
      <label>비밀번호<input type={showPassword ? 'text' : 'password'} autoComplete="current-password" {...register('password', {
        required: '비밀번호를 입력해주세요.', minLength: { value: 6, message: '비밀번호는 최소 6자입니다.' },
      })} /></label>
      <button type="button" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}</button>
      {errors.password && <p role="alert">{errors.password.message}</p>}
      <button disabled={!authConfigured || isSubmitting}>{isSubmitting ? '확인 중...' : '로그인'}</button>
    </form>
    <p><Link to="/register">이메일로 회원가입</Link></p>
    <SocialLoginButtons />
  </AccountPanel>;
}
