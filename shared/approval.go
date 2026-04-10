package shared

import "os"

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