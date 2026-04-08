package pending

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"google.golang.org/api/iterator"

	"github.com/coolsen201/maa-in-home-config/shared"
)

type KioskRecord struct {
	UUID     string `json:"uuid" firestore:"uuid"`
	PIN      string `json:"pin" firestore:"pin"`
	Status   string `json:"status" firestore:"status"`
	LastSeen string `json:"lastSeen" firestore:"lastSeen"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := shared.GetFirestoreClient(ctx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "Storage not configured: " + err.Error()})
		return
	}
	defer client.Close()

	// Query for all kiosks with status "pending"
	iter := client.Collection("kiosks").Where("status", "==", "pending").Documents(ctx)
	
	var pending []KioskRecord
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{"error": "Failed to read pending list: " + err.Error()})
			return
		}
		
		var record KioskRecord
		if err := doc.DataTo(&record); err == nil {
			pending = append(pending, record)
		}
	}

	if pending == nil {
		pending = []KioskRecord{}
	}
	json.NewEncoder(w).Encode(pending)
}
