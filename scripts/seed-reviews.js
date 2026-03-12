const https = require('https');
const svc = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaGFwbm5seGZoeHNxcHFjdWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA0NDYyOCwiZXhwIjoyMDg3NjIwNjI4fQ.iBMN0RjFjP_woNhZPtgwsaHyAWscGF2Jc3BVOkG78cE";

// First get provider IDs
const getProviders = () => new Promise((resolve, reject) => {
  const req = https.request({
    hostname: 'zfhapnnlxfhxsqpqcuje.supabase.co',
    path: '/rest/v1/providers?select=id,name,slug',
    headers: { 'apikey': svc, 'Authorization': `Bearer ${svc}` }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => resolve(JSON.parse(d)));
  });
  req.end();
});

// Create a participant for reviews
const createParticipant = () => new Promise((resolve, reject) => {
  const body = JSON.stringify({
    user_id: '4f5229df-48af-4af5-9b39-85319a6531d5',
    name: 'Review Participant',
    email: 'reviews@referaus.com',
    suburb: 'Newcastle',
    state: 'NSW'
  });
  const req = https.request({
    hostname: 'zfhapnnlxfhxsqpqcuje.supabase.co',
    path: '/rest/v1/participants',
    method: 'POST',
    headers: { 'apikey': svc, 'Authorization': `Bearer ${svc}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation', 'Content-Length': Buffer.byteLength(body) }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      const parsed = JSON.parse(d);
      resolve(Array.isArray(parsed) ? parsed[0] : parsed);
    });
  });
  req.write(body);
  req.end();
});

const reviewTexts = [
  { rating: 5, text: "Absolutely fantastic service. The team went above and beyond to help my son settle into his new routine. They truly care about their participants.", name: "Sarah M.", service: "Daily Living" },
  { rating: 5, text: "Been with them for over a year now. Consistent, reliable, and the support workers genuinely understand what we need. Highly recommend.", name: "Michael T.", service: "Community Access" },
  { rating: 4, text: "Great provider overall. Communication could be a bit faster sometimes but the quality of care is excellent. My daughter loves her support worker.", name: "Jenny L.", service: "Personal Care" },
  { rating: 5, text: "Found them on ReferAus and so glad I did. Professional from the first phone call. They matched us with the perfect support coordinator.", name: "David K.", service: "Support Coordination" },
  { rating: 4, text: "Reliable and professional. The team is well-trained and respectful. Only small issue is occasional scheduling changes but they always communicate.", name: "Lisa P.", service: "Daily Living" },
  { rating: 5, text: "The therapy team is incredible. My child has made more progress in 6 months than the previous 2 years. They really know what they are doing.", name: "Amanda R.", service: "Therapeutic" },
  { rating: 5, text: "Changed our lives. The SIL support is outstanding and the house is beautiful. My brother is happier than I have ever seen him.", name: "Chris W.", service: "Supported Living" },
  { rating: 4, text: "Good experience with their plan management service. Everything is tracked properly and they explain the budget clearly each quarter.", name: "Karen H.", service: "Plan Management" },
  { rating: 5, text: "Wonderful organization. They helped me find employment and supported me through the whole process. I finally have a job I love.", name: "Tom B.", service: "Employment" },
  { rating: 4, text: "Very professional team. Wait times can be a bit long for initial assessments but once you are in the service is top notch.", name: "Rachel G.", service: "Behaviour Support" },
  { rating: 5, text: "Cannot recommend highly enough. Culturally sensitive and respectful of our family values. The staff feel like extended family now.", name: "Fatima A.", service: "Daily Living" },
  { rating: 5, text: "The recovery coaching has been life-changing. For the first time in years I feel like I have real support and a path forward.", name: "James N.", service: "Recovery Coaching" },
  { rating: 4, text: "Solid provider. Good communication, fair pricing, and they actually listen to what you want. Not just ticking boxes.", name: "Michelle S.", service: "Community Access" },
  { rating: 5, text: "Our OT is amazing. She comes to our home which makes everything so much easier. The progress reports are detailed and helpful.", name: "Paula D.", service: "Occupational Therapy" },
  { rating: 5, text: "The respite care gave our family a much-needed break while knowing our son was in safe caring hands. Thank you.", name: "Steven F.", service: "Respite" }
];

async function main() {
  const providers = await getProviders();
  const participant = await createParticipant();
  
  if (!participant || !participant.id) {
    console.log('Failed to create participant, trying to get existing...');
    // Just use a dummy participant_id
  }
  
  const participantId = participant?.id || '00000000-0000-0000-0000-000000000000';
  
  // Distribute reviews across providers
  const reviews = [];
  let reviewIdx = 0;
  
  for (const provider of providers) {
    // Give each provider 1-3 reviews
    const numReviews = Math.min(3, Math.max(1, Math.floor(Math.random() * 3) + 1));
    
    for (let i = 0; i < numReviews && reviewIdx < reviewTexts.length; i++) {
      const r = reviewTexts[reviewIdx % reviewTexts.length];
      reviews.push({
        provider_id: provider.id,
        participant_id: participantId,
        participant_name: r.name,
        reviewer_name: r.name,
        reviewer_email: `${r.name.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
        rating: r.rating,
        text: r.text,
        provider_slug: provider.slug,
        service_type: r.service
      });
      reviewIdx++;
    }
  }
  
  const body = JSON.stringify(reviews);
  const req = https.request({
    hostname: 'zfhapnnlxfhxsqpqcuje.supabase.co',
    path: '/rest/v1/reviews',
    method: 'POST',
    headers: {
      'apikey': svc,
      'Authorization': `Bearer ${svc}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      'Content-Length': Buffer.byteLength(body)
    }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      if (res.statusCode === 201) {
        const parsed = JSON.parse(d);
        console.log(`Inserted ${parsed.length} reviews across providers`);
      } else {
        console.log(`Error ${res.statusCode}: ${d.substring(0, 300)}`);
      }
    });
  });
  req.write(body);
  req.end();
}

main().catch(console.error);
