# MaainHome CCC

Current Cloud Control Center for first-boot station approval.

## Live URL
- https://maainhome-ccc.vercel.app

## Current Flow
1. A station boots for the first time and connects to Wi-Fi.
2. The station posts `uuid` and `pin` to `POST /api/register`.
3. CCC shows the station in Pending Registrations.
4. A human approves from the CCC panel by entering the same 6-digit PIN shown on the station screen.
5. CCC stores a generated `secure_key` in Firestore.
6. The station polls `GET /api/status?uuid=...` until it receives `approved` and the `secure_key`.

## Current Backend Routes
- `GET /api/health`: backend health and approval mode
- `POST /api/register`: first-boot station registration
- `POST /api/approve`: manual approval with PIN verification
- `GET /api/status?uuid=...`: station polling endpoint
- `GET /api/pending`: pending registrations
- `GET /api/approved`: approved devices
- `GET /api/disabled`: disabled devices
- `POST /api/disable`: mark an approved station as disabled
- `POST /api/remove`: remove a station record from Firestore

## Current UI Sections
- Kiosk Overview
- Health Check
- Security Keys
- Analytics
- System Settings

## Current Data Stored Per Station
- `uuid`
- `pin`
- `status`
- `secure_key`
- `lastSeen`
- `firstSeen`
- `approvedAt`
- `expiresAt`
- `approvalMode`
- `approvedVia`
- `disabledAt`
- `disabledReason`

## Approval Behavior
- Default mode is manual.
- Approval mode is controlled by `APPROVAL_MODE`.
- Supported values:
  - `manual`
  - `auto`
- Current production behavior is manual approval.

## Recent Changes
- Added approved device listing in the panel.
- Added disable and remove actions.
- Added approval duration selection in CCC.
- Added expiry metadata and automatic disable for expired approvals.
- Added backend audit fields for approvals.
- Made approved devices idempotent on re-registration.
- Fixed Vercel routing so the static CCC UI is served correctly.
- Activated the sidebar sections so they now switch views on the live page.

## Firestore Notes
- Current implementation uses Firestore REST endpoints directly.
- Firestore rules are still permissive and should be tightened later if the project expands.

## Office Login Notes
- The existing `handoff.md` was replaced with current truth.
- If GitHub is behind production, check local `git log` first before assuming Vercel and GitHub match.

## Immediate Next Work
1. Verify the full expiry loop on a real kiosk using a short retention window.
2. Decide whether disabled devices should be re-enabled in CCC or always re-register.
3. Tighten Firestore rules when the flow stabilizes.
4. Push the latest local commits if GitHub is behind the live deployment.