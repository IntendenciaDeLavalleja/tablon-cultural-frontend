import axios from 'axios';
import type { EventFormData } from '../components/sections/formSchemas';
import { z } from 'zod';
import { isISODate } from '../utils/dates';

const api = axios.create({
  baseURL: import.meta.env.PUBLIC_BACKEND_URL || '',
  timeout: 30000,
});

const eventSchema = z.object({
  id: z.string(), title: z.string(), locality: z.string(),
  datetime: z.string().refine(isISODate),
  address: z.string().nullish().transform(v => v ?? undefined),
  description: z.string().nullish().transform(v => v ?? undefined),
  image: z.string().nullish().transform(v => v ? new URL(v, api.defaults.baseURL || window.location.origin).href : undefined),
  category: z.string().nullish().transform(v => v ?? undefined),
});

export const getEvents = async (showAll = false) => {
  const { data } = await api.get('/api/events', {
    params: { all: showAll }
  });
  return z.array(eventSchema).parse(data);
};

export const submitEvent = async (formData: EventFormData, idempotencyKey: string) => {
  const data = new FormData();
  
  data.append('full_name', formData.name);
  data.append('email', formData.email);
  data.append('email_confirm', formData.confirmEmail);
  data.append('phone', formData.phone || '');
  data.append('event_name', formData.eventName);
  data.append('locality', formData.locality);
  data.append('address', formData.address || '');
  data.append('event_date', formData.datetime);
  data.append('description', formData.description);
  data.append('links', formData.links || '');
  data.append('captcha_question', formData.captcha_question || '0 + 0');
  data.append('captcha_answer', formData.captcha);

  if (formData.image && formData.image[0]) {
    data.append('image', formData.image[0]);
  }

  const response = await api.post('/api/event-submissions', data, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });
  return response.data;
};
