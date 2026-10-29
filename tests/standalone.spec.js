import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('downloadable HTML renders and works without requesting any other file', async ({ page, context }, testInfo) => {
  const html = readFileSync('release/visualizacao/index.html', 'utf8');
  const unexpected = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Only the document is available: even existing hosted assets are inaccessible.
  await page.route('**/*', async route => {
    if (route.request().isNavigationRequest() && route.request().url().endsWith('/standalone.html')) {
      await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
    } else {
      unexpected.push(route.request().url());
      await route.abort();
    }
  });
  await page.goto('/standalone.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Seu sorriso.Sua essência.');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.hero-image > img')).toHaveJSProperty('complete', true);
  expect(await page.locator('.hero-image > img').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await context.setOffline(true);
  await page.locator('.gallery-stage').scrollIntoViewIfNeeded();
  for (const label of ['Nossos sorrisos', 'Antes e depois', 'Nossa clínica']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    const card = page.locator('.bounce-cards__card').last();
    await card.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Galeria de fotografias' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveJSProperty('complete', true);
    expect(await dialog.locator('img').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Próxima foto', exact: true }).click();
    await expect(dialog.locator('img')).toHaveJSProperty('complete', true);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  }
  expect(unexpected).toEqual([]);
  expect(errors).toEqual([]);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-standalone.png` });
});
