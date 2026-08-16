package main

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"time"
)

type story struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Domain      string `json:"domain"`
	Link        string `json:"link"`
	Comments    string `json:"comments"`
	Descendants int    `json:"descendants"`
	Score       int    `json:"score"`
}

var ids []int

var stories []story

var last_update int64 // TODO need to be atomic?

var global_mutex sync.Mutex

var appVersion string

// (e.g. /assets/dist/assets/index-NlHrQspP.js), read from the Vite manifest
var jsBundlePath string

// Same, for the settings page's own entry point.
var settingsJsBundlePath string

type viteManifestEntry struct {
	File string `json:"file"`
}

// loadJsBundlePaths resolves the hashed output file for each Vite entry point,
// keyed in the manifest by its source path.
func loadJsBundlePaths() (index string, settings string, err error) {
	data, err := os.ReadFile("assets/dist/.vite/manifest.json")
	if err != nil {
		return "", "", err
	}
	var manifest map[string]viteManifestEntry
	if err := json.Unmarshal(data, &manifest); err != nil {
		return "", "", err
	}
	lookup := func(src string) (string, error) {
		entry, ok := manifest[src]
		if !ok {
			return "", fmt.Errorf("%s not found in vite manifest", src)
		}
		return "/assets/dist/" + entry.File, nil
	}
	if index, err = lookup("assets/js/index.js"); err != nil {
		return "", "", err
	}
	if settings, err = lookup("assets/js/settings.js"); err != nil {
		return "", "", err
	}
	return index, settings, nil
}

// httpGetter lets tests substitute a fake HN API without touching the network.
type httpGetter interface {
	Get(url string) (*http.Response, error)
}

var hnClient httpGetter = http.DefaultClient

func init() {
	// Try to get git commit hash for cache busting
	cmd := exec.Command("git", "rev-parse", "--short", "HEAD")
	output, err := cmd.Output()
	if err == nil {
		appVersion = strings.TrimSpace(string(output))
	} else {
		// Fallback to timestamp if git not available
		appVersion = fmt.Sprintf("%d", time.Now().Unix())
	}
	fmt.Println("App version:", appVersion)
}

// Get an array of the top 500 stories as JSON, cached for performance
func getTopStories(c *gin.Context) {
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.IndentedJSON(http.StatusOK, stories)

	reload := isStoryReloadNeeded()
	if reload {
		go updateTopStories()
	}
}

// devDataFile is the cached story dump used in dev mode instead of hitting the HN API.
const devDataFile = "data/dev-stories.json"

// devModeEnabled reports whether DEV_MODE is set, requesting cached stories instead of live API calls.
func devModeEnabled() bool {
	return os.Getenv("DEV_MODE") != ""
}

// loadDevStories populates the `stories` global from devDataFile.
func loadDevStories() error {
	data, err := os.ReadFile(devDataFile)
	if err != nil {
		return err
	}
	var loaded []story
	if err := json.Unmarshal(data, &loaded); err != nil {
		return err
	}
	stories = loaded
	return nil
}

func updateTopStories() {
	global_mutex.Lock() // TODO would be nice to just return here instead of blocking, so simultaneous user requests don't result in us hitting the API back to back. Could try to use onceFunc or something. Or just a second check to isReloadNeeded inside this function too, inside the mutex lock
	defer global_mutex.Unlock()
	fmt.Println(time.Now(), " Starting to update stories")
	last_update = time.Now().Unix()

	if devModeEnabled() {
		if err := loadDevStories(); err == nil {
			fmt.Println(time.Now(), " Loaded stories from dev cache:", devDataFile)
			return
		}
		fmt.Println(time.Now(), " DEV_MODE set but failed to load cache, falling back to live API")
	}

	updateTopStoryIds()
	updateTopStoryDetails()
	fmt.Println(time.Now(), " Finished updating stories")
}

// Whether or not we should update the stories - runs every 15 mins
func isStoryReloadNeeded() bool {
	return last_update+(15*60) < time.Now().Unix()
}

// fetchJSON GETs url and unmarshals the response body into target.
func fetchJSON(url string, target interface{}) error {
	resp, err := hnClient.Get(url)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	return json.Unmarshal(body, target)
}

// Wipe and set the `ids` global from the HN API
func updateTopStoryIds() {
	if err := fetchJSON("https://hacker-news.firebaseio.com/v0/topstories.json", &ids); err != nil {
		fmt.Println(err)
	}
}

// Using the `ids` global, fetch each story and put it in the `stories` global (wipes existing stories)
func updateTopStoryDetails() {
	new_stories := make([]story, len(ids))
	for i, id := range ids {
		if new_story, err := getStoryDetails(id); err == nil {
			new_stories[i] = new_story
		}
	}
	stories = new_stories
}

// Fetches a HN story by its ID from the API and returns a `story` struct
func getStoryDetails(id int) (story, error) {
	var result map[string]interface{}

	req_url := "https://hacker-news.firebaseio.com/v0/item/" + strconv.Itoa(id) + ".json"

	if err := fetchJSON(req_url, &result); err != nil {
		return story{}, err
	}

	title, title_ok := result["title"].(string)
	link, link_ok := result["url"].(string)
	descendants, desc_ok := result["descendants"].(float64)
	// figured out these were floats via:
	// switch v := result["score"].(type) {
	// default:
	//     fmt.Printf("unexpected type %T", v)
	// }
	score, score_ok := result["score"].(float64)

	if !(title_ok && link_ok && desc_ok && score_ok) {
		return story{}, fmt.Errorf("type cast failed: title=%v link=%v descendants=%v score=%v", title_ok, link_ok, desc_ok, score_ok)
	}

	story_url, err := url.Parse(link)
	if err != nil {
		return story{}, fmt.Errorf("parse url: %w", err)
	}

	hn_url := "https://news.ycombinator.com/item?id=" + strconv.Itoa(id)

	return story{
		ID: id, Title: title, Domain: story_url.Hostname(), Link: link, Comments: hn_url, Descendants: int(descendants), Score: int(score),
	}, nil
}

func main() {
	indexPath, settingsPath, err := loadJsBundlePaths()
	if err != nil {
		log.Fatalf("failed to load JS bundle paths from vite manifest (run `npm run build`): %v", err)
	}
	jsBundlePath = indexPath
	settingsJsBundlePath = settingsPath

	go updateTopStories()
	router := gin.Default()

	// Load HTML templates
	router.LoadHTMLGlob("templates/*.html")

	// Serve static assets. Cache-Control: no-cache forces revalidation on every
	// load instead of reusing a stale cached copy (observed on iOS Safari/Chrome,
	// which can cache assets aggressively even with a version query string).
	assets := router.Group("/assets")
	assets.Use(func(c *gin.Context) {
		c.Header("Cache-Control", "no-cache")
		c.Next()
	})
	assets.StaticFS("/", http.Dir("./assets"))

	// Serve HTML with version for cache busting. ETag is the app version, so
	// clients revalidate on every load instead of reusing a stale cached copy
	// (observed on iOS Safari/Chrome, which cache HTML aggressively otherwise).
	router.GET("/", func(c *gin.Context) {
		c.Header("Cache-Control", "no-cache")
		c.Header("ETag", appVersion)
		if c.GetHeader("If-None-Match") == appVersion {
			c.Status(http.StatusNotModified)
			return
		}
		c.HTML(http.StatusOK, "index.html", gin.H{
			"Version":  appVersion,
			"JsBundle": jsBundlePath,
		})
	})

	// Rendered (not served statically) so it can reference the hashed settings
	// bundle and the CSS cache-busting version.
	router.GET("/settings", func(c *gin.Context) {
		c.Header("Cache-Control", "no-cache")
		c.Header("ETag", appVersion)
		if c.GetHeader("If-None-Match") == appVersion {
			c.Status(http.StatusNotModified)
			return
		}
		c.HTML(http.StatusOK, "settings.html", gin.H{
			"Version":          appVersion,
			"SettingsJsBundle": settingsJsBundlePath,
		})
	})

	router.GET("/stories", getTopStories)
	router.Run("localhost:8080")
}
