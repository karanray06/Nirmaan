import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { email } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const notificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'nirmaan.indraja@gmail.com';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }

    // Use Service Role Key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check if email is in allowlist
    const { data: allowlistData, error: allowlistError } = await supabase
      .from('admin_allowlist')
      .select('email')
      .eq('email', email)
      .single();

    const isAllowed = !!allowlistData && !allowlistError;
    
    const ip = request.headers.get('x-forwarded-for') || 'Unknown IP';
    const userAgent = request.headers.get('user-agent') || 'Unknown Agent';

    // 2. Log attempt
    await supabase
      .from('admin_login_attempts')
      .insert([{
        email: email,
        allowed: isAllowed,
        ip: ip,
        user_agent: userAgent
      }]);

    // 3. If not allowed, send alert email
    if (!isAllowed) {
      // Internal call to our own edge function (or we can just fetch Resend directly since we have the key)
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Nirmaan Security <onboarding@resend.dev>',
            to: notificationEmail,
            subject: `⚠️ Unauthorized Admin Login Attempt: ${email}`,
            html: `
              <h2>Unauthorized Admin Login Attempt Detected</h2>
              <p><strong>Email attempted:</strong> ${email}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p><strong>IP Address:</strong> ${ip}</p>
              <p><strong>User Agent:</strong> ${userAgent}</p>
              <br/>
              <p>This user was blocked from accessing the Nirmaan admin dashboard.</p>
            `
          })
        });
      }
    }

    return new Response(JSON.stringify({ allowed: isAllowed }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
