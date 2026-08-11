package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"net/url"
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

func updateTopStories() {
	global_mutex.Lock() // TODO would be nice to just return here instead of blocking, so simultaneous user requests don't result in us hitting the API back to back. Could try to use onceFunc or something. Or just a second check to isReloadNeeded inside this function too, inside the mutex lock
	defer global_mutex.Unlock()
	fmt.Println(time.Now(), " Starting to update stories")
	last_update = time.Now().Unix()
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

	if title_ok && link_ok && desc_ok && score_ok {
		story_url, err := url.Parse(link)
		if err != nil {
			return story{}, errors.New("Error during Parse")
		}

		hn_url := "https://news.ycombinator.com/item?id=" + strconv.Itoa(id)

		return story{
			ID: id, Title: title, Domain: story_url.Hostname(), Link: link, Comments: hn_url, Descendants: int(descendants), Score: int(score),
		}, nil
	} else {
		return story{}, fmt.Errorf("type cast failed: title=%v link=%v descendants=%v score=%v", title_ok, link_ok, desc_ok, score_ok)
	}
}

func main() {
	go updateTopStories()
	router := gin.Default()

	// Load HTML templates
	router.LoadHTMLGlob("templates/*.html")

	// Serve static assets
	router.Static("/assets", "./assets")

	// Serve HTML with version for cache busting
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"Version": appVersion,
		})
	})

	router.StaticFile("/settings", "./templates/settings.html")

	router.GET("/stories", getTopStories)
	router.Run("localhost:8080")
}
