import ProfileForm from '../components/ProfileForm';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { messageOf } from '../utils/errorMessage';
import AccountPanel from '../components/AccountPanel';

export default function DashboardPage() {
  const { user, logout, isAdmin } = useAuth();
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  if (!user) return <p>프로필 확인 중...</p>;
  return <AccountPanel>
    <h2>환영합니다, {user.name || '사용자'}님!</h2>
    {user.avatar && <img src={user.avatar} alt="프로필" width={80} height={80} />}
    <p>이메일: {user.email || '미제공'}</p>
    <p>로그인 방식: {user.provider}</p>
    <p>역할: {isAdmin() ? '관리자' : '일반 사용자'}</p>
    <p>가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}</p>
    <ProfileForm key={user.id} />
    <nav><Link to="/list">맛집 목록</Link><Link to="/manage">맛집 관리</Link><Link to="/submit">맛집 제보</Link>
      {isAdmin() && <><Link to="/submissions">제보 관리</Link></>}
    </nav>
    {message && <p role="alert">{message}</p>}
    <button onClick={() => { void logout().then(() => navigate('/', { replace: true })).catch((error: unknown) => setMessage(messageOf(error))); }}>로그아웃</button>
  </AccountPanel>;
}
