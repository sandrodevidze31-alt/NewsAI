# Quick Start Guide

Get your News-AI Trading Insights platform up and running in 30 minutes!

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 18+ installed ([download here](https://nodejs.org/))
- [ ] PostgreSQL 14+ installed ([download here](https://www.postgresql.org/download/))
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] All API keys from SETUP_ACCOUNTS.md

## Step 1: Clone and Setup (5 minutes)

```bash
# Navigate to your project
cd "/Users/sandrodevidze/Desktop/my project/News AI"

# Initialize git (already done)
git status

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Database Setup (10 minutes)

### 2.1 Create PostgreSQL Database

```bash
# Open PostgreSQL terminal (macOS)
psql postgres

# Create database and user
CREATE DATABASE newsai_db;
CREATE USER newsai_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE newsai_db TO newsai_user;

# Exit
\q
```

### 2.2 Configure Environment Variables

```bash
# In backend directory
cd backend
cp .env.example .env
```

Edit `backend/.env` with your actual values:

```env
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://newsai_user:your_secure_password@localhost:5432/newsai_db

# JWT (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Your actual key from Anthropic

# News APIs
NEWSAPI_KEY=xxxxx              # Your key from NewsAPI.org
ALPHAVANTAGE_KEY=xxxxx         # Your key from Alpha Vantage
FINNHUB_KEY=xxxxx              # Your key from Finnhub

# Cron Schedule (9 AM and 6 PM)
CRON_MORNING=0 9 * * *
CRON_EVENING=0 18 * * *

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 2.3 Run Database Migrations

```bash
# Still in backend directory
npm run db:migrate
```

You should see:
```
✅ Users table created
✅ News articles table created
✅ AI analysis table created
✅ Recommendations table created
✅ Historical patterns table created
✅ Indexes created
🎉 Database migration completed successfully!
```

### 2.4 Seed Initial Data

```bash
npm run db:seed
```

You should see:
```
✅ Default users created:
   Email: user1@newsai.com | Password: changeme123
   Email: user2@newsai.com | Password: changeme123
✅ Historical patterns seeded
🎉 Database seeding completed successfully!
```

## Step 3: Frontend Configuration (2 minutes)

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

## Step 4: Start the Application (2 minutes)

### Option A: Run in separate terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 3000
📊 Environment: development
🔗 API available at http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Option B: Run with single command (later)

You can add this to root package.json for convenience:
```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm run dev\""
  }
}
```

## Step 5: Access the Application (1 minute)

1. Open browser: http://localhost:5173
2. Login with:
   - **Email**: user1@newsai.com
   - **Password**: changeme123
3. You're in!

## Step 6: Test News Aggregation (10 minutes)

### Manual Trigger (Recommended for first time)

Once logged in to the app, or via API:

```bash
# Using curl
curl -X POST http://localhost:3000/api/analysis/trigger \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Or create a simple test script `backend/test-aggregation.js`:

```javascript
import { startNewsAggregation } from './src/services/newsAggregator.service.js';

console.log('🧪 Testing news aggregation...');
startNewsAggregation('test').then(() => {
  console.log('✅ Test complete');
  process.exit(0);
});
```

Run it:
```bash
cd backend
node test-aggregation.js
```

This will:
1. Fetch news from all 3 APIs
2. Save articles to database
3. Trigger AI analysis with Claude
4. Generate recommendations
5. Display results in your dashboard

### Expected Results

- **NewsAPI**: 20-50 articles
- **Finnhub**: 40-100 articles
- **Alpha Vantage**: 10-30 articles
- **Total unique**: 50-100 articles
- **High-impact filtered**: 20-40 articles
- **AI analyzed**: 20-40 articles

Check the backend console for progress:
```
🗞️  Starting news aggregation (test)...
Fetched: NewsAPI(45), Finnhub(78), AlphaVantage(23)
Total unique articles: 92
High-impact articles: 34
🤖 Analyzing article: Apple announces new...
✅ Analysis completed for article xxx
...
✅ News aggregation completed in 45.2s
   Articles saved: 34
   Articles queued for analysis: 34
```

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Make sure PostgreSQL is running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start from Services panel
```

### API Key Errors

```
Error: Invalid API key
```

**Solution**:
1. Double-check your API keys in `.env`
2. Make sure there are no extra spaces
3. Restart the backend server after changing `.env`

### Claude API Errors

```
Error: 401 Unauthorized
```

**Solution**:
1. Verify your Anthropic API key
2. Check you have billing enabled on Anthropic account
3. Ensure you have credits ($10 minimum recommended)

### Port Already in Use

```
Error: Port 3000 already in use
```

**Solution**:
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in backend/.env
PORT=3001
```

### No News Showing Up

**Possible causes**:
1. API rate limits hit (wait 24 hours or use different keys)
2. News aggregation hasn't run yet (trigger manually)
3. Database connection issue

**Solution**:
```bash
# Check database
cd backend
node -e "import('./src/config/database.js').then(({query}) => query('SELECT COUNT(*) FROM news_articles').then(r => console.log('Articles:', r.rows[0].count)))"
```

## Next Steps

Now that everything is running:

### 1. Customize for Your Needs

- **Edit stock list**: `backend/src/config/stocks.js`
- **Adjust aggregation schedule**: `backend/.env` (CRON_MORNING, CRON_EVENING)
- **Modify AI prompts**: `backend/src/services/aiAnalysis.service.js`

### 2. Change Default Passwords

```bash
# Login to app
# Go to Settings (when implemented)
# Or use API:
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"changeme123","newPassword":"YourNewSecurePassword123!"}'
```

### 3. Monitor Costs

Check your API usage:
- **Anthropic Console**: https://console.anthropic.com/
- **NewsAPI Dashboard**: https://newsapi.org/account
- Each news aggregation cycle costs approximately $0.50-$1.50

### 4. Set Up Git Repository

```bash
cd "/Users/sandrodevidze/Desktop/my project/News AI"

git add .
git commit -m "Initial commit: News-AI Trading Platform"

# Push to GitHub
git remote add origin https://github.com/yourusername/news-ai-trading.git
git push -u origin main
```

### 5. Deploy to Production

See `DEPLOYMENT.md` (to be created) for:
- Railway deployment (backend)
- Vercel deployment (frontend)
- Environment variables setup
- Domain configuration

## Daily Usage

### Morning Routine (9 AM automatic)
- System fetches overnight news
- AI analyzes articles
- Recommendations generated
- Check dashboard for insights

### Evening Routine (6 PM automatic)
- System fetches day's news
- AI analyzes market-moving events
- Updated recommendations
- Review for next trading day

### Manual Check Anytime
- Visit http://localhost:5173
- View latest news and analysis
- Check top recommendations
- Explore specific stocks

## Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed initial data
npm test             # Run tests (when implemented)

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
psql newsai_db       # Connect to database
# Then run SQL queries:
SELECT COUNT(*) FROM news_articles;
SELECT * FROM recommendations WHERE is_active = true LIMIT 10;
```

## Support

If you encounter issues:

1. Check the [README.md](README.md) for architecture details
2. Review [BUSINESS_PLAN.md](BUSINESS_PLAN.md) for feature scope
3. Check logs in `backend/logs/`
4. Search GitHub issues (when repository is public)

## What's Next?

The MVP is now running! Future enhancements:

- Real-time alerts via email/SMS
- Advanced charting and analytics
- Mobile app
- Backtesting engine
- Social sharing features

Happy trading! 📈🚀
