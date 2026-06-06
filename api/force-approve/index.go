package force_approve

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/coolsen201/maa-in-home-config/shared"
	"github.com/google/uuid"
)

type ForceApprovePayload struct {
	UUID         string `json:"uuid"`
	DurationDays int    `json:"duration_days"`
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

	var payload ForceApprovePayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}
	if payload.UUID == "" {
		http.Error(w, `{"error":"uuid is required"}`, http.StatusBadRequest)
		return
	}

	record, found, err := shared.GetKiosk(payload.UUID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to read kiosk: " + err.Error()})
		return
	}

	durationDays := shared.NormalizeApprovalDays(payload.DurationDays)
	secureKey := uuid.New().String()
	now := time.Now().UTC().Format(time.RFC3339)
	approvedAt := now
	expiresAt := shared.CalculateExpiryFromNow(durationDays)

	if !found {
		// Device not registered yet — create a fresh record and approve it (re-registration)
		homeNumber := shared.GenerateHomeNumber()
		newRecord := shared.KioskRecord{
			UUID:         payload.UUID,
			PIN:          "",
			Status:       "approved",
			SecureKey:    secureKey,
			LastSeen:     now,
			FirstSeen:    now,
			ApprovedAt:   approvedAt,
			ExpiresAt:    expiresAt,
			ApprovalMode: shared.GetApprovalMode(),
			ApprovedVia:  "ccc-force-reregister",
			HomeNumber:   homeNumber,
		}
		if err := shared.SetKiosk(payload.UUID, newRecord); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to register device: " + err.Error()})
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"success":        true,
			"reregistered":   true,
			"home_number":    homeNumber,
			"approved_at":    approvedAt,
			"expires_at":     expiresAt,
			"duration_days":  durationDays,
			"approval_mode":  shared.GetApprovalMode(),
		})
		return
	}

	// If already approved and not expired, return existing info
	if record.Status == "approved" && record.SecureKey != "" && !shared.IsExpired(record.ExpiresAt) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"success":          true,
			"already_approved": true,
			"secure_key":       record.SecureKey,
			"home_number":      record.HomeNumber,
			"expires_at":       record.ExpiresAt,
			"duration_days":    shared.NormalizeApprovalDays(payload.DurationDays),
		})
		return
	}

	homeNumber := record.HomeNumber
	if homeNumber == "" {
		homeNumber = shared.GenerateHomeNumber()
	}

	err = shared.UpdateKioskFields(payload.UUID, map[string]string{
		"status":       "approved",
		"secure_key":   secureKey,
		"home_number":  homeNumber,
		"approvedAt":   approvedAt,
		"expiresAt":    expiresAt,
		"approvalMode": shared.GetApprovalMode(),
		"approvedVia":  "ccc-force",
	})

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to approve: " + err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"success":       true,
		"home_number":   homeNumber,
		"approved_at":   approvedAt,
		"expires_at":    expiresAt,
		"duration_days": durationDays,
		"approval_mode": shared.GetApprovalMode(),
	})
}
