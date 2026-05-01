package update_kiosk

import (
	"encoding/json"
	"net/http"

	"github.com/coolsen201/maa-in-home-config/shared"
)

type UpdatePayload struct {
	UUID       string `json:"uuid"`
	HomeNumber string `json:"home_number,omitempty"`
	UserID     string `json:"user_id,omitempty"`
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

	var payload UpdatePayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}
	if payload.UUID == "" {
		http.Error(w, `{"error":"uuid is required"}`, http.StatusBadRequest)
		return
	}

	updates := make(map[string]string)
	if payload.HomeNumber != "" {
		updates["home_number"] = payload.HomeNumber
	}
	if payload.UserID != "" {
		updates["user_id"] = payload.UserID
	}

	if len(updates) == 0 {
		http.Error(w, `{"error":"nothing to update"}`, http.StatusBadRequest)
		return
	}

	err := shared.UpdateKioskFields(payload.UUID, updates)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to update kiosk: " + err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"uuid":    payload.UUID,
		"updates": updates,
	})
}
