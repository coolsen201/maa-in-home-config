# 🚀 MaainHome Cloud Control Center — Handoff Document

**Date:** April 8, 2026  
**Focus:** Backend Migration from Upstash/Redis to Firebase Firestore.

## 1. What Was Completed
- **Architecture Shift:** We deprecated Redis and successfully rewrote all CCC API handlers (`/api/register`, `/api/approve`, `/api/pending`, `/api/status`, `/api/health`) to use the official Google Firebase SDK (`firebase.google.com/go/v4`).
- **Code Refactoring:**
  - Added `shared/firebase.go` to securely parse credentials.
  - Used Firestore `.Set()`, `.Update()`, and `.Where()` querying equivalents instead of Redis key/set manipulation.
- **Deployment:** The code was pushed to the `main` branch on GitHub and successfully deployed via Vercel.
- **Environment:** The `FIREBASE_SERVICE_ACCOUNT` JSON key for `maainhome-ccc` was successfully added into the Vercel project environment variables.

## 2. Current Status (The Blocker)
When hitting the `https://maa-in-home-config.vercel.app/api/health` endpoint, it successfully authenticates your JSON credentials, but receives the following Google Cloud error when it tries to run a query:

```json
{
  "db": "auth_failed",
  "error": "Firestore query failed: rpc error: code = PermissionDenied desc = Missing or insufficient permissions.",
  "latency": 1722,
  "ok": false
}
```

### Why is this happening?
The Firebase Admin SDK automatically bypasses all database security rules. If it gets a `PermissionDenied` error, it almost always means:
1. **The Firestore Database hasn't been created yet.** Going to the Firebase Console → left sidebar → **Firestore Database** → clicking **"Create Database"** hasn't been completed.
2. **IAM Propagation Delay:** The service account was created *before* the Firestore database was initialized, and Google Cloud IAM is still propagating the "Datastore Owner" permissions to the service account (sometimes takes 5–10 minutes).

## 3. Next Steps When You Log Back In
1. Go to your [Firebase Console](https://console.firebase.google.com).
2. Open the **maainhome-ccc** project.
3. On the left sidebar, click **Build** -> **Firestore Database**.
4. If it asks you to **Create Database**, create one (Native mode, any location). 
5. Wait ~5 minutes, then visit `https://maa-in-home-config.vercel.app/api/health` again.
6. Once it says `{"db":"connected", "ok":true}`, your Kiosks are ready to pair!

*(All code and configurations are saved and pushed to GitHub. No further code edits are needed.)*
