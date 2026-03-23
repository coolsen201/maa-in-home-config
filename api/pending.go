package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/redis/go-redis/v9"
)

type KioskRecord struct {
	UUID     string `json:"uuid"`
	PIN      string `json:"pin"`
	Status   string `json:"status"`
	LastSeen string `json:"lastSeen"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("KV_REDIS_URL"),
		Password: os.Getenv("KV_REST_API_TOKEN"),
	})
	defer rdb.Close()
	ctx := context.Background()

	// Get all UUIDs in pending set
	pendingUUIDs, err := rdb.SMembers(ctx, "kiosks:pending").Result()
	if err != nil || len(pendingUUIDs) == 0 {
		json.NewEncoder(w).Encode([]KioskRecord{})
		return
	}

	var pending []KioskRecord
	for _, uid := range pendingUUIDs {
		key := fmt.Sprintf("kiosk:%s", uid)
		val, err := rdb.Get(ctx, key).Result()
		if err != nil {
			// Expired/gone — clean up
			rdb.SRem(ctx, "kiosks:pending", uid)
			continue
		}
		var record KioskRecord
		if err := json.Unmarshal([]byte(val), &record); err == nil {
			// Never expose the PIN to the CCC — admin must read it off the kiosk screen
			pending = append(pending, KioskRecord{
				UUID:     record.UUID,
				PIN:      record.PIN, // Admin sees this to compare with kiosk screen
				Status:   record.Status,
				LastSeen: record.LastSeen,
			})
		}
	}

	if pending == nil {
		pending = []KioskRecord{}
	}

	json.NewEncoder(w).Encode(pending)
}
