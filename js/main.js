import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  // --- Check Dates Announced State ---
  async function checkDatesState() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'dates_announced')
        .single();
      
      if (data) {
        const isAnnounced = data.value === 'true';
        document.getElementById('countdownContainer').style.display = isAnnounced ? 'block' : 'none';
        document.getElementById('tbaContainer').style.display = isAnnounced ? 'none' : 'block';
      }
    } catch (err) {
      console.error('Error fetching dates state:', err);
    }
  }
  checkDatesState();

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
