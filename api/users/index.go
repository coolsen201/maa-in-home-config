package users

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const firestoreBase = "https://firestore.googleapis.com/v1/projects/maainhome-ccc/databases/(default)/documents"

type UserRecord struct {
	UserID       string `json:"user_id"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	Balance      string `json:"balance"`
	Credited     string `json:"credited"`
	ReceivedFrom string `json:"received_from"`
	ExpiryDate   string `json:"expiry_date"`
	UpdatedAt    string `json:"updated_at"`
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

func fromDoc(doc FirestoreDoc) UserRecord {
	return UserRecord{
		UserID:       getField(doc.Fields, "user_id"),
		Name:         getField(doc.Fields, "name"),
		Email:        getField(doc.Fields, "email"),
		Balance:      getField(doc.Fields, "balance"),
		Credited:     getField(doc.Fields, "credited"),
		ReceivedFrom: getField(doc.Fields, "received_from"),
		ExpiryDate:   getField(doc.Fields, "expiry_date"),
		UpdatedAt:    getField(doc.Fields, "updated_at"),
	}
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

	if r.Method == http.MethodGet {
		url := fmt.Sprintf("%s/admin_users?pageSize=100", firestoreBase)
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
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{"error": err.Error()})
			return
		}

		users := make([]UserRecord, 0)
		for _, doc := range result.Documents {
			users = append(users, fromDoc(doc))
		}
		json.NewEncoder(w).Encode(users)
		return
	}

	if r.Method == http.MethodPost {
		var rec UserRecord
		if err := json.NewDecoder(r.Body).Decode(&rec); err != nil || rec.UserID == "" {
			http.Error(w, `{"error":"user_id is required"}`, http.StatusBadRequest)
			return
		}
		rec.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

		doc := FirestoreDoc{Fields: map[string]FirestoreValue{
			"user_id":       {StringValue: rec.UserID},
			"name":          {StringValue: rec.Name},
			"email":         {StringValue: rec.Email},
			"balance":       {StringValue: rec.Balance},
			"credited":      {StringValue: rec.Credited},
			"received_from": {StringValue: rec.ReceivedFrom},
			"expiry_date":   {StringValue: rec.ExpiryDate},
			"updated_at":    {StringValue: rec.UpdatedAt},
		}}

		body, _ := json.Marshal(doc)
		url := fmt.Sprintf("%s/admin_users/%s", firestoreBase, rec.UserID)
		req, _ := http.NewRequest("PATCH", url, bytes.NewReader(body))
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
		json.NewEncoder(w).Encode(map[string]any{"success": true, "user_id": rec.UserID})
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}
