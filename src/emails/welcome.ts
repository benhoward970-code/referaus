export function WelcomeEmail({ businessName = 'there' }: { businessName?: string }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;margin-top:32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
<div style="background:#2563eb;padding:32px;text-align:center"><h1 style="color:#fff;margin:0;font-size:24px">Welcome to ReferAus</h1></div>
<div style="padding:32px">
<p style="font-size:16px;color:#111">Hi {businessName},</p>
<p style="color:#555;line-height:1.6">Thanks for joining ReferAus! You're now part of Australia's growing NDIS provider directory.</p>
<h3 style="color:#111;margin-top:24px">Get started in 3 steps:</h3>
<ol style="color:#555;line-height:2"><li><strong>Complete your profile</strong> - Add your services, areas, and a description</li><li><strong>Add your qualifications</strong> - Verified providers rank higher in search</li><li><strong>Respond to enquiries</strong> - Fast responses build trust with participants</li></ol>
<div style="text-align:center;margin:32px 0"><a href="https://referaus.com/dashboard" style="background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Complete Your Profile</a></div>
</div>
<div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb"><p style="color:#999;font-size:12px;margin:0">ReferAus - Built in the Hunter Region | <a href="https://referaus.com" style="color:#2563eb">referaus.com</a></p></div>
</div></body></html>`;
}
