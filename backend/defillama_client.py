"""
DefiLlama API Client for fetching ether.fi price and APY data
Documentation: https://defillama.com/docs/api
"""
import httpx
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import asyncio

# ether.fi contract addresses
ETHERFI_CONTRACTS = {
    "eETH": "0x35fA164735182de50811E8e2E824cFb9B6118ac2",
    "weETH": "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
    "ETHFI": "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB",
    "eBTC": "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642"
}

DEFILLAMA_COINS_API = "https://coins.llama.fi"
DEFILLAMA_YIELDS_API = "https://yields.llama.fi"


class DefiLlamaClient:
    """Client for interacting with DefiLlama APIs"""

    def __init__(self, timeout: int = 30):
        self.timeout = timeout

    async def get_current_prices(self) -> Dict[str, Any]:
        """
        Fetch current prices for all ether.fi products

        Returns:
            Dict with product names as keys and price data as values
            Example: {
                "eETH": {"price": 3425.67, "symbol": "eETH", "timestamp": 1736467200, "confidence": 0.99},
                ...
            }
        """
        # Build comma-separated list of addresses
        addresses = ",".join([f"ethereum:{addr}" for addr in ETHERFI_CONTRACTS.values()])
        url = f"{DEFILLAMA_COINS_API}/prices/current/{addresses}"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()

                # Transform response to product-name keys
                result = {}
                for product, contract_addr in ETHERFI_CONTRACTS.items():
                    key = f"ethereum:{contract_addr}"
                    if key in data.get("coins", {}):
                        coin_data = data["coins"][key]
                        result[product] = {
                            "price": coin_data.get("price"),
                            "symbol": coin_data.get("symbol"),
                            "timestamp": coin_data.get("timestamp"),
                            "confidence": coin_data.get("confidence"),
                            "decimals": coin_data.get("decimals")
                        }

                return result

            except httpx.HTTPError as e:
                print(f"HTTP error fetching prices: {e}")
                return {}
            except Exception as e:
                print(f"Error fetching current prices: {e}")
                return {}

    async def get_historical_prices(
        self,
        product: str,
        timestamps: Optional[List[int]] = None,
        days_back: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Fetch historical prices for a specific product

        Args:
            product: Product name (eETH, weETH, ETHFI, eBTC)
            timestamps: Optional list of specific Unix timestamps to fetch
            days_back: If timestamps not provided, fetch last N days

        Returns:
            List of price data points with timestamp and price
        """
        if product not in ETHERFI_CONTRACTS:
            print(f"Unknown product: {product}")
            return []

        contract_addr = ETHERFI_CONTRACTS[product]

        # If no timestamps provided, generate daily timestamps for past N days
        if timestamps is None:
            now = int(datetime.now().timestamp())
            day_seconds = 86400
            timestamps = [now - (i * day_seconds) for i in range(days_back)]

        results = []
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            # Batch request for historical prices
            for ts in timestamps:
                url = f"{DEFILLAMA_COINS_API}/prices/historical/{ts}/ethereum:{contract_addr}"
                try:
                    response = await client.get(url)
                    response.raise_for_status()
                    data = response.json()

                    key = f"ethereum:{contract_addr}"
                    if key in data.get("coins", {}):
                        coin_data = data["coins"][key]
                        results.append({
                            "timestamp": ts,
                            "price": coin_data.get("price"),
                            "symbol": coin_data.get("symbol"),
                            "confidence": coin_data.get("confidence")
                        })

                    # Rate limiting - small delay between requests
                    await asyncio.sleep(0.1)

                except Exception as e:
                    print(f"Error fetching historical price at {ts}: {e}")
                    continue

        return sorted(results, key=lambda x: x["timestamp"])

    async def get_yields_data(self) -> List[Dict[str, Any]]:
        """
        Fetch APY/yield data for all ether.fi pools from DefiLlama Yields API

        Returns:
            List of pool data with APY information
        """
        url = f"{DEFILLAMA_YIELDS_API}/pools"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()

                # Filter for ether.fi pools
                pools = data.get("data", [])
                etherfi_pools = [
                    pool for pool in pools
                    if pool.get("project", "").lower() in ["ether.fi", "ether-fi", "etherfi"]
                ]

                return etherfi_pools

            except httpx.HTTPError as e:
                print(f"HTTP error fetching yields: {e}")
                return []
            except Exception as e:
                print(f"Error fetching yields data: {e}")
                return []

    async def get_apy_for_product(self, product: str) -> Optional[Dict[str, Any]]:
        """
        Get APY data for a specific product

        Args:
            product: Product name (eETH, weETH, ETHFI, eBTC)

        Returns:
            Dict with APY data or None if not found
        """
        if product not in ETHERFI_CONTRACTS:
            return None

        yields_data = await self.get_yields_data()
        contract_addr = ETHERFI_CONTRACTS[product].lower()

        # Find matching pool
        for pool in yields_data:
            pool_id = pool.get("pool", "").lower()
            if contract_addr in pool_id:
                return {
                    "product": product,
                    "apy_base": pool.get("apyBase", 0),
                    "apy_reward": pool.get("apyReward", 0),
                    "apy_total": pool.get("apy", 0),
                    "tvl_usd": pool.get("tvlUsd", 0),
                    "symbol": pool.get("symbol"),
                    "chain": pool.get("chain"),
                    "project": pool.get("project")
                }

        return None

    async def get_all_apys(self) -> Dict[str, Dict[str, Any]]:
        """
        Get APY data for all ether.fi products

        Returns:
            Dict with product names as keys and APY data as values
        """
        yields_data = await self.get_yields_data()
        result = {}

        for product, contract_addr in ETHERFI_CONTRACTS.items():
            addr_lower = contract_addr.lower()

            # Find matching pool
            for pool in yields_data:
                pool_id = pool.get("pool", "").lower()
                if addr_lower in pool_id:
                    result[product] = {
                        "apy_base": pool.get("apyBase", 0),
                        "apy_reward": pool.get("apyReward", 0),
                        "apy_total": pool.get("apy", 0),
                        "tvl_usd": pool.get("tvlUsd", 0),
                        "symbol": pool.get("symbol"),
                        "chain": pool.get("chain")
                    }
                    break

        return result

    async def get_chart_data(self, product: str) -> Dict[str, Any]:
        """
        Get comprehensive chart data for a product (price + APY over time)

        Args:
            product: Product name

        Returns:
            Dict with historical price and APY data
        """
        # Fetch last 90 days of price data
        price_history = await self.get_historical_prices(product, days_back=90)

        # Fetch current APY
        apy_data = await self.get_apy_for_product(product)

        return {
            "product": product,
            "price_history": price_history,
            "current_apy": apy_data,
            "data_points": len(price_history)
        }


# Convenience functions for FastAPI endpoints
async def fetch_live_prices() -> Dict[str, Any]:
    """Fetch live prices for all ether.fi products"""
    client = DefiLlamaClient()
    return await client.get_current_prices()


async def fetch_historical_prices(product: str, days: int = 30) -> List[Dict[str, Any]]:
    """Fetch historical prices for a product"""
    client = DefiLlamaClient()
    return await client.get_historical_prices(product, days_back=days)


async def fetch_apy_data() -> Dict[str, Dict[str, Any]]:
    """Fetch APY data for all products"""
    client = DefiLlamaClient()
    return await client.get_all_apys()


async def fetch_product_apy(product: str) -> Optional[Dict[str, Any]]:
    """Fetch APY data for specific product"""
    client = DefiLlamaClient()
    return await client.get_apy_for_product(product)


# Test function
async def test_client():
    """Test the DefiLlama client"""
    client = DefiLlamaClient()

    print("=" * 50)
    print("Testing DefiLlama Client")
    print("=" * 50)

    # Test current prices
    print("\n1. Current Prices:")
    prices = await client.get_current_prices()
    for product, data in prices.items():
        print(f"  {product}: ${data.get('price', 'N/A')}")

    # Test APY data
    print("\n2. APY Data:")
    apys = await client.get_all_apys()
    for product, data in apys.items():
        print(f"  {product}: {data.get('apy_total', 0):.2f}% (TVL: ${data.get('tvl_usd', 0):,.0f})")

    # Test historical prices (last 7 days)
    print("\n3. Historical Prices (eETH, last 7 days):")
    history = await client.get_historical_prices("eETH", days_back=7)
    for point in history[-3:]:  # Show last 3 days
        dt = datetime.fromtimestamp(point["timestamp"])
        print(f"  {dt.strftime('%Y-%m-%d')}: ${point.get('price', 'N/A')}")

    print("\n" + "=" * 50)


if __name__ == "__main__":
    # Run test
    asyncio.run(test_client())
