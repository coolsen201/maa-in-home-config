# MaainHome CCC — Cloud Control Center

Central admin dashboard for managing MaainHome kiosk devices.

**Live URL:** https://maainhome-ccc.vercel.app  
**Last Updated:** 2026-06-06

---

## What Is This

CCC (Cloud Control Center) is the admin panel used to:
- Approve new kiosk devices before they go live
- Monitor device status (pending / approved / disabled)
- Transfer devices between users
- Manage payment expiry and subscription
- Force re-register devices that have been moved to new clients

---

## Current Registration Flow

```
Kiosk boots → reads UUID from /home/maainhome/.uuid
           → reads PIN from /home/maainhome/.env
           → POST /api/register  (uuid + pin)
           → shows "Station Pending Approval" on screen
           → polls GET /api/status?uuid=... every 10s

Admin opens CCC → sees device in Pending table
              → clicks Approve → enters PIN shown on kiosk screen
              → Firestore: status = "approved", secure_key generated

Kiosk detects "approved" → auto-pairs with new secure_key
                        → shows "Waiting for Connection"
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Backend health, approval mode, DB latency |
| POST | `/api/register` | Kiosk self-registers with uuid + pin |
| POST | `/api/approve` | Manual approval with PIN verification |
| POST | `/api/force-approve` | Force-approve without PIN (for re-registration / transfer) |
| GET | `/api/status?uuid=...` | Kiosk polls this every 10s |
| GET | `/api/pending` | List all pending devices |
| GET | `/api/approved` | List all approved devices |
| GET | `/api/disabled` | List all disabled devices |
| POST | `/api/disable` | Disable an approved device |
| POST | `/api/remove` | Delete device record from Firestore |
| POST | `/api/update-kiosk` | Update home_number or user_id on a device |

---

## Firestore Schema — `kiosks/{uuid}`

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Device hardware UUID |
| `pin` | string | 6-digit PIN shown on kiosk screen |
| `status` | string | `pending` / `approved` / `disabled` |
| `secure_key` | string | UUID generated on approval, used for WebRTC pairing |
| `home_number` | string | Human-readable device ID (e.g. HM-WACUP) |
| `user_id` | string | Firebase UID of linked client user |
| `firstSeen` | string | Timestamp of first registration |
| `lastSeen` | string | Timestamp of last status poll |
| `approvedAt` | string | Timestamp of approval |
| `expiresAt` | string | Approval expiry timestamp |
| `approvalMode` | string | `manual` or `auto` |
| `approvedVia` | string | `ccc-panel`, `ccc-force-reregister`, etc. |
| `claimed_at` | timestamp | When kiosk first claimed the approval |
| `disabledAt` | string | When device was disabled |
| `disabledReason` | string | Reason for disable |

---

## Disable vs Remove

| Action | Firestore Record | Kiosk Shows | Recoverable | Use When |
|--------|-----------------|-------------|-------------|----------|
| **Disable** | Kept (`status: disabled`) | "Access Revoked" | Yes — re-approve | Payment expired, temp block |
| **Remove** | Deleted | "Station Pending Approval" | Yes — re-register | Transfer to new user, factory reset |

> **Always prefer Disable** over Remove unless transferring to a new user.

---

## Device Release / Transfer Process

When transferring a device to a new client:
1. Click **Remove** on the device in CCC
2. Wait ~30 seconds — the kiosk will auto-register and appear in **Pending**
3. Click **Approve** from the Pending list (no manual UUID entry — prevents typos)
4. Update `user_id` to the new client's Firebase UID

> ⚠️ Do NOT use Quick Approve for transfers — it requires manual UUID entry and risks typos.

---

## Kiosk Device Facts

| Item | Value |
|------|-------|
| UUID source | `/home/maainhome/.uuid` |
| ENV file | `/home/maainhome/.env` (contains KIOSK_UUID, PERMANENT_SECURE_KEY) |
| Browser | Google Chrome in `--kiosk` mode |
| URL loaded | `https://www.maahome.in/home?secure_key=...&kiosk_uuid=...` |
| OS | Ubuntu 24.04 LTS (Lubuntu) |
| SSH user | `lubuntu` / password: `lubuntu` |
| AnyDesk | Installed for remote desktop access |

---

## UI Sections

- **Kiosk Overview** — Pending + Approved + Disabled device tables
- **Health Check** — Firestore connection, latency, approval mode
- **Security Keys** — List of all active secure keys per device
- **Analytics** — Device counts by status
- **System Settings** — Approval mode, duration settings

---

## Architecture

- **Backend:** Go serverless functions on Vercel (`api/` folder)
- **Database:** Cloud Firestore (REST API, no SDK)
- **Frontend:** Static HTML/CSS/JS served by Vercel
- **Auth:** No CCC admin auth currently — open dashboard (add login before multi-admin)