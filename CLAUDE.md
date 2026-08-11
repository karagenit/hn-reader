# hn-reader

Simple Hacker News reader with per-domain categorization and story hiding, stored in `localStorage`.

## Structure

- `main.go`, `main_test.go` — Go backend. Fetches/serves HN story data, serves the templates and static assets.
- `templates/` — HTML templates (`index.html`, `settings.html`) rendered by the Go server.
- `assets/js/` — Frontend, plain ES modules (no bundler) registering native Custom Elements (`x-story`, `x-story-list`, `category-selector`, etc.). Loaded directly by the browser via `<script type="module">`.
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

## Frontend

No build step — `assets/js/*.js` are served as-is. Edit and reload the browser.

Jest tests: `npm test` (jsdom environment, ES modules via Babel). Tests live in `tests/`, prefer exercising real component wiring (real custom elements, real `categoryStore`/`hiddenStore` backed by jsdom `localStorage`) over mocking internals — only `fetch` should be mocked.

## Deploying

Use the `deploying-to-prod` skill to deploy to the production VPS (hn.caleb.software).
