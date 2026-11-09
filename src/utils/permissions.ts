import type { AppUser } from '../types/auth';
import type { Restaurant } from '../types';

// 화면 버튼 표시용입니다. 실제 차단은 Supabase RLS(supabase/rls.sql)가 담당합니다.
export function canEditRestaurant(user: AppUser | null, restaurant: Restaurant): boolean {
  if (!user?.isActive) return false;
  return user.userType === 'admin' || (!!restaurant.ownerId && restaurant.ownerId === user.id);
}
