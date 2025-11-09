# API Integration Guide - ether.fi Buddy

## Overview

This guide documents all API integrations in the ether.fi Buddy backend, including both the legacy mock data endpoints and the new enhanced endpoints using real-time data from multiple DeFi APIs.

## Table of Contents

1. [API Architecture](#api-architecture)
2. [Data Sources](#data-sources)
3. [API Endpoints](#api-endpoints)
4. [Client Libraries](#client-libraries)
5. [Database Schema](#database-schema)
6. [Setup & Configuration](#setup--configuration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## API Architecture

### Stack
- **Framework**: FastAPI 0.115.12
- **Database**: SQLAlchemy 2.0.36 with SQLite (configurable to PostgreSQL)
- **HTTP Client**: httpx 0.28.1
- **AI**: Anthropic Claude API (claude-sonnet-4-5-20250929)
- **Server**: Uvicorn 0.34.0

### Architecture Pattern
```
Frontend (React/Vite on :8081)
    |
    | /api/* proxy
    v
Backend (FastAPI on :8000)
    |
    +-- DefiLlama Client -------> DefiLlama API (prices, APY)
    +-- Beaconchain Client -----> Beaconcha.in API (validators)
    +-- Uniswap Client ---------> The Graph Subgraph (liquidity)
    +-- EigenExplorer Client ---> EigenLayer data (AVS, restaking)
    +-- Claude AI Client -------> Anthropic API (forecasting, chatbot)
    |
    v
SQLite Database (historical data)
```

---

## Data Sources

### 1. DefiLlama API
- **Purpose**: Real-time prices, APY, and TVL data
- **Cost**: FREE (no API key required)
- **Docs**: https://defillama.com/docs/api
- **Endpoints Used**:
  - `/prices/current/{addresses}` - Current token prices
  - `/yields` - APY data for pools
- **Products Tracked**:
  - eETH: `0x35fA164735182de50811E8e2E824cFb9B6118ac2`
  - weETH: `0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee`
  - ETHFI: `0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB`
  - eBTC: `0x657e8C867D8B37dCC18fA4Caead9C45EB088C642`

### 2. Beaconcha.in API
- **Purpose**: Ethereum validator metrics, uptime, DVT status
- **Cost**: FREE (rate-limited, optional API key for higher limits)
- **Docs**: https://beaconcha.in/api/v1/docs
- **Endpoints Used**:
  - `/validator/{validator_index}/attestations` - Attestation performance
  - `/validators` - Validator status and client diversity
- **Data Retrieved**:
  - 7-day uptime percentage
  - Missed attestations
  - Client diversity (Prysm, Lighthouse, Teku, Nimbus)
  - DVT protection status

### 3. Uniswap Subgraph (The Graph)
- **Purpose**: DEX liquidity, pool metrics, slippage estimates
- **Cost**: FREE (rate-limited)
- **Docs**: https://thegraph.com/docs/en/
- **Subgraphs Used**:
  - Ethereum: `uniswap/uniswap-v3`
  - Arbitrum: `ianlapham/uniswap-arbitrum-one`
  - Base: `48211/uniswap-v3-base`
- **Data Retrieved**:
  - Pool TVL (Total Value Locked)
  - Fee tiers (0.01%, 0.05%, 0.3%, 1%)
  - Token pairs (weETH/WETH, weETH/USDC)
  - Liquidity depth for slippage calculations

### 4. EigenExplorer / EigenLayer
- **Purpose**: AVS concentration, restaking distribution
- **Cost**: FREE (currently using mock data based on public metrics)
- **Note**: Actual API integration pending official EigenLayer API release
- **Data Retrieved**:
  - AVS (Actively Validated Services) allocation percentages
  - HHI (Herfindahl-Hirschman Index) for concentration
  - Base staking vs restaking distribution
  - Slashing event history

### 5. Anthropic Claude API
- **Purpose**: AI-powered forecasting and chatbot
- **Cost**: Usage-based pricing (~$3 per million input tokens, $15 per million output tokens)
- **Model**: claude-sonnet-4-5-20250929
- **API Key**: Required (set in `ANTHROPIC_API_KEY` environment variable)
- **Use Cases**:
  - Price forecasting based on historical trends
  - DeFi chatbot with knowledge base
  - Strategy recommendations

---

## API Endpoints

### Enhanced Endpoints (Real API Data)

#### GET `/api/risk-analysis-enhanced`
Enhanced risk analysis using real data from Beaconcha.in, Uniswap, and EigenExplorer.

**Query Parameters**:
- `address` (optional): Ethereum address (default: "0xabc...1234")

**Response**:
```json
{
  "address": "0xabc...1234",
  "timestamp": "2025-11-09T12:00:00Z",
  "methodology_version": "efi-risk-v2.0-real-data",
  "risk_score": {
    "score": 28,
    "grade": "Safe",
    "top_reasons": ["Low overall risk", "Strong operator performance"]
  },
  "tiles": {
    "operator_uptime": {
      "uptime_7d_pct": 99.3,
      "missed_attestations_7d": 12,
      "dvt_protected": true,
      "client_diversity_note": "Prysm(45%), Lighthouse(30%), Teku(15%), Nimbus(10%)"
    },
    "avs_concentration": {
      "largest_avs_pct": 46.2,
      "hhi": 0.29,
      "avs_split": [
        {"name": "EigenDA", "pct": 46.2},
        {"name": "Witness Chain", "pct": 30.9}
      ]
    },
    "slashing_proxy": {
      "proxy_score": 18,
      "inputs": {
        "operator_uptime_band": "Green",
        "client_diversity_band": "Amber",
        "dvt_presence": true,
        "avs_audit_status": "mixed"
      }
    },
    "liquidity_depth": {
      "health_index": 85,
      "reference_trade_usd": 10000,
      "chains": [
        {
          "chain": "Ethereum",
          "venue": "Uniswap V3",
          "pool": "weETH/WETH",
          "depth_usd": 5500000,
          "slippage_bps": 25,
          "est_total_fee_usd": 4.2
        }
      ],
      "recommended_chain": "Ethereum"
    }
  },
  "breakdown": {
    "distribution": {
      "base_stake_pct": 38.0,
      "restaked_pct": 62.0,
      "balanced_score": 75
    }
  }
}
```

**Data Sources**: Beaconcha.in, Uniswap Subgraph, EigenExplorer

---

#### POST `/api/portfolio-analysis-enhanced`
Comprehensive portfolio analysis with real-time prices, APY, risk metrics, and strategy recommendations.

**Request Body**:
```json
{
  "eth": 0.0,
  "eeth": 0.0,
  "weeth": 5.0,
  "liquid_usd": 1200.0
}
```

**Response**:
```json
{
  "total_value_usd": 16234.50,
  "assets": [
    {
      "name": "weETH",
      "balance": 5.0,
      "price_usd": 3246.90,
      "value_usd": 16234.50,
      "apy": 3.42,
      "annual_yield_usd": 555.22
    },
    {
      "name": "LiquidUSD",
      "balance": 1200.0,
      "price_usd": 1.0,
      "value_usd": 1200.0,
      "apy": 4.5,
      "annual_yield_usd": 54.0
    }
  ],
  "metrics": {
    "total_annual_yield_usd": 609.22,
    "average_apy": 3.5,
    "risk_score": 28,
    "risk_grade": "Safe",
    "liquidity_health": 85,
    "restaking_ratio": 62.0
  },
  "recommendations": [
    {
      "strategy": "Consider EigenLayer Restaking",
      "reason": "Boost APY from 3.4% to ~5-7% by restaking weETH",
      "risk_impact": "Moderate increase (adds AVS slashing risk)",
      "priority": "high"
    },
    {
      "strategy": "Diversify Across Chains",
      "reason": "Arbitrum offers 35 bps slippage vs 25 bps on Ethereum",
      "risk_impact": "Low (bridge risk only)",
      "priority": "medium"
    }
  ],
  "data_sources": ["DefiLlama", "Beaconcha.in", "Uniswap", "EigenExplorer"]
}
```

**Data Sources**: DefiLlama (prices/APY), Beaconcha.in (risk), Uniswap (liquidity), EigenExplorer (restaking)

---

#### POST `/api/ask-enhanced`
Enhanced chatbot with DeFi knowledge base and live market data.

**Request Body**:
```json
{
  "question": "What is eETH and how does it work?",
  "context": {
    "wallet_balance": 5.0,
    "product_focus": "eETH"
  },
  "include_market_data": true
}
```

**Response**:
```json
{
  "answer": "eETH is ether.fi's liquid staking token. When you stake ETH, you receive eETH which earns ~3.4% APY (current rate from DefiLlama). eETH is a rebasing token, meaning your balance grows automatically. You can use eETH in DeFi while still earning staking rewards. Key risks include smart contract risk and validator slashing risk (mitigated by DVT protection).\n\nEducational only — not financial advice.",
  "sources": ["DefiLlama", "ether.fi Documentation", "Beaconcha.in"],
  "market_data_included": true
}
```

**Features**:
- Claude Sonnet 4.5 AI
- Comprehensive DeFi knowledge base
- Live market data integration
- Automatic source attribution

---

#### GET `/api/prices`
Get current prices for all ether.fi products from DefiLlama.

**Response**:
```json
{
  "eETH": {"price": 3234.50, "timestamp": 1699545600},
  "weETH": {"price": 3246.90, "timestamp": 1699545600},
  "ETHFI": {"price": 2.45, "timestamp": 1699545600},
  "eBTC": {"price": 67890.00, "timestamp": 1699545600}
}
```

---

#### GET `/api/apy`
Get current APY rates from DefiLlama pools.

**Response**:
```json
{
  "eETH": {"apy": 3.42, "source": "native_staking"},
  "weETH": {"apy": 3.42, "source": "native_staking"},
  "ETHFI": {"apy": 0.0, "source": "governance_token"},
  "eBTC": {"apy": 2.15, "source": "btc_staking"}
}
```

---

#### POST `/api/forecast`
AI-powered price forecasting using Claude and historical data.

**Request Body**:
```json
{
  "product": "weETH",
  "days": 30
}
```

**Response**:
```json
{
  "product": "weETH",
  "current_price": 3246.90,
  "forecast_days": 30,
  "forecast": {
    "predicted_price": 3315.40,
    "confidence": "moderate",
    "reasoning": "Based on historical trends and current market conditions...",
    "risk_factors": ["Market volatility", "Ethereum network upgrades"]
  }
}
```

---

## Client Libraries

### 1. DefiLlama Client (`defillama_client.py`)

```python
from defillama_client import DefiLlamaClient

client = DefiLlamaClient()

# Get current prices
prices = await client.get_current_prices()
# Returns: {"eETH": 3234.50, "weETH": 3246.90, ...}

# Get APY data
apy_data = await client.get_apy_data()
# Returns: {"eETH": {"apy": 3.42, "tvl": 5000000000}, ...}
```

---

### 2. Beaconchain Client (`beaconchain_client.py`)

```python
from beaconchain_client import BeaconchainClient

client = BeaconchainClient(api_key="optional")

# Calculate uptime metrics
uptime = await client.calculate_uptime_metrics(days=7)
# Returns: {
#   "uptime_pct": 99.3,
#   "missed_attestations": 12,
#   "total_attestations": 2016
# }

# Get client diversity
diversity = await client.get_client_diversity()
# Returns: {
#   "consensus_clients": {"Prysm": 45, "Lighthouse": 30},
#   "diversity_score": 75
# }

# Check DVT protection
dvt = await client.check_dvt_protection()
# Returns: {"dvt_enabled": true, "dvt_provider": "SSV Network"}
```

---

### 3. Uniswap Client (`uniswap_client.py`)

```python
from uniswap_client import UniswapClient

client = UniswapClient()

# Get weETH pools on Ethereum
pools = await client.get_weeth_pools("ethereum")

# Calculate liquidity metrics
metrics = await client.calculate_liquidity_metrics("ethereum", 10000)
# Returns: {
#   "total_tvl_usd": 5500000,
#   "best_pool": {"slippage_bps": 25, "tvl_usd": 5500000}
# }

# Multi-chain comparison
all_chains = await client.get_multi_chain_liquidity(10000)
# Returns data for Ethereum, Arbitrum, Base
```

---

### 4. EigenExplorer Client (`eigenexplorer_client.py`)

```python
from eigenexplorer_client import EigenExplorerClient

client = EigenExplorerClient()

# Calculate AVS concentration
concentration = await client.calculate_avs_concentration()
# Returns: {
#   "largest_avs_pct": 46.2,
#   "hhi": 0.29,
#   "avs_split": [...]
# }

# Get restaking distribution
distribution = await client.get_restaking_distribution()
# Returns: {
#   "base_stake_pct": 38.0,
#   "restaked_pct": 62.0
# }

# Calculate slashing risk
risk = await client.calculate_slashing_risk_score(
    operator_uptime=99.5,
    client_diversity_score=75,
    dvt_enabled=True
)
# Returns: {"proxy_score": 18, "risk_level": "Very Low"}
```

---

### 5. Enhanced Portfolio Analyzer (`enhanced_portfolio_analyzer.py`)

```python
from enhanced_portfolio_analyzer import analyze_portfolio_with_real_data

result = await analyze_portfolio_with_real_data(
    eth_balance=0.0,
    eeth_balance=0.0,
    weeth_balance=5.0,
    liquid_usd_balance=1200.0
)

print(f"Total Value: ${result['total_value_usd']:,.2f}")
print(f"Risk Grade: {result['metrics']['risk_grade']}")
```

---

### 6. Enhanced Chatbot (`enhanced_chatbot.py`)

```python
from enhanced_chatbot import EnhancedChatbot

chatbot = EnhancedChatbot(api_key="your-anthropic-key")

response = await chatbot.answer_question(
    question="What is eETH?",
    include_market_data=True
)

print(response.answer)
print(f"Sources: {', '.join(response.sources)}")
```

---

### 7. DeFi Knowledge Base (`defi_knowledge_base.py`)

```python
from defi_knowledge_base import DeFiKnowledgeBase

kb = DeFiKnowledgeBase()

# Get product info
eeth_info = kb.get_product_info("eETH")

# Get concept explanation
liquid_staking = kb.get_concept_info("liquid_staking")

# Search knowledge base
results = kb.search("restaking")

# Get live market data
market_data = await kb.get_live_market_data()
```

---

## Database Schema

### `prices` Table
Stores historical price data.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| product | STRING(20) | Product name (eETH, weETH, etc.) |
| price_usd | FLOAT | Price in USD |
| timestamp | BIGINT | Unix timestamp |
| source | STRING(50) | Data source |
| created_at | DATETIME | Record creation time |

**Indexes**: `product`, `timestamp`

---

### `apy_data` Table
Stores historical APY data.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| product | STRING(20) | Product name |
| apy | FLOAT | APY percentage |
| timestamp | BIGINT | Unix timestamp |
| source | STRING(50) | Data source |
| created_at | DATETIME | Record creation time |

**Indexes**: `product`, `timestamp`

---

### `market_metrics` Table
Stores general market metrics.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| metric_name | STRING(50) | Metric name |
| value | FLOAT | Metric value |
| extra_data | TEXT | Additional JSON data |
| timestamp | BIGINT | Unix timestamp |
| created_at | DATETIME | Record creation time |

**Indexes**: `metric_name`, `timestamp`

---

### `forecasts` Table
Stores AI-generated forecasts.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| product | STRING(20) | Product name |
| forecast_days | INTEGER | Days forecasted |
| predicted_price | FLOAT | Predicted price |
| confidence | STRING(20) | Confidence level |
| reasoning | TEXT | AI reasoning |
| timestamp | BIGINT | Unix timestamp |
| created_at | DATETIME | Record creation time |

**Indexes**: `product`, `timestamp`

---

## Setup & Configuration

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Anthropic API Key (required for AI features)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Database URL (optional, defaults to SQLite)
DATABASE_URL=sqlite:///./etherfi_data.db

# Beaconcha.in API Key (optional, for higher rate limits)
BEACONCHAIN_API_KEY=your-key-here
```

### 3. Initialize Database

```bash
cd backend
python database.py
```

### 4. Start Backend Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

---

## Testing

### Unit Tests

```bash
# Test individual clients
python defillama_client.py
python beaconchain_client.py
python uniswap_client.py
python eigenexplorer_client.py
```

### Integration Tests

```bash
# Full test suite
python test_real_apis.py

# Quick test
python test_real_apis.py quick
```

### API Endpoint Tests

```powershell
# Test endpoints
curl http://localhost:8000/api/prices
curl http://localhost:8000/api/risk-analysis-enhanced

# Test POST endpoints
curl -X POST http://localhost:8000/api/portfolio-analysis-enhanced `
  -H "Content-Type: application/json" `
  -d '{\"weeth\": 5, \"liquid_usd\": 1200}'
```

---

## Troubleshooting

### 404 Not Found Error

**Fix**:
```powershell
# Kill all Python processes
Get-Process python* | Stop-Process -Force

# Restart backend
cd backend
uvicorn main:app --reload --port 8000
```

### Unicode Encoding Error

Already fixed - all unicode characters removed from code.

### Anthropic API Key Missing

Add to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Rate Limit Exceeded

Get free API key from Beaconcha.in and add to `.env`.

---

## Cost Analysis

### FREE APIs
- DefiLlama: FREE
- Beaconcha.in: FREE (with API key)
- Uniswap Subgraph: FREE
- EigenExplorer: FREE

**Total: $0/month**

### PAID APIs
- Anthropic Claude: $5-20/month (only if using AI features)

---

## Security Notes

1. Never commit API keys to git
2. Use `.env` files for secrets
3. Implement rate limiting in production
4. Use HTTPS in production

---

**Last Updated**: November 9, 2025
**Version**: 2.0
