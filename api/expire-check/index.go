package expire_check

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/coolsen201/maa-in-home-config/shared"
)

// Handler checks all approved kiosks and auto-disables any that have passed expiresAt
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

	kiosks, err := shared.QueryAllKiosks()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": err.Error()})
		return
	}

	now := time.Now().UTC()
	disabled := []string{}

	for _, k := range kiosks {
		if k.Status != "approved" {
			continue
		}
		if k.ExpiresAt == "" {
			continue
		}
		expiry, err := time.Parse(time.RFC3339, k.ExpiresAt)
		if err != nil {
			continue
		}
		if now.After(expiry) {
			_ = shared.UpdateKioskFields(k.UUID, map[string]string{
				"status":         "disabled",
				"disabledAt":     now.Format(time.RFC3339),
				"disabledReason": "payment_expired",
				"lastSeen":       now.Format(time.RFC3339),
			})
			disabled = append(disabled, k.UUID)
		}
	}

	json.NewEncoder(w).Encode(map[string]any{
		"success":          true,
		"checked":          len(kiosks),
		"expired_disabled": disabled,
	})
}
