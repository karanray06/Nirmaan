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
      // Call Grok API directly for local dev
      const apiKey = import.meta.env.VITE_GROK_API_KEY;
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "grok-4.20-reasoning", // Using the model you requested
          messages: [
            {
              role: "system",
              content: "You are a formal, knowledgeable MUN research assistant for NIRMAAN MUN. Your job is to help delegates research committee topics, understand UN resolutions, explain diplomatic terminology, and prepare speeches. Cite real UN documents when possible. Keep answers concise, structured, and helpful."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      const data = await res.json();
      document.getElementById(typingId).remove();

      if(data.error) {
        // Expose the actual error so user knows it's a billing issue
        appendMessage('assistant', `API Error: ${data.error.message || data.error}`);
      } else {
        const reply = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
        appendMessage('assistant', formatMarkdown(reply));
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
