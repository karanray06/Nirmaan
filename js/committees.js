const committeesData = [
  { abbr: 'UNGA', name: 'United Nations General Assembly', level: 'beginner', agendas: ['Militarization of the Arctic', 'Debt Crisis in Developing Nations'] },
  { abbr: 'UNSC', name: 'United Nations Security Council', level: 'advanced', agendas: ['Situation in the South China Sea', 'Reform of Peacekeeping Operations'] },
  { abbr: 'UNHRC', name: 'UN Human Rights Council', level: 'intermediate', agendas: ['Protecting Rights of Climate Refugees', 'Censorship and Freedom of Press'] },
  { abbr: 'WHO', name: 'World Health Organization', level: 'beginner', agendas: ['Global Pandemic Preparedness', 'Access to Essential Medicines'] },
  { abbr: 'ECOSOC', name: 'Economic and Social Council', level: 'intermediate', agendas: ['Transitioning to Green Economies', 'Eradicating Extreme Poverty'] },
  { abbr: 'DISEC', name: 'Disarmament & International Security', level: 'intermediate', agendas: ['Regulation of Autonomous Weapons', 'Nuclear Non-Proliferation in ME'] },
  { abbr: 'ICJ', name: 'International Court of Justice', level: 'advanced', agendas: ['Territorial Dispute (Case A)', 'Advisory Opinion on Climate Change'] },
  { abbr: 'IPC', name: 'International Press Corps', level: 'beginner', agendas: ['Reporting on Committee Proceedings', 'Holding Press Conferences'] },
  { abbr: 'JCC', name: 'Joint Crisis Cabinet', level: 'crisis', agendas: ['Classified Historical Crisis', 'Midnight Directives'] }
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
