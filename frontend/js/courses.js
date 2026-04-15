(async()=>{
  requireAuth();
  const res = await apiFetch('/courses/enrolled');
  if(!res?.ok) return showToast('Failed to load courses','error');
  const courses = res.data.courses||[];

  // Stats
  const totalUnits = courses.reduce((s,c)=>s+(c.units||0),0);
  document.getElementById('stat-subj').textContent  = courses.length;
  document.getElementById('stat-units').textContent = totalUnits;

  // Course cards
  const grid = document.getElementById('course-grid');
  if(!courses.length){
    grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-book-open"></i><p>No subjects enrolled yet.<br><span style="color:var(--gold)">Contact the Registrar's Office for enrollment.</span></p></div>`;
  } else {
    const DEPT_COLORS={'Computer Science':'var(--gold)','Mathematics':'var(--teal)','English':'var(--purple)','Physical Education':'var(--green)'};
    grid.innerHTML = courses.map(c=>{
      const color = DEPT_COLORS[c.department]||'#60a5fa';
      const sched = (c.schedule||[]).map(s=>`${s.day.substring(0,3)} ${s.startTime}–${s.endTime}`).join(' · ');
      return `<div class="card" style="border-top:3px solid ${color}">
        <div style="padding:20px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <span class="badge bg-gold" style="color:${color};background:${color}22;border-color:${color}44">${esc(c.courseCode)}</span>
            <span style="font-size:11px;color:var(--text-m);background:var(--ink-deep);padding:3px 10px;border-radius:5px">${c.units} units</span>
          </div>
          <h3 style="font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--text-h);margin-bottom:10px;line-height:1.35">${esc(c.courseName)}</h3>
          <div style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--text-m)">
            <span><i class="fa-solid fa-user-tie" style="width:14px;color:${color}"></i> ${esc(c.instructor||'—')}</span>
            ${sched?`<span><i class="fa-solid fa-clock" style="width:14px;color:${color}"></i> ${esc(sched)}</span>`:''}
            ${c.schedule?.[0]?.room?`<span><i class="fa-solid fa-door-open" style="width:14px;color:${color}"></i> ${esc(c.schedule[0].room)}</span>`:''}
            ${c.department?`<span><i class="fa-solid fa-building-columns" style="width:14px;color:${color}"></i> ${esc(c.department)}</span>`:''}
          </div>
        </div>
        <div style="padding:10px 20px;border-top:1px solid var(--ink-border)">
          <span style="font-size:11px;color:var(--text-m)"><i class="fa-solid fa-circle-info" style="color:var(--gold);margin-right:5px"></i>Contact the Registrar to drop this subject</span>
        </div>
      </div>`;
    }).join('');
  }

  // Schedule table
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const slots = [];
  courses.forEach(c=>(c.schedule||[]).forEach(s=>slots.push({...s,courseCode:c.courseCode,courseName:c.courseName,instructor:c.instructor})));
  slots.sort((a,b)=>DAYS.indexOf(a.day)-DAYS.indexOf(b.day));

  const tbody = document.getElementById('sched-body');
  if(!slots.length){
    tbody.innerHTML=`<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-m)">No schedule data available.</td></tr>`;
  } else {
    tbody.innerHTML = slots.map(s=>`<tr>
      <td><span class="badge bg-gold">${esc(s.day)}</span></td>
      <td><strong>${esc(s.courseCode)}</strong><div class="sub">${esc(s.courseName)}</div></td>
      <td>${esc(s.startTime)} – ${esc(s.endTime)}</td>
      <td>${esc(s.room||'—')}</td>
      <td>${esc(s.instructor||'—')}</td>
    </tr>`).join('');
  }
})();
