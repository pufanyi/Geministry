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
  await page
    .locator('body > button')
    .filter({ hasText: /^Hydrogen$/ })
    .click();
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

test('replaces native clicks and keyboard activation with an anchored dropdown', async ({
  page,
}) => {
  await page.evaluate(() => {
    const trigger = document.createElement('button');
    trigger.id = 'native-selector';
    trigger.innerHTML = '<span>Hydrogen</span>';
    trigger.setAttribute('aria-label', 'Hydrogen');
    trigger.style.cssText = 'position:fixed;top:45%;right:20%;height:48px';
    for (const event of ['pointerdown', 'click', 'keydown']) {
      trigger.addEventListener(event, () => {
        document.body.dataset.nativeOpened = 'true';
      });
    }
    document.body.append(trigger);
  });
  const trigger = page.locator('#native-selector');
  const panel = page.locator('.panel');
  await expect(page.locator('.launcher')).toBeHidden();
  await trigger.locator('span').click();
  await expect(panel).toBeVisible();
  await expect(panel).toHaveClass('panel anchored');
  await expect(page.locator('.scrim')).toBeHidden();
  await expect(page.locator('.close')).toBeFocused();
  await expect(page.locator('body')).not.toHaveAttribute('data-native-opened');
  await panel.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  );
  const triggerBox = await trigger.boundingBox();
  const panelBox = await panel.boundingBox();
  if (!triggerBox || !panelBox) throw new Error('Missing dropdown bounds');
  expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(720 - 15);
  expect(panelBox.y).toBeGreaterThanOrEqual(triggerBox.y + triggerBox.height);
  await trigger.click();
  await expect(panel).toBeHidden();
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Space');
  await expect(panel).toBeVisible();
  await page.locator('main').click({ position: { x: 5, y: 5 } });
  await expect(panel).toBeHidden();
  await expect(page.locator('body')).not.toHaveAttribute('data-native-opened');
});

test('flips above a low selector and restores the launcher after SPA removal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const trigger = document.createElement('button');
    trigger.id = 'native-selector';
    trigger.textContent = 'Carbon';
    trigger.style.cssText = 'position:fixed;bottom:20px;right:20px';
    document.body.append(trigger);
  });
  const trigger = page.locator('#native-selector');
  const panel = page.locator('.panel');
  await expect(page.locator('.launcher')).toBeHidden();
  await trigger.click();
  await expect(panel).toBeVisible();
  await panel.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  );
  const triggerBox = await trigger.boundingBox();
  const panelBox = await panel.boundingBox();
  if (!triggerBox || !panelBox) throw new Error('Missing dropdown bounds');
  expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(triggerBox.y - 8);
  expect(panelBox.x).toBeGreaterThanOrEqual(15);
  expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(390 - 15);
  await page.evaluate(() =>
    document.querySelector('#native-selector')?.remove(),
  );
  await expect(panel).toBeHidden();
  await expect(page.locator('.launcher')).toBeVisible();
});
