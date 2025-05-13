# hn-reader
Simple Hacker News Reader With Categories

TODO
- top of settings should explain what's going on and how to use. also update blog post with more instructions.
  - sort domains into categories
  - top drop down changes what category you're viewing
  - each story's dropdown categorizes it
  - can hide stories too
- Cleanup frontend
- Allow undo of hiding a story
- Handle multiple tabs open at once and categorizing posts (currently will overwrite other tabs changes)
- aggregate stats (opt-in) for other users to create primary categorization list for new users
- LLM categorization based on existing training data
- when adding the last-clicked story to the top of the page, remove it from the regular list so it doesn't appear twice
- Only allow categorizing a story after reading it (60 seconds after clicking link or something) - less addictive mode
- Closed [X] list: instead of clearing entry after 7 days, just clear it when it's no longer in our result data set (ie it's now irrelevant)
- Lag - maybe render the entire list in Go as plain HTML, then set display: none on some divs in JS. Maybe favicon fixed this? Problem sometiems is reproducible by doing clear cache and hard reload...
- fefactor js into modules, cleanup functions etc.
- script for running & killing app
- always hide null id stories

## How to run

Run app with `go run .`

How to run in production mode? Need ENV VAR and run in background..

```
/usr/local/go/bin/go run . >>log.txt 2>&1 &
disown
```

To kill

lsof -i :8080 then kill the 'api' pid listed

## Web Components Redesign

- categorySelector
  - static block to load category list from localStorage
    - default values fallback
  - onchange fires event up to parent
- storyList
  - constructor loads hidden stories from storage
    - calls purge
    - default values fallback
  - constructor loads story categorizations from storage
    - validate, what if some are invalid categories?
    - default values fallback
  - connected callback fires async fetch of data
    - when done, render list to doc fragemnt then append
    - add listeners for hide and recategorize on each story
  - connected callback attached listener to document category change
- story