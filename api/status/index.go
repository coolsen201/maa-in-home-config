package status

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

	kioskUUID := r.URL.Query().Get("uuid")
	if kioskUUID == "" {
		http.Error(w, `{"error":"uuid query param is required"}`, http.StatusBadRequest)
		return
	}

	record, found, err := shared.GetKiosk(kioskUUID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "Failed to check status: " + err.Error()})
		return
	}

	if !found {
		json.NewEncoder(w).Encode(map[string]any{"status": "not_found"})
		return
	}

	if err := shared.EnsureRecordNotExpired(&record); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "Failed to validate device expiry: " + err.Error()})
		return
	}

	resp := map[string]any{
		"status":          record.Status,
		"uuid":            record.UUID,
		"home_number":     record.HomeNumber,
		"user_id":         record.UserID,
		"lastSeen":        record.LastSeen,
		"expires_at":      record.ExpiresAt,
		"disabled_reason": record.DisabledReason,
	}
	if record.Status == "approved" {
		resp["secure_key"] = record.SecureKey
	}
	json.NewEncoder(w).Encode(resp)
}
