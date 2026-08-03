export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload = await request.json();
    const type = payload.table;
    const record = payload.record;

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = 'Nirmaan MUN <onboarding@resend.dev>'; 
    const NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'nirmaan.indraja@gmail.com';

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Resend API key missing' }), { status: 500 });
    }

    let to = [];
    let subject = '';
    let html = '';

    const brandColor = '#c9a96e';
    const bgDark = '#1a1a1a';

    if (type === 'registrations') {
      to = [record.email, NOTIFICATION_EMAIL];
      subject = `Registration Received - Nirmaan MUN 2026`;
      html = `
        <div style="font-family: Arial, sans-serif; background-color: ${bgDark}; color: #ffffff; padding: 20px;">
          <h2 style="color: ${brandColor};">Welcome to Nirmaan MUN 2026, ${record.full_name}!</h2>
          <p>We have successfully received your delegate application.</p>
          <p><strong>Delegate ID:</strong> ${record.delegate_id}</p>
          <p><strong>Committee Preference 1:</strong> ${record.committee_1}</p>
          <p><strong>Committee Preference 2:</strong> ${record.committee_2}</p>
          <hr style="border-color: #333;" />
          <p>If you uploaded a payment proof, our finance team will verify it shortly. You will receive an official confirmation once your allocation is finalized.</p>
          <p>Regards,<br/>The Nirmaan Secretariat</p>
        </div>
      `;
    } else if (type === 'secretariat_applications') {
      to = [record.email, NOTIFICATION_EMAIL];
      subject = `Secretariat Application Received - Nirmaan MUN 2026`;
      html = `
        <div style="font-family: Arial, sans-serif; background-color: ${bgDark}; color: #ffffff; padding: 20px;">
          <h2 style="color: ${brandColor};">Thank you, ${record.full_name}!</h2>
          <p>We have received your application for the Nirmaan MUN 2026 Secretariat.</p>
          <p><strong>Application ID:</strong> ${record.application_id}</p>
          <hr style="border-color: #333;" />
          <p>Our Core Team is reviewing applications and will reach out to you shortly regarding the interview process.</p>
          <p>Regards,<br/>The Nirmaan Core Team</p>
        </div>
      `;
    } else if (type === 'messages') {
      to = [NOTIFICATION_EMAIL];
      subject = `New Contact Form Message from ${record.name}`;
      html = `
        <div style="font-family: Arial, sans-serif; background-color: ${bgDark}; color: #ffffff; padding: 20px;">
          <h2 style="color: ${brandColor};">New Message from Nirmaan Website</h2>
          <p><strong>Name:</strong> ${record.name}</p>
          <p><strong>Email:</strong> ${record.email}</p>
          <hr style="border-color: #333;" />
          <p><strong>Message:</strong></p>
          <p>${record.message}</p>
        </div>
      `;
    } else {
      return new Response(JSON.stringify({ error: 'Unknown table trigger' }), { status: 400 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: to,
        subject: subject,
        html: html
      })
    });

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
