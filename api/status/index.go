package status

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/redis/go-redis/v9"
)

type KioskRecord struct {
	UUID      string `json:"uuid"`
	PIN       string `json:"pin"`
	Status    string `json:"status"`
	SecureKey string `json:"secure_key,omitempty"`
	LastSeen  string `json:"lastSeen"`
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

	opt, err := redis.ParseURL(os.Getenv("KV_URL"))
	if err != nil {
		http.Error(w, `{"error":"Redis connection failed"}`, http.StatusInternalServerError)
		return
	}
	rdb := redis.NewClient(opt)
	defer rdb.Close()
	ctx := context.Background()

	key := fmt.Sprintf("kiosk:%s", kioskUUID)
	val, err := rdb.Get(ctx, key).Result()
	if err != nil {
		json.NewEncoder(w).Encode(map[string]any{"status": "not_found"})
		return
	}

	var record KioskRecord
	json.Unmarshal([]byte(val), &record)

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
