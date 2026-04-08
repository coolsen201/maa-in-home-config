package health

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/coolsen201/maa-in-home-config/shared"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	start := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := shared.GetFirestoreClient(ctx)
	
	latency := time.Since(start).Milliseconds()

	if err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]any{
			"ok":      false,
			"db":      "unreachable",
			"error":   "Firestore connection failed: " + err.Error(),
			"latency": latency,
		})
		return
	}
	defer client.Close()

	// Simple query to verify authentication rather than just client creation
	_, err = client.Collection("kiosks").Limit(1).Documents(ctx).GetAll()
	latency = time.Since(start).Milliseconds()

	if err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]any{
			"ok":      false,
			"db":      "auth_failed",
			"error":   "Firestore query failed: " + err.Error(),
			"latency": latency,
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"ok":      true,
		"db":      "connected",
		"latency": latency,
	})
}
