export function WeeklyDigestEmail({ providerName = 'there', views = 0, enquiries = 0, searchAppearances = 0 }: { providerName?: string; views?: number; enquiries?: number; searchAppearances?: number }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;margin-top:32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
<div style="background:#2563eb;padding:32px;text-align:center"><h1 style="color:#fff;margin:0;font-size:24px">Your Weekly Summary</h1></div>
<div style="padding:32px">
<p style="font-size:16px;color:#111">Hi {providerName},</p>
<p style="color:#555;line-height:1.6">Here's how your ReferAus listing performed this week:</p>
<div style="display:flex;gap:16px;margin:24px 0">
<div style="flex:1;text-align:center;background:#f0f9ff;border-radius:8px;padding:20px"><div style="font-size:32px;font-weight:800;color:#2563eb">{views}</div><div style="font-size:12px;color:#555;margin-top:4px">Profile Views</div></div>
<div style="flex:1;text-align:center;background:#fff7ed;border-radius:8px;padding:20px"><div style="font-size:32px;font-weight:800;color:#f97316">{enquiries}</div><div style="font-size:12px;color:#555;margin-top:4px">Enquiries</div></div>
<div style="flex:1;text-align:center;background:#f0fdf4;border-radius:8px;padding:20px"><div style="font-size:32px;font-weight:800;color:#16a34a">{searchAppearances}</div><div style="font-size:12px;color:#555;margin-top:4px">Search Appearances</div></div>
</div>
<h3 style="color:#111;margin-top:24px">Tips to improve:</h3>
<ul style="color:#555;line-height:2"><li>Add more service categories to appear in more searches</li><li>Ask happy participants to leave reviews</li><li>Keep your profile description up to date</li></ul>
<div style="text-align:center;margin:32px 0"><a href="https://referaus.com/dashboard" style="background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">View Dashboard</a></div>
</div>
<div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb"><p style="color:#999;font-size:12px;margin:0">ReferAus - Built in the Hunter Region | <a href="https://referaus.com" style="color:#2563eb">referaus.com</a></p></div>
</div></body></html>`;
}
