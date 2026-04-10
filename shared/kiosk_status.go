package shared

import "time"

func DisableKioskRecord(uuid string, reason string) error {
	now := time.Now().UTC().Format(time.RFC3339)
	return UpdateKioskFields(uuid, map[string]string{
		"status":         "disabled",
		"disabledAt":     now,
		"disabledReason": reason,
	})
}

func EnsureRecordNotExpired(record *KioskRecord) error {
	if record == nil {
		return nil
	}

	if record.Status == "approved" && IsExpired(record.ExpiresAt) {
		if err := DisableKioskRecord(record.UUID, "approval_expired"); err != nil {
			return err
		}
		record.Status = "disabled"
		record.DisabledReason = "approval_expired"
		record.DisabledAt = time.Now().UTC().Format(time.RFC3339)
	}

	return nil
}