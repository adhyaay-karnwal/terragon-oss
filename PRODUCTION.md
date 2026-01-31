# Rover Production Deployment Guide

## Overview

This guide covers deploying Rover to production with optimized costs and profit-focused pricing.

## Credit-Based Pricing Strategy

### Subscription Plans

Rover uses a hybrid model:
- **Monthly subscriptions** that include monthly credits
- **One-time credit packs** for additional usage

Current subscription tiers:
- **Core Plan**: $25/month - 3 concurrent tasks, 5 automations
- **Pro Plan**: $50/month - 10 concurrent tasks, unlimited automations
- **Enterprise**: Custom pricing for teams

### Credit Packs

Configure `STRIPE_PRICE_CREDIT_PACK` in production environment for one-time credit purchases.

Suggested credit pack pricing:
- **Starter Pack**: $10 for $12 worth of usage (20% bonus)
- **Standard Pack**: $25 for $32 worth of usage (28% bonus)
- **Pro Pack**: $50 for $70 worth of usage (40% bonus)
- **Enterprise Pack**: $100 for $150 worth of usage (50% bonus)

### Pricing Model Details

The platform uses a **markup model** where:
1. Upstream API costs (OpenAI, Anthropic, etc.) are tracked in `packages/shared/src/model/usage-pricing.ts`
2. Apply a **35-50% markup** on wholesale costs to ensure profitability
3. Credits are charged based on token usage at retail rates
4. Users never see per-token pricing - they only see credit depletion

**Example calculation:**
- Claude Sonnet costs $3/1M input tokens (wholesale)
- Charge users $4.50/1M input tokens (50% markup)  
- User task uses 100K tokens = $0.45 deducted from credits
- Gross margin: $0.15 per 100K tokens

### Cost Optimization

#### Sandbox Costs

1. **E2B Sandboxes** (Primary provider):
   - Use 2CPU/4GB instances by default ($0.15/hr)
   - Hibernate sandboxes after 5 minutes of inactivity
   - Set up E2B billing alerts at $500/month
   - Monitor sandbox utilization in admin dashboard

2. **Daytona Sandboxes** (Alternative provider):
   - Enable with `DAYTONA_API_KEY` environment variable
   - Behind feature flag `daytonaSandboxProvider`
   - Similar pricing to E2B

3. **Cost Targets**:
   - Sandbox costs: <10% of revenue
   - AI API costs: 40-50% of credit revenue
   - Target 40%+ gross margin

#### Server Costs

- **Database**: Use managed PostgreSQL (Neon, Supabase, or RDS)
  - Start with smallest tier ($20-30/month)
  - Scale up as needed
- **Redis**: Use Upstash for rate limiting and caching
  - Free tier sufficient for <10K users
  - Pay-as-you-go scales automatically
- **Storage**: Cloudflare R2 for file uploads
  - $0.015/GB/month storage
  - $0/GB egress (free)
- **Hosting**: Vercel Pro ($20/month) or comparable

**Total fixed monthly costs**: ~$100-200 (breakeven at 8-10 paying users)

## Deployment Architecture

### Required Services

1. **Frontend & API** (apps/www)
   - Deploy to Vercel
   - Set up environment variables (see `.env.example`)
   - Configure Stripe webhooks
   - Set up GitHub App for OAuth and repo access

2. **Broadcast Service** (apps/broadcast)
   - Deploy to PartyKit
   - Configure `NEXT_PUBLIC_BROADCAST_URL`

3. **CLI** (apps/cli)
   - Publish to npm: `npm publish @rover-labs/cli`
   - Users install via: `npm install -g @rover-labs/cli`

4. **Documentation** (apps/docs)
   - Deploy to Vercel or similar
   - Configure `NEXT_PUBLIC_DOCS_URL`

### Environment Configuration

#### Critical Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Redis (Upstash)
REDIS_URL=redis://...
REDIS_HTTP_URL=https://...
REDIS_HTTP_TOKEN=...

# Authentication
BETTER_AUTH_SECRET=<generate-with-openssl-rand-hex-32>
BETTER_AUTH_URL=https://yourdomain.com
ENCRYPTION_MASTER_KEY=<generate-with-openssl-rand-hex-32>
INTERNAL_SHARED_SECRET=<generate-with-openssl-rand-hex-32>

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=... # Optional
DAYTONA_API_KEY=... # Optional

# Sandboxes
E2B_API_KEY=...

# Storage (Cloudflare R2)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ACCOUNT_ID=...
R2_BUCKET_NAME=rover-uploads
R2_PRIVATE_BUCKET_NAME=rover-private
R2_PUBLIC_URL=https://cdn.yourdomain.com

# GitHub
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_WEBHOOK_SECRET=...
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
NEXT_PUBLIC_GITHUB_APP_NAME=rover-bot

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CORE_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_CREDIT_PACK=price_...

# Email (Resend)
RESEND_API_KEY=re_...

# Broadcast
NEXT_PUBLIC_BROADCAST_HOST=rover-broadcast.yourusername.partykit.dev
NEXT_PUBLIC_BROADCAST_URL=https://rover-broadcast.yourusername.partykit.dev

# Docs
NEXT_PUBLIC_DOCS_URL=https://docs.yourdomain.com

# Optional: Slack integration
SLACK_FEEDBACK_WEBHOOK_URL=...
```

#### Generate Secrets

```bash
# Generate random secrets
openssl rand -hex 32  # BETTER_AUTH_SECRET
openssl rand -hex 32  # ENCRYPTION_MASTER_KEY
openssl rand -hex 32  # INTERNAL_SHARED_SECRET
openssl rand -hex 32  # GITHUB_WEBHOOK_SECRET
```

### Stripe Setup

1. **Create Products in Stripe**:
   - Core Monthly Subscription ($25/month)
   - Pro Monthly Subscription ($50/month)
   - Credit Pack (one-time purchase, configurable amount)

2. **Set up Webhooks**:
   - Add webhook endpoint: `https://yourdomain.com/api/auth/stripe/webhook`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `checkout.session.completed`

3. **Configure Pricing**:
   - Update `STRIPE_PRICE_CORE_MONTHLY`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_CREDIT_PACK` with Stripe price IDs

### Database Setup

1. **Create PostgreSQL database** (v16+)
2. **Set DATABASE_URL** environment variable
3. **Push schema**: 
   ```bash
   pnpm -C packages/shared drizzle-kit-push
   ```
4. **Optional**: Set up database backups

### Monitoring & Analytics

1. **PostHog** (built-in):
   - Analytics and feature flags
   - Configure in production settings

2. **Error Tracking**:
   - Consider adding Sentry or similar
   - Monitor sandbox failures

3. **Cost Monitoring**:
   - Track sandbox usage in admin dashboard (`/admin`)
   - Set up billing alerts for E2B and cloud providers
   - Monitor credit balance vs. revenue ratio

### Security Checklist

- [ ] All secrets generated and configured
- [ ] GitHub App configured with proper permissions
- [ ] Stripe webhook secrets configured
- [ ] Rate limiting enabled (via Upstash Redis)
- [ ] Database SSL enabled
- [ ] CORS properly configured
- [ ] API keys encrypted at rest (using ENCRYPTION_MASTER_KEY)
- [ ] Sandbox isolation verified

## Scaling Considerations

### User Growth Stages

**0-100 users** (Startup)
- Use smallest database tier
- Single region deployment
- Manual monitoring

**100-1,000 users** (Growth)
- Scale database to medium tier
- Add read replicas if needed
- Set up automated alerts
- Consider multi-region if international

**1,000+ users** (Scale)
- Database connection pooling
- CDN for static assets
- Multiple Redis instances
- Dedicated support infrastructure

### Performance Optimization

1. **Caching**:
   - Thread data cached in Redis
   - Subscription info cached per request
   - Usage aggregates cached with `usageEventsAggCacheSku` table

2. **Database**:
   - Indexes on critical queries (already in schema)
   - Regular VACUUM ANALYZE
   - Monitor slow queries

3. **Sandboxes**:
   - Hibernate after 5 minutes idle
   - Reuse sandboxes when possible
   - Terminate stale sandboxes (>24 hours)

## Profit Calculations

### Target Metrics

- **Monthly Recurring Revenue (MRR)**: Subscription revenue
- **Credit Revenue**: One-time credit pack purchases
- **Gross Margin**: 40-50%
- **Churn Rate**: <5% monthly
- **LTV:CAC Ratio**: 3:1 minimum

### Example P&L (100 users)

**Revenue**:
- 60 Core users × $25 = $1,500
- 30 Pro users × $50 = $1,500
- Credit pack purchases = $500
- **Total**: $3,500/month

**Costs**:
- Server infrastructure: $200
- Sandbox costs (E2B): $350 (10% of revenue)
- AI API costs: $1,400 (40% of revenue)
- **Total**: $1,950/month

**Gross Profit**: $1,550/month (44% margin)

### Pricing Adjustment Strategy

Monitor these ratios monthly:
- If AI costs > 50% of credit revenue → increase markup
- If sandbox costs > 15% → optimize hibernation
- If gross margin < 35% → increase subscription prices or reduce trial periods

## Support & Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check sandbox costs
- Review user feedback

**Weekly**:
- Review credit burn rates
- Check payment failures
- Monitor API usage limits

**Monthly**:
- Analyze profit margins
- Review and optimize costs
- Update AI model pricing if upstream changes
- Database maintenance (VACUUM, ANALYZE)

### Admin Dashboard

Access at `/admin` (requires admin role):
- View active sandboxes
- User management
- Credit grants
- Feature flag configuration
- Usage analytics

## Troubleshooting

### Common Issues

**High sandbox costs**:
- Check hibernation settings
- Look for stuck sandboxes
- Review concurrent task limits

**Low gross margins**:
- Increase credit pack prices
- Add subscription markups
- Optimize AI model selection

**Payment failures**:
- Check Stripe webhook configuration
- Verify webhook secret
- Review Stripe dashboard for issues

## CLI Deployment

### Publishing to npm

1. **Update version** in `apps/cli/package.json`
2. **Build**: `pnpm -C apps/cli build`
3. **Test locally**: `pnpm -C apps/cli install:dev`
4. **Publish**: `pnpm -C apps/cli release`

### User Installation

```bash
npm install -g @rover-labs/cli
terry auth
terry create "Your first task"
```

## Launch Checklist

- [ ] All environment variables configured
- [ ] Database schema pushed
- [ ] Stripe products created and configured
- [ ] GitHub App created and configured
- [ ] Sandbox provider (E2B) account set up
- [ ] Frontend deployed to Vercel
- [ ] Broadcast service deployed to PartyKit
- [ ] Documentation site deployed
- [ ] CLI published to npm
- [ ] Domain DNS configured
- [ ] SSL certificates active
- [ ] Monitoring and alerts configured
- [ ] Credit pricing tested end-to-end
- [ ] Subscription flow tested
- [ ] Admin dashboard accessible
- [ ] Backup strategy in place

## Post-Launch

### Week 1
- Monitor error rates
- Track signup conversion
- Verify payment processing
- Check sandbox costs

### Month 1
- Calculate actual gross margins
- Adjust pricing if needed
- Gather user feedback
- Optimize performance bottlenecks

### Ongoing
- Keep AI model pricing up to date
- Monitor competitive landscape
- Regular security audits
- Feature development based on feedback
