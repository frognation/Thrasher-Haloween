const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const fileUrl = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;

test.beforeEach(async ({ page }) => {
  await page.goto(fileUrl);
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('video')).every(v => v.readyState >= 1)
  );
});

test('loads videos and controls', async ({ page }) => {
  await expect(page.locator('video')).toHaveCount(2);
  await expect(page.locator('#switchBtn')).toBeVisible();
  await expect(page.locator('#playBtn')).toBeVisible();
  await expect(page.locator('#prevBtn')).toBeVisible();
  await expect(page.locator('#nextBtn')).toBeVisible();
  await expect(page.locator('#candleBtn')).toBeVisible();
  await expect(page.locator('#lightningBtn')).toBeVisible();
});

test('switch toggles layer order and styling', async ({ page }) => {
  await expect(page.locator('#frontVideo')).toHaveClass(/is-top/);
  await page.click('#switchBtn');
  await expect(page.locator('#frontVideo')).not.toHaveClass(/is-top/);
  await expect(page.locator('#switchBtn')).toHaveClass(/off/);
});

test('play/pause toggles playback state', async ({ page }) => {
  await page.waitForFunction(() => !document.getElementById('frontVideo').paused);
  await page.click('#playBtn'); // pause
  const paused = await page.evaluate(() => document.getElementById('frontVideo').paused);
  expect(paused).toBe(true);
  await page.click('#playBtn'); // play
  const playing = await page.evaluate(() => !document.getElementById('frontVideo').paused);
  expect(playing).toBe(true);
});

test('prev/next preserve play or pause state', async ({ page }) => {
  await page.waitForFunction(() => !document.getElementById('frontVideo').paused);
  const playingBefore = await page.evaluate(() => !document.getElementById('frontVideo').paused);
  await page.click('#prevBtn');
  const playingAfterPrev = await page.evaluate(() => !document.getElementById('frontVideo').paused);
  expect(playingBefore).toBe(true);
  expect(playingAfterPrev).toBe(true);

  await page.click('#playBtn'); // pause
  const pausedBefore = await page.evaluate(() => document.getElementById('frontVideo').paused);
  await page.click('#nextBtn');
  const pausedAfterNext = await page.evaluate(() => document.getElementById('frontVideo').paused);
  expect(pausedBefore).toBe(true);
  expect(pausedAfterNext).toBe(true);
});

test('candle/lightning toggles mode and lightning flickers', async ({ page }) => {
  await expect(page.locator('#videoStack')).toHaveClass(/candle-mode/);
  await page.click('#lightningBtn');
  await expect(page.locator('#videoStack')).toHaveClass(/lightning-mode/);
  await page.waitForFunction(
    () => document.querySelector('.video.is-top').classList.contains('flash-off'),
    { timeout: 7000 }
  );
  await page.click('#candleBtn');
  await expect(page.locator('#videoStack')).toHaveClass(/candle-mode/);
});
