package reprovision

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/coolsen201/maa-in-home-config/shared"
)

type ReprovisionPayload struct {
	UUID string `json:"uuid"`
}

// Handler sets a kiosk back to "pending" status so it re-enters the registration flow
// on next boot (used when the WiFi network changes and the kiosk needs re-provisioning)
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

	var payload ReprovisionPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.UUID == "" {
		http.Error(w, `{"error":"uuid is required"}`, http.StatusBadRequest)
		return
	}

	_, found, err := shared.GetKiosk(payload.UUID)
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

	now := time.Now().UTC().Format(time.RFC3339)
	if err := shared.UpdateKioskFields(payload.UUID, map[string]string{
		"status":         "pending",
		"secure_key":     "",
		"approvedAt":     "",
		"expiresAt":      "",
		"approvalMode":   "reprovision",
		"disabledReason": "wifi_reprovision",
		"lastSeen":       now,
	}); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to reprovision: " + err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{
		"success":         true,
		"uuid":            payload.UUID,
		"status":          "pending",
		"reprovisioned_at": now,
		"message":         "Kiosk reset to pending — will re-register on next boot",
	})
}
