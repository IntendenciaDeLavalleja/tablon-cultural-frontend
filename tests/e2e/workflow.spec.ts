import { test, expect } from '@playwright/test';
import { todayInUruguay } from '../../src/utils/dates';

test('submission with image → SMTP receipt → 2FA → publication → edit → archive → delete', async ({ page, request }) => {
  const title = `Prueba cultural ${Date.now()}`;
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto('/');
  await page.locator('#event-name').fill('Ciudadana de Prueba');
  await page.locator('#event-email').fill('ciudadana@example.com');
  await page.locator('#event-confirmEmail').fill('ciudadana@example.com');
  await page.locator('#event-eventName').fill(title);
  await page.locator('#event-locality').selectOption('Minas');
  await page.locator('#event-datetime').fill(todayInUruguay());
  await page.locator('#event-description').fill('Presentación cultural de prueba para la comunidad.');
  await page.locator('#event-image').setInputFiles('tests/fixtures/event.png');
  const question = await page.locator('#event-captcha').locator('xpath=../..').innerText();
  const match = question.match(/(\d+)\s*\+\s*(\d+)/)!;
  await page.locator('#event-captcha').fill(String(Number(match[1]) + Number(match[2])));
  await page.getByRole('button', { name: 'Publicar mi Evento', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('¡Evento enviado con éxito!');
  const receipt = (await page.getByRole('status').innerText()).match(/EVT-\d{4}-[A-Z0-9]+/)![0];
  await expect.poll(async () => {
    const data = await (await request.get('http://localhost:8028/api/v1/messages')).json();
    return data.messages.filter((m: any) => m.Subject.includes(receipt)).length;
  }, { timeout: 20000 }).toBeGreaterThan(0);
  await expect.poll(async () => {
    const data = await (await request.get('http://localhost:8028/api/v1/messages')).json();
    return data.messages.some((m: any) => m.Subject.includes(title) && m.To.some((to: any) => to.Address === 'admin@example.com'));
  }, { timeout: 20000 }).toBe(true);

  await page.goto('/admin/login');
  await page.locator('#email').fill('qa@example.com');
  await page.locator('#password').fill('QA-only-Password-123!');
  const challenge = (await page.locator('label[for="captcha"]').innerText()).match(/(\d+)\s*\+\s*(\d+)/)!;
  await page.locator('#captcha').fill(String(Number(challenge[1])+Number(challenge[2])));
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin\/2fa/);
  const inbox = await (await request.get('http://localhost:8028/api/v1/messages')).json();
  const codeMessage = inbox.messages.find((m: any) => m.To.some((to: any) => to.Address === 'qa@example.com'));
  const mail = await (await request.get(`http://localhost:8028/api/v1/message/${codeMessage.ID}`)).json();
  const code = mail.HTML.match(/>\s*(\d{6})\s*</)![1];
  await page.locator('#code').fill(code);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);

  await page.goto('/admin/event-submissions');
  const row = page.locator('tr').filter({ hasText: title });
  await row.locator('a').click();
  await expect(page.getByText(receipt, { exact: true })).toBeVisible();
  const image = page.getByAltText('Imagen del evento');
  await expect(image).toBeVisible();
  expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await page.locator('a[href*="/events/create"]').click();
  await expect(page.locator('#title')).toHaveValue(title);
  await page.getByRole('button', { name: 'Publicar Evento', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/events$/);
  await page.screenshot({ path: 'test-results/qa-admin.png', fullPage: true });

  await page.goto('/');
  await expect(page.locator('#tablon').getByText(title, { exact: true })).toBeVisible();
  await page.locator('#tablon article').filter({ hasText: title }).getByRole('button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const publicImage = page.getByRole('dialog').getByAltText(title);
  await expect.poll(() => publicImage.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole('dialog').getByRole('heading', { name: title, exact: true }).locator('..')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'test-results/qa-modal.png' });
  await page.getByRole('button', { name: 'Cerrar evento' }).click();

  await page.goto('/admin/events');
  await page.locator('tr').filter({ hasText: title }).getByRole('link', { name: 'Editar' }).click();
  await page.locator('#title').fill(`${title} editado`);
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();
  const editedRow = page.locator('tr').filter({ hasText: `${title} editado` });
  await editedRow.getByRole('button', { name: 'Archivar' }).click();
  expect((await (await request.get('/api/events?all=true')).json()).some((e: any) => e.title === `${title} editado`)).toBe(false);
  await page.locator('tr').filter({ hasText: `${title} editado` }).getByRole('button', { name: 'Publicar', exact: true }).click();
  expect((await (await request.get('/api/events?all=true')).json()).some((e: any) => e.title === `${title} editado`)).toBe(true);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('tr').filter({ hasText: `${title} editado` }).getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.locator('tr').filter({ hasText: `${title} editado` })).toHaveCount(0);

  // A municipal event can also be published directly, without a citizen submission.
  const directTitle = `Actividad municipal ${Date.now()}`;
  await page.goto('/admin/events/create');
  await page.locator('#title').fill(directTitle);
  await page.locator('#locality').selectOption('Minas');
  await page.locator('#event_date').fill(todayInUruguay());
  await page.locator('#description').fill('Actividad cultural creada directamente por la Intendencia.');
  await page.locator('#image').setInputFiles('tests/fixtures/event.png');
  await page.getByRole('button', { name: 'Publicar Evento', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/events$/);
  const directEvent = (await (await request.get('/api/events?all=true')).json()).find((e: any) => e.title === directTitle);
  expect(directEvent).toBeTruthy();
  expect((await request.get(directEvent.image)).status()).toBe(200);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('tr').filter({ hasText: directTitle }).getByRole('button', { name: 'Eliminar' }).click();

  // A submission without an image remains private and can be rejected with a reason.
  const rejectedTitle = `Propuesta para rechazar ${Date.now()}`;
  const proposed = await request.post('/api/event-submissions', { data: {
    full_name: 'Ciudadano de Prueba', email: 'rechazo@example.com', email_confirm: 'rechazo@example.com',
    event_name: rejectedTitle, locality: 'Minas', event_date: todayInUruguay(),
    description: 'Propuesta de prueba que requiere revisión administrativa.',
    captcha_question: '3 + 4', captcha_answer: '7',
  } });
  expect(proposed.status()).toBe(201);
  expect((await (await request.get('/api/events?all=true')).json()).some((e: any) => e.title === rejectedTitle)).toBe(false);
  await page.goto('/admin/event-submissions');
  await page.locator('tr').filter({ hasText: rejectedTitle }).locator('a').click();
  await page.locator('#note').fill('La propuesta no corresponde al alcance del tablón cultural.');
  await page.getByRole('button', { name: 'Rechazar con comentario' }).click();
  await expect(page.getByText('No puede ser convertida en evento.')).toBeVisible();
  await expect(page.getByText('La propuesta no corresponde al alcance del tablón cultural.', { exact: true })).toBeVisible();
  expect((await (await request.get('/api/events?all=true')).json()).some((e: any) => e.title === rejectedTitle)).toBe(false);
  await page.getByRole('button', { name: 'Salir', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  expect(errors).toEqual([]);
});
