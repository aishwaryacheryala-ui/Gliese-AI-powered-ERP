const icons={dashboard:'▦',patients:'♧',plans:'▤',schedule:'▦',sessions:'◉',progress:'↗',reports:'▧',messages:'☏',family:'♡'};
const nav=[['dashboard','Overview'],['patients','Patients & families'],['plans','Treatment plans'],['schedule','Schedule'],['sessions','Live sessions'],['progress','Goals & progress'],['reports','Reports & approvals'],['messages','Communication'],['family','Family portal']];
const patients=[{name:'Ramesh Kumar',id:'XN-1042',initials:'RK',age:68,diagnosis:'Post-stroke rehabilitation',therapist:'Dr. Ananya Rao',program:'Neurological rehabilitation',sessions:18,total:30,color:'sage',family:'Priya Kumar',relationship:'Daughter',timezone:'Europe/London',email:'priya@example.com'}, {name:'Meera Nair',id:'XN-1043',initials:'MN',age:54,diagnosis:'Total knee replacement',therapist:'Dr. Vikram Shah',program:'Orthopedic rehabilitation',sessions:9,total:24,color:'peach',family:'Arjun Nair',relationship:'Son',timezone:'America/New_York',email:'arjun@example.com'}, {name:'Joseph Thomas',id:'XN-1044',initials:'JT',age:72,diagnosis:'Balance & gait impairment',therapist:'Dr. Sara Joseph',program:'Geriatric rehabilitation',sessions:12,total:20,color:'lavender',family:'Anna Thomas',relationship:'Daughter',timezone:'Asia/Dubai',email:'anna@example.com'}, {name:'Lakshmi Iyer',id:'XN-1045',initials:'LI',age:61,diagnosis:'Chronic lower back pain',therapist:'Dr. Ananya Rao',program:'Musculoskeletal rehabilitation',sessions:6,total:16,color:'sand',family:'Karthik Iyer',relationship:'Son',timezone:'Asia/Kolkata',email:'karthik@example.com'}];
let sessions=[{id:1,patient:0,treatment:'Gait & mobility training',time:'09:00',duration:45,status:'In Progress',room:'Therapy room 01',start:Date.now()-22*60000,events:['08:50 · Patient checked in','09:00 · Session started'],activities:['Assisted walking','Balance exercises','Sit-to-stand training']},{id:2,patient:1,treatment:'Knee mobility & strengthening',time:'09:30',duration:45,status:'Checked In',room:'Therapy room 02',events:['09:15 · Patient checked in'],activities:['Range of motion','Quadriceps strengthening']},{id:3,patient:2,treatment:'Balance & coordination',time:'10:00',duration:30,status:'Scheduled',room:'Rehab studio',events:['04 Nov · Session scheduled'],activities:['Standing balance','Step training']},{id:4,patient:3,treatment:'Manual therapy & core stability',time:'10:30',duration:45,status:'Delayed',room:'Therapy room 01',events:['09:10 · Delayed by 15 minutes; room unavailable'],activities:['Core activation','Gentle stretching']},{id:5,patient:0,treatment:'Functional activity training',time:'11:30',duration:30,status:'Scheduled',room:'Rehab studio',events:['04 Nov · Session scheduled'],activities:['Daily living activities']},{id:6,patient:2,treatment:'Morning mobility',time:'08:00',duration:30,status:'Completed',room:'Rehab studio',events:['08:00 · Started','08:30 · Completed'],actual:30,activities:['Assisted walking']}];
const demoSessionDate = new Date('2026-11-05T00:00:00Z');
const sessionDateFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeZone: 'Asia/Kolkata'
});

function dateOffset(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

// The demo starts with progress totals but only today's individual records.
const previousSessionDates = patients.map((patient, index) => {
  const completedToday = sessions.filter(s => s.patient === index && s.status === 'Completed').length;
  return Array.from({length: patient.sessions - completedToday}, (_, day) =>
    dateOffset(new Date('2026-10-12T00:00:00Z'), day)
  );
});

let reports=[{patient:0,title:'Weekly rehabilitation review',type:'Weekly report',status:'Awaiting approval',date:'05 Nov 2026',note:'Walking distance improved from 10 m to 35 m with a walking aid. Patient tolerated balance exercises well.'},{patient:1,title:'Session summary',type:'Treatment summary',status:'Approved',date:'04 Nov 2026',note:'Knee flexion measured at 95°. Continue prescribed mobility exercises within tolerance.'},{patient:0,title:'Initial clinical assessment',type:'Assessment',status:'Approved',date:'12 Oct 2026',note:'Baseline: assisted walking distance 10 m, pain score 7/10, knee flexion 70°. Treatment plan reviewed by consultant.'}];
let notifications=[{title:'Session started',text:'Ramesh Kumar · Gait & mobility training',channel:'WhatsApp',status:'Demo delivered',time:'09:00'},{title:'Weekly report ready for review',text:'Dr. Ananya Rao submitted a report',channel:'In-app',status:'Pending review',time:'08:45'},{title:'Schedule updated',text:'Lakshmi Iyer · revised start 10:45',channel:'SMS',status:'Demo delivered',time:'09:10'}];
let preferences={WhatsApp:true,SMS:false,Email:true,'In-app':true};
let page='dashboard',filter='All',query='',selectedPatient=0,calendarMode='Day',viewDate=5,toastTimer;
const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const badge=s=>`<span class="badge ${s.toLowerCase().replaceAll(' ','-')}">${s==='In Progress'?'<i></i>':''}${esc(s)}</span>`;
const avatar=(p,small=false)=>`<span class="avatar ${p.color} ${small?'small':''}">${esc(p.initials)}</span>`;
const btn=(label,action,kind='primary')=>`<button class="${kind}" data-action="${action}">${label}</button>`;
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function go(p){page=p;filter='All';query='';render();window.scrollTo(0,0)}
function render(){const p=patients[selectedPatient];$('#app').innerHTML=`<aside class="sidebar"><a class="brand" href="#" data-page="dashboard"><span class="brand-mark">✳</span><span>xenia<span class="brand-sub">PHYSIO & REHAB CENTER</span></span></a><button type="button" class="nav-toggle secondary" aria-expanded="false" aria-controls="workspace-nav">Menu</button><div class="workspace-label">CARE WORKSPACE</div><nav id="workspace-nav" aria-label="Workspace modules">${nav.map(([id,label])=>`<button class="nav-item ${page===id?'active':''}" data-page="${id}" ${page===id?'aria-current="page"':''}><span>${icons[id]}</span>${label}${id==='sessions'?`<b>${sessions.filter(s=>s.status==='In Progress').length}</b>`:''}${id==='reports'?'<span class="nav-dot"></span>':''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="care-note"><span>✧</span><strong>Care that stays connected.</strong><p>Every session. Every milestone.<br>Every family.</p></div><div class="user"><span class="avatar sage small">AS</span><div><strong>Aditi Sharma</strong><small>Center administrator</small></div><span>⌄</span></div></div></aside><div class="main-wrap"><header><div class="breadcrumb">Workspace <span>/</span> <strong>${nav.find(n=>n[0]===page)[1]}</strong></div><div class="header-right"><span class="demo-tag">● DEMO WORKSPACE</span><span class="today-header">05 November 2026</span><button class="icon-button" aria-label="Open notifications" data-page="messages">♧<i></i></button><span class="avatar sage small">AS</span></div></header><main>${({dashboard:dashboard,patients:patientPage,plans:plansPage,schedule:schedulePage,sessions:sessionPage,progress:progressPage,reports:reportsPage,messages:messagesPage,family:familyPage})[page]()}</main><footer><span>✳ Xenia Care Workspace</span><span>Demo only · Fictional patient data · Changes reset on refresh</span></footer></div>`;bind()}
function heading(eyebrow,title,subtitle,actions=''){return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`}
function metrics(){return `<div class="metrics">${[['♧','Active patients',patients.length,'Across 4 rehabilitation programmes'],['◷',"Today’s sessions",sessions.length,`${sessions.filter(s=>s.status==='Scheduled').length} upcoming sessions`],['◉','In progress',sessions.filter(s=>s.status==='In Progress').length,'Live treatment updates'],['✓','Completed today',sessions.filter(s=>s.status==='Completed').length,'Care delivered, progress recorded']].map(([ic,label,n,sub],i)=>`<div class="metric"><div class="metric-top"><span>${label}</span><span class="metric-icon m${i}">${ic}</span></div><strong>${n.toString().padStart(2,'0')}</strong><small>${sub}</small></div>`).join('')}</div>`}
function sessionTable(list=sessions){const items=list.filter(s=>(filter==='All'||s.status===filter)&&(`${esc(patients[s.patient].name)} ${esc(s.treatment)} ${esc(patients[s.patient].therapist)}`.toLowerCase().includes(query.toLowerCase())));return `<div class="table-wrap"><table class="session-table" role="table" aria-label="Treatment sessions"><thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">Patient</th><th role="columnheader" scope="col">Treatment & therapist</th><th role="columnheader" scope="col">Time</th><th role="columnheader" scope="col">Status</th><th role="columnheader" scope="col" aria-label="Actions"></th></tr></thead><tbody role="rowgroup">${items.map(s=>{const p=patients[s.patient];return `<tr role="row"><td role="cell"><div class="person">${avatar(p,true)}<div><strong>${esc(p.name)}</strong><small>${esc(p.id)}</small></div></div></td><td role="cell"><strong>${esc(s.treatment)}</strong><small>${esc(p.therapist)}</small></td><td role="cell"><strong>${s.time}</strong><small>${s.duration} min</small></td><td role="cell">${badge(s.status)}</td><td role="cell"><button class="text-button" data-session="${s.id}">View session ↗</button></td></tr>`}).join('')||'<tr role="row"><td role="cell" colspan="5" class="empty">No sessions match this view.</td></tr>'}</tbody></table></div>`}
let dashboardTreatment = '';
let dashboardTherapist = '';

function dashboardSessionFilters() {
  const fields = [
    ['dashboard-treatment', 'Treatment', dashboardTreatment, sessions.map(session => session.treatment)],
    ['dashboard-therapist', 'Therapist', dashboardTherapist, sessions.map(session => patients[session.patient].therapist)]
  ];

  return `<div class="schedule-filters">${fields.map(([id, label, selected, values]) => `
    <label for="${id}">${label}
      <select id="${id}">
        <option value="">All ${label.toLowerCase()}s</option>
        ${[...new Set(values)].sort((a, b) => a.localeCompare(b)).map(value =>
          `<option value="${esc(value)}" ${selected === value ? 'selected' : ''}>${esc(value)}</option>`
        ).join('')}
      </select>
    </label>`).join('')}</div>`;
}

function bindDashboardSessionFilters() {
  const treatment = $('#dashboard-treatment');
  const therapist = $('#dashboard-therapist');
  if (!treatment || !therapist) return;

  const updateFilters = event => {
    const id = event.currentTarget.id;
    dashboardTreatment = treatment.value;
    dashboardTherapist = therapist.value;
    render();
    $(`#${id}`).focus();
  };

  treatment.onchange = updateFilters;
  therapist.onchange = updateFilters;
}

function dashboard(){const filteredSessions = sessions.filter(session =>
  (!dashboardTreatment || session.treatment === dashboardTreatment) &&
  (!dashboardTherapist || patients[session.patient].therapist === dashboardTherapist)
);
return heading('YOUR CENTER, AT A GLANCE','Good morning, Aditi <span class="sun">☀</span>','A little visibility goes a long way. Here’s how care is moving today.')+metrics()+`<div class="dashboard-grid"><section class="panel schedule-panel"><div class="panel-heading"><div><h2>Today’s treatment schedule <span class="count">${sessions.length}</span></h2><p>Thursday, 05 November · All times in IST</p></div><button class="text-button" data-page="schedule">Full schedule ↗</button></div><div class="tabs">${['All','In Progress','Scheduled','Completed'].map(s=>`<button class="${filter===s?'selected':''}" data-filter="${s}">${s==='All'?'All sessions':s}</button>`).join('')}</div>${dashboardSessionFilters()}${sessionTable(filteredSessions)}</section><section class="panel journey-panel"><div class="panel-heading"><div><h2>Progress worth seeing</h2><p>Small steps toward meaningful goals.</p></div><button class="text-button" data-page="progress">View all goals ↗</button></div><div class="journey-content"><div><div class="person">${avatar(patients[0],true)}<div><strong>Ramesh Kumar</strong><small>Neurological rehabilitation</small></div></div><div class="goal-highlight"><span>WALKING DISTANCE WITH AID</span><strong>35 <small>meters</small></strong><p>Baseline 10 m <span>↗ +25 m since assessment</span></p></div></div><div class="chart"><div class="chart-grid"></div><svg viewBox="0 0 400 115" preserveAspectRatio="none" aria-label="Walking distance increased from 10 to 35 meters"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#26796c" stop-opacity=".18"/><stop offset="1" stop-color="#26796c" stop-opacity="0"/></linearGradient></defs><path d="M0 98 L65 88 L132 76 L198 59 L265 48 L330 30 L400 15 L400 115 L0 115Z" fill="url(#fill)"/><path d="M0 98 L65 88 L132 76 L198 59 L265 48 L330 30 L400 15" stroke="#357d6c" stroke-width="3" fill="none"/></svg><div class="chart-labels"><span>12 Oct</span><span>19 Oct</span><span>26 Oct</span><span>05 Nov</span></div></div></div></section><section class="panel activity"><div class="panel-heading"><h2>Recent activity</h2><button class="text-button" data-page="messages">View all ↗</button></div>${notifications.slice(0,3).map((n,i)=>`<div class="activity-item"><span class="activity-dot a${i}"></span><div><strong>${n.title}</strong><p>${n.text}</p><small>Today, ${n.time} · ${n.channel}</small></div></div>`).join('')}</section></div>`}
function patientPage(){return heading('PATIENT MANAGEMENT','People at the heart of care','Patient profiles, treatment journeys, and the families beside them.')+`<div class="toolbar"><input id="search" placeholder="Search patients, ID or diagnosis…" value="${esc(query)}"><span>${patients.length} active patients</span></div><div class="patient-grid">${patients.filter(p=>(p.name+p.id+p.diagnosis).toLowerCase().includes(query.toLowerCase())).map(p=>{const i=patients.indexOf(p);return `<section class="panel patient-card"><div class="patient-card-top">${avatar(p)}${badge('Active')}</div><h2>${esc(p.name)}</h2><p>${esc(p.id)} · ${esc(p.age)} years</p><div class="patient-diagnosis">${esc(p.diagnosis)}</div><dl><dt>Responsible therapist</dt><dd>${esc(p.therapist)}</dd><dt>Treatment sessions</dt><dd>${p.sessions} of ${p.total} completed</dd></dl><div class="progress-bar"><span style="width:${p.sessions/p.total*100}%"></span></div><div class="family-linked">♡ ${esc(p.family)} · ${esc(p.relationship)}</div>${btn('View patient profile →','patient-'+i,'secondary')}</section>`}).join('')||'<p>No matching patients.</p>'}</div>`}
function patientSelector(){return `<select id="patient-select" aria-label="Select patient">${patients.map((p,i)=>`<option value="${i}" ${i===selectedPatient?'selected':''}>${esc(p.name)} · ${esc(p.id)}</option>`).join('')}</select>`}
function plansPage(){const p=patients[selectedPatient];return heading('CLINICAL PLANNING','A clear path forward','Assessment, treatment recommendations, and measurable objectives.',btn('＋ Create treatment plan','plan'))+patientSelector()+`<div class="two-col"><section class="panel padded"><div class="section-kicker">ACTIVE TREATMENT PLAN</div><h2>${esc(p.program)}</h2><p>${esc(p.diagnosis)}</p><dl class="detail-grid"><dt>Consultant</dt><dd>Dr. Nikhil Menon</dd><dt>Responsible therapist</dt><dd>${esc(p.therapist)}</dd><dt>Frequency</dt><dd>5 sessions per week</dd><dt>Session duration</dt><dd>30–45 minutes</dd><dt>Started</dt><dd>12 October 2026</dd><dt>Next reassessment</dt><dd>12 November 2026</dd><dt>Planned sessions</dt><dd>${p.total}</dd></dl><h3>Clinical objectives</h3><p>${esc(p.objectives||'Improve mobility, balance, and independence with clinician-guided exercises.')}</p><h3>Treatment approach</h3><p>Individual therapy focused on mobility, functional strength, balance, and independence in daily activities.</p><div class="note">Clinical measures shown here are illustrative demo values.</div></section><section class="panel padded"><h2>Clinical goals</h2>${goalCards()}<h3>Assessment history</h3><div class="timeline-entry"><strong>05 Nov · Interim review</strong><p>Improved exercise tolerance. Continue current programme.</p></div><div class="timeline-entry"><strong>12 Oct · Initial assessment</strong><p>Baseline measures recorded and plan reviewed by consultant.</p></div></section></div>`}
function goalCards(){return [['Assisted walking distance','10 m','35 m','50 m',62],['Pain during movement','7 / 10','4 / 10','≤ 3 / 10',75],['Knee flexion range','70°','95°','110°',63]].map(([label,base,current,target,width])=>`<div class="goal"><div><strong>${label}</strong>${badge('In progress')}</div><div class="goal-values"><span>Baseline <b>${base}</b></span><span>Current <b>${current}</b></span><span>Target <b>${target}</b></span></div><div class="progress-bar"><span style="width:${width}%"></span></div></div>`).join('')}
function schedulePage(){return heading('THERAPIST ALLOCATION','Make room for better care','Coordinate your team, rooms, and every patient’s next step.',btn('＋ Schedule session','schedule'))+`<div class="calendar-toolbar"><div>${btn('‹','prev-date','secondary')} <strong>${calendarMode==='Day'?viewDate:calendarMode==='Week'?'02–08':'01–30'} November 2026</strong> ${btn('›','next-date','secondary')}</div><div class="segmented">${['Day','Week','Month'].map(x=>`<button data-calendar="${x}" class="${calendarMode===x?'selected':''}">${x}</button>`).join('')}</div></div><div class="panel calendar calendar-${calendarMode.toLowerCase()}"><div class="calendar-head"><span>TIME · IST</span>${['Dr. Ananya Rao','Dr. Vikram Shah','Dr. Sara Joseph'].map(t=>`<div><strong>${t}</strong><small>Physiotherapist · ${sessions.filter(s=>patients[s.patient].therapist===t).length} sessions</small></div>`).join('')}</div>${calendarMode==='Month'?`<div class="month-grid">${Array.from({length:30},(_,i)=>`<button data-date="${i+1}" class="${i===4?'current-day':''}"><strong>${i+1}</strong>${i===4?'<span>6 sessions</span>':i%7<5?'<small>Available</small>':''}</button>`).join('')}</div>`:calendarMode==='Week'?`<div class="week-grid">${['Mon 02','Tue 03','Wed 04','Thu 05','Fri 06','Sat 07','Sun 08'].map((d,i)=>`<div><h3>${d}</h3>${i===3?sessions.map(s=>`<button class="calendar-event" data-session="${s.id}"><strong>${s.time} · ${esc(patients[s.patient].name)}</strong><small>${esc(s.treatment)}</small></button>`).join(''):'<p class="muted">No demo sessions</p>'}</div>`).join('')}</div>`:viewDate!==5?'<div class="empty">No sessions scheduled for this date. Use “Schedule session” to add one.</div>':['08:00','09:00','10:00','11:00','12:00'].map(time=>`<div class="calendar-row"><span>${time}</span>${['Dr. Ananya Rao','Dr. Vikram Shah','Dr. Sara Joseph'].map(t=>`<div>${sessions.filter(s=>s.time.slice(0,2)===time.slice(0,2)&&patients[s.patient].therapist===t).map(s=>`<button class="calendar-event ${s.status==='Completed'?'finished':''}" data-session="${s.id}"><strong>${s.time} · ${esc(patients[s.patient].name)}</strong><small>${esc(s.treatment)}</small><small class="agenda-therapist">${esc(t)}</small><span>${s.duration} min · ${esc(s.room)}</span></button>`).join('')}</div>`).join('')}</div>`).join('')}</div><div class="note">Demo calendar · Sessions on 05 November · Select a session to manage allocation and status.</div>`}
function liveSessionPanels() {
  const active = sessions.filter(session => session.status === 'In Progress');
  const delayed = sessions.filter(session => session.status === 'Delayed');
  const awaitingApproval = reports.filter(report => report.status === 'Awaiting approval');
  const attentionCount = delayed.length + awaitingApproval.length;

  return `<div class="live-session-panels">
    <section class="live-card" aria-labelledby="live-card-heading">
      <div class="live-top"><span class="live-label"><i></i> LIVE AT THE CENTER</span></div>
      <h2 id="live-card-heading">Care in motion</h2>
      <p>Follow treatment as it happens.</p>
      ${active.map(session => {
        const patient = patients[session.patient];
        const elapsed = Math.max(0, Math.floor((Date.now() - session.start - (session.pausedMs || 0)) / 60000));
        const progress = Math.min(100, (elapsed / session.duration) * 100);
        return `<div class="live-session-summary">
          <div class="live-patient">
            ${avatar(patient, true)}
            <div><strong>${esc(patient.name)}</strong><small>${esc(session.treatment)}</small></div>
          </div>
          <div class="live-track" aria-hidden="true"><span style="width:${progress}%"></span></div>
          <div class="live-foot"><span>${elapsed} min elapsed</span><span>${session.duration} min planned</span></div>
          ${btn('Open live session →', 'session-' + session.id, 'light')}
        </div>`;
      }).join('') || '<p class="live-empty">No active sessions right now.</p>'}
    </section>
    <section class="panel attention" aria-labelledby="attention-heading">
      <div class="panel-heading">
        <h2 id="attention-heading">Needs your attention</h2><span class="count">${attentionCount}</span>
      </div>
      ${awaitingApproval.map(report => `
        <button class="attention-item" data-action="report-${reports.indexOf(report)}">
          <span class="attention-icon peach" aria-hidden="true">▧</span>
          <div><strong>Report awaiting approval</strong><small>${esc(report.title)} · ${esc(patients[report.patient].name)}</small></div>
          <span aria-hidden="true">›</span>
        </button>`).join('')}
      ${delayed.map(session => `
        <button class="attention-item" data-session="${session.id}">
          <span class="attention-icon sand" aria-hidden="true">◷</span>
          <div><strong>Session delayed</strong><small>${esc(patients[session.patient].name)} · ${esc(session.treatment)}</small></div>
          <span aria-hidden="true">›</span>
        </button>`).join('')}
      ${attentionCount ? '' : '<p class="attention-empty">You’re all caught up.</p>'}
    </section>
  </div>`;
}

function sessionPage(){return heading('LIVE TREATMENT TRACKING','Every session, in focus','Start, pause, and complete treatment with a clear record of care.')+metrics()+liveSessionPanels()+`<section class="panel" aria-labelledby="session-list-heading"><div class="panel-heading"><h2 id="session-list-heading">Session list</h2></div><div class="toolbar"><input id="search" placeholder="Search patient, treatment or therapist…" value="${esc(query)}"><select id="status-filter" aria-label="Filter status">${['All','Scheduled','Upcoming','Checked In','In Progress','Paused','Completed','Delayed','Rescheduled','Missed','Cancelled'].map(s=>`<option ${filter===s?'selected':''}>${s}</option>`).join('')}</select></div>${sessionTable()}</section>`}
function progressPage(){const p=patients[selectedPatient];return heading('GOALS & REASSESSMENTS','Meaningful steps forward','Clinician-defined measures show how each patient is progressing.')+patientSelector()+`<div class="two-col"><section class="panel padded"><h2>${esc(p.name)} · clinical measures</h2><p class="muted">Initial assessment → latest observation · illustrative values</p>${goalCards()}${btn('＋ Record observation','observation','secondary')}</section><section class="panel padded"><h2>Treatment journey</h2><div class="session-numbers"><div><strong>${p.total}</strong><small>Planned</small></div><div><strong>${p.sessions}</strong><small>Completed</small></div><div><strong>${p.total-p.sessions}</strong><small>Remaining</small></div><div><strong>0</strong><small>Missed</small></div></div><h3>Milestones</h3><div class="milestone">✓ <div><strong>Independent sit-to-stand with support</strong><p>Achieved · 28 October 2026</p></div></div><div class="milestone">◷ <div><strong>Walk 50 meters with a walking aid</strong><p>In progress · current 35 meters</p></div></div><div class="note">Next reassessment: 12 November 2026<br>Consultant: Dr. Nikhil Menon</div><p class="muted">Goal measurements are shown individually; they do not represent an overall recovery percentage.</p></section></div>`}
function reportsPage(){return heading('CLINICAL DOCUMENTATION','Care, thoughtfully documented','Review therapist notes before sharing approved updates with families.')+`<div class="tabs">${['All','Awaiting approval','Approved'].map(s=>`<button data-filter="${s}" class="${filter===s?'selected':''}">${s}</button>`).join('')}</div><div class="report-list">${reports.filter(r=>filter==='All'||r.status===filter).map(r=>`<section class="panel report-card"><span class="report-icon">▧</span><div><div class="section-kicker">${esc(r.type)} · ${r.date}</div><h2>${esc(r.title)}</h2><p>${patients[r.patient].name} · ${patients[r.patient].therapist}</p><p class="report-excerpt">${esc(r.note)}</p></div><div class="report-actions">${badge(r.status)}${btn('Read report','report-'+reports.indexOf(r),'secondary')}</div></section>`).join('')||'<div class="empty">No reports in this view.</div>'}</div>`}
function messagesPage(){return heading('FAMILY COMMUNICATION','Keep the circle connected','Event updates, family preferences, and conversations in one place.',btn('＋ Compose update','compose'))+`<div class="two-col"><section class="panel"><div class="panel-heading"><h2>Notification history</h2><span class="count">${notifications.length}</span></div>${notifications.map(n=>`<div class="notification"><span class="attention-icon sage">♧</span><div><strong>${esc(n.title)}</strong><p>${esc(n.text)}</p><small>Today ${n.time} · ${n.channel}</small></div>${badge(n.status)}</div>`).join('')}</section><section class="panel padded"><h2>Family notification preferences</h2><p class="muted">Example settings for ${esc(patients[0].family)} · Europe/London</p>${['WhatsApp','SMS','Email','In-app'].map((x,i)=>`<label class="switch-row"><span>${x}</span><input type="checkbox" ${preferences[x]?'checked':''} data-preference="${x}"></label>`).join('')}<div class="note">These switches change the demo view only. No messages are sent.</div><h3>Family queries</h3><div class="query-card"><strong>Home exercise guidance</strong><p>Could you share the recommended exercises for this weekend?</p><small>Priya Kumar · Today, 08:15</small>${btn('Reply to query','reply','secondary')}</div></section></div>`}
function familyPage(){const p=patients[selectedPatient];if(p.revoked)return heading('FAMILY PORTAL','Access has been revoked','This linked family member can no longer view this patient’s treatment information.')+patientSelector()+'<section class="panel padded"><h2>Contact the center</h2><p>The patient record remains available to staff. Restore demo access from Patients & families to preview this portal again.</p></section>';return `<div class="family-banner"><span>♡ FAMILY VIEW</span><span>Previewing as ${esc(p.family)} · ${esc(p.timezone)}</span></div>`+heading('CONNECTED TO THEIR CARE',`A little closer, wherever you are.`,`Follow ${esc(p.name.split(' ')[0])}’s day, celebrate milestones, and stay in touch.`)+patientSelector()+`<div class="two-col"><section class="panel padded"><div class="person">${avatar(p)}<div><h2>${esc(p.name)}</h2><p>${esc(p.id)} · ${esc(p.program)}</p></div></div><div class="note">Consultant: Dr. Nikhil Menon<br>Therapy type: ${esc(p.program)}<br>Care began: 12 October 2026<br>Next review: 12 November 2026</div><h3>Today’s care · times in IST (UTC+05:30)</h3>${sessions.filter(s=>s.patient===selectedPatient).map(s=>`<div class="family-session"><div><strong>${esc(s.treatment)}</strong><p>${s.time} · ${s.duration} minutes · ${esc(p.therapist)}</p></div>${badge(s.status)}</div>`).join('')}<h3>Approved updates</h3>${reports.filter(r=>r.patient===selectedPatient&&r.status==='Approved').map(r=>`<div class="approved-update"><small>${r.date}</small><h3>${esc(r.title)}</h3><p>${esc(r.note)}</p>${btn('View approved report','report-'+reports.indexOf(r),'secondary')}</div>`).join('')||'<p>No approved reports available yet.</p>'}</section><div><section class="panel padded"><h2>Your family’s care team</h2><div class="person therapist"><span class="avatar lavender">${p.therapist.split(' ').slice(1).map(s=>s[0]).join('')}</span><div><strong>${esc(p.therapist)}</strong><small>Physiotherapist · Rehabilitation specialist</small></div></div><h3>Progress in perspective</h3><p>${p.sessions} of ${p.total} planned sessions completed</p><div class="progress-bar"><span style="width:${p.sessions/p.total*100}%"></span></div><p class="muted">Your care team shares clinical progress in approved reports.</p><div class="session-dates-action">${btn('View session dates', 'family-session-dates', 'secondary')}</div></section><section class="panel padded support"><h2>We’re here for you.</h2><p>Have a question about treatment or the next steps?</p>${btn('Send a query','query','secondary')} ${btn('Request callback','callback','secondary')}<small>Demo requests appear in this workspace only.</small></section></div></div>`}
function openFamilySessionDates() {
  const patient = patients[selectedPatient];
  if (page !== 'family' || patient.revoked) return;

  const patientSessions = sessions.filter(session => session.patient === selectedPatient);
  const completed = (previousSessionDates[selectedPatient] || []).map(date => ({
    date, label: 'Rehabilitation session'
  }));
  const pending = [];

  for (const session of patientSessions) {
    if (session.status === 'Completed') {
      completed.push({
        date: session.completedAt || demoSessionDate,
        label: session.treatment
      });
    } else if (session.status !== 'Cancelled' && session.status !== 'Missed') {
      pending.push({
        date: demoSessionDate,
        label: session.treatment,
        time: session.time,
        status: session.status
      });
    }
  }

  const remaining = Math.max(0, patient.total - completed.length - pending.length);
  for (let day = 1; day <= remaining; day++) {
    pending.push({
      date: dateOffset(demoSessionDate, day),
      label: 'Planned rehabilitation session',
      status: 'Pending'
    });
  }

  completed.sort((a, b) => b.date - a.date);
  pending.sort((a, b) => a.date - b.date || (a.time || '').localeCompare(b.time || ''));

  function dateList(title, entries, emptyMessage) {
    return `<section class="session-date-group">
      <h3>${title} · ${entries.length}</h3>
      ${entries.length ? `<ul class="session-date-list">${entries.map(entry => `
        <li>
          <div><strong>${sessionDateFormat.format(entry.date)}</strong>
          <p>${esc(entry.label)}${entry.time ? ' · ' + esc(entry.time) + ' IST' : ''}</p></div>
          ${entry.status ? badge(entry.status) : ''}
        </li>`).join('')}</ul>` : `<p>${emptyMessage}</p>`}
    </section>`;
  }

  modal('Session dates', `
    <p class="muted">${esc(patient.name)} · ${patient.total} planned sessions · Demo dates</p>
    <div class="session-date-groups">
      ${dateList('Completed sessions', completed, 'No completed sessions yet.')}
      ${dateList('Pending sessions', pending, 'No pending sessions.')}
    </div>
  `);
}

function modal(title,content){$('#modal').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-header"><h2>${title}</h2><button class="icon-button" data-close aria-label="Close dialog">×</button></div>${content}</section></div>`;$('#modal [data-close]').onclick=closeModal;$('#modal .modal-backdrop').onclick=e=>{if(e.target.classList.contains('modal-backdrop'))closeModal()};$('#modal').querySelector('input,textarea,select,button')?.focus();bindModal()}
function closeModal(){$('#modal').innerHTML=''}
function field(label,name,type='text',value=''){return `<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" required></label>`}
function selectField(label,name,options){return `<label class="field">${label}<select name="${name}">${options.map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join('')}</select></label>`}
function form(title,fields,onSubmit,submit='Save in demo'){modal(title,`<form id="demo-form">${fields}<div class="form-footer"><span>Browser demo only</span><button class="primary">${submit}</button></div></form>`);$('#demo-form').onsubmit=e=>{e.preventDefault();onSubmit(new FormData(e.target))}}
function openSession(id){const s=sessions.find(x=>x.id===id),p=patients[s.patient];modal('Treatment session',`<div class="session-detail"><div class="person">${avatar(p)}<div><h2>${esc(p.name)}</h2><p>${esc(s.treatment)}</p></div></div><div class="session-status">${badge(s.status)}<span>${s.time} IST · ${s.duration} min · ${esc(s.room)}</span></div><dl class="detail-grid"><dt>Therapist</dt><dd>${esc(p.therapist)}</dd><dt>Actual duration</dt><dd>${s.actual!==undefined?s.actual+' minutes':s.start?Math.floor(((s.pausedAt||Date.now())-s.start-(s.pausedMs||0))/60000)+' minutes (active time)':'Not started'}</dd></dl><h3>Treatment activities</h3>${s.activities.map((a,i)=>`<label class="activity-check"><input type="checkbox" data-activity="${i}" ${s.done?.includes(i)?'checked':''}>${a}</label>`).join('')}<label class="field">Therapist observations<textarea id="session-notes" placeholder="Record response, discomfort, activities and next steps…">${esc(s.notes||'')}</textarea></label><div class="session-controls">${['Scheduled','Upcoming','Checked In','Delayed','Rescheduled'].includes(s.status)?`<button class="primary" data-transition="In Progress">▶ Start session</button>`:''}${s.status==='In Progress'?'<button class="secondary" data-transition="Paused">Ⅱ Pause</button>':''}${s.status==='Paused'?'<button class="primary" data-transition="In Progress">▶ Resume</button>':''}${['In Progress','Paused'].includes(s.status)?'<button class="primary" data-transition="Completed">✓ Complete session</button>':''}<button class="secondary" id="save-notes">Save notes</button>${!['Completed','Cancelled','Missed'].includes(s.status)?'<button class="text-button" id="manage-session">Manage schedule</button>':''}</div><h3>Status history</h3><div class="session-history">${s.events.map(x=>`<div>${esc(x)}</div>`).join('')}</div></div>`);$('#save-notes').onclick=()=>{saveSessionNotes(s);toast('Session notes saved in demo')};$('#modal').querySelectorAll('[data-transition]').forEach(b=>b.onclick=()=>{saveSessionNotes(s);const status=b.dataset.transition,now=Date.now();if(status==='In Progress'){if(!s.start)s.start=now;if(s.pausedAt){s.pausedMs=(s.pausedMs||0)+now-s.pausedAt;delete s.pausedAt}}if(status==='Paused')s.pausedAt=now;if(status==='Completed'){s.completedAt=new Date(now);p.sessions=Math.min(p.total,p.sessions+1);s.actual=Math.max(1,Math.round(((s.pausedAt||now)-s.start-(s.pausedMs||0))/60000));reports.unshift({patient:s.patient,title:'Session summary · '+s.treatment,type:'Treatment summary',status:'Awaiting approval',date:'05 Nov 2026',note:s.notes||'Session completed. Therapist review required before sharing with family.'})}s.status=status;const time=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'});s.events.push(`${time} IST · ${status}`);notifications.unshift({title:'Session '+status.toLowerCase(),text:p.name+' · '+s.treatment,channel:'In-app',status:'Demo delivered',time});render();openSession(id);toast(status==='Completed'?'Session completed. Summary awaiting review.':'Session '+status.toLowerCase()+' in demo')});const manage=$('#manage-session');if(manage)manage.onclick=()=>form('Manage session',selectField('Action','status',['Checked In','Delayed','Rescheduled','Missed','Cancelled'].map(x=>[x,x]))+field('Reason','reason')+field('Revised time (IST)','time','time',s.time),d=>{s.status=d.get('status');s.time=d.get('time');s.events.push('Demo update · '+s.status+' · '+d.get('reason'));closeModal();render();toast('Session updated in demo')})}
function saveSessionNotes(s){s.notes=$('#session-notes').value;s.done=Array.from($('#modal').querySelectorAll('[data-activity]:checked')).map(el=>+el.dataset.activity)}
function openPatient(i){const p=patients[i];modal('Patient profile & family access',`<div class="person">${avatar(p)}<div><h2>${esc(p.name)}</h2><p>${esc(p.id)} · ${esc(p.age)} years · ${esc(p.diagnosis)}</p></div></div><dl class="detail-grid"><dt>Programme</dt><dd>${esc(p.program)}</dd><dt>Therapist</dt><dd>${esc(p.therapist)}</dd><dt>Emergency contact</dt><dd>${esc(p.family)} · On file (demo)</dd></dl><h3>Authorized family members</h3>${(p.additionalFamily||[]).map(f=>`<div class="note"><strong>${esc(f.name)} · ${esc(f.relationship)}</strong><br>${esc(f.email)} · ${esc(f.timezone)}<br>Consent recorded · Demo invitation prepared</div>`).join('')}<div class="family-access"><strong>${esc(p.family)} · ${esc(p.relationship)}</strong><p>${esc(p.email)} · ${esc(p.timezone)}</p>${badge(p.revoked?'Revoked':'Consent recorded')}<p>Access: approved reports, schedule and session status</p><button class="secondary" id="revoke">${p.revoked?'Restore demo access':'Revoke demo access'}</button></div><div class="form-footer"><button class="secondary" id="link-family">＋ Link family member</button><button class="primary" id="view-plan">View treatment plan →</button></div>`);$('#revoke').onclick=()=>{p.revoked=!p.revoked;openPatient(i);toast('Family access '+(p.revoked?'revoked':'restored')+' in demo')};$('#view-plan').onclick=()=>{selectedPatient=i;closeModal();go('plans')};$('#link-family').onclick=()=>form('Link family member',field('Full name','name')+field('Relationship','relationship')+field('Email','email','email')+field('Phone including country code','phone','tel')+field('Time zone','timezone','text','Asia/Kolkata')+'<label class="activity-check"><input name="consent" type="checkbox" required> Patient or representative consent recorded</label>',d=>{p.additionalFamily=p.additionalFamily||[];p.additionalFamily.push(Object.fromEntries(d));closeModal();toast('Family member linked in demo; no invitation sent')})}
function action(a){if(a==='family-session-dates')return openFamilySessionDates();if(a.startsWith('session-'))return openSession(+a.slice(8));if(a.startsWith('patient-'))return openPatient(+a.slice(8));if(a.startsWith('report-')){const r=reports[+a.slice(7)];if(page==='family'&&r.status!=='Approved')return;modal(r.title,`<div class="report-body"><p class="muted">${patients[r.patient].name} · ${r.date}</p>${badge(r.status)}<h3>Clinical observations</h3><p>${esc(r.note)}</p><h3>Next-session plan</h3><p>Continue clinician-prescribed activities and review tolerance at the next visit.</p><div class="note">${r.status==='Approved'?'Approved for family viewing.':'Internal draft. Requires clinical approval before family release.'}</div>${r.status!=='Approved'?'<button class="primary" id="approve-report">Approve & share in demo</button>':'<button class="secondary" id="download-report">Download demo report</button>'}</div>`);const approve=$('#approve-report');if(approve)approve.onclick=()=>{r.status='Approved';notifications.unshift({title:'Progress report available',text:patients[r.patient].name+' · Approved report shared in demo',channel:'In-app',status:'Demo delivered',time:'Now'});closeModal();render();toast('Approved report now visible in family portal')};const download=$('#download-report');if(download)download.onclick=()=>{const blob=new Blob([`${esc(r.title)}\n${patients[r.patient].name}\n${r.date}\n\n${r.note}\n\nFictional demo report.`],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='xenia-demo-report.txt';a.click();URL.revokeObjectURL(url)};return}
if(a==='schedule')return form('Schedule a treatment session',selectField('Patient','patient',patients.map((p,i)=>[i,p.name]))+field('Treatment','treatment')+field('Start time (05 Nov · IST)','time','time','12:00')+field('Duration in minutes','duration','number','45')+selectField('Room','room',['Therapy room 01','Therapy room 02','Rehab studio'].map(x=>[x,x])),d=>{const patient=+d.get('patient'),time=d.get('time'),duration=+d.get('duration');const mins=t=>+t.slice(0,2)*60+(+t.slice(3));if(duration<=0||duration>180)return toast('Use a duration between 1 and 180 minutes');const conflict=sessions.some(s=>!['Cancelled','Missed'].includes(s.status)&&(s.room===d.get('room')||patients[s.patient].therapist===patients[patient].therapist||s.patient===patient)&&mins(time)<mins(s.time)+s.duration&&mins(time)+duration>mins(s.time));if(conflict)return toast('Schedule conflict: patient, therapist or room is occupied');sessions.push({id:Math.max(...sessions.map(s=>s.id))+1,patient,treatment:d.get('treatment'),time,duration,status:'Scheduled',room:d.get('room'),events:['Demo · Session scheduled'],activities:['Planned treatment activities']});sessions.sort((a,b)=>a.time.localeCompare(b.time));closeModal();render();toast('Session scheduled in demo')});
if(a==='plan')return form('Create treatment plan',selectField('Patient','patient',patients.map((p,i)=>[i,p.name]))+field('Programme','program')+field('Planned session count','total','number','20')+field('Clinical objectives','goals'),d=>{const p=patients[+d.get('patient')];if(+d.get('total')<p.sessions)return toast('Planned count must include already completed sessions');p.program=d.get('program');p.total=+d.get('total');p.objectives=d.get('goals');selectedPatient=+d.get('patient');closeModal();render();toast('Treatment plan updated in demo')});
if(a==='observation')return form('Record clinical observation',field('Measure','measure','text','Assisted walking distance')+field('Observed value and unit','value','text','35 m')+field('Clinical notes','notes'),d=>{reports.unshift({patient:selectedPatient,title:'Clinical observation · '+d.get('measure'),date:'05 Nov 2026',type:'Observation',status:'Awaiting approval',note:d.get('value')+' · '+d.get('notes')});closeModal();toast('Observation saved as a report awaiting approval')});
if(a==='prev-date'||a==='next-date'){viewDate=Math.max(1,Math.min(30,viewDate+(a==='next-date'?1:-1)));render();return}
if(['compose','query','reply','callback'].includes(a))return form(a==='callback'?'Request a callback':a==='reply'?'Reply to family query':a==='query'?'Send a family query':'Compose family update',a==='callback'?field('Contact name','name')+field('Phone including country code','phone','tel')+field('Preferred time & time zone','message'):field('Subject','subject')+'<label class="field">Message<textarea name="message" required rows="4"></textarea></label>',d=>{notifications.unshift({title:a==='callback'?'Callback requested':d.get('subject'),text:d.get('message'),channel:'In-app',status:'Demo saved',time:'Now'});closeModal();render();toast('Saved in demo. No external message sent.')});}
function bindModal(){}
function bindMobileNavigation() {
  const toggle = $('.nav-toggle');
  const navigation = $('#workspace-nav');
  toggle.onclick = () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.textContent = open ? 'Menu' : 'Close menu';
    navigation.classList.toggle('is-open', !open);
  };
  navigation.onkeydown = event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.click();
      toggle.focus();
    }
  };
}
function bind(){bindMobileNavigation();bindDashboardSessionFilters();document.querySelectorAll('[data-page]').forEach(b=>b.onclick=e=>{e.preventDefault();go(b.dataset.page)});document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));document.querySelectorAll('[data-session]').forEach(b=>b.onclick=()=>openSession(+b.dataset.session));document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render()});document.querySelectorAll('[data-calendar]').forEach(b=>b.onclick=()=>{calendarMode=b.dataset.calendar;render()});document.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{viewDate=+b.dataset.date;calendarMode='Day';render()});const search=$('#search');if(search)search.oninput=e=>{const pos=e.target.selectionStart;query=e.target.value;render();$('#search').focus();$('#search').setSelectionRange(pos,pos)};const ps=$('#patient-select');if(ps)ps.onchange=e=>{selectedPatient=+e.target.value;render()};const sf=$('#status-filter');if(sf)sf.onchange=e=>{filter=e.target.value;render()};document.querySelectorAll('[data-preference]').forEach(el=>el.onchange=()=>{preferences[el.dataset.preference]=el.checked;toast(el.dataset.preference+' demo preference '+(el.checked?'enabled':'disabled'))})}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});render();
