import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { initDatabase, db } from './db.mjs';

const root = process.cwd();

// Initialize dynamic SQLite database
initDatabase();

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

// Router for API endpoints
async function handleApi(req, res, url) {
  const method = req.method;
  const pathname = url.pathname;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }).end();
    return true;
  }

  // 1. GET /api/data - Full state for app synchronization
  if (pathname === '/api/data' && method === 'GET') {
    const rawPatients = db.prepare('SELECT * FROM patients ORDER BY id ASC').all();
    const familyMembers = db.prepare('SELECT * FROM family_members').all();
    
    // Map database models to UI expectations
    const patientList = rawPatients.map((p, index) => {
      const additional = familyMembers
        .filter(f => f.patient_id === p.id)
        .map(f => ({
          name: f.name,
          relationship: f.relationship,
          email: f.email,
          phone: f.phone,
          timezone: f.timezone
        }));

      return {
        dbId: p.id,
        name: p.name,
        id: p.patient_code,
        initials: p.initials,
        age: p.age,
        diagnosis: p.diagnosis,
        therapist: p.therapist,
        program: p.program,
        sessions: p.sessions_completed,
        total: p.total_planned,
        color: p.color,
        family: p.family_contact_name,
        relationship: p.relationship,
        timezone: p.timezone,
        email: p.email,
        objectives: p.objectives,
        revoked: Boolean(p.family_access_revoked),
        additionalFamily: additional
      };
    });

    const rawSessions = db.prepare('SELECT * FROM sessions ORDER BY time ASC').all();
    const sessionList = rawSessions.map(s => {
      const pIdx = patientList.findIndex(p => p.dbId === s.patient_id);
      return {
        id: s.id,
        patient: pIdx !== -1 ? pIdx : 0,
        patientDbId: s.patient_id,
        treatment: s.treatment,
        time: s.time,
        duration: s.duration,
        status: s.status,
        room: s.room,
        start: s.start_timestamp,
        pausedAt: s.paused_at_timestamp,
        pausedMs: s.paused_duration_ms || 0,
        actual: s.actual_duration,
        notes: s.notes || '',
        events: JSON.parse(s.events_json || '[]'),
        activities: JSON.parse(s.activities_json || '[]'),
        done: JSON.parse(s.done_activities_json || '[]')
      };
    });

    const rawReports = db.prepare('SELECT * FROM reports ORDER BY id DESC').all();
    const reportList = rawReports.map(r => {
      const pIdx = patientList.findIndex(p => p.dbId === r.patient_id);
      return {
        id: r.id,
        patient: pIdx !== -1 ? pIdx : 0,
        patientDbId: r.patient_id,
        title: r.title,
        type: r.type,
        status: r.status,
        date: r.report_date,
        note: r.note
      };
    });

    const notifications = db.prepare('SELECT * FROM notifications ORDER BY id DESC').all().map(n => ({
      id: n.id,
      title: n.title,
      text: n.text,
      channel: n.channel,
      status: n.status,
      time: n.notification_time
    }));

    const goals = db.prepare('SELECT * FROM clinical_goals').all().map(g => {
      const pIdx = patientList.findIndex(p => p.dbId === g.patient_id);
      return {
        id: g.id,
        patient: pIdx !== -1 ? pIdx : 0,
        patientDbId: g.patient_id,
        label: g.label,
        baseline: g.baseline_value,
        current: g.current_value,
        target: g.target_value,
        width: g.progress_percentage
      };
    });

    sendJson(res, 200, {
      patients: patientList,
      sessions: sessionList,
      reports: reportList,
      notifications,
      goals
    });
    return true;
  }

  // 2. POST /api/sessions - Create dynamic session
  if (pathname === '/api/sessions' && method === 'POST') {
    const body = await parseBody(req);
    const stmt = db.prepare(`
      INSERT INTO sessions (
        patient_id, treatment, time, duration, status, room,
        start_timestamp, paused_duration_ms, actual_duration, notes, events_json, activities_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const events = body.events || [`${body.time} IST · Session scheduled`];
    const activities = body.activities || ['General rehabilitation activities'];
    const info = stmt.run(
      body.patient_id,
      body.treatment,
      body.time,
      body.duration || 45,
      body.status || 'Scheduled',
      body.room || 'Therapy room 01',
      body.start || null,
      0,
      null,
      body.notes || '',
      JSON.stringify(events),
      JSON.stringify(activities)
    );
    sendJson(res, 201, { success: true, id: Number(info.lastInsertRowid) });
    return true;
  }

  // 3. PATCH /api/sessions/:id - Update session status / notes / times
  const sessionMatch = pathname.match(/^\/api\/sessions\/(\d+)$/);
  if (sessionMatch && method === 'PATCH') {
    const id = Number(sessionMatch[1]);
    const body = await parseBody(req);

    const current = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
    if (!current) {
      sendJson(res, 404, { error: 'Session not found' });
      return true;
    }

    const updated = {
      treatment: body.treatment !== undefined ? body.treatment : current.treatment,
      time: body.time !== undefined ? body.time : current.time,
      duration: body.duration !== undefined ? body.duration : current.duration,
      status: body.status !== undefined ? body.status : current.status,
      room: body.room !== undefined ? body.room : current.room,
      start_timestamp: body.start !== undefined ? body.start : current.start_timestamp,
      paused_at_timestamp: body.pausedAt !== undefined ? body.pausedAt : current.paused_at_timestamp,
      paused_duration_ms: body.pausedMs !== undefined ? body.pausedMs : current.paused_duration_ms,
      actual_duration: body.actual !== undefined ? body.actual : current.actual_duration,
      notes: body.notes !== undefined ? body.notes : current.notes,
      events_json: body.events ? JSON.stringify(body.events) : current.events_json,
      activities_json: body.activities ? JSON.stringify(body.activities) : current.activities_json,
      done_activities_json: body.done ? JSON.stringify(body.done) : current.done_activities_json
    };

    db.prepare(`
      UPDATE sessions SET
        treatment = ?, time = ?, duration = ?, status = ?, room = ?,
        start_timestamp = ?, paused_at_timestamp = ?, paused_duration_ms = ?,
        actual_duration = ?, notes = ?, events_json = ?, activities_json = ?, done_activities_json = ?
      WHERE id = ?
    `).run(
      updated.treatment, updated.time, updated.duration, updated.status, updated.room,
      updated.start_timestamp, updated.paused_at_timestamp, updated.paused_duration_ms,
      updated.actual_duration, updated.notes, updated.events_json, updated.activities_json, updated.done_activities_json,
      id
    );

    // If session was completed, optionally increment patient completed sessions count
    if (body.status === 'Completed' && current.status !== 'Completed') {
      db.prepare(`
        UPDATE patients SET sessions_completed = MIN(total_planned, sessions_completed + 1)
        WHERE id = ?
      `).run(current.patient_id);
    }

    sendJson(res, 200, { success: true, id });
    return true;
  }

  // 4. POST /api/reports - Create report (e.g. session summary or observation)
  if (pathname === '/api/reports' && method === 'POST') {
    const body = await parseBody(req);
    const stmt = db.prepare(`
      INSERT INTO reports (patient_id, title, type, status, report_date, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      body.patient_id,
      body.title,
      body.type || 'Treatment summary',
      body.status || 'Awaiting approval',
      body.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      body.note || ''
    );
    sendJson(res, 201, { success: true, id: Number(info.lastInsertRowid) });
    return true;
  }

  // 5. PATCH /api/reports/:id - Approve or update report
  const reportMatch = pathname.match(/^\/api\/reports\/(\d+)$/);
  if (reportMatch && method === 'PATCH') {
    const id = Number(reportMatch[1]);
    const body = await parseBody(req);
    if (body.status) {
      db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(body.status, id);
    }
    sendJson(res, 200, { success: true, id });
    return true;
  }

  // 6. PATCH /api/patients/:id - Update plan, family revocation, or details
  const patientMatch = pathname.match(/^\/api\/patients\/(\d+)$/);
  if (patientMatch && method === 'PATCH') {
    const id = Number(patientMatch[1]);
    const body = await parseBody(req);

    if (body.revoked !== undefined) {
      db.prepare('UPDATE patients SET family_access_revoked = ? WHERE id = ?').run(body.revoked ? 1 : 0, id);
    }
    if (body.program || body.total !== undefined || body.objectives !== undefined) {
      const p = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
      db.prepare(`
        UPDATE patients SET
          program = ?, total_planned = ?, objectives = ?
        WHERE id = ?
      `).run(
        body.program || p.program,
        body.total !== undefined ? body.total : p.total_planned,
        body.objectives !== undefined ? body.objectives : p.objectives,
        id
      );
    }
    sendJson(res, 200, { success: true, id });
    return true;
  }

  // 7. POST /api/patients/:id/family - Link additional family member
  const familyMatch = pathname.match(/^\/api\/patients\/(\d+)\/family$/);
  if (familyMatch && method === 'POST') {
    const patient_id = Number(familyMatch[1]);
    const body = await parseBody(req);
    const stmt = db.prepare(`
      INSERT INTO family_members (patient_id, name, relationship, email, phone, timezone, consent_recorded)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      patient_id,
      body.name,
      body.relationship,
      body.email,
      body.phone || null,
      body.timezone || 'Asia/Kolkata',
      body.consent ? 1 : 1
    );
    sendJson(res, 201, { success: true, id: Number(info.lastInsertRowid) });
    return true;
  }

  // 8. POST /api/notifications - Store communication/notifications
  if (pathname === '/api/notifications' && method === 'POST') {
    const body = await parseBody(req);
    const stmt = db.prepare(`
      INSERT INTO notifications (title, text, channel, status, notification_time)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      body.title,
      body.text,
      body.channel || 'In-app',
      body.status || 'Delivered',
      body.time || 'Now'
    );
    sendJson(res, 201, { success: true, id: Number(info.lastInsertRowid) });
    return true;
  }

  return false;
}

// HTTP Server
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');

    // Handle REST API routes
    if (url.pathname.startsWith('/api/')) {
      const handled = await handleApi(req, res, url);
      if (handled) return;
    }

    // Serve static files
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }

    const data = await readFile(file);
    const ext = file.split('.').pop();
    const contentType = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'text/javascript',
      'png': 'image/png',
      'svg': 'image/svg+xml',
      'json': 'application/json'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.end(data);
  } catch (err) {
    res.writeHead(404).end('Not found');
  }
}).listen(5173, '127.0.0.1', () => {
  console.log('Xenia ERP SQL-backed server live: http://127.0.0.1:5173');
});
