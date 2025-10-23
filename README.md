# News-AI Stock Trading Insights Platform

AI-powered stock trading recommendations based on real-time news analysis and historical pattern matching.

## Overview

This platform aggregates financial news from multiple sources, uses Claude AI to analyze sentiment and patterns, and provides actionable stock trading recommendations with confidence scores.

## Features

- **Twice-daily news updates** (morning & evening)
- **AI-powered analysis** using Anthropic Claude
- **50 tracked stocks** - Tech giants + promising startups
- **Historical pattern matching** - Learn from past events
- **Confidence scoring** - Know how reliable each recommendation is
- **User authentication** - Secure multi-user access
- **Clean dashboard** - Easy-to-read insights

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Anthropic Claude API
- Multiple news APIs (NewsAPI, Alpha Vantage, Finnhub)

### Frontend
- React.js + Vite
- Tailwind CSS
- Chart.js for visualizations
- Axios for API calls

## Project Structure

```
News AI/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic (news, AI analysis)
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, error handling
│   │   ├── config/         # Configuration files
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Entry point
│   ├── tests/              # Backend tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app component
│   ├── public/             # Static assets
│   └── package.json
├── BUSINESS_PLAN.md        # Complete business strategy
├── SETUP_ACCOUNTS.md       # Account setup instructions
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- API keys (see SETUP_ACCOUNTS.md)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd "News AI"
```

2. **Set up backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

3. **Set up frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend API URL
npm run dev
```

4. **Initialize database**
```bash
cd backend
npm run db:migrate
npm run db:seed  # Optional: seed with initial user
```

### Environment Variables

See `.env.example` files in both `backend/` and `frontend/` directories.

**Required API Keys:**
- `ANTHROPIC_API_KEY` - Claude AI
- `NEWSAPI_KEY` - NewsAPI.org
- `ALPHAVANTAGE_KEY` - Alpha Vantage
- `FINNHUB_KEY` - Finnhub
- `JWT_SECRET` - Random secure string

## Usage

1. **Access the dashboard** at `http://localhost:5173`
2. **Login** with your credentials
3. **View news feed** with AI analysis
4. **Check recommendations** for buy/sell/hold signals
5. **Review confidence scores** and reasoning

## Development Roadmap

- [x] Phase 1: Project setup and architecture
- [ ] Phase 2: Backend API with authentication
- [ ] Phase 3: News aggregation service
- [ ] Phase 4: Claude AI integration
- [ ] Phase 5: Frontend dashboard
- [ ] Phase 6: Deployment

## Cost Breakdown

**Monthly Operating Costs:**
- Claude AI API: $15-45
- Backend hosting (Railway): $0-10
- Frontend hosting (Vercel): $0
- News APIs: $0 (free tiers)
- **Total: $15-55/month**

## Deployment

### Backend (Railway)
```bash
cd backend
railway login
railway init
railway up
```

### Frontend (Vercel)
```bash
cd frontend
vercel login
vercel --prod
```

See deployment guide in docs for detailed instructions.

## Security

- All API keys stored in environment variables
- JWT tokens for authentication
- Password hashing with bcrypt
- SQL injection protection with parameterized queries
- Rate limiting on API endpoints

## Disclaimer

⚠️ **This platform provides informational insights, NOT financial advice.**

- For informational purposes only
- Past performance does not guarantee future results
- Users should do their own research before making investment decisions
- We are not registered financial advisors

## Contributing

This is a private project. For access, contact the repository owner.

## License

Private - All rights reserved

## Support

For issues or questions, create an issue in the GitHub repository.

---

**Built with ❤️ for smarter trading decisions**
