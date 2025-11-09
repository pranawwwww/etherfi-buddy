"""
Quick setup script for ether.fi backend
Initializes database and optionally backfills historical data
"""
import asyncio
import sys
from database import init_db, SessionLocal
from data_fetcher import DataFetcherService


async def setup_backend(backfill_days: int = 30):
    """
    Complete backend setup process

    Args:
        backfill_days: Number of days of historical data to fetch (default: 30)
    """
    print("=" * 60)
    print("ether.fi Backend Setup")
    print("=" * 60)

    # Step 1: Initialize database
    print("\n[1/3] Initializing database...")
    try:
        init_db()
        print("✓ Database initialized successfully")
    except Exception as e:
        print(f"✗ Database initialization failed: {e}")
        return False

    # Step 2: Test DefiLlama connection
    print("\n[2/3] Testing DefiLlama API connection...")
    try:
        from defillama_client import DefiLlamaClient
        client = DefiLlamaClient()
        prices = await client.get_current_prices()

        if prices:
            print(f"✓ Successfully connected to DefiLlama")
            print(f"  Found data for {len(prices)} products:")
            for product, data in prices.items():
                price = data.get('price', 'N/A')
                print(f"    - {product}: ${price}")
        else:
            print("⚠ Connected but no price data received")

    except Exception as e:
        print(f"✗ DefiLlama connection failed: {e}")
        print("  The backend will still work but won't have live data")

    # Step 3: Backfill historical data
    if backfill_days > 0:
        print(f"\n[3/3] Backfilling {backfill_days} days of historical data...")
        print("This may take a few minutes...")

        try:
            service = DataFetcherService()
            db = SessionLocal()

            try:
                await service.backfill_historical_data(db, days_back=backfill_days)
                print("✓ Historical data backfill complete")
            finally:
                db.close()

        except Exception as e:
            print(f"⚠ Backfill had some issues: {e}")
            print("  You can try running: python data_fetcher.py backfill 30")
    else:
        print("\n[3/3] Skipping historical data backfill")

    # Setup complete
    print("\n" + "=" * 60)
    print("Setup Complete! 🎉")
    print("=" * 60)

    print("\nNext steps:")
    print("1. Start the backend server:")
    print("   uvicorn main:app --reload --port 8000")
    print("\n2. (Optional) Start background data fetcher:")
    print("   python data_fetcher.py start 15")
    print("\n3. Test the API:")
    print("   http://localhost:8000/docs")
    print("   http://localhost:8000/api/v2/health")
    print("   http://localhost:8000/api/v2/prices/live")

    return True


async def quick_test():
    """Run quick test of all components"""
    print("=" * 60)
    print("Quick Component Test")
    print("=" * 60)

    # Test 1: Database
    print("\n[Test 1] Database...")
    try:
        from database import SessionLocal, PriceHistory
        db = SessionLocal()
        count = db.query(PriceHistory).count()
        db.close()
        print(f"✓ Database OK ({count} price records)")
    except Exception as e:
        print(f"✗ Database error: {e}")

    # Test 2: DefiLlama
    print("\n[Test 2] DefiLlama API...")
    try:
        from defillama_client import DefiLlamaClient
        client = DefiLlamaClient()
        prices = await client.get_current_prices()
        print(f"✓ DefiLlama OK ({len(prices)} products)")
    except Exception as e:
        print(f"✗ DefiLlama error: {e}")

    # Test 3: AI Forecasting (if API key available)
    print("\n[Test 3] AI Forecasting...")
    try:
        import os
        if os.getenv("ANTHROPIC_API_KEY"):
            from ai_forecasting import ClaudeForecastingService
            service = ClaudeForecastingService()
            print("✓ AI service initialized (API key found)")
        else:
            print("⚠ ANTHROPIC_API_KEY not set - forecasting disabled")
    except Exception as e:
        print(f"✗ AI service error: {e}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # Run quick test
        asyncio.run(quick_test())
    else:
        # Run full setup
        days = int(sys.argv[1]) if len(sys.argv) > 1 else 30

        print(f"\nThis will set up the backend and backfill {days} days of data.")
        print("It may take a few minutes. Continue? (y/n): ", end="")

        response = input().lower()
        if response == 'y':
            asyncio.run(setup_backend(backfill_days=days))
        else:
            print("Setup cancelled")
            print("\nTo run setup later:")
            print("  python setup.py [days]")
            print("\nTo run quick test:")
            print("  python setup.py test")
