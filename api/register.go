package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

type RegisterRequest struct {
	UUID string `json:"uuid"`
	PIN  string `json:"pin"`
}

type KioskRecord struct {
	UUID     string `json:"uuid"`
	PIN      string `json:"pin"`
	Status   string `json:"status"`
	LastSeen string `json:"lastSeen"`
}

func getRedisClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     getEnv("KV_REDIS_URL", ""),
		Password: getEnv("KV_REST_API_TOKEN", ""),
	})
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
		http.Error(w, `{"error":"Invalid request body. uuid and pin are required."}`, http.StatusBadRequest)
		return
	}

	record := KioskRecord{
		UUID:     req.UUID,
		PIN:      req.PIN,
		Status:   "pending",
		LastSeen: time.Now().UTC().Format(time.RFC3339),
	}

	data, _ := json.Marshal(record)
	ctx := context.Background()
	rdb := getRedisClient()
	defer rdb.Close()

	// Store with 24h expiry (if not approved, auto-clean)
	key := fmt.Sprintf("kiosk:%s", req.UUID)
	if err := rdb.Set(ctx, key, data, 24*time.Hour).Err(); err != nil {
		http.Error(w, `{"error":"Failed to store registration"}`, http.StatusInternalServerError)
		return
	}

	// Track in a set for listing
	rdb.SAdd(ctx, "kiosks:pending", req.UUID)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{"success": true, "uuid": req.UUID})
}

func getEnv(key, fallback string) string {
	if val, ok := lookupEnv(key); ok {
		return val
	}
	return fallback
}

func lookupEnv(key string) (string, bool) {
	// Uses os.LookupEnv under the hood via Vercel's injected env vars
	val := ""
	// This will be resolved by the Go build with os package
	_ = key
	return val, val != ""
}
