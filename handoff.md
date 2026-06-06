# MaainHome CCC — Handoff Document

**Last Updated: 2026-06-06**

---

## What Is Live Now

- Production URL: https://maainhome-ccc.vercel.app
- Kiosk registration via UUID + PIN works end-to-end
- Manual PIN approval from CCC panel works
- Force-approve (no PIN) works for re-registration and transfers
- Approval duration selectable in CCC (30/60/90 days)
- Approved devices listed with disable/remove/edit actions
- Firestore serialization bug fixed (empty PIN causing 400 errors)
- Kiosk auto-pairs on status approval — `secure_key` rotation supported
- `home_number` and `user_id` editable inline from CCC
- UUID mismatch bug diagnosed and fixed (2026-06-06)

---

## Known Bugs Fixed (2026-06-06 Session)

### 1. Firestore `INVALID_ARGUMENT` on force-approve
**Cause:** Empty `pin` field was being serialized as an empty `FirestoreValue{}` struct with no type set, which Firestore REST API rejects.
**Fix:** Made `pin` field conditional in `shared/firebase.go` — only included when non-empty.

### 2. Kiosk stuck in "pending" after force-approve
**Cause:** Admin force-approved with a slightly wrong UUID (`DBCAE01D8A17` instead of `D8CAE01D8A17`). The device's actual UUID is stored in `/home/maainhome/.uuid` and the Chrome launch command.
**Fix:** Re-ran force-approve with the correct UUID read directly from the kiosk device via SSH.

### 3. Kiosk not transitioning to "authorized" after CCC approval
**Cause:** `HomeStation.tsx` had `!hasBootstrappedRef.current` in the re-pair condition. This guard blocked re-pairing on subsequent polls even when CCC returned a new `secure_key`.
**Fix:** Removed `!hasBootstrappedRef.current` from the auto-pair condition — kiosk now always re-pairs when CCC key differs from stored key.

### 4. Electron kiosk loading from local build, not Vercel
**Cause:** `electron/main.js` was loading `https://localhost:5000` (local build). Vercel deploys had zero effect on physical kiosk.
**Fix:** Changed `main.js` to load `https://maainhome.in/home` with fallback to localhost. Needs kiosk rebuild to take effect.

---

## Current Architecture

```
[Kiosk Device]
  Chrome --kiosk --> https://www.maahome.in/home?secure_key=...&kiosk_uuid=...
  UUID from: /home/maainhome/.uuid
  ENV from:  /home/maainhome/.env

[CCC Admin]
  https://maainhome-ccc.vercel.app
  Static HTML/CSS/JS + Go API functions on Vercel
  Firestore (REST API) for device registry

[Firestore]
  kiosks/{uuid} — device status, secure_key, user_id, expiry
  calls/{secureKey} — WebRTC signaling
  profiles/{userId} — user profile data
  pairing_tokens/{code} — pairing QR codes
```

---

## Current API Surface

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | None | Health check |
| POST | `/api/register` | None | Kiosk self-register (uuid + pin) |
| POST | `/api/approve` | None | Approve with PIN match |
| POST | `/api/force-approve` | None | Force-approve/re-register without PIN |
| GET | `/api/status?uuid=` | None | Kiosk status poll |
| GET | `/api/pending` | None | List pending devices |
| GET | `/api/approved` | None | List approved devices |
| GET | `/api/disabled` | None | List disabled devices |
| POST | `/api/disable` | None | Disable device |
| POST | `/api/remove` | None | Delete device record |
| POST | `/api/update-kiosk` | None | Update home_number or user_id |

> ⚠️ All endpoints are currently unauthenticated. Add admin auth before public exposure.

---

## Device Release / Transfer SOP

**Correct transfer process (no UUID mismatch risk):**
1. Note the device's home_number and UUID from the Approved table
2. Click **Remove** — Firestore record deleted
3. Wait 30 seconds — kiosk auto-registers and appears in **Pending**
4. Click **Approve** from Pending table (UUID is exact — no typing)
5. Update `user_id` to new client's Firebase UID

**Never use Quick Approve for transfers** — manual UUID typing risks character mismatches.

---

## Kiosk Physical Device Info

| Property | Value |
|----------|-------|
| OS | Ubuntu 24.04 LTS (Lubuntu desktop) |
| Username | `lubuntu` |
| SSH | `ssh lubuntu@<IP>` / password: `lubuntu` |
| UUID file | `/home/maainhome/.uuid` |
| ENV file | `/home/maainhome/.env` |
| Kiosk scripts | `/home/maainhome/scripts/` |
| Chrome launch | `/home/maainhome/scripts/kiosk-init.sh` |
| AnyDesk | Installed (get ID via `anydesk --get-id`) |
| maainhome user | Has separate home dir at `/home/maainhome/` |

---

## WebRTC Signaling Architecture

All WebRTC signaling passes through **Firestore `calls/{secureKey}`** (no WebSocket server).

| Collection | Writer | Reader |
|-----------|--------|--------|
| `calls/{secureKey}` | Home + Remote | Home + Remote |
| `calls/{secureKey}/home_candidates` | Home Station | Remote Viewer |
| `calls/{secureKey}/remote_candidates` | Remote Viewer | Home Station |
| `profiles/{userId}` | Client app | Client app |
| `pairing_tokens/{code}` | Dashboard | Home Station |
| `call_logs/{docId}` | Client app | Dashboard |

---

## Open Items / Next Steps

See `BACKLOG.md` for the full prioritised backlog.

**Immediate next:**
1. Build **Devices** menu in CCC sidebar
2. Build **Transfer** button per device
3. Build **Admin Users** panel (recharge/balance/expiry)
4. Add **payment expiry auto-disable** job
5. Tighten Firestore security rules (currently open)

---

## Recent Commits

| SHA | Message |
|-----|---------|
| `973bfe5` | fix: always re-pair kiosk when CCC returns new secure_key |
| (force-approve) | fix: create fresh approved record when UUID not in Firestore |
| (firebase.go) | fix: make pin field optional to prevent 400 INVALID_ARGUMENT |
