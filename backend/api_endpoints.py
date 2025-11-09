"""
Enhanced API endpoints for ether.fi data
Integrates with DefiLlama, database storage, and AI forecasting
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel

from database import get_db, PriceHistory, APYHistory, PriceForecast
from defillama_client import DefiLlamaClient, ETHERFI_CONTRACTS
from ai_forecasting import ClaudeForecastingService


router = APIRouter(prefix="/api/v2", tags=["ether.fi data"])


# ========= Response Models =========

class PricePoint(BaseModel):
    timestamp: int
    date: str
    price: float
    confidence: Optional[float] = None


class APYPoint(BaseModel):
    timestamp: int
    date: str
    apy_base: Optional[float]
    apy_reward: Optional[float]
    apy_total: Optional[float]
    tvl_usd: Optional[float]


class LivePrice(BaseModel):
    product: str
    price: float
    symbol: str
    timestamp: int
    confidence: Optional[float]
    source: str = "defillama"


class LiveAPY(BaseModel):
    product: str
    apy_base: float
    apy_reward: float
    apy_total: float
    tvl_usd: float
    chain: str


class HistoricalDataResponse(BaseModel):
    product: str
    data_points: int
    start_date: str
    end_date: str
    prices: List[PricePoint]


class APYHistoryResponse(BaseModel):
    product: str
    data_points: int
    start_date: str
    end_date: str
    apy_data: List[APYPoint]


class ForecastResponse(BaseModel):
    product: str
    generated_at: str
    model: str
    forecast: Dict[str, Any]
    reasoning: str
    confidence: float


class ProductSummary(BaseModel):
    product: str
    current_price: Optional[float]
    price_change_24h: Optional[float]
    price_change_7d: Optional[float]
    current_apy: Optional[float]
    tvl_usd: Optional[float]
    last_updated: str


# ========= Endpoints =========

@router.get("/prices/live", response_model=List[LivePrice])
async def get_live_prices():
    """Get live prices for all ether.fi products from DefiLlama"""
    client = DefiLlamaClient()
    prices = await client.get_current_prices()

    result = []
    for product, data in prices.items():
        if data.get("price"):
            result.append(LivePrice(
                product=product,
                price=data["price"],
                symbol=data.get("symbol", product),
                timestamp=data.get("timestamp", int(datetime.now().timestamp())),
                confidence=data.get("confidence")
            ))

    return result


@router.get("/prices/live/{product}", response_model=LivePrice)
async def get_live_price(product: str):
    """Get live price for a specific product"""
    product = product.upper()
    if product not in ETHERFI_CONTRACTS:
        raise HTTPException(status_code=404, detail=f"Product {product} not found")

    client = DefiLlamaClient()
    prices = await client.get_current_prices()

    if product not in prices:
        raise HTTPException(status_code=404, detail=f"Price data not available for {product}")

    data = prices[product]
    return LivePrice(
        product=product,
        price=data["price"],
        symbol=data.get("symbol", product),
        timestamp=data.get("timestamp", int(datetime.now().timestamp())),
        confidence=data.get("confidence")
    )


@router.get("/prices/historical/{product}", response_model=HistoricalDataResponse)
async def get_historical_prices(
    product: str,
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get historical price data from database"""
    product = product.upper()
    if product not in ETHERFI_CONTRACTS:
        raise HTTPException(status_code=404, detail=f"Product {product} not found")

    cutoff_timestamp = int((datetime.now() - timedelta(days=days)).timestamp())

    prices = db.query(PriceHistory).filter(
        PriceHistory.product == product,
        PriceHistory.timestamp >= cutoff_timestamp
    ).order_by(PriceHistory.timestamp.asc()).all()

    if not prices:
        raise HTTPException(status_code=404, detail=f"No historical data found for {product}")

    price_points = [
        PricePoint(
            timestamp=p.timestamp,
            date=datetime.fromtimestamp(p.timestamp).strftime("%Y-%m-%d %H:%M"),
            price=p.price,
            confidence=p.confidence
        )
        for p in prices
    ]

    return HistoricalDataResponse(
        product=product,
        data_points=len(price_points),
        start_date=price_points[0].date if price_points else "",
        end_date=price_points[-1].date if price_points else "",
        prices=price_points
    )


@router.get("/apy/live", response_model=List[LiveAPY])
async def get_live_apy():
    """Get live APY data for all ether.fi products from DefiLlama"""
    client = DefiLlamaClient()
    apy_data = await client.get_all_apys()

    result = []
    for product, data in apy_data.items():
        result.append(LiveAPY(
            product=product,
            apy_base=data.get("apy_base", 0),
            apy_reward=data.get("apy_reward", 0),
            apy_total=data.get("apy_total", 0),
            tvl_usd=data.get("tvl_usd", 0),
            chain=data.get("chain", "Ethereum")
        ))

    return result


@router.get("/apy/live/{product}", response_model=LiveAPY)
async def get_live_product_apy(product: str):
    """Get live APY for a specific product"""
    product = product.upper()
    if product not in ETHERFI_CONTRACTS:
        raise HTTPException(status_code=404, detail=f"Product {product} not found")

    client = DefiLlamaClient()
    apy_data = await client.get_apy_for_product(product)

    if not apy_data:
        raise HTTPException(status_code=404, detail=f"APY data not available for {product}")

    return LiveAPY(
        product=product,
        apy_base=apy_data.get("apy_base", 0),
        apy_reward=apy_data.get("apy_reward", 0),
        apy_total=apy_data.get("apy_total", 0),
        tvl_usd=apy_data.get("tvl_usd", 0),
        chain=apy_data.get("chain", "Ethereum")
    )


@router.get("/apy/historical/{product}", response_model=APYHistoryResponse)
async def get_apy_history(
    product: str,
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get historical APY data from database"""
    product = product.upper()
    if product not in ETHERFI_CONTRACTS:
        raise HTTPException(status_code=404, detail=f"Product {product} not found")

    cutoff_timestamp = int((datetime.now() - timedelta(days=days)).timestamp())

    apy_records = db.query(APYHistory).filter(
        APYHistory.product == product,
        APYHistory.timestamp >= cutoff_timestamp
    ).order_by(APYHistory.timestamp.asc()).all()

    if not apy_records:
        raise HTTPException(status_code=404, detail=f"No APY history found for {product}")

    apy_points = [
        APYPoint(
            timestamp=a.timestamp,
            date=datetime.fromtimestamp(a.timestamp).strftime("%Y-%m-%d %H:%M"),
            apy_base=a.apy_base,
            apy_reward=a.apy_reward,
            apy_total=a.apy_total,
            tvl_usd=a.tvl_usd
        )
        for a in apy_records
    ]

    return APYHistoryResponse(
        product=product,
        data_points=len(apy_points),
        start_date=apy_points[0].date if apy_points else "",
        end_date=apy_points[-1].date if apy_points else "",
        apy_data=apy_points
    )


@router.get("/forecast/{product}")
async def get_price_forecast(
    product: str,
    days: int = Query(default=90, ge=7, le=180),
    db: Session = Depends(get_db)
):
    """Generate AI-powered price forecast for a product"""
    product = product.upper()
    if product not in ETHERFI_CONTRACTS:
        raise HTTPException(status_code=404, detail=f"Product {product} not found")

    forecast_service = ClaudeForecastingService()
    forecast = await forecast_service.generate_forecast(product, days, db)

    if "error" in forecast:
        raise HTTPException(status_code=500, detail=forecast["error"])

    return forecast


@router.get("/summary/{product}", response_model=ProductSummary)
async def get_product_summary(product: str, db: Session = Depends(get_db)):
    """Get comprehensive summary for a product"""
    product = product.upper()
    if product not in ETHERFI_CONTRACTS:
        raise HTTPException(status_code=404, detail=f"Product {product} not found")

    # Get current price from DefiLlama
    client = DefiLlamaClient()
    live_prices = await client.get_current_prices()
    current_price = live_prices.get(product, {}).get("price")

    # Get price changes from database
    now = int(datetime.now().timestamp())
    day_ago = now - 86400
    week_ago = now - (86400 * 7)

    price_24h_ago = db.query(PriceHistory).filter(
        PriceHistory.product == product,
        PriceHistory.timestamp >= day_ago,
        PriceHistory.timestamp < day_ago + 3600
    ).first()

    price_7d_ago = db.query(PriceHistory).filter(
        PriceHistory.product == product,
        PriceHistory.timestamp >= week_ago,
        PriceHistory.timestamp < week_ago + 3600
    ).first()

    price_change_24h = None
    price_change_7d = None

    if current_price and price_24h_ago:
        price_change_24h = ((current_price - price_24h_ago.price) / price_24h_ago.price) * 100

    if current_price and price_7d_ago:
        price_change_7d = ((current_price - price_7d_ago.price) / price_7d_ago.price) * 100

    # Get current APY
    apy_data = await client.get_apy_for_product(product)
    current_apy = apy_data.get("apy_total") if apy_data else None
    tvl_usd = apy_data.get("tvl_usd") if apy_data else None

    return ProductSummary(
        product=product,
        current_price=current_price,
        price_change_24h=price_change_24h,
        price_change_7d=price_change_7d,
        current_apy=current_apy,
        tvl_usd=tvl_usd,
        last_updated=datetime.now().isoformat()
    )


@router.get("/summary", response_model=List[ProductSummary])
async def get_all_summaries(db: Session = Depends(get_db)):
    """Get summaries for all products"""
    summaries = []
    for product in ETHERFI_CONTRACTS.keys():
        try:
            summary = await get_product_summary(product, db)
            summaries.append(summary)
        except Exception as e:
            print(f"Error getting summary for {product}: {e}")
            continue

    return summaries


@router.get("/chart/{product}")
async def get_chart_data(
    product: str,
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get combined chart data (prices + APY) for visualization"""
    product = product.upper()
    if product not in ETHERFI_CONTRACTS:
        raise HTTPException(status_code=404, detail=f"Product {product} not found")

    # Get price history
    price_response = await get_historical_prices(product, days, db)

    # Get APY history
    try:
        apy_response = await get_apy_history(product, days, db)
        apy_data = apy_response.apy_data
    except:
        apy_data = []

    return {
        "product": product,
        "days": days,
        "price_data": price_response.prices,
        "apy_data": apy_data,
        "data_points": price_response.data_points
    }


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint with database status"""
    try:
        # Check database
        price_count = db.query(PriceHistory).count()
        apy_count = db.query(APYHistory).count()

        # Check API
        client = DefiLlamaClient()
        prices = await client.get_current_prices()

        return {
            "status": "healthy",
            "database": {
                "connected": True,
                "price_records": price_count,
                "apy_records": apy_count
            },
            "api": {
                "defillama": "connected" if prices else "error",
                "products_available": len(prices)
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
