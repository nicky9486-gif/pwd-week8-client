import type { EntityId } from '../types';

const LIKED_IDS_KEY = 'likedRestaurants';
const LIKE_COUNTS_KEY = 'restaurantLikes';

export interface LikeState {
  liked: boolean;
  likes: number;
}

function readJson(key: string, fallback: unknown): unknown {
  const saved = localStorage.getItem(key);
  return saved === null ? fallback : JSON.parse(saved);
}

function readLikes() {
  const ids = readJson(LIKED_IDS_KEY, []);
  const counts = readJson(LIKE_COUNTS_KEY, {});
  const validId = (value: unknown): value is EntityId =>
    typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
  if (!Array.isArray(ids) || !ids.every(validId)) {
    throw new Error('저장된 좋아요 목록의 형식을 확인하세요.');
  }
  if (typeof counts !== 'object' || counts === null || Array.isArray(counts)
    || !Object.values(counts).every((value) => typeof value === 'number' && Number.isFinite(value) && value >= 0)) {
    throw new Error('저장된 좋아요 수의 형식을 확인하세요.');
  }
  return { ids: ids as EntityId[], counts: counts as Record<string, number> };
}

export function readLikeState(id: EntityId, fallbackLikes: number): LikeState {
  const { ids, counts } = readLikes();
  return {
    liked: ids.some((savedId) => String(savedId) === String(id)),
    likes: counts[String(id)] ?? fallbackLikes,
  };
}

export function toggleRestaurantLike(id: EntityId, liked: boolean, likes: number): LikeState {
  const stored = readLikes();
  const next = { liked: !liked, likes: liked ? Math.max(0, likes - 1) : likes + 1 };
  const ids = stored.ids.filter((savedId) => String(savedId) !== String(id));
  if (next.liked) ids.push(id);
  const counts = { ...stored.counts, [String(id)]: next.likes };
  const previousIds = localStorage.getItem(LIKED_IDS_KEY);

  // 두 번째 저장이 실패하면 첫 번째 저장도 복원해 두 값의 불일치를 막습니다.
  localStorage.setItem(LIKED_IDS_KEY, JSON.stringify(ids));
  try {
    localStorage.setItem(LIKE_COUNTS_KEY, JSON.stringify(counts));
  } catch (error) {
    if (previousIds === null) localStorage.removeItem(LIKED_IDS_KEY);
    else localStorage.setItem(LIKED_IDS_KEY, previousIds);
    throw error;
  }
  // 화면은 저장이 끝난 경우에만 이 결과로 갱신합니다.
  return next;
}
