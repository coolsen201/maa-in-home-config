package shared

import (
	"os"
	"strconv"
	"time"
)

const (
	ApprovalModeManual = "manual"
	ApprovalModeAuto   = "auto"
)

func GetApprovalMode() string {
	switch os.Getenv("APPROVAL_MODE") {
	case ApprovalModeAuto:
		return ApprovalModeAuto
	default:
		return ApprovalModeManual
	}
}

func IsAutoApprovalEnabled() bool {
	return GetApprovalMode() == ApprovalModeAuto
}

func GetDefaultApprovalDays() int {
	value := os.Getenv("DEFAULT_APPROVAL_DAYS")
	if value == "" {
		return 30
	}

	parsed, err := strconv.Atoi(value)
	if err != nil || parsed <= 0 {
		return 30
	}

	return parsed
}

func NormalizeApprovalDays(days int) int {
	if days <= 0 {
		return GetDefaultApprovalDays()
	}
	if days > 365 {
		return 365
	}
	return days
}

func CalculateExpiryFromNow(days int) string {
	normalized := NormalizeApprovalDays(days)
	return time.Now().UTC().Add(time.Duration(normalized) * 24 * time.Hour).Format(time.RFC3339)
}

func IsExpired(expiresAt string) bool {
	if expiresAt == "" {
		return false
	}

	parsed, err := time.Parse(time.RFC3339, expiresAt)
	if err != nil {
		return false
	}

	return !time.Now().UTC().Before(parsed)
}