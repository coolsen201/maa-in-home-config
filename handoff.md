# MaainHome CCC Handoff

Updated on 10 April 2026.

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

## What Is Still Open
- Real hardware verification of the expiry loop is still pending.
- Firestore rules are still permissive.
- GitHub may be behind the live deployment if network resolution blocks the final push.

## Related Device-Side Folder
- See `/home/senthil/websites/maainhome.in/README.md` for the station-side flow and pending work.

## Recent Relevant Commits
- `0b91528` feat: activate control center sidebar views
- `ebbfdb8` feat: manage approved devices in control center
- `6053727` fix: harden approval flow and vercel routing

## Next Recommended Step
1. Test a real station with a 1-day approval window.
2. Confirm the device clears local registration and re-enters PIN approval after expiry.
3. Decide whether to expose a disabled-device re-enable flow in CCC.
