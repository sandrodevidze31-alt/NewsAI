# Required Accounts Setup

## Priority 1: Essential for Development

### 1. GitHub Account
- **URL**: https://github.com/signup
- **Purpose**: Code repository, version control
- **Cost**: FREE
- **Action**:
  - Sign up with email
  - Verify email
  - Create repository "news-ai-trading"

### 2. Anthropic API (Claude)
- **URL**: https://console.anthropic.com/
- **Purpose**: AI analysis of news articles
- **Cost**: Pay-as-you-go (Claude Haiku: ~$0.25 per 1M input tokens)
- **Estimated monthly**: $15-45 for twice-daily updates
- **Action**:
  - Sign up with email
  - Add payment method (credit card)
  - Generate API key
  - Start with $10 credit to test
  - **Keep API key secret!**

### 3. News API Sources

#### NewsAPI.org
- **URL**: https://newsapi.org/register
- **Purpose**: General news articles
- **Cost**: FREE tier (100 requests/day)
- **Limits**: Perfect for twice-daily updates
- **Action**: Sign up, get API key

#### Alpha Vantage
- **URL**: https://www.alphavantage.co/support/#api-key
- **Purpose**: Financial news + stock data
- **Cost**: FREE tier (25 requests/day)
- **Limits**: Good for supplementary data
- **Action**: Enter email, get instant API key

#### Finnhub
- **URL**: https://finnhub.io/register
- **Purpose**: Real-time financial news
- **Cost**: FREE tier (60 calls/minute)
- **Limits**: Excellent for stock-specific news
- **Action**: Sign up, generate API key

## Priority 2: Deployment (Can setup later)

### 4. Railway Account
- **URL**: https://railway.app/
- **Purpose**: Host backend + PostgreSQL database
- **Cost**:
  - FREE $5 credit/month (good for testing)
  - Then $5-10/month for small projects
- **Action**: Sign up with GitHub account (easiest)

### 5. Vercel Account
- **URL**: https://vercel.com/signup
- **Purpose**: Host frontend (React app)
- **Cost**: FREE for personal projects
- **Action**: Sign up with GitHub account

### 6. Domain Name (Optional for MVP)
- **Options**: Namecheap, Google Domains, Cloudflare
- **Cost**: ~$10-15/year
- **Action**: Can use Railway/Vercel free domains initially
- Example: `your-app.railway.app` or `your-app.vercel.app`

---

## Setup Checklist

### Phase 1 - Do Now (for development):
- [ ] GitHub account
- [ ] Anthropic API key
- [ ] NewsAPI.org API key
- [ ] Alpha Vantage API key
- [ ] Finnhub API key

### Phase 2 - Do before deployment:
- [ ] Railway account (backend hosting)
- [ ] Vercel account (frontend hosting)

### Phase 3 - Optional/Later:
- [ ] Custom domain name
- [ ] Professional email (Gmail is fine for now)

---

## Cost Summary (Starting Budget)

| Item | Setup Cost | Monthly Cost |
|------|-----------|--------------|
| GitHub | $0 | $0 |
| Anthropic Claude API | $10 initial test | $15-45 |
| News APIs (all 3) | $0 | $0 (free tiers) |
| Railway (backend) | $0 | $0-10 |
| Vercel (frontend) | $0 | $0 |
| **TOTAL** | **$10** | **$15-55** |

---

## Security Notes

### NEVER commit API keys to GitHub!
We'll use environment variables to keep keys secure.

### API Key Storage
When you get your API keys, save them securely:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
NEWSAPI_KEY=xxxxx
ALPHAVANTAGE_KEY=xxxxx
FINNHUB_KEY=xxxxx
```

I'll help you set up proper environment configuration when we start building.

---

## What to Do Right Now

1. **Create GitHub account** (if you don't have one)
2. **Sign up for Anthropic** and add $10-20 credit
3. **Get all 3 news API keys** (takes 5 minutes total)
4. **Send me confirmation** when ready

Then we'll immediately start building! 🚀

---

## Questions?

- Don't worry about messing up - all these are easy to reset/recreate
- Start with free tiers, upgrade only when needed
- I'll guide you through each integration step
