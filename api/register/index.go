package register

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/coolsen201/maa-in-home-config/shared"
	"github.com/google/uuid"
)

type RegisterRequest struct {
	UUID string `json:"uuid"`
	PIN  string `json:"pin"`
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

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.UUID == "" || req.PIN == "" {
		http.Error(w, `{"error":"uuid and pin are required"}`, http.StatusBadRequest)
		return
	}

	existing, found, err := shared.GetKiosk(req.UUID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "Failed to read kiosk record: " + err.Error(),
		})
		return
	}

	if found && existing.Status == "approved" && existing.SecureKey != "" {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"success":        true,
			"uuid":           existing.UUID,
			"status":         existing.Status,
			"secure_key":     existing.SecureKey,
			"approval_mode":  shared.GetApprovalMode(),
			"already_paired": true,
		})
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	status := "pending"
	secureKey := ""
	approvedAt := ""
	approvedVia := ""
	if shared.IsAutoApprovalEnabled() {
		status = "approved"
		secureKey = uuid.New().String()
		approvedAt = now
		approvedVia = "backend-auto"
	}

	firstSeen := now
	if found && existing.FirstSeen != "" {
		firstSeen = existing.FirstSeen
	}

	record := shared.KioskRecord{
		UUID:      req.UUID,
		PIN:       req.PIN,
		Status:    status,
		SecureKey: secureKey,
		LastSeen:  now,
		FirstSeen: firstSeen,
		ApprovedAt: approvedAt,
		ApprovalMode: shared.GetApprovalMode(),
		ApprovedVia: approvedVia,
	}

	if err := shared.SetKiosk(req.UUID, record); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "Failed to store kiosk record: " + err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	response := map[string]any{
		"success":       true,
		"uuid":          req.UUID,
		"status":        status,
		"approval_mode": shared.GetApprovalMode(),
		"first_seen":    firstSeen,
		"last_seen":     now,
	}
	if secureKey != "" {
		response["secure_key"] = secureKey
	}
	json.NewEncoder(w).Encode(response)
}
