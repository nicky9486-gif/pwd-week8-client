import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return <p role="status">로그인 상태를 확인하고 있습니다...</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // 화면 이동을 제어할 뿐입니다. 실제 권한은 각 API가 다시 검사합니다.
  return children;
}
