import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { FaStar, FaHeart, FaMapMarkerAlt, FaWonSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import type { Restaurant } from '../types';
import { readLikeState, toggleRestaurantLike } from '../services/likes';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const Card = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ImagePlaceholder = styled.div`
  height: 200px;
  display: grid;
  place-items: center;
  background: #e9ecf7;
  color: #596080;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  color: #333;
`;

const CategoryBadge = styled.span`
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const LikeButton = styled.button<{ $liked: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.$liked ? '#ff4757' : '#ddd'};
  background: ${props => props.$liked ? '#ff4757' : 'white'};
  color: ${props => props.$liked ? 'white' : '#666'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #ff4757;
    background: #ff4757;
    color: white;
  }
`;

const DetailLink = styled(Link)`
  color: #667eea;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(restaurant.likes || 0);

  useEffect(() => {
    try {
      const saved = readLikeState(restaurant.id, restaurant.likes || 0);
      setLiked(saved.liked);
      setLikes(saved.likes);
    } catch (error) {
      console.error('좋아요 복원 오류:', error);
    }
  }, [restaurant.id, restaurant.likes]);

  const handleLike = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const next = toggleRestaurantLike(restaurant.id, liked, likes);
      setLiked(next.liked);
      setLikes(next.likes);
      if (next.liked) toast.success(`${restaurant.name}을(를) 좋아요했습니다! ❤️`);
      else toast.info('좋아요를 취소했습니다.');
    } catch (error) {
      console.error('좋아요 저장 오류:', error);
      toast.error('좋아요를 저장하지 못했습니다. 브라우저 저장소를 확인하세요.');
    }
  };

  return (
    <Card>
      {restaurant.image ? <CardImage src={restaurant.image} alt={restaurant.name} />
        : <ImagePlaceholder>이미지 없음</ImagePlaceholder>}
      <CardContent>
        <CardHeader>
          <CardTitle>{restaurant.name}</CardTitle>
          <CategoryBadge>{restaurant.category}</CategoryBadge>
        </CardHeader>

        <InfoRow>
          <FaMapMarkerAlt /> {restaurant.location}
        </InfoRow>
        <InfoRow>
          <FaWonSign /> {restaurant.priceRange}
        </InfoRow>
        <InfoRow>
          <FaStar color="gold" /> {restaurant.rating}/5.0
        </InfoRow>

        <p style={{ margin: '1rem 0', color: '#666' }}>
          {restaurant.description}
        </p>

        <ActionRow>
          <LikeButton
            $liked={liked}
            aria-label={`${restaurant.name} 좋아요`}
            aria-pressed={liked}
            onClick={handleLike}
            type="button"
          >
            <FaHeart /> {likes}
          </LikeButton>
          <DetailLink to={`/restaurant/${restaurant.id}`}>
            자세히 보기 →
          </DetailLink>
        </ActionRow>
      </CardContent>
    </Card>
  );
}

export default RestaurantCard;
