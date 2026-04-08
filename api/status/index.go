package status

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/coolsen201/maa-in-home-config/shared"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type KioskRecord struct {
	UUID      string `json:"uuid" firestore:"uuid"`
	PIN       string `json:"pin" firestore:"pin"`
	Status    string `json:"status" firestore:"status"`
	SecureKey string `json:"secure_key,omitempty" firestore:"secure_key,omitempty"`
	LastSeen  string `json:"lastSeen" firestore:"lastSeen"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	kioskUUID := r.URL.Query().Get("uuid")
	if kioskUUID == "" {
		http.Error(w, `{"error":"uuid query param is required"}`, http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := shared.GetFirestoreClient(ctx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "Storage not configured"})
		return
	}
	defer client.Close()

	docSnap, err := client.Collection("kiosks").Doc(kioskUUID).Get(ctx)
	if status.Code(err) == codes.NotFound {
		json.NewEncoder(w).Encode(map[string]any{"status": "not_found"})
		return
	}
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "Failed to check status"})
		return
	}

	var record KioskRecord
	if err := docSnap.DataTo(&record); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "Failed to parse record"})
		return
	}

	resp := map[string]any{
		"status":   record.Status,
		"uuid":     record.UUID,
		"lastSeen": record.LastSeen,
	}
	if record.Status == "approved" {
		resp["secure_key"] = record.SecureKey
	}
	json.NewEncoder(w).Encode(resp)
}
