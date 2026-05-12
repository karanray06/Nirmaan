const committeesData = [
  { 
    abbr: 'UNCSW', 
    name: 'UN Commission on the Status of Women', 
    level: 'intermediate', 
    icon: '/assets/icon-uncsw.png',
    agendas: ["Deliberation on the role of Artificial Intelligence and data economies in reinforcing modern forms of patriarchy and control over women's body."],
    guideUrl: '/guides/UNCSW-Study-Guide.pdf'
  },
  { 
    abbr: 'UNHRC', 
    name: 'UN Human Rights Council', 
    level: 'intermediate', 
    icon: '/assets/icon-unhrc.png',
    agendas: ["Deliberation on the normalisation of civilian as 'collateral damage' and its compatibility with international human rights obligations."],
    guideUrl: '/guides/UNHRC-Study-Guide.pdf'
  },
  { 
    abbr: 'AIPPM', 
    name: 'All India Political Parties Meet', 
    level: 'beginner', 
    icon: '/assets/icon-aippm.png',
    agendas: ["Deliberation on whether 'One Nation, One Election' framework strengthens democratic governance or enables the monopolization of political power."],
    guideUrl: '/guides/AIPPM-Study-Guide.pdf'
  },
  { 
    abbr: 'IIA', 
    name: 'International Intelligence Agency', 
    level: 'advanced', 
    icon: '/assets/icon-iia.png',
    agendas: ['Assessment of foreign interference through cyber operations, disinformation networks, and proxy digital actors destabilising domestic political systems.'],
    guideUrl: '/guides/IIA-Study-Guide.pdf'
  },
  { 
    abbr: 'IP', 
    name: 'International Press', 
    level: 'beginner', 
    icon: '/assets/icon-ip.png',
    agendas: ['Photography, Journalism, Caricature'],
    guideUrl: '/guides/IP-Study-Guide.pdf'
  },
  { 
    abbr: 'MOOT', 
    name: 'Moot Court', 
    level: 'advanced', 
    icon: '/assets/moot-court.png',
    agendas: ['A courtroom where logic prevails, advocacy defines, and every case demands more than just words. (Case to be provided at the day of event)'],
    guideUrl: '/guides/MootCourt-Study-Guide.pdf'
  }
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
        <div class="card committee-card" data-level="${com.level}">
          <div class="card-body">
            <div class="committee-header">
              <img src="${com.icon}" alt="${com.abbr}" class="committee-icon">
              <div>
                <span class="committee-abbr">${com.abbr}</span>
                <span class="badge ${badgeClass}">${com.level}</span>
              </div>
            </div>
            <h3 class="committee-name">${com.name}</h3>
            <ul class="committee-agendas">
              ${liHtml}
            </ul>
            <div class="committee-footer">
              <a href="${com.guideUrl}" download class="guide-download-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Study Guide
              </a>
              <a href="https://linktr.ee/nirmaan.indraja" target="_blank" class="guide-link-btn">
                View Resources <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
