"""
Background data fetcher service - runs periodically to collect and store data
Can be run as a standalone service or integrated with FastAPI
"""
import asyncio
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from database import SessionLocal, PriceHistory, APYHistory, MarketMetrics, init_db
from defillama_client import DefiLlamaClient, ETHERFI_CONTRACTS
import time


class DataFetcherService:
    """Service to fetch and store ether.fi data periodically"""

    def __init__(self, interval_minutes: int = 15):
        self.interval_minutes = interval_minutes
        self.client = DefiLlamaClient()
        self.running = False

    async def fetch_and_store_prices(self, db: Session):
        """Fetch current prices and store in database"""
        print(f"[{datetime.now()}] Fetching current prices...")

        try:
            prices = await self.client.get_current_prices()
            timestamp = int(time.time())

            for product, data in prices.items():
                if data.get("price") is None:
                    print(f"  Warning: No price data for {product}")
                    continue

                # Create price history entry
                price_entry = PriceHistory(
                    product=product,
                    price=data["price"],
                    timestamp=data.get("timestamp", timestamp),
                    source="defillama",
                    confidence=data.get("confidence")
                )

                # Add to database (will skip if duplicate due to unique constraint)
                try:
                    db.add(price_entry)
                    db.commit()
                    print(f"  ✓ Stored {product} price: ${data['price']:.2f}")
                except Exception as e:
                    db.rollback()
                    if "UNIQUE constraint failed" in str(e) or "duplicate key" in str(e):
                        print(f"  ⚠ Duplicate entry for {product} at timestamp {timestamp}")
                    else:
                        print(f"  ✗ Error storing {product} price: {e}")

        except Exception as e:
            print(f"Error fetching prices: {e}")

    async def fetch_and_store_apy(self, db: Session):
        """Fetch APY data and store in database"""
        print(f"[{datetime.now()}] Fetching APY data...")

        try:
            apy_data = await self.client.get_all_apys()
            timestamp = int(time.time())

            for product, data in apy_data.items():
                # Create APY history entry
                apy_entry = APYHistory(
                    product=product,
                    apy_base=data.get("apy_base"),
                    apy_reward=data.get("apy_reward"),
                    apy_total=data.get("apy_total"),
                    tvl_usd=data.get("tvl_usd"),
                    timestamp=timestamp
                )

                # Add to database
                try:
                    db.add(apy_entry)
                    db.commit()
                    print(f"  ✓ Stored {product} APY: {data.get('apy_total', 0):.2f}% (TVL: ${data.get('tvl_usd', 0):,.0f})")
                except Exception as e:
                    db.rollback()
                    if "UNIQUE constraint failed" in str(e) or "duplicate key" in str(e):
                        print(f"  ⚠ Duplicate entry for {product} at timestamp {timestamp}")
                    else:
                        print(f"  ✗ Error storing {product} APY: {e}")

        except Exception as e:
            print(f"Error fetching APY data: {e}")

    async def backfill_historical_data(self, db: Session, days_back: int = 90):
        """Backfill historical price data for all products"""
        print(f"[{datetime.now()}] Starting backfill for last {days_back} days...")

        for product in ETHERFI_CONTRACTS.keys():
            print(f"\nBackfilling {product}...")

            try:
                history = await self.client.get_historical_prices(product, days_back=days_back)

                stored_count = 0
                for point in history:
                    if point.get("price") is None:
                        continue

                    price_entry = PriceHistory(
                        product=product,
                        price=point["price"],
                        timestamp=point["timestamp"],
                        source="defillama",
                        confidence=point.get("confidence")
                    )

                    try:
                        db.add(price_entry)
                        db.commit()
                        stored_count += 1
                    except Exception as e:
                        db.rollback()
                        # Skip duplicates silently during backfill
                        if "UNIQUE constraint failed" not in str(e) and "duplicate key" not in str(e):
                            print(f"  Error storing data point: {e}")

                print(f"  ✓ Backfilled {stored_count} data points for {product}")

            except Exception as e:
                print(f"  ✗ Error backfilling {product}: {e}")

        print(f"\n[{datetime.now()}] Backfill complete!")

    async def run_fetch_cycle(self):
        """Run one complete fetch cycle"""
        db = SessionLocal()
        try:
            await self.fetch_and_store_prices(db)
            await self.fetch_and_store_apy(db)
        finally:
            db.close()

    async def start(self):
        """Start the periodic data fetcher"""
        self.running = True
        print(f"Data fetcher started - running every {self.interval_minutes} minutes")
        print("Press Ctrl+C to stop\n")

        # Run initial fetch
        await self.run_fetch_cycle()

        # Continue periodic fetches
        while self.running:
            await asyncio.sleep(self.interval_minutes * 60)
            await self.run_fetch_cycle()

    def stop(self):
        """Stop the data fetcher"""
        self.running = False
        print("Data fetcher stopped")


# Standalone functions for manual operations
async def run_backfill(days: int = 90):
    """Run historical data backfill"""
    init_db()
    service = DataFetcherService()
    db = SessionLocal()
    try:
        await service.backfill_historical_data(db, days_back=days)
    finally:
        db.close()


async def run_single_fetch():
    """Run a single fetch cycle"""
    init_db()
    service = DataFetcherService()
    await service.run_fetch_cycle()


async def start_continuous_fetcher(interval_minutes: int = 15):
    """Start continuous background fetcher"""
    init_db()
    service = DataFetcherService(interval_minutes=interval_minutes)

    try:
        await service.start()
    except KeyboardInterrupt:
        service.stop()
        print("\nShutdown complete")


# CLI interface
if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "backfill":
            days = int(sys.argv[2]) if len(sys.argv) > 2 else 90
            print(f"Running backfill for {days} days...")
            asyncio.run(run_backfill(days))

        elif command == "fetch":
            print("Running single fetch...")
            asyncio.run(run_single_fetch())

        elif command == "start":
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 15
            print(f"Starting continuous fetcher (interval: {interval} minutes)...")
            asyncio.run(start_continuous_fetcher(interval))

        else:
            print(f"Unknown command: {command}")
            print("\nUsage:")
            print("  python data_fetcher.py backfill [days]  - Backfill historical data")
            print("  python data_fetcher.py fetch            - Run single fetch")
            print("  python data_fetcher.py start [minutes]  - Start continuous fetcher")

    else:
        print("EtherFi Data Fetcher")
        print("\nUsage:")
        print("  python data_fetcher.py backfill [days]  - Backfill historical data (default: 90 days)")
        print("  python data_fetcher.py fetch            - Run single fetch cycle")
        print("  python data_fetcher.py start [minutes]  - Start continuous fetcher (default: 15 min)")
        print("\nExample:")
        print("  python data_fetcher.py backfill 30")
        print("  python data_fetcher.py start 10")
