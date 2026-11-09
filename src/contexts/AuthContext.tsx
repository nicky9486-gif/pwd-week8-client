/* eslint-disable react-refresh/only-export-components -- useAuth와 Provider를 함께 제공합니다. */
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authAPIService } from "../services/authApi";
import { supabase } from "../config/supabase";
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AppUser, AuthResult, Credentials, SignUpInput } from '../types/auth';
import { messageOf } from '../utils/errorMessage';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  authError: string;
  isAuthenticated: boolean;
  login: (input: Credentials) => Promise<AuthResult>;
  register: (input: SignUpInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<AppUser>;
  isAdmin: () => boolean;
}
// 로그인 정보와 동작을 여러 화면에서 함께 쓰기 위한 공유 공간입니다.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider가 필요합니다.");
  return context;
};
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // user는 서버가 확인한 앱 프로필입니다. SDK의 session 객체와 구분합니다.
  const [user, setUser] = useState<AppUser | null>(null);
  // 저장한 세션을 확인하는 중에는 보호 화면이 성급하게 로그인 페이지로 이동하지 않게 합니다.
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const queryClient = useQueryClient();
  const checkAuthStatus = useCallback(async () => {
    // 서비스 함수가 Axios 응답의 data를 반환하므로 response는 서버 응답 본문입니다.
    const response = await authAPIService.getCurrentUser();
    setUser(response.data.user);
    setAuthError("");
    return response.data.user;
  }, []);
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let alive = true;
    let generation = 0;
    let previousUserId: string | undefined;
    const applySession = async (session: Session | null) => {
      if (!alive) return;
      // 나중에 시작한 요청이 있으면 먼저 시작한 느린 응답은 화면에 반영하지 않습니다.
      const ticket = ++generation;
      if (session?.user.id !== previousUserId) {
        // A에서 B로 계정이 바뀔 때 A의 조회 결과가 B의 화면에 남지 않게 합니다.
        queryClient.clear();
        previousUserId = session?.user.id;
      }
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // [이론: 인증 결과] 브라우저에 세션이 남아 있어도 그 값만으로 앱 사용자를 확정하지 않습니다.
        // /me가 토큰을 검증해 확인한 사용자에 연결된 프로필을 화면의 사용자 상태로 사용합니다.
        const response = await authAPIService.getCurrentUser();
        if (alive && ticket === generation) {
          setUser(response.data.user);
          setAuthError("");
        }
      } catch (error) {
        if (alive && ticket === generation) {
          setUser(null);
          setAuthError(messageOf(error));
        }
      } finally {
        if (alive && ticket === generation) setLoading(false);
      }
    };
    // Auth 콜백의 SDK 잠금 밖에서 프로필을 읽습니다.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        void applySession(session);
      }, 0);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) {
        setAuthError(error.message);
        setLoading(false);
        return;
      }
      void applySession(data.session);
    });
    return () => {
      // 이 Provider가 사라진 뒤 도착한 응답과 이벤트가 상태를 바꾸지 않게 정리합니다.
      alive = false;
      generation++;
      subscription.unsubscribe();
    };
  }, [queryClient]);
  const login = async (credentials: Credentials): Promise<AuthResult> => {
    try {
      await authAPIService.login(credentials);
    } catch (error) {
      // 가입 확인 대기 중에는 이메일 링크에 사용할 PKCE 검증값을 유지합니다.
      return { success: false, message: messageOf(error) };
    }
    try {
      await checkAuthStatus();
      return { success: true, message: "로그인되었습니다." };
    } catch (error) {
      await supabase?.auth.signOut({ scope: "local" });
      return { success: false, message: messageOf(error) };
    }
  };
  const register = async (data: SignUpInput): Promise<AuthResult> => {
    try {
      const result = await authAPIService.register(data);
      if (result.session) await checkAuthStatus();
      return {
        success: true,
        needsConfirmation: !result.session,
        message: result.session
          ? "회원가입이 완료되었습니다."
          : "가입 확인 메일을 확인한 뒤 로그인하세요.",
      };
    } catch (error) {
      return { success: false, message: messageOf(error) };
    }
  };
  const logout = async () => {
    await authAPIService.logout();
    setUser(null);
    setAuthError("");
    // [이론: 상태 정리] 캐시 삭제는 이전 사용자의 화면 데이터를 정리하는 처리입니다.
    // 토큰의 갱신 자격 철회는 위에서 호출한 인증 서비스가 담당합니다.
    queryClient.clear();
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        checkAuthStatus,
        isAdmin: () => user?.userType === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
