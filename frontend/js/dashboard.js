(async()=>{
  const auth=requireAuth();if(!auth)return;
  const user=auth.user;
  document.getElementById('welcome-name').textContent=`Welcome, ${(user.firstName||'Student')}`;
  document.getElementById('meta-id').textContent=user.studentId||'—';

  const[gr,cr,py,an]=await Promise.all([apiFetch('/grades'),apiFetch('/courses/enrolled'),apiFetch('/payments'),apiFetch('/announcements')]);
  const courses=cr?.data?.courses||[];
  const grades=gr?.data?.grades||[];
  const summary=gr?.data?.summary||{};
  const payments=py?.data?.payments||[];
  const anns=an?.data?.announcements||[];

  document.getElementById('s-courses').textContent=courses.length;
  document.getElementById('s-gwa').textContent=summary.gpa?summary.gpa.toFixed(4):'N/A';
  document.getElementById('s-units').textContent=courses.reduce((s,c)=>s+(c.units||0),0);
  const bal=payments.reduce((s,p)=>s+(p.balance||0),0);
  document.getElementById('s-balance').textContent=bal>0?formatPeso(bal):'₱0.00';

  const cl=document.getElementById('courses-list');
  if(!courses.length){cl.innerHTML=`<div class="empty-state"><i class="fa-solid fa-book-open"></i><p>No subjects enrolled yet.<br>Contact the Registrar's Office for enrollment.</p></div>`}
  else cl.innerHTML=courses.slice(0,6).map(c=>`
    <div class="course-row">
      <span class="cr-code">${esc(c.courseCode)}</span>
      <div class="cr-info"><div class="cr-name">${esc(c.courseName)}</div><div class="cr-instr"><i class="fa-solid fa-user-tie" style="font-size:10px;margin-right:4px;color:var(--text-m)"></i>${esc(c.instructor||'—')}</div></div>
      <span class="cr-units">${c.units} units</span>
    </div>`).join('');

  const TYPE={general:{c:'var(--text-m)',bg:'rgba(96,120,152,0.12)'},academic:{c:'var(--teal)',bg:'rgba(45,200,180,0.1)'},payment:{c:'var(--danger)',bg:'rgba(224,85,85,0.1)'},event:{c:'var(--purple)',bg:'rgba(155,127,234,0.1)'},urgent:{c:'var(--warning)',bg:'rgba(240,165,0,0.1)'}};
  const al=document.getElementById('ann-list');
  if(!anns.length){al.innerHTML=`<div class="empty-state"><i class="fa-solid fa-bullhorn"></i><p>No announcements at this time.</p></div>`}
  else al.innerHTML=anns.slice(0,5).map(a=>{const t=TYPE[a.type]||TYPE.general;return`
    <div class="ann-row" onclick="window.location.href='announcements.html'">
      <div class="ann-row-hd">
        <div class="ann-row-title">${a.isPinned?'📌 ':''}${esc(a.title)}</div>
        <span class="ann-type-tag" style="background:${t.bg};color:${t.c}">${a.type}</span>
      </div>
      <div class="ann-row-date">${formatDate(a.publishedAt)}</div>
    </div>`}).join('');
})();
