import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'xenia.db');
const SCHEMA_PATH = path.resolve(process.cwd(), 'schema.sql');

export const db = new DatabaseSync(DB_PATH);

// Initialize tables if they don't exist
export function initDatabase() {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  // Check if patients table is empty, if so, seed initial data
  const count = db.prepare('SELECT COUNT(*) as cnt FROM patients').get().cnt;
  if (count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  console.log('Seeding initial SQL database with baseline records...');

  const insertPatient = db.prepare(`
    INSERT INTO patients (
      patient_code, name, initials, age, diagnosis, therapist, program,
      sessions_completed, total_planned, color, family_contact_name,
      relationship, timezone, email, objectives, family_access_revoked
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0
    )
  `);

  const initialPatients = [
    { name: 'Ramesh Kumar', id: 'XN-1042', initials: 'RK', age: 68, diagnosis: 'Post-stroke rehabilitation', therapist: 'Dr. Ananya Rao', program: 'Neurological rehabilitation', sessions: 18, total: 30, color: 'sage', family: 'Priya Kumar', relationship: 'Daughter', timezone: 'Europe/London', email: 'priya@example.com', objectives: 'Improve mobility, balance, and independence with clinician-guided exercises.' },
    { name: 'Meera Nair', id: 'XN-1043', initials: 'MN', age: 54, diagnosis: 'Total knee replacement', therapist: 'Dr. Vikram Shah', program: 'Orthopedic rehabilitation', sessions: 9, total: 24, color: 'peach', family: 'Arjun Nair', relationship: 'Son', timezone: 'America/New_York', email: 'arjun@example.com', objectives: 'Restore full knee flexion and quadriceps strength for independent walking.' },
    { name: 'Joseph Thomas', id: 'XN-1044', initials: 'JT', age: 72, diagnosis: 'Balance & gait impairment', therapist: 'Dr. Sara Joseph', program: 'Geriatric rehabilitation', sessions: 12, total: 20, color: 'lavender', family: 'Anna Thomas', relationship: 'Daughter', timezone: 'Asia/Dubai', email: 'anna@example.com', objectives: 'Reduce fall risks and improve static & dynamic postural stability.' },
    { name: 'Lakshmi Iyer', id: 'XN-1045', initials: 'LI', age: 61, diagnosis: 'Chronic lower back pain', therapist: 'Dr. Ananya Rao', program: 'Musculoskeletal rehabilitation', sessions: 6, total: 16, color: 'sand', family: 'Karthik Iyer', relationship: 'Son', timezone: 'Asia/Kolkata', email: 'karthik@example.com', objectives: 'Strengthen core stability muscles and relieve movement discomfort.' }
  ];

  for (const p of initialPatients) {
    insertPatient.run(
      p.id, p.name, p.initials, p.age, p.diagnosis, p.therapist, p.program,
      p.sessions, p.total, p.color, p.family, p.relationship, p.timezone, p.email, p.objectives
    );
  }

  const insertSession = db.prepare(`
    INSERT INTO sessions (
      patient_id, treatment, time, duration, status, room,
      start_timestamp, paused_duration_ms, actual_duration, notes, events_json, activities_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialSessions = [
    { patient_id: 1, treatment: 'Gait & mobility training', time: '09:00', duration: 45, status: 'In Progress', room: 'Therapy room 01', start: Date.now() - 22 * 60000, events: ['08:50 · Patient checked in', '09:00 · Session started'], activities: ['Assisted walking', 'Balance exercises', 'Sit-to-stand training'] },
    { patient_id: 2, treatment: 'Knee mobility & strengthening', time: '09:30', duration: 45, status: 'Checked In', room: 'Therapy room 02', start: null, events: ['09:15 · Patient checked in'], activities: ['Range of motion', 'Quadriceps strengthening'] },
    { patient_id: 3, treatment: 'Balance & coordination', time: '10:00', duration: 30, status: 'Scheduled', room: 'Rehab studio', start: null, events: ['04 Nov · Session scheduled'], activities: ['Standing balance', 'Step training'] },
    { patient_id: 4, treatment: 'Manual therapy & core stability', time: '10:30', duration: 45, status: 'Delayed', room: 'Therapy room 01', start: null, events: ['09:10 · Delayed by 15 minutes; room unavailable'], activities: ['Core activation', 'Gentle stretching'] },
    { patient_id: 1, treatment: 'Functional activity training', time: '11:30', duration: 30, status: 'Scheduled', room: 'Rehab studio', start: null, events: ['04 Nov · Session scheduled'], activities: ['Daily living activities'] },
    { patient_id: 3, treatment: 'Morning mobility', time: '08:00', duration: 30, status: 'Completed', room: 'Rehab studio', start: null, actual: 30, events: ['08:00 · Started', '08:30 · Completed'], activities: ['Assisted walking'] }
  ];

  for (const s of initialSessions) {
    insertSession.run(
      s.patient_id, s.treatment, s.time, s.duration, s.status, s.room,
      s.start || null, 0, s.actual || null, '', JSON.stringify(s.events), JSON.stringify(s.activities)
    );
  }

  const insertReport = db.prepare(`
    INSERT INTO reports (patient_id, title, type, status, report_date, note)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const initialReports = [
    { patient_id: 1, title: 'Weekly rehabilitation review', type: 'Weekly report', status: 'Awaiting approval', date: '05 Nov 2026', note: 'Walking distance improved from 10 m to 35 m with a walking aid. Patient tolerated balance exercises well.' },
    { patient_id: 2, title: 'Session summary', type: 'Treatment summary', status: 'Approved', date: '04 Nov 2026', note: 'Knee flexion measured at 95°. Continue prescribed mobility exercises within tolerance.' },
    { patient_id: 1, title: 'Initial clinical assessment', type: 'Assessment', status: 'Approved', date: '12 Oct 2026', note: 'Baseline: assisted walking distance 10 m, pain score 7/10, knee flexion 70°. Treatment plan reviewed by consultant.' }
  ];

  for (const r of initialReports) {
    insertReport.run(r.patient_id, r.title, r.type, r.status, r.date, r.note);
  }

  const insertNotification = db.prepare(`
    INSERT INTO notifications (title, text, channel, status, notification_time)
    VALUES (?, ?, ?, ?, ?)
  `);

  const initialNotifications = [
    { title: 'Session started', text: 'Ramesh Kumar · Gait & mobility training', channel: 'WhatsApp', status: 'Delivered', time: '09:00' },
    { title: 'Weekly report ready for review', text: 'Dr. Ananya Rao submitted a report', channel: 'In-app', status: 'Pending review', time: '08:45' },
    { title: 'Schedule updated', text: 'Lakshmi Iyer · revised start 10:45', channel: 'SMS', status: 'Delivered', time: '09:10' }
  ];

  for (const n of initialNotifications) {
    insertNotification.run(n.title, n.text, n.channel, n.status, n.time);
  }

  const insertGoal = db.prepare(`
    INSERT INTO clinical_goals (patient_id, label, baseline_value, current_value, target_value, progress_percentage)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const initialGoals = [
    { patient_id: 1, label: 'Assisted walking distance', base: '10 m', cur: '35 m', tgt: '50 m', pct: 62 },
    { patient_id: 1, label: 'Pain during movement', base: '7 / 10', cur: '4 / 10', tgt: '≤ 3 / 10', pct: 75 },
    { patient_id: 1, label: 'Knee flexion range', base: '70°', cur: '95°', tgt: '110°', pct: 63 }
  ];

  for (const g of initialGoals) {
    insertGoal.run(g.patient_id, g.label, g.base, g.cur, g.tgt, g.pct);
  }

  console.log('Database seeded successfully.');
}

