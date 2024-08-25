# hn-reader
Simple Hacker News Reader With Categories

TODO
- Cleanup frontend
- Allow undo of hiding a story
- After clicking a story and going back to this site, last clicked should be pinned to the top
- Handle multiple tabs open at once and categorizing posts (currently will overwrite other tabs changes)
- night mode


Run app with `go run .`

How to run in production mode? Need ENV VAR and run in background..

```
/usr/local/go/bin/go run . >>log.txt 2>&1 &
disown
```
