import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPIService } from '../services/authApi';
import { messageOf } from '../utils/errorMessage';

interface ProfileInput { name: string; avatar: string }
interface PasswordInput { currentPassword: string; password: string; confirmation: string }
export default function ProfileForm() {
  const { user, checkAuthStatus, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [deactivating, setDeactivating] = useState(false);
  const profile = useForm<ProfileInput>({ defaultValues: { name: user?.name ?? '', avatar: user?.avatar ?? '' } });
  const password = useForm<PasswordInput>();
  const busy = profile.formState.isSubmitting || password.formState.isSubmitting || deactivating;
  return <section>
    <h3>프로필 수정</h3>
    <form onSubmit={profile.handleSubmit(async (input) => {
      try {
        setMessage('');
        await authAPIService.updateProfile({ name: input.name.trim(), avatar: input.avatar.trim() });
        const updated = await checkAuthStatus();
        profile.reset({ name: updated.name, avatar: updated.avatar ?? '' });
        setMessage('프로필을 저장했습니다.');
      } catch (error) { setMessage(messageOf(error)); }
    })}>
      <label>이름<input required maxLength={80} {...profile.register('name')} /></label>
      <label>프로필 이미지 URL<input type="url" placeholder="https://... (선택)" {...profile.register('avatar')} /></label>
      <button disabled={busy}>프로필 저장</button>
    </form>
    {(user?.provider === 'email' || user?.provider === 'local') && <>
      <h3>이메일 계정 비밀번호 변경</h3>
      <form onSubmit={password.handleSubmit(async (input) => {
        if (input.password !== input.confirmation) { setMessage('새 비밀번호 확인이 일치하지 않습니다.'); return; }
        try {
          await authAPIService.changePassword(input.currentPassword, input.password);
          password.reset();
          setMessage('비밀번호를 변경했습니다. 다음 로그인부터 새 비밀번호를 사용하세요.');
        } catch (error) { setMessage(messageOf(error)); }
      })}>
        <label>현재 비밀번호<input type="password" required autoComplete="current-password" {...password.register('currentPassword')} /></label>
        <label>새 비밀번호<input type="password" required minLength={8} autoComplete="new-password" {...password.register('password')} /></label>
        <label>새 비밀번호 확인<input type="password" required minLength={8} autoComplete="new-password" {...password.register('confirmation')} /></label>
        <button disabled={busy}>비밀번호 변경</button>
      </form>
    </>}
    <h3>계정 비활성화</h3>
    <p>서비스 접근이 차단됩니다. Supabase Auth 계정 자체를 삭제하는 작업과 구분합니다.</p>
    <button disabled={busy} onClick={() => {
      if (!window.confirm('이 서비스의 계정을 비활성화할까요? 이후 보호 API를 사용할 수 없습니다.')) return;
      setDeactivating(true);
      void (async () => {
        try {
          await authAPIService.deactivateAccount();
          await logout();
          navigate('/login', { replace: true });
        } catch (error) { setMessage(messageOf(error)); }
        finally { setDeactivating(false); }
      })();
    }}>계정 비활성화</button>
    {message && <p role="status">{message}</p>}
  </section>;
}
