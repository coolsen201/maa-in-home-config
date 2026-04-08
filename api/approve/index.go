package approve

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/coolsen201/maa-in-home-config/shared"
	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type ApprovePayload struct {
	UUID string `json:"uuid"`
	PIN  string `json:"pin"`
}

type KioskRecord struct {
	UUID      string `json:"uuid" firestore:"uuid"`
	PIN       string `json:"pin" firestore:"pin"`
	Status    string `json:"status" firestore:"status"`
	SecureKey string `json:"secure_key,omitempty" firestore:"secure_key,omitempty"`
	LastSeen  string `json:"lastSeen" firestore:"lastSeen"`
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

	var payload ApprovePayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}
	if payload.UUID == "" || payload.PIN == "" {
		http.Error(w, `{"error":"uuid and pin are required"}`, http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := shared.GetFirestoreClient(ctx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Storage not configured"})
		return
	}
	defer client.Close()

	docRef := client.Collection("kiosks").Doc(payload.UUID)
	docSnap, err := docRef.Get(ctx)
	
	if status.Code(err) == codes.NotFound {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Kiosk not found or expired"})
		return
	}
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to read kiosk record"})
		return
	}

	var record KioskRecord
	if err := docSnap.DataTo(&record); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to parse kiosk record"})
		return
	}

	if record.PIN != payload.PIN {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "PIN mismatch"})
		return
	}

	secureKey := uuid.New().String()

	_, err = docRef.Update(ctx, []firestore.Update{
		{Path: "status", Value: "approved"},
		{Path: "secure_key", Value: secureKey},
	})
	
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to update status"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"success":    true,
		"secure_key": secureKey,
	})
}
