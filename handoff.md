# MaainHome CCC Handoff
**Last Updated: 19 April 2026**

## What Is Live Now
- Production URL: https://maainhome-ccc.vercel.app
- First-boot station registration works through CCC.
- Manual approval with PIN verification works.
- Approval duration can be selected in CCC.
- Approval expiry is persisted as `expiresAt`.
- Expired approvals auto-transition to `disabled`.
- Approved devices are visible in the panel.
- Approved devices can be disabled or removed.
- Sidebar sections now switch views on the live page.
- Static UI routing on Vercel is fixed.

## Current Architecture
- Backend: Go functions deployed on Vercel
- Storage: Firestore via REST API
- Frontend: static HTML, CSS, JS served by Vercel

## Current API Surface
- `GET /api/health`
- `POST /api/register`
- `POST /api/approve`
- `GET /api/status?uuid=...`
- `GET /api/pending`
- `GET /api/approved`
- `GET /api/disabled`
- `POST /api/disable`
- `POST /api/remove`

## Current Approval Model
- Stations self-register automatically.
- CCC approval is human-only by default.
- Secure key is generated on approval and retained for the device.
- Re-registering an already approved station returns the existing key instead of resetting the record.

## Current Audit Metadata Stored In Firestore
- `firstSeen`
- `lastSeen`
- `approvedAt`
- `expiresAt`
- `approvalMode`
- `approvedVia`
- `disabledAt`
- `disabledReason`

---

## WebRTC Signaling — Important Architecture Note

**As of 19 April 2026**, the client application (`maahome.in`) no longer uses a WebSocket server for WebRTC signaling. The previous WebSocket server at `wss://api.maahome.in/ws` has been fully decommissioned.

**Current approach**: All WebRTC signaling (offer, answer, ICE candidates) passes through the **Firestore `calls/{secureKey}` collection** via real-time `onSnapshot` listeners. Video and audio data itself travels directly peer-to-peer between devices and never passes through Firebase or any server.

### Firestore Collections Used by Client App
| Collection | Written By | Read By |
|---|---|---|
| `profiles/{userId}` | Client app on register | Client app on login |
| `pairing_tokens/{code}` | Dashboard (QR generator) | Home Station (pairing) |
| `calls/{secureKey}` | Home Station + Remote | Home Station + Remote |
| `calls/{secureKey}/home_candidates` | Home Station | Remote Viewer |
| `calls/{secureKey}/remote_candidates` | Remote Viewer | Home Station |
| `call_logs/{docId}` | Client app (on call end) | Dashboard / Call History |

### Required Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /pairing_tokens/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /call_logs/{document} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
    match /calls/{secureKey} {
      allow read, write: if request.auth != null;
      match /home_candidates/{candidate} {
        allow read, write: if request.auth != null;
      }
      match /remote_candidates/{candidate} {
        allow read, write: if request.auth != null;
      }
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## What Is Still Open
- Real hardware verification of the expiry loop is still pending.
- Re-enable flow for disabled devices is not yet in CCC UI.

## Related Device-Side Folder
- See `/home/senthil/websites/maainhome.in/README.md` for the station-side flow.
- See `/home/senthil/websites/maainhome.in/FIREBASE_SETUP.md` for full Firebase setup and WebRTC signaling documentation.

## Recent Relevant Commits (maainhome.in)
- `35e68a4` feat: replace WebSocket signaling with Firebase Firestore for WebRTC — fix React hook order crash
- `fb08fa9` docs: add comprehensive Firebase migration and setup guide
- `b0b7b29` fix: remove /admin from SmartRedirect auth guard
- `890c8c6` fix: add PIN gate on /admin

## Next Recommended Steps
1. Test live video call between `/home` and `/remote`.
2. Test real station with 1-day approval window — verify expiry loop clears local .env.
3. Add "Re-enable device" button in CCC panel.
