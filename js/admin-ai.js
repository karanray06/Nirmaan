import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('aiChatBox');
  const chatInput = document.getElementById('aiChatInput');
  const sendBtn = document.getElementById('aiChatSendBtn');
  
  if (!chatBox || !chatInput || !sendBtn) return;
  
  let pendingToolCall = null;

  function appendMessage(sender, text, isHtml = false) {
    const div = document.createElement('div');
    div.style.padding = '1rem';
    div.style.borderRadius = '8px';
    div.style.maxWidth = '80%';
    div.style.marginTop = '0.5rem';
    
    if (sender === 'Admin') {
      div.style.background = '#2a2a2a';
      div.style.color = '#fff';
      div.style.alignSelf = 'flex-end';
      div.innerHTML = `<strong>You:</strong> ${text}`;
    } else {
      div.style.background = 'var(--bg-card-hover)';
      div.style.borderLeft = '3px solid var(--gold-accent)';
      div.style.alignSelf = 'flex-start';
      if (isHtml) {
        div.innerHTML = text;
      } else {
        div.innerHTML = `<strong>System:</strong> ${text}`;
      }
    }
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function executeToolAction(actionName, args) {
    let details = '';
    
    if (actionName === 'update_conference_date') {
      const { error } = await supabase.from('site_settings').upsert({ key: 'conference_date', value: args.date }, { onConflict: 'key' });
      if (error) throw error;
      details = `Updated conference date to ${args.date}`;
    } 
    else if (actionName === 'set_dates_announced') {
      const { error } = await supabase.from('site_settings').upsert({ key: 'dates_announced', value: args.is_announced.toString() }, { onConflict: 'key' });
      if (error) throw error;
      details = `Set dates_announced to ${args.is_announced}`;
    }
    else if (actionName === 'add_schedule_event') {
      const { error } = await supabase.from('schedule').insert([args]);
      if (error) throw error;
      details = `Added schedule event: ${args.title}`;
    }
    else if (actionName === 'update_schedule_event') {
      const updates = {};
      if (args.new_time) updates.time = args.new_time;
      if (args.new_venue) updates.venue = args.new_venue;
      const { error } = await supabase.from('schedule').update(updates).eq('title', args.title);
      if (error) throw error;
      details = `Updated schedule event: ${args.title}`;
    }
    else if (actionName === 'delete_schedule_event') {
      const { error } = await supabase.from('schedule').delete().eq('title', args.title);
      if (error) throw error;
      details = `Deleted schedule event: ${args.title}`;
    }
    else if (actionName === 'update_fees') {
      if (args.early_bird) await supabase.from('site_settings').upsert({ key: 'fee_early_bird', value: args.early_bird }, { onConflict: 'key' });
      if (args.standard) await supabase.from('site_settings').upsert({ key: 'fee_standard', value: args.standard }, { onConflict: 'key' });
      if (args.ip) await supabase.from('site_settings').upsert({ key: 'fee_ip', value: args.ip }, { onConflict: 'key' });
      details = `Updated fees: ${JSON.stringify(args)}`;
    }
    else if (actionName === 'update_upi_settings') {
      if (args.upi_id) await supabase.from('site_settings').upsert({ key: 'upi_id', value: args.upi_id }, { onConflict: 'key' });
      if (args.qr_code_url) await supabase.from('site_settings').upsert({ key: 'qr_code_url', value: args.qr_code_url }, { onConflict: 'key' });
      details = `Updated UPI settings`;
    }
    else if (actionName === 'update_delegate_payment_status') {
      const { error } = await supabase.from('registrations').update({ payment_status: args.status }).eq('delegate_id', args.delegate_id);
      if (error) throw error;
      details = `Set delegate ${args.delegate_id} payment status to ${args.status}`;
    }
    else if (actionName === 'update_secretariat_status') {
      const { error } = await supabase.from('secretariat_applications').update({ status: args.status }).eq('app_id', args.app_id);
      if (error) throw error;
      details = `Set secretariat app ${args.app_id} status to ${args.status}`;
    }
    else {
      throw new Error('Unknown action: ' + actionName);
    }
  
    await supabase.from('admin_action_log').insert([{
      admin_email: 'admin_local',
      action_name: actionName,
      details: args
    }]);
  
    return details;
  }

  const tools = [
    { type: "function", function: { name: "update_conference_date", description: "Updates the conference_date in site_settings. MUST be in YYYY-MM-DD format (e.g., 2026-08-08).", parameters: { type: "object", properties: { date: { type: "string" } }, required: ["date"] } } },
    { type: "function", function: { name: "set_dates_announced", description: "Toggles whether dates are announced publicly.", parameters: { type: "object", properties: { is_announced: { type: "boolean" } }, required: ["is_announced"] } } },
    { type: "function", function: { name: "add_schedule_event", description: "Adds a brand new schedule event.", parameters: { type: "object", properties: { day: { type: "number" }, time: { type: "string" }, title: { type: "string" }, description: { type: "string" }, venue: { type: "string" }, color: { type: "string" } }, required: ["day", "time", "title"] } } },
    { type: "function", function: { name: "update_schedule_event", description: "Updates an existing schedule event.", parameters: { type: "object", properties: { title: { type: "string" }, new_time: { type: "string" }, new_venue: { type: "string" } }, required: ["title"] } } },
    { type: "function", function: { name: "delete_schedule_event", description: "Deletes a schedule event by exact title.", parameters: { type: "object", properties: { title: { type: "string" } }, required: ["title"] } } },
    { type: "function", function: { name: "update_fees", description: "Updates the registration fees in site_settings.", parameters: { type: "object", properties: { early_bird: { type: "string" }, standard: { type: "string" }, ip: { type: "string" } }, required: ["standard"] } } },
    { type: "function", function: { name: "update_upi_settings", description: "Updates the UPI ID and/or QR Code URL.", parameters: { type: "object", properties: { upi_id: { type: "string" }, qr_code_url: { type: "string" } }, required: [] } } },
    { type: "function", function: { name: "update_delegate_payment_status", description: "Updates a delegate's payment status to 'verified' or 'rejected'.", parameters: { type: "object", properties: { delegate_id: { type: "string" }, status: { type: "string", enum: ["verified", "rejected"] } }, required: ["delegate_id", "status"] } } },
    { type: "function", function: { name: "update_secretariat_status", description: "Updates a secretariat application status.", parameters: { type: "object", properties: { app_id: { type: "string" }, status: { type: "string", enum: ["selected", "rejected", "pending"] } }, required: ["app_id", "status"] } } }
  ];

  async function sendMessage(text) {
    if (!text.trim()) return;
    
    appendMessage('Admin', text);
    chatInput.value = '';
    sendBtn.disabled = true;
    
    try {
      if (pendingToolCall) {
        if (text.toLowerCase() === 'confirm' || text.toLowerCase() === 'yes') {
          // Confirm via serverless function
          const { data: { session } } = await supabase.auth.getSession();
          const adminToken = session?.access_token || '';
          const confirmRes = await fetch('/api/admin-assistant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ confirmToolCall: pendingToolCall })
          });
          const confirmData = await confirmRes.json();
          if (confirmData.error) throw new Error(confirmData.error);
          appendMessage('System', confirmData.reply || 'Action completed.');
        } else {
          appendMessage('System', 'Action cancelled.');
        }
        pendingToolCall = null;
        sendBtn.disabled = false;
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const adminToken = session?.access_token || '';
      const res = await fetch('/api/admin-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ message: text })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'API Request failed');
      }

      if (data.requiresConfirmation) {
        pendingToolCall = data.toolCall;
        const msgHtml = `
          <strong>System:</strong> I am about to execute the following action:<br>
          <code style="display:block; background:#000; padding:10px; margin-top:5px; margin-bottom:5px;">
            Action: ${data.toolCall.name}<br>
            Arguments: ${JSON.stringify(data.toolCall.arguments)}
          </code>
          Please type <strong>Confirm</strong> to proceed, or anything else to cancel.
        `;
        appendMessage('System', msgHtml, true);
      } else {
        appendMessage('System', data.reply || "I couldn't process that command.");
      }
      
    } catch (err) {
      appendMessage('System', `Error: ${err.message}`);
    }
    
    sendBtn.disabled = false;
  }

  sendBtn.addEventListener('click', () => sendMessage(chatInput.value));
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage(chatInput.value);
    }
  });

  // --- Voice to Text System ---
  const micBtn = document.getElementById('aiMicBtn');
  if (micBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      let isRecording = false;

      recognition.onstart = () => {
        isRecording = true;
        micBtn.style.color = '#ff6b6b';
        chatInput.placeholder = 'Listening...';
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        sendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        micBtn.style.color = '#ccc';
        chatInput.placeholder = 'Ask anything';
        isRecording = false;
      };

      recognition.onend = () => {
        isRecording = false;
        micBtn.style.color = '#ccc';
        chatInput.placeholder = 'Ask anything';
      };

      micBtn.addEventListener('click', () => {
        if (isRecording) {
          recognition.stop();
        } else {
          recognition.start();
        }
      });
    } else {
      micBtn.addEventListener('click', () => {
        alert("Voice recognition is not supported in this browser.");
      });
    }
  }
});
