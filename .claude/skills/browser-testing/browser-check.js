// Minimal helper for ad-hoc real-browser checks against the running dev server.
// Not a test framework — just launches Chromium, hands you a page, and cleans up.
// Copy the `main()` body below into a scratch script and adapt it per check; see SKILL.md.
const { chromium } = require('playwright');

async function withPage(fn) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
        await fn(page);
    } finally {
        await browser.close();
    }
}

async function main() {
    const baseUrl = process.env.BASE_URL || 'http://localhost:8080';

    await withPage(async (page) => {
        await page.goto(baseUrl);
        await page.waitForSelector('x-story');
        await page.screenshot({ path: 'screenshot.png', fullPage: true });
        console.log('Saved screenshot.png');
    });
}

if (require.main === module) {
    main();
}

module.exports = { withPage };
