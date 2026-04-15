(async()=>{
  requireAuth();
  const res = await apiFetch('/payments');
  if(!res?.ok) return showToast('Failed to load payment data','error');
  const payments = res.data.payments||[];
  const container = document.getElementById('payments-container');

  if(!payments.length){
    container.innerHTML=`<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>No payment records found.<br>Enroll in subjects to generate a billing statement.</p></div>`;
    return;
  }

  const METHOD_ICONS={'Cash':'fa-money-bill','GCash':'fa-mobile-screen','Maya':'fa-mobile-screen','Online Transfer':'fa-building-columns','Bank Deposit':'fa-building'};

  container.innerHTML = payments.map(p=>{
    const pct = p.totalAmount>0?Math.min(100,(p.amountPaid/p.totalAmount)*100):0;
    const barColor = p.status==='Paid'?'var(--green)':p.status==='Partial'?'var(--warning)':'var(--danger)';
    const statusClass = p.status==='Paid'?'bg-green':p.status==='Partial'?'bg-orange':'bg-red';
    return `<div class="card" style="margin-bottom:20px">
      <div class="card-head">
        <div>
          <h2 class="card-title"><i class="fa-solid fa-file-invoice-dollar"></i>${esc(p.semester)} Semester — AY ${esc(p.academicYear)}</h2>
        </div>
        <span class="badge ${statusClass}" style="font-size:13px;padding:6px 14px">${esc(p.status)}</span>
      </div>
      <!-- Progress bar -->
      <div style="padding:18px 22px;border-bottom:1px solid var(--ink-border)">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px">
          <span style="color:var(--text-m)">Payment Progress</span>
          <span style="color:var(--text-h);font-weight:600">${pct.toFixed(1)}% paid</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${barColor}"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px">
          <span style="color:var(--text-m)">Paid: <strong style="color:var(--green)">${formatPeso(p.amountPaid)}</strong></span>
          <span style="color:var(--text-m)">Balance: <strong style="color:${p.balance>0?'var(--danger)':'var(--green)'}">${formatPeso(p.balance)}</strong></span>
        </div>
      </div>
      <!-- Breakdown + Transactions -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
        <div style="padding:20px 22px;border-right:1px solid var(--ink-border)">
          <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-m);margin-bottom:14px">Fee Breakdown</h3>
          ${feeRow('Tuition Fee',p.tuitionFee)}
          ${feeRow('Miscellaneous',p.miscFee)}
          ${feeRow('Laboratory',p.labFee)}
          ${feeRow('Registration',p.registrationFee)}
          ${p.otherFees>0?feeRow('Other Fees',p.otherFees):''}
          <div style="border-top:1px solid var(--ink-border);padding-top:10px;margin-top:10px;display:flex;justify-content:space-between">
            <span style="font-weight:700;color:var(--text-h)">Total Due</span>
            <span style="font-weight:700;color:var(--gold-lt);font-size:16px;font-family:'Cormorant Garamond',serif">${formatPeso(p.totalAmount)}</span>
          </div>
        </div>
        <div style="padding:20px 22px">
          <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-m);margin-bottom:14px">Transaction History</h3>
          ${p.transactions?.length ? p.transactions.map(t=>`
            <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(28,48,80,0.4)">
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--text-h)">${formatPeso(t.amount)}</div>
                <div style="font-size:11px;color:var(--text-m);margin-top:2px">
                  <i class="fa-solid ${METHOD_ICONS[t.method]||'fa-credit-card'}" style="margin-right:4px"></i>${esc(t.method)}
                  ${t.referenceNumber?` · <span style="color:var(--gold)">${esc(t.referenceNumber)}</span>`:''}
                </div>
              </div>
              <div style="font-size:11px;color:var(--text-m)">${formatDate(t.date)}</div>
            </div>`).join('')
          : '<div style="text-align:center;padding:20px;color:var(--text-m);font-size:13px"><i class="fa-solid fa-inbox" style="font-size:22px;display:block;margin-bottom:8px;opacity:0.4"></i>No transactions yet</div>'}
        </div>
      </div>
      <div style="padding:12px 22px;font-size:12px;color:var(--text-m);border-top:1px solid var(--ink-border)">
        <i class="fa-solid fa-circle-info" style="color:var(--gold);margin-right:6px"></i>
        For payment concerns, visit the Cashier's Office or call (045) 000-0000.
      </div>
    </div>`;
  }).join('');
})();

function feeRow(label, amount){
  return `<div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0">
    <span style="color:var(--text-m)">${label}</span>
    <span style="color:var(--text-b)">${formatPeso(amount)}</span>
  </div>`;
}
