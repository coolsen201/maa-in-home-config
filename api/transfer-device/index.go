package transfer_device

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/coolsen201/maa-in-home-config/shared"
)

type TransferPayload struct {
	UUID      string `json:"uuid"`
	NewUserID string `json:"new_user_id"`
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

	var payload TransferPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.UUID == "" {
		http.Error(w, `{"error":"uuid is required"}`, http.StatusBadRequest)
		return
	}
	if payload.NewUserID == "" {
		http.Error(w, `{"error":"new_user_id is required"}`, http.StatusBadRequest)
		return
	}

	record, found, err := shared.GetKiosk(payload.UUID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to read kiosk: " + err.Error()})
		return
	}
	if !found {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Kiosk not found"})
		return
	}

	oldUserID := record.UserID
	now := time.Now().UTC().Format(time.RFC3339)

	if err := shared.UpdateKioskFields(payload.UUID, map[string]string{
		"user_id":  payload.NewUserID,
		"lastSeen": now,
	}); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to transfer device: " + err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{
		"success":      true,
		"uuid":         payload.UUID,
		"old_user_id":  oldUserID,
		"new_user_id":  payload.NewUserID,
		"transferred_at": now,
	})
}
