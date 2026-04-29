#!/bin/bash

# ReferAus Complete Setup Script
# Automates: Dependencies, Database, Build, Deployment
# Usage: bash SETUP.sh

set -e

echo "🚀 ReferAus Setup Starting..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${YELLOW}1️⃣  Installing dependencies...${NC}"
npm install

# Step 2: Check for required environment variables
echo -e "${YELLOW}2️⃣  Checking environment variables...${NC}"

REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "RESEND_API_KEY"
)

MISSING=()
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var}" ]] || [[ "${!var}" == *"placeholder"* ]]; then
    MISSING+=("$var")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Missing or placeholder environment variables:${NC}"
  for var in "${MISSING[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo "📝 Update .env.local with real values from:"
  echo "   - Supabase: https://zfhapnnlxfhxsqpqcuje.supabase.co"
  echo "   - Stripe: https://dashboard.stripe.com"
  echo "   - Resend: https://resend.com/api-keys"
  echo ""
  echo "Then run: bash SETUP.sh again"
  exit 1
fi

echo -e "${GREEN}✓ All environment variables present${NC}"

# Step 3: Build the application
echo -e "${YELLOW}3️⃣  Building Next.js application...${NC}"
npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Build successful${NC}"
else
  echo -e "${RED}✗ Build failed${NC}"
  exit 1
fi

# Step 4: Display deployment instructions
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Test locally:"
echo "   npm run dev"
echo "   Visit: http://localhost:3000"
echo ""
echo "2️⃣  Deploy to Vercel:"
echo "   npx vercel --prod"
echo ""
echo "3️⃣  Configure DNS:"
echo "   Update GoDaddy nameservers to:"
echo "   - ns1.vercel-dns.com"
echo "   - ns2.vercel-dns.com"
echo ""
echo "4️⃣  Deploy Supabase migrations:"
echo "   npx supabase db push"
echo ""
echo -e "${YELLOW}📊 Infrastructure:${NC}"
echo "   Supabase: https://zfhapnnlxfhxsqpqcuje.supabase.co"
echo "   Vercel: https://referaus.vercel.app"
echo "   Domain: https://referaus.com"
echo ""
