---
name: browser-testing
description: Ad-hoc real-browser (Playwright/Chromium) checks against hn-reader's frontend — interact with the live DOM, click through custom elements, and screenshot the result. Use when a change to assets/js needs to be verified by actually driving the browser, not just Jest/jsdom.
---

# Browser testing (Playwright)

This isn't an automated test suite — it's a way to actually click through the app in a real
browser and see/verify the result, for cases where [tests/](../../tests) (jsdom) isn't enough
(e.g. visual verification, or exercising real browser APIs jsdom doesn't implement).

`playwright` is a devDependency, pinned to `^1.60.0` — that version's default Chromium build
(`chromium-1223`) matches what's already cached in `~/Library/Caches/ms-playwright` on this
machine, avoiding a `Playwright does not support chromium on mac13` install failure with newer
Playwright versions. Don't bump the `playwright` version without checking this still works.

## Workflow

1. Start the backend in dev mode so it serves cached story data instead of hitting the live HN
   API (see the "Dev mode" section in the root `CLAUDE.md`):
   ```bash
   DEV_MODE=1 go run . > /tmp/hn-e2e.log 2>&1 &
   ```
2. Copy `browser-check.js`'s pattern into a throwaway script (e.g. in the scratchpad dir, or
   `scratch_*.js` at the repo root — either way, don't commit it) and adapt the body inside
   `withPage()` for whatever you're checking: navigate, interact with real DOM elements
   (`page.locator(...)`, `.click()`, `.selectOption()`, dispatch events), assert via
   `page.evaluate(() => localStorage.getItem(...))`, and screenshot with
   `page.screenshot({ path, fullPage: true })`.
3. Run it with `node <script>.js` from the repo root (module resolution needs to find
   `node_modules/playwright` — running from elsewhere will fail with `Cannot find module`).
4. View the screenshot(s) to confirm the UI actually looks right, not just that assertions
   passed.
5. Clean up: delete the throwaway script, and kill the dev server
   (`lsof -ti :8080 | xargs kill`).

## Notes

- Prefer exercising real component wiring over mocking — only `fetch` (already handled by
  `DEV_MODE`) should be faked. Click real elements and read real `localStorage`, the same
  principle used in the Jest tests.
- If `chromium.launch()` ever fails after a `playwright` upgrade, check whether it's trying to
  download a browser build unsupported on this OS version before reaching for an
  `executablePath` override — downgrading is usually the simpler fix.
