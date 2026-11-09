// API의 식별자는 URL에 담을 수 있는 숫자 또는 문자열입니다.
export type EntityId = number | string;

export interface Restaurant {
  id: EntityId;
  name: string;
  category: string;
  location: string;
  priceRange?: string;
  rating: number;
  description?: string;
  recommendedMenu: string[];
  likes: number;
  image?: string;
  ownerId?: string | null;
}

export type CreateRestaurantInput = Omit<Restaurant, 'id' | 'likes' | 'ownerId' | 'rating' | 'recommendedMenu'> & {
  rating?: number;
  recommendedMenu?: string[];
};
export type UpdateRestaurantInput = Partial<CreateRestaurantInput>;
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

// 서버 응답의 JSON 본문은 data 안에 실제 결과를 담습니다.
export interface ApiResponse<T> {
  data: T;
}

// 메뉴 입력 문자열을 전송 전에 문자열 배열로 변환합니다.
export interface RestaurantFormValues {
  name: string;
  category: string;
  location: string;
  priceRange: string;
  rating: string | number;
  description: string;
  recommendedMenu: string;
  image: string;
}
