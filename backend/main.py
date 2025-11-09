from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import math, json, os
import httpx
from etherfi_service import get_live_rates, get_historical_prices, get_apy_history

# Import new modules
try:
    from database import init_db
    from api_endpoints import router as v2_router
    DB_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Database features not available: {e}")
    DB_AVAILABLE = False

# Import enhanced risk analysis with real APIs
try:
    from enhanced_risk_analysis import get_enhanced_risk_analysis
    ENHANCED_RISK_AVAILABLE = True
    print("Enhanced risk analysis with real API data enabled")
except ImportError as e:
    print(f"Info: Enhanced risk analysis not available: {e}")
    print("  Using legacy risk analysis with mock data")
    ENHANCED_RISK_AVAILABLE = False

APP_ORIGIN = os.getenv("APP_ORIGIN", "http://localhost:8080")

app = FastAPI(
    title="eFi Navigator API",
    description="Enhanced API with live data, historical tracking, and AI forecasting",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    if DB_AVAILABLE:
        try:
            init_db()
            print("Database initialized successfully")
        except Exception as e:
            print(f"Warning: Database initialization failed: {e}")
    else:
        print("Running in legacy mode without database features")

# Include v2 API routes
if DB_AVAILABLE:
    app.include_router(v2_router)

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

class PriceForecastRequest(BaseModel):
    product: str
    days: int = 30

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

# ========= Risk Analysis Models =========
class OperatorUptimeData(BaseModel):
    uptime_7d_pct: float
    missed_attestations_7d: int
    dvt_protected: bool
    client_diversity_note: str

class AVSConcentrationData(BaseModel):
    largest_avs_pct: float
    hhi: float
    avs_split: List[Dict[str, Any]]

class SlashingProxyInputs(BaseModel):
    operator_uptime_band: str
    historical_slashes_count: int
    avs_audit_status: str
    client_diversity_band: str
    dvt_presence: bool

class SlashingProxyData(BaseModel):
    proxy_score: int
    inputs: SlashingProxyInputs

class LiquidityChainData(BaseModel):
    chain: str
    venue: str
    pool: str
    depth_usd: float
    slippage_bps: int
    est_total_fee_usd: float

class LiquidityDepthData(BaseModel):
    health_index: int
    reference_trade_usd: int
    chains: List[LiquidityChainData]
    recommended_chain: Optional[str] = None

class TilesData(BaseModel):
    operator_uptime: OperatorUptimeData
    avs_concentration: AVSConcentrationData
    slashing_proxy: SlashingProxyData
    liquidity_depth: LiquidityDepthData

class DistributionData(BaseModel):
    base_stake_pct: float
    restaked_pct: float
    balanced_score: int

class BreakdownData(BaseModel):
    distribution: DistributionData

class RiskScoreData(BaseModel):
    score: int
    grade: str
    top_reasons: List[str]

class RiskAnalysisResponse(BaseModel):
    address: str
    timestamp: str
    methodology_version: str
    risk_score: RiskScoreData
    tiles: TilesData
    breakdown: BreakdownData

# ========= Risk Analysis Helpers =========
async def fetch_json_safe(client: httpx.AsyncClient, url: str, method: str = "GET", json_data: Optional[Dict] = None) -> Dict[str, Any]:
    """Safely fetch JSON data with error handling"""
    try:
        if method == "POST":
            r = await client.post(url, json=json_data, timeout=15)
        else:
            r = await client.get(url, timeout=15)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return {}

async def get_operator_metrics(client: httpx.AsyncClient, validator_index: Optional[str] = None) -> Dict[str, Any]:
    """Fetch operator/validator metrics from Rated Network or similar service"""
    # Placeholder - replace with actual Rated API endpoint
    rated_api_key = os.getenv("RATED_API_KEY", "")
    if not rated_api_key or not validator_index:
        # Return mock data for demo
        return {
            "uptime": 99.3,
            "missed_attestations": 12,
            "client": "Prysm(70%), Lighthouse(30%)",
            "dvt_protected": True
        }

    # Actual API call would go here
    headers = {"Authorization": f"Bearer {rated_api_key}"} if rated_api_key else {}
    url = f"https://api.rated.network/v0/eth/validators/{validator_index}"
    try:
        r = await client.get(url, headers=headers, timeout=15)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"Error fetching operator metrics: {e}")
        return {}

async def get_liquidity_metrics(client: httpx.AsyncClient, token_address: Optional[str] = None) -> List[LiquidityChainData]:
    """Fetch liquidity metrics from various DEXes"""
    # Placeholder - in production, query Uniswap/Curve/Aerodrome subgraphs
    # For now, return realistic mock data
    return [
        LiquidityChainData(
            chain="Base",
            venue="Aerodrome",
            pool="weETH/WETH",
            depth_usd=8200000.0,
            slippage_bps=18,
            est_total_fee_usd=3.1
        ),
        LiquidityChainData(
            chain="Arbitrum",
            venue="UniswapV3",
            pool="weETH/WETH",
            depth_usd=1100000.0,
            slippage_bps=74,
            est_total_fee_usd=7.9
        ),
        LiquidityChainData(
            chain="Ethereum",
            venue="Curve",
            pool="weETH/WETH",
            depth_usd=5500000.0,
            slippage_bps=25,
            est_total_fee_usd=4.2
        )
    ]

def calculate_risk_score(operator_uptime: float, avs_concentration: float, slashing_score: int, liquidity_health: int) -> tuple[int, str, List[str]]:
    """Calculate overall risk score and grade"""
    # Weighted risk calculation
    uptime_risk = max(0, 100 - operator_uptime) * 2  # Higher weight on uptime issues
    concentration_risk = min(avs_concentration, 100) * 0.5  # AVS concentration
    slashing_risk = slashing_score * 0.3
    liquidity_risk = max(0, 100 - liquidity_health) * 0.3

    # Overall score (0-100, lower is better/safer)
    score = int(uptime_risk + concentration_risk + slashing_risk + liquidity_risk)
    score = max(0, min(100, score))  # Clamp between 0-100

    # Determine grade
    if score < 35:
        grade = "Safe"
    elif score < 65:
        grade = "Moderate"
    else:
        grade = "High"

    # Generate top reasons based on metrics
    reasons = []
    if avs_concentration > 50:
        reasons.append(f"High AVS concentration ({avs_concentration:.0f}%)")
    if liquidity_health < 70:
        reasons.append(f"Moderate liquidity depth (health index: {liquidity_health})")
    if operator_uptime < 99.5:
        reasons.append(f"Operator uptime below optimal ({operator_uptime:.1f}%)")
    if slashing_score > 30:
        reasons.append(f"Elevated slashing risk score ({slashing_score})")

    if not reasons:
        reasons = ["Low overall risk across all metrics", "Strong operator performance", "Well-diversified AVS allocation"]

    return score, grade, reasons[:3]  # Return top 3 reasons

def calculate_liquidity_health_index(liquidity_data: List[LiquidityChainData]) -> int:
    """Calculate liquidity health index (0-100)"""
    if not liquidity_data:
        return 50  # Neutral

    total_depth = sum(chain.depth_usd for chain in liquidity_data)
    avg_slippage = sum(chain.slippage_bps for chain in liquidity_data) / len(liquidity_data)

    # Health based on depth and slippage
    depth_score = min(100, (total_depth / 10_000_000) * 100)  # $10M = 100
    slippage_score = max(0, 100 - avg_slippage)  # Lower slippage = better

    health_index = int((depth_score * 0.6 + slippage_score * 0.4))
    return max(0, min(100, health_index))

# ========= Risk Analysis Endpoint =========
@app.get("/api/risk-analysis", response_model=RiskAnalysisResponse)
async def risk_analysis(address: str = "0xabc...1234", validator_index: Optional[str] = None):
    """
    Get comprehensive risk analysis for a portfolio.
    Returns data in the format expected by ForecastTab.tsx
    """
    from datetime import datetime, timezone

    async with httpx.AsyncClient() as client:
        # Fetch operator metrics
        operator_stats = await get_operator_metrics(client, validator_index)

        # Fetch liquidity metrics
        liquidity_chains = await get_liquidity_metrics(client)

    # Build operator uptime data
    operator_uptime_pct = operator_stats.get("uptime", 99.3)
    operator_uptime = OperatorUptimeData(
        uptime_7d_pct=operator_uptime_pct,
        missed_attestations_7d=operator_stats.get("missed_attestations", 12),
        dvt_protected=operator_stats.get("dvt_protected", True),
        client_diversity_note=operator_stats.get("client", "Prysm(70%), Lighthouse(30%)")
    )

    # Build AVS concentration data
    # TODO: Replace with actual AVS registry data
    avs_split = [
        {"name": "DataAvail", "pct": 46.0},
        {"name": "Oracles", "pct": 31.0},
        {"name": "Storage", "pct": 23.0}
    ]
    largest_avs_pct = max([avs["pct"] for avs in avs_split]) if avs_split else 0
    avs_concentration = AVSConcentrationData(
        largest_avs_pct=largest_avs_pct,
        hhi=0.29,  # Herfindahl-Hirschman Index
        avs_split=avs_split
    )

    # Build slashing proxy data
    uptime_band = "Green" if operator_uptime_pct > 99.5 else "Amber" if operator_uptime_pct > 99.0 else "Red"
    slashing_inputs = SlashingProxyInputs(
        operator_uptime_band=uptime_band,
        historical_slashes_count=0,
        avs_audit_status="Mixed",
        client_diversity_band="Amber",
        dvt_presence=True
    )

    # Calculate slashing proxy score (0-100, lower is better)
    slashing_score = 18  # Base score
    if operator_uptime_pct < 99.5:
        slashing_score += 10
    if operator_uptime_pct < 99.0:
        slashing_score += 15
    slashing_score = min(100, slashing_score)

    slashing_proxy = SlashingProxyData(
        proxy_score=slashing_score,
        inputs=slashing_inputs
    )

    # Build liquidity depth data
    health_index = calculate_liquidity_health_index(liquidity_chains)
    best_chain = min(liquidity_chains, key=lambda x: x.slippage_bps) if liquidity_chains else None

    liquidity_depth = LiquidityDepthData(
        health_index=health_index,
        reference_trade_usd=10000,
        chains=liquidity_chains,
        recommended_chain=best_chain.chain if best_chain else None
    )

    # Calculate overall risk score
    risk_score_value, grade, top_reasons = calculate_risk_score(
        operator_uptime_pct,
        largest_avs_pct,
        slashing_score,
        health_index
    )

    risk_score = RiskScoreData(
        score=risk_score_value,
        grade=grade,
        top_reasons=top_reasons
    )

    # Build tiles
    tiles = TilesData(
        operator_uptime=operator_uptime,
        avs_concentration=avs_concentration,
        slashing_proxy=slashing_proxy,
        liquidity_depth=liquidity_depth
    )

    # Build breakdown (distribution)
    # TODO: Calculate from actual wallet data
    distribution = DistributionData(
        base_stake_pct=38.0,
        restaked_pct=62.0,
        balanced_score=66
    )

    breakdown = BreakdownData(
        distribution=distribution
    )

    # Build final response
    return RiskAnalysisResponse(
        address=address,
        timestamp=datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        methodology_version="efi-risk-v1.2",
        risk_score=risk_score,
        tiles=tiles,
        breakdown=breakdown
    )

# ========= Enhanced Risk Analysis Endpoint with Real APIs =========
@app.get("/api/risk-analysis-enhanced")
async def risk_analysis_enhanced(address: str = "0xabc...1234"):
    """
    Enhanced risk analysis using REAL data from:
    - Beaconcha.in: Validator uptime & performance
    - Uniswap Subgraph: Liquidity depth & slippage
    - EigenExplorer: AVS concentration & restaking distribution

    Falls back to legacy endpoint if enhanced features unavailable
    """
    if ENHANCED_RISK_AVAILABLE:
        try:
            return await get_enhanced_risk_analysis(address)
        except Exception as e:
            print(f"Error in enhanced risk analysis: {e}")
            print("Falling back to legacy risk analysis")
            # Fall through to legacy endpoint

    # Fallback to legacy endpoint
    return await risk_analysis(address)


# ========= Enhanced Portfolio Analysis Endpoint =========
@app.post("/api/portfolio-analysis-enhanced")
async def portfolio_analysis_enhanced(
    eth: float = 0.0,
    eeth: float = 0.0,
    weeth: float = 5.0,
    liquid_usd: float = 1200.0
):
    """
    Enhanced portfolio analysis using REAL data from all APIs:
    - DefiLlama: Current prices & APY
    - Beaconcha.in: Validator risk metrics
    - Uniswap Subgraph: Liquidity depth & slippage
    - EigenExplorer: Restaking distribution

    Returns comprehensive portfolio analysis with strategy recommendations
    """
    try:
        from enhanced_portfolio_analyzer import analyze_portfolio_with_real_data
        result = await analyze_portfolio_with_real_data(eth, eeth, weeth, liquid_usd)
        return result
    except ImportError:
        return {
            "error": "Enhanced portfolio analyzer not available",
            "message": "Please ensure enhanced_portfolio_analyzer.py is present"
        }
    except Exception as e:
        print(f"Error in enhanced portfolio analysis: {e}")
        return {
            "error": "Portfolio analysis failed",
            "message": str(e)
        }


# ========= Enhanced Chatbot Endpoint =========
@app.post("/api/ask-enhanced")
async def ask_enhanced(
    question: str,
    context: Optional[Dict[str, Any]] = None,
    include_market_data: bool = True
):
    """
    Enhanced chatbot endpoint with DeFi knowledge base and live market data.

    Uses Claude AI with:
    - Comprehensive DeFi product knowledge (eETH, weETH, ETHFI, eBTC)
    - Live market data from all APIs
    - Risk and strategy knowledge
    - DeFi concept explanations

    Args:
        question: User's question
        context: Optional additional context (wallet balance, etc.)
        include_market_data: Whether to include live market data in response

    Returns:
        ChatResponse with answer, sources, and market data flag
    """
    try:
        from enhanced_chatbot import ask_chatbot
        result = await ask_chatbot(question, context)
        return result
    except ImportError:
        return {
            "error": "Enhanced chatbot not available",
            "message": "Please ensure enhanced_chatbot.py and defi_knowledge_base.py are present"
        }
    except Exception as e:
        print(f"Error in enhanced chatbot: {e}")
        return {
            "error": "Chatbot query failed",
            "message": str(e),
            "answer": "I'm having trouble answering your question right now. Please try again later.",
            "sources": [],
            "market_data_included": False
        }


# ========= Real-Time Price Endpoints =========
@app.get("/api/prices")
async def get_prices():
    """
    Get current prices for all ether.fi products from DefiLlama.

    Returns real-time prices with timestamps.
    """
    try:
        from defillama_client import DefiLlamaClient

        client = DefiLlamaClient()
        prices = await client.get_current_prices()

        # Format response to match frontend expectations
        return {
            "eETH": {"price": prices.get("eETH", 3500), "timestamp": int(prices.get("timestamp", 0))},
            "weETH": {"price": prices.get("weETH", 3500), "timestamp": int(prices.get("timestamp", 0))},
            "ETHFI": {"price": prices.get("ETHFI", 2.5), "timestamp": int(prices.get("timestamp", 0))},
            "eBTC": {"price": prices.get("eBTC", 68000), "timestamp": int(prices.get("timestamp", 0))}
        }
    except Exception as e:
        print(f"Error fetching prices: {e}")
        # Return fallback prices
        import time
        return {
            "eETH": {"price": 3500, "timestamp": int(time.time())},
            "weETH": {"price": 3500, "timestamp": int(time.time())},
            "ETHFI": {"price": 2.5, "timestamp": int(time.time())},
            "eBTC": {"price": 68000, "timestamp": int(time.time())}
        }


@app.get("/api/apy")
async def get_apy_rates():
    """
    Get current APY rates for all ether.fi products from DefiLlama pools.

    Returns APY rates with source attribution.
    """
    try:
        from defillama_client import DefiLlamaClient

        client = DefiLlamaClient()
        apy_data = await client.get_all_apys()

        # Format response to match frontend expectations
        return {
            "eETH": {
                "apy": apy_data.get("eETH", {}).get("apy_total", 3.5),
                "source": "defillama"
            },
            "weETH": {
                "apy": apy_data.get("weETH", {}).get("apy_total", 3.5),
                "source": "defillama"
            },
            "ETHFI": {
                "apy": apy_data.get("ETHFI", {}).get("apy_total", 0.0),
                "source": "governance_token"
            },
            "eBTC": {
                "apy": apy_data.get("eBTC", {}).get("apy_total", 2.0),
                "source": "btc_staking"
            }
        }
    except Exception as e:
        print(f"Error fetching APY: {e}")
        # Return fallback APY
        return {
            "eETH": {"apy": 3.5, "source": "fallback"},
            "weETH": {"apy": 3.5, "source": "fallback"},
            "ETHFI": {"apy": 0.0, "source": "governance_token"},
            "eBTC": {"apy": 2.0, "source": "fallback"}
        }


@app.post("/api/price-forecast")
async def price_forecast(request: PriceForecastRequest):
    """
    AI-powered price forecasting using Claude and historical data.

    Args:
        request: PriceForecastRequest with product name and forecast days

    Returns:
        Forecast data with predicted price, confidence, reasoning, and risk factors
    """
    product = request.product
    days = request.days
    
    try:
        # Get current price
        from defillama_client import DefiLlamaClient

        client = DefiLlamaClient()
        prices = await client.get_current_prices()
        
        # Extract price from double-nested structure: prices[product]["price"]["price"]
        price_data = prices.get(product, {})
        if isinstance(price_data, dict) and "price" in price_data:
            inner_price_data = price_data.get("price", {})
            if isinstance(inner_price_data, dict):
                current_price = inner_price_data.get("price")
            else:
                current_price = inner_price_data
        else:
            current_price = None
        
        # Fallback to default prices if not found
        if current_price is None or current_price == 0:
            default_prices = {
                "eETH": 3500,
                "weETH": 3500,
                "ETHFI": 2.5,
                "eBTC": 68000
            }
            current_price = default_prices.get(product, 3500)

        # Try to use AI forecasting
        try:
            from anthropic import Anthropic
            import os

            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY not set")

            anthropic_client = Anthropic(api_key=api_key)

            # Build prompt for Claude
            prompt = f"""Analyze the price forecast for {product} over the next {days} days.

Current price: ${current_price}

Product context:
- eETH: ether.fi liquid staking token (rebasing), tracks ETH price
- weETH: Wrapped eETH (non-rebasing), typically ~1-3% premium over ETH
- ETHFI: ether.fi governance token
- eBTC: ether.fi BTC liquid staking token

Provide a {days}-day price forecast with:
1. Predicted price (realistic estimate)
2. Confidence level (high/moderate/low)
3. Brief reasoning (2-3 sentences)
4. Key risk factors (2-3 items)

Format your response as JSON:
{{
  "predicted_price": <number>,
  "confidence": "<high|moderate|low>",
  "reasoning": "<brief analysis>",
  "risk_factors": ["<factor1>", "<factor2>"]
}}"""

            response = anthropic_client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=500,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )

            # Parse response
            import json
            forecast_text = response.content[0].text.strip()

            # Extract JSON from response (Claude might wrap it in markdown)
            if "```json" in forecast_text:
                forecast_text = forecast_text.split("```json")[1].split("```")[0].strip()
            elif "```" in forecast_text:
                forecast_text = forecast_text.split("```")[1].split("```")[0].strip()

            forecast_data = json.loads(forecast_text)

            return {
                "product": product,
                "current_price": current_price,
                "forecast_days": days,
                "forecast": {
                    "predicted_price": forecast_data.get("predicted_price", current_price * 1.02),
                    "confidence": forecast_data.get("confidence", "moderate"),
                    "reasoning": forecast_data.get("reasoning", "AI forecast based on market trends"),
                    "risk_factors": forecast_data.get("risk_factors", ["Market volatility", "Regulatory changes"])
                },
                "historical_data": []
            }

        except Exception as ai_error:
            print(f"AI forecasting error: {ai_error}")
            # Return simple trend-based forecast
            predicted_price = current_price * 1.02  # Simple 2% increase

            return {
                "product": product,
                "current_price": current_price,
                "forecast_days": days,
                "forecast": {
                    "predicted_price": predicted_price,
                    "confidence": "low",
                    "reasoning": f"Simple trend-based forecast (AI unavailable). {product} predicted to follow market trends.",
                    "risk_factors": [
                        "Market volatility",
                        "Ethereum network changes",
                        "Regulatory uncertainty"
                    ]
                },
                "historical_data": []
            }

    except Exception as e:
        print(f"Error in price forecast: {e}")
        return {
            "error": "Forecast generation failed",
            "message": str(e)
        }
