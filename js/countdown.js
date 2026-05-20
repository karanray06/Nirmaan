import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Conference Date from ENV or fallback
  let confDateStr = '2026-08-08T09:00:00+05:30';
  
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'conference_date')
      .maybeSingle();
    
    if (data && data.value) {
      let val = data.value;
      if (!val.includes('T')) {
        val = `${val}T09:00:00+05:30`;
      }
      confDateStr = val;
    } else {
      if (import.meta.env && import.meta.env.VITE_CONFERENCE_DATE) {
        confDateStr = import.meta.env.VITE_CONFERENCE_DATE;
      }
    }
  } catch (e) {
    if (import.meta.env && import.meta.env.VITE_CONFERENCE_DATE) {
      confDateStr = import.meta.env.VITE_CONFERENCE_DATE;
    }
  }

  let countDownDate = new Date(confDateStr).getTime();

  const elDays = document.getElementById('cdDays');
  const elHours = document.getElementById('cdHours');
  const elMins = document.getElementById('cdMins');
  const elSecs = document.getElementById('cdSecs');
  const countdownContainer = document.getElementById('countdown');

  function updateDateDisplay(dateStr) {
    const dateDisplay = document.getElementById('heroDateDisplay');
    if (!dateDisplay) return;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return;
    
    const nextDay = new Date(d);
    nextDay.setDate(d.getDate() + 1);
    const endDay = nextDay.getDate();
    dateDisplay.innerText = `${d.toLocaleString('en-US', {month: 'long'})} ${d.getDate()} - ${endDay}, ${d.getFullYear()}`;
  }

  updateDateDisplay(confDateStr);

  window.updateCountdownTarget = (newDateStr) => {
    let val = newDateStr;
    if (!val.includes('T')) {
      val = `${val}T09:00:00+05:30`;
    }
    confDateStr = val;
    countDownDate = new Date(confDateStr).getTime();
    updateDateDisplay(confDateStr);
  };

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    if (distance < 0) {
      if (countdownContainer) {
        countdownContainer.innerHTML = '<h3 style="color:var(--gold-accent); margin-top:1rem;">Conference In Progress 🎙️</h3>';
      }
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
    }
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();
});
