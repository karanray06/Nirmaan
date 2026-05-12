const committeesData = [
  { abbr: 'UNCSW', name: 'UN Commission on the Status of Women', level: 'intermediate', agendas: ["Role of AI and data economies in reinforcing modern patriarchy and control over women's body"] },
  { abbr: 'UNHRC', name: 'UN Human Rights Council', level: 'intermediate', agendas: ["Normalisation of civilian as 'collateral damage' and compatibility with human rights obligations"] },
  { abbr: 'AIPPM', name: 'All India Political Parties Meet', level: 'beginner', agendas: ["'One Nation, One Election' framework: strengthening democratic governance vs monopolization of power"] },
  { abbr: 'IIA', name: 'International Intelligence Agency', level: 'advanced', agendas: ['Foreign interference through cyber operations, disinformation networks, and proxy digital actors'] },
  { abbr: 'IP', name: 'International Press', level: 'beginner', agendas: ['Photography, Journalism, Caricature'] },
  { abbr: 'MOOT', name: 'Moot Court', level: 'advanced', agendas: ['A courtroom where logic prevails (Case provided on event day)'] }
];

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('committeeGrid');
  const filters = document.querySelectorAll('.filter-tab');
  if(!grid) return;

  function renderCommittees(filter = 'all') {
    grid.innerHTML = '';
    committeesData.forEach(com => {
      if(filter !== 'all' && com.level !== filter) return;
      
      const badgeClass = `badge-${com.level}`;
      const liHtml = com.agendas.map(a => `<li>${a}</li>`).join('');
      
      const html = `
        <div class="card committee-card">
          <div class="card-body">
            <div class="committee-header">
              <span class="committee-abbr">${com.abbr}</span>
              <span class="badge ${badgeClass}">${com.level}</span>
            </div>
            <h3 class="committee-name">${com.name}</h3>
            <ul class="committee-agendas">
              ${liHtml}
            </ul>
            <div class="committee-footer">
              <a href="https://linktr.ee/nirmaan.indraja" target="_blank" style="font-size:0.8rem; color:var(--primary-crimson); font-weight:500; display:flex; align-items:center; gap:4px;">
                View Study Guide <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      `;
      grid.insertAdjacentHTML('beforeend', html);
    });
  }

  // Initial render
  renderCommittees();

  // Filter clicks
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      renderCommittees(btn.dataset.filter);
    });
  });
});
