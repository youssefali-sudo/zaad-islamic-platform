package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

type Health struct { Service string `json:"service"`; Status string `json:"status"`; Time string `json:"time"` }
func main() {
	port := os.Getenv("PORT"); if port == "" { port = "8081" }
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(Health{Service:"zaad-gateway", Status:"ok", Time:time.Now().UTC().Format(time.RFC3339)})
	})
	log.Printf("Zaad gateway listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
