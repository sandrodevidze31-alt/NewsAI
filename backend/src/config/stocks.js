// 50 stocks to track: Tech giants + promising startups
export const TRACKED_STOCKS = [
  // Tech Giants (FAANG+)
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'tech-giant',
    priority: 'high'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    category: 'tech-giant',
    priority: 'high'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    category: 'tech-giant',
    priority: 'high'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    category: 'tech-giant',
    priority: 'high'
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    category: 'tech-giant',
    priority: 'high'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'tech-giant',
    priority: 'high'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    category: 'tech-giant',
    priority: 'high'
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    category: 'tech-giant',
    priority: 'high'
  },

  // Major Tech Companies
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    category: 'semiconductor',
    priority: 'high'
  },
  {
    symbol: 'INTC',
    name: 'Intel Corporation',
    category: 'semiconductor',
    priority: 'medium'
  },
  {
    symbol: 'CRM',
    name: 'Salesforce Inc.',
    category: 'enterprise-software',
    priority: 'medium'
  },
  {
    symbol: 'ORCL',
    name: 'Oracle Corporation',
    category: 'enterprise-software',
    priority: 'medium'
  },
  {
    symbol: 'ADBE',
    name: 'Adobe Inc.',
    category: 'software',
    priority: 'medium'
  },
  {
    symbol: 'CSCO',
    name: 'Cisco Systems',
    category: 'networking',
    priority: 'medium'
  },

  // AI & Cloud
  {
    symbol: 'PLTR',
    name: 'Palantir Technologies',
    category: 'ai-analytics',
    priority: 'high'
  },
  {
    symbol: 'SNOW',
    name: 'Snowflake Inc.',
    category: 'cloud-data',
    priority: 'high'
  },
  {
    symbol: 'DDOG',
    name: 'Datadog Inc.',
    category: 'cloud-monitoring',
    priority: 'medium'
  },
  {
    symbol: 'NET',
    name: 'Cloudflare Inc.',
    category: 'cloud-security',
    priority: 'medium'
  },
  {
    symbol: 'CRWD',
    name: 'CrowdStrike Holdings',
    category: 'cybersecurity',
    priority: 'high'
  },
  {
    symbol: 'ZS',
    name: 'Zscaler Inc.',
    category: 'cybersecurity',
    priority: 'medium'
  },

  // Payment & Fintech
  {
    symbol: 'SQ',
    name: 'Block Inc. (Square)',
    category: 'fintech',
    priority: 'medium'
  },
  {
    symbol: 'PYPL',
    name: 'PayPal Holdings',
    category: 'fintech',
    priority: 'medium'
  },
  {
    symbol: 'COIN',
    name: 'Coinbase Global',
    category: 'crypto',
    priority: 'medium'
  },
  {
    symbol: 'HOOD',
    name: 'Robinhood Markets',
    category: 'fintech',
    priority: 'low'
  },

  // E-commerce & Social
  {
    symbol: 'SHOP',
    name: 'Shopify Inc.',
    category: 'e-commerce',
    priority: 'high'
  },
  {
    symbol: 'SPOT',
    name: 'Spotify Technology',
    category: 'streaming',
    priority: 'medium'
  },
  {
    symbol: 'UBER',
    name: 'Uber Technologies',
    category: 'rideshare',
    priority: 'medium'
  },
  {
    symbol: 'ABNB',
    name: 'Airbnb Inc.',
    category: 'travel-tech',
    priority: 'medium'
  },
  {
    symbol: 'DASH',
    name: 'DoorDash Inc.',
    category: 'delivery',
    priority: 'low'
  },

  // Semiconductors & Hardware
  {
    symbol: 'TSM',
    name: 'Taiwan Semiconductor',
    category: 'semiconductor',
    priority: 'high'
  },
  {
    symbol: 'ASML',
    name: 'ASML Holding',
    category: 'semiconductor-equipment',
    priority: 'high'
  },
  {
    symbol: 'QCOM',
    name: 'Qualcomm Inc.',
    category: 'semiconductor',
    priority: 'medium'
  },
  {
    symbol: 'MU',
    name: 'Micron Technology',
    category: 'memory-chips',
    priority: 'medium'
  },

  // Growth Tech & Startups
  {
    symbol: 'RBLX',
    name: 'Roblox Corporation',
    category: 'gaming-metaverse',
    priority: 'low'
  },
  {
    symbol: 'U',
    name: 'Unity Software',
    category: 'gaming-engine',
    priority: 'low'
  },
  {
    symbol: 'RIVN',
    name: 'Rivian Automotive',
    category: 'ev',
    priority: 'low'
  },
  {
    symbol: 'LCID',
    name: 'Lucid Group',
    category: 'ev',
    priority: 'low'
  },
  {
    symbol: 'SOFI',
    name: 'SoFi Technologies',
    category: 'fintech',
    priority: 'low'
  },
  {
    symbol: 'UPST',
    name: 'Upstart Holdings',
    category: 'ai-lending',
    priority: 'low'
  },

  // Enterprise & SaaS
  {
    symbol: 'TEAM',
    name: 'Atlassian Corporation',
    category: 'collaboration',
    priority: 'medium'
  },
  {
    symbol: 'ZM',
    name: 'Zoom Video Communications',
    category: 'video-conferencing',
    priority: 'low'
  },
  {
    symbol: 'DOCU',
    name: 'DocuSign Inc.',
    category: 'e-signature',
    priority: 'low'
  },
  {
    symbol: 'TWLO',
    name: 'Twilio Inc.',
    category: 'communication-api',
    priority: 'medium'
  },
  {
    symbol: 'OKTA',
    name: 'Okta Inc.',
    category: 'identity-security',
    priority: 'medium'
  },
  {
    symbol: 'MDB',
    name: 'MongoDB Inc.',
    category: 'database',
    priority: 'medium'
  },

  // Emerging Tech
  {
    symbol: 'PATH',
    name: 'UiPath Inc.',
    category: 'automation',
    priority: 'low'
  },
  {
    symbol: 'AI',
    name: 'C3.ai Inc.',
    category: 'enterprise-ai',
    priority: 'medium'
  },
  {
    symbol: 'IONQ',
    name: 'IonQ Inc.',
    category: 'quantum-computing',
    priority: 'low'
  },
  {
    symbol: 'BROS',
    name: 'Dutch Bros Inc.',
    category: 'food-tech',
    priority: 'low'
  },
  {
    symbol: 'VUZI',
    name: 'Vuzix Corporation',
    category: 'ar-vr',
    priority: 'low'
  }
];

// Get stock symbols only
export const STOCK_SYMBOLS = TRACKED_STOCKS.map(stock => stock.symbol);

// Get high priority stocks
export const HIGH_PRIORITY_STOCKS = TRACKED_STOCKS
  .filter(stock => stock.priority === 'high')
  .map(stock => stock.symbol);

// Group stocks by category
export const STOCKS_BY_CATEGORY = TRACKED_STOCKS.reduce((acc, stock) => {
  if (!acc[stock.category]) {
    acc[stock.category] = [];
  }
  acc[stock.category].push(stock);
  return acc;
}, {});

// Get stock info by symbol
export const getStockInfo = (symbol) => {
  return TRACKED_STOCKS.find(stock => stock.symbol === symbol);
};
