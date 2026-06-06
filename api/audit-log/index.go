package audit_log

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const firestoreBase = "https://firestore.googleapis.com/v1/projects/maainhome-ccc/databases/(default)/documents"

type AuditEntry struct {
	DocID      string `json:"doc_id,omitempty"`
	Timestamp  string `json:"timestamp"`
	Action     string `json:"action"`
	UUID       string `json:"uuid"`
	AdminUser  string `json:"admin_user"`
	Before     string `json:"before"`
	After      string `json:"after"`
	Note       string `json:"note"`
}

type FirestoreValue struct {
	StringValue string `json:"stringValue,omitempty"`
}

type FirestoreDoc struct {
	Name   string                    `json:"name,omitempty"`
	Fields map[string]FirestoreValue `json:"fields"`
}

var httpClient = &http.Client{Timeout: 10 * time.Second}

func getField(fields map[string]FirestoreValue, key string) string {
	if v, ok := fields[key]; ok {
		return v.StringValue
	}
	return ""
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// GET — list last 100 audit entries ordered by timestamp desc
	if r.Method == http.MethodGet {
		url := fmt.Sprintf("%s/audit_log?pageSize=100&orderBy=timestamp+desc", firestoreBase)
		resp, err := httpClient.Get(url)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		var result struct {
			Documents []FirestoreDoc `json:"documents,omitempty"`
		}
		json.NewDecoder(resp.Body).Decode(&result)

		entries := make([]AuditEntry, 0, len(result.Documents))
		for _, doc := range result.Documents {
			entries = append(entries, AuditEntry{
				Timestamp: getField(doc.Fields, "timestamp"),
				Action:    getField(doc.Fields, "action"),
				UUID:      getField(doc.Fields, "uuid"),
				AdminUser: getField(doc.Fields, "admin_user"),
				Before:    getField(doc.Fields, "before"),
				After:     getField(doc.Fields, "after"),
				Note:      getField(doc.Fields, "note"),
			})
		}
		json.NewEncoder(w).Encode(entries)
		return
	}

	// POST — write a new audit entry
	if r.Method == http.MethodPost {
		var entry AuditEntry
		if err := json.NewDecoder(r.Body).Decode(&entry); err != nil || entry.Action == "" {
			http.Error(w, `{"error":"action is required"}`, http.StatusBadRequest)
			return
		}
		entry.Timestamp = time.Now().UTC().Format(time.RFC3339)

		doc := FirestoreDoc{Fields: map[string]FirestoreValue{
			"timestamp":  {StringValue: entry.Timestamp},
			"action":     {StringValue: entry.Action},
			"uuid":       {StringValue: entry.UUID},
			"admin_user": {StringValue: entry.AdminUser},
			"before":     {StringValue: entry.Before},
			"after":      {StringValue: entry.After},
			"note":       {StringValue: entry.Note},
		}}

		body, _ := json.Marshal(doc)
		// Use POST to auto-generate doc ID
		url := fmt.Sprintf("%s/audit_log", firestoreBase)
		req, _ := http.NewRequest("POST", url, bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := httpClient.Do(req)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{"success": false, "error": err.Error()})
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode >= 400 {
			b, _ := io.ReadAll(resp.Body)
			w.WriteHeader(resp.StatusCode)
			json.NewEncoder(w).Encode(map[string]any{"success": false, "error": string(b)})
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "timestamp": entry.Timestamp})
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}
