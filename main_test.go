package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strconv"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

// rawHNItem mirrors the fields of a HN API item response that getStoryDetails
// reads. Fixtures are built from these (via marshaling) so the JSON served to
// the code under test and the values asserted against never drift apart.
type rawHNItem struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	URL         string `json:"url"`
	Descendants int    `json:"descendants"`
	Score       int    `json:"score"`
}

// Real items captured from the HN API, used as fixtures so tests exercise the
// actual response shape rather than a guessed-at one.
var (
	item1 = rawHNItem{ID: 49261218, Title: "Woman Pulled over at Gunpoint Twice After Flock Camera Glitch", URL: "https://guessingheadlights.com/yall-failed-me-woman-pulled-over-at-gunpoint-twice-after-flock-camera-glitch/", Descendants: 135, Score: 178}
	item2 = rawHNItem{ID: 49257377, Title: "England set to be one of the first countries to eliminate hepatitis C", URL: "https://www.bbc.com/news/articles/c75gk620r22o", Descendants: 281, Score: 391}
)

// wantStory converts a rawHNItem into the story that getStoryDetails should
// produce for it.
func wantStory(item rawHNItem) story {
	domain, err := url.Parse(item.URL)
	if err != nil {
		panic(err)
	}
	return story{
		ID:          item.ID,
		Title:       item.Title,
		Domain:      domain.Hostname(),
		Link:        item.URL,
		Comments:    "https://news.ycombinator.com/item?id=" + strconv.Itoa(item.ID),
		Descendants: item.Descendants,
		Score:       item.Score,
	}
}

// fakeHNGetter serves the fixtures above based on the requested URL, and
// fails the test if it's called when the caller didn't expect a fetch.
type fakeHNGetter struct {
	t       *testing.T
	allowed bool
}

func (f *fakeHNGetter) Get(reqURL string) (*http.Response, error) {
	if !f.allowed {
		f.t.Fatalf("unexpected HN API call: %s", reqURL)
	}

	var body []byte
	var err error
	switch {
	case strings.Contains(reqURL, "topstories.json"):
		body, err = json.Marshal([]int{item1.ID, item2.ID})
	case strings.Contains(reqURL, fmt.Sprintf("item/%d.json", item1.ID)):
		body, err = json.Marshal(item1)
	case strings.Contains(reqURL, fmt.Sprintf("item/%d.json", item2.ID)):
		body, err = json.Marshal(item2)
	default:
		f.t.Fatalf("unexpected HN API url: %s", reqURL)
	}
	if err != nil {
		f.t.Fatalf("failed to marshal fixture: %v", err)
	}

	return &http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(bytes.NewReader(body)),
	}, nil
}

func newTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/stories", getTopStories)
	return router
}

func resetGlobals() {
	ids = nil
	stories = nil
	last_update = 0
}

func TestStories_LoadsCachedStories(t *testing.T) {
	resetGlobals()
	stories = []story{wantStory(item1)}
	last_update = 9999999999 // far in the future, so no reload is triggered

	hnClient = &fakeHNGetter{t: t, allowed: false}

	router := newTestRouter()
	req := httptest.NewRequest(http.MethodGet, "/stories", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var got []story
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if len(got) != 1 || got[0] != stories[0] {
		t.Fatalf("expected cached stories to be returned unchanged, got %+v", got)
	}
}

func TestStories_FetchesAndParsesStories(t *testing.T) {
	resetGlobals()
	hnClient = &fakeHNGetter{t: t, allowed: true}

	updateTopStories()

	router := newTestRouter()
	req := httptest.NewRequest(http.MethodGet, "/stories", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var got []story
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	want := []story{wantStory(item1), wantStory(item2)}

	if len(got) != len(want) {
		t.Fatalf("expected %d stories, got %d: %+v", len(want), len(got), got)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("story %d: got %+v, want %+v", i, got[i], want[i])
		}
	}
}
