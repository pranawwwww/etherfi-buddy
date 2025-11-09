# ether.fi Backend API v2.0

Enhanced FastAPI backend for ether.fi with **live data integration**, **historical tracking**, and **AI-powered forecasting**.

## 🚀 Features

- ✅ **Live Price Data** - Real-time prices from DefiLlama for eETH, weETH, ETHFI, eBTC
- ✅ **APY/Yield Tracking** - Live and historical APY data with TVL metrics
- ✅ **Historical Data Storage** - SQLite/PostgreSQL database for price/APY history
- ✅ **AI Forecasting** - Claude-powered price predictions with scenario analysis
- ✅ **Background Data Collection** - Automated periodic data fetching
- ✅ **Comprehensive API** - RESTful endpoints for all data needs
- ✅ **Legacy Support** - All original endpoints still functional

## 📦 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env` and add your Anthropic API key:

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-api03-...
APP_ORIGIN=http://localhost:8080
DATABASE_URL=sqlite:///./etherfi_data.db
```

### 3. Run Setup

```bash
python setup.py 30
```

This will:
- Initialize the database
- Test API connections
- Backfill 30 days of historical data

### 4. Start the Server

```bash
uvicorn main:app --reload --port 8000
```

API available at: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

## 📊 API Endpoints

### New V2 Endpoints

All new endpoints are under `/api/v2/`

#### Prices

```http
GET /api/v2/prices/live                    # All products
GET /api/v2/prices/live/{product}          # Specific product
GET /api/v2/prices/historical/{product}    # Historical data
```

#### APY Data

```http
GET /api/v2/apy/live                       # All products
GET /api/v2/apy/live/{product}             # Specific product
GET /api/v2/apy/historical/{product}       # Historical APY
```

#### AI Forecasting

```http
GET /api/v2/forecast/{product}?days=90     # AI price forecast
```

#### Summaries & Charts

```http
GET /api/v2/summary                        # All products summary
GET /api/v2/summary/{product}              # Single product
GET /api/v2/chart/{product}?days=30        # Chart data
```

#### Health Check

```http
GET /api/v2/health                         # System health
```

### Legacy Endpoints (Still Available)

```http
POST /api/simulate                         # Portfolio simulation
GET  /api/forecast                         # Growth forecast
POST /api/ask                              # AI assistant
GET  /api/rates                            # APY rates
GET  /api/live-metrics                     # Live metrics
GET  /api/historical-prices                # Historical prices
GET  /api/correlation-matrix               # Correlation data
GET  /api/risk-analysis                    # Risk analysis
```

## 🗄️ Database

The backend uses SQLAlchemy with support for:
- **SQLite** (default, for development)
- **PostgreSQL** (recommended for production)

### Tables

- `price_history` - Historical price data
- `apy_history` - APY/yield data over time
- `price_forecasts` - AI-generated predictions
- `market_metrics` - General market data

### Initialize Database

```bash
python database.py
```

## 🔄 Background Data Fetcher

The data fetcher runs periodically to collect live data.

### Commands

```bash
# Single fetch
python data_fetcher.py fetch

# Backfill historical data (30 days)
python data_fetcher.py backfill 30

# Start continuous fetcher (every 15 minutes)
python data_fetcher.py start 15
```

### Run as Background Service

**Linux/Mac (systemd):**
Create `/etc/systemd/system/etherfi-fetcher.service`

**Windows (Task Scheduler):**
Create scheduled task to run `python data_fetcher.py start 15`

**Docker:**
```dockerfile
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 & python data_fetcher.py start 15"]
```

## 🤖 AI Forecasting

Uses Claude API to generate price forecasts based on historical data.

### Generate Forecast

```bash
# Command line
python ai_forecasting.py eETH 30

# API endpoint
curl http://localhost:8000/api/v2/forecast/eETH?days=30
```

### Forecast Output

- **Current Analysis** - Trend, confidence, key factors
- **Time-based Forecasts** - 7-day, 30-day, 90-day predictions
- **Scenarios** - Bullish/base/bearish with probabilities
- **Reasoning** - AI explanation of predictions
- **Risk Factors** - Identified risks
- **Opportunities** - Growth catalysts

## 🧪 Testing

### Test Components

```bash
# Quick test all systems
python setup.py test

# Test DefiLlama client
python defillama_client.py

# Test AI forecasting
python ai_forecasting.py weETH 90
```

### Example Requests

```bash
# Get live prices
curl http://localhost:8000/api/v2/prices/live

# Get historical data (7 days)
curl http://localhost:8000/api/v2/prices/historical/eETH?days=7

# Get APY data
curl http://localhost:8000/api/v2/apy/live/weETH

# Get forecast
curl http://localhost:8000/api/v2/forecast/ETHFI?days=30

# Health check
curl http://localhost:8000/api/v2/health
```

## 📁 File Structure

```
backend/
├── main.py                    # FastAPI app with all endpoints
├── database.py                # SQLAlchemy models & DB setup
├── defillama_client.py        # DefiLlama API client
├── data_fetcher.py            # Background data collection
├── ai_forecasting.py          # Claude AI forecasting service
├── api_endpoints.py           # V2 API routes
├── etherfi_service.py         # Legacy service (original)
├── setup.py                   # Setup & initialization script
├── requirements.txt           # Python dependencies
├── API_INTEGRATION_GUIDE.md   # Detailed integration guide
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-api03-...    # For AI forecasting

# Optional
DATABASE_URL=sqlite:///./etherfi_data.db    # Database connection
APP_ORIGIN=http://localhost:8080            # CORS origin
DEFAULT_APY_STAKE=0.04                      # Default APY values
DEFAULT_APY_LIQUID_USD=0.10
FORECAST_MONTHS=12
```

## 🚢 Production Deployment

### Recommendations

1. **Database**: Use PostgreSQL
   ```bash
   DATABASE_URL=postgresql://user:pass@localhost/etherfi
   ```

2. **Process Manager**: Use systemd, PM2, or Docker

3. **Reverse Proxy**: Nginx or Caddy

4. **Monitoring**: Set up health checks on `/api/v2/health`

5. **Backup**: Regular database backups

6. **Rate Limiting**: Add rate limiting middleware

### Docker Example

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Initialize DB and start services
CMD python database.py && \
    python data_fetcher.py backfill 90 && \
    uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📖 Documentation

- **API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **ReDoc**: `http://localhost:8000/redoc`
- **Integration Guide**: [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)

## 🔗 Data Sources

- **DefiLlama** - Live prices and APY data
  - Coins API: `https://coins.llama.fi`
  - Yields API: `https://yields.llama.fi`
  - Free, no API key required

- **Anthropic Claude** - AI forecasting
  - Model: `claude-sonnet-4-5-20250929`
  - Requires API key

## 📝 Products Tracked

| Product | Contract | Type |
|---------|----------|------|
| **eETH** | `0x35fA164735182de50811E8e2E824cFb9B6118ac2` | Liquid staking token |
| **weETH** | `0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee` | Wrapped eETH |
| **ETHFI** | `0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB` | Governance token |
| **eBTC** | `0x657e8C867D8B37dCC18fA4Caead9C45EB088C642` | BTC liquid staking |

## 🤝 Contributing

Issues and pull requests welcome!

## 📄 License

MIT License - see project root for details
