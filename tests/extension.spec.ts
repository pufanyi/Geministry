import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const script = fileURLToPath(new URL('../dist/content.js', import.meta.url));

test.beforeEach(async ({ page }) => {
  await page.setContent('<main>Gemini menu fixture</main>');
  await page.addScriptTag({ path: script });
});

test('packaged manifest points to existing assets and a classic content script', async () => {
  const output = new URL('../dist/', import.meta.url);
  const manifest = JSON.parse(
    await readFile(new URL('manifest.json', output), 'utf8'),
  );
  expect(manifest.permissions).toEqual([]);
  expect(manifest.content_scripts[0].matches).toEqual([
    'https://gemini.google.com/*',
  ]);
  for (const name of [
    ...manifest.content_scripts[0].js,
    ...Object.values(manifest.icons),
  ]) {
    expect(
      (await readFile(new URL(String(name), output))).length,
    ).toBeGreaterThan(0);
  }
});

test('injects once and preserves element selection, thinking and dismissal', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addScriptTag({ path: script });
  await expect(page.locator('#gpt-periodic-host')).toHaveCount(1);
  await expect(page.locator('button.atom')).toHaveCount(118);
  await page.locator('.launcher').click();
  await page
    .locator('button.atom')
    .filter({ has: page.locator('.sym', { hasText: /^C$/ }) })
    .click();
  await expect(page.locator('.detail-title')).toHaveText('Gemini 4 Carbon');
  await page.locator('[data-level="High"]').click();
  await expect(page.locator('[data-level="High"]')).toHaveClass('on');
  await page.locator('.action').click();
  await expect(page.locator('.status')).toContainText('Could not find');
  await page.keyboard.press('Escape');
  await expect(page.locator('.panel')).toBeHidden();
  await page.keyboard.press('Alt+Shift+P');
  await expect(page.locator('.panel')).toBeVisible();
  await page.locator('.close').click();
  await expect(page.locator('.panel')).toBeHidden();
  expect(errors).toEqual([]);
});

test('keeps mobile overflow inside the table and respects reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.launcher').click();
  await expect(page.locator('.panel')).toHaveCSS('animation-name', 'none');
  expect(
    await page
      .locator('.table-scroll')
      .evaluate((element) => element.scrollWidth > element.clientWidth),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('applies a mocked native model and thinking level, and reports missing options', async ({
  page,
}) => {
  await page.evaluate(() => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Hydrogen';
    trigger.style.cssText = 'position:fixed;bottom:10px;left:10px';
    trigger.onclick = () => {
      const option = document.createElement('button');
      option.textContent = 'Carbon';
      option.setAttribute('role', 'menuitem');
      option.onclick = () => {
        document.body.dataset.model = 'Carbon';
        const thinking = document.createElement('button');
        thinking.textContent = 'High';
        thinking.onclick = () => {
          document.body.dataset.thinking = 'High';
        };
        document.body.append(thinking);
      };
      document.body.append(option);
    };
    document.body.append(trigger);
  });
  await page.locator('.launcher').click();
  await page
    .locator('button.atom')
    .filter({ has: page.locator('.sym', { hasText: /^C$/ }) })
    .click();
  await page.locator('[data-level="High"]').click();
  await page.locator('.action').click();
  await expect(page.locator('body')).toHaveAttribute('data-model', 'Carbon');
  await expect(page.locator('body')).toHaveAttribute('data-thinking', 'High');
  await expect(page.locator('.status')).toContainText('Check Gemini');
  await page.locator('[data-other="Auto"]').click();
  await expect(page.locator('.status')).toContainText('Auto was not found');
});
