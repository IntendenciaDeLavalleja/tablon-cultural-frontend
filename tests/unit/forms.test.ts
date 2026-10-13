import { describe, expect, it } from 'vitest';
import { eventSubmissionSchema } from '../../src/components/sections/formSchemas';
import { todayInUruguay, isISODate } from '../../src/utils/dates';

const payload = {
  name: 'Persona de Prueba', email: 'persona@example.com', confirmEmail: 'persona@example.com',
  eventName: 'Festival Cultural', locality: 'Minas', datetime: '2099-12-31',
  description: 'Un evento para toda la comunidad', captcha: '7',
};

describe('public form contract', () => {
  it('accepts optional image, contact details and normalizes email', () => {
    const data = eventSubmissionSchema.parse({ ...payload, email: ' PERSONA@example.com ' });
    expect(data.email).toBe('persona@example.com');
  });
  it.each([
    ['name', '   '], ['name', 'x'.repeat(121)], ['email', 'bad'],
    ['confirmEmail', 'someone@example.com'], ['eventName', 'ab'], ['locality', 'Wrong'],
    ['datetime', '2000-01-01'], ['datetime', '2099-02-30'], ['datetime', '31/12/2099'],
    ['description', 'short'], ['description', 'x'.repeat(5001)], ['phone', 'x'.repeat(51)],
    ['address', 'x'.repeat(256)], ['links', 'x'.repeat(1001)], ['captcha', '7abc'],
    ['image', [{ size: 2 * 1024 * 1024 + 1, type: 'image/png' }]],
    ['image', [{ size: 100, type: 'image/svg+xml' }]],
  ])('rejects invalid %s', (field, value) => {
    expect(eventSubmissionSchema.safeParse({ ...payload, [field as string]: value }).success).toBe(false);
  });
  it('accepts the exact 2 MiB boundary', () => {
    expect(eventSubmissionSchema.safeParse({ ...payload, image: [{ size: 2*1024*1024, type: 'image/png' }] }).success).toBe(true);
  });
});

describe('Uruguay date rules', () => {
  it('does not roll over at UTC midnight', () => {
    expect(todayInUruguay(new Date('2026-09-24T02:59:59Z'))).toBe('2026-09-23');
    expect(todayInUruguay(new Date('2026-09-24T03:00:00Z'))).toBe('2026-09-24');
  });
  it('validates calendar days and leap years', () => {
    expect(isISODate('2028-02-29')).toBe(true);
    expect(isISODate('2027-02-29')).toBe(false);
    expect(isISODate('2026-13-01')).toBe(false);
  });
});
