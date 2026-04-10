package health

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/coolsen201/maa-in-home-config/shared"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	start := time.Now()
	err := shared.HealthCheck()
	latency := time.Since(start).Milliseconds()

	if err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]any{
			"ok":      false,
			"db":      "unreachable",
			"error":   err.Error(),
			"latency": latency,
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"ok":            true,
		"db":            "connected",
		"latency":       latency,
		"approval_mode": shared.GetApprovalMode(),
	})
}
