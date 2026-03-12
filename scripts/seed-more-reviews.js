const https = require('https');
const svc = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaGFwbm5seGZoeHNxcHFjdWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA0NDYyOCwiZXhwIjoyMDg3NjIwNjI4fQ.iBMN0RjFjP_woNhZPtgwsaHyAWscGF2Jc3BVOkG78cE";

// Get all providers that don't have reviews yet
const get = (path) => new Promise((resolve) => {
  const req = https.request({hostname:'zfhapnnlxfhxsqpqcuje.supabase.co',path,headers:{'apikey':svc,'Authorization':`Bearer ${svc}`}},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve(JSON.parse(d)))});
  req.end();
});

const post = (path, data) => new Promise((resolve) => {
  const body = JSON.stringify(data);
  const req = https.request({hostname:'zfhapnnlxfhxsqpqcuje.supabase.co',path,method:'POST',headers:{'apikey':svc,'Authorization':`Bearer ${svc}`,'Content-Type':'application/json','Prefer':'return=representation','Content-Length':Buffer.byteLength(body)}},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,data:JSON.parse(d)}))});
  req.write(body);
  req.end();
});

const moreReviews = [
  {rating:5,text:"The Indigenous cultural programs are amazing. My son finally feels seen and understood. The staff genuinely care about connecting culture with support.",name:"Kylie J.",service:"Cultural Programs"},
  {rating:4,text:"Good coordination service. They helped us navigate the NDIS maze and found providers we never knew existed in Newcastle.",name:"Brett C.",service:"Support Coordination"},
  {rating:5,text:"Flexible and reliable. When our regular worker was sick they organised a replacement within hours. That matters when you depend on daily support.",name:"Wendy T.",service:"Daily Living"},
  {rating:5,text:"The whole team at Gleam are wonderful. Person-centred is not just a buzzword with them — they actually live it every day.",name:"Tony M.",service:"Daily Living"},
  {rating:4,text:"Great SIL house and supportive staff. The transition was smooth and my brother settled in quickly. Communication with families could be slightly better.",name:"Joanne R.",service:"Supported Living"},
  {rating:5,text:"Excellent allied health team. The physio designed a program specifically for my needs and I have made huge improvements in mobility.",name:"Greg P.",service:"Physiotherapy"},
  {rating:4,text:"Calvary has been solid for mum. Consistent carers who know her routine. The only downside is the wait time to get started was about 3 weeks.",name:"Natalie H.",service:"Personal Care"},
  {rating:5,text:"Aspect changed our family life. The autism diagnosis was just the beginning — their therapy and school support has been transformative for our daughter.",name:"Andrew S.",service:"Autism Support"},
  {rating:5,text:"Early intervention made all the difference. Starting therapy at 2 meant my son was ready for mainstream school. Cannot thank them enough.",name:"Emma B.",service:"Early Intervention"},
  {rating:4,text:"Professional not-for-profit that genuinely puts participants first. Good range of services and the staff turnover is low which means consistency.",name:"Marcus D.",service:"Supported Living"},
  {rating:5,text:"The OT home assessment was thorough and the recommendations made a real difference to my daily independence. Worth the wait.",name:"Diane K.",service:"Occupational Therapy"},
  {rating:5,text:"Finally found a provider that understands complex mental health. The recovery coaching approach is respectful and empowering.",name:"Simon L.",service:"Mental Health"},
  {rating:4,text:"Mosaic have been supporting my sister for years. Stable accommodation, good day programs, and staff who know her well.",name:"Rebecca W.",service:"Day Programs"},
  {rating:5,text:"The speech pathology sessions have been incredible. My non-verbal child is now using a communication device confidently. Life changing.",name:"Catherine F.",service:"Speech Pathology"},
  {rating:5,text:"Connected us with the perfect SIL home. The matching process was thorough and they checked in regularly during the transition.",name:"Peter A.",service:"SIL Matching"},
  {rating:4,text:"Good provider. They handle all the plan management paperwork so I can focus on actually using my supports. Clear quarterly reports.",name:"Helen V.",service:"Plan Management"},
  {rating:5,text:"The group social programs have given my son friends for the first time. He looks forward to Wednesdays now. Priceless.",name:"Sandra Y.",service:"Community Access"},
  {rating:5,text:"Excellent behaviour support. The positive behaviour plan actually works and the whole family is calmer. Practical strategies we use every day.",name:"Daniel O.",service:"Behaviour Support"},
  {rating:4,text:"Transport assistance has been a game changer. I can get to my appointments independently now. The drivers are always friendly and on time.",name:"Louise E.",service:"Transport"},
  {rating:5,text:"The respite weekends give us the break we desperately needed. Knowing our daughter is happy and safe lets us actually recharge.",name:"Robert N.",service:"Respite"}
];

async function main() {
  const providers = await get('/rest/v1/providers?select=id,slug');
  const existingReviews = await get('/rest/v1/reviews?select=provider_id');
  const reviewedIds = new Set(existingReviews.map(r => r.provider_id));
  
  // Get participant ID
  const participants = await get('/rest/v1/participants?select=id&limit=1');
  const participantId = participants[0]?.id;
  
  if (!participantId) {
    console.log('No participant found');
    return;
  }
  
  const reviews = [];
  let idx = 0;
  
  for (const provider of providers) {
    // Ensure every provider has at least 1 review
    const existingCount = existingReviews.filter(r => r.provider_id === provider.id).length;
    const needed = existingCount === 0 ? 2 : (existingCount < 2 ? 1 : 0);
    
    for (let i = 0; i < needed && idx < moreReviews.length; i++) {
      const r = moreReviews[idx];
      reviews.push({
        provider_id: provider.id,
        participant_id: participantId,
        participant_name: r.name,
        reviewer_name: r.name,
        reviewer_email: `${r.name.toLowerCase().replace(/[^a-z]/g,'')}@example.com`,
        rating: r.rating,
        text: r.text,
        provider_slug: provider.slug,
        service_type: r.service
      });
      idx++;
    }
  }
  
  if (reviews.length === 0) {
    console.log('All providers already have reviews');
    return;
  }
  
  const result = await post('/rest/v1/reviews', reviews);
  if (result.status === 201) {
    console.log(`Inserted ${result.data.length} more reviews (total: ${existingReviews.length + result.data.length})`);
  } else {
    console.log(`Error ${result.status}: ${JSON.stringify(result.data).substring(0,300)}`);
  }
}

main().catch(console.error);
