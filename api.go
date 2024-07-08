package main

import (
    "net/http"
	"io"
    "github.com/gin-gonic/gin"
	"encoding/json"
	"strings"
	"strconv"
	"time"
	"net/url"
)

type story struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Domain   string `json:"domain"`
	Link     string `json:"link"`
	Comments string `json:"comments"`
}

var ids []int

var stories []story

var last_update int64

// Get an array of the top 500 stories as JSON, cached for performance
func getTopStories(c *gin.Context) {
	reload := isStoryReloadNeeded()
	if reload { // TODO can we do this async?
		updateTopStoryIds()
		updateTopStoryDetails()
		last_update = time.Now().Unix()
	}

	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.IndentedJSON(http.StatusOK, stories)
}

// Whether or not we should update the stories - runs every 15 mins
func isStoryReloadNeeded() bool {
	return last_update + (15 * 60) < time.Now().Unix()
}

// Wipe and set the `ids` global from the HN API
func updateTopStoryIds() {
	resp, _ := http.Get("https://hacker-news.firebaseio.com/v0/topstories.json")
	// TODO handle error
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	// TODO handle error
	_ = json.Unmarshal(body, &ids)
	// TODO handle error
}

// Using the `ids` global, fetch each story and put it in the `stories` global (wipes existing stories)
func updateTopStoryDetails() {
	stories = []story{}
	for _, id := range ids {
		stories = append(stories, getStoryDetails(id))
	}
}

// Fetches a HN story by its ID from the API and returns a `story` struct
func getStoryDetails(id int) story {
	var result map[string]interface{}

	req_url := []string{"https://hacker-news.firebaseio.com/v0/item/", strconv.Itoa(id), ".json"}
  
	resp, _ := http.Get(strings.Join(req_url, ""))
	// TODO handle error
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	// TODO handle error
	_ = json.Unmarshal(body, &result)
	// TODO handle error

	title, title_ok := result["title"].(string)
	link, link_ok := result["url"].(string)

	if title_ok && link_ok {
		story_url, _ := url.Parse(link)
		hn_url := []string{"https://news.ycombinator.com/item?id=", strconv.Itoa(id)}

		return story{
			ID: id, Title: title, Domain: story_url.Hostname(), Link: link, Comments: strings.Join(hn_url, ""),
		}
	} else {
		return story{}
	}
}

func main() {
	last_update = 0
	router := gin.Default()
	router.StaticFile("/", "./index.html") // just .Static tries to wildcard the whole route...
	router.GET("/stories", getTopStories)
	router.Run("localhost:8080")
}