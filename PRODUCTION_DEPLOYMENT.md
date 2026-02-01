# Rover - Production Deployment & Monetization Guide

## Overview

This guide covers deploying Rover to production with an optimized, profitable credit-based payment system. The goal is to minimize infrastructure costs while maintaining healthy margins on user credit consumption.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Credit-Based Pricing Strategy](#credit-based-pricing-strategy)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Cost Optimization](#cost-optimization)
5. [Deployment Steps](#deployment-steps)
6. [Monitoring & Scaling](#monitoring--scaling)

---

## Architecture Overview

### Core Services

1. **Frontend (apps/www)** - Next.js 15 App Router
   - Deploy to: Vercel (recommended) or self-hosted
   - Auto-scaling, edge functions, zero cold starts
   
2. **WebSocket (apps/broadcast)** - PartyKit service
   - Deploy to: PartyKit platform
   - Realtime updates for task status, chat streaming
   
3. **CLI (apps/cli)** - `rover` command
   - Publish to: npm registry (@rover-labs/cli)
   - Used for local task handoff and MCP server
   
4. **Documentation (apps/docs)** - Fumadocs site
   - Deploy to: Vercel or static hosting
   
5. **Database** - PostgreSQL + Redis
   - Recommended: Neon (PostgreSQL) + Upstash (Redis)
   - Alternatives: Supabase, Railway, AWS RDS
   
6. **Storage** - Cloudflare R2
   - File uploads, attachments, sandbox checkpoints
   
7. **Sandbox Providers**
   - E2B (recommended for production)
   - Daytona (optional, behind feature flag)
   - Docker (development/testing only)

---

## Credit-Based Pricing Strategy

### Pricing Philosophy

**Goal**: Make pricing appear affordable while maintaining 3-5x markup on costs.

### Recommended Credit Pricing

```
Credit Packs (One-time Purchase):
- Starter Pack:    $10 = 1,000 credits    ($0.010/credit)
- Developer Pack:  $25 = 3,000 credits    ($0.0083/credit) - 17% bonus
- Pro Pack:        $50 = 7,500 credits    ($0.0067/credit) - 33% bonus
- Team Pack:      $100 = 18,000 credits   ($0.0056/credit) - 44% bonus

Monthly Subscriptions (Recurring):
- Hobby Plan:     $15/mo = 1,500 credits/mo + rollover
- Developer Plan: $39/mo = 5,000 credits/mo + rollover
- Pro Plan:       $99/mo = 15,000 credits/mo + rollover + priority support
```

### Credit Consumption Rates

**Model Usage** (per 1M tokens):
```
Claude Sonnet 3.5:
- Input:                ~150 credits  (Cost: $3.00, Markup: 5x)
- Output:               ~750 credits  (Cost: $15.00, Markup: 5x)
- Cache Write:          ~187 credits  (Cost: $3.75, Markup: 5x)
- Cache Read:           ~15 credits   (Cost: $0.30, Markup: 5x)

Claude Opus 3:
- Input:                ~750 credits  (Cost: $15.00, Markup: 5x)
- Output:              ~3750 credits  (Cost: $75.00, Markup: 5x)

OpenAI GPT-4o:
- Input:                ~125 credits  (Cost: $2.50, Markup: 5x)
- Output:               ~500 credits  (Cost: $10.00, Markup: 5x)

Gemini Flash 2.0:
- Input:                 ~15 credits  (Cost: $0.30, Markup: 5x)
- Output:                ~30 credits  (Cost: $0.60, Markup: 5x)
```

**Sandbox Time** (per hour):
```
E2B Sandbox (2 vCPU, 4GB RAM):
- Active time:          ~50 credits/hour  (Cost: $0.10/hr, Markup: 5x)
- Hibernation:          ~2 credits/hour   (Cost: $0.004/hr, Markup: 5x)
```

**GitHub Operations**:
```
- Commit generation:     5 credits   (OpenAI API ~$0.001)
- PR description:       10 credits   (OpenAI API ~$0.002)
- Branch operations:     0 credits   (Free)
```

**Storage** (Cloudflare R2):
```
- File uploads:         ~1 credit/10MB  (Cost: $0.015/GB)
- Sandbox checkpoints:  Free (amortized)
```

### Example Task Costs

**Typical Web App Feature** (e.g., "Add dark mode toggle"):
- Model tokens: ~200K input, 50K output = ~30-40 credits
- Sandbox time: ~5 minutes = ~4 credits
- GitHub ops: ~15 credits
- **Total: ~50-60 credits ($0.30-0.50 revenue, $0.06-0.10 cost)**

**Complex Refactoring** (e.g., "Migrate from Redux to Zustand"):
- Model tokens: ~1M input, 300K output = ~250-300 credits
- Sandbox time: ~30 minutes = ~25 credits
- GitHub ops: ~15 credits
- **Total: ~300-350 credits ($2.00-2.30 revenue, $0.40-0.50 cost)**

### Profit Margins

With 5x markup on AI costs and optimized sandbox usage:
- **Gross Margin: 70-80%** (typical SaaS target)
- **Net Margin: 40-50%** (after infrastructure, support, ops)

---

## Infrastructure Setup

### Database: Neon PostgreSQL

**Recommended Plan**: Scale (pay-as-you-go)
- Cost: ~$25-100/month (0-10K users)
- Auto-scaling, branching, point-in-time recovery
- Connection pooling included

**Setup**:
```bash
# Create Neon project at neon.tech
# Get connection string
DATABASE_URL="postgresql://user:pass@REPLACE_WITH_YOUR_NEON_ENDPOINT.neon.tech/rover?sslmode=require"

# Push schema
pnpm -C packages/shared drizzle-kit-push-prod
```

### Redis: Upstash

**Recommended Plan**: Pay-as-you-go
- Cost: ~$10-30/month (0-10K users)
- Durable storage, global replication
- Rate limiting, caching, queues

**Setup**:
```bash
# Create Upstash Redis at upstash.com
# Get connection URLs
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="REPLACE_WITH_YOUR_VALUE"
```

### Storage: Cloudflare R2

**Cost**: $0.015/GB stored + $0.36/million requests
- Much cheaper than S3
- No egress fees
- ~$5-20/month for 100GB + 10M requests

**Setup**:
```bash
# Create R2 bucket at dash.cloudflare.com
# Create API token with R2 permissions
R2_ACCOUNT_ID="REPLACE_WITH_YOUR_VALUE"
R2_ACCESS_KEY_ID="REPLACE_WITH_YOUR_VALUE"
R2_SECRET_ACCESS_KEY="REPLACE_WITH_YOUR_VALUE"
R2_BUCKET_NAME="rover-uploads"
R2_PRIVATE_BUCKET_NAME="rover-private"
R2_PUBLIC_URL="https://cdn.roverlabs.com"
```

### Sandbox: E2B

**Recommended**: Custom pricing for startups
- Default: $0.10/hour per sandbox
- Negotiate volume pricing: ~$0.05-0.08/hour at scale
- Auto-hibernation reduces idle costs to pennies

**Setup**:
```bash
# Sign up at e2b.dev
# Get API key
E2B_API_KEY="REPLACE_WITH_YOUR_E2B_API_KEY"
```

**Cost Optimization**:
- Enable auto-hibernation after 5 minutes idle
- Use smaller instances (2 vCPU, 4GB) for most tasks
- Pre-warm template images to reduce boot time

### Email: Resend

**Cost**: $20/month for 10K emails
- Transactional emails, onboarding, notifications

```bash
RESEND_API_KEY="REPLACE_WITH_YOUR_RESEND_API_KEY"
```

### Monitoring: Better Stack (formerly LogTail)

**Cost**: Free tier → $29/month
- Logs, uptime monitoring, alerts

---

## Cost Optimization

### 1. Sandbox Efficiency

**Auto-Hibernation**:
```typescript
// Already implemented in packages/sandbox/src/e2b-provider.ts
// Hibernates after 5 minutes of inactivity
// Reduces costs by 95% during idle time
```

**Template Pre-warming**:
```bash
# Build and cache sandbox template
# Reduces cold start from 30s to 3s
pnpm -C packages/sandbox-image build-template
```

**Sandbox Pooling** (Future Enhancement):
- Keep 2-3 warm sandboxes ready
- Assign to tasks instantly
- Recycle after task completion

### 2. AI Model Selection

**Smart Model Routing**:
- Simple tasks: Gemini Flash (cheapest)
- Code generation: Claude Sonnet (best quality/cost)
- Complex reasoning: Claude Opus (only when needed)
- Commit messages: GPT-4o-mini (fast, cheap)

**Prompt Caching**:
```typescript
// Already implemented - caches system prompts and repo context
// Reduces input costs by 90% for follow-up messages
```

### 3. Database Optimization

**Connection Pooling**:
```typescript
// Use Neon's built-in pooling + PgBouncer
// Max 10 connections per instance
// Reuse connections across requests
```

**Query Optimization**:
```typescript
// Indexes already in place for:
// - Thread lookups by user
// - Usage events aggregation
// - Sandbox status queries
```

### 4. Edge Caching

**Static Assets**:
- Serve via Vercel Edge Network (free)
- Cache CSS, JS, images at edge
- Reduce origin requests by 95%

**API Routes**:
- Cache expensive queries (user profile, feature flags)
- Use stale-while-revalidate pattern
- Redis-backed session cache

---

## Deployment Steps

### 1. Environment Setup

Create `.env.production` in `apps/www`:

```bash
# Core
NODE_ENV=production
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="$(openssl rand -hex 32)"
BETTER_AUTH_URL="https://app.roverlabs.com"
ENCRYPTION_MASTER_KEY="$(openssl rand -base64 32)"
INTERNAL_SHARED_SECRET="$(openssl rand -hex 32)"

# AI Providers
ANTHROPIC_API_KEY="REPLACE_WITH_YOUR_ANTHROPIC_API_KEY"
OPENAI_API_KEY="REPLACE_WITH_YOUR_OPENAI_API_KEY"
GOOGLE_AI_API_KEY="REPLACE_WITH_YOUR_GOOGLE_AI_API_KEY"  # Optional

# Sandbox
E2B_API_KEY="REPLACE_WITH_YOUR_E2B_API_KEY"
DAYTONA_API_KEY="REPLACE_WITH_YOUR_VALUE"  # Optional

# Storage
R2_ACCOUNT_ID="REPLACE_WITH_YOUR_VALUE"
R2_ACCESS_KEY_ID="REPLACE_WITH_YOUR_VALUE"
R2_SECRET_ACCESS_KEY="REPLACE_WITH_YOUR_VALUE"
R2_BUCKET_NAME="rover-uploads"
R2_PRIVATE_BUCKET_NAME="rover-private"
R2_PUBLIC_URL="https://cdn.roverlabs.com"

# GitHub
GITHUB_CLIENT_ID="REPLACE_WITH_YOUR_GITHUB_CLIENT_ID"
GITHUB_CLIENT_SECRET="REPLACE_WITH_YOUR_VALUE"
GITHUB_WEBHOOK_SECRET="$(openssl rand -hex 32)"
GITHUB_APP_ID="123456"
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
NEXT_PUBLIC_GITHUB_APP_NAME="rover-app"

# Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="REPLACE_WITH_YOUR_VALUE"

# Stripe
STRIPE_SECRET_KEY="REPLACE_WITH_YOUR_STRIPE_SECRET_KEY"
STRIPE_WEBHOOK_SECRET="REPLACE_WITH_YOUR_STRIPE_WEBHOOK_SECRET"
STRIPE_PRICE_CREDIT_PACK_STARTER="REPLACE_WITH_YOUR_PRICE_ID"
STRIPE_PRICE_CREDIT_PACK_DEVELOPER="REPLACE_WITH_YOUR_PRICE_ID"
STRIPE_PRICE_CREDIT_PACK_PRO="REPLACE_WITH_YOUR_PRICE_ID"
STRIPE_PRICE_CREDIT_PACK_TEAM="REPLACE_WITH_YOUR_PRICE_ID"
STRIPE_PRICE_HOBBY_MONTHLY="REPLACE_WITH_YOUR_PRICE_ID"
STRIPE_PRICE_DEVELOPER_MONTHLY="REPLACE_WITH_YOUR_PRICE_ID"
STRIPE_PRICE_PRO_MONTHLY="REPLACE_WITH_YOUR_PRICE_ID"

# Broadcast
NEXT_PUBLIC_BROADCAST_HOST="rover-broadcast.your-username.partykit.dev"
NEXT_PUBLIC_BROADCAST_URL="https://rover-broadcast.your-username.partykit.dev"

# Email
RESEND_API_KEY="REPLACE_WITH_YOUR_RESEND_API_KEY"

# Monitoring (Optional)
POSTHOG_API_KEY="REPLACE_WITH_YOUR_POSTHOG_API_KEY"
SLACK_FEEDBACK_WEBHOOK_URL="https://hooks.slack.com/services/xxx"
```

### 2. Database Migration

```bash
# Push production schema
DATABASE_URL="postgresql://..." pnpm -C packages/shared drizzle-kit-push-prod

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

### 3. Stripe Setup

**Products & Prices**:
```bash
# Create products in Stripe Dashboard
# 1. Credit Packs (one-time payments)
# 2. Monthly Plans (recurring subscriptions)

# Copy price IDs to env vars
STRIPE_PRICE_CREDIT_PACK_STARTER="REPLACE_WITH_YOUR_PRICE_ID"
# ... etc
```

**Webhooks**:
```bash
# Add webhook endpoint: https://app.roverlabs.com/api/auth/stripe/webhook
# Events to subscribe:
# - payment_intent.succeeded
# - customer.subscription.created
# - customer.subscription.updated
# - customer.subscription.deleted
```

### 4. Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
cd apps/www
vercel link

# Deploy production
vercel --prod

# Configure environment variables in Vercel dashboard
# Or use: vercel env add ANTHROPIC_API_KEY production
```

**Vercel Configuration**:
- Framework Preset: Next.js
- Build Command: `cd ../.. && pnpm install && pnpm -C apps/www build`
- Output Directory: `apps/www/.next`
- Install Command: `pnpm install`
- Node Version: 20.x

### 5. Deploy Broadcast (PartyKit)

```bash
cd apps/broadcast

# Install PartyKit CLI
npm i -g partykit

# Login
partykit login

# Deploy
partykit deploy
# Output: https://rover-broadcast.your-username.partykit.dev

# Update NEXT_PUBLIC_BROADCAST_URL in Vercel env vars
```

### 6. Publish CLI

```bash
cd apps/cli

# Update version
npm version patch

# Build
pnpm build

# Publish to npm
npm publish --access public
# Published as @rover-labs/cli

# Users can install: npm install -g @rover-labs/cli
# Then use: rover auth, rover pull, rover create, etc.
```

### 7. Deploy Documentation

```bash
cd apps/docs

# Deploy to Vercel
vercel --prod
# Or: deploy as static site to Cloudflare Pages, Netlify, etc.
```

### 8. Setup Monitoring

**Sentry** (Error Tracking):
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# Add to apps/www
SENTRY_DSN="https://xxx@sentry.io/xxx"
```

**PostHog** (Analytics):
```bash
# Already integrated in apps/www
# Just add env var
POSTHOG_API_KEY="REPLACE_WITH_YOUR_POSTHOG_API_KEY"
```

### 9. Configure GitHub App

1. Create GitHub App at github.com/settings/apps
2. Permissions:
   - Repository: Contents (read/write), Pull requests (read/write), Metadata (read)
   - Organization: Members (read)
3. Subscribe to events:
   - Pull request, Push, Check run, Check suite
4. Webhook URL: `https://app.roverlabs.com/api/github/webhook`
5. Generate private key, download PEM file
6. Install app on organization/repositories

### 10. Domain Setup

**Frontend**: app.roverlabs.com
```bash
# Add custom domain in Vercel
# Add DNS records:
# A record: @ → 76.76.21.21 (Vercel)
# CNAME: app → cname.vercel-dns.com
```

**CDN**: cdn.roverlabs.com
```bash
# Point to R2 bucket
# CNAME: cdn → bucket.r2.cloudflarestorage.com
```

**Docs**: docs.roverlabs.com
```bash
# CNAME to Vercel or static host
```

---

## Monitoring & Scaling

### Key Metrics to Track

**Business Metrics**:
- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Credit Burn Rate (credits consumed/day)
- Credit Purchase Rate ($/user/month)
- Churn Rate

**Technical Metrics**:
- API Response Time (p50, p95, p99)
- Sandbox Boot Time
- Task Completion Rate
- Error Rate
- Database Query Performance

**Cost Metrics**:
- AI API Costs (per user, per task)
- Sandbox Costs (per hour, per task)
- Database Costs (per query, per GB)
- Storage Costs (per GB, per request)
- Total Infrastructure Cost

### Alerts to Setup

1. **High Error Rate** (>1% of requests)
2. **Slow API** (p95 > 2s)
3. **High AI Costs** (>$500/day)
4. **High Sandbox Costs** (>$200/day)
5. **Low Credit Balance** (user has <50 credits)
6. **Database Connection Errors**
7. **Payment Failures** (Stripe webhook failures)

### Scaling Strategy

**0-100 Users** (Month 1-2):
- Single Vercel instance (free tier → Pro $20/mo)
- Neon PostgreSQL Scale ($25-50/mo)
- Upstash Redis Pay-as-you-go ($10-20/mo)
- E2B sandboxes (variable, ~$100-300/mo)
- **Total Infrastructure: ~$200-400/mo**
- **Break-even: ~$500-800/mo revenue (25-40 paid users)**

**100-1K Users** (Month 3-6):
- Vercel Pro → Team ($20 → $50/mo)
- Neon Scale ($50-150/mo)
- Upstash Redis ($20-50/mo)
- E2B sandboxes (variable, ~$500-1500/mo)
- CDN (Cloudflare R2: $20-100/mo)
- **Total Infrastructure: ~$700-2000/mo**
- **Break-even: ~$2000-3000/mo revenue (100-150 paid users)**
- **Target: 200-300 paid users = $6K-12K MRR**

**1K-10K Users** (Month 6-12):
- Vercel Team → Enterprise ($50 → custom)
- Neon Scale → Business ($150-500/mo)
- Upstash Redis ($50-200/mo)
- E2B enterprise pricing (negotiate 30% discount: ~$3K-8K/mo)
- CDN (Cloudflare R2: $100-300/mo)
- **Total Infrastructure: ~$3K-9K/mo**
- **Break-even: ~$9K-15K/mo revenue**
- **Target: 1.5K-3K paid users = $50K-120K MRR**

### Cost Optimization at Scale

1. **Negotiate E2B Pricing**: Get custom enterprise pricing (30-50% off)
2. **Reserved Capacity**: Pre-purchase AI API credits for discounts
3. **Regional Optimization**: Deploy sandboxes in cheaper regions
4. **Smart Model Routing**: Use cheaper models for 80% of tasks
5. **Batch Operations**: Group DB writes, aggregate usage events

---

## Launch Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Database schema pushed and verified
- [ ] Stripe products and prices created
- [ ] GitHub App created and installed
- [ ] Frontend deployed to Vercel
- [ ] Broadcast deployed to PartyKit
- [ ] CLI published to npm
- [ ] Docs site deployed
- [ ] Custom domains configured
- [ ] SSL certificates verified
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (PostHog) configured
- [ ] Monitoring alerts configured

### Launch Day
- [ ] Announce on social media (Twitter, LinkedIn, Reddit)
- [ ] Submit to Product Hunt
- [ ] Post in relevant communities (Hacker News, dev.to)
- [ ] Email waitlist (if applicable)
- [ ] Monitor error rates and performance
- [ ] Watch Slack/Discord for user feedback
- [ ] Track initial signups and conversions

### Post-Launch
- [ ] Collect user feedback
- [ ] Monitor credit burn rates
- [ ] Optimize pricing based on usage patterns
- [ ] Add new credit packs based on demand
- [ ] Implement referral program
- [ ] Add usage dashboards for users
- [ ] Build automated email campaigns
- [ ] Scale infrastructure as needed

---

## Profitability Model

### Unit Economics

**Average User**:
- Signup rate: 30% of visitors
- Free trial: 100 credits (costs ~$0.10)
- Conversion rate: 10% to paid
- Average first purchase: $25 (3,000 credits)
- Monthly recurring: 30% subscribe ($39/mo avg)
- Lifetime value (LTV): $150-300 (6-12 months)
- Customer Acquisition Cost (CAC): $30-60 (paid ads, content, referrals)
- **LTV/CAC Ratio: 3-5x** (healthy SaaS metric)

**Revenue per 1K Users**:
- 1,000 signups
- 300 activate (free trial)
- 30 convert to paid
- Revenue: (20 × $25) + (10 × $39/mo) = $500 + $390 = **$890 MRR**
- Costs: ~$200 infrastructure + ~$50 AI/sandbox = **$250 total**
- **Net profit: $640/mo per 1K users (72% margin)**

### Break-even Analysis

**Monthly Fixed Costs**:
- Infrastructure: $200-400
- Tools (Sentry, PostHog, etc.): $50-100
- Support/ops: $500-1000 (part-time)
- **Total: $750-1500/mo**

**Break-even**: ~$1500 MRR = **~30 paid users**

**Profitability Target**: $10K MRR
- ~200 paid users
- ~2,000 signups/month (10% conversion)
- ~10K website visitors (20% signup)
- Infrastructure costs: ~$1500/mo
- Gross profit: ~$7K/mo
- **Net profit: ~$5K/mo after ops**

---

## Next Steps

1. **Deploy to Staging**:
   - Create `staging.roverlabs.com`
   - Test full flow: signup → purchase credits → run tasks
   - Verify webhooks, emails, billing

2. **Beta Testing**:
   - Invite 20-50 beta users
   - Offer free credits ($25 value)
   - Collect feedback on pricing, UX, bugs
   - Iterate based on feedback

3. **Launch**:
   - Public announcement
   - Remove waitlist (if applicable)
   - Open signups
   - Monitor closely for first 48 hours

4. **Scale**:
   - Optimize based on real usage data
   - Add new features (team accounts, enterprise)
   - Expand marketing (content, ads, partnerships)
   - Hire support team as needed

---

## Support & Resources

- **Documentation**: docs.roverlabs.com
- **Status Page**: status.roverlabs.com (optional)
- **Support Email**: support@roverlabs.com
- **GitHub**: github.com/rover-labs/rover
- **Discord/Slack**: Community for users and developers

---

## Appendix: Stripe Product Setup

### Credit Packs (One-time payments)

```bash
# Starter Pack
stripe products create \
  --name="Starter Pack" \
  --description="1,000 credits for Rover tasks"

stripe prices create \
  --product="REPLACE_WITH_YOUR_PRODUCT_ID" \
  --unit-amount=1000 \
  --currency=usd \
  --tax-behavior=exclusive

# Developer Pack
stripe products create \
  --name="Developer Pack" \
  --description="3,000 credits for Rover tasks (17% bonus)"

stripe prices create \
  --product="REPLACE_WITH_YOUR_PRODUCT_ID" \
  --unit-amount=2500 \
  --currency=usd \
  --tax-behavior=exclusive

# Pro Pack
stripe products create \
  --name="Pro Pack" \
  --description="7,500 credits for Rover tasks (33% bonus)"

stripe prices create \
  --product="REPLACE_WITH_YOUR_PRODUCT_ID" \
  --unit-amount=5000 \
  --currency=usd \
  --tax-behavior=exclusive

# Team Pack
stripe products create \
  --name="Team Pack" \
  --description="18,000 credits for Rover tasks (44% bonus)"

stripe prices create \
  --product="REPLACE_WITH_YOUR_PRODUCT_ID" \
  --unit-amount=10000 \
  --currency=usd \
  --tax-behavior=exclusive
```

### Monthly Plans (Recurring subscriptions)

```bash
# Hobby Plan
stripe products create \
  --name="Hobby Plan" \
  --description="1,500 credits/month with rollover"

stripe prices create \
  --product="REPLACE_WITH_YOUR_PRODUCT_ID" \
  --unit-amount=1500 \
  --currency=usd \
  --recurring[interval]=month \
  --tax-behavior=exclusive

# Developer Plan
stripe products create \
  --name="Developer Plan" \
  --description="5,000 credits/month with rollover"

stripe prices create \
  --product="REPLACE_WITH_YOUR_PRODUCT_ID" \
  --unit-amount=3900 \
  --currency=usd \
  --recurring[interval]=month \
  --tax-behavior=exclusive

# Pro Plan
stripe products create \
  --name="Pro Plan" \
  --description="15,000 credits/month with rollover and priority support"

stripe prices create \
  --product="REPLACE_WITH_YOUR_PRODUCT_ID" \
  --unit-amount=9900 \
  --currency=usd \
  --recurring[interval]=month \
  --tax-behavior=exclusive
```

---

**End of Production Deployment Guide**

For questions or issues, please refer to the documentation or reach out to the team.
