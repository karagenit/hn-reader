# hn-reader

Simple Hacker News reader with per-domain categorization and story hiding, stored in `localStorage`.

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

`assets/js/index.js` (and everything it imports) is bundled by Vite into a single
content-hashed file in `assets/dist/`, referenced by `templates/index.html` via a manifest
(`assets/dist/.vite/manifest.json`) that the Go server reads at startup. This replaced a
no-bundler setup after we found some browsers (notably one user's Chrome/iOS combo) would keep
serving stale cached copies of the individually-imported JS modules even with `?v=` cache-busting
query params and `Cache-Control: no-cache` headers — a content-hashed bundle filename sidesteps
the problem entirely since the URL itself changes when the code changes.

**After editing anything in `assets/js/`, run `npm run build`** to regenerate the bundle, then
reload the browser. The server falls back to serving `assets/js/index.js` directly (unbundled) if
no manifest is found, so `go test`/first checkouts don't break — but that fallback path is not
what's used in production.

`assets/dist/` (including the manifest) is gitignored, not committed — it's built on the
production VPS as part of deploy (Node 22 is installed there via NodeSource for this). See the
`deploying-to-prod` skill.

`assets/css/` has no bundler and is served as-is with a `?v=` cache-busting query param.

Jest tests: `npm test` (jsdom environment, ES modules via Babel). Tests live in `tests/`, prefer exercising real component wiring (real custom elements, real `categoryStore`/`hiddenStore` backed by jsdom `localStorage`) over mocking internals — only `fetch` should be mocked.

## Deploying

Use the `deploying-to-prod` skill to deploy to the production VPS (hn.caleb.software).
