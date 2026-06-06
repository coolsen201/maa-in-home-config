package admin

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const fsBase = "https://firestore.googleapis.com/v1/projects/maainhome-ccc/databases/(default)/documents"

var httpClient = &http.Client{Timeout: 15 * time.Second}

// ── Helpers ──────────────────────────────────────────────────────────────────

func strField(fields map[string]map[string]string, key string) string {
	if f, ok := fields[key]; ok {
		return f["stringValue"]
	}
	return ""
}

func makeStrField(val string) map[string]string {
	return map[string]string{"stringValue": val}
}

func fsGet(path string) (map[string]map[string]string, error) {
	resp, err := httpClient.Get(fsBase + path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode == 404 {
		return nil, nil
	}
	var doc struct {
		Fields map[string]map[string]string `json:"fields"`
	}
	json.NewDecoder(resp.Body).Decode(&doc)
	return doc.Fields, nil
}

func fsPatch(path string, fields map[string]any, maskPaths []string) error {
	doc := map[string]any{"fields": fields}
	body, _ := json.Marshal(doc)
	mask := ""
	for i, p := range maskPaths {
		if i > 0 {
			mask += "&"
		}
		mask += "updateMask.fieldPaths=" + p
	}
	url := fsBase + path + "?" + mask
	req, _ := http.NewRequest("PATCH", url, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("patch %s: %s", path, string(b))
	}
	return nil
}

func fsPost(path string, fields map[string]any) error {
	doc := map[string]any{"fields": fields}
	body, _ := json.Marshal(doc)
	req, _ := http.NewRequest("POST", fsBase+path, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("post %s: %s", path, string(b))
	}
	return nil
}

func writeAudit(action, uuid, before, after, note string) {
	fields := map[string]any{
		"timestamp":  makeStrField(time.Now().UTC().Format(time.RFC3339)),
		"action":     makeStrField(action),
		"uuid":       makeStrField(uuid),
		"admin_user": makeStrField("ccc-admin"),
		"before":     makeStrField(before),
		"after":      makeStrField(after),
		"note":       makeStrField(note),
	}
	fsPost("/audit_log", fields) // fire-and-forget (ignore error)
}

func respond(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// ── Actions ───────────────────────────────────────────────────────────────────

// GET /api/admin?action=audit-log
func handleAuditLog(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"GET only"}`, http.StatusMethodNotAllowed)
		return
	}
	url := fsBase + "/audit_log?pageSize=100"
	resp, err := httpClient.Get(url)
	if err != nil {
		respond(w, 500, map[string]any{"error": err.Error()})
		return
	}
	defer resp.Body.Close()
	var result struct {
		Documents []struct {
			Fields map[string]map[string]string `json:"fields"`
		} `json:"documents"`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	entries := make([]map[string]string, 0)
	for _, doc := range result.Documents {
		entries = append(entries, map[string]string{
			"timestamp":  strField(doc.Fields, "timestamp"),
			"action":     strField(doc.Fields, "action"),
			"uuid":       strField(doc.Fields, "uuid"),
			"admin_user": strField(doc.Fields, "admin_user"),
			"before":     strField(doc.Fields, "before"),
			"after":      strField(doc.Fields, "after"),
			"note":       strField(doc.Fields, "note"),
		})
	}
	respond(w, 200, entries)
}

// POST /api/admin?action=audit-log
func handleAuditLogPost(w http.ResponseWriter, r *http.Request) {
	var entry struct {
		Action    string `json:"action"`
		UUID      string `json:"uuid"`
		AdminUser string `json:"admin_user"`
		Before    string `json:"before"`
		After     string `json:"after"`
		Note      string `json:"note"`
	}
	json.NewDecoder(r.Body).Decode(&entry)
	if entry.Action == "" {
		respond(w, 400, map[string]any{"error": "action is required"})
		return
	}
	writeAudit(entry.Action, entry.UUID, entry.Before, entry.After, entry.Note)
	respond(w, 200, map[string]any{"success": true})
}

// POST /api/admin?action=extend-device
func handleExtendDevice(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UUID string `json:"uuid"`
		Days int    `json:"days"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	if req.UUID == "" || req.Days <= 0 {
		respond(w, 400, map[string]any{"error": "uuid and days required"})
		return
	}

	cols := []string{"pending_kiosks", "approved_kiosks", "disabled_kiosks"}
	var currentExpiry, foundCol string
	for _, col := range cols {
		fields, err := fsGet("/" + col + "/" + req.UUID)
		if err == nil && fields != nil {
			currentExpiry = strField(fields, "expiresAt")
			foundCol = col
			break
		}
	}
	if foundCol == "" {
		respond(w, 404, map[string]any{"error": "device not found"})
		return
	}

	base := time.Now().UTC()
	if t, err := time.Parse(time.RFC3339, currentExpiry); err == nil && t.After(base) {
		base = t
	}
	newExpiry := base.AddDate(0, 0, req.Days).Format(time.RFC3339)

	err := fsPatch("/"+foundCol+"/"+req.UUID,
		map[string]any{"expiresAt": makeStrField(newExpiry)},
		[]string{"expiresAt"},
	)
	if err != nil {
		respond(w, 500, map[string]any{"error": err.Error()})
		return
	}
	writeAudit("extend_expiry", req.UUID, currentExpiry, newExpiry, fmt.Sprintf("+%d days", req.Days))
	respond(w, 200, map[string]any{"success": true, "uuid": req.UUID, "days_extended": req.Days, "old_expiry": currentExpiry, "new_expiry": newExpiry})
}

// POST /api/admin?action=transfer-device
func handleTransferDevice(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UUID      string `json:"uuid"`
		NewUserID string `json:"new_user_id"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	if req.UUID == "" || req.NewUserID == "" {
		respond(w, 400, map[string]any{"error": "uuid and new_user_id required"})
		return
	}

	cols := []string{"pending_kiosks", "approved_kiosks", "disabled_kiosks"}
	var oldUserID, foundCol string
	for _, col := range cols {
		fields, err := fsGet("/" + col + "/" + req.UUID)
		if err == nil && fields != nil {
			oldUserID = strField(fields, "user_id")
			foundCol = col
			break
		}
	}
	if foundCol == "" {
		respond(w, 404, map[string]any{"error": "device not found"})
		return
	}

	err := fsPatch("/"+foundCol+"/"+req.UUID,
		map[string]any{"user_id": makeStrField(req.NewUserID)},
		[]string{"user_id"},
	)
	if err != nil {
		respond(w, 500, map[string]any{"error": err.Error()})
		return
	}
	writeAudit("transfer", req.UUID, oldUserID, req.NewUserID, "user transfer")
	respond(w, 200, map[string]any{"success": true, "uuid": req.UUID, "old_user_id": oldUserID, "new_user_id": req.NewUserID})
}

// GET/POST /api/admin?action=users
func handleUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		url := fsBase + "/admin_users?pageSize=200"
		resp, err := httpClient.Get(url)
		if err != nil {
			respond(w, 500, map[string]any{"error": err.Error()})
			return
		}
		defer resp.Body.Close()
		var result struct {
			Documents []struct {
				Name   string                       `json:"name"`
				Fields map[string]map[string]string `json:"fields"`
			} `json:"documents"`
		}
		json.NewDecoder(resp.Body).Decode(&result)
		users := make([]map[string]string, 0)
		for _, doc := range result.Documents {
			u := map[string]string{
				"user_id":       strField(doc.Fields, "user_id"),
				"name":          strField(doc.Fields, "name"),
				"email":         strField(doc.Fields, "email"),
				"balance":       strField(doc.Fields, "balance"),
				"credited":      strField(doc.Fields, "credited"),
				"received_from": strField(doc.Fields, "received_from"),
				"expiry_date":   strField(doc.Fields, "expiry_date"),
				"updated_at":    strField(doc.Fields, "updated_at"),
			}
			users = append(users, u)
		}
		respond(w, 200, users)
		return
	}
	// POST — upsert
	var req struct {
		UserID       string `json:"user_id"`
		Name         string `json:"name"`
		Email        string `json:"email"`
		Balance      string `json:"balance"`
		Credited     string `json:"credited"`
		ReceivedFrom string `json:"received_from"`
		ExpiryDate   string `json:"expiry_date"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	if req.UserID == "" {
		respond(w, 400, map[string]any{"error": "user_id required"})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	fields := map[string]any{
		"user_id":       makeStrField(req.UserID),
		"name":          makeStrField(req.Name),
		"email":         makeStrField(req.Email),
		"balance":       makeStrField(req.Balance),
		"credited":      makeStrField(req.Credited),
		"received_from": makeStrField(req.ReceivedFrom),
		"expiry_date":   makeStrField(req.ExpiryDate),
		"updated_at":    makeStrField(now),
	}
	err := fsPatch("/admin_users/"+req.UserID, fields, []string{"user_id", "name", "email", "balance", "credited", "received_from", "expiry_date", "updated_at"})
	if err != nil {
		respond(w, 500, map[string]any{"error": err.Error()})
		return
	}
	respond(w, 200, map[string]any{"success": true, "user_id": req.UserID})
}

// POST /api/admin?action=expire-check
func handleExpireCheck(w http.ResponseWriter, r *http.Request) {
	url := fsBase + "/approved_kiosks?pageSize=200"
	resp, err := httpClient.Get(url)
	if err != nil {
		respond(w, 500, map[string]any{"error": err.Error()})
		return
	}
	defer resp.Body.Close()
	var result struct {
		Documents []struct {
			Name   string                       `json:"name"`
			Fields map[string]map[string]string `json:"fields"`
		} `json:"documents"`
	}
	json.NewDecoder(resp.Body).Decode(&result)

	now := time.Now().UTC()
	expired := []string{}
	checked := 0
	for _, doc := range result.Documents {
		checked++
		expiresAtStr := strField(doc.Fields, "expiresAt")
		if expiresAtStr == "" {
			continue
		}
		t, err := time.Parse(time.RFC3339, expiresAtStr)
		if err != nil || t.After(now) {
			continue
		}
		uuid := strField(doc.Fields, "uuid")
		if uuid == "" {
			continue
		}

		// Move to disabled_kiosks
		disFields := map[string]any{}
		for k, v := range doc.Fields {
			disFields[k] = map[string]string{"stringValue": v["stringValue"]}
		}
		disFields["status"] = makeStrField("disabled")
		disFields["disabledReason"] = makeStrField("payment_expired")
		disFields["disabledAt"] = makeStrField(now.Format(time.RFC3339))

		maskPaths := make([]string, 0, len(disFields))
		for k := range disFields {
			maskPaths = append(maskPaths, k)
		}
		fsPatch("/disabled_kiosks/"+uuid, disFields, maskPaths)
		// Delete from approved
		req2, _ := http.NewRequest("DELETE", fsBase+"/approved_kiosks/"+uuid, nil)
		httpClient.Do(req2)

		writeAudit("auto_disable", uuid, "approved", "disabled", "payment_expired")
		expired = append(expired, uuid)
	}
	respond(w, 200, map[string]any{"success": true, "checked": checked, "expired_disabled": expired})
}

// POST /api/admin?action=reprovision
func handleReprovision(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UUID string `json:"uuid"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	if req.UUID == "" {
		respond(w, 400, map[string]any{"error": "uuid required"})
		return
	}

	cols := []string{"approved_kiosks", "disabled_kiosks", "pending_kiosks"}
	var foundFields map[string]map[string]string
	var foundCol string
	for _, col := range cols {
		fields, err := fsGet("/" + col + "/" + req.UUID)
		if err == nil && fields != nil {
			foundFields = fields
			foundCol = col
			break
		}
	}
	if foundCol == "" {
		respond(w, 404, map[string]any{"error": "device not found"})
		return
	}

	// Write to pending with status=pending, clear secure_key
	pendingFields := map[string]any{}
	for k, v := range foundFields {
		pendingFields[k] = map[string]string{"stringValue": v["stringValue"]}
	}
	pendingFields["status"] = makeStrField("pending")
	pendingFields["secure_key"] = makeStrField("")
	pendingFields["reprovisionedAt"] = makeStrField(time.Now().UTC().Format(time.RFC3339))

	maskPaths := make([]string, 0, len(pendingFields))
	for k := range pendingFields {
		maskPaths = append(maskPaths, k)
	}
	if err := fsPatch("/pending_kiosks/"+req.UUID, pendingFields, maskPaths); err != nil {
		respond(w, 500, map[string]any{"error": err.Error()})
		return
	}

	// Delete from old collection if not already pending
	if foundCol != "pending_kiosks" {
		req2, _ := http.NewRequest("DELETE", fsBase+"/"+foundCol+"/"+req.UUID, nil)
		httpClient.Do(req2)
	}

	writeAudit("reprovision", req.UUID, foundCol, "pending", "wifi re-provision")
	respond(w, 200, map[string]any{"success": true, "uuid": req.UUID, "message": "Kiosk reset to pending for re-provisioning."})
}

// ── Main Handler ──────────────────────────────────────────────────────────────

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	action := r.URL.Query().Get("action")
	switch action {
	case "audit-log":
		if r.Method == http.MethodGet {
			handleAuditLog(w, r)
		} else {
			handleAuditLogPost(w, r)
		}
	case "extend-device":
		handleExtendDevice(w, r)
	case "transfer-device":
		handleTransferDevice(w, r)
	case "users":
		handleUsers(w, r)
	case "expire-check":
		handleExpireCheck(w, r)
	case "reprovision":
		handleReprovision(w, r)
	default:
		respond(w, 400, map[string]any{"error": "unknown action. Use ?action=audit-log|extend-device|transfer-device|users|expire-check|reprovision"})
	}
}
