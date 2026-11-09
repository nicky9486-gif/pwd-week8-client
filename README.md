# pwd-week8-client — Ajou Campus Foodmap

React + TypeScript + Supabase Auth. 이메일·Google·네이버 로그인과 역할별 맛집 권한을 구현합니다.
([실습서 원본](https://github.com/ajou-hyunseok-oh/pwd-week8-client) 기반)

## 권한

| 사용자 | 조회 | 등록 | 수정·삭제 |
| --- | --- | --- | --- |
| 비회원 | O | X | X |
| 회원 (이메일·Google·네이버 동일) | O | O | 본인이 등록한 맛집만 |
| 관리자 | O | O | 모든 맛집 |

- 맛집 등록·수정·삭제는 브라우저가 로그인 토큰으로 Supabase에 직접 요청하고, **RLS 정책이 권한을 판정**합니다. 화면의 버튼 숨김은 편의 기능일 뿐입니다.
- 권한은 로그인 방식이 아니라 `auth.uid()`(사용자 UUID)와 `profiles.user_type`으로 결정되므로 세 로그인 방식에 동일하게 적용됩니다.
- 관리 화면: 로그인 후 상단 **맛집 관리**(`/#/manage`).

## Supabase 설정 순서

1. 서버 저장소의 `supabase/schema.sql` 실행
2. 이 저장소의 [`supabase/rls.sql`](supabase/rls.sql) 실행 (schema.sql을 다시 실행했다면 이것도 다시)
3. [`supabase/rls-test.sql`](supabase/rls-test.sql) 실행 → `RLS 검증 통과 (8/8)` 확인
   (회원 B의 수정·삭제 차단, 관리자 수정·삭제 허용 등. rollback하므로 데이터가 남지 않음)

## 실행

```bash
cp .env.example .env.local   # VITE_API_BASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
npm ci --include=dev
npm run dev
npm test && npm run build
```
