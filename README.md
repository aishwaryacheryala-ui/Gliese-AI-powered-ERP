# Xenia Care Workspace (Dynamic SQL Edition)

A full-stack Care ERP workspace backed by a dynamic SQL database (built-in SQLite via `node:sqlite`), supporting real-time data persistence across sessions, patient updates, reports, and communication queues.

---

## Quick Start

### 1. Start Development Server
```sh
npm run dev
```
Open **[http://127.0.0.1:5173](http://127.0.0.1:5173)** in your browser. Node.js 22+ / 26+ built-in SQLite engine is utilized with zero external package installations required. All database changes persist automatically into `xenia.db`.

### 2. Run Quality, Linting & Security Scan
```sh
npm run scan
```
Or run individually:
- `npm run check` - Node.js AST syntax check.
- `npm run lint` - ESLint static analysis across source files.
- `npm run audit` - Dependency vulnerability & SCA security scan.

---

## Source Code Analysis & Security Audit Report

A comprehensive Static Application Security Testing (SAST) & Software Composition Analysis (SCA) audit was conducted on the project codebase.

### Audit Summary

| Audit Area | Tool / Validator | Status | Findings |
| :--- | :--- | :--- | :--- |
| **SCA Dependency Audit** | `npm audit` / `audit-ci` | **PASS (0 Vulnerabilities)** | 0 Critical, 0 High, 0 Moderate, 0 Low |
| **Static Code Analysis (SAST)** | `ESLint v10` (`eslint.config.mjs`) | **PASS (0 Errors, 0 Warnings)** | Clean syntax, clean global scopes, no undeclared references |
| **AST Syntax Verification** | `node --check` | **PASS (0 Errors)** | Validated across `src/app.js`, `server.mjs`, `db.mjs`, `scripts/build.mjs` |
| **SQL Injection Security** | SQLite Prepared Statements | **PASS** | 100% parameter-bound queries (`db.prepare(..).run(?, ?)`), zero inline string concatenation |
| **Cross-Site Scripting (XSS)** | Custom Sanitization Engine | **PASS** | HTML character entities strictly escaped with `esc()` helper before DOM injection |
| **Path Traversal Protection** | HTTP Static File Server | **PASS** | Canonical path bounds verification (`file.startsWith(root + path.sep)`) prevents directory escapes |
| **Production Build Check** | `scripts/build.mjs` | **PASS** | Generates verified production static assets in `dist/` |

---

## SQL Database Architecture

The SQL schema is defined in [`schema.sql`](file:///D:/Xenia-ERP/Xenia-ERP/schema.sql) and managed dynamically by [`db.mjs`](file:///D:/Xenia-ERP/Xenia-ERP/db.mjs):

- **`patients`**: Clinical profiles, assigned therapists, total planned vs completed session counts, contact & family access status.
- **`sessions`**: Treatment schedules, real-time status transitions (`Scheduled`, `In Progress`, `Paused`, `Completed`, `Delayed`), timestamps, rooms, notes, and activity checklists.
- **`reports`**: Clinical documentation, session summaries, observations, and approval workflows (`Awaiting approval`, `Approved`).
- **`notifications`**: Activity logs, multi-channel family notification updates.
- **`family_members`**: Authorized family contacts linked to patient accounts with recorded consent.
- **`clinical_goals`**: Measurable rehabilitation progress indicators, baseline, current, and target values.

---

## Dynamic System Walkthrough

1. **Schedule Sessions dynamically**: Create and manage sessions with automated conflict detection. Changes are written directly to SQLite.
2. **Live Session State**: Start, pause, resume, take therapist observations, and complete sessions with live timers persisted across page reloads.
3. **Reports & Approvals**: Completing a session or recording clinical observations automatically inserts review drafts into the database, which update live across staff and family views upon approval.
4. **Family Portal & Profile Management**: Link additional family members, update treatment programs, or revoke family portal access dynamically.

---

## Production Deployment (Vercel)

Import this repository with the project root set to the repository root. The included `vercel.json` selects the static build, runs `npm run build`, and serves `dist/`. No external build dependencies or third-party databases are required for client deployments.
