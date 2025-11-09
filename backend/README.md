# EtherFi Buddy - Backend API

FastAPI backend providing 4 endpoints for the EtherFi Buddy application.

## Setup

### 1. Create Python virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key (optional):

```
ANTHROPIC_API_KEY=your_key_here
```

If you leave `ANTHROPIC_API_KEY` blank, the `/api/ask` endpoint will return demo responses.

### 4. Run the server

```bash
# From the backend directory
uvicorn main:app --reload --port 8000

# Or from the root directory
cd backend
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, view the interactive API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

### GET /health
Health check endpoint
```json
{"status": "ok"}
```

### POST /api/simulate
Calculate blended APY, risk, and strategies based on wallet balances
```json
{
  "balances": {
    "ETH": 0.2,
    "eETH": 0.0,
    "weETH": 5.0,
    "LiquidUSD": 1200.0
  },
  "assumptions": {
    "apyStake": 0.04,
    "apyLiquidUsd": 0.10,
    "borrowRate": 0.05,
    "ltvWeeth": 0.50
  }
}
```

### GET /api/forecast
Get historical and projected portfolio growth
```
GET /api/forecast?principal=5.0&apy=0.05&months=12
```

### GET /api/rates
Get current APY rates and assumptions
```json
{
  "apyStake": 0.04,
  "apyLiquidUsd": 0.10,
  "borrowRate": 0.05,
  "ltvWeeth": 0.50,
  "source": "demo-static"
}
```

### POST /api/ask
Ask Claude about EtherFi products (requires ANTHROPIC_API_KEY)
```json
{
  "q": "Explain Liquid USD to a beginner",
  "context": {"product": "Liquid USD"}
}
```

## Development

The server runs with auto-reload enabled by default. Any changes to `main.py` will automatically restart the server.

## CORS Configuration

The API is configured to accept requests from `http://localhost:8080` (Vite dev server). To change this, update the `APP_ORIGIN` environment variable in `.env`.
