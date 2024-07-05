package main

import (
    "net/http"
//	"fmt"
	"io"
    "github.com/gin-gonic/gin"
	"encoding/json"
)

// album represents data about a record album.
type album struct {
    ID     string  `json:"id"`
    Title  string  `json:"title"`
    Artist string  `json:"artist"`
    Price  float64 `json:"price"`
}

// albums slice to seed record album data.
var albums = []album{
    {ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
    {ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
    {ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}

// getAlbums responds with the list of all albums as JSON.
func getAlbums(c *gin.Context) {
    c.IndentedJSON(http.StatusOK, albums)
}

// ------------------

type story struct {
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Domain string `json:"domain"`
	Link   string `json:"link"`
}

var ids []int

var stories []story

func getTopStories(c *gin.Context) {
	reload := isStoryReloadNeeded()
	if reload {
		updateTopStoryIds()
		updateTopStoryDetails()
	}

	c.IndentedJSON(http.StatusOK, stories)
}

// TODO should be every 5 mins
func isStoryReloadNeeded() bool {
	return true
}

func updateTopStoryIds() {
	resp, _ := http.Get("https://hacker-news.firebaseio.com/v0/topstories.json")
	// TODO handle error
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	// TODO handle error
	_ = json.Unmarshal(body, &ids)
	// TODO handle error
}

func updateTopStoryDetails() {
	stories = []story{}
	stories = append(stories, getStoryDetails(40884878))
	stories = append(stories, getStoryDetails(40884878))
}

// title, domain, comment_link
func getStoryDetails(id int) story {
	return story{
		ID: id, Title: "test", Domain: "test", Link: "test",
	}
}

func main() {
	router := gin.Default()
	router.GET("/", getTopStories)
	router.Run("localhost:8080")
}