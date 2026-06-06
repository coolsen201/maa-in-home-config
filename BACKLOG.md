# MaainHome CCC — Backlog

**Last Updated: 2026-06-06**

---

## ⚠️ Critical — Device Release Process

### Problem (Root Cause of 2026-06-06 Bug)
When a device is **removed** from CCC:
1. Firestore record deleted
2. Kiosk auto-calls `/api/register` with its real UUID from disk
3. Admin re-approves via Quick Approve by **manually typing UUID**
4. ❌ One character typo → UUID mismatch → kiosk stuck in pending forever

### Correct Process
- **Disable** = keeps record, kiosk shows "Access Revoked" — use for payment expiry
- **Remove** = deletes record, kiosk re-registers in ~10s — use for transfer only
- After Remove: wait for device to appear in **Pending**, approve from table (no typing)

### Tasks Required
- [ ] **Release checklist modal** — before Remove completes, show checklist reminding admin to wait for Pending re-registration
- [ ] **Quick Approve UUID validation** — check format (8-4-4-4-12) and ping `/api/status` to confirm UUID exists before approving
- [ ] **Instant re-register** — when kiosk detects `not_found`, call `/api/register` immediately (not wait 10s for next poll)

---

## 🔴 High Priority — Next Sprint

### 1. Devices Menu (New Sidebar Item)
**What:** New "Devices" page in CCC sidebar between Security Keys and Analytics  
**Shows per device:**
- Home Number | UUID | Status badge | Client User ID | Last IP | Expiry | Payment status
- Actions: Disable | Remove | Transfer | Extend expiry

**Files to change:** `index.html` (add nav + section), `main.js` (add render function)

---

### 2. Transfer Device Button
**What:** Move a device from one user to another  
**Flow:**
1. Click Transfer on device row
2. Modal: Current User ID (read-only) + New User ID (input) + Reset secure_key? (checkbox)
3. On confirm: update `user_id` in Firestore, optionally generate new `secure_key`, log timestamp
4. Kiosk auto re-pairs on next poll

**Backend:** New `POST /api/transfer-device` endpoint or extend `/api/update-kiosk`

---

### 3. Admin Users Panel
**What:** New "Users" view in CCC to manage client accounts  
**Columns:**
| Field | Description |
|-------|-------------|
| User ID / Name | Firebase UID + display name |
| Status | Active / Disabled |
| Actions | Enable / Disable / Reset Password |
| Recharged Amount | Total money recharged |
| Credited Amount | Bonus credits |
| Balance Amount | Recharged − Used |
| Expire On | Subscription expiry |
| Received From | Payment method / reference |
| Date & Time | Last transaction |

**Backend:** New Firestore collection `users/{userId}` or extend `profiles`  
**Firebase Auth:** Use `firebase_update_user` MCP for enable/disable/password reset

---

### 4. Payment Expiry Auto-Disable
**What:** Scheduled job that disables devices past their `expiresAt` date  
**Options:**
- Vercel Cron job (`vercel.json` schedule)
- Or: check expiry inside `/api/status` — if expired, auto-disable and return `disabled`

**Note:** `/api/status` already returns `disabled` for expired approvals — just needs the Firestore write to flip the status

---

### 5. WiFi Change Workflow
**What:** Process to re-provision a kiosk on a new WiFi network  
**Current problem:** Kiosk is hardcoded to saved WiFi — no remote way to change  
**Solution options:**
- SSH into device and run `nmcli` commands to add new WiFi
- Add a "reprovisioning mode" boot flag
- Document step-by-step process in `usb-source/wifi/PROVISIONING.md`

---

### 6. Release Process Safeguards (UUID Mismatch Prevention)
- [ ] UUID format validation in Quick Approve (8-4-4-4-12 chars)
- [ ] Pre-approve UUID verification: ping `/api/status?uuid=` and show result before confirming
- [ ] Remove confirmation modal with transfer checklist
- [ ] Instant re-register on `not_found` (no 10s wait)

---

## 🟡 Medium Priority

### 7. Audit Log
Track every admin action with: timestamp, action type, UUID, admin user, before/after state  
Store in Firestore `audit_log/{docId}` collection

### 8. Device Detail Page
Click UUID in any table → full page showing:
- All Firestore fields
- Action history from audit log
- Current Chrome URL on device (from kiosk-init.sh)

### 9. Extend Expiry Button
Add N days to `expiresAt` without full re-approve  
`POST /api/extend-device` → update `expiresAt` in Firestore

### 10. Bulk Actions
Select multiple devices → apply: Disable / Extend / Transfer

### 11. AnyDesk Auto-Install
Add AnyDesk install to the kiosk provisioning USB script so remote access is always available on first boot

### 12. Electron → Vercel Switch
Kiosk Electron app currently loads `localhost:5000` (local build)  
Changed to load `https://maainhome.in/home` (committed) — needs kiosk rebuild to take effect  
**Impact:** After rebuild, all Vercel deploys are instant on the kiosk

---

## 🟢 Low Priority / Future

### 13. Remote Reboot from CCC
SSH command sent from CCC dashboard to reboot kiosk device

### 14. Per-Device Health Dashboard
Show camera / mic / speaker status from each kiosk in the Devices page

### 15. Payment Expiry Alerts
SMS/email to admin 7 days before device subscription expires

### 16. Client Self-Service Portal
Client logs in with their account → sees their device status, call history, subscription

### 17. Android Remote App
Call from mobile to home station (existing `/remote` route on Android)

### 18. Multi-Admin with Roles
Add CCC login (currently open) with role-based access (super-admin / billing / support)

---

## ✅ Completed

- [x] Kiosk registration: UUID + PIN self-register
- [x] Manual PIN approval from CCC
- [x] Force-approve without PIN (for re-registration / transfer)
- [x] Approval duration (30/60/90 days)
- [x] Firestore serialization fix: empty PIN causing 400 INVALID_ARGUMENT
- [x] `/api/status` endpoint for kiosk polling
- [x] Kiosk auto-poll and auto re-pair on `secure_key` change
- [x] `hasBootstrappedRef` bug fix: kiosk was blocked from re-pairing after first poll
- [x] UUID mismatch root cause diagnosed and fixed (D8CAE vs DBCAE, 2026-06-06)
- [x] `home_number` and `user_id` editable inline from CCC
- [x] Disable / Remove actions on all device tables
- [x] AnyDesk installed on kiosk device via SSH
- [x] Electron main.js updated to load from Vercel (pending kiosk rebuild)
