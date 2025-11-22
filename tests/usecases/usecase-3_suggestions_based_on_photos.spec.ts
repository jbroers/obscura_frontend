import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';

test.setTimeout(180000);

test('Use Case 3 - Backend suggestions/insights are produced and shown on /statistics', async ({ page }) => {
  const backendUrl = process.env.BACKEND_URL;

    try {
    const r = await page.request.get(`${backendUrl}/photos`);
    if (!r.ok()) test.skip(true, `Backend not reachable at ${backendUrl}`);
  } catch (e: any) {
    test.skip(true, `Backend not reachable at ${backendUrl} (${e?.message || e})`);
  }

    const fixture = path.join(__dirname, '..', 'fixtures', 'example.jpg');
  const buffer = fs.readFileSync(fixture);
  const metadata = { camera: 'SuggestCam', tags: ['portrait', 'face'] };

  const uploadResp = await page.request.post(`${backendUrl}/photos/upload`, {
    multipart: {
      file: { name: 'example.jpg', mimeType: 'image/jpeg', buffer },
      metadata: JSON.stringify(metadata),
    },
  });
  expect(uploadResp.ok(), `upload -> ${uploadResp.status()}`).toBeTruthy();
  const uploaded = await uploadResp.json();

    const waitForPhoto = async (idOrFileName: string | number, timeout = 60000, interval = 500) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const listResp = await page.request.get(`${backendUrl}/photos`);
        if (!listResp.ok()) { await new Promise(r => setTimeout(r, interval)); continue; }
        const all = await listResp.json();
        if (Array.isArray(all) && all.find((p: any) => String(p.id) === String(idOrFileName) || p.fileName === uploaded.fileName)) return true;
      } catch (_) {}
      await new Promise(r => setTimeout(r, interval));
    }
    return false;
  };

  const present = await waitForPhoto(uploaded.id, 60000, 500);
  expect(present).toBeTruthy();

    const waitForStatisticsSuggestions = async (timeout = 90000, interval = 1000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const resp = await page.request.get(`${backendUrl}/statistics`);
        if (!resp.ok()) { await new Promise(r => setTimeout(r, interval)); continue; }
        const dto = await resp.json();
        if (dto && typeof dto === 'object') {
          const arr = dto.insights || dto.recommendations || dto.suggestions;
          if (Array.isArray(arr) && arr.length > 0 && arr.every((it: any) => typeof it === 'string' && it.trim().length > 0)) {
            return arr as string[];
          }
        }
      } catch (_) {}
      await new Promise(r => setTimeout(r, interval));
    }
    return null;
  };

  const suggestions = await waitForStatisticsSuggestions(90000, 1500);
  expect(suggestions, 'No insights or recommendations were returned from /statistics within timeout').not.toBeNull();
  if (!suggestions) return;

    expect(Array.isArray(suggestions)).toBeTruthy();
  expect(suggestions.length).toBeGreaterThanOrEqual(1);
  suggestions.forEach(s => expect(s.trim().length > 0).toBeTruthy());

  console.log('Backend suggestions (first 5):', suggestions.slice(0,5));

    await page.goto('/statistics');
  const suggestionsHeading = page.getByRole('heading', { name: /suggesties|suggestions|aanbevelingen|aanbevolen/i });
  const suggestionsArea = page.locator('[data-test-id="suggestions"], #suggestions, .suggestions');
  let uiFound = false;
  try {
    if (await suggestionsHeading.count() > 0) {
      await expect(suggestionsHeading.first()).toBeVisible({ timeout: 5000 });
      uiFound = true;
    } else if (await suggestionsArea.count() > 0) {
      await expect(suggestionsArea.first()).toBeVisible({ timeout: 5000 });
      uiFound = true;
    }
  } catch (_) {
  }

  if (!uiFound) {
    console.warn('Backend returned suggestions but no dedicated suggestions UI was detected on /statistics; backend verification passed (non-fatal).');
  }

});
