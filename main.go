package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"golang.org/x/net/html"
)

type EntryInfo struct {
	Name   string             `json:"name"`
	Points map[string]float64 `json:"points"`
}

func main() {
	updateScores()
}

func getPage(link string) *html.Node {
	res, err := http.Get(link)

	if err != nil {
		log.Fatal(err)
	}

	defer res.Body.Close()

	doc, err := html.Parse(res.Body)
	if err != nil {
		log.Fatal(err)
	}

	return doc
}

func readEntryScores(file string) []EntryInfo {
	dat, err := os.ReadFile(file)
	if len(dat) == 0 {
		fmt.Println("Empty File!")
		return []EntryInfo{}
	}

	if err != nil {
		log.Fatal(err)
	}

	var entryScores []EntryInfo
	err = json.Unmarshal(dat, &entryScores)
	if err != nil {
		log.Fatal(err)
	}

	return entryScores
}

func writeEntryScores(file string, entryScores []EntryInfo) {

	res, err := json.MarshalIndent(entryScores, "", "  ")
	if err != nil {
		log.Fatal(err)
	}

	f, err := os.Create(file)
	defer f.Close()
	if err != nil {
		log.Fatal(err)
	}

	_, err = f.Write(res)
	if err != nil {
		log.Fatal(err)
	}

	f.Sync()
}

func updateScores() {

	entryScores := readEntryScores("data/scores.json")
	doc := getPage("https://myanimelist.net/topanime.php")
	entries := getEntries(doc)

	for _, entry := range entries {
		name, score := getNameFromEntry(entry), getScoreFromEntry(entry)

		entryAlreadyExists := false
		for i, entryScore := range entryScores {
			if entryScore.Name == name {
				entryScores[i].Points[time.Now().Format("2006-01-02")] = score
				entryAlreadyExists = true
			}
		}

		if !entryAlreadyExists {
			entryScores = append(entryScores, EntryInfo{
				Name:   name,
				Points: make(map[string]float64),
			})
		}
	}

	writeEntryScores("data/scores.json", entryScores)

}

func getNameFromEntry(entry *html.Node) string {
	nameAnchor, err := getHtmlNodes(entry, "class", "hoverinfo_trigger")
	if err != nil {
		log.Fatal(err)
	}
	return nameAnchor[0].FirstChild.Data
}

func getScoreFromEntry(entry *html.Node) float64 {
	scoreSpans, err := getHtmlNodes(entry, "class", "js-top-ranking-score-col di-ib al")
	if err != nil {
		log.Fatal(err)
	}

	score, err := strconv.ParseFloat(scoreSpans[0].LastChild.FirstChild.Data, 64)
	if err != nil {
		log.Fatal(err)
	}

	return score
}

func getEntries(doc *html.Node) []*html.Node {
	entries, err := getHtmlNodes(doc, "class", "ranking-list")
	if err != nil {
		log.Fatal(err)
	}
	return entries
}

func getHtmlNodes(content *html.Node, key string, val string) ([]*html.Node, error) {

	var nodes []*html.Node

	var processListing func(n *html.Node)
	processListing = func(n *html.Node) {
		for child := range n.ChildNodes() {
			for _, attribute := range child.Attr {
				if attribute.Key == key && attribute.Val == val {
					nodes = append(nodes, child)
				}
			}
			processListing(child)
		}
	}

	processListing(content)

	if len(nodes) == 0 {
		return nil, errors.New(fmt.Sprintf("Could not find element with key: %s, value: %s", key, val))
	}
	return nodes, nil
}
