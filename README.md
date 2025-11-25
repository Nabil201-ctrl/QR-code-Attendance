# QR-code-Attendance

A simple QR-code based attendance system with an Admin web app to generate QR codes (with purposes), and a Student web app to scan and submit attendance. Backend is an Express API using MongoDB.

---

## Repo structure

- `backend/` — Express server, MongoDB models, routes, validation middleware.
- `admin-app/` — Vite + React admin UI used to generate QR codes, manage students and view attendance.
- `student-app/` — Vite + React student UI for scanning QR codes and submitting attendance.

---

## Features

- Admin can generate QR codes with an expiration and a "purpose" (e.g., Programming, Meeting, Reading).
- Students scan a QR code, enter name and matric number, and submit attendance.
- Device fingerprinting to reduce duplicate submissions from the same device.
- Backend validates QR expiry and prevents duplicate attendance for a day.
- Admin dashboard shows attendance per date and the associated purpose for each session.

---

## Prerequisites

- Node.js (v16+ recommended)
- npm (or yarn)
- MongoDB (local or remote)

---

## Environment variables

Backend (create `backend/.env`):

```
MONGODB_URI=mongodb://localhost:27017/qr-attendance
PORT=4000
ADMIN_USERNAME=admin
ADMIN_PASSKEY=changeme
```

Admin app (create `admin-app/.env` — Vite expects `VITE_` prefix):

```
VITE_API_BASE_URL=http://localhost:4000
```

Student app (create `student-app/.env`):

```
VITE_API_BASE_URL=http://localhost:4000
```

Note: If your frontends use a different variable shape, update accordingly. The apps look for an API base URL via the `VITE_API_BASE_URL` environment variable.

---

## Quick start

1. Start the backend

```bash
cd backend
npm install
npm run start
```

2. Start the admin app (for generating QR codes and viewing attendance)

```bash
cd admin-app
npm install
npm run start
```

3. Start the student app (for scanning & submitting)

```bash
cd student-app
npm install
npm run start
```

Open the admin app (usually http://localhost:5173) and the student app (similar port) as shown by Vite.

---

## How to use

- Admin: Generate a QR code from the Admin UI (`Generate QR`) — choose an expiration and enter a purpose (e.g., "Programming practice"). Share or display the generated QR code for students to scan.
- Student: In the Student app, allow camera permission, scan the QR, fill in `Full Name` and `Matric Number` (e.g., `23/208CSC/586`), then submit.
- If a QR code has expired the backend will return a clear error and the student UI will show an "Expired QR" popup and a penalty-warning confirmation if they try to re-scan.

---

## Purpose field & how it appears in the UI

- Each QR has a `purpose` string that describes the session (e.g., "Reading", "Meeting", "Prep").
- The backend stores `purpose` with QR code documents and also attaches `purpose` info to the attendance list response.
- In the Admin Dashboard, each date column now shows the date and the `purpose` underneath. There is also a small summary of purposes shown under the daily stats.

Notes:
- The server chooses a QR code created on the same day to determine the day's purpose. If multiple QR codes exist on the same day, the most recent QR's purpose is used for that date in the summary.
- If older QR documents lack a purpose, the UI displays `General` for that date.

---

## Database & migrations

- The code added a required `purpose` field to the `QrCode` model. If you have existing QR documents without a `purpose`, either:
  - Update them manually in MongoDB to include a purpose value, or
  - Change the schema to make `purpose` optional, or
  - Run a migration script to set a default purpose for existing docs.

If you want, I can add a small migration script to set `purpose: 'General'` for existing QR documents.

---

## Troubleshooting

- Blank screen after scan: Ensure the backend is running and reachable. Camera permission issues will prevent scanning. The student app now uses a safer scanner start/stop lifecycle to avoid race conditions, but browser console logs are the fastest way to debug if issues persist.
- CORS issues: Backend enables CORS for dynamic origins. If you have issues, check the browser console and backend logs.
- Backend errors: The backend now returns JSON errors with a `message` property. The frontends parse these and show friendly messages.

---

## Development tips

- To quickly test expiry/expired flows, create a QR with a short expiry (e.g., 10 seconds) and try submitting after it expires.
- To test purpose categories, generate multiple QR codes across dates with different purposes and refresh the Admin Dashboard.

---

## Suggested follow-ups

- Add server-side auditing for expired rescan attempts.
- Add filtering or per-purpose reporting in the Admin UI.
- Add automated tests for the scanner lifecycle and attendance submission.

---

If you want, I can also add a migration script to populate `purpose` for existing QR docs, or wire up server-side logging for penalty attempts. Tell me which follow-up you want next.
