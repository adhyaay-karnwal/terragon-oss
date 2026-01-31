# Migration Guide: Terragon → Rover

## Overview

This guide helps existing Terragon installations migrate to Rover. The rebrand includes backwards compatibility to ensure a smooth transition with zero downtime.

## Who Needs This Guide?

- Existing Terragon installations
- Users with active Stripe subscriptions/credit packs
- Teams with existing environment configurations
- Anyone with the old CLI installed

## What Changed?

### Brand & Naming
- **Product name**: Terragon → Rover
- **Company**: Terragon Labs → Rover Labs
- **Package names**: `@terragon/*` → `@rover/*`
- **CLI package**: `@terragon-labs/cli` → `@rover-labs/cli`
- **URLs**: terragonlabs.com → roverlabs.com

### Visual Design
- **Color theme**: Green accent → Mars red-orange accent
- **Primary color**: #2e7d32 → #c1440e (light mode)
- **Primary color**: #4caf50 → #ff7043 (dark mode)

### Technical Changes
- **Stripe metadata**: Uses `rover_user_id` (but still reads `terragon_user_id`)
- **Internal headers**: `X-Terragon-Secret` → `X-Rover-Secret`
- **Environment variables**: Supports both `ROVER_WEB_URL` and `TERRAGON_WEB_URL`

## Migration Paths

### For End Users

**No action required!** Your account, data, and credits will continue to work seamlessly.

- ✅ Existing subscriptions remain active
- ✅ Credit balances carry over
- ✅ GitHub integrations continue working
- ✅ Slack integrations continue working
- ✅ All tasks and history preserved

**Optional**: Update CLI for best experience:
```bash
npm uninstall -g @terragon-labs/cli
npm install -g @rover-labs/cli
```

### For Self-Hosted Installations

#### Phase 1: Update Code (Required)

1. **Pull latest code**:
```bash
git pull origin main
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Update environment variables** (optional but recommended):
```bash
# In your .env files, you can optionally rename:
# TERRAGON_WEB_URL → ROVER_WEB_URL
# (but old name still works)
```

#### Phase 2: Update Infrastructure (Recommended)

1. **Update internal secret header** (if you control both frontend and broadcast):
```bash
# No change needed - uses INTERNAL_SHARED_SECRET which stays the same
# Header changed from X-Terragon-Secret to X-Rover-Secret automatically
```

2. **Restart services**:
```bash
# Frontend
vercel --prod

# Broadcast
cd apps/broadcast && npx partykit deploy
```

#### Phase 3: Migrate Stripe (Automatic)

**No manual action required!**

The system automatically handles both:
- ✅ New Stripe objects: Created with `rover_user_id`
- ✅ Old Stripe objects: Read `terragon_user_id` as fallback

**For long-term cleanup** (optional, after 6-12 months):

You can update existing Stripe metadata if desired:
```bash
# This is optional - the system works with both keys
stripe update invoice inv_xxx --metadata rover_user_id=<user_id>
```

### For CI/CD Pipelines

#### Environment Variables

Update any deployment scripts that reference:
```bash
# Old (still works)
TERRAGON_WEB_URL=https://yourdomain.com

# New (recommended)
ROVER_WEB_URL=https://yourdomain.com
```

#### Docker Containers

If you have automation that references container names:
```bash
# Old names
terragon_postgres_dev
terragon_redis_dev

# New names
rover_postgres_dev
rover_redis_dev
```

Update your scripts:
```bash
# Before
docker exec -it terragon_postgres_dev psql -U postgres

# After
docker exec -it rover_postgres_dev psql -U postgres
```

### For CLI Users

#### Update Terry CLI

1. **Uninstall old version**:
```bash
npm uninstall -g @terragon-labs/cli
```

2. **Install new version**:
```bash
npm install -g @rover-labs/cli
```

3. **Re-authenticate** (config location stays the same):
```bash
terry auth
```

**Note**: Your auth config at `~/.terry/config.json` is preserved.

#### Environment Variables (Development)

If you set `TERRAGON_WEB_URL` for development:
```bash
# Old (still works)
export TERRAGON_WEB_URL=http://localhost:3000

# New (recommended)
export ROVER_WEB_URL=http://localhost:3000
```

### For Package Consumers

If you have external projects importing Terragon packages:

1. **Update package.json**:
```json
{
  "dependencies": {
    "@terragon/shared": "workspace:*"
  }
}
```

→ becomes:

```json
{
  "dependencies": {
    "@rover/shared": "workspace:*"
  }
}
```

2. **Update imports**:
```typescript
// Old
import { getUser } from "@terragon/shared/model/user";

// New
import { getUser } from "@rover/shared/model/user";
```

3. **Run installation**:
```bash
pnpm install
```

## Backwards Compatibility

### What Still Works?

✅ **Stripe Webhooks**: Both `terragon_user_id` and `rover_user_id` metadata keys  
✅ **Environment Variables**: `TERRAGON_WEB_URL` falls back if `ROVER_WEB_URL` not set  
✅ **User Data**: All existing data remains accessible  
✅ **Subscriptions**: Active subscriptions continue uninterrupted  
✅ **Credit Balances**: All credits preserved  
✅ **GitHub Integrations**: No re-authorization needed  
✅ **Slack Integrations**: Continue working  

### What Changed Immediately?

❌ **Package Names**: Must update imports to `@rover/*`  
❌ **Internal Headers**: Now uses `X-Rover-Secret` (automatic)  
❌ **Docker Container Names**: Now prefixed with `rover_`  
❌ **New Stripe Objects**: Created with `rover_user_id`  

### Deprecation Timeline

**Now → 6 months**: Both old and new systems work side-by-side

**6-12 months**: Optional cleanup period
- Consider removing `terragon_user_id` fallback support
- Update any remaining internal variable names
- Remove legacy environment variable support

**12+ months**: Legacy support can be safely removed

## Testing Your Migration

### Checklist

Run through this checklist after updating:

#### Frontend
- [ ] Site loads correctly
- [ ] Can sign in with existing account
- [ ] Can create new task
- [ ] Can view existing tasks
- [ ] Mars color theme is visible
- [ ] All integrations work (GitHub, Slack)

#### Payments
- [ ] Can view credit balance
- [ ] Can purchase credit pack (test mode)
- [ ] Credits are granted successfully
- [ ] Stripe webhooks process correctly
- [ ] Auto-reload works (if enabled)

#### CLI
- [ ] `terry auth` works
- [ ] `terry create` creates tasks
- [ ] `terry pull` pulls task data
- [ ] `terry list` shows tasks

#### Integration
- [ ] GitHub OAuth login works
- [ ] GitHub App can access repos
- [ ] Can create PRs
- [ ] Slack notifications work (if configured)

#### Data Integrity
- [ ] All old tasks still accessible
- [ ] Credit history preserved
- [ ] Environment configs intact
- [ ] Automation rules still active

## Rollback Plan

If you encounter issues, you can temporarily rollback:

### Code Rollback
```bash
# Revert to previous commit
git log --oneline  # Find commit before rebrand
git revert <commit-hash>

# Or hard reset (if no new data)
git reset --hard <commit-hash>
```

### Environment Rollback
```bash
# Restore old environment variables if you changed them
TERRAGON_WEB_URL=<your-domain>
```

**Note**: Data and Stripe objects are compatible both ways, so rollback is safe.

## Common Issues & Solutions

### Issue: CLI auth fails

**Solution**:
```bash
# Make sure you have the latest version
npm install -g @rover-labs/cli

# Clear old auth and re-authenticate
rm -rf ~/.terry
terry auth
```

### Issue: Stripe webhooks not working

**Check**:
1. Webhook endpoint URL is correct: `https://yourdomain.com/api/auth/stripe/webhook`
2. Webhook secret is set: `STRIPE_WEBHOOK_SECRET`
3. Check webhook logs in Stripe dashboard
4. Verify both `terragon_user_id` and `rover_user_id` keys exist in event metadata

**Fix**:
```typescript
// In stripe-credit-top-ups.ts
// Should already have this line:
const userId = metadata.rover_user_id ?? metadata.terragon_user_id;
```

### Issue: Docker containers not found

**Solution**:
```bash
# Stop old containers
docker-compose down

# Update container names in scripts
# Change terragon_* to rover_*

# Start new containers
docker-compose up -d
```

### Issue: Imports not resolving

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# If using pnpm, ensure workspace resolution works
pnpm install --frozen-lockfile
```

### Issue: Package not found errors

**Solution**:
```bash
# Update all @terragon/* imports to @rover/*
# Use find/replace:
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -exec sed -i 's/@terragon\//@rover\//g' {} \;

# Then reinstall
pnpm install
```

## Support During Migration

### Getting Help

1. **Check documentation**:
   - `PRODUCTION.md` - Deployment guide
   - `REBRANDING_VERIFICATION.md` - Technical details
   - `DEPLOYMENT_READY.md` - Quick start

2. **Check logs**:
   ```bash
   # Frontend logs (Vercel)
   vercel logs

   # Broadcast logs (PartyKit)
   # Check PartyKit dashboard

   # Local logs
   docker-compose logs
   ```

3. **Verify environment**:
   ```bash
   # Check all required variables are set
   env | grep -E "(STRIPE|GITHUB|DATABASE|REDIS)"
   ```

### Reporting Issues

If you encounter migration issues:

1. **Check backwards compatibility**: Verify the feature should work (see above)
2. **Test in isolation**: Try to reproduce with minimal setup
3. **Check logs**: Look for specific error messages
4. **Document**: Note exact steps to reproduce

## Post-Migration Checklist

After successful migration:

- [ ] All services running smoothly
- [ ] Payments processing correctly
- [ ] No error spikes in logs
- [ ] Users can access their accounts
- [ ] CLI working for developers
- [ ] Integrations functioning
- [ ] Monitoring dashboards updated
- [ ] Team notified of changes
- [ ] Documentation updated

## Summary

The migration from Terragon to Rover is designed to be **seamless and backwards compatible**. Most users will experience no disruption, and existing installations can update with minimal changes.

**Key Points**:
- ✅ Zero downtime migration possible
- ✅ Existing data preserved
- ✅ Payments continue uninterrupted
- ✅ Backwards compatibility for legacy systems
- ✅ Gradual migration path available

**Timeline**: Most migrations can be completed in 1-2 hours with proper preparation.

---

**Questions?** Refer to the main documentation files:
- `PRODUCTION.md` - Deployment guide
- `REBRANDING_VERIFICATION.md` - Technical verification
- `DEPLOYMENT_READY.md` - Launch guide
