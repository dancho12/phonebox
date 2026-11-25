const { test, expect } = require('@playwright/test');

// Home Assistant dashboard widget: the phone opens the dashboard itself, from the address the agent sends (never the
// token) or the widget's own, and says so while the server does not answer.
const dashConfig = (options, homeAssistant = { url: null, token: null }) => ({ night: { enabled: false }, shortcuts: [], homeAssistant,
  pages: [{ id: 'test', title: 'Test', enabled: true, widgets: [{ id: 'dash', type: 'hadash', x: 0, y: 0, w: 12, h: 6, options }] }] });

async function open(page, url, options, homeAssistant) {
  await page.goto(url);
  await page.evaluate((c) => { localStorage.clear(); localStorage.setItem('pb-demo-config', JSON.stringify(c)); }, dashConfig(options, homeAssistant));
  await page.reload();
}

test('without an address the widget says where to set it', async ({ page }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await open(page, '/panel/', { dashboard: 'desk-panel/home' });
  await expect(page.locator('.w-hadash .empty')).toHaveText('Set the Home Assistant address in Settings › General, or in this widget');
  await expect(page.locator('.w-hadash iframe')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('the dashboard opens from the address in Settings, in a frame of its own origin', async ({ page, baseURL }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  const server = new URL(baseURL).origin;
  await open(page, '/panel/', { dashboard: '/desk-panel/home/' }, { url: server + '/', token: 'secret-token' });
  const frame = page.locator('.w-hadash iframe');
  await expect(frame).toHaveAttribute('src', server + '/desk-panel/home');
  await expect(frame).toHaveAttribute('sandbox', /allow-same-origin/);
  await expect(page.locator('.w-hadash')).toHaveClass(/bare-html/); // no card background by default
  // no card around it, and not clipped to rounded corners (WebView would drop the page's own rounded clips)
  const box = await page.locator('.w-hadash').evaluate((e) => { const c = getComputedStyle(e); return [c.backgroundColor, c.overflow, c.borderRadius]; });
  expect(box).toEqual(['rgba(0, 0, 0, 0)', 'visible', '0px']);
  // the token stays with the agent
  const config = await page.evaluate(() => fetch('/agent/api/config').then((r) => r.text()));
  expect(JSON.parse(config).config.homeAssistant).toEqual({ url: server + '/' });
  expect(config).not.toContain('secret-token');
  expect(errors).toEqual([]);
});

test('the widget\'s own address wins, and a path it cannot use falls back to the default dashboard', async ({ page, baseURL }) => {
  const server = new URL(baseURL).origin;
  await open(page, '/panel/', { address: server, dashboard: 'bad path"><x', transparent: false }, { url: 'http://homeassistant.local:8123', token: 't' });
  await expect(page.locator('.w-hadash iframe')).toHaveAttribute('src', server + '/lovelace');
  await expect(page.locator('.w-hadash')).not.toHaveClass(/bare-html/);
});

test('while the server does not answer the widget says so', async ({ page }) => {
  // nothing listens on port 9 (discard) here, so the check fails at once
  await open(page, '/panel/', { address: 'http://127.0.0.1:9' });
  await expect(page.locator('.w-hadash .empty')).toHaveText('Home Assistant does not answer. Trying again…');
  await expect(page.locator('.w-hadash iframe')).toHaveCount(0);
});

test('the settings offer the dashboards Home Assistant lists', async ({ page }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.setViewportSize({ width: 1280, height: 860 });
  await open(page, '/settings/#pages', { dashboard: '' });
  await page.locator('#canvas .wb').first().click(); // selects the widget and opens its settings
  const input = page.locator('input[placeholder="lovelace/0"]');
  await expect(input).toBeVisible();
  const list = page.locator(`datalist#${await input.getAttribute('list')} option`);
  await expect(list).toHaveCount(3);
  await expect(list.nth(1)).toHaveAttribute('value', 'desk-panel/home');
  await input.fill('desk-panel/climate');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('pb-demo-config') || 'null'))).toBeTruthy();
  expect(errors).toEqual([]);
});
