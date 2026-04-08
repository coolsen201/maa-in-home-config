package pending

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type KioskRecord struct {
	UUID     string `json:"uuid"`
	PIN      string `json:"pin"`
	Status   string `json:"status"`
	LastSeen string `json:"lastSeen"`
}

func getRedisClient() (*redis.Client, error) {
	opt, err := redis.ParseURL(os.Getenv("KV_URL"))
	if err != nil {
		return nil, err
	}
	opt.DialTimeout = 8 * time.Second
	opt.ReadTimeout = 8 * time.Second
	opt.WriteTimeout = 8 * time.Second
	return redis.NewClient(opt), nil
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	rdb, err := getRedisClient()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "Storage not configured: " + err.Error()})
		return
	}
	defer rdb.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pendingUUIDs, err := rdb.SMembers(ctx, "kiosks:pending").Result()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "Failed to read pending list: " + err.Error()})
		return
	}

	if len(pendingUUIDs) == 0 {
		json.NewEncoder(w).Encode([]KioskRecord{})
		return
	}

	var pending []KioskRecord
	for _, uid := range pendingUUIDs {
		key := fmt.Sprintf("kiosk:%s", uid)
		val, err := rdb.Get(ctx, key).Result()
		if err != nil {
			// Record expired, clean up from the set
			rdb.SRem(ctx, "kiosks:pending", uid)
			continue
		}
		var record KioskRecord
		if err := json.Unmarshal([]byte(val), &record); err == nil {
			pending = append(pending, record)
		}
	}

	if pending == nil {
		pending = []KioskRecord{}
	}
	json.NewEncoder(w).Encode(pending)
}
