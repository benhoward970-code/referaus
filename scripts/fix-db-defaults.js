const https = require('https');
const svc = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaGFwbm5seGZoeHNxcHFjdWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA0NDYyOCwiZXhwIjoyMDg3NjIwNjI4fQ.iBMN0RjFjP_woNhZPtgwsaHyAWscGF2Jc3BVOkG78cE";

// Fix: update demo user email from nexaconnect to referaus
const body = JSON.stringify({email: "demo@referaus.com"});
const req = https.request({
  hostname: 'zfhapnnlxfhxsqpqcuje.supabase.co',
  path: '/auth/v1/admin/users/4fe4ffda-ff82-4a14-9f09-bb534cc01ae4',
  method: 'PUT',
  headers: {
    'apikey': svc,
    'Authorization': `Bearer ${svc}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('Updated demo user email to demo@referaus.com');
    } else {
      console.log(`Error ${res.statusCode}: ${d.substring(0, 200)}`);
    }
  });
});
req.write(body);
req.end();
