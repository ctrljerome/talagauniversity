const API='/api';
function togglePw(){const i=document.getElementById('login-password'),c=document.getElementById('pw-icon');i.type=i.type==='password'?'text':'password';c.className=i.type==='password'?'fa-solid fa-eye':'fa-solid fa-eye-slash'}
function fillDemo(t){document.getElementById('login-email').value=t==='admin'?'admin@university.edu':'maria.santos@student.edu';document.getElementById('login-password').value=t==='admin'?'Admin@12345':'Student@123'}
function toast(msg,type='error'){const el=document.getElementById('toast');el.textContent=msg;el.className=`toast ${type} show`;if(type==='success')setTimeout(()=>el.className='toast',3000)}
document.getElementById('login-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const email=document.getElementById('login-email').value.trim();
  const pass=document.getElementById('login-password').value;
  if(!email||!pass)return toast('Please enter your email and password.');
  const btn=document.getElementById('login-btn');const lbl=document.getElementById('btn-label');
  btn.disabled=true;lbl.textContent='Signing in…';
  try{
    const res=await fetch(`${API}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pass})});
    const data=await res.json();
    if(!res.ok)return toast(data.message||'Invalid credentials.');
    localStorage.setItem('token',data.token);localStorage.setItem('user',JSON.stringify(data.user));
    toast('Welcome! Redirecting…','success');
    setTimeout(()=>{window.location.href=data.user.role==='admin'?'admin/dashboard.html':'dashboard.html'},700);
  }catch{toast('Network error. Is the server running?');}
  finally{btn.disabled=false;lbl.textContent='Sign In'}
});
(()=>{const t=localStorage.getItem('token'),u=JSON.parse(localStorage.getItem('user')||'null');if(t&&u)window.location.href=u.role==='admin'?'admin/dashboard.html':'dashboard.html'})();
