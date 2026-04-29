export function EnquiryNotificationEmail({ providerName = 'Provider', participantName = 'A participant', participantEmail = '', message = '' }: { providerName?: string; participantName?: string; participantEmail?: string; message?: string }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;margin-top:32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
<div style="background:#f97316;padding:32px;text-align:center"><h1 style="color:#fff;margin:0;font-size:24px">New Enquiry Received</h1></div>
<div style="padding:32px">
<p style="font-size:16px;color:#111">Hi {providerName},</p>
<p style="color:#555;line-height:1.6">You've received a new enquiry through ReferAus!</p>
<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0">
<p style="margin:0 0 8px;color:#111"><strong>From:</strong> {participantName}</p>
<p style="margin:0 0 8px;color:#111"><strong>Email:</strong> {participantEmail}</p>
<p style="margin:0;color:#555"><strong>Message:</strong> {message}</p>
</div>
<p style="color:#555;font-size:14px">Tip: Responding within 24 hours significantly increases your chance of being chosen.</p>
<div style="text-align:center;margin:32px 0"><a href="https://referaus.com/dashboard" style="background:#f97316;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">View Enquiry</a></div>
</div>
<div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb"><p style="color:#999;font-size:12px;margin:0">ReferAus - Built in the Hunter Region | <a href="https://referaus.com" style="color:#2563eb">referaus.com</a></p></div>
</div></body></html>`;
}
