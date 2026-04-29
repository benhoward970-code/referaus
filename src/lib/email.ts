const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = 'ReferAus <hello@referaus.com>' }: SendEmailOptions) {
  if (!RESEND_API_KEY) {
    console.log('[Email] Resend not configured - would send:', { to, subject });
    return { success: false, demo: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (error) {
    console.error('[Email] Send failed:', error);
    return { success: false, error };
  }
}
