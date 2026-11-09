import styled from '@emotion/styled';
import RestaurantCard from './RestaurantCard';
import type { Restaurant } from '../types';

interface RestaurantListProps {
  restaurants: Restaurant[];
}

const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 2rem;
`;

const NoResults = styled.p`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

function RestaurantList({ restaurants }: RestaurantListProps) {
  if (restaurants.length === 0) {
    return <NoResults>해당 카테고리에 맛집이 없습니다.</NoResults>;
  }

  return (
    <ListContainer>
      {restaurants.map(restaurant => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </ListContainer>
  );
}

export default RestaurantList;
