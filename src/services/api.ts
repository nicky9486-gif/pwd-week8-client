import { publicApi } from './http';
import { requireSupabase } from '../config/supabase';
import type { ApiResponse, CreateRestaurantInput, EntityId, Restaurant, UpdateRestaurantInput } from '../types';

// 조회는 서버 API, 맛집 쓰기는 로그인 토큰으로 Supabase에 직접 요청해 RLS가 권한을 판정합니다.
export { submissionAPI } from './submissionApi';

interface RestaurantRow {
  id: number; name: string; category: string; location: string; price_range: string;
  rating: number; description: string; recommended_menu: string[]; likes: number;
  image: string; owner_id: string | null;
}
const fromRow = (row: RestaurantRow): Restaurant => ({
  id: row.id, name: row.name, category: row.category, location: row.location,
  priceRange: row.price_range, rating: Number(row.rating), description: row.description,
  recommendedMenu: row.recommended_menu, likes: row.likes, image: row.image, ownerId: row.owner_id,
});
const toRow = (input: UpdateRestaurantInput) => {
  const row: Record<string, unknown> = {
    name: input.name, category: input.category, location: input.location,
    price_range: input.priceRange, rating: input.rating, description: input.description,
    recommended_menu: input.recommendedMenu, image: input.image,
  };
  // undefined 열은 보내지 않습니다. owner_id는 DB 기본값 auth.uid()가 채웁니다.
  return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));
};
const NOT_ALLOWED = '본인이 등록한 맛집만 수정·삭제할 수 있습니다.';

export const restaurantAPI = {
  getRestaurants: async (): Promise<ApiResponse<Restaurant[]>> =>
    (await publicApi.get('/api/restaurants')).data,
  getRestaurantById: async (id: EntityId): Promise<ApiResponse<Restaurant>> =>
    (await publicApi.get(`/api/restaurants/${id}`)).data,
  getPopularRestaurants: async (): Promise<ApiResponse<Restaurant[]>> =>
    (await publicApi.get('/api/restaurants/popular')).data,
  // 관리 화면은 등록자(owner_id)가 필요해 공개 select 정책으로 직접 조회합니다.
  getRestaurantsWithOwner: async (): Promise<Restaurant[]> => {
    const { data, error } = await requireSupabase().from('restaurants').select('*').order('id');
    if (error) throw new Error(error.message);
    return (data as RestaurantRow[]).map(fromRow);
  },
  createRestaurant: async (payload: CreateRestaurantInput): Promise<Restaurant> => {
    const { data, error } = await requireSupabase().from('restaurants').insert(toRow(payload)).select('*').single();
    if (error) throw new Error(error.message);
    return fromRow(data as RestaurantRow);
  },
  // RLS에 막힌 update/delete는 오류 없이 0행을 반환하므로 결과 행 수로 차단을 판정합니다.
  updateRestaurant: async (id: EntityId, payload: UpdateRestaurantInput): Promise<Restaurant> => {
    const { data, error } = await requireSupabase().from('restaurants').update(toRow(payload)).eq('id', id).select('*');
    if (error) throw new Error(error.message);
    if (!data.length) throw new Error(NOT_ALLOWED);
    return fromRow(data[0] as RestaurantRow);
  },
  deleteRestaurant: async (id: EntityId): Promise<void> => {
    const { data, error } = await requireSupabase().from('restaurants').delete().eq('id', id).select('id');
    if (error) throw new Error(error.message);
    if (!data.length) throw new Error(NOT_ALLOWED);
  },
};
export default restaurantAPI;
