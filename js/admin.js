import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const dashboard = document.getElementById('dashboardSection');
  const loginBtn = document.getElementById('loginBtn');
  const pwdInput = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');

  let delegates = [];
  let adminPwd = import.meta.env.VITE_ADMIN_PASSWORD || 'nirmaan2026admin';

  // Toast
  function toast(msg, type = 'ok') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type}`;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
  }

  // Login
  pwdInput.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });
  loginBtn.addEventListener('click', async () => {
    // Try DB password first
    let dbPwd = null;
    try {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'admin_password').single();
      if (data) dbPwd = data.value;
    } catch (e) { /* table may not exist yet */ }

    const valid = pwdInput.value === (dbPwd || adminPwd);
    if (valid) {
      if (dbPwd) adminPwd = dbPwd;
      loginSection.style.display = 'none';
      dashboard.style.display = 'block';
      checkDB();
      loadDelegates();
      loadTeam();
      loadMessages();
      loadSchedule();
      loadThemes();
      loadSettings();
    } else {
      loginError.style.display = 'block';
      setTimeout(() => loginError.style.display = 'none', 3000);
    }
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    dashboard.style.display = 'none';
    loginSection.style.display = 'flex';
    pwdInput.value = '';
  });

  // Tab Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById('tab-' + item.dataset.tab);
      if(target) target.classList.add('active');
      
      // Refresh messages / schedule / themes if clicking respective tab
      if (item.dataset.tab === 'messages') loadMessages();
      if (item.dataset.tab === 'schedule') loadSchedule();
      if (item.dataset.tab === 'themes') loadThemes();
    });
  });

  // DB Check
  async function checkDB() {
    const dot = document.getElementById('dbDot');
    const txt = document.getElementById('dbText');
    try {
      const { error } = await supabase.from('registrations').select('id', { count: 'exact', head: true });
      if (error) throw error;
      dot.className = 'db-dot ok';
      txt.textContent = 'Connected';
    } catch {
      dot.className = 'db-dot err';
      txt.textContent = 'DB Error';
    }
  }

  // ====== DELEGATES TAB ======
  async function loadDelegates() {
    try {
      const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      delegates = data || [];
      document.getElementById('lastUp').textContent = 'Updated: ' + new Date().toLocaleTimeString();
      renderStats();
      renderDelegates();
      renderCommBreakdown();
    } catch (err) {
      document.getElementById('delTable').innerHTML = `<tr><td colspan="8" class="empty">Error: ${err.message}</td></tr>`;
    }
  }

  function renderStats() {
    const t = delegates.length, v = delegates.filter(d => d.payment_status === 'verified').length, p = delegates.filter(d => d.payment_status === 'pending').length;
    document.getElementById('statTotal').textContent = t;
    document.getElementById('statVerified').textContent = v;
    document.getElementById('statPending').textContent = p;
    document.getElementById('statRevenue').textContent = '₹' + (v * 1800).toLocaleString('en-IN');
    const counts = {};
    delegates.forEach(d => { if (d.committee_1) counts[d.committee_1] = (counts[d.committee_1] || 0) + 1; });
    let pop = '—', max = 0;
    for (const [c, n] of Object.entries(counts)) { if (n > max) { max = n; pop = c; } }
    document.getElementById('statPopular').textContent = pop;
  }

  function renderDelegates() {
    const q = (document.getElementById('searchInput').value || '').toLowerCase();
    const cf = document.getElementById('filterComm').value;
    const sf = document.getElementById('filterStatus').value;
    const filtered = delegates.filter(d => {
      const mq = !q || [d.full_name, d.email, d.school, d.delegate_id, d.phone].some(v => (v || '').toLowerCase().includes(q));
      return mq && (cf === 'all' || d.committee_1 === cf) && (sf === 'all' || d.payment_status === sf);
    });
    document.getElementById('tblCount').textContent = `${filtered.length} of ${delegates.length} delegates`;
    const tbody = document.getElementById('delTable');
    if (!filtered.length) { tbody.innerHTML = `<tr><td colspan="8" class="empty">${delegates.length ? 'No matches' : 'No registrations yet'}</td></tr>`; return; }
    tbody.innerHTML = filtered.map(d => {
      const s = d.payment_status || 'pending';
      const bc = s === 'verified' ? 'badge-ok' : s === 'rejected' ? 'badge-err' : 'badge-warn';
      const proof = d.payment_proof ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${d.payment_proof}` : null;
      return `<tr>
        <td style="color:#c9a96e;font-weight:600;font-size:.8rem">${d.delegate_id || '—'}</td>
        <td><strong>${d.full_name || '—'}</strong><br><span style="font-size:.7rem;color:rgba(240,212,218,.35)">${d.email || ''}</span></td>
        <td>${d.phone || '—'}</td><td>${d.school || '—'}</td><td>${d.committee_1 || '—'}</td>
        <td style="text-transform:capitalize">${d.experience || '—'}</td>
        <td><span class="badge ${bc}">${s}</span></td>
        <td>${proof ? `<a href="${proof}" target="_blank" style="font-size:.7rem;color:#c9a96e;text-decoration:underline;display:block;margin-bottom:.3rem">Proof</a>` : ''}${s !== 'verified' ? `<button class="btn btn-green" style="padding:.2rem .5rem;font-size:.65rem" onclick="window._verify('${d.id}')">✓</button>` : ''}${s !== 'rejected' ? `<button class="btn btn-red" style="padding:.2rem .5rem;font-size:.65rem;margin-left:.2rem" onclick="window._reject('${d.id}')">✗</button>` : ''}</td>
      </tr>`;
    }).join('');
  }

  function renderCommBreakdown() {
    const comms = ['UNCSW', 'UNHRC', 'AIPPM', 'IIA', 'IP', 'Moot Court'];
    const counts = {}; comms.forEach(c => counts[c] = 0);
    delegates.forEach(d => { if (counts[d.committee_1] !== undefined) counts[d.committee_1]++; });
    const mx = Math.max(...Object.values(counts), 1);
    document.getElementById('commBreakdown').innerHTML = comms.map(c => `<div class="comm-card"><h5>${c}</h5><div style="display:flex;justify-content:space-between"><span class="val">${counts[c]}</span><span class="pct">${delegates.length ? Math.round(counts[c] / delegates.length * 100) : 0}%</span></div><div class="bar"><div class="bar-fill" style="width:${(counts[c] / mx) * 100}%"></div></div></div>`).join('');
  }

  window._verify = async id => { if (!confirm('Verify this payment?')) return; await supabase.from('registrations').update({ payment_status: 'verified' }).eq('id', id); toast('Payment verified!'); loadDelegates(); };
  window._reject = async id => { if (!confirm('Reject this payment?')) return; await supabase.from('registrations').update({ payment_status: 'rejected' }).eq('id', id); toast('Payment rejected', 'err'); loadDelegates(); };

  document.getElementById('searchInput').addEventListener('input', renderDelegates);
  document.getElementById('filterComm').addEventListener('change', renderDelegates);
  document.getElementById('filterStatus').addEventListener('change', renderDelegates);
  document.getElementById('refreshBtn').addEventListener('click', loadDelegates);

  // CSV Export
  document.getElementById('exportBtn').addEventListener('click', () => {
    if (!delegates.length) return toast('No data', 'err');
    let csv = 'Delegate ID,Name,Email,Phone,School,Grade,Committee 1,Committee 2,Country,Experience,Status,Date\n';
    delegates.forEach(d => { csv += [d.delegate_id, `"${d.full_name || ''}"`, d.email, d.phone, `"${d.school || ''}"`, d.grade_year, d.committee_1, d.committee_2, `"${d.country_pref || ''}"`, d.experience, d.payment_status, new Date(d.created_at).toLocaleDateString()].join(',') + '\n'; });
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `nirmaan_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    toast('CSV exported!');
  });

  // ====== TEAM TAB ======
  let teamMembers = [];
  async function loadTeam() {
    try {
      const { data } = await supabase.from('team_members').select('*').order('display_order');
      teamMembers = data || [];
      renderTeam();
    } catch { teamMembers = []; renderTeam(); }
  }

  function renderTeam() {
    const grid = document.getElementById('teamGrid');
    if (!teamMembers.length) { grid.innerHTML = '<div class="empty">No team members yet. Click "Add Member" above.</div>'; return; }
    grid.innerHTML = teamMembers.map(m => `<div class="team-card">
      <div class="team-card-wrapper">
        <img src="${m.photo_url || '/logo.jpg'}" alt="${m.name}" onerror="this.src='/logo.jpg'" style="width:100%; height:100%; object-fit:cover; ${m.name.toLowerCase().includes('kavya') ? 'transform:scale(1.3); transform-origin:center 40%;' : (m.name.toLowerCase().includes('awani') ? 'transform:scale(2); transform-origin:center 45%;' : '')}">
      </div>
      <h4>${m.name}</h4><div class="role">${m.role}</div>
      ${m.phone ? `<div class="phone">${m.phone}</div>` : ''}
      <div class="card-actions">
        <button class="btn btn-gold" style="padding:.2rem .5rem;font-size:.65rem" onclick="window._editTeam('${m.id}')">Edit</button>
        <button class="btn btn-red" style="padding:.2rem .5rem;font-size:.65rem" onclick="window._delTeam('${m.id}')">Delete</button>
      </div>
    </div>`).join('');
  }

  document.getElementById('addTeamBtn').addEventListener('click', () => {
    document.getElementById('teamEditId').value = '';
    document.getElementById('teamFormTitle').textContent = 'Add Team Member';
    ['tmName', 'tmRole', 'tmPhone', 'tmPhoto'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('tmOrder').value = teamMembers.length + 1;
    document.getElementById('teamForm').style.display = 'block';
  });

  document.getElementById('teamCancelBtn').addEventListener('click', () => document.getElementById('teamForm').style.display = 'none');

  window._editTeam = id => {
    const m = teamMembers.find(t => t.id === id); if (!m) return;
    document.getElementById('teamEditId').value = id;
    document.getElementById('teamFormTitle').textContent = 'Edit Team Member';
    document.getElementById('tmName').value = m.name;
    document.getElementById('tmRole').value = m.role;
    document.getElementById('tmPhone').value = m.phone || '';
    document.getElementById('tmPhoto').value = m.photo_url || '';
    document.getElementById('tmOrder').value = m.display_order || 0;
    document.getElementById('teamForm').style.display = 'block';
  };

  window._delTeam = async id => {
    if (!confirm('Delete this team member?')) return;
    await supabase.from('team_members').delete().eq('id', id);
    toast('Member deleted', 'err');
    loadTeam();
  };

  document.getElementById('teamSaveBtn').addEventListener('click', async () => {
    const name = document.getElementById('tmName').value.trim();
    const role = document.getElementById('tmRole').value.trim();
    if (!name || !role) return toast('Name & role required', 'err');
    const obj = { name, role, phone: document.getElementById('tmPhone').value.trim(), photo_url: document.getElementById('tmPhoto').value.trim(), display_order: parseInt(document.getElementById('tmOrder').value) || 0 };
    const editId = document.getElementById('teamEditId').value;
    if (editId) { await supabase.from('team_members').update(obj).eq('id', editId); }
    else { await supabase.from('team_members').insert(obj); }
    document.getElementById('teamForm').style.display = 'none';
    toast(editId ? 'Member updated!' : 'Member added!');
    loadTeam();
  });

  // ====== MESSAGES TAB ======
  let messages = [];
  async function loadMessages() {
    try {
      const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      messages = data || [];
      renderMessages();
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }

  function renderMessages() {
    const tbody = document.getElementById('messagesTable');
    if (!messages.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty">No messages yet.</td></tr>';
      return;
    }
    tbody.innerHTML = messages.map(m => `
      <tr>
        <td>${new Date(m.created_at).toLocaleDateString()}</td>
        <td>${m.name}</td>
        <td><a href="mailto:${m.email}" style="color:#c9a96e">${m.email}</a></td>
        <td style="max-width:300px; white-space:normal;">${m.content}</td>
        <td>
          <button class="btn btn-red" style="padding:.2rem .5rem;font-size:.65rem" onclick="window._delMessage('${m.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  window._delMessage = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
      toast('Message deleted', 'err');
      loadMessages();
    } catch (err) {
      toast('Failed to delete message', 'err');
    }
  };

  // ====== PAYMENTS TAB ======
  async function loadSettings() {
    try {
      const { data } = await supabase.from('site_settings').select('*');
      if (!data) return;
      const s = {};
      data.forEach(r => s[r.key] = r.value);
      if (s.fee_early_bird) document.getElementById('feeEarly').value = s.fee_early_bird;
      if (s.fee_standard) document.getElementById('feeStd').value = s.fee_standard;
      if (s.fee_ip) document.getElementById('feeIp').value = s.fee_ip;
      if (s.upi_id) document.getElementById('upiId').value = s.upi_id;
      if (s.qr_code_url) document.getElementById('qrUrl').value = s.qr_code_url;
      if (s.conference_date) document.getElementById('confDate').value = s.conference_date;
      if (s.dates_announced) document.getElementById('datesAnnouncedToggle').checked = s.dates_announced === 'true';
      if (s.schedule_announced) document.getElementById('scheduleAnnouncedToggle').checked = s.schedule_announced === 'true';
      if (s.admin_password) adminPwd = s.admin_password;
    } catch { /* settings table may not exist */ }
  }

  async function saveSetting(key, value) {
    const { error } = await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) { toast('Save failed: ' + error.message, 'err'); return false; }
    return true;
  }

  document.getElementById('saveFeesBtn').addEventListener('click', async () => {
    await saveSetting('fee_early_bird', document.getElementById('feeEarly').value);
    await saveSetting('fee_standard', document.getElementById('feeStd').value);
    await saveSetting('fee_ip', document.getElementById('feeIp').value);
    toast('Fees saved!');
  });

  document.getElementById('savePayBtn').addEventListener('click', async () => {
    await saveSetting('upi_id', document.getElementById('upiId').value);
    await saveSetting('qr_code_url', document.getElementById('qrUrl').value);
    toast('Payment info saved!');
  });

  // ====== SETTINGS TAB ======
  document.getElementById('changePwdBtn').addEventListener('click', async () => {
    const cur = document.getElementById('curPwd').value;
    const nw = document.getElementById('newPwd').value;
    const conf = document.getElementById('confPwd').value;
    if (cur !== adminPwd) return toast('Current password is wrong', 'err');
    if (!nw || nw.length < 6) return toast('New password must be 6+ chars', 'err');
    if (nw !== conf) return toast('Passwords do not match', 'err');
    const ok = await saveSetting('admin_password', nw);
    if (ok) { adminPwd = nw; toast('Password updated!'); ['curPwd', 'newPwd', 'confPwd'].forEach(id => document.getElementById(id).value = ''); }
  });

  document.getElementById('saveDateBtn').addEventListener('click', async () => {
    const d = document.getElementById('confDate').value;
    const dAnn = document.getElementById('datesAnnouncedToggle').checked;
    const sAnn = document.getElementById('scheduleAnnouncedToggle').checked;
    if (!d) return toast('Enter a date', 'err');
    const ok1 = await saveSetting('conference_date', d);
    const ok2 = await saveSetting('dates_announced', dAnn.toString());
    const ok3 = await saveSetting('schedule_announced', sAnn.toString());
    if (ok1 && ok2 && ok3) toast('Settings saved!');
  });

  // ====== SCHEDULE TAB ======
  let scheduleEvents = [];
  async function loadSchedule() {
    try {
      const { data, error } = await supabase.from('schedule').select('*').order('day').order('display_order');
      if (error) throw error;
      scheduleEvents = data || [];
      renderScheduleTable();
    } catch (err) {
      document.getElementById('schedTable').innerHTML = `<tr><td colspan="7" class="empty">Error loading schedule: ${err.message}</td></tr>`;
    }
  }

  function renderScheduleTable() {
    const tbody = document.getElementById('schedTable');
    if (!scheduleEvents.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty">No events scheduled. Click "+ Add Event" above.</td></tr>';
      return;
    }
    tbody.innerHTML = scheduleEvents.map(ev => `
      <tr>
        <td><strong>Day ${ev.day}</strong></td>
        <td>${ev.time}</td>
        <td><strong>${ev.title}</strong>${ev.description ? `<br><small style="color:rgba(240,212,218,.4);">${ev.description}</small>` : ''}</td>
        <td>${ev.venue || '—'}</td>
        <td><span class="badge ${ev.color === 'rose' ? 'badge-warn' : ev.color === 'burgundy' ? 'badge-err' : 'badge-ok'}">${ev.color}</span></td>
        <td>${ev.display_order}</td>
        <td>
          <button class="btn btn-gold" style="padding:.2rem .5rem;font-size:.65rem" onclick="window._editSched('${ev.id}')">Edit</button>
          <button class="btn btn-red" style="padding:.2rem .5rem;font-size:.65rem;margin-left:.2rem" onclick="window._delSched('${ev.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  document.getElementById('addSchedBtn').addEventListener('click', () => {
    document.getElementById('schedEditId').value = '';
    document.getElementById('schedFormTitle').textContent = 'Add Event';
    document.getElementById('scDay').value = 1;
    document.getElementById('scTime').value = '';
    document.getElementById('scVenue').value = '';
    document.getElementById('scTitle').value = '';
    document.getElementById('scColor').value = 'gold';
    document.getElementById('scDesc').value = '';
    document.getElementById('scOrder').value = scheduleEvents.length + 1;
    document.getElementById('schedForm').style.display = 'block';
  });

  document.getElementById('schedCancelBtn').addEventListener('click', () => {
    document.getElementById('schedForm').style.display = 'none';
  });

  window._editSched = id => {
    const ev = scheduleEvents.find(e => e.id === id);
    if (!ev) return;
    document.getElementById('schedEditId').value = id;
    document.getElementById('schedFormTitle').textContent = 'Edit Event';
    document.getElementById('scDay').value = ev.day;
    document.getElementById('scTime').value = ev.time;
    document.getElementById('scVenue').value = ev.venue || '';
    document.getElementById('scTitle').value = ev.title;
    document.getElementById('scColor').value = ev.color || 'gold';
    document.getElementById('scDesc').value = ev.description || '';
    document.getElementById('scOrder').value = ev.display_order || 0;
    document.getElementById('schedForm').style.display = 'block';
  };

  window._delSched = async id => {
    if (!confirm('Delete this schedule event?')) return;
    try {
      const { error } = await supabase.from('schedule').delete().eq('id', id);
      if (error) throw error;
      toast('Event deleted', 'err');
      loadSchedule();
    } catch (err) {
      toast('Delete failed: ' + err.message, 'err');
    }
  };

  document.getElementById('schedSaveBtn').addEventListener('click', async () => {
    const day = parseInt(document.getElementById('scDay').value) || 1;
    const time = document.getElementById('scTime').value.trim();
    const venue = document.getElementById('scVenue').value.trim();
    const title = document.getElementById('scTitle').value.trim();
    const color = document.getElementById('scColor').value;
    const description = document.getElementById('scDesc').value.trim();
    const display_order = parseInt(document.getElementById('scOrder').value) || 0;

    if (!time || !title) return toast('Time and Title are required', 'err');

    const obj = { day, time, venue, title, color, description, display_order };
    const editId = document.getElementById('schedEditId').value;

    try {
      if (editId) {
        const { error } = await supabase.from('schedule').update(obj).eq('id', editId);
        if (error) throw error;
        toast('Event updated!');
      } else {
        const { error } = await supabase.from('schedule').insert(obj);
        if (error) throw error;
        toast('Event added!');
      }
      document.getElementById('schedForm').style.display = 'none';
      loadSchedule();
    } catch (err) {
      toast('Save failed: ' + err.message, 'err');
    }
  });

  // ====== THEMES TAB ======
  let selectedTheme = 'default';
  
  async function loadThemes() {
    try {
      const { data, error } = await supabase.from('site_settings').select('value').eq('key', 'current_theme').single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        selectedTheme = data.value;
      }
      updateThemeCardsUI();
    } catch (err) {
      console.error('Error loading theme:', err);
    }
  }

  function updateThemeCardsUI() {
    document.querySelectorAll('.theme-card-preset').forEach(card => {
      if (card.dataset.theme === selectedTheme) {
        card.classList.add('active');
        card.style.borderColor = 'var(--gold-accent)';
        if (!card.querySelector('.badge')) {
          const badge = document.createElement('span');
          badge.className = 'badge badge-ok';
          badge.textContent = 'Active';
          card.querySelector('div').appendChild(badge);
        } else {
          card.querySelector('.badge').textContent = 'Active';
        }
      } else {
        card.classList.remove('active');
        card.style.borderColor = 'transparent';
        const badge = card.querySelector('.badge');
        if (badge) badge.remove();
      }
    });
  }

  // Hook theme card clicks
  document.querySelectorAll('.theme-card-preset').forEach(card => {
    card.addEventListener('click', () => {
      selectedTheme = card.dataset.theme;
      document.querySelectorAll('.theme-card-preset').forEach(c => {
        c.style.borderColor = c.dataset.theme === selectedTheme ? 'var(--gold-accent)' : 'transparent';
      });
    });
  });

  document.getElementById('applyThemeBtn').addEventListener('click', async () => {
    const ok = await saveSetting('current_theme', selectedTheme);
    if (ok) {
      toast('Theme applied successfully! Refreshing page...');
      setTimeout(() => window.location.reload(), 1500);
    }
  });
});
