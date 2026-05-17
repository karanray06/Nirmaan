import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
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
        const activeTheme = settings['current_theme'] || 'default';
        applyTheme(activeTheme);

        // Dates
        const isDatesAnnounced = settings['dates_announced'] === 'true';
        document.getElementById('countdownContainer').style.display = isDatesAnnounced ? 'block' : 'none';
        document.getElementById('tbaContainer').style.display = isDatesAnnounced ? 'none' : 'block';

        // Schedule
        const isScheduleAnnounced = settings['schedule_announced'] === 'true';
        document.getElementById('scheduleContainer').style.display = isScheduleAnnounced ? 'block' : 'none';
        document.getElementById('scheduleTbaContainer').style.display = isScheduleAnnounced ? 'none' : 'block';
        
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

  // --- Theme Customization PRESETS ---
  function applyTheme(theme) {
    const themeStyles = {
      default: {
        '--primary-crimson': '#7B1530',
        '--dark-wine': '#3D0816',
        '--deep-burgundy': '#2A0A12',
        '--gold-accent': '#C9A96E',
        '--blush-pale': '#F0D4DA',
        '--warm-cream': '#FDF8F0',
        '--ivory': '#FFFBF4',
        '--font-display': "'Cormorant Garamond', serif",
        '--font-body': "'Outfit', sans-serif"
      },
      raksha_bandhan: {
        '--primary-crimson': '#D35400',
        '--dark-wine': '#8E2700',
        '--deep-burgundy': '#5E1914',
        '--gold-accent': '#E5A93B',
        '--blush-pale': '#FFEBE1',
        '--warm-cream': '#FCF5EC',
        '--ivory': '#FFFDF9',
        '--font-display': "'Cinzel', serif",
        '--font-body': "'Outfit', sans-serif"
      },
      diwali: {
        '--primary-crimson': '#E67E22',
        '--dark-wine': '#2C0835',
        '--deep-burgundy': '#1A0520',
        '--gold-accent': '#F1C40F',
        '--blush-pale': '#FADBD8',
        '--warm-cream': '#FDFAF5',
        '--ivory': '#FFFDF0',
        '--font-display': "'Marcellus', serif",
        '--font-body': "'Montserrat', sans-serif"
      },
      avengers: {
        '--primary-crimson': '#C0392B',
        '--dark-wine': '#1A1A1A',
        '--deep-burgundy': '#0A0A0A',
        '--gold-accent': '#F39C12',
        '--blush-pale': '#D5DBDB',
        '--warm-cream': '#FAFAFA',
        '--ivory': '#FAFAFA',
        '--font-display': "'Orbitron', sans-serif",
        '--font-body': "'Rajdhani', sans-serif"
      },
      un: {
        '--primary-crimson': '#009EDB',
        '--dark-wine': '#0A3B66',
        '--deep-burgundy': '#052440',
        '--gold-accent': '#8FA6C4',
        '--blush-pale': '#E6F2FF',
        '--warm-cream': '#F5F9FD',
        '--ivory': '#FFFFFF',
        '--font-display': "'Helvetica Neue', Helvetica, Arial, sans-serif",
        '--font-body': "'Inter', sans-serif"
      }
    };

    const fontLinks = {
      raksha_bandhan: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&display=swap',
      diwali: 'https://fonts.googleapis.com/css2?family=Marcellus&family=Montserrat:wght@400;500;600&display=swap',
      avengers: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&family=Rajdhani:wght@500;600;700&display=swap',
      un: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
    };

    const styles = themeStyles[theme] || themeStyles['default'];

    // Load fonts
    if (fontLinks[theme]) {
      const linkId = `theme-font-${theme}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = fontLinks[theme];
        document.head.appendChild(link);
      }
    }

    // Apply variables to document element
    Object.keys(styles).forEach(key => {
      document.documentElement.style.setProperty(key, styles[key]);
    });
  }

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
