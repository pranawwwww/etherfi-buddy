# EtherFi Live Data Integration 🔴 LIVE

## Overview

Your app can now fetch **real-time data** from EtherFi smart contracts and DeFi data providers instead of using static mock values!

## What's Now Live

### 1. Real APY Rates
Instead of hardcoded 4% and 10%, fetch actual current rates:
- **eETH/weETH Staking APY**: Live from DefiLlama (~3.2-3.5%)
- **Liquid USD APY**: Live stablecoin yields (~7-10%)
- **Updates every 5 minutes** (cached to avoid rate limits)

### 2. Live ETH Price
- Fetched from CoinGecko API
- Real-time market price
- Used for all USD calculations

### 3. Total Value Locked (TVL)
- EtherFi protocol TVL from DefiLlama
- Shows ecosystem health

### 4. Smart Contract Addresses
Verified Ethereum mainnet addresses:
```python
eETH:   0x35fA164735182de50811E8e2E824cFb9B6118ac2
weETH:  0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee
Pool:   0x308861A430be4cce5502d0A12724771Fc6DaF216
ETHFI:  0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB
```

## New API Endpoints

### GET /api/live-metrics
**Get all live EtherFi data in one call**

Response:
```json
{
  "ethPrice": 3487.23,
  "apyStake": 0.0325,
  "apyLiquidUsd": 0.0847,
  "weethExchangeRate": 1.02,
  "totalTVL": 8542000000,
  "borrowRate": 0.045,
  "ltvWeeth": 0.50,
  "source": "live",
  "timestamp": "2025-01-08T10:30:00",
  "contracts": {
    "eETH": "0x35fA...",
    "weETH": "0xCd5f...",
    ...
  }
}
```

### GET /api/rates?live=true
**Enhanced rates endpoint with live data**

```bash
# Get live rates
curl http://localhost:8000/api/rates?live=true

# Get static demo rates
curl http://localhost:8000/api/rates?live=false
```

### GET /api/historical-prices?asset=ETH&days=30
**Get historical price data**

```bash
curl http://localhost:8000/api/historical-prices?asset=weETH&days=7
```

Response:
```json
{
  "asset": "weETH",
  "days": 7,
  "data": [
    {"date": "2025-01-01T00:00:00", "price": 3425.50},
    {"date": "2025-01-02T00:00:00", "price": 3487.23},
    ...
  ]
}
```

### GET /api/apy-history?days=30
**Get historical APY trends**

```bash
curl http://localhost:8000/api/apy-history?days=14
```

Response:
```json
{
  "days": 14,
  "data": [
    {"date": "2025-01-01T00:00:00", "apy": 0.0318},
    {"date": "2025-01-02T00:00:00", "apy": 0.0325},
    ...
  ]
}
```

## Data Sources

### Primary Sources

1. **DefiLlama** (yields.llama.fi)
   - APY rates for eETH, weETH, Liquid USD
   - Total Value Locked (TVL)
   - Pool data

2. **CoinGecko** (api.coingecko.com)
   - ETH and token prices
   - Market data
   - Free tier: 30 calls/minute

3. **Etherscan** (api.etherscan.io) - Optional
   - Smart contract reads
   - On-chain data
   - Requires free API key

### Fallback Strategy

If live APIs fail, the system automatically falls back to:
1. Cached data (if available, <5 minutes old)
2. Demo static values
3. Conservative estimates

## Setup Instructions

### 1. Install Dependencies
Already included in [requirements.txt](backend/requirements.txt):
```
httpx==0.28.1  ✅ For HTTP requests
```

### 2. Optional: Get API Keys

**Etherscan API Key** (Free, Optional):
1. Go to https://etherscan.io/apis
2. Sign up for free account
3. Create API key
4. Add to `.env`:
   ```
   ETHERSCAN_API_KEY=your_key_here
   ```

Benefits:
- Enhanced contract data
- Higher rate limits
- More detailed metrics

**Note**: CoinGecko and DefiLlama don't require API keys for basic usage.

### 3. Update .env File

```bash
cp .env.example .env
```

Edit `.env`:
```
ETHERSCAN_API_KEY=your_key_here  # Optional
```

### 4. Test Live Data

```bash
# Start backend
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000

# Test endpoints
curl http://localhost:8000/api/live-metrics
curl http://localhost:8000/api/rates?live=true
curl http://localhost:8000/api/apy-history?days=7
```

## Implementation Details

### Caching Strategy

To avoid rate limits, data is cached for 5 minutes:

```python
CACHE_TTL = timedelta(minutes=5)

_cache = {
  "eth_price": (timestamp, 3487.23),
  "etherfi_apy": (timestamp, {"apyStake": 0.0325, ...}),
  ...
}
```

Benefits:
- Reduces API calls
- Faster response times
- Rate limit protection
- Still fresh data (5 min max)

### Error Handling

Three layers of protection:

1. **Try live data**
   ```python
   live_data = await get_live_rates()
   ```

2. **Check cache if API fails**
   ```python
   cached = _get_cached("eth_price")
   if cached: return cached
   ```

3. **Fallback to demo values**
   ```python
   return 3500.0  # Conservative ETH price
   ```

### Rate Limits

**CoinGecko (Free Tier)**:
- 30-50 calls/minute
- With 5-minute caching: ~12 calls/hour
- Well within limits ✅

**DefiLlama**:
- No strict limits
- Fair use policy
- Caching respects servers ✅

**Etherscan (Free)**:
- 5 calls/second
- Optional, only if you have key

## Frontend Integration

### Update API Calls

The existing `/api/rates` endpoint now returns live data by default:

```typescript
// In your components
const rates = await api.rates();  // Now returns live data!

console.log(rates.source);  // "live" or "demo-fallback"
console.log(rates.apyStake);  // e.g., 0.0325 (actual current APY)
```

### Show Live Data Badge

Add a badge to show users they're seeing real data:

```tsx
{rates.source === 'live' && (
  <Badge variant="success">
    🔴 Live Data
  </Badge>
)}
```

### Display Last Updated

```tsx
<div className="text-xs text-muted-foreground">
  Last updated: {new Date(rates.timestamp).toLocaleTimeString()}
</div>
```

## Monitoring & Health

### Check Data Freshness

```bash
curl http://localhost:8000/api/live-metrics | jq '.timestamp'
# "2025-01-08T10:35:22"
```

### Verify Source

```bash
curl http://localhost:8000/api/rates | jq '.source'
# "live" = ✅ Real data
# "demo-static" = Using hardcoded values
# "demo-fallback" = API failed, using demo
```

### Health Endpoint

```bash
curl http://localhost:8000/health
# {"status": "ok"}
```

## Advantages of Live Data

### Before (Static Mock)
```
APY: 4.0% (hardcoded, outdated)
ETH Price: $3,500 (fixed)
Last Updated: Never
Accuracy: Low
```

### After (Live Data)
```
APY: 3.25% (real-time from DefiLlama)
ETH Price: $3,487.23 (CoinGecko)
Last Updated: 2 minutes ago
Accuracy: High ✅
```

## User Benefits

1. **Accurate Projections**
   - Forecasts based on actual current APYs
   - Real ETH prices for USD calculations
   - More trustworthy recommendations

2. **Market Awareness**
   - See how APYs change over time
   - Understand market trends
   - Make timely decisions

3. **Transparency**
   - Know you're seeing real data
   - Source attribution
   - Timestamp on every response

4. **Professional Credibility**
   - "Live Data" badge builds trust
   - Connected to real blockchain
   - Production-ready feel

## Next-Level Enhancements

### Phase 2: Direct Smart Contract Calls

Use Web3.py to read directly from contracts:

```python
# Install: pip install web3
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('https://eth.llamarpc.com'))

# Read weETH price from contract
weeth_contract = w3.eth.contract(
    address='0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
    abi=WEETH_ABI
)

rate = weeth_contract.functions.getRate().call()
```

### Phase 3: The Graph Integration

Query historical data from The Graph subgraphs:

```graphql
query {
  apySnapshots(first: 30, orderBy: timestamp, orderDirection: desc) {
    timestamp
    apy
    totalValueLocked
  }
}
```

### Phase 4: WebSocket Real-Time Updates

Push live updates to frontend:

```python
from fastapi import WebSocket

@app.websocket("/ws/live-rates")
async def websocket_rates(websocket: WebSocket):
    await websocket.accept()
    while True:
        rates = await get_live_rates()
        await websocket.send_json(rates)
        await asyncio.sleep(60)  # Update every minute
```

## Testing

### Manual Testing

```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2: Test endpoints
curl http://localhost:8000/api/live-metrics
curl http://localhost:8000/api/rates?live=true
curl http://localhost:8000/api/historical-prices?asset=ETH&days=7
curl http://localhost:8000/api/apy-history?days=14

# Check for "source": "live" in responses
```

### Automated Testing

```python
import pytest
from etherfi_service import get_live_rates, get_eth_price

@pytest.mark.asyncio
async def test_live_rates():
    data = await get_live_rates()
    assert data["source"] == "live"
    assert data["ethPrice"] > 0
    assert 0 < data["apyStake"] < 0.1  # Reasonable APY range

@pytest.mark.asyncio
async def test_eth_price():
    price = await get_eth_price()
    assert 1000 < price < 10000  # ETH price sanity check
```

## Troubleshooting

### "Failed to fetch live metrics"

**Cause**: API rate limit or network issue
**Solution**: Data automatically falls back to demo values
**Check**: Look for `"source": "demo-fallback"` in response

### Stale Data

**Cause**: Cache not expiring
**Solution**: Restart backend to clear cache
**Prevention**: Cache TTL is 5 minutes, should auto-refresh

### Wrong APY Values

**Cause**: DefiLlama pool not found
**Solution**: Check [etherfi_service.py](backend/etherfi_service.py) pool filtering logic
**Verify**: Visit https://defillama.com/protocol/ether.fi manually

## Production Deployment

### Environment Variables

Set on your hosting platform (Render, Fly.io, Railway):

```
ETHERSCAN_API_KEY=your_production_key
```

### Monitoring

Add logging for API calls:

```python
import logging

logger = logging.getLogger(__name__)

logger.info(f"Fetching live rates from DefiLlama...")
logger.error(f"API failed: {e}, using fallback")
```

### Rate Limit Protection

Consider adding Redis caching for production:

```python
import redis
r = redis.Redis(host='localhost', port=6379, db=0)

# Cache for 5 minutes
r.setex('eth_price', 300, str(price))
```

## Files Added/Modified

**New Files**:
- [backend/etherfi_service.py](backend/etherfi_service.py) - Live data service

**Modified Files**:
- [backend/main.py](backend/main.py) - Added 3 new endpoints
- [.env.example](.env.example) - Added ETHERSCAN_API_KEY

**Dependencies**:
- httpx ✅ (already in requirements.txt)

## Success Metrics

Track these to measure impact:

- **Data Freshness**: % of requests served with live data
- **Cache Hit Rate**: % served from cache vs API
- **API Failures**: Monitor fallback frequency
- **User Trust**: "Live Data" badge engagement

---

**Your app now has LIVE EtherFi data integration!** 🚀

Real APYs, real prices, real value. No more static mocks - this is production-ready DeFi analytics.
