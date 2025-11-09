"""
AI-powered price forecasting using Claude API
Analyzes historical price data and generates predictions with reasoning
"""
import os
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import PriceHistory, APYHistory, PriceForecast, SessionLocal
import json


class ClaudeForecastingService:
    """Service for AI-powered price forecasting using Claude"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            print("Warning: ANTHROPIC_API_KEY not set - forecasting will not work")
        self.model = "claude-sonnet-4-5-20250929"

    def _get_historical_data(self, db: Session, product: str, days: int = 90) -> List[Dict[str, Any]]:
        """Fetch historical price data from database"""
        cutoff_timestamp = int((datetime.now() - timedelta(days=days)).timestamp())

        prices = db.query(PriceHistory).filter(
            PriceHistory.product == product,
            PriceHistory.timestamp >= cutoff_timestamp
        ).order_by(PriceHistory.timestamp.asc()).all()

        return [
            {
                "timestamp": p.timestamp,
                "date": datetime.fromtimestamp(p.timestamp).strftime("%Y-%m-%d"),
                "price": p.price
            }
            for p in prices
        ]

    def _get_apy_history(self, db: Session, product: str, days: int = 30) -> List[Dict[str, Any]]:
        """Fetch historical APY data from database"""
        cutoff_timestamp = int((datetime.now() - timedelta(days=days)).timestamp())

        apys = db.query(APYHistory).filter(
            APYHistory.product == product,
            APYHistory.timestamp >= cutoff_timestamp
        ).order_by(APYHistory.timestamp.asc()).all()

        return [
            {
                "timestamp": a.timestamp,
                "date": datetime.fromtimestamp(a.timestamp).strftime("%Y-%m-%d"),
                "apy_total": a.apy_total,
                "tvl_usd": a.tvl_usd
            }
            for a in apys
        ]

    def _build_analysis_prompt(
        self,
        product: str,
        price_history: List[Dict[str, Any]],
        apy_history: List[Dict[str, Any]],
        forecast_days: int
    ) -> str:
        """Build Claude prompt for price forecasting"""

        # Calculate basic statistics
        prices = [p["price"] for p in price_history if p["price"]]
        if not prices:
            return ""

        current_price = prices[-1]
        avg_price = sum(prices) / len(prices)
        min_price = min(prices)
        max_price = max(prices)
        volatility = (max_price - min_price) / avg_price * 100

        # Recent trend
        if len(prices) >= 7:
            recent_avg = sum(prices[-7:]) / 7
            older_avg = sum(prices[-14:-7]) / 7 if len(prices) >= 14 else avg_price
            trend_pct = ((recent_avg - older_avg) / older_avg * 100) if older_avg else 0
        else:
            trend_pct = 0

        prompt = f"""You are an expert DeFi analyst specializing in Ethereum liquid staking derivatives. Analyze the following data for {product} and provide a price forecast.

## Product Context
{product} is an ether.fi liquid staking token. Key characteristics:
- eETH: Rebasing liquid staking token earning ETH staking rewards
- weETH: Wrapped, non-rebasing version of eETH
- ETHFI: Governance and utility token for the ether.fi protocol
- eBTC: Bitcoin liquid staking token

## Historical Price Data (Last {len(price_history)} days)
Current Price: ${current_price:.2f}
Average Price: ${avg_price:.2f}
Price Range: ${min_price:.2f} - ${max_price:.2f}
Volatility: {volatility:.2f}%
Recent 7-day Trend: {trend_pct:+.2f}%

Recent Price Points (last 10 days):
{json.dumps(price_history[-10:], indent=2)}

## APY Data (if available)
{json.dumps(apy_history[-5:], indent=2) if apy_history else "No APY data available"}

## Analysis Request
Provide a {forecast_days}-day price forecast for {product} with the following JSON structure:

{{
    "current_analysis": {{
        "trend": "bullish|bearish|neutral",
        "confidence": 0.0-1.0,
        "key_factors": ["factor1", "factor2", "factor3"]
    }},
    "forecast": {{
        "7_day": {{"price": 0.00, "confidence": 0.0-1.0}},
        "30_day": {{"price": 0.00, "confidence": 0.0-1.0}},
        "90_day": {{"price": 0.00, "confidence": 0.0-1.0}}
    }},
    "scenarios": {{
        "bullish": {{"price": 0.00, "probability": 0.0-1.0, "catalysts": ["catalyst1"]}},
        "base": {{"price": 0.00, "probability": 0.0-1.0, "rationale": "rationale"}},
        "bearish": {{"price": 0.00, "probability": 0.0-1.0, "risks": ["risk1"]}}
    }},
    "reasoning": "2-3 sentence explanation of your forecast",
    "risk_factors": ["risk1", "risk2", "risk3"],
    "opportunities": ["opportunity1", "opportunity2"]
}}

Consider:
1. Historical price patterns and trends
2. APY sustainability and competitiveness
3. Ethereum staking dynamics
4. DeFi market conditions
5. Liquid staking token correlations
6. Protocol-specific factors (TVL, adoption, etc.)

Provide realistic, data-driven forecasts. Be conservative with confidence scores. Focus on probabilistic thinking rather than point predictions.
"""

        return prompt

    async def generate_forecast(
        self,
        product: str,
        forecast_days: int = 90,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered price forecast for a product

        Args:
            product: Product name (eETH, weETH, ETHFI, eBTC)
            forecast_days: Number of days to forecast
            db: Database session (optional, will create if not provided)

        Returns:
            Dict with forecast data and reasoning
        """
        if not self.api_key:
            return {
                "error": "ANTHROPIC_API_KEY not configured",
                "product": product,
                "forecast_days": forecast_days
            }

        # Get database session
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True

        try:
            # Fetch historical data
            price_history = self._get_historical_data(db, product, days=90)
            apy_history = self._get_apy_history(db, product, days=30)

            if not price_history:
                return {
                    "error": "No historical price data available",
                    "product": product
                }

            # Build prompt
            prompt = self._build_analysis_prompt(product, price_history, apy_history, forecast_days)

            # Call Claude API
            from anthropic import Anthropic
            client = Anthropic(api_key=self.api_key)

            response = client.messages.create(
                model=self.model,
                max_tokens=2000,
                temperature=0.3,  # Lower temperature for more consistent predictions
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            # Parse response
            response_text = response.content[0].text

            # Try to extract JSON from response
            try:
                # Find JSON in the response
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    forecast_data = json.loads(response_text[json_start:json_end])
                else:
                    forecast_data = {"raw_response": response_text}
            except json.JSONDecodeError:
                forecast_data = {"raw_response": response_text}

            # Add metadata
            forecast_data["product"] = product
            forecast_data["generated_at"] = datetime.now().isoformat()
            forecast_data["model"] = self.model
            forecast_data["historical_days"] = len(price_history)

            # Store forecast in database
            self._store_forecast(db, product, forecast_data)

            return forecast_data

        except Exception as e:
            print(f"Error generating forecast: {e}")
            return {
                "error": str(e),
                "product": product
            }
        finally:
            if close_db:
                db.close()

    def _store_forecast(self, db: Session, product: str, forecast_data: Dict[str, Any]):
        """Store forecast in database for future reference"""
        try:
            # Extract forecast values for different time horizons
            forecasts = forecast_data.get("forecast", {})

            for period, data in forecasts.items():
                if not isinstance(data, dict):
                    continue

                # Calculate forecast timestamp
                days = int(period.split('_')[0])
                forecast_timestamp = int((datetime.now() + timedelta(days=days)).timestamp())

                forecast_entry = PriceForecast(
                    product=product,
                    forecast_timestamp=forecast_timestamp,
                    predicted_price=data.get("price", 0),
                    confidence_score=data.get("confidence", 0),
                    reasoning=forecast_data.get("reasoning", ""),
                    model_version=self.model
                )

                db.add(forecast_entry)

            db.commit()
            print(f"Stored forecast for {product}")

        except Exception as e:
            db.rollback()
            print(f"Error storing forecast: {e}")

    async def generate_all_forecasts(self, forecast_days: int = 90) -> Dict[str, Any]:
        """Generate forecasts for all products"""
        from defillama_client import ETHERFI_CONTRACTS

        results = {}
        db = SessionLocal()

        try:
            for product in ETHERFI_CONTRACTS.keys():
                print(f"Generating forecast for {product}...")
                forecast = await self.generate_forecast(product, forecast_days, db)
                results[product] = forecast

            return results

        finally:
            db.close()


# Convenience functions
async def get_product_forecast(product: str, forecast_days: int = 90) -> Dict[str, Any]:
    """Get forecast for a specific product"""
    service = ClaudeForecastingService()
    return await service.generate_forecast(product, forecast_days)


async def get_all_forecasts(forecast_days: int = 90) -> Dict[str, Any]:
    """Get forecasts for all products"""
    service = ClaudeForecastingService()
    return await service.generate_all_forecasts(forecast_days)


# CLI interface
if __name__ == "__main__":
    import sys
    import asyncio

    if len(sys.argv) > 1:
        product = sys.argv[1].upper()
        days = int(sys.argv[2]) if len(sys.argv) > 2 else 90

        print(f"Generating {days}-day forecast for {product}...\n")
        result = asyncio.run(get_product_forecast(product, days))

        print("\n" + "=" * 60)
        print(json.dumps(result, indent=2))
        print("=" * 60)

    else:
        print("AI Forecasting Service")
        print("\nUsage:")
        print("  python ai_forecasting.py <product> [days]")
        print("\nExample:")
        print("  python ai_forecasting.py eETH 30")
        print("  python ai_forecasting.py weETH 90")
