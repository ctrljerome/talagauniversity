const TYPE={
  general: {color:'var(--text-m)',  bg:'rgba(96,120,152,0.12)',  icon:'fa-circle-info',         label:'General'},
  academic:{color:'var(--teal)',    bg:'rgba(45,200,180,0.10)',  icon:'fa-graduation-cap',       label:'Academic'},
  payment: {color:'var(--danger)', bg:'rgba(224,85,85,0.10)',   icon:'fa-credit-card',          label:'Payment'},
  event:   {color:'var(--purple)', bg:'rgba(155,127,234,0.10)', icon:'fa-calendar-star',        label:'Event'},
  urgent:  {color:'var(--warning)',bg:'rgba(240,165,0,0.10)',   icon:'fa-triangle-exclamation', label:'Urgent'}
};
let allAnn=[];

(async()=>{
  requireAuth();
  const res = await apiFetch('/announcements');
  if(!res?.ok) return showToast('Failed to load announcements','error');
  allAnn = res.data.announcements||[];
  document.getElementById('ann-count').textContent=`${allAnn.length} announcement(s)`;
  render(allAnn);
})();

function filterAnn(){
  const t=document.getElementById('type-filter').value;
  const q=document.getElementById('ann-search').value.toLowerCase();
  const filtered=allAnn.filter(a=>(!t||a.type===t)&&(!q||a.title.toLowerCase().includes(q)||a.content.toLowerCase().includes(q)));
  render(filtered);
}

function render(list){
  const el=document.getElementById('ann-container');
  if(!list.length){el.innerHTML=`<div class="empty-state"><i class="fa-solid fa-bullhorn"></i><p>No announcements found.</p></div>`;return;}
  el.innerHTML=list.map(a=>{
    const t=TYPE[a.type]||TYPE.general;
    const preview=a.content.length>200?a.content.substring(0,200)+'…':a.content;
    return `<div class="card" style="margin-bottom:14px;cursor:pointer;border-left:4px solid ${t.color};transition:transform 0.2s,box-shadow 0.2s"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.3)'"
      onmouseout="this.style.transform='';this.style.boxShadow=''"
      onclick="openAnn('${a._id}')">
      <div style="padding:20px 22px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px">
          <h3 style="font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--text-h);line-height:1.35">
            ${a.isPinned?'<i class="fa-solid fa-thumbtack" style="color:var(--gold);font-size:12px;margin-right:6px"></i>':''}${esc(a.title)}
          </h3>
          <span style="display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;background:${t.bg};color:${t.color}">
            <i class="fa-solid ${t.icon}"></i>${t.label}
          </span>
        </div>
        <p style="font-size:13px;color:var(--text-m);line-height:1.7;margin-bottom:10px">${esc(preview)}</p>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-m)">
          <span><i class="fa-solid fa-user-shield" style="color:${t.color};margin-right:5px"></i>${a.createdBy?esc(a.createdBy.firstName+' '+a.createdBy.lastName):'Administration'}</span>
          <span><i class="fa-regular fa-clock" style="margin-right:4px"></i>${formatDate(a.publishedAt)}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openAnn(id){
  const a=allAnn.find(x=>x._id===id);if(!a)return;
  const t=TYPE[a.type]||TYPE.general;
  document.getElementById('ann-modal-title').textContent=a.title;
  document.getElementById('ann-modal-meta').innerHTML=`
    <span style="display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;font-size:11px;font-weight:700;background:${t.bg};color:${t.color}"><i class="fa-solid ${t.icon}"></i>${t.label}</span>
    <span style="font-size:12px;color:var(--text-m)"><i class="fa-regular fa-clock" style="margin-right:5px"></i>${formatDate(a.publishedAt)}</span>
    ${a.isPinned?'<span style="font-size:12px;color:var(--gold)"><i class="fa-solid fa-thumbtack" style="margin-right:4px"></i>Pinned</span>':''}`;
  document.getElementById('ann-modal-body').textContent=a.content;
  openModal('ann-modal');
}
