# ⚡ ReferAus Quick Start — What To Do Right Now

**You have a production-ready marketplace. Here's what's left:**

---

## 🎯 TODAY (30 minutes)

### 1. Gather 3 API Keys
- **Supabase Keys:** https://zfhapnnlxfhxsqpqcuje.supabase.co (Settings → API)
  - Copy: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Copy: `SUPABASE_SERVICE_ROLE_KEY`

- **Stripe Secret Key:** https://dashboard.stripe.com (Developers → API Keys)
  - Copy: Secret key (sk_test_...)

- **Resend API Key:** https://resend.com (API Keys)
  - Copy: your API key (re_...)

### 2. Update `.env.local`
```bash
nano .env.local
# Replace placeholder values with your keys
# Save: Ctrl+O, Enter, Ctrl+X
```

### 3. Deploy Supabase Migration
```bash
npx supabase db push
# Creates all tables, RLS policies, triggers
```

### 4. Deploy to Vercel
```bash
npx vercel --prod
# Adds env vars to Vercel automatically
```

### 5. Test It
```bash
# Visit: https://referaus.vercel.app
# - Search providers ✓
# - Register account ✓
# - Check email verification ✓
# - Try Stripe: card 4242 4242 4242 4242 ✓
```

---

## 🌐 THEN (2 minutes)

### Update DNS at GoDaddy
1. Go to: https://godaddy.com/domains → referaus.com
2. Change nameservers to:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. Wait 24 hours for DNS to propagate

### Verify DNS Worked
```bash
nslookup referaus.com
# Should show Vercel's IP address
```

---

## 📊 INFRASTRUCTURE

| What | Where | Status |
|------|-------|--------|
| **App** | https://referaus.vercel.app | ✅ Ready |
| **Domain** | https://referaus.com | ⏳ DNS update |
| **Database** | Supabase zfhapnnlxfhxsqpqcuje | ⏳ Migration |
| **Payments** | Stripe TEST mode | ✅ Ready |

---

## ✅ DONE

You'll have:
- ✅ Full NDIS marketplace live
- ✅ 57 pages, 66 pre-rendered static
- ✅ Provider search & profiles
- ✅ Provider dashboard
- ✅ Admin panel
- ✅ Stripe checkout (test mode)
- ✅ Email verification
- ✅ 2FA available

---

## 🚀 NEXT

Once DNS updates (24h):
- Call 50 Newcastle NDIS providers
- Pitch free listing on referaus.com
- Enable live Stripe mode when revenue starts

---

**Questions? Read: DEPLOYMENT.md or AUDIT.md**
