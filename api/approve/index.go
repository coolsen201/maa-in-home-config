package approve

import (
	"encoding/json"
	"net/http"

	"github.com/coolsen201/maa-in-home-config/shared"
	"github.com/google/uuid"
)

type ApprovePayload struct {
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

	var payload ApprovePayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}
	if payload.UUID == "" || payload.PIN == "" {
		http.Error(w, `{"error":"uuid and pin are required"}`, http.StatusBadRequest)
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
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Kiosk not found or expired"})
		return
	}

	if record.PIN != payload.PIN {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "PIN mismatch"})
		return
	}

	secureKey := uuid.New().String()

	err = shared.UpdateKioskFields(payload.UUID, map[string]string{
		"status":     "approved",
		"secure_key": secureKey,
	})
	
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": "Failed to update status: " + err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"success":    true,
		"secure_key": secureKey,
	})
}
