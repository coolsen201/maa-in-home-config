package approved

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

	approved, err := shared.QueryKiosksByStatus("approved")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "Failed to read approved list: " + err.Error()})
		return
	}

	activeApproved := make([]shared.KioskRecord, 0, len(approved))
	for _, record := range approved {
		item := record
		if err := shared.EnsureRecordNotExpired(&item); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{"error": "Failed to validate approved list: " + err.Error()})
			return
		}
		if item.Status == "approved" {
			activeApproved = append(activeApproved, item)
		}
	}

	if activeApproved == nil {
		activeApproved = []shared.KioskRecord{}
	}
	json.NewEncoder(w).Encode(activeApproved)
}