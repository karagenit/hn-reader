# hn-reader
Simple Hacker News Reader With Categories

TODO
- Cleanup frontend
- Allow undo of hiding a story
- Handle multiple tabs open at once and categorizing posts (currently will overwrite other tabs changes)
- aggregate stats (opt-in) for other users to create primary categorization list for new users
- LLM categorization based on existing training data

## How to run

Run app with `go run .`

How to run in production mode? Need ENV VAR and run in background..

```
/usr/local/go/bin/go run . >>log.txt 2>&1 &
disown
```
