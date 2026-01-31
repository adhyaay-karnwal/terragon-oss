# Rover Rebrand Summary

## Completed Changes

### 1. Brand Identity
- **Old Name**: Terragon
- **New Name**: Rover
- **Theme**: Mars-inspired coding agent
- **Color Scheme**: Red-orange accent colors (Mars soil theme)

### 2. Color Theme Updates

Updated `apps/www/src/app/globals.css` with Mars-inspired colors:

#### Light Mode
- Primary: `#c1440e` (Mars red-orange)
- Secondary: `#fbe9e7` (light Mars tint)
- Accent: `#ffccbc` (pale Mars orange)
- Ring/Focus: `#c1440e`
- Chart colors: Mars red-orange spectrum

#### Dark Mode
- Primary: `#ff7043` (bright Mars orange)
- Secondary: `#333333` with Mars-tinted foreground
- Accent: `#c1440e` (deep Mars red)
- Ring/Focus: `#ff7043`
- Chart colors: Bright Mars spectrum

**Note**: All other colors (background, foreground, muted, destructive, borders) remain unchanged for consistency.

### 3. Package Rebranding

All packages renamed from `@terragon/*` to `@rover/*`:

- `@rover/www` - Main Next.js frontend
- `@rover/shared` - Database models, schemas, utilities
- `@rover/daemon` - Sandbox agent runtime
- `@rover/bundled` - Bundled deployment scripts
- `@rover/env` - Environment configuration
- `@rover/r2` - Cloudflare R2 storage
- `@rover/dev-env` - Docker development environment
- `@rover/tsconfig` - Shared TypeScript config
- `@rover/sandbox` - Sandbox abstraction layer
- `@rover/sandbox-image` - Sandbox image creation
- `@rover/agent` - AI agent definitions
- `@rover/cli-api-contract` - CLI API contract
- `@rover/transactional` - Email templates
- `@rover/mcp-server` - MCP server for follow-ups
- `@rover/debug-scripts` - Debugging utilities
- `@rover/types` - Shared TypeScript types
- `@rover/utils` - Shared utilities

### 4. CLI Tool

**Name**: Terry CLI (intentionally kept as "terry" - this is the CLI tool name for Rover)
- Binary: `terry`
- Package: `@rover-labs/cli`
- Description: "Terry CLI - Rover Labs coding assistant"

This follows the pattern of having a distinct CLI tool name (like how GitHub has "gh" CLI).

### 5. Text Updates

All references updated across:
- Source code (`.ts`, `.tsx`, `.js`, `.jsx`)
- Documentation (`.md`, `.mdx`)
- Configuration files (`.json`, `.yml`, `.yaml`, `.toml`)
- Scripts (`.sh`)
- Docker configurations
- Environment examples

### 6. URLs and Domains

Current URLs (already in codebase):
- Main site: `roverlabs.com`
- Documentation: `docs.roverlabs.com`
- CDN: `cdn.roverlabs.com`
- npm package: `@rover-labs/cli`

## Production-Ready Features

### Credit-Based Payment System ✅

The app has a fully implemented credit/usage-based payment system:

1. **Subscription Plans**:
   - Core: $25/month (3 concurrent tasks, 5 automations)
   - Pro: $50/month (10 concurrent tasks, unlimited automations)
   - Enterprise: Custom pricing

2. **Credit Packs**:
   - One-time purchases for additional usage
   - Configurable via `STRIPE_PRICE_CREDIT_PACK`

3. **Usage Tracking**:
   - Token-level tracking for all AI providers
   - Real-time credit deduction
   - Aggregated usage caching for performance

4. **Pricing Model**:
   - Wholesale costs tracked in `packages/shared/src/model/usage-pricing.ts`
   - Apply 35-50% markup for profitability
   - Users see credit depletion, not per-token pricing

### Cost Optimization ✅

1. **Sandbox Costs**:
   - E2B sandboxes hibernate after 5 minutes idle
   - Daytona support available as alternative
   - Target: <10% of revenue

2. **AI API Costs**:
   - Multiple providers (Anthropic, OpenAI, Google, OpenRouter)
   - Real-time usage tracking
   - Target: 40-50% of credit revenue

3. **Infrastructure**:
   - Managed PostgreSQL: $20-30/month (start small)
   - Upstash Redis: Free tier → pay-as-you-go
   - Cloudflare R2: ~$0.015/GB/month (free egress)
   - Vercel Pro: $20/month

**Estimated fixed costs**: $100-200/month
**Break-even**: 8-10 paying users

### Profitability Model ✅

Example with 100 users:
- **Revenue**: $3,500/month (60 Core + 30 Pro + credit packs)
- **Costs**: $1,950/month (infrastructure + sandboxes + AI APIs)
- **Gross Profit**: $1,550/month (44% margin)

**Target metrics**:
- Gross margin: 40-50%
- Sandbox costs: <10% of revenue
- AI costs: 40-50% of revenue
- Churn rate: <5%/month

## Deployment Checklist

See `PRODUCTION.md` for detailed deployment guide.

### Quick Start

1. **Set up environment variables** (see `.env.example` files)
2. **Create Stripe products**:
   - Core monthly subscription
   - Pro monthly subscription
   - Credit pack (one-time)
3. **Deploy services**:
   - Frontend: Vercel
   - Broadcast: PartyKit
   - CLI: npm
   - Docs: Vercel
4. **Configure integrations**:
   - GitHub App
   - Stripe webhooks
   - E2B account
5. **Push database schema**:
   ```bash
   pnpm -C packages/shared drizzle-kit-push
   ```
6. **Test payment flow** end-to-end

### Critical Environment Variables

```bash
# Database & Redis
DATABASE_URL=...
REDIS_URL=...

# Auth & Secrets
BETTER_AUTH_SECRET=...
ENCRYPTION_MASTER_KEY=...
INTERNAL_SHARED_SECRET=...

# AI Providers
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...

# Sandboxes
E2B_API_KEY=...

# Storage
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...

# GitHub
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_PRICE_CORE_MONTHLY=...
STRIPE_PRICE_PRO_MONTHLY=...
STRIPE_PRICE_CREDIT_PACK=...
```

## Testing Before Production

1. **Test subscription flow**:
   - Sign up with test card
   - Verify credit grant
   - Create task and verify credit deduction

2. **Test credit packs**:
   - Purchase credit pack
   - Verify credit addition
   - Test usage deduction

3. **Test sandboxes**:
   - Create task
   - Verify sandbox creation
   - Verify hibernation after 5 minutes
   - Check costs in E2B dashboard

4. **Test integrations**:
   - GitHub OAuth
   - GitHub App permissions
   - PR creation
   - Stripe webhooks

## Next Steps for Production

1. **Finalize pricing strategy**:
   - Review AI provider costs
   - Set markup percentages
   - Configure credit pack amounts

2. **Set up monitoring**:
   - PostHog analytics
   - Error tracking (optional: Sentry)
   - Cost alerts (E2B, Stripe)

3. **Create admin account**:
   - Set up first user as admin
   - Test admin dashboard at `/admin`

4. **Launch marketing**:
   - Update landing page
   - Prepare documentation
   - Set up support channels

5. **Ongoing optimization**:
   - Monitor gross margins weekly
   - Adjust pricing based on actual costs
   - Optimize sandbox hibernation
   - Track user feedback

## Files Modified

- `apps/www/src/app/globals.css` - Color theme
- `package.json` (root and all packages) - Package names
- All TypeScript/JavaScript files - Import statements
- All documentation files - Brand references
- All configuration files - Package references
- Docker configurations - Container names

## Files Created

- `PRODUCTION.md` - Complete production deployment guide
- `REBRAND_SUMMARY.md` - This file

## CLI Tool Note

The CLI tool is intentionally named "Terry" (`terry` command) as the developer tool for Rover. This is a deliberate branding choice, similar to:
- GitHub → `gh` CLI
- Heroku → `heroku` CLI
- Stripe → `stripe` CLI

Users interact with Rover through the Terry CLI.

## Additional Resources

- **Production Guide**: See `PRODUCTION.md` for complete deployment instructions
- **Development Guide**: See `AGENTS.md` for development setup
- **Documentation**: Deploy `apps/docs` for user-facing documentation
- **Admin Dashboard**: Access `/admin` after deployment for system management

## Support

For questions about deployment or rebranding:
1. Check `PRODUCTION.md` for deployment details
2. Review `.env.example` files for environment setup
3. Test locally before production deployment
4. Monitor costs closely in first month
