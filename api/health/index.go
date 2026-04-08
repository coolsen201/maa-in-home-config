package health

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	kvURL := os.Getenv("KV_URL")
	if kvURL == "" {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"ok":    false,
			"error": "KV_URL environment variable is not set",
			"redis": "not_configured",
		})
		return
	}

	opt, err := redis.ParseURL(kvURL)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"ok":    false,
			"error": "KV_URL is invalid: " + err.Error(),
			"redis": "invalid_url",
		})
		return
	}

	// Short timeout so health check doesn't hang
	opt.DialTimeout = 5 * time.Second
	opt.ReadTimeout = 5 * time.Second
	opt.WriteTimeout = 5 * time.Second

	rdb := redis.NewClient(opt)
	defer rdb.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 6*time.Second)
	defer cancel()

	start := time.Now()
	_, pingErr := rdb.Ping(ctx).Result()
	latency := time.Since(start).Milliseconds()

	if pingErr != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]any{
			"ok":      false,
			"error":   "Redis PING failed: " + pingErr.Error(),
			"redis":   "unreachable",
			"latency": latency,
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{
		"ok":      true,
		"redis":   "connected",
		"latency": latency,
		"time":    time.Now().UTC().Format(time.RFC3339),
	})
}
