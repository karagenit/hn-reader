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

var ids []int

func getTopStories(c *gin.Context) {
	// if isStoryReloadNeeded
	// do requests, update array
	getTopStoryIds()

	// return array
	c.IndentedJSON(http.StatusOK, ids)
}

// TODO should be every 5 mins
// func isStoryReloadNeeded() {
// 	true
// }

func getTopStoryIds() {
	resp, _ := http.Get("https://hacker-news.firebaseio.com/v0/topstories.json")
	// TODO handle error

	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	// TODO handle error
	
	//fmt.Println(string(body))
	// TODO parse this string as JSON and into a go array
	_ = json.Unmarshal(body, &ids)
	// TODO handle error
}

// title, domain, comment_link
func getStoryDetails(id int) {

}

func main() {
	router := gin.Default()
	router.GET("/", getTopStories)
	router.Run("localhost:8080")
}