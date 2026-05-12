import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const loginBtn = document.getElementById('loginBtn');
  const adminPassword = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const exportBtn = document.getElementById('exportBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const searchInput = document.getElementById('searchInput');
  const filterCommittee = document.getElementById('filterCommittee');
  const filterStatus = document.getElementById('filterStatus');
  
  let delegatesData = [];

  // Enter key on password field
  adminPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  // Login
  loginBtn.addEventListener('click', () => {
    const pwd = adminPassword.value;
    if (pwd === (import.meta.env.VITE_ADMIN_PASSWORD || 'nirmaan2026admin')) {
      loginSection.style.display = 'none';
      dashboardSection.style.display = 'block';
      checkSupabaseConnection();
      loadData();
    } else {
      loginError.style.display = 'block';
      adminPassword.style.borderColor = '#ff6b6b';
      setTimeout(() => { loginError.style.display = 'none'; adminPassword.style.borderColor = ''; }, 3000);
    }
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    dashboardSection.style.display = 'none';
    loginSection.style.display = 'flex';
    adminPassword.value = '';
  });

  // Refresh
  refreshBtn.addEventListener('click', () => loadData());

  // Search & Filters
  searchInput.addEventListener('input', renderTable);
  filterCommittee.addEventListener('change', renderTable);
  filterStatus.addEventListener('change', renderTable);

  // Check Supabase connection
  async function checkSupabaseConnection() {
    const dot = document.getElementById('dbDot');
    const text = document.getElementById('dbText');
    try {
      const { error } = await supabase.from('registrations').select('id', { count: 'exact', head: true });
      if (error) throw error;
      dot.className = 'db-dot connected';
      text.textContent = 'Supabase Connected';
    } catch (err) {
      dot.className = 'db-dot disconnected';
      text.textContent = 'Supabase Error';
      console.error('Supabase connection error:', err);
    }
  }

  // Load data
  async function loadData() {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      delegatesData = data || [];
      document.getElementById('lastUpdated').textContent = 'Last updated: ' + new Date().toLocaleTimeString();
      renderStats();
      renderTable();
      renderCommitteeBreakdown();
    } catch (err) {
      console.error('Data load error:', err);
      document.getElementById('delegatesTable').innerHTML = `
        <tr><td colspan="8" class="empty-state">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <p>Could not connect to Supabase.<br>Check your environment variables.</p>
          <p style="font-size:.75rem; margin-top:.5rem; color:rgba(255,107,107,.6);">${err.message || err}</p>
        </td></tr>`;
    }
  }

  // Render stats
  function renderStats() {
    const total = delegatesData.length;
    const verified = delegatesData.filter(d => d.payment_status === 'verified').length;
    const pending = delegatesData.filter(d => d.payment_status === 'pending').length;
    
    // Revenue estimate (₹1800 early bird average for verified)
    const revenue = verified * 1800;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statVerified').textContent = verified;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statRevenue').textContent = '₹' + revenue.toLocaleString('en-IN');

    // Most popular committee
    const counts = {};
    delegatesData.forEach(d => { if (d.committee_1) counts[d.committee_1] = (counts[d.committee_1] || 0) + 1; });
    let pop = '—', max = 0;
    for (const [c, count] of Object.entries(counts)) {
      if (count > max) { max = count; pop = c; }
    }
    document.getElementById('statPopular').textContent = pop;
  }

  // Render table with search/filter
  function renderTable() {
    const search = (searchInput.value || '').toLowerCase();
    const commFilter = filterCommittee.value;
    const statusFilter = filterStatus.value;

    let filtered = delegatesData.filter(d => {
      const matchSearch = !search || 
        (d.full_name || '').toLowerCase().includes(search) ||
        (d.email || '').toLowerCase().includes(search) ||
        (d.school || '').toLowerCase().includes(search) ||
        (d.delegate_id || '').toLowerCase().includes(search) ||
        (d.phone || '').includes(search);
      const matchComm = commFilter === 'all' || d.committee_1 === commFilter;
      const matchStatus = statusFilter === 'all' || d.payment_status === statusFilter;
      return matchSearch && matchComm && matchStatus;
    });

    document.getElementById('tableCount').textContent = `Showing ${filtered.length} of ${delegatesData.length} delegates`;

    const tbody = document.getElementById('delegatesTable');
    
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>${delegatesData.length === 0 ? 'No registrations yet' : 'No delegates match your search'}</p>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(d => {
      const status = d.payment_status || 'pending';
      const badgeClass = status === 'verified' ? 'badge-verified' : status === 'rejected' ? 'badge-rejected' : 'badge-pending';
      const proofUrl = d.payment_proof ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${d.payment_proof}` : null;
      
      return `<tr>
        <td><span class="del-id">${d.delegate_id || '—'}</span></td>
        <td><div class="del-name">${d.full_name || '—'}</div><div class="del-email">${d.email || ''}</div></td>
        <td>${d.phone || '—'}</td>
        <td>${d.school || '—'}</td>
        <td>${d.committee_1 || '—'}</td>
        <td style="text-transform:capitalize;">${d.experience || '—'}</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
        <td>
          ${proofUrl ? `<a href="${proofUrl}" target="_blank" class="btn-view-proof">View Proof</a>` : ''}
          ${status !== 'verified' ? `<button class="action-btn btn-verify" onclick="verifyPayment('${d.id}')">✓ Verify</button>` : ''}
          ${status !== 'rejected' ? `<button class="action-btn btn-reject" onclick="rejectPayment('${d.id}')">✗ Reject</button>` : ''}
        </td>
      </tr>`;
    }).join('');
  }

  // Committee breakdown
  function renderCommitteeBreakdown() {
    const counts = {};
    const committees = ['UNCSW', 'UNHRC', 'AIPPM', 'IIA', 'IP', 'Moot Court'];
    committees.forEach(c => counts[c] = 0);
    delegatesData.forEach(d => { if (d.committee_1 && counts[d.committee_1] !== undefined) counts[d.committee_1]++; });
    
    const maxCount = Math.max(...Object.values(counts), 1);
    const container = document.getElementById('committeeBreakdown');
    
    container.innerHTML = committees.map(c => `
      <div class="comm-bar-card">
        <h5>${c}</h5>
        <div style="display:flex; justify-content:space-between; align-items:baseline;">
          <span class="comm-name">${counts[c]} delegates</span>
          <span class="comm-count">${delegatesData.length ? Math.round(counts[c]/delegatesData.length*100) : 0}%</span>
        </div>
        <div class="comm-bar"><div class="comm-bar-fill" style="width:${(counts[c]/maxCount)*100}%"></div></div>
      </div>
    `).join('');
  }

  // Verify payment
  window.verifyPayment = async (id) => {
    if (!confirm('Mark this payment as VERIFIED?')) return;
    try {
      const { error } = await supabase.from('registrations').update({ payment_status: 'verified' }).eq('id', id);
      if (error) throw error;
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error verifying: ' + err.message);
    }
  };

  // Reject payment
  window.rejectPayment = async (id) => {
    if (!confirm('Mark this payment as REJECTED?')) return;
    try {
      const { error } = await supabase.from('registrations').update({ payment_status: 'rejected' }).eq('id', id);
      if (error) throw error;
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error rejecting: ' + err.message);
    }
  };

  // CSV Export
  exportBtn.addEventListener('click', () => {
    if (!delegatesData.length) return alert('No data to export.');
    
    const headers = ['Delegate ID', 'Full Name', 'Email', 'Phone', 'School', 'Grade', 'Committee 1', 'Committee 2', 'Country Pref', 'Experience', 'Payment Status', 'Date'];
    let csv = headers.join(',') + '\n';
    
    delegatesData.forEach(d => {
      const row = [
        d.delegate_id,
        `"${d.full_name || ''}"`,
        d.email,
        d.phone,
        `"${d.school || ''}"`,
        d.grade_year,
        d.committee_1,
        d.committee_2,
        `"${d.country_pref || ''}"`,
        d.experience,
        d.payment_status,
        new Date(d.created_at).toLocaleDateString()
      ];
      csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nirmaan_registrations_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  });

  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
});
