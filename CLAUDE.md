# hn-reader

Simple Hacker News reader with per-domain categorization and story hiding, stored in `localStorage`.

A **category** is a bucket of domains (`localStorage` key `categories`). A **view** is what the main page filter actually offers: a named set of one or more categories (`localStorage` key `views`), matched with OR. Views are edited on the settings page. Users who predate views get one view per category, 1:1, on first load.

## Structure

- `main.go`, `main_test.go` — Go backend. Fetches/serves HN story data, serves the templates and static assets.
- `templates/` — HTML templates (`index.html`, `settings.html`) rendered by the Go server.
- `assets/js/` — Frontend source, plain ES modules registering native Custom Elements (`x-story`, `x-story-list`, `category-selector`, etc.). Bundled by Vite into `assets/dist/` for production (see Frontend section below) but otherwise unbundled/no other build step.
- `assets/css/` — Stylesheets.
- `tests/` — Jest tests for the frontend.
- `data/` — Cached HN data JSON files (gitignored).

## Running the backend

```
go run .
```

Serves on :8080. To run in the background (e.g. production):

```
/usr/local/go/bin/go run . >>log.txt 2>&1 &
disown
```

To stop: `lsof -i :8080` then kill the listed pid.

Go tests: `go test ./...`

### Dev mode

`DEV_MODE=1 go run .` skips fetching stories from the HN API and instead loads `data/dev-stories.json` (a fixture array of `story` structs, gitignored — regenerate it if needed, e.g. from the live API). If the file is missing or unparsable, it fails open and falls back to fetching from the live API.

## Frontend

There are two Vite entry points, each bundled into its own content-hashed file in `assets/dist/`:
`assets/js/index.js` for the main page and `assets/js/settings.js` for the settings page. Both are
referenced by their templates (`{{.JsBundle}}` / `{{.SettingsJsBundle}}`) via a manifest
(`assets/dist/.vite/manifest.json`) that the Go server reads at startup — adding an entry point
means adding it to both `vite.config.mjs` and `loadJsBundlePaths` in `main.go`. This replaced a
no-bundler setup after we found some browsers (notably one user's Chrome/iOS combo) would keep
serving stale cached copies of the individually-imported JS modules even with `?v=` cache-busting
query params and `Cache-Control: no-cache` headers — a content-hashed bundle filename sidesteps
the problem entirely since the URL itself changes when the code changes.

**After editing anything in `assets/js/`, run `npm run build`** to regenerate the bundle, then
reload the browser. If the manifest is missing, the server fails to start with a clear error
telling you to run the build — it does not silently fall back to unbundled JS.

Confirmed fix (2026-08-16): this resolved a real stale-JS bug on a user's Chrome/iOS device that
`?v=` query params and `Cache-Control: no-cache` headers alone couldn't fix. If asset-caching
issues come up again, don't re-litigate HTTPS/header theories — both were already ruled out; the
content-hash bundle filename was the actual fix.

`assets/dist/` (including the manifest) is gitignored, not committed — it's built on the
production VPS as part of deploy (Node 22 is installed there via NodeSource for this). See the
`deploying-to-prod` skill.

`assets/css/` has no bundler and is served as-is with a `?v=` cache-busting query param.

Both `/` and `/settings` are rendered Go templates (neither is served as a static file), since each
needs its bundle path and `{{.Version}}` injected.

Jest tests: `npm test` (jsdom environment, ES modules via Babel). Tests live in `tests/`, prefer exercising real component wiring (real custom elements, real `categoryStore`/`hiddenStore` backed by jsdom `localStorage`) over mocking internals — only `fetch` should be mocked.

## Deploying

Use the `deploying-to-prod` skill to deploy to the production VPS (hn.caleb.software).
