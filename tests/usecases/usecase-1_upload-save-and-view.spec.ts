import path from 'path';
import { test, expect } from '@playwright/test';

test.setTimeout(120000);
test('Use Case 1 - Upload & view photos', async ({ page }) => {
  const fixtureFile = path.join(__dirname, '..', 'fixtures', 'example.jpg');
  const backendUrl = process.env.BACKEND_URL;
  try { const resp = await page.request.get(`${backendUrl}/photos`); if (!resp.ok()) test.skip(true, `Backend not reachable at ${backendUrl}`); } catch (e:any) { test.skip(true, `Backend not reachable at ${backendUrl} (${e?.message||e})`); }

  const fetchPhotos = async () => {
    const r = await page.request.get(`${backendUrl}/photos`);
    return await r.json();
  };
  const waitForPhotoCount = async (expectedCount: number, timeout = 60000, interval = 500) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const photos = await fetchPhotos();
        const c = Array.isArray(photos) ? photos.length : 0;
        if (c >= expectedCount) return c;
      } catch (_) {}
      await new Promise(r => setTimeout(r, interval));
    }
    const photos = await fetchPhotos(); return Array.isArray(photos) ? photos.length : 0;
  };

  const initialPhotos = await fetchPhotos();
  const initialCount = Array.isArray(initialPhotos) ? initialPhotos.length : 0;

  await page.goto('/photos');
  const input = page.locator('#file-input');
  await input.setInputFiles(fixtureFile);
  const uploadButton = page.getByRole('button', { name: 'Upload' });

    const [ resp ] = await Promise.all([
    page.waitForResponse(r => r.url().startsWith(`${backendUrl}/photos`) && r.request().method() === 'POST', { timeout: 15000 }),
    uploadButton.click(),
  ]);
  const status = resp.status();
  let body = '';
  try { body = await resp.text(); } catch (_) {}
  if (!resp.ok()) throw new Error(`Upload failed with status ${status}: ${body}`);

    const observedCount = await waitForPhotoCount(initialCount + 1, 60000, 500);
  expect(observedCount).toBeGreaterThanOrEqual(initialCount + 1);

    await page.goto('/photos');
  await expect(page.locator('img').first()).toBeVisible();
});
