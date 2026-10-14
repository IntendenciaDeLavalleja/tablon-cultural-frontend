import { useQuery } from '@tanstack/react-query';
import { getHeroImages } from '../api/heroImages';

export const useHeroImages = () => {
  return useQuery({
    queryKey: ['hero-images'],
    queryFn: getHeroImages,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
