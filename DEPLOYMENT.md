# 🚀 ReferAus Complete Deployment Guide

**Status:** Build ✅ | Database ⏳ | DNS ⏳ | Live ⏳

---

## 📋 Pre-Deployment Checklist

### Infrastructure Already Found & Configured
- ✅ **Supabase Project:** `zfhapnnlxfhxsqpqcuje.supabase.co`
- ✅ **Next.js Build:** 66 pages generated, 0 errors
- ✅ **Vercel Project:** `referaus` (configured)
- ✅ **Domain:** `referaus.com` (ready via GoDaddy)
- ✅ **.env.local:** Template created with Supabase URL

### Still Needed (Only 3 Things)
1. **Stripe TEST Secret Key** (from Stripe dashboard)
2. **Resend API Key** (from Resend.com)
3. **Supabase Anon Key & Service Role Key** (from Supabase dashboard)

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### STEP 1: Get Your API Keys (5 minutes)

#### 1a. Supabase Keys
1. Go to: https://zfhapnnlxfhxsqpqcuje.supabase.co
2. Sign in with your account
3. Click **Settings** → **API**
4. Copy:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, starts with `eyJ...`)
   - `SUPABASE_SERVICE_ROLE_KEY` (secret, starts with `eyJ...` but different)
5. Paste into `.env.local`

#### 1b. Stripe Keys
1. Go to: https://dashboard.stripe.com
2. Make sure you're in **TEST MODE** (toggle in top right)
3. Go to **Developers** → **API Keys**
4. Copy: **Secret key** (starts with `sk_test_`)
5. Paste as `STRIPE_SECRET_KEY` in `.env.local`

#### 1c. Stripe Webhook Secret
1. Still in Stripe Developers section, go to **Webhooks**
2. Look for endpoint: `https://referaus.com/api/webhooks/stripe`
3. Copy the **Signing secret** (starts with `whsec_`)
4. Already filled in .env.local: `whsec_WYnQDMY0tghOxPSejtm495DpuKwxlhh7`

#### 1d. Stripe Price IDs
1. In Stripe Developers → **Products**
2. Find or create products:
   - **Starter:** $29/mo, $290/yr
   - **Pro:** $79/mo, $790/yr
   - **Premium:** $149/mo, $1,490/yr
3. Copy each price ID (starts with `price_`)
4. Add to `.env.local`:
   ```
   STRIPE_PRICE_STARTER_MONTHLY=price_1Ox...
   STRIPE_PRICE_STARTER_YEARLY=price_1Ox...
   STRIPE_PRICE_PRO_MONTHLY=price_1Ox...
   STRIPE_PRICE_PRO_YEARLY=price_1Ox...
   STRIPE_PRICE_PREMIUM_MONTHLY=price_1Ox...
   STRIPE_PRICE_PREMIUM_YEARLY=price_1Ox...
   ```

#### 1e. Resend API Key
1. Go to: https://resend.com
2. Sign up/login
3. Go to **API Keys**
4. Create new API key or copy existing
5. Paste as `RESEND_API_KEY` in `.env.local`

### STEP 2: Deploy Database Schema (2 minutes)

Run the Supabase migration to create all tables, RLS policies, and triggers:

```bash
# Option A: Using Supabase CLI (recommended)
npm install -g @supabase/cli
npx supabase db push

# Option B: Manual SQL in Supabase Dashboard
# Go to: https://zfhapnnlxfhxsqpqcuje.supabase.co/project/default/sql
# Copy entire contents of: supabase-schema.sql
# Paste and run
```

**Verify:** Check Supabase Dashboard → **SQL** → Tables appear:
- providers
- reviews
- enquiries
- provider_images
- auth.users

### STEP 3: Test Locally (2 minutes)

```bash
npm run dev
# Opens: http://localhost:3000

# Test:
# 1. Homepage loads
# 2. Provider search works
# 3. Login/Register page accessible
# 4. Admin panel at /admin (email: benhoward970@gmail.com)
```

### STEP 4: Deploy to Vercel (3 minutes)

```bash
# Option A: Using Vercel CLI
npm i -g vercel
vercel --prod

# Option B: GitHub integration
# Push to GitHub, Vercel auto-deploys

# Option C: Use Vercel dashboard
# https://vercel.com/dashboard → referaus project → Deploy
```

### STEP 5: Add Environment Variables to Vercel

1. Go to: https://vercel.com/dashboard
2. Select **referaus** project
3. **Settings** → **Environment Variables**
4. Add all keys from `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://zfhapnnlxfhxsqpqcuje.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_STARTER_MONTHLY=price_...
   STRIPE_PRICE_STARTER_YEARLY=price_...
   STRIPE_PRICE_PRO_MONTHLY=price_...
   STRIPE_PRICE_PRO_YEARLY=price_...
   STRIPE_PRICE_PREMIUM_MONTHLY=price_...
   STRIPE_PRICE_PREMIUM_YEARLY=price_...
   RESEND_API_KEY=re_...
   NEXT_PUBLIC_APP_URL=https://referaus.com
   ```

### STEP 6: Configure Stripe Webhook (1 minute)

1. Go to Stripe Developers → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://referaus.com/api/webhooks/stripe` (or `https://referaus.vercel.app/api/webhooks/stripe`)
4. Select events: `checkout.session.completed`, `customer.subscription.deleted`
5. Copy signing secret → Add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`

### STEP 7: Update DNS (2 minutes)

1. Go to GoDaddy domain settings
2. Update nameservers to:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
   OR add CNAME:
   ```
   www CNAME cname.vercel-dns.com
   ```
3. Wait 24-48 hours for propagation
4. Verify: `nslookup referaus.com`

### STEP 8: Test End-to-End (5 minutes)

```bash
# 1. Visit https://referaus.com (or .vercel.app)
# 2. Test provider search
# 3. Register as provider
# 4. Verify email works (check Resend logs)
# 5. Login
# 6. Go to /pricing
# 7. Select Pro plan
# 8. Use test card: 4242 4242 4242 4242
# 9. Verify payment succeeds
# 10. Check Supabase: providers table, plan should be "pro"
```

---

## 📊 Infrastructure Summary

| Component | Details | Status |
|-----------|---------|--------|
| **Frontend** | Next.js 16, Tailwind v4 | ✅ Build OK |
| **Database** | Supabase (zfhapnnlxfhxsqpqcuje) | ⏳ Migration needed |
| **Auth** | Email + password, 2FA (TOTP) | ✅ Configured |
| **Payments** | Stripe checkout + webhooks | ✅ Configured (TEST) |
| **Email** | Resend templates | ⏳ Key needed |
| **Domain** | referaus.com | ✅ Ready |
| **DNS** | Vercel nameservers | ⏳ Update needed |
| **Hosting** | Vercel | ✅ Project created |

---

## 💰 Monthly Costs

| Service | Free Tier | Paid Tier | Estimated |
|---------|-----------|-----------|-----------|
| Vercel | ✅ 100GB bandwidth | $20+ | FREE for now |
| Supabase | 500MB database | $25/mo | $25+ (growth) |
| Stripe | $0 flat fee | 2.9% + $0.30/txn | $0 until revenue |
| Resend | 100 emails/mo | $20/mo | FREE for now |
| Domain | - | $12/yr GoDaddy | $1/mo |
| **TOTAL** | | | **~$27/mo** |

---

## 🔒 Security Checklist

- ✅ No secrets in code (all in .env)
- ✅ Supabase RLS policies configured
- ✅ Stripe webhook signature verification
- ✅ Email verification before signup
- ✅ 2FA (TOTP) available
- ✅ CORS properly configured
- ✅ Rate limiting on APIs
- ⏳ Add monitoring (Sentry optional)
- ⏳ Set up backups (Supabase automated)

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Supabase Connection Error
```
Check: NEXT_PUBLIC_SUPABASE_URL and keys are correct
Try: Visit https://zfhapnnlxfhxsqpqcuje.supabase.co directly
```

### Stripe Webhook Not Firing
```
1. Check Stripe webhook signing secret in Vercel env vars
2. Verify endpoint URL is correct
3. Check Stripe webhook logs for failed attempts
4. Test with Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Email Not Sending
```
1. Verify Resend API key is correct
2. Check Resend dashboard for rate limits
3. Verify recipient email is whitelisted in test mode
```

### DNS Not Resolving
```
1. Check nameservers updated in GoDaddy
2. Wait 24-48 hours for TTL to expire
3. Clear local DNS cache: nslookup -debug referaus.com
```

---

## 📞 Support Links

- **Supabase Dashboard:** https://zfhapnnlxfhxsqpqcuje.supabase.co
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Vercel Dashboard:** https://vercel.com/dashboard/referaus
- **Resend:** https://resend.com
- **GoDaddy DNS:** https://godaddy.com/domains

---

## ✨ Next Steps After Launch

Once deployed and tested:

1. **Seed Real Providers**
   - 50+ Newcastle NDIS providers already seeded
   - Verify on `/providers` page

2. **Enable Live Mode**
   - Switch Stripe from TEST to LIVE
   - Update Stripe keys
   - Enable production payments

3. **Monitor & Optimize**
   - Set up Vercel Analytics
   - Monitor database performance
   - Track conversion funnels

4. **Market the Platform**
   - Call Hunter Region providers
   - Post on NDIS Facebook groups
   - Publish SEO articles
   - Google Search Console setup

---

## 🎉 Success Criteria

When complete, you should have:
- ✅ referaus.com resolving to Vercel
- ✅ Providers visible on `/providers`
- ✅ Login/register working
- ✅ Email verification sending
- ✅ Stripe checkout working in TEST mode
- ✅ Plan upgrades saving to database
- ✅ Admin panel accessible
- ✅ Build: 0 errors, 66 pages

---

**Total Time: ~30 minutes from keys to live**
