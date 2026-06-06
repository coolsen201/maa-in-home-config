package extend_device

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const firestoreBase = "https://firestore.googleapis.com/v1/projects/maainhome-ccc/databases/(default)/documents"

var httpClient = &http.Client{Timeout: 10 * time.Second}

type ExtendRequest struct {
	UUID string `json:"uuid"`
	Days int    `json:"days"`
}

// getExpiresAt fetches current expiresAt for the kiosk document
func getExpiresAt(uuid string) (string, error) {
	collections := []string{"pending_kiosks", "approved_kiosks", "disabled_kiosks"}
	for _, col := range collections {
		url := fmt.Sprintf("%s/%s/%s", firestoreBase, col, uuid)
		resp, err := httpClient.Get(url)
		if err != nil {
			continue
		}
		defer resp.Body.Close()
		if resp.StatusCode == 200 {
			var doc struct {
				Fields map[string]struct {
					StringValue string `json:"stringValue"`
				} `json:"fields"`
			}
			json.NewDecoder(resp.Body).Decode(&doc)
			if f, ok := doc.Fields["expiresAt"]; ok {
				return f.StringValue, nil
			}
			return "", nil
		}
	}
	return "", fmt.Errorf("device not found: %s", uuid)
}

// patchExpiresAt updates expiresAt on the kiosk document across all collections
func patchExpiresAt(uuid, newExpiry string) error {
	collections := []string{"pending_kiosks", "approved_kiosks", "disabled_kiosks"}
	for _, col := range collections {
		// First check if doc exists in this collection
		checkURL := fmt.Sprintf("%s/%s/%s", firestoreBase, col, uuid)
		resp, err := httpClient.Get(checkURL)
		if err != nil || resp.StatusCode != 200 {
			if resp != nil {
				resp.Body.Close()
			}
			continue
		}
		resp.Body.Close()

		doc := map[string]any{
			"fields": map[string]any{
				"expiresAt": map[string]string{"stringValue": newExpiry},
			},
		}
		body, _ := json.Marshal(doc)
		patchURL := fmt.Sprintf("%s/%s/%s?updateMask.fieldPaths=expiresAt", firestoreBase, col, uuid)
		req, _ := http.NewRequest("PATCH", patchURL, bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		pr, err := httpClient.Do(req)
		if err != nil {
			return err
		}
		defer pr.Body.Close()
		if pr.StatusCode >= 400 {
			b, _ := io.ReadAll(pr.Body)
			return fmt.Errorf("patch failed: %s", string(b))
		}
		return nil
	}
	return fmt.Errorf("device not found in any collection: %s", uuid)
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

	var req ExtendRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.UUID == "" || req.Days <= 0 {
		http.Error(w, `{"error":"uuid and days (>0) are required"}`, http.StatusBadRequest)
		return
	}

	// Get current expiry; if none or past, extend from today
	currentExpiry, _ := getExpiresAt(req.UUID)
	var base time.Time
	if currentExpiry != "" {
		t, err := time.Parse(time.RFC3339, currentExpiry)
		if err == nil && t.After(time.Now().UTC()) {
			base = t
		}
	}
	if base.IsZero() {
		base = time.Now().UTC()
	}
	newExpiry := base.AddDate(0, 0, req.Days).Format(time.RFC3339)

	if err := patchExpiresAt(req.UUID, newExpiry); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"success": false, "error": err.Error()})
		return
	}

	// Write audit log entry
	auditDoc := map[string]any{
		"fields": map[string]any{
			"timestamp":  map[string]string{"stringValue": time.Now().UTC().Format(time.RFC3339)},
			"action":     map[string]string{"stringValue": "extend_expiry"},
			"uuid":       map[string]string{"stringValue": req.UUID},
			"admin_user": map[string]string{"stringValue": "ccc-admin"},
			"before":     map[string]string{"stringValue": currentExpiry},
			"after":      map[string]string{"stringValue": newExpiry},
			"note":       map[string]string{"stringValue": fmt.Sprintf("+%d days", req.Days)},
		},
	}
	ab, _ := json.Marshal(auditDoc)
	auditReq, _ := http.NewRequest("POST", "https://firestore.googleapis.com/v1/projects/maainhome-ccc/databases/(default)/documents/audit_log", bytes.NewReader(ab))
	auditReq.Header.Set("Content-Type", "application/json")
	httpClient.Do(auditReq) // fire-and-forget

	json.NewEncoder(w).Encode(map[string]any{
		"success":        true,
		"uuid":           req.UUID,
		"days_extended":  req.Days,
		"old_expiry":     currentExpiry,
		"new_expiry":     newExpiry,
	})
}
