const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

async function preparePage(page, themeSetting = 'light') {
  await page.addInitScript((setting) => {
    window.localStorage.setItem('theme', setting);
  }, themeSetting);

  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('google-analytics.com') || url.includes('plausible.io') || url.includes('badge.dimensions.ai')) {
      route.abort();
      return;
    }
    route.continue();
  });
}

async function stabilizeVisuals(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0ms !important;
        animation-delay: 0ms !important;
        caret-color: transparent !important;
      }
      .altmetric-embed,
      .__dimensions_badge_embed__,
      iframe.giscus-frame,
      #giscus_thread,
      .cc-window {
        visibility: hidden !important;
      }
    `,
  });
}

function diffRatio(actualPng, baselinePng) {
  const width = Math.min(actualPng.width, baselinePng.width);
  const height = Math.min(actualPng.height, baselinePng.height);
  const actual = new PNG({ width, height });
  const baseline = new PNG({ width, height });
  PNG.bitblt(actualPng, actual, 0, 0, width, height, 0, 0);
  PNG.bitblt(baselinePng, baseline, 0, 0, width, height, 0, 0);
  const diff = new PNG({ width, height });
  const changed = pixelmatch(actual.data, baseline.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false,
  });
  return changed / (width * height);
}

async function compareWithBaseline(context, currentPage, route, themeSetting) {
  const baselineURL = process.env.BASELINE_URL;
  if (!baselineURL) {
    return null;
  }

  const baselinePage = await context.newPage();
  await baselinePage.addInitScript((setting) => {
    window.localStorage.setItem('theme', setting);
  }, themeSetting);
  await baselinePage.goto(`${baselineURL}${route}`, { waitUntil: 'networkidle' });
  await stabilizeVisuals(baselinePage);
  await baselinePage.waitForTimeout(500);
  const baselineBuffer = await baselinePage.screenshot({ fullPage: false });

  await currentPage.goto(route, { waitUntil: 'networkidle' });
  await stabilizeVisuals(currentPage);
  await currentPage.waitForTimeout(500);
  const currentBuffer = await currentPage.screenshot({ fullPage: false });

  await baselinePage.close();

  return diffRatio(PNG.sync.read(currentBuffer), PNG.sync.read(baselineBuffer));
}

module.exports = {
  preparePage,
  stabilizeVisuals,
  compareWithBaseline,
};
