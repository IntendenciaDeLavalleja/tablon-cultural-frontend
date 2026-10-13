import { expect, it, vi } from 'vitest';
const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('axios', () => ({ default: { create: () => ({ get, post, defaults: { baseURL: '' } }) } }));
import { getEvents, submitEvent } from '../../src/api/events';

it('sends every field, lets the browser set the multipart boundary and preserves retry key', async () => {
  post.mockResolvedValue({ data: { submission_code: 'EVT-TEST' } });
  const image = new File(['image'], 'event.png', { type: 'image/png' });
  await submitEvent({ name: 'Nombre', email: 'p@example.com', confirmEmail: 'p@example.com', eventName: 'Evento',
    locality: 'Minas', datetime: '2099-12-31', description: 'Descripción cultural', captcha: '7',
    captcha_question: '3 + 4', links: 'https://example.com', image: [image] }, 'retry-key');
  const [path, form, options] = post.mock.calls[0];
  expect(path).toBe('/api/event-submissions');
  expect(form.get('links')).toBe('https://example.com');
  expect(form.get('event_date')).toBe('2099-12-31');
  expect(form.get('email_confirm')).toBe('p@example.com');
  expect(form.get('image').name).toBe('event.png');
  expect(options.headers).toEqual({ 'Idempotency-Key': 'retry-key' });
});

it('rejects malformed event responses instead of crashing components', async () => {
  get.mockResolvedValue({ data: { error: 'unavailable' } });
  await expect(getEvents()).rejects.toThrow();
  get.mockResolvedValue({ data: [{ id: '1', title: 'Evento', locality: 'Minas', datetime: 'invalid' }] });
  await expect(getEvents()).rejects.toThrow();
});

it('handles null optional fields from SQL and requests the complete agenda explicitly', async () => {
  get.mockResolvedValue({ data: [{ id: '1', title: 'Evento', locality: 'Minas', datetime: '2099-12-31', image: null, address: null }] });
  const events = await getEvents(true);
  expect(events[0].image).toBeUndefined();
  expect(get).toHaveBeenLastCalledWith('/api/events', { params: { all: true } });
});
