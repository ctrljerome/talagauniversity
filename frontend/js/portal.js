const API='/api';
const esc=s=>s?String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):'';

function requireAuth(){
  const token=localStorage.getItem('token'),user=JSON.parse(localStorage.getItem('user')||'null');
  if(!token||!user){window.location.href='/index.html';return null}
  return{token,user};
}
function requireAdmin(){
  const a=requireAuth();if(!a)return null;
  if(a.user.role!=='admin'){window.location.href='/dashboard.html';return null}
  return a;
}

async function apiFetch(path,opts={}){
  const token=localStorage.getItem('token');
  const res=await fetch(`${API}${path}`,{...opts,headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`,...(opts.headers||{})}});
  if(res.status===401){logout();return null}
  return{ok:res.ok,status:res.status,data:await res.json()};
}

function logout(){localStorage.removeItem('token');localStorage.removeItem('user');window.location.href='/index.html'}
function toggleSidebar(){const s=document.getElementById('sidebar'),o=document.getElementById('overlay');s.classList.toggle('open');o.classList.toggle('open')}

let _toastTimer;
function showToast(msg,type='info'){
  let el=document.getElementById('portal-toast');
  if(!el){el=document.createElement('div');el.id='portal-toast';document.body.appendChild(el)}
  clearTimeout(_toastTimer);el.textContent=msg;el.className=type;el.style.display='block';
  _toastTimer=setTimeout(()=>el.style.display='none',3500);
}

function openModal(id){const el=document.getElementById(id);if(el){el.classList.add('open');document.body.style.overflow='hidden'}}
function closeModal(id){const el=document.getElementById(id);if(el){el.classList.remove('open');document.body.style.overflow=''}}

function formatDate(d){return d?new Date(d).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}):'—'}
function formatPeso(n){return '₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2})}

function initSidebar(){
  const user=JSON.parse(localStorage.getItem('user')||'null');if(!user)return;
  const name=(user.fullName||`${user.firstName||''} ${user.lastName||''}`).trim();
  const initials=name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  const av=document.getElementById('sb-avatar');if(av)av.textContent=initials;
  const nm=document.getElementById('sb-name');if(nm)nm.textContent=name;
  const rl=document.getElementById('sb-role');if(rl)rl.textContent=user.studentId||user.role;
  const mav=document.getElementById('mob-av');if(mav)mav.textContent=initials;
  // date chip
  const dc=document.getElementById('date-chip');
  if(dc)dc.textContent=new Date().toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  // active nav
  const page=window.location.pathname.split('/').pop().replace('.html','');
  document.querySelectorAll('.nav-item').forEach(el=>{el.classList.toggle('active',el.dataset.page===page)});
}

window.addEventListener('DOMContentLoaded',initSidebar);
