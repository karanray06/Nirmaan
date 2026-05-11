import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const loginBtn = document.getElementById('loginBtn');
  const adminPassword = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const exportBtn = document.getElementById('exportBtn');
  
  // Basic password auth (For secure auth, use Supabase Auth in production)
  loginBtn.addEventListener('click', () => {
    const pwd = adminPassword.value;
    if(pwd === (import.meta.env.VITE_ADMIN_PASSWORD || 'nirmaan2026admin')) {
      loginSection.style.display = 'none';
      dashboardSection.style.display = 'block';
      loadData();
    } else {
      loginError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', () => {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    adminPassword.value = '';
  });

  let delegatesData = [];

  async function loadData() {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      delegatesData = data;
      renderDashboard();
    } catch (err) {
      console.error(err);
      alert("Error loading data from Supabase.");
    }
  }

  function renderDashboard() {
    // Stats
    document.getElementById('statTotal').innerText = delegatesData.length;
    document.getElementById('statVerified').innerText = delegatesData.filter(d => d.payment_status === 'verified').length;
    document.getElementById('statPending').innerText = delegatesData.filter(d => d.payment_status === 'pending').length;
    
    // Most popular committee
    const counts = {};
    delegatesData.forEach(d => { counts[d.committee_1] = (counts[d.committee_1] || 0) + 1; });
    let pop = '-';
    let max = 0;
    for(const [c, count] of Object.entries(counts)) {
      if(count > max) { max = count; pop = c; }
    }
    document.getElementById('statPopular').innerText = pop;

    // Table
    const tbody = document.getElementById('delegatesTable');
    tbody.innerHTML = '';
    
    delegatesData.forEach(d => {
      const tr = document.createElement('tr');
      const isVerified = d.payment_status === 'verified';
      
      tr.innerHTML = `
        <td style="font-family:var(--font-display); color:var(--gold-accent);">${d.delegate_id}</td>
        <td><strong>${d.full_name}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${d.email}</span></td>
        <td>${d.committee_1}</td>
        <td>${d.school}</td>
        <td><span style="text-transform:capitalize;">${d.experience}</span></td>
        <td>
          <span class="badge-status ${isVerified ? 'badge-verified' : 'badge-pending'}" id="status-${d.id}">
            ${d.payment_status}
          </span>
        </td>
        <td>
          ${d.payment_proof ? `<a href="${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${d.payment_proof}" target="_blank" style="font-size:0.8rem; color:var(--gold-accent); display:block; margin-bottom:4px;">View Proof</a>` : ''}
          ${!isVerified ? `<button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.7rem;" onclick="verifyPayment('${d.id}')">Verify</button>` : ''}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.verifyPayment = async (id) => {
    if(!confirm("Mark this payment as verified?")) return;
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ payment_status: 'verified' })
        .eq('id', id);
        
      if(error) throw error;
      loadData(); // reload
    } catch(err) {
      console.error(err);
      alert("Error verifying payment.");
    }
  };

  // CSV Export
  exportBtn.addEventListener('click', () => {
    if(!delegatesData.length) return alert("No data to export.");
    
    const headers = ["Delegate ID", "Full Name", "Email", "Phone", "School", "Grade", "Committee 1", "Committee 2", "Country Pref", "Experience", "Payment Status", "Date"];
    
    let csv = headers.join(',') + '\n';
    
    delegatesData.forEach(d => {
      const row = [
        d.delegate_id,
        `"${d.full_name}"`,
        d.email,
        d.phone,
        `"${d.school}"`,
        d.grade_year,
        d.committee_1,
        d.committee_2,
        `"${d.country_pref}"`,
        d.experience,
        d.payment_status,
        new Date(d.created_at).toLocaleDateString()
      ];
      csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "nirmaan_registrations.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});
