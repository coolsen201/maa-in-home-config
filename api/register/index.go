package register

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/coolsen201/maa-in-home-config/shared"
)

type RegisterRequest struct {
	UUID string `json:"uuid"`
	PIN  string `json:"pin"`
}

type KioskRecord struct {
	UUID     string `json:"uuid" firestore:"uuid"`
	PIN      string `json:"pin" firestore:"pin"`
	Status   string `json:"status" firestore:"status"`
	LastSeen string `json:"lastSeen" firestore:"lastSeen"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.UUID == "" || req.PIN == "" {
		http.Error(w, `{"error":"uuid and pin are required"}`, http.StatusBadRequest)
		return
	}

	record := KioskRecord{
		UUID:     req.UUID,
		PIN:      req.PIN,
		Status:   "pending",
		LastSeen: time.Now().UTC().Format(time.RFC3339),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := shared.GetFirestoreClient(ctx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "Storage not configured: " + err.Error(),
		})
		return
	}
	defer client.Close()

	if _, err := client.Collection("kiosks").Doc(req.UUID).Set(ctx, record); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "Failed to store kiosk record: " + err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{"success": true, "uuid": req.UUID})
}
