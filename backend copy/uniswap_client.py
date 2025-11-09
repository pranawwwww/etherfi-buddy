"""
Uniswap V3 Subgraph Client for Liquidity Metrics
Provides real liquidity depth, slippage estimates, and pool data
Subgraph Docs: https://thegraph.com/docs/en/
"""
import httpx
from typing import Dict, List, Optional, Any
from decimal import Decimal


# The Graph endpoints for Uniswap V3
UNISWAP_SUBGRAPH_URLS = {
    "ethereum": "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    "arbitrum": "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one",
    "optimism": "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis",
    "polygon": "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
    "base": "https://api.studio.thegraph.com/query/48211/uniswap-v3-base/version/latest"
}

# ether.fi token addresses (for querying pools)
ETHERFI_TOKENS = {
    "ethereum": {
        "eETH": "0x35fa164735182de50811e8e2e824cfb9b6118ac2",
        "weETH": "0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee",
        "WETH": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"  # For pairing
    },
    "arbitrum": {
        "weETH": "0x35751007a407ca6feffe80b3cb397736d2cf4dbe",
        "WETH": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
    },
    "base": {
        "weETH": "0x04c0599ae5a44757c0af6f9ec3b93da8976c150a",
        "WETH": "0x4200000000000000000000000000000000000006"
    }
}


class UniswapClient:
    """Client for querying Uniswap V3 liquidity data via The Graph"""

    def __init__(self):
        self.timeout = 30

    async def query_subgraph(self, chain: str, query: str) -> Dict[str, Any]:
        """
        Execute a GraphQL query against Uniswap subgraph

        Args:
            chain: Chain name (ethereum, arbitrum, etc.)
            query: GraphQL query string

        Returns:
            Query results
        """
        url = UNISWAP_SUBGRAPH_URLS.get(chain.lower())
        if not url:
            print(f"Unsupported chain: {chain}")
            return {}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(url, json={"query": query})
                response.raise_for_status()
                data = response.json()
                return data.get("data", {})
            except httpx.HTTPError as e:
                print(f"HTTP error querying Uniswap subgraph on {chain}: {e}")
                return {}
            except Exception as e:
                print(f"Error querying Uniswap subgraph: {e}")
                return {}

    async def get_weeth_pools(self, chain: str = "ethereum") -> List[Dict[str, Any]]:
        """
        Get all weETH/WETH pools on a specific chain

        Args:
            chain: Chain name (ethereum, arbitrum, base)

        Returns:
            List of pool data
        """
        tokens = ETHERFI_TOKENS.get(chain, {})
        weeth_addr = tokens.get("weETH", "").lower()
        weth_addr = tokens.get("WETH", "").lower()

        if not weeth_addr or not weth_addr:
            return []

        # GraphQL query to find weETH/WETH pools
        query = f"""
        {{
          pools(
            where: {{
              or: [
                {{
                  token0: "{weeth_addr}",
                  token1: "{weth_addr}"
                }},
                {{
                  token0: "{weth_addr}",
                  token1: "{weeth_addr}"
                }}
              ]
            }},
            orderBy: totalValueLockedUSD,
            orderDirection: desc,
            first: 5
          ) {{
            id
            token0 {{
              id
              symbol
              decimals
            }}
            token1 {{
              id
              symbol
              decimals
            }}
            feeTier
            liquidity
            totalValueLockedUSD
            totalValueLockedToken0
            totalValueLockedToken1
            volumeUSD
            token0Price
            token1Price
            tick
          }}
        }}
        """

        data = await self.query_subgraph(chain, query)
        return data.get("pools", [])

    async def calculate_liquidity_metrics(
        self,
        chain: str = "ethereum",
        trade_size_usd: float = 10000
    ) -> Dict[str, Any]:
        """
        Calculate liquidity depth and slippage estimates for weETH

        Args:
            chain: Chain name
            trade_size_usd: Trade size in USD for slippage calculation

        Returns:
            Dict with liquidity metrics
        """
        pools = await self.get_weeth_pools(chain)

        if not pools:
            return {
                "chain": chain,
                "pools_found": 0,
                "total_tvl_usd": 0,
                "error": "No pools found"
            }

        # Aggregate metrics across all pools
        total_tvl = sum(float(pool.get("totalValueLockedUSD", 0)) for pool in pools)

        pool_details = []
        for pool in pools:
            tvl = float(pool.get("totalValueLockedUSD", 0))
            fee_tier = int(pool.get("feeTier", 3000))  # Fee in basis points (3000 = 0.3%)

            # Estimate slippage based on TVL and trade size
            # Simplified formula: slippage ≈ (trade_size / tvl) * 100 + fee
            if tvl > 0:
                price_impact = (trade_size_usd / tvl) * 10000  # in basis points
                slippage_bps = int(price_impact + (fee_tier / 100))
                est_fee = (trade_size_usd * fee_tier) / 1000000
            else:
                slippage_bps = 9999
                est_fee = 0

            pool_details.append({
                "pool_id": pool.get("id"),
                "fee_tier": fee_tier / 10000,  # Convert to percentage
                "tvl_usd": tvl,
                "liquidity": pool.get("liquidity"),
                "volume_usd": float(pool.get("volumeUSD", 0)),
                "slippage_bps": slippage_bps,
                "est_fee_usd": round(est_fee, 2),
                "token0": pool.get("token0", {}).get("symbol"),
                "token1": pool.get("token1", {}).get("symbol")
            })

        # Find best pool (lowest slippage)
        best_pool = min(pool_details, key=lambda x: x["slippage_bps"]) if pool_details else None

        return {
            "chain": chain,
            "pools_found": len(pools),
            "total_tvl_usd": round(total_tvl, 2),
            "trade_size_usd": trade_size_usd,
            "pools": pool_details,
            "best_pool": best_pool,
            "recommended_venue": "Uniswap V3"
        }

    async def get_multi_chain_liquidity(self, trade_size_usd: float = 10000) -> List[Dict[str, Any]]:
        """
        Get liquidity metrics across all supported chains

        Args:
            trade_size_usd: Trade size for slippage estimation

        Returns:
            List of liquidity data for each chain
        """
        chains = ["ethereum", "arbitrum", "base"]
        results = []

        for chain in chains:
            metrics = await self.calculate_liquidity_metrics(chain, trade_size_usd)
            if metrics.get("pools_found", 0) > 0:
                results.append(metrics)

        return results

    async def get_liquidity_depth_score(self, total_tvl_usd: float) -> int:
        """
        Calculate liquidity health score (0-100)

        Args:
            total_tvl_usd: Total TVL across all pools

        Returns:
            Health score (0-100)
        """
        # Score based on TVL thresholds
        if total_tvl_usd >= 50_000_000:
            return 100
        elif total_tvl_usd >= 20_000_000:
            return 90
        elif total_tvl_usd >= 10_000_000:
            return 80
        elif total_tvl_usd >= 5_000_000:
            return 70
        elif total_tvl_usd >= 2_000_000:
            return 60
        elif total_tvl_usd >= 1_000_000:
            return 50
        elif total_tvl_usd >= 500_000:
            return 40
        else:
            return 30


# Convenience functions
async def get_weeth_liquidity(chain: str = "ethereum", trade_size: float = 10000) -> Dict[str, Any]:
    """Get weETH liquidity metrics for a specific chain"""
    client = UniswapClient()
    return await client.calculate_liquidity_metrics(chain, trade_size)


async def get_all_chain_liquidity(trade_size: float = 10000) -> List[Dict[str, Any]]:
    """Get weETH liquidity across all chains"""
    client = UniswapClient()
    return await client.get_multi_chain_liquidity(trade_size)


async def get_best_liquidity_venue(trade_size: float = 10000) -> Dict[str, Any]:
    """Find the best venue for trading weETH"""
    client = UniswapClient()
    all_chain_data = await client.get_multi_chain_liquidity(trade_size)

    if not all_chain_data:
        return {"error": "No liquidity data available"}

    # Find chain with best (lowest) slippage
    best_chain = None
    best_slippage = float('inf')

    for chain_data in all_chain_data:
        best_pool = chain_data.get("best_pool")
        if best_pool and best_pool.get("slippage_bps", 9999) < best_slippage:
            best_slippage = best_pool["slippage_bps"]
            best_chain = chain_data

    return {
        "recommended_chain": best_chain.get("chain") if best_chain else None,
        "best_slippage_bps": best_slippage,
        "all_options": all_chain_data
    }


# Test function
async def test_uniswap_client():
    """Test the Uniswap client"""
    print("=" * 60)
    print("Testing Uniswap Client")
    print("=" * 60)

    client = UniswapClient()

    # Test 1: Get Ethereum pools
    print("\n1. Ethereum weETH/WETH Pools:")
    pools = await client.get_weeth_pools("ethereum")
    for pool in pools[:2]:  # Show top 2
        tvl = float(pool.get("totalValueLockedUSD", 0))
        fee = int(pool.get("feeTier", 0)) / 10000
        print(f"  Pool: {pool.get('token0', {}).get('symbol')}/{pool.get('token1', {}).get('symbol')}")
        print(f"  TVL: ${tvl:,.2f} | Fee: {fee}%")

    # Test 2: Calculate liquidity metrics
    print("\n2. Liquidity Metrics (Ethereum):")
    metrics = await client.calculate_liquidity_metrics("ethereum", 10000)
    print(f"  Total TVL: ${metrics.get('total_tvl_usd', 0):,.2f}")
    print(f"  Pools Found: {metrics.get('pools_found')}")
    if metrics.get('best_pool'):
        bp = metrics['best_pool']
        print(f"  Best Pool Slippage: {bp.get('slippage_bps')} bps")
        print(f"  Est. Fee: ${bp.get('est_fee_usd')}")

    # Test 3: Multi-chain comparison
    print("\n3. Multi-Chain Liquidity:")
    all_chains = await client.get_multi_chain_liquidity(10000)
    for chain_data in all_chains:
        print(f"  {chain_data.get('chain').upper()}:")
        print(f"    TVL: ${chain_data.get('total_tvl_usd', 0):,.2f}")
        if chain_data.get('best_pool'):
            print(f"    Best Slippage: {chain_data['best_pool'].get('slippage_bps')} bps")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_uniswap_client())
