from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import math, json, os
from etherfi_service import get_live_rates, get_historical_prices, get_apy_history

APP_ORIGIN = os.getenv("APP_ORIGIN", "http://localhost:8080")

app = FastAPI(title="eFi Navigator API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------
class WalletBalances(BaseModel):
    ETH: float = 0.0
    eETH: float = 0.0
    weETH: float = 5.0
    LiquidUSD: float = 1200.0

class Assumptions(BaseModel):
    apyStake: float = float(os.getenv("DEFAULT_APY_STAKE", 0.04))
    apyLiquidUsd: float = float(os.getenv("DEFAULT_APY_LIQUID_USD", 0.10))
    borrowRate: float = float(os.getenv("DEFAULT_BORROW_RATE", 0.05))
    ltvWeeth: float = float(os.getenv("DEFAULT_LTV_WEETH", 0.50))

class AskReq(BaseModel):
    q: str
    context: Optional[dict] = None

class AskResp(BaseModel):
    answer: str

class Strategy(BaseModel):
    name: str
    apy: float
    yearlyEth: float
    steps: List[str]
    risks: List[str]

class SimReq(BaseModel):
    balances: WalletBalances
    assumptions: Assumptions

class SimResp(BaseModel):
    blendedApy: float
    risk: str
    strategies: List[Strategy]

class ForecastPoint(BaseModel):
    month: int
    value: float

class ForecastResp(BaseModel):
    historical: List[ForecastPoint]
    projection: List[ForecastPoint]

class AssetPerformance(BaseModel):
    asset: str
    historical: List[ForecastPoint]
    projection: List[ForecastPoint]
    apy: float
    currentValue: float

class MultiAssetForecastResp(BaseModel):
    assets: List[AssetPerformance]
    totalValue: List[ForecastPoint]
    allocation: dict  # asset -> percentage

class CorrelationMatrix(BaseModel):
    assets: List[str]
    matrix: List[List[float]]  # correlation coefficients

# ---------- Helpers ----------
def eth_eq(usd: float, eth_price: float = 3500.0) -> float:
    return (usd or 0.0) / eth_price

def blended_apy(weeth: float, lusd: float, a: Assumptions) -> float:
    w = weeth or 0.0
    u = eth_eq(lusd)
    tot = (w + u) or 1.0
    return (w/tot)*a.apyStake + (u/tot)*a.apyLiquidUsd

def risk_badge(weeth: float, lusd: float) -> str:
    tot = (weeth or 0.0) + eth_eq(lusd or 0.0)
    conc = (weeth / tot) if tot else 0
    return "High" if conc > 0.8 else "Medium" if conc > 0.5 else "Low"

def build_strategies(eth_notional: float, a: Assumptions) -> List[Strategy]:
    base = (eth_notional or 0.0)*a.apyStake
    extra = (eth_notional or 0.0)*a.ltvWeeth*max(0.0, a.apyLiquidUsd - a.borrowRate)
    return [
        Strategy(
            name="Conservative",
            apy=a.apyStake,
            yearlyEth=base,
            steps=["Hold weETH/eETH", "Optionally park stables in Liquid USD"],
            risks=["Smart-contract", "Protocol"]
        ),
        Strategy(
            name="Active",
            apy=(base + extra)/max(eth_notional, 1e-9),
            yearlyEth=base + extra,
            steps=["Supply weETH","Borrow stables (≤50% LTV)","Deposit to Liquid USD"],
            risks=["Liquidation","Rate changes","Smart-contract"]
        )
    ]

# ---------- Routes ----------
@app.get("/health")
def health():
    return {"status":"ok"}

@app.post("/api/simulate", response_model=SimResp)
def simulate(body: SimReq):
    a, b = body.assumptions, body.balances
    b_apy = blended_apy(b.weETH, b.LiquidUSD, a)
    risk = risk_badge(b.weETH, b.LiquidUSD)
    strats = build_strategies(b.weETH, a)
    return SimResp(blendedApy=b_apy, risk=risk, strategies=strats)

@app.get("/api/forecast", response_model=ForecastResp)
def forecast(principal: float = 5.0, apy: float = 0.05, months: int = int(os.getenv("FORECAST_MONTHS", 12))):
    # mock historical as gentle slope of principal
    hist_vals = [principal*(0.92 + i*0.01) for i in range(12)]
    hist = [ForecastPoint(month=i-11, value=v) for i,v in enumerate(hist_vals)]
    m = (1+apy)**(1/12) - 1
    proj = [ForecastPoint(month=i+1, value=principal*((1+m)**(i+1))) for i in range(months)]
    return ForecastResp(historical=hist, projection=proj)

@app.get("/api/rates")
async def rates(live: bool = True):
    """Get APY rates - either live from EtherFi or demo static values"""
    if live:
        try:
            live_data = await get_live_rates()
            return live_data
        except Exception as e:
            print(f"Error fetching live rates, falling back to demo: {e}")
            # Fallback to demo
            a = Assumptions()
            return {**a.model_dump(), "source":"demo-fallback"}
    else:
        a = Assumptions()
        return {**a.model_dump(), "source":"demo-static"}

@app.post("/api/ask", response_model=AskResp)
def ask(body: AskReq):
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        return AskResp(answer="(demo) eETH/weETH are EtherFi staking tokens that earn rewards and remain usable in DeFi. Risk: smart-contract bugs. Educational only — not financial advice.")
    from anthropic import Anthropic
    client = Anthropic(api_key=key)
    ctx = f"Context: {body.context}" if body.context else ""
    prompt = f"{ctx}\nUser: {body.q}\nAnswer in 2–4 short sentences, include one relevant risk, educational only."
    msg = client.messages.create(
        model="claude-3-5-sonnet-latest",
        max_tokens=300, temperature=0.2,
        system="You are a friendly DeFi guide for EtherFi beginners. Be concise; avoid jargon.",
        messages=[{"role":"user","content":prompt}]
    )
    text = msg.content[0].text.strip() + "\n\nEducational only — not financial advice."
    return AskResp(answer=text)

@app.post("/api/multi-asset-forecast", response_model=MultiAssetForecastResp)
def multi_asset_forecast(body: SimReq, months: int = 12, eth_price: float = 3500.0):
    """Generate forecasts for all assets in the portfolio"""
    a, b = body.assumptions, body.balances

    # Define asset APYs and calculate current values in USD
    asset_data = {
        "ETH": {"balance": b.ETH, "apy": 0.0, "usd_value": b.ETH * eth_price},
        "eETH": {"balance": b.eETH, "apy": a.apyStake, "usd_value": b.eETH * eth_price},
        "weETH": {"balance": b.weETH, "apy": a.apyStake, "usd_value": b.weETH * eth_price},
        "LiquidUSD": {"balance": b.LiquidUSD, "apy": a.apyLiquidUsd, "usd_value": b.LiquidUSD},
    }

    # Calculate total portfolio value
    total_value = sum(d["usd_value"] for d in asset_data.values())

    # Build allocation percentages
    allocation = {
        asset: (data["usd_value"] / total_value * 100) if total_value > 0 else 0
        for asset, data in asset_data.items()
    }

    # Generate performance projections for each asset
    assets = []
    for asset_name, data in asset_data.items():
        if data["balance"] == 0:
            continue

        principal = data["usd_value"]
        apy = data["apy"]

        # Historical (mock gentle growth)
        hist_vals = [principal * (0.92 + i * 0.01) for i in range(12)]
        historical = [ForecastPoint(month=i-11, value=v) for i, v in enumerate(hist_vals)]

        # Projection with compound interest
        monthly_rate = (1 + apy) ** (1/12) - 1
        projection = [
            ForecastPoint(month=i+1, value=principal * ((1 + monthly_rate) ** (i+1)))
            for i in range(months)
        ]

        assets.append(AssetPerformance(
            asset=asset_name,
            historical=historical,
            projection=projection,
            apy=apy,
            currentValue=principal
        ))

    # Calculate total portfolio value over time
    total_hist = [ForecastPoint(month=i-11, value=0) for i in range(12)]
    total_proj = [ForecastPoint(month=i+1, value=0) for i in range(months)]

    for asset_perf in assets:
        for i, point in enumerate(asset_perf.historical):
            total_hist[i].value += point.value
        for i, point in enumerate(asset_perf.projection):
            total_proj[i].value += point.value

    return MultiAssetForecastResp(
        assets=assets,
        totalValue=total_hist + total_proj,
        allocation=allocation
    )

@app.get("/api/correlation-matrix", response_model=CorrelationMatrix)
def correlation_matrix():
    """Return mock correlation matrix for DeFi assets"""
    # Mock correlation data (in reality, would calculate from historical prices)
    assets = ["ETH", "eETH", "weETH", "LiquidUSD", "WBTC", "LiquidBTC"]

    # Correlation matrix (symmetric)
    # ETH derivatives highly correlated, stablecoins low correlation, BTC moderate
    matrix = [
        [1.00, 0.98, 0.98, 0.05, 0.65, 0.64],  # ETH
        [0.98, 1.00, 0.99, 0.05, 0.64, 0.63],  # eETH
        [0.98, 0.99, 1.00, 0.05, 0.64, 0.63],  # weETH
        [0.05, 0.05, 0.05, 1.00, 0.03, 0.04],  # LiquidUSD
        [0.65, 0.64, 0.64, 0.03, 1.00, 0.98],  # WBTC
        [0.64, 0.63, 0.63, 0.04, 0.98, 1.00],  # LiquidBTC
    ]

    return CorrelationMatrix(assets=assets, matrix=matrix)

@app.get("/api/live-metrics")
async def live_metrics():
    """Get live EtherFi metrics: TVL, APY, ETH price, etc."""
    try:
        data = await get_live_rates()
        return data
    except Exception as e:
        return {
            "error": str(e),
            "source": "error",
            "message": "Failed to fetch live metrics. Using demo data."
        }

@app.get("/api/historical-prices")
async def historical_prices(asset: str = "ETH", days: int = 30):
    """Get historical price data for an asset"""
    try:
        data = await get_historical_prices(asset, days)
        return {"asset": asset, "days": days, "data": data}
    except Exception as e:
        return {"error": str(e), "data": []}

@app.get("/api/apy-history")
async def apy_history(days: int = 30):
    """Get historical APY data"""
    try:
        data = await get_apy_history(days)
        return {"days": days, "data": data}
    except Exception as e:
        return {"error": str(e), "data": []}
