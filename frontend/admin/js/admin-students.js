const escHtml = str => str ? String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '—';

let allStudents = [], allCourses = [];
let newStudentId = null, newSelectedCourses = new Set();
let emStudentId = null, emStudentEnrolled = new Set(), emSelectedCourses = new Set();

(async function () {
  requireAdmin();
  await Promise.all([loadStudents(), loadCourses()]);
})();

async function loadStudents() {
  const res = await apiFetch('/admin/students');
  if (!res?.ok) return showToast('Failed to load students', 'error');
  allStudents = res.data.students || [];
  document.getElementById('count-label').textContent = `${allStudents.length} student(s)`;
  filterStudents();
}

async function loadCourses() {
  const res = await apiFetch('/courses');
  if (!res?.ok) return;
  allCourses = (res.data.courses || []).filter(c => c.isActive);
}

function filterStudents() {
  const q = document.getElementById('search-input').value.toLowerCase();
  const yr = document.getElementById('year-filter').value;
  const list = allStudents.filter(s => {
    const txt = `${s.firstName} ${s.lastName} ${s.email} ${s.studentId||''}`.toLowerCase();
    return (!q || txt.includes(q)) && (!yr || String(s.yearLevel) === yr);
  });
  document.getElementById('count-label').textContent = `${list.length} / ${allStudents.length} student(s)`;
  renderStudents(list);
}

function renderStudents(list) {
  const tbody = document.getElementById('students-body');
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--text-muted)">No students found.</td></tr>`; return; }
  const ord = n => { const s=['th','st','nd','rd'],v=n%100; return s[(v-20)%10]||s[v]||s[0]; };
  tbody.innerHTML = list.map(s => `<tr>
    <td><strong>${escHtml(s.firstName)} ${escHtml(s.lastName)}</strong><div class="small">${escHtml(s.email)}</div></td>
    <td><span class="badge badge-gold">${escHtml(s.studentId)||'—'}</span></td>
    <td>${escHtml(s.program)||'<span style="color:var(--text-muted)">—</span>'}</td>
    <td>${s.yearLevel?`${s.yearLevel}${ord(s.yearLevel)} Year`:'—'}${s.section?` · <span style="color:var(--text-muted);font-size:11px">${escHtml(s.section)}</span>`:''}</td>
    <td><span style="font-size:13px;font-weight:600;color:var(--teal)">${(s.enrolledCourses||[]).length}</span> <span style="font-size:11px;color:var(--text-muted)">subject(s)</span></td>
    <td><span class="badge ${s.isActive?'badge-green':'badge-red'}">${s.isActive?'Active':'Inactive'}</span></td>
    <td><div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn btn-gold btn-sm" onclick="openEnrollModal('${s._id}')"><i class="fa-solid fa-file-circle-plus"></i> Enroll</button>
      <button class="btn btn-outline btn-sm" onclick='openEdit(${JSON.stringify(s)})'><i class="fa-solid fa-pen"></i></button>
      <button class="btn btn-danger btn-sm" onclick="toggleActive('${s._id}','${escHtml(s.firstName)}',${s.isActive})"><i class="fa-solid fa-${s.isActive?'ban':'circle-check'}"></i></button>
    </div></td>
  </tr>`).join('');
}

// ── CREATE STUDENT (2-step) ───────────────────────────────────────────────────
function openCreateModal() {
  newStudentId = null; newSelectedCourses.clear();
  ['c-firstname','c-lastname','c-email','c-password','c-program','c-section','c-contact'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('c-year').value = '';
  showStep(1);
  openModal('create-modal');
}

function showStep(n) {
  document.getElementById('step1').style.display = n===1 ? '' : 'none';
  document.getElementById('step2').style.display = n===2 ? '' : 'none';
  document.getElementById('sd1').className = n===1 ? 'step-dot active' : 'step-dot done';
  if (n===2) document.getElementById('sd1').innerHTML = '<i class="fa-solid fa-check" style="font-size:10px"></i>';
  else document.getElementById('sd1').textContent = '1';
  document.getElementById('sd2').className = n===2 ? 'step-dot active' : 'step-dot';
  document.getElementById('sl1').className = n===2 ? 'step-line active' : 'step-line';
  document.getElementById('step-label').textContent = n===1 ? 'Step 1 of 2 — Student Information' : 'Step 2 of 2 — Assign Subjects';
  const nextBtn = document.getElementById('create-next-btn');
  document.getElementById('create-back-btn').style.display = n===2 ? '' : 'none';
  document.getElementById('create-cancel-btn').style.display = n===1 ? '' : 'none';
  if (n===1) { nextBtn.innerHTML = 'Next: Assign Subjects <i class="fa-solid fa-arrow-right"></i>'; nextBtn.onclick = handleNext; }
  else { nextBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save & Finish'; nextBtn.onclick = finishEnrollment; }
}

function goBack() { showStep(1); }

function toggleCPw() {
  const inp = document.getElementById('c-password');
  const ic  = document.getElementById('cpw-icon');
  if (inp.type==='password') { inp.type='text'; ic.className='fa-solid fa-eye-slash'; }
  else { inp.type='password'; ic.className='fa-solid fa-eye'; }
}

async function handleNext() {
  const fn = document.getElementById('c-firstname').value.trim();
  const ln = document.getElementById('c-lastname').value.trim();
  const em = document.getElementById('c-email').value.trim();
  const pw = document.getElementById('c-password').value;
  if (!fn||!ln||!em||!pw) return showToast('First name, last name, email and password are required.','error');
  if (pw.length<8) return showToast('Password must be at least 8 characters.','error');

  const btn = document.getElementById('create-next-btn');
  btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Creating...';

  const res = await apiFetch('/admin/students/create', { method:'POST', body: JSON.stringify({
    firstName:fn, lastName:ln, email:em, password:pw,
    program:document.getElementById('c-program').value.trim(),
    yearLevel:Number(document.getElementById('c-year').value)||undefined,
    section:document.getElementById('c-section').value.trim(),
    contactNumber:document.getElementById('c-contact').value.trim()
  })});
  btn.disabled=false;
  if (!res?.ok) { btn.innerHTML='Next: Assign Subjects <i class="fa-solid fa-arrow-right"></i>'; return showToast(res?.data?.message||'Failed to create account.','error'); }

  newStudentId = res.data.student.id;
  document.getElementById('created-student-name').textContent = `${fn} ${ln}`;
  showStep(2);
  renderNewList(allCourses);
  await loadStudents();
}

function filterNewEnroll() {
  const q = document.getElementById('enroll-search-new').value.toLowerCase();
  renderNewList(allCourses.filter(c => c.courseCode.toLowerCase().includes(q)||c.courseName.toLowerCase().includes(q)||(c.instructor||'').toLowerCase().includes(q)));
}

function renderNewList(courses) {
  const el = document.getElementById('new-enroll-list');
  if (!courses.length) { el.innerHTML=`<div style="text-align:center;padding:24px;color:var(--text-muted)">No courses found.</div>`; return; }
  el.innerHTML = courses.map(c => {
    const sel = newSelectedCourses.has(c._id);
    return `<div class="course-enroll-item ${sel?'selected':''}" onclick="toggleNewCourse('${c._id}')">
      <div class="enroll-checkbox">${sel?'<i class="fa-solid fa-check"></i>':''}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
          <span style="font-size:11px;font-weight:700;color:var(--gold);background:var(--gold-dim);padding:2px 8px;border-radius:5px">${escHtml(c.courseCode)}</span>
          <span style="font-size:11px;color:var(--text-muted)">${c.units} units</span>
        </div>
        <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${escHtml(c.courseName)}</div>
        <div style="font-size:11px;color:var(--text-muted)">${escHtml(c.instructor||'')}</div>
      </div>
      <span style="font-size:11px;font-weight:600;color:${c.enrolledCount>=c.maxStudents?'var(--danger)':'var(--success)'}">${c.enrolledCount>=c.maxStudents?'FULL':`${c.maxStudents-c.enrolledCount} slots`}</span>
    </div>`;
  }).join('');
  updateNewCounter();
}

function toggleNewCourse(id) {
  if (newSelectedCourses.has(id)) newSelectedCourses.delete(id);
  else newSelectedCourses.add(id);
  filterNewEnroll();
  updateNewCounter();
}

function updateNewCounter() {
  const cnt = newSelectedCourses.size;
  const units = allCourses.filter(c=>newSelectedCourses.has(c._id)).reduce((s,c)=>s+c.units,0);
  document.getElementById('new-selected-count').textContent = cnt;
  document.getElementById('new-units-label').textContent = cnt ? `Total: ${units} unit(s)` : '';
}

async function finishEnrollment() {
  if (newSelectedCourses.size===0) { closeModal('create-modal'); showToast('Student account created!','success'); return; }
  const btn = document.getElementById('create-next-btn');
  btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Enrolling...';
  let ok=0;
  for (const cId of newSelectedCourses) {
    const r = await apiFetch(`/courses/${cId}/enroll-student`,{method:'POST',body:JSON.stringify({studentId:newStudentId})});
    if(r?.ok) ok++;
  }
  btn.disabled=false;
  closeModal('create-modal');
  showToast(`Student created and enrolled in ${ok} subject(s)!`,'success');
  await loadStudents();
}

// ── MANAGE ENROLLMENT (existing) ─────────────────────────────────────────────
async function openEnrollModal(sid) {
  emStudentId=sid; emSelectedCourses.clear();
  const s = allStudents.find(x=>x._id===sid);
  if(!s) return;
  document.getElementById('em-name').textContent    = `${s.firstName} ${s.lastName}`;
  document.getElementById('em-program').textContent = s.program||'';
  document.getElementById('em-id').textContent      = s.studentId||'';
  emStudentEnrolled = new Set((s.enrolledCourses||[]).map(c=>c._id||c));
  openModal('enroll-modal');
  renderEMList(allCourses);
}

function filterEM() {
  const q = document.getElementById('em-search').value.toLowerCase();
  renderEMList(allCourses.filter(c=>c.courseCode.toLowerCase().includes(q)||c.courseName.toLowerCase().includes(q)));
}

function renderEMList(courses) {
  const el = document.getElementById('em-list');
  if(!courses.length){el.innerHTML=`<div style="text-align:center;padding:24px;color:var(--text-muted)">No courses found.</div>`;return;}
  el.innerHTML = courses.map(c => {
    const enrolled = emStudentEnrolled.has(c._id);
    const selected = emSelectedCourses.has(c._id);
    const cls = enrolled?'already':selected?'selected':'';
    return `<div class="course-enroll-item ${cls}" onclick="toggleEM('${c._id}',${enrolled})">
      <div class="enroll-checkbox">${enrolled||selected?'<i class="fa-solid fa-check"></i>':''}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
          <span style="font-size:11px;font-weight:700;color:var(--gold);background:var(--gold-dim);padding:2px 8px;border-radius:5px">${escHtml(c.courseCode)}</span>
          <span style="font-size:11px;color:var(--text-muted)">${c.units} units</span>
          ${enrolled?'<span style="font-size:10px;font-weight:700;color:var(--teal)">ENROLLED</span>':''}
        </div>
        <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${escHtml(c.courseName)}</div>
        <div style="font-size:11px;color:var(--text-muted)">${escHtml(c.instructor||'')}</div>
      </div>
    </div>`;
  }).join('');
}

function toggleEM(id, enrolled) {
  if(enrolled) return;
  if(emSelectedCourses.has(id)) emSelectedCourses.delete(id);
  else emSelectedCourses.add(id);
  filterEM();
}

async function saveEnrollment() {
  if(emSelectedCourses.size===0){closeModal('enroll-modal');return;}
  const btn = document.querySelector('#enroll-modal .btn-gold');
  btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
  let ok=0;
  for(const cId of emSelectedCourses){
    const r=await apiFetch(`/courses/${cId}/enroll-student`,{method:'POST',body:JSON.stringify({studentId:emStudentId})});
    if(r?.ok) ok++;
  }
  btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-floppy-disk"></i> Save Changes';
  closeModal('enroll-modal');
  showToast(`Enrolled in ${ok} new subject(s).`,'success');
  await loadStudents();
}

// ── EDIT ─────────────────────────────────────────────────────────────────────
function openEdit(s) {
  document.getElementById('edit-id').value        = s._id;
  document.getElementById('edit-firstname').value = s.firstName||'';
  document.getElementById('edit-lastname').value  = s.lastName||'';
  document.getElementById('edit-program').value   = s.program||'';
  document.getElementById('edit-year').value      = s.yearLevel||'';
  document.getElementById('edit-section').value   = s.section||'';
  document.getElementById('edit-active').value    = String(s.isActive);
  openModal('edit-modal');
}

async function saveStudent() {
  const id = document.getElementById('edit-id').value;
  const body = {
    firstName: document.getElementById('edit-firstname').value.trim(),
    lastName:  document.getElementById('edit-lastname').value.trim(),
    program:   document.getElementById('edit-program').value.trim(),
    yearLevel: Number(document.getElementById('edit-year').value)||undefined,
    section:   document.getElementById('edit-section').value.trim(),
    isActive:  document.getElementById('edit-active').value==='true'
  };
  const res = await apiFetch(`/admin/students/${id}`,{method:'PUT',body:JSON.stringify(body)});
  closeModal('edit-modal');
  if(res?.ok){showToast('Student updated.','success');await loadStudents();}
  else showToast(res?.data?.message||'Update failed.','error');
}

async function toggleActive(id, name, current) {
  const res = await apiFetch(`/admin/students/${id}`,{method:'PUT',body:JSON.stringify({isActive:!current})});
  if(res?.ok){showToast(`${name} ${!current?'activated':'deactivated'}.`,'success');await loadStudents();}
  else showToast('Action failed.','error');
}
