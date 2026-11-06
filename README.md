# Xenia Care Workspace

A frontend demo based on the Patient Treatment Tracking & Family Monitoring PRD. No backend, database, login, real patient data, or external messaging services.

## Run

```sh
npm run dev
```

Open http://127.0.0.1:5173. Node.js 18+ is sufficient; there are no dependencies to install. All demo changes stay in memory and reset on refresh. Google Fonts is optional; system fonts are used offline.

## Demo walkthrough

1. Explore the overview and open the live Ramesh Kumar session.
2. Pause/resume, record observations, and complete the session.
3. Open Reports & approvals and approve the generated session summary.
4. Open Family portal to see the approved summary and updated session status.
5. Explore Patients & families to register a patient, link family members, and revoke/restore demo access.
6. Use Schedule to switch calendar views, add sessions, and demonstrate conflict detection.
7. Explore Treatment plans, Goals & progress, and Communication for the other modules.

Family portal is a presentation mode in the same app, not an authentication or security boundary. Clinical values, contacts, reports and delivery statuses are fictional examples. No notification, invite, callback or query leaves the browser.

## Deploy on Vercel

Import this repository with the project root set to the repository root. The included `vercel.json` selects the static build, runs `npm run build`, and serves `dist/`. `server.mjs` is for local preview only and is not deployed. No environment variables or database are needed.
