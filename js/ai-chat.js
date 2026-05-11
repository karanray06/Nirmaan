document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('chatToggle');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const messagesArea = document.getElementById('chatMessages');

  if(!toggleBtn) return;

  // Toggle Panel
  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('open');
    toggleBtn.classList.toggle('active');
    if(panel.classList.contains('open')) input.focus();
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    toggleBtn.classList.remove('active');
  });

  // Input Handling
  input.addEventListener('input', () => {
    sendBtn.disabled = input.value.trim() === '';
  });

  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if(!sendBtn.disabled) sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  async function sendMessage() {
    const text = input.value.trim();
    if(!text) return;

    // Add User Message
    appendMessage('user', text);
    input.value = '';
    sendBtn.disabled = true;

    // Add Typing Indicator
    const typingId = 'typing-' + Date.now();
    const typingHtml = `<div class="chat-typing" id="${typingId}"><span></span><span></span><span></span></div>`;
    messagesArea.insertAdjacentHTML('beforeend', typingHtml);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    try {
      // Call Vercel API Route (which calls Grok)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      document.getElementById(typingId).remove();

      if(data.error) {
        appendMessage('assistant', "I'm sorry, I encountered an error connecting to the intelligence core.");
      } else {
        appendMessage('assistant', formatMarkdown(data.reply));
      }

    } catch (err) {
      console.error(err);
      document.getElementById(typingId).remove();
      appendMessage('assistant', "Network error. Please check your connection.");
    }
  }

  function appendMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${role}`;
    msgDiv.innerHTML = content;
    messagesArea.appendChild(msgDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // Simple Markdown Formatter
  function formatMarkdown(text) {
    if(!text) return '';
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    return `<p>${formatted}</p>`;
  }
});
