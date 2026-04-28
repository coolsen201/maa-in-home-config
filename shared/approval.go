package shared

import (
	"fmt"
	"math/rand"
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

// GenerateHomeNumber creates a short, user-friendly device identifier (e.g., "HM-AB12C")
// Uses uppercase alphanumeric excluding I, O, L (confusing with 1, 0, l)
func GenerateHomeNumber() string {
	// Characters that are easy to distinguish: exclude I, L, O, 1, 0 to avoid confusion
	charset := "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
	
	rand.Seed(time.Now().UnixNano())
	code := make([]byte, 5)
	for i := 0; i < 5; i++ {
		code[i] = charset[rand.Intn(len(charset))]
	}
	return fmt.Sprintf("HM-%s", string(code))
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