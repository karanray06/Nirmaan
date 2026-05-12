document.addEventListener('DOMContentLoaded', () => {
  const tickerTrack = document.getElementById('tickerTrack');
  if (!tickerTrack) return;

  const mockRegistrations = [
    "Registrations for NIRMAAN MUN 2026 are now open! | 8th-9th August, Delhi NCR",
    "Delegate from DPS registered for UNCSW",
    "Join the All India Political Parties Meet (AIPPM) to debate 'One Nation, One Election'",
    "Moot Court case to be revealed on the day of the event",
    "Delegate from National College registered for UNHRC",
    "Early bird registrations open at ₹1800",
    "Delegate from Global Academy joined the International Press"
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
