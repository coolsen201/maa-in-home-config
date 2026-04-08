package register

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
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

func getRedisClient() (*redis.Client, error) {
	opt, err := redis.ParseURL(os.Getenv("KV_URL"))
	if err != nil {
		return nil, fmt.Errorf("invalid KV_URL: %w", err)
	}
	// Short timeouts to fail fast instead of hanging
	opt.DialTimeout = 8 * time.Second
	opt.ReadTimeout = 8 * time.Second
	opt.WriteTimeout = 8 * time.Second
	return redis.NewClient(opt), nil
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
	data, _ := json.Marshal(record)

	rdb, err := getRedisClient()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "Storage not configured: " + err.Error(),
		})
		return
	}
	defer rdb.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	key := fmt.Sprintf("kiosk:%s", req.UUID)
	if err := rdb.Set(ctx, key, data, 24*time.Hour).Err(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "Failed to store kiosk record: " + err.Error(),
		})
		return
	}

	if err := rdb.SAdd(ctx, "kiosks:pending", req.UUID).Err(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "Failed to add to pending queue: " + err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{"success": true, "uuid": req.UUID})
}
