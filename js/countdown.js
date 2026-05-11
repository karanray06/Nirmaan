document.addEventListener('DOMContentLoaded', () => {
  // Conference Date from ENV or fallback
  const confDateStr = import.meta.env.VITE_CONFERENCE_DATE || '2026-08-15T09:00:00+05:30';
  const countDownDate = new Date(confDateStr).getTime();

  const elDays = document.getElementById('cdDays');
  const elHours = document.getElementById('cdHours');
  const elMins = document.getElementById('cdMins');
  const elSecs = document.getElementById('cdSecs');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    if (distance < 0) {
      if(elDays) elDays.innerText = "00";
      if(elHours) elHours.innerText = "00";
      if(elMins) elMins.innerText = "00";
      if(elSecs) elSecs.innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    updateDigit(elDays, days < 10 ? "0" + days : days);
    updateDigit(elHours, hours < 10 ? "0" + hours : hours);
    updateDigit(elMins, minutes < 10 ? "0" + minutes : minutes);
    updateDigit(elSecs, seconds < 10 ? "0" + seconds : seconds);
  }

  function updateDigit(el, newValue) {
    if (!el) return;
    if (el.innerText !== newValue.toString()) {
      el.innerText = newValue;
      // Optional: Add CSS class for flip animation here if desired
      // el.classList.remove('flip');
      // void el.offsetWidth;
      // el.classList.add('flip');
    }
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();
});
