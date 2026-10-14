import axios from 'axios';
import { z } from 'zod';

const api = axios.create({
  baseURL: import.meta.env.PUBLIC_BACKEND_URL || '',
  timeout: 15000,
});

const heroImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  alt: z.string(),
});

export interface HeroImage {
  id: number;
  url: string;
  alt: string;
}

export const getHeroImages = async (): Promise<HeroImage[]> => {
  const { data } = await api.get('/api/hero-images');
  return z.array(heroImageSchema).parse(data).map((item) => ({
    ...item,
    url: new URL(item.url, api.defaults.baseURL || window.location.origin).href,
  }));
};
