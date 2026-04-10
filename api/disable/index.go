package disable

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/coolsen201/maa-in-home-config/shared"
)

type DisablePayload struct {
	UUID string `json:"uuid"`
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

	var payload DisablePayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.UUID == "" {
		http.Error(w, `{"error":"uuid is required"}`, http.StatusBadRequest)
		return
	}

	record, found, err := shared.GetKiosk(payload.UUID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to read kiosk record: " + err.Error()})
		return
	}
	if !found {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Kiosk not found"})
		return
	}

	if err := shared.UpdateKioskFields(payload.UUID, map[string]string{
		"status":       "disabled",
		"approvalMode": record.ApprovalMode,
		"approvedVia":  "ccc-panel-disabled",
		"lastSeen":     time.Now().UTC().Format(time.RFC3339),
	}); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to disable kiosk: " + err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"success": true, "uuid": payload.UUID, "status": "disabled"})
}