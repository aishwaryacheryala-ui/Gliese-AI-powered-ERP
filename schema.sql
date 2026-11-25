-- ============================================================================
-- Xenia Care ERP Database Schema (SQLite & Standard SQL Compatible)
-- ============================================================================

-- Enable foreign keys (for SQLite)
PRAGMA foreign_keys = ON;

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_code TEXT UNIQUE NOT NULL,      -- e.g. 'XN-1042'
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    age INTEGER NOT NULL,
    diagnosis TEXT NOT NULL,
    therapist TEXT NOT NULL,
    program TEXT NOT NULL,
    sessions_completed INTEGER NOT NULL DEFAULT 0,
    total_planned INTEGER NOT NULL DEFAULT 20,
    color TEXT NOT NULL DEFAULT 'sage',
    family_contact_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    email TEXT,
    phone TEXT,
    objectives TEXT,
    family_access_revoked INTEGER NOT NULL DEFAULT 0, -- 0 = Active, 1 = Revoked
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    treatment TEXT NOT NULL,
    time TEXT NOT NULL,                     -- HH:MM (IST)
    duration INTEGER NOT NULL DEFAULT 45,   -- in minutes
    status TEXT NOT NULL DEFAULT 'Scheduled', -- 'Scheduled','In Progress','Paused','Completed','Delayed','Cancelled', etc.
    room TEXT NOT NULL,
    start_timestamp INTEGER,                -- Epoch ms
    paused_at_timestamp INTEGER,            -- Epoch ms
    paused_duration_ms INTEGER DEFAULT 0,
    actual_duration INTEGER,                -- in minutes
    notes TEXT DEFAULT '',
    events_json TEXT DEFAULT '[]',          -- JSON array of event logs
    activities_json TEXT DEFAULT '[]',      -- JSON array of activities
    done_activities_json TEXT DEFAULT '[]', -- JSON array of checked activity indices
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 3. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,                     -- 'Weekly report', 'Treatment summary', 'Assessment', 'Observation'
    status TEXT NOT NULL DEFAULT 'Awaiting approval', -- 'Awaiting approval', 'Approved'
    report_date TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 4. Notifications & Activity Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'In-app',  -- 'In-app', 'WhatsApp', 'SMS', 'Email'
    status TEXT NOT NULL DEFAULT 'Delivered',
    notification_time TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Additional Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    consent_recorded INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 6. Clinical Goals Table
CREATE TABLE IF NOT EXISTS clinical_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    baseline_value TEXT NOT NULL,
    current_value TEXT NOT NULL,
    target_value TEXT NOT NULL,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

