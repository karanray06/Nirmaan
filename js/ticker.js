document.addEventListener('DOMContentLoaded', () => {
  const tickerTrack = document.getElementById('tickerTrack');
  if (!tickerTrack) return;

  const mockRegistrations = [
    "Rahul from DPS registered for UNGA",
    "Sarah from International School secured USA in UNSC",
    "Aarav from Modern School registered for WHO",
    "Priya from National College registered for ECOSOC",
    "John from Global Academy joined the Press Corps",
    "Sneha from City High registered for DISEC"
  ];

  // Create ticker content by duplicating list to ensure smooth scrolling
  let html = '';
  for(let i=0; i<3; i++) {
    mockRegistrations.forEach(msg => {
      html += `<div class="ticker-item"><div class="dot"></div>${msg}</div>`;
    });
  }
  
  tickerTrack.innerHTML = html;
});
