import { test, expect } from '@playwright/test';

test('loads real photography, contacts and responsive page without runtime errors', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const badResponses = [];
  page.on('response', response => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`); });
  await page.goto('/');
  await expect(page).toHaveTitle('SorriMed | Seu sorriso. Sua essência.');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Seu sorriso.Sua essência.');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-hero.png` });
  if (testInfo.project.name === 'desktop') {
    const heroBounds = await page.locator('.hero').boundingBox();
    const photoBounds = await page.locator('.hero-image').boundingBox();
    expect(photoBounds.y + photoBounds.height).toBeLessThanOrEqual(heroBounds.y + heroBounds.height);
  }
  for (const id of ['sobre', 'cuidado', 'sorrisos', 'contato']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1400);
  }
  await page.locator('.gallery-stage').scrollIntoViewIfNeeded();
  await expect(page.locator('.bounce-cards__card').first()).toBeVisible();
  await page.waitForTimeout(1500);
  expect((await page.locator('.bounce-cards__card').first().boundingBox()).width).toBeGreaterThan(150);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-gallery.png` });
  await page.locator('#contato').scrollIntoViewIfNeeded();
  const images = await page.locator('main img').evaluateAll(imgs => imgs.map(img => ({ alt: img.alt, ok: img.complete && img.naturalWidth > 0 })));
  expect(images.every(image => image.ok && image.alt)).toBeTruthy();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  const whatsapp = page.locator('a[href="https://wa.me/5565999800704"]');
  expect(await whatsapp.count()).toBeGreaterThanOrEqual(5);
  await expect(page.locator('a[href="tel:+556532831262"]')).toBeVisible();
  await expect(page.locator('a[href="https://www.instagram.com/sorrimeddo/"]')).toBeVisible();
  await expect(page.getByRole('link', { name: /VENHA NOS CONHECER/ })).toHaveAttribute('href', /query=SorriMed/);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-full.png`, fullPage: true });
  expect(errors).toEqual([]);
  expect(badResponses).toEqual([]);
});

test('gallery filters, carousel, keyboard lightbox and focus restoration work', async ({ page }) => {
  await page.goto('/');
  await page.locator('#sorrisos').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Antes e depois', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Antes e depois', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Próximas fotografias' }).click();
  await expect(page.locator('.gallery-controls > span')).toHaveText('02 / 07');
  const card = page.locator('.bounce-cards__card').first();
  await card.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Galeria de fotografias' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('alt', 'Registro original de antes e depois 2');
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('img')).toHaveAttribute('alt', 'Registro original de antes e depois 3');
  await expect(dialog.locator('.results-note')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(card).toBeFocused();
  await page.getByRole('button', { name: 'Nossa clínica', exact: true }).click();
  await expect(page.locator('.gallery-controls > span')).toHaveText('01 / 04');
});

test('navigation, care accordion and reduced motion remain functional', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const menu = page.getByRole('dialog', { name: 'Menu de navegação' });
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: /Nosso cuidado/ }).click();
    await expect(menu).not.toBeVisible();
  } else {
    await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Nosso cuidado' }).click();
  }
  await expect(page).toHaveURL(/#cuidado$/);
  const button = page.getByRole('button', { name: /Cada sorriso, um caminho/ });
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('region', { name: /Cada sorriso, um caminho/ })).toContainText('Um olhar individual');
  await expect(page.getByRole('button', { name: /Primeiro, a gente escuta/ })).toHaveAttribute('aria-expanded', 'false');
  expect(await page.locator('.seal-ring').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await expect(page.locator('.doctor-card-fallback')).toBeVisible();
  await expect(page.locator('.lanyard-canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Virar fotografia da doutora' }).click();
  await expect(page.locator('.doctor-card-fallback img')).toHaveAttribute('alt', 'Dra. Laiane ao lado de uma paciente na SorriMed');
  await page.locator('#sorrisos').scrollIntoViewIfNeeded();
  await expect(page.locator('.bounce-cards__card').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
