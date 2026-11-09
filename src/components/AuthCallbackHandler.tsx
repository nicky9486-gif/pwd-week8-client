import { useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { completeAuthCallback } from '../utils/oauthCallback';

export default function AuthCallbackHandler() {
  const exchange = useRef<Promise<string> | null>(null);
  useEffect(() => {
    let active = true;
    // StrictMode가 effect를 다시 실행해도 같은 일회용 코드를 두 번 교환하지 않습니다.
    exchange.current ??= completeAuthCallback(new URL(window.location.href), supabase?.auth);
    void exchange.current.then((route) => {
      if (active) window.location.replace(`/#${route}`);
    });
    return () => { active = false; };
  }, []);
  return <p role="status">로그인 결과를 확인하고 있습니다...</p>;
}
