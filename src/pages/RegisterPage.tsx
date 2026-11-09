import SocialLoginButtons from '../components/SocialLoginButtons';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authConfigured } from '../config/supabase';
import AccountPanel from '../components/AccountPanel';
import type { SignUpInput } from '../types/auth';

interface RegisterForm extends SignUpInput { passwordConfirm: string }
export default function RegisterPage() {
  const { register: signUp, isAuthenticated, loading } = useAuth();
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<RegisterForm>();
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  if (loading) return <p>로그인 상태 확인 중...</p>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <AccountPanel>
    <h2>이메일 회원가입</h2>
    {!authConfigured && <p role="alert">Supabase 환경변수를 설정한 뒤 다시 실행하세요.</p>}
    {message && <p role="status">{message}</p>}
    <form noValidate onSubmit={handleSubmit(async ({ passwordConfirm, ...input }) => {
      if (input.password !== passwordConfirm) { setMessage('비밀번호 확인이 일치하지 않습니다.'); return; }
      const result = await signUp(input);
      setMessage(result.message);
      if (result.success && !result.needsConfirmation) navigate('/dashboard', { replace: true });
    })}>
      <label>이름<input maxLength={80} autoComplete="name" {...register('name', {
        required: '이름을 입력해주세요.', validate: (value) => value.trim().length >= 2 || '이름은 최소 2자입니다.',
      })} /></label>
      {errors.name && <p role="alert">{errors.name.message}</p>}
      <label>이메일<input type="email" autoComplete="email" {...register('email', {
        required: '이메일을 입력해주세요.',
        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: '올바른 이메일 형식이 아닙니다.' },
      })} /></label>
      {errors.email && <p role="alert">{errors.email.message}</p>}
      <label>비밀번호<input type={showPassword ? 'text' : 'password'} autoComplete="new-password" {...register('password', {
        required: '비밀번호를 입력해주세요.', minLength: { value: 6, message: '비밀번호는 최소 6자입니다.' },
      })} /></label>
      <button type="button" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}</button>
      {errors.password && <p role="alert">{errors.password.message}</p>}
      <label>비밀번호 확인<input type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" {...register('passwordConfirm', {
        required: '비밀번호 확인을 입력해주세요.', validate: (value) => value === getValues('password') || '비밀번호 확인이 일치하지 않습니다.',
      })} /></label>
      <button type="button" aria-pressed={showConfirmation} onClick={() => setShowConfirmation(!showConfirmation)}>{showConfirmation ? '확인 비밀번호 숨기기' : '확인 비밀번호 보기'}</button>
      {errors.passwordConfirm && <p role="alert">{errors.passwordConfirm.message}</p>}
      <button disabled={!authConfigured || isSubmitting}>{isSubmitting ? '가입 중...' : '회원가입'}</button>
    </form>
    <p><Link to="/login">로그인 화면으로</Link></p>
    <SocialLoginButtons />
  </AccountPanel>;
}
