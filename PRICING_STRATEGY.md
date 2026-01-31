# Rover Pricing Strategy - Optimized for Profitability

## Overview

This document outlines the pricing strategy for Rover to ensure instant profitability from user credit usage while appearing as a great deal to customers.

## Core Pricing Philosophy

**The Credit Illusion**: Users buy credits but don't see per-token costs. This allows us to:
1. Apply healthy markups on wholesale AI costs
2. Appear to offer a "great deal" vs. direct API usage
3. Smooth out cost fluctuations from AI providers
4. Bundle value (sandboxes + GitHub + orchestration) into credits

## Pricing Tiers

### Subscription Plans (Monthly Recurring)

#### Core Plan - $25/month
**Target Customer**: Individual developers, freelancers

**Included**:
- $30 in usage credits (20% bonus value)
- 3 concurrent tasks
- 5 automations
- 2 CPU / 4GB RAM sandboxes
- GitHub + Slack integration
- BYO API keys option

**Economics**:
- Credit value markup: 20% discount to retail
- Expected monthly usage: $15-25
- Gross margin target: 40%
- Breakeven: ~15 tasks/month

#### Pro Plan - $50/month
**Target Customer**: Power users, small teams

**Included**:
- $75 in usage credits (50% bonus value)
- 10 concurrent tasks
- Unlimited automations
- 2 CPU / 4GB RAM sandboxes (4 CPU / 8GB coming soon)
- GitHub + Slack integration
- BYO API keys option
- Priority support

**Economics**:
- Credit value markup: 50% discount to retail
- Expected monthly usage: $30-50
- Gross margin target: 35-40%
- Breakeven: ~40 tasks/month

**Why Pro is "Recommended"**:
- Best credit bonus (50% vs 20%)
- Unlimited automations (high perceived value, low actual cost)
- Room for power users to grow
- Highest LTV potential

#### Enterprise Plan - Custom
**Target Customer**: Teams, agencies

**Included**:
- Custom credit allocation
- BYO sandboxes (lower our costs)
- Team features
- Custom integrations
- Dedicated support

**Economics**:
- Negotiated based on volume
- Lower margins but higher absolute revenue
- Offload infrastructure costs to customer

### Credit Packs (One-Time Purchase)

#### Starter Pack - $10
- $12 worth of usage credits (20% bonus)
- ~8-15 small tasks
- Good for trying the platform

#### Standard Pack - $25
- $32 worth of usage credits (28% bonus)
- ~20-30 small tasks
- Most popular for occasional users

#### Pro Pack - $50
- $70 worth of usage credits (40% bonus)
- ~45-60 small tasks
- Best value for burst usage

#### Enterprise Pack - $100
- $150 worth of usage credits (50% bonus)
- ~100+ tasks
- For heavy users between subscription cycles

**Psychology**: Higher credit packs have better bonuses, encouraging larger purchases.

## Usage Pricing (Internal - Not Shown to Users)

### Current Markup Strategy

**Base Strategy**: Apply 35-50% markup on all AI provider costs

#### AI Model Pricing Examples

**Claude Sonnet 3.7**:
- Wholesale: $3/1M input tokens, $15/1M output tokens
- Retail (our price): $4.50/1M input, $22.50/1M output
- Markup: 50%

**GPT-5**:
- Wholesale: $1.25/1M input tokens, $10/1M output tokens
- Retail (our price): $1.88/1M input, $15/1M output
- Markup: 50%

**Haiku (budget model)**:
- Wholesale: $0.80/1M input tokens, $4/1M output tokens
- Retail (our price): $1.08/1M input, $5.40/1M output
- Markup: 35% (lower to encourage usage)

**Opus (premium model)**:
- Wholesale: $15/1M input tokens, $75/1M output tokens
- Retail (our price): $22.50/1M input, $112.50/1M output
- Markup: 50%

### Sandbox Costs

**E2B Sandboxes**:
- Wholesale: ~$0.15/hour (2 CPU / 4GB RAM)
- Hibernate after 5 minutes idle
- Average task duration: 15-30 minutes
- Average sandbox cost per task: $0.04-$0.08

**User Perception**: Sandboxes are "included" in credits, but we bill AI usage separately.

**Actual Billing**: Sandbox costs are ~5-10% of AI costs, so they're absorbed in our markup.

## Task Cost Examples

### Small Task (Bug Fix)
**Example**: "Fix the login validation error"

**Typical Usage**:
- Claude Sonnet
- ~50K input tokens (context, code reading)
- ~5K output tokens (code changes, explanations)

**Costs**:
- Wholesale: $0.23 ($0.15 input + $0.08 output)
- Sandbox: $0.05
- Total wholesale: $0.28

**User Charged** (50% markup):
- ~$0.42 in credits

**Gross Margin**: $0.14 (50%)

### Medium Task (Feature Implementation)
**Example**: "Add password reset functionality with email verification"

**Typical Usage**:
- Claude Sonnet
- ~200K input tokens
- ~25K output tokens

**Costs**:
- Wholesale: $0.98 ($0.60 input + $0.38 output)
- Sandbox: $0.08
- Total wholesale: $1.06

**User Charged** (50% markup):
- ~$1.59 in credits

**Gross Margin**: $0.53 (50%)

### Large Task (Refactoring)
**Example**: "Refactor authentication system to use JWT instead of sessions"

**Typical Usage**:
- Claude Opus (for complex reasoning)
- ~500K input tokens
- ~100K output tokens

**Costs**:
- Wholesale: $15.00 ($7.50 input + $7.50 output)
- Sandbox: $0.12
- Total wholesale: $15.12

**User Charged** (50% markup):
- ~$22.68 in credits

**Gross Margin**: $7.56 (50%)

## Credit Burn Rate Psychology

### Making Credits Feel Valuable (But Fast)

**Key Insight**: Users should feel credits are valuable, but they should use them quickly enough to need more.

**Target Metrics**:
- Core users: Burn through monthly credits in 2-3 weeks
- Pro users: Burn through monthly credits in 3-4 weeks
- Credit pack users: Return within 30-45 days

**Psychological Tricks**:
1. **Small Numbers**: Show credits in dollars, not arbitrary units
2. **Bonus Value**: Emphasize the "bonus" credits with subscriptions
3. **Usage Stats**: Show "You've saved X hours this month" not "You've used $Y"
4. **Depletion Notices**: Warn at 20%, 10%, and 5% remaining
5. **Auto-Reload**: Offer auto-reload at 10% remaining for convenience

## Cost Optimization Strategies

### 1. Encourage Efficient Model Usage

**Default Models by Task Type**:
- Small tasks (<100 lines changed): Haiku (cheapest)
- Medium tasks (100-500 lines): Sonnet (balanced)
- Large tasks (500+ lines): User choice (Opus/Sonnet)

**Gross Margin Impact**:
- Haiku tasks: 35% margin but lower absolute revenue
- Sonnet tasks: 50% margin, best balance
- Opus tasks: 50% margin, highest absolute revenue

**Strategy**: Default to Sonnet for best margin-revenue balance.

### 2. Sandbox Hibernation Optimization

**Current Settings**:
- Hibernate after 5 minutes idle
- Total task time: ~15-30 minutes average
- Active time: ~10-20 minutes
- Hibernation saves: ~50-70% of potential sandbox costs

**Target**: Keep sandbox costs <10% of AI costs

### 3. Caching and Context Management

**Prompt Caching** (Anthropic):
- Warehouse costs: 90% reduction on cached reads
- User savings: Pass through 50% of savings
- Our benefit: 40% savings retained

**Strategy**: Encourage caching-friendly workflows:
- Multiple tasks in same repo
- Iterative development
- Long-running sessions

## Competitive Analysis

### Direct API Usage (DIY)

**Claude Sonnet via Anthropic API**:
- Cost: $3/1M input, $15/1M output (wholesale)
- User setup: Manual sandbox setup, GitHub integration
- Effort: High (setup, maintenance, monitoring)

**Our Advantage**:
- All-in-one platform
- No setup required
- Sandboxes included
- GitHub automation included
- Worth the 35-50% premium

### Cursor / Replit Agent

**Cursor**:
- $20/month subscription + usage
- No sandboxes (uses local environment)
- No GitHub automation

**Replit Agent**:
- $25/month subscription
- Limited to Replit environment
- No external GitHub integration

**Our Advantage**:
- Cloud sandboxes (work from anywhere)
- Full GitHub automation
- Parallel tasks
- Mobile support

### GitHub Copilot Workspace

**GitHub Copilot**:
- $10/month (IDE only)
- $39/month (includes Copilot Workspace beta)

**Our Advantage**:
- More powerful agents (Claude Opus, GPT-5)
- True sandboxes (isolated environments)
- Parallel execution
- Mobile support

## Pricing Adjustments Schedule

### Monthly Review

**Check these metrics**:
1. Average credit burn rate
2. Gross margin by plan tier
3. Sandbox cost % of revenue
4. AI API cost % of revenue
5. Churn rate by plan

### Quarterly Adjustments

**Adjust if**:
- Gross margin <35%: Increase markup by 5%
- Sandbox costs >15% of revenue: Reduce sandbox size or increase hibernation
- Churn >5%: Review pricing relative to value
- AI providers change pricing: Update markup tables

### Annual Review

**Strategic questions**:
- Are we competitive with alternatives?
- Should we add new plan tiers?
- Should we adjust credit bonuses?
- Are enterprise customers profitable?

## Revenue Projections

### Year 1 (Conservative)

**Month 1-3** (Launch):
- 50 users (30 Core, 15 Pro, 5 credit packs)
- MRR: $1,500
- Costs: $800 (infrastructure + usage)
- Profit: $700/month

**Month 4-6** (Growth):
- 200 users (100 Core, 70 Pro, 30 credit packs)
- MRR: $6,500
- Costs: $3,200
- Profit: $3,300/month

**Month 7-12** (Scale):
- 500 users (250 Core, 200 Pro, 50 credit packs)
- MRR: $17,500
- Costs: $8,750
- Profit: $8,750/month (50% margin)

### Year 1 Total

**Revenue**: ~$100K
**Costs**: ~$50K
**Profit**: ~$50K (50% margin)

### Year 2 (Optimistic)

**Assumptions**:
- 2,000 users (40% Core, 50% Pro, 10% Enterprise)
- Higher credit pack purchases
- Enterprise contracts

**Projected**:
- MRR: $80K
- Annual Revenue: $960K
- Costs: ~$480K
- Profit: ~$480K (50% margin)

## Launch Pricing Recommendations

### Phase 1: Initial Launch (Months 1-3)

**Goal**: Prove product-market fit

**Strategy**:
- Keep current pricing ($25 Core, $50 Pro)
- Generous credit bonuses (20% Core, 50% Pro)
- 14-day free trial for Core plan
- Focus on conversion over margin

**Acceptable Metrics**:
- Gross margin: 35%+ (lower is OK early on)
- Trial-to-paid: >15%
- Churn: <10% monthly

### Phase 2: Optimization (Months 4-6)

**Goal**: Improve margins while maintaining growth

**Strategy**:
- Reduce trial to 7 days (users who need it will pay)
- Decrease credit bonuses by 5-10%
- Introduce credit pack auto-reload
- Optimize model selection for margin

**Target Metrics**:
- Gross margin: 40%+
- Trial-to-paid: >20%
- Churn: <7% monthly

### Phase 3: Scale (Months 7-12)

**Goal**: Maximize profit while scaling

**Strategy**:
- Premium tier: $100/month for 4 CPU / 8GB sandboxes
- Volume discounts for enterprise
- Annual plans (2 months free = 12x retention)
- Referral program (credit rewards)

**Target Metrics**:
- Gross margin: 45%+
- Annual plan adoption: >30%
- Churn: <5% monthly

## Implementation Checklist

- [x] Credit system implemented (packages/shared/src/model/credits.ts)
- [x] Usage tracking implemented (packages/shared/src/model/usage-events.ts)
- [x] Pricing tables implemented (packages/shared/src/model/usage-pricing.ts)
- [x] Stripe integration implemented (apps/www/src/server-lib/stripe.ts)
- [x] Subscription management implemented (packages/shared/src/model/subscription.ts)
- [ ] Configure Stripe price IDs in production environment
- [ ] Set up Stripe webhooks in production
- [ ] Test end-to-end payment flow
- [ ] Configure auto-reload thresholds
- [ ] Set up cost monitoring dashboards
- [ ] Create admin tools for credit grants
- [ ] Document pricing adjustments process

## Key Takeaways

1. **Markup Strategy**: 35-50% on all AI costs ensures profitability
2. **Credit Psychology**: Users feel they're getting a deal, but costs are covered
3. **Subscription Value**: Monthly credits with bonuses encourage commitment
4. **Cost Control**: Hibernation and optimization keep costs <50% of revenue
5. **Scalability**: Model scales to 1000+ users with 45%+ margins
6. **Flexibility**: Adjust pricing quarterly based on actual costs and market

## Next Steps

1. **Finalize Stripe Products**: Create Core, Pro, and Credit Pack products
2. **Set Price IDs**: Configure in production environment variables
3. **Test Payment Flow**: Complete end-to-end with test cards
4. **Monitor Closely**: First month is critical for understanding actual costs
5. **Iterate**: Adjust markup and bonuses based on real data

---

**Remember**: The goal is instant profitability. With 35-50% markups and optimized costs, every credit pack sale and subscription is immediately profitable.
