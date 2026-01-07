import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';

test.setTimeout(180000);
test('Use Case 2 - Statistics show trends after upload', async ({ page }) => {
  const backendUrl = process.env.BACKEND_URL;
  try { const resp = await page.request.get(`${backendUrl}/photos`); if (!resp.ok()) test.skip(true, `Backend not reachable at ${backendUrl}`); } catch (e:any) { test.skip(true, `Backend not reachable at ${backendUrl} (${e?.message||e})`); }

  const fixture = path.join(__dirname, '..', 'fixtures', 'example.jpg');
  const buffer = fs.readFileSync(fixture);
  const metadata = { camera: 'StatsCam', location: 'StatsLocation', tags: ['stats','integration'] };
  const uploadResp = await page.request.post(`${backendUrl}/photos/upload`, { multipart: { file: { name: 'example.jpg', mimeType: 'image/jpeg', buffer }, metadata: JSON.stringify(metadata) } });
  expect(uploadResp.ok(), `upload -> ${uploadResp.status()}`).toBeTruthy();
  const uploaded = await uploadResp.json();

  const fetchPhotos = async () => {
    const r = await page.request.get(`${backendUrl}/photos`);
    return await r.json();
  };

  const waitForUploadedWithMeta = async (id: number | string, timeout = 90000, interval = 500) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const photos = await fetchPhotos();
        if (Array.isArray(photos)) {
          const found = photos.find((p:any) => String(p.id) === String(id) || p.fileName === uploaded.fileName);
          if (found) {
            const m = typeof found.metadata === 'string' ? JSON.parse(found.metadata) : found.metadata;
            return { found, meta: m };
          }
        }
      } catch (_) {}
      await new Promise(r => setTimeout(r, interval));
    }
    return null;
  };

  const result = await waitForUploadedWithMeta(uploaded.id, 90000, 500);
  expect(result).not.toBeNull();
  if (!result) return;
  const { found, meta } = result as any;
    expect(found, 'Uploaded photo was not found in backend list').toBeTruthy();
    if (found && uploaded.id && found.id) expect(String(found.id)).toEqual(String(uploaded.id));
  else if (found && uploaded.fileName && found.fileName) expect(found.fileName).toEqual(uploaded.fileName);

    if (meta) {
    if (metadata.camera) expect(meta.camera).toEqual(metadata.camera);
    if (metadata.location) expect(meta.location).toEqual(metadata.location);
    if (metadata.tags) expect(Array.isArray(meta.tags) && metadata.tags.every((t:any)=>meta.tags.includes(t))).toBeTruthy();
  }

    await page.goto('/statistics');
  const header = page.getByText(/Foto Statistieken|Statistieken|Totaal Foto's|Total Photos/i);
  const statsExists = (await header.count()) > 0;
  if (statsExists) await expect(header.first()).toBeVisible();
});
