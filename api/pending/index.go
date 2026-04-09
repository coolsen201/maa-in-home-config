package pending

import (
	"encoding/json"
	"net/http"

	"github.com/coolsen201/maa-in-home-config/shared"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	pending, err := shared.QueryPendingKiosks()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "Failed to read pending list: " + err.Error()})
		return
	}

	if pending == nil {
		pending = []shared.KioskRecord{}
	}
	json.NewEncoder(w).Encode(pending)
}
