import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  let currentActiveTheme = '';

  // --- Check State (Dates & Schedule & Themes) ---
  async function checkStates() {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value');
      
      if (data) {
        const settings = {};
        data.forEach(s => settings[s.key] = s.value);
        
        // Active Theme
        const activeTheme = settings['active_theme'] || 'nirmaan-classic';
        applyTheme(activeTheme);

        // Dates
        const isDatesAnnounced = settings['dates_announced'] === 'true';
        const countdownContainer = document.getElementById('countdownContainer');
        const tbaContainer = document.getElementById('tbaContainer');
        if (countdownContainer) countdownContainer.style.display = isDatesAnnounced ? 'block' : 'none';
        if (tbaContainer) tbaContainer.style.display = isDatesAnnounced ? 'none' : 'block';

        // Schedule
        const isScheduleAnnounced = settings['schedule_announced'] === 'true';
        const scheduleContainer = document.getElementById('scheduleContainer');
        const scheduleTbaContainer = document.getElementById('scheduleTbaContainer');
        if (scheduleContainer) scheduleContainer.style.display = isScheduleAnnounced ? 'block' : 'none';
        if (scheduleTbaContainer) scheduleTbaContainer.style.display = isScheduleAnnounced ? 'none' : 'block';
        
        if (isScheduleAnnounced) {
          loadDynamicSchedule();
        }
      }
    } catch (err) {
      console.error('Error fetching states:', err);
    }
  }

  // --- Dynamic Schedule Fetching and Rendering ---
  async function loadDynamicSchedule() {
    try {
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .order('day')
        .order('display_order');
      
      if (error) throw error;
      
      const container = document.getElementById('scheduleContainer');
      if (!container) return;
      if (!data || data.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted);">No events scheduled.</div>';
        return;
      }

      // Group events by day
      const daysGroup = {};
      data.forEach(ev => {
        if (!daysGroup[ev.day]) {
          daysGroup[ev.day] = [];
        }
        daysGroup[ev.day].push(ev);
      });

      const dayNumbers = Object.keys(daysGroup).map(Number).sort((a, b) => a - b);

      // Render Day Tabs
      let tabsHtml = '<div class="day-tabs" id="dayTabs">';
      dayNumbers.forEach((day, index) => {
        tabsHtml += `<button class="day-tab ${index === 0 ? 'active' : ''}" data-day="day${day}">Day ${day}</button>`;
      });
      tabsHtml += '</div>';

      // Render Timeline Days
      let timelineHtml = '<div class="timeline" id="timelineList">';
      dayNumbers.forEach((day, index) => {
        timelineHtml += `<div class="timeline-day ${index === 0 ? 'active' : ''}" id="day${day}">`;
        
        daysGroup[day].forEach(ev => {
          timelineHtml += `
            <div class="timeline-item ${ev.color || 'gold'}">
              <span class="time-pill">${ev.time}</span>
              <h4>${ev.title}</h4>
              ${ev.description ? `<p>${ev.description}</p>` : ''}
              ${ev.venue ? `<div class="venue">${ev.venue}</div>` : ''}
            </div>
          `;
        });
        
        timelineHtml += '</div>';
      });
      timelineHtml += '</div>';

      container.innerHTML = tabsHtml + timelineHtml;

      // Re-bind tab listeners
      const dynamicDayTabs = container.querySelectorAll('.day-tab');
      const dynamicDays = container.querySelectorAll('.timeline-day');

      dynamicDayTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          dynamicDayTabs.forEach(t => t.classList.remove('active'));
          dynamicDays.forEach(d => d.classList.remove('active'));
          
          tab.classList.add('active');
          const targetDay = container.querySelector('#' + tab.dataset.day);
          if (targetDay) targetDay.classList.add('active');
        });
      });

    } catch (err) {
      console.error('Error rendering dynamic schedule:', err);
    }
  }

  // --- Smooth Theme Application ---
  function applyTheme(theme) {
    const newThemeClass = theme || 'nirmaan-classic';
    if (newThemeClass === currentActiveTheme) return;

    const decor = document.querySelector('.theme-decorations');
    if (decor && currentActiveTheme !== '') {
      // Fade out decor wrapper
      decor.style.opacity = '0';
      decor.style.transition = 'opacity 0.3s ease';
      
      setTimeout(() => {
        document.body.className = newThemeClass;
        currentActiveTheme = newThemeClass;
        
        setTimeout(() => {
          decor.style.opacity = '1';
        }, 100);
      }, 300);
    } else {
      document.body.className = newThemeClass;
      currentActiveTheme = newThemeClass;
    }
  }

  // Start polling active_theme every 30 seconds
  setInterval(checkStates, 30000);

  checkStates();

  // --- Navbar Scroll Effect ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- Mobile Menu ---
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });

  // --- Scroll Reveal Animations ---
  const reveals = document.querySelectorAll('.reveal');
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  reveals.forEach(reveal => {
    revealObserver.observe(reveal);
  });

  // --- Active Nav Links ---
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // --- Particle Effect for Hero ---
  const heroParticles = document.getElementById('heroParticles');
  if (heroParticles) {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.classList.add('hero-particle');
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.animationDuration = `${5 + Math.random() * 5}s`;
      heroParticles.appendChild(particle);
    }
  }

  // --- Schedule Tabs ---
  const dayTabs = document.querySelectorAll('.day-tab');
  const days = document.querySelectorAll('.timeline-day');

  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dayTabs.forEach(t => t.classList.remove('active'));
      days.forEach(d => d.classList.remove('active'));
      
      tab.classList.add('active');
      const targetDay = document.getElementById(tab.dataset.day);
      if(targetDay) targetDay.classList.add('active');
    });
  });

  // --- Contact Form Submission ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const content = document.getElementById('contactMessage').value;
      const submitBtn = contactForm.querySelector('button');

      submitBtn.disabled = true;
      submitBtn.innerText = 'Sending...';

      try {
        const { error } = await supabase
          .from('messages')
          .insert([{ name, email, content }]);

        if (error) throw error;

        alert('Message sent successfully! We will get back to you soon.');
        contactForm.reset();
      } catch (err) {
        console.error('Error sending message:', err);
        alert('Failed to send message. Please try again later.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Send Message';
      }
    });
  }
});
