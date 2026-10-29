import { test, expect } from '@playwright/test';

test('doctor photo renders in 3D, drags and flips with a keyboard control', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('#cuidado').scrollIntoViewIfNeeded();
  await expect(page.locator('.doctor-lanyard-stage')).toHaveAttribute('data-ready', 'true', { timeout: 25000 });
  await expect(page.locator('.lanyard-canvas')).toBeVisible();
  await expect(page.locator('.doctor-card-fallback')).toBeHidden();
  const box = await page.locator('.lanyard-canvas').boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await expect(page.locator('.lanyard')).toHaveAttribute('data-dragging', 'true');
  await page.mouse.move(x + 65, y + 25, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('.lanyard')).toHaveAttribute('data-dragging', 'false');
  await page.getByRole('button', { name: 'Virar fotografia da doutora' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.lanyard')).toHaveAttribute('data-side', 'back');
  await page.keyboard.press('Enter');
  await expect(page.locator('.lanyard')).toHaveAttribute('data-side', 'front');
  await page.waitForTimeout(1500);
  await page.locator('#cuidado').screenshot({ path: `test-results/${testInfo.project.name}-lanyard.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  expect(errors).toEqual([]);
});

test('doctor photograph stays usable when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type.startsWith('webgl') || type === 'experimental-webgl') return null;
      return getContext.call(this, type, ...args);
    };
  });
  await page.goto('/');
  await page.locator('#cuidado').scrollIntoViewIfNeeded();
  await expect(page.locator('.doctor-card-fallback')).toBeVisible();
  await expect(page.locator('.lanyard-canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Virar fotografia da doutora' }).click();
  await expect(page.locator('.doctor-card-fallback img')).toHaveAttribute('alt', 'Dra. Laiane ao lado de uma paciente na SorriMed');
  await expect(page.locator('.doctor-card-fallback img')).toHaveJSProperty('complete', true);
  expect(await page.locator('.doctor-card-fallback img').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
});
