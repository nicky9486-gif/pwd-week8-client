import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  return <ProtectedRoute>{isAdmin() ? children :
    <section><h2>관리자 권한이 필요합니다.</h2><Link to="/dashboard">내 정보로 돌아가기</Link></section>
  }</ProtectedRoute>;
}
