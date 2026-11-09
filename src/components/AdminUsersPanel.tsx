import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { authAPIService } from '../services/authApi';
import { useAuth } from '../contexts/AuthContext';
import { messageOf } from '../utils/errorMessage';
import type { UserType } from '../types/auth';

export default function AdminUsersPanel() {
  const client = useQueryClient();
  const { checkAuthStatus } = useAuth();
  const users = useQuery({ queryKey: ['users'], queryFn: authAPIService.getAllUsers });
  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserType }) => authAPIService.changeUserType(id, role),
    onSuccess: async () => {
      toast.success('사용자 역할을 변경했습니다.');
      await client.invalidateQueries({ queryKey: ['users'] });
      // 본인 권한을 바꾼 경우 메뉴·보호 화면도 서버의 최신 역할로 바뀝니다.
      await checkAuthStatus();
    },
    onError: (error) => toast.error(messageOf(error)),
  });
  if (users.isPending) return <p>사용자 목록 조회 중...</p>;
  if (users.isError) return <p role="alert">{messageOf(users.error)} <button onClick={() => void users.refetch()}>다시 조회</button></p>;
  return <section style={{ marginTop: '2rem', overflowX: 'auto' }}>
    <h2>사용자 역할 관리</h2>
    <p>대상 UUID를 확인하세요. 마지막 관리자의 권한 해제는 서버가 409로 거절합니다.</p>
    <table style={{ width: '100%', textAlign: 'left' }}>
      <thead><tr><th>사용자·UUID</th><th>이메일</th><th>방식·상태</th><th>역할</th><th>변경</th></tr></thead>
      {/* 첫 data는 React Query의 결과, 두 번째 data는 서버 응답 본문의 필드입니다. */}
      <tbody>{users.data.data.users.map((user) => <tr key={user.id}>
        <td>{user.name}<br /><small>{user.id}</small></td>
        <td>{user.email || '미제공'}</td>
        <td>{user.provider} · {user.isActive ? '활성' : '비활성'}</td>
        <td>{user.userType}</td>
        <td><button disabled={changeRole.isPending || !user.isActive} onClick={() => {
          const role = user.userType === 'admin' ? 'user' : 'admin';
          if (window.confirm(`${user.name} (${user.id})의 역할을 ${role}(으)로 변경할까요?`)) {
            changeRole.mutate({ id: user.id, role });
          }
        }}>{user.userType === 'admin' ? '일반 사용자로' : '관리자로'}</button></td>
      </tr>)}</tbody>
    </table>
  </section>;
}
