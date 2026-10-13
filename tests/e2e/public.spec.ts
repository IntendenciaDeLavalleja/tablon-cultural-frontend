import { test, expect } from '@playwright/test';

test('public pages, navigation, form validation and mobile layout', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto('/');
  await page.locator('#event-name').waitFor();
  await page.locator('#event-name').fill('  ');
  await page.getByRole('button', { name: 'Publicar mi Evento', exact: true }).click();
  await expect(page.getByText('El nombre debe tener al menos 3 caracteres')).toBeVisible();
  await expect(page.locator('#event-name')).toHaveValue('  ');
  await page.locator('#event-datetime').fill('2000-01-01');
  await expect(page.getByText('La fecha no puede ser anterior a hoy')).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await page.goto('/agenda');
  await expect(page.locator('#agenda')).toBeVisible();
  const event = page.locator('#agenda [role="button"]').first();
  if (await event.count()) {
    await event.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test('API outage shows a retry action and recovers', async ({ page }) => {
  await page.route('**/api/events*', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }));
  await page.goto('/agenda');
  await expect(page.getByRole('alert')).toHaveText('No se pudo cargar la agenda.');
  await page.unroute('**/api/events*');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.locator('#agenda')).toBeVisible();
});

test('large board and long event details remain readable', async ({ page }) => {
  const title = 'Evento'.repeat(33);
  const description = 'Descripción'.repeat(400);
  const events = Array.from({ length: 9 }, (_, index) => ({
    id: String(index + 1), title: index === 0 ? title : `Evento cultural ${index + 1}`,
    locality: 'Minas', datetime: '2099-12-31', description, address: null, image: null,
  }));
  await page.route('**/api/events*', route => route.fulfill({ json: events }));
  await page.goto('/');
  await expect(page.locator('#tablon article')).toHaveCount(9);
  await page.locator('#tablon article').first().getByRole('button').click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  const heading = modal.getByRole('heading', { name: title, exact: true });
  await expect.poll(() => heading.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  const details = modal.locator('p').filter({ hasText: description });
  await expect.poll(() => details.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  await expect(modal.getByText('Minas', { exact: true }).last()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
});
