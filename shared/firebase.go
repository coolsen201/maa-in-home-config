package shared

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const firestoreBaseURL = "https://firestore.googleapis.com/v1/projects/maainhome-ccc/databases/(default)/documents"

// KioskRecord for in-memory use
type KioskRecord struct {
	UUID      string `json:"uuid"`
	PIN       string `json:"pin"`
	Status    string `json:"status"`
	SecureKey string `json:"secure_key,omitempty"`
	LastSeen  string `json:"lastSeen"`
	FirstSeen string `json:"firstSeen,omitempty"`
	ApprovedAt string `json:"approvedAt,omitempty"`
	ApprovalMode string `json:"approvalMode,omitempty"`
	ApprovedVia string `json:"approvedVia,omitempty"`
}

// FirestoreDoc represents a Firestore document response
type FirestoreDoc struct {
	Name   string                     `json:"name,omitempty"`
	Fields map[string]FirestoreValue  `json:"fields"`
}

type FirestoreValue struct {
	StringValue  string `json:"stringValue,omitempty"`
}

// httpClient with reasonable timeout
var httpClient = &http.Client{Timeout: 10 * time.Second}

// ToFirestoreDoc converts a KioskRecord to a Firestore document
func ToFirestoreDoc(k KioskRecord) FirestoreDoc {
	fields := map[string]FirestoreValue{
		"uuid":     {StringValue: k.UUID},
		"pin":      {StringValue: k.PIN},
		"status":   {StringValue: k.Status},
		"lastSeen": {StringValue: k.LastSeen},
	}
	if k.FirstSeen != "" {
		fields["firstSeen"] = FirestoreValue{StringValue: k.FirstSeen}
	}
	if k.SecureKey != "" {
		fields["secure_key"] = FirestoreValue{StringValue: k.SecureKey}
	}
	if k.ApprovedAt != "" {
		fields["approvedAt"] = FirestoreValue{StringValue: k.ApprovedAt}
	}
	if k.ApprovalMode != "" {
		fields["approvalMode"] = FirestoreValue{StringValue: k.ApprovalMode}
	}
	if k.ApprovedVia != "" {
		fields["approvedVia"] = FirestoreValue{StringValue: k.ApprovedVia}
	}
	return FirestoreDoc{Fields: fields}
}

// FromFirestoreDoc parses a Firestore document into a KioskRecord
func FromFirestoreDoc(doc FirestoreDoc) KioskRecord {
	return KioskRecord{
		UUID:      doc.Fields["uuid"].StringValue,
		PIN:       doc.Fields["pin"].StringValue,
		Status:    doc.Fields["status"].StringValue,
		SecureKey: doc.Fields["secure_key"].StringValue,
		LastSeen:  doc.Fields["lastSeen"].StringValue,
		FirstSeen: doc.Fields["firstSeen"].StringValue,
		ApprovedAt: doc.Fields["approvedAt"].StringValue,
		ApprovalMode: doc.Fields["approvalMode"].StringValue,
		ApprovedVia: doc.Fields["approvedVia"].StringValue,
	}
}

// SetKiosk creates or overwrites a kiosk document via the Firestore REST API
func SetKiosk(kioskUUID string, record KioskRecord) error {
	doc := ToFirestoreDoc(record)
	body, _ := json.Marshal(doc)

	url := fmt.Sprintf("%s/kiosks/%s", firestoreBaseURL, kioskUUID)
	req, err := http.NewRequest("PATCH", url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("firestore request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("firestore error (status %d): %s", resp.StatusCode, string(respBody))
	}
	return nil
}

// GetKiosk reads a single kiosk document from Firestore REST API
func GetKiosk(kioskUUID string) (KioskRecord, bool, error) {
	url := fmt.Sprintf("%s/kiosks/%s", firestoreBaseURL, kioskUUID)
	resp, err := httpClient.Get(url)
	if err != nil {
		return KioskRecord{}, false, fmt.Errorf("firestore request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		return KioskRecord{}, false, nil
	}
	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return KioskRecord{}, false, fmt.Errorf("firestore error (status %d): %s", resp.StatusCode, string(respBody))
	}

	var doc FirestoreDoc
	if err := json.NewDecoder(resp.Body).Decode(&doc); err != nil {
		return KioskRecord{}, false, fmt.Errorf("failed to decode firestore doc: %v", err)
	}
	return FromFirestoreDoc(doc), true, nil
}

// UpdateKioskFields updates specific fields on a kiosk document
func UpdateKioskFields(kioskUUID string, updates map[string]string) error {
	fields := map[string]FirestoreValue{}
	var maskParts string
	first := true
	for k, v := range updates {
		fields[k] = FirestoreValue{StringValue: v}
		if !first {
			maskParts += "&"
		}
		maskParts += "updateMask.fieldPaths=" + k
		first = false
	}
	doc := FirestoreDoc{Fields: fields}
	body, _ := json.Marshal(doc)

	url := fmt.Sprintf("%s/kiosks/%s?%s", firestoreBaseURL, kioskUUID, maskParts)
	req, err := http.NewRequest("PATCH", url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("firestore request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("firestore error (status %d): %s", resp.StatusCode, string(respBody))
	}
	return nil
}

func DeleteKiosk(kioskUUID string) error {
	url := fmt.Sprintf("%s/kiosks/%s", firestoreBaseURL, kioskUUID)
	req, err := http.NewRequest(http.MethodDelete, url, nil)
	if err != nil {
		return err
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("firestore request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("firestore error (status %d): %s", resp.StatusCode, string(respBody))
	}
	return nil
}

func QueryKiosksByStatus(status string) ([]KioskRecord, error) {
	query := map[string]any{
		"structuredQuery": map[string]any{
			"from": []map[string]any{
				{"collectionId": "kiosks"},
			},
			"where": map[string]any{
				"fieldFilter": map[string]any{
					"field": map[string]string{"fieldPath": "status"},
					"op":    "EQUAL",
					"value": map[string]string{"stringValue": status},
				},
			},
		},
	}
	body, _ := json.Marshal(query)

	queryURL := firestoreBaseURL + ":runQuery"
	resp, err := httpClient.Post(queryURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("firestore query failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("firestore error (status %d): %s", resp.StatusCode, string(respBody))
	}

	var results []struct {
		Document *FirestoreDoc `json:"document,omitempty"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&results); err != nil {
		return nil, fmt.Errorf("failed to decode query results: %v", err)
	}

	var kiosks []KioskRecord
	for _, r := range results {
		if r.Document != nil {
			kiosks = append(kiosks, FromFirestoreDoc(*r.Document))
		}
	}
	return kiosks, nil
}

func QueryAllKiosks() ([]KioskRecord, error) {
	queryURL := fmt.Sprintf("%s/kiosks?pageSize=100", firestoreBaseURL)
	resp, err := httpClient.Get(queryURL)
	if err != nil {
		return nil, fmt.Errorf("firestore request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("firestore error (status %d): %s", resp.StatusCode, string(respBody))
	}

	var result struct {
		Documents []FirestoreDoc `json:"documents,omitempty"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode kiosk list: %v", err)
	}

	kiosks := make([]KioskRecord, 0, len(result.Documents))
	for _, doc := range result.Documents {
		kiosks = append(kiosks, FromFirestoreDoc(doc))
	}
	return kiosks, nil
}

// QueryPendingKiosks fetches all kiosks with status == "pending" via structured query
func QueryPendingKiosks() ([]KioskRecord, error) {
	return QueryKiosksByStatus("pending")
}

// HealthCheck tests basic Firestore connectivity
func HealthCheck() error {
	// Simple query to see if Firestore is reachable
	url := firestoreBaseURL + "/kiosks?pageSize=1"
	resp, err := httpClient.Get(url)
	if err != nil {
		return fmt.Errorf("firestore unreachable: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("firestore returned %d: %s", resp.StatusCode, string(respBody))
	}
	return nil
}
