(async()=>{
  requireAuth();
  const res = await apiFetch('/auth/me');
  if(!res?.ok) return showToast('Failed to load profile','error');
  const user = res.data.user;
  render(user);
})();

function render(user){
  const name=`${user.firstName} ${user.lastName}`;
  const initials=name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  const ord=n=>{const s=['th','st','nd','rd'],v=n%100;return s[(v-20)%10]||s[v]||s[0]};

  document.getElementById('av').textContent=initials;
  document.getElementById('p-name').textContent=name;
  document.getElementById('p-id').textContent=user.studentId||'—';
  document.getElementById('p-program').textContent=user.program||'—';
  document.getElementById('p-year').textContent=user.yearLevel?`${user.yearLevel}${ord(user.yearLevel)} Year`:'—';
  document.getElementById('p-section').textContent=user.section||'—';
  document.getElementById('p-email').textContent=user.email||'—';
  document.getElementById('p-contact').textContent=user.contactNumber||'—';
  document.getElementById('p-address').textContent=user.address||'—';
  document.getElementById('p-enrolled').textContent=(user.enrolledCourses?.length||0)+' subject(s)';

  // Change password form
  document.getElementById('pw-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const cur=document.getElementById('pw-current').value;
    const nw=document.getElementById('pw-new').value;
    const conf=document.getElementById('pw-confirm').value;
    if(!cur||!nw||!conf) return showToast('Please fill in all password fields.','error');
    if(nw.length<8) return showToast('New password must be at least 8 characters.','error');
    if(nw!==conf) return showToast('New passwords do not match.','error');
    const btn=document.getElementById('pw-btn');
    btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Updating…';
    const res=await apiFetch('/auth/change-password',{method:'PUT',body:JSON.stringify({currentPassword:cur,newPassword:nw})});
    btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-key"></i> Update Password';
    if(res?.ok){showToast('Password updated successfully!','success');document.getElementById('pw-form').reset();}
    else showToast(res?.data?.message||'Failed to change password.','error');
  });
}
