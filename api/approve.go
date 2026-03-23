package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type ApproveRequest struct {
	UUID string `json:"uuid"`
	PIN  string `json:"pin"`
}

type KioskRecord struct {
	UUID      string `json:"uuid"`
	PIN       string `json:"pin"`
	Status    string `json:"status"`
	SecureKey string `json:"secure_key,omitempty"`
	LastSeen  string `json:"lastSeen"`
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

	var req ApproveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.UUID == "" || req.PIN == "" {
		http.Error(w, `{"error":"uuid and pin are required"}`, http.StatusBadRequest)
		return
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("KV_REDIS_URL"),
		Password: os.Getenv("KV_REST_API_TOKEN"),
	})
	defer rdb.Close()
	ctx := context.Background()

	// Fetch existing record
	key := fmt.Sprintf("kiosk:%s", req.UUID)
	val, err := rdb.Get(ctx, key).Result()
	if err != nil {
		http.Error(w, `{"error":"Kiosk not found or expired"}`, http.StatusNotFound)
		return
	}

	var record KioskRecord
	if err := json.Unmarshal([]byte(val), &record); err != nil {
		http.Error(w, `{"error":"Corrupted record"}`, http.StatusInternalServerError)
		return
	}

	// Verify PIN
	if record.PIN != req.PIN {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{
			"approved": false,
			"error":    "PIN does not match. Please check the code on the kiosk screen.",
		})
		return
	}

	// Generate secure key
	secureKey := uuid.New().String()
	record.Status = "approved"
	record.SecureKey = secureKey
	record.LastSeen = time.Now().UTC().Format(time.RFC3339)

	data, _ := json.Marshal(record)
	// Keep approved record for 7 days
	rdb.Set(ctx, key, data, 7*24*time.Hour)
	// Remove from pending set
	rdb.SRem(ctx, "kiosks:pending", req.UUID)

	json.NewEncoder(w).Encode(map[string]any{
		"approved":   true,
		"uuid":       req.UUID,
		"secure_key": secureKey,
	})
}
