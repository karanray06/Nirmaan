document.addEventListener('DOMContentLoaded', () => {
  const statsBar = document.getElementById('statsBar');
  if (!statsBar) return;

  const statNumbers = document.querySelectorAll('.stat-number');
  let hasRun = false;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hasRun) {
      hasRun = true;
      statNumbers.forEach(stat => {
        const target = +stat.getAttribute('data-target');
        const duration = 2000; // ms
        const stepTime = Math.abs(Math.floor(duration / target));
        let current = 0;
        
        // Fast counter for large numbers, slow for small
        const timer = setInterval(() => {
          current += (target > 100 ? 5 : 1);
          if (current >= target) {
            stat.innerText = target + (target > 100 ? '+' : '');
            clearInterval(timer);
          } else {
            stat.innerText = current;
          }
        }, target > 100 ? 20 : stepTime);
      });
    }
  }, { threshold: 0.5 });

  observer.observe(statsBar);
});
