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
   **Restart the server after every `npm run build`.** The Go server reads the Vite manifest once
   at startup, so after a rebuild it keeps serving the previous content-hashed bundle path, which
   now 404s — the page loads with no JS at all and your script times out waiting for an element
   that never renders.
2. Copy `browser-check.js`'s pattern into a throwaway `scratch_*.js` at the repo root (don't
   commit it — the script must live in the repo root, not the scratchpad dir, so Node can
   resolve `node_modules/playwright`) and adapt the body inside
   `withPage()` for whatever you're checking: navigate, interact with real DOM elements
   (`page.locator(...)`, `.click()`, `.selectOption()`, dispatch events), assert via
   `page.evaluate(() => localStorage.getItem(...))`, and screenshot with
   `page.screenshot({ path, fullPage: true })`.
3. Run it with `node <script>.js` from the repo root (module resolution needs to find
   `node_modules/playwright` — running from elsewhere will fail with `Cannot find module`).
   The package is `"type": "module"`, so scratch scripts must use `import`, not `require` —
   a `.js` script using `require` will fail with `require is not defined in ES module scope`.
4. View the screenshot(s) to confirm the UI actually looks right, not just that assertions
   passed. This means the *whole page*, not just the element under test — see "Screenshots are
   for layout, not just assertions" below.
5. Clean up: delete the throwaway script, but **leave the dev server running** so the user can
   pick up manual testing where the automated check left off.

## Screenshots are for layout, not just assertions

A screenshot's job is to catch what your assertions didn't think to check. Read it as "does this
whole page look right", not "is the thing I'm testing present".

Two habits that make that work:

- **Capture a baseline first.** Screenshot the page *before* your change (stash it, or check out
  `main`) so you have something to compare against. Without a baseline you're judging an
  unfamiliar UI against no expectation, and "there's a dropdown, looks fine" passes for
  verification.
- **Renaming a custom element orphans its CSS.** Rules keyed to a tag name
  (`.toolbar toolbar-category-selector { flex-grow: 1 }`) silently stop matching when the element
  is renamed — nothing errors, the styling just vanishes. Grep `assets/css/` for the old tag as
  part of any rename. This has bitten us once already: the toolbar selector lost its `flex-grow`
  and shrank to content width, and it was visible in a screenshot that got looked at but not
  really *read*.

Also scope claims accordingly: a check that verified behavior verified behavior. Don't report it
as having confirmed the UI unless the screenshots were actually compared.

## Notes

- Prefer exercising real component wiring over mocking — only `fetch` (already handled by
  `DEV_MODE`) should be faked. Click real elements and read real `localStorage`, the same
  principle used in the Jest tests.
- If `chromium.launch()` ever fails after a `playwright` upgrade, check whether it's trying to
  download a browser build unsupported on this OS version before reaching for an
  `executablePath` override — downgrading is usually the simpler fix.
