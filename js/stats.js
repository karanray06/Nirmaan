document.addEventListener('DOMContentLoaded', () => {
  const statsBar = document.getElementById('statsBar');
  if (!statsBar) return;

  const statNumbers = document.querySelectorAll('.stat-number');
  let hasRun = false;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hasRun) {
      hasRun = true;
      
      const easeOutQuad = t => t * (2 - t);
      const duration = 1500;
      
      statNumbers.forEach(stat => {
        const target = +stat.getAttribute('data-target');
        const startTimestamp = performance.now();
        
        const step = (timestamp) => {
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const current = Math.floor(easeOutQuad(progress) * target);
          
          stat.innerText = current + (target > 100 ? '+' : '');
          
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            stat.innerText = target + (target > 100 ? '+' : '');
          }
        };
        requestAnimationFrame(step);
      });
    }
  }, { threshold: 0.2 });

  observer.observe(statsBar);
});
