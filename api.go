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
	"fmt"
	"sync"
	"errors"
)

type story struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Domain   string `json:"domain"`
	Link     string `json:"link"`
	Comments string `json:"comments"`
	Descendants int `json:"descendants"`
	Score    int    `json:"score"`
}

var ids []int

var stories []story

var last_update int64 // TODO need to be atomic?

var global_mutex sync.Mutex

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
	return last_update + (15 * 60) < time.Now().Unix()
}

// Wipe and set the `ids` global from the HN API
func updateTopStoryIds() {
	resp, err := http.Get("https://hacker-news.firebaseio.com/v0/topstories.json")
	if err != nil {
		return
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return
	}

	err = json.Unmarshal(body, &ids)
	if err != nil {
		return
	}
}

// Using the `ids` global, fetch each story and put it in the `stories` global (wipes existing stories)
func updateTopStoryDetails() {
	new_stories := make([]story, len(ids))
	for _, id := range ids {
		new_story, err := getStoryDetails(id)
		if err == nil {
			stories = append(stories, new_story)
		}
	}
	copy(new_stories, stories)
}

// Fetches a HN story by its ID from the API and returns a `story` struct
func getStoryDetails(id int) (story, error) {
	var result map[string]interface{}

	req_url := []string{"https://hacker-news.firebaseio.com/v0/item/", strconv.Itoa(id), ".json"}
  
	resp, err := http.Get(strings.Join(req_url, ""))
	if err != nil {
		return story{}, errors.New("Error during Get")
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return story{}, errors.New("Error during ReadAll")
	}

	err = json.Unmarshal(body, &result)
	if err != nil {
		return story{}, errors.New("Error during Unmarshal")
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

		hn_url := []string{"https://news.ycombinator.com/item?id=", strconv.Itoa(id)}

		return story{
			ID: id, Title: title, Domain: story_url.Hostname(), Link: link, Comments: strings.Join(hn_url, ""), Descendants: int(descendants), Score: int(score),
		}, nil
	} else {
		return story{}, errors.New("Error during Type Casting")
	}
}

func main() {
	go updateTopStories()
	router := gin.Default()
	router.StaticFile("/", "./index.html") // just .Static tries to wildcard the whole route...
	router.GET("/stories", getTopStories)
	router.Run("localhost:8080")
}