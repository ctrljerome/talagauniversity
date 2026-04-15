(async()=>{
  requireAuth();
  const res = await apiFetch('/grades');
  if(!res?.ok) return showToast('Failed to load grades','error');
  const grades  = res.data.grades||[];
  const summary = res.data.summary||{};

  // GWA
  const gwaEl = document.getElementById('gwa-val');
  if(gwaEl) gwaEl.textContent = summary.gpa ? summary.gpa.toFixed(4) : 'N/A';

  // Stats
  const passed     = grades.filter(g=>g.remarks==='Passed').length;
  const inProgress = grades.filter(g=>g.remarks==='In Progress').length;
  const failed     = grades.filter(g=>g.remarks==='Failed').length;
  document.getElementById('s-passed').textContent     = passed;
  document.getElementById('s-progress').textContent   = inProgress;
  document.getElementById('s-failed').textContent     = failed;

  if(grades[0]) document.getElementById('sem-label').textContent=`${grades[0].semester} Semester · AY ${grades[0].academicYear}`;

  // GP color
  const gpColor = gp => {
    if(!gp) return 'bg-gray';
    if(gp<=1.25) return 'bg-teal';
    if(gp<=2.00) return 'bg-gold';
    if(gp<=3.00) return 'bg-green';
    return 'bg-red';
  };

  const tbody = document.getElementById('grades-body');
  if(!grades.length){
    tbody.innerHTML=`<tr><td colspan="9" style="text-align:center;padding:48px;color:var(--text-m)"><i class="fa-solid fa-chart-line" style="font-size:28px;display:block;margin-bottom:12px;opacity:0.3"></i>No grade records found.</td></tr>`;
  } else {
    const remarkClass = r => r==='Passed'?'bg-green':r==='Failed'?'bg-red':r==='In Progress'?'bg-orange':'bg-gray';
    tbody.innerHTML = grades.map(g=>`<tr>
      <td><strong>${esc(g.course?.courseCode||'—')}</strong><div class="sub">${esc(g.course?.courseName||'')}</div></td>
      <td style="text-align:center">${g.course?.units||'—'}</td>
      <td style="text-align:center">${g.prelimGrade??'<span style="color:var(--text-m)">—</span>'}</td>
      <td style="text-align:center">${g.midtermGrade??'<span style="color:var(--text-m)">—</span>'}</td>
      <td style="text-align:center">${g.semifinalGrade??'<span style="color:var(--text-m)">—</span>'}</td>
      <td style="text-align:center">${g.finalGrade??'<span style="color:var(--text-m)">—</span>'}</td>
      <td style="text-align:center"><strong style="color:var(--text-h);font-size:15px">${g.finalRating??'—'}</strong></td>
      <td style="text-align:center">${g.gpEquivalent?`<span class="badge ${gpColor(g.gpEquivalent)}">${g.gpEquivalent.toFixed(2)}</span>`:'<span style="color:var(--text-m)">—</span>'}</td>
      <td><span class="badge ${remarkClass(g.remarks)}">${esc(g.remarks)}</span></td>
    </tr>`).join('');
  }

  // Grading legend
  const legend=[
    {range:'97–100',gp:'1.00',label:'Excellent'},{range:'94–96',gp:'1.25',label:'Excellent'},
    {range:'91–93',gp:'1.50',label:'Superior'},{range:'88–90',gp:'1.75',label:'Superior'},
    {range:'85–87',gp:'2.00',label:'Very Good'},{range:'82–84',gp:'2.25',label:'Good'},
    {range:'79–81',gp:'2.50',label:'Good'},{range:'76–78',gp:'2.75',label:'Satisfactory'},
    {range:'75',gp:'3.00',label:'Passing'},{range:'Below 75',gp:'5.00',label:'Failed'}
  ];
  document.getElementById('grade-legend').innerHTML = legend.map(l=>`
    <div style="background:var(--ink-deep);border:1px solid var(--ink-border);border-radius:8px;padding:10px 14px">
      <div style="font-size:15px;font-weight:700;color:var(--text-h);font-family:'Cormorant Garamond',serif">${l.gp}</div>
      <div style="font-size:11px;color:var(--text-m)">${l.range}</div>
      <div style="font-size:11px;color:var(--gold);margin-top:2px">${l.label}</div>
    </div>`).join('');
})();
