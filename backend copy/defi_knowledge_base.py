"""
DeFi Knowledge Base for Claude Chatbot
Comprehensive knowledge about ether.fi products, DeFi concepts, and real-time market data
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
import json

# Import API clients for real-time data
try:
    from defillama_client import DefiLlamaClient
    from beaconchain_client import BeaconchainClient
    from uniswap_client import UniswapClient
    from eigenexplorer_client import EigenExplorerClient
    REAL_DATA_AVAILABLE = True
except ImportError:
    REAL_DATA_AVAILABLE = False


class DeFiKnowledgeBase:
    """Knowledge base for DeFi products and concepts"""

    def __init__(self):
        """Initialize knowledge base with static and dynamic data"""
        if REAL_DATA_AVAILABLE:
            self.defillama = DefiLlamaClient()
            self.beacon = BeaconchainClient()
            self.uniswap = UniswapClient()
            self.eigen = EigenExplorerClient()
        else:
            self.defillama = None

        # Static knowledge base
        self.products = self._load_product_knowledge()
        self.concepts = self._load_defi_concepts()
        self.risks = self._load_risk_knowledge()
        self.strategies = self._load_strategy_knowledge()

    def _load_product_knowledge(self) -> Dict[str, Dict[str, Any]]:
        """Load detailed product information"""
        return {
            "eETH": {
                "full_name": "ether.fi Staked ETH",
                "type": "Liquid Staking Token",
                "contract": "0x35fA164735182de50811E8e2E824cFb9B6118ac2",
                "description": "eETH is ether.fi's liquid staking token that represents staked ETH. It's a rebasing token that automatically accrues staking rewards.",
                "key_features": [
                    "Rebasing token - balance increases automatically",
                    "Earns native ETH staking rewards (~3-4% APY)",
                    "Can be used in DeFi while staking",
                    "Non-custodial and decentralized",
                    "Protected by Distributed Validator Technology (DVT)"
                ],
                "use_cases": [
                    "Earn ETH staking rewards without running a validator",
                    "Use as collateral in lending protocols",
                    "Provide liquidity in DEX pools",
                    "Restake via EigenLayer for additional yield"
                ],
                "risks": [
                    "Smart contract risk",
                    "Validator slashing risk (mitigated by DVT)",
                    "Liquid staking derivative price deviation",
                    "Protocol governance risk"
                ],
                "how_it_works": "When you stake ETH with ether.fi, you receive eETH tokens. These tokens automatically increase in balance as staking rewards accrue. You can redeem eETH for your staked ETH plus rewards at any time.",
                "related_products": ["weETH", "ETHFI"]
            },

            "weETH": {
                "full_name": "Wrapped eETH",
                "type": "Non-Rebasing Liquid Staking Token",
                "contract": "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
                "description": "weETH is a wrapped, non-rebasing version of eETH designed for better DeFi compatibility. Instead of balance increasing, its price appreciates relative to ETH.",
                "key_features": [
                    "Non-rebasing - balance stays constant, price increases",
                    "Better DeFi compatibility than rebasing tokens",
                    "Same underlying staking rewards as eETH",
                    "Can be unwrapped to eETH anytime",
                    "Multi-chain deployment (Ethereum, Arbitrum, Base, etc.)"
                ],
                "use_cases": [
                    "Use in DeFi protocols that don't support rebasing tokens",
                    "Provide liquidity on DEXes (Uniswap, Curve)",
                    "Use as collateral for borrowing",
                    "Cross-chain DeFi strategies",
                    "Restaking via EigenLayer"
                ],
                "risks": [
                    "Same risks as eETH",
                    "Bridge risk for cross-chain deployment",
                    "Smart contract risk from wrapping mechanism"
                ],
                "how_it_works": "weETH wraps eETH at a specific exchange rate. As staking rewards accumulate, the weETH/ETH price increases. You can unwrap weETH to get eETH at any time.",
                "related_products": ["eETH", "ETHFI"],
                "chains": ["Ethereum", "Arbitrum", "Optimism", "Base", "Linea", "Scroll", "zkSync"]
            },

            "ETHFI": {
                "full_name": "ether.fi Governance Token",
                "type": "Governance & Utility Token",
                "contract": "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB",
                "description": "ETHFI is the governance and utility token of the ether.fi protocol, giving holders voting rights and protocol fee sharing.",
                "key_features": [
                    "Governance voting rights",
                    "Protocol fee sharing",
                    "Staking for additional rewards",
                    "Used for protocol upgrades and parameter changes"
                ],
                "use_cases": [
                    "Vote on protocol governance proposals",
                    "Stake for protocol revenue sharing",
                    "Earn loyalty points for early adopters",
                    "Participate in protocol decision making"
                ],
                "risks": [
                    "Token price volatility",
                    "Governance participation risk",
                    "Regulatory uncertainty around governance tokens"
                ],
                "how_it_works": "ETHFI token holders can stake their tokens to participate in governance and earn protocol fees. The more ETHFI you hold and stake, the more voting power you have.",
                "related_products": ["eETH", "weETH"]
            },

            "eBTC": {
                "full_name": "ether.fi Wrapped Bitcoin",
                "type": "Bitcoin Liquid Staking Token",
                "contract": "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642",
                "description": "eBTC brings Bitcoin liquid staking to DeFi, allowing BTC holders to earn yield while maintaining liquidity.",
                "key_features": [
                    "Bitcoin liquid staking on Ethereum",
                    "Earn yield on BTC holdings",
                    "Use BTC in DeFi protocols",
                    "Multi-chain support"
                ],
                "use_cases": [
                    "Earn yield on Bitcoin holdings",
                    "Use BTC as collateral in DeFi",
                    "Provide liquidity for BTC pairs",
                    "Cross-chain BTC strategies"
                ],
                "risks": [
                    "Bitcoin bridge risk",
                    "Smart contract risk",
                    "Price deviation from BTC"
                ],
                "how_it_works": "eBTC represents Bitcoin that has been bridged to Ethereum and staked through ether.fi's infrastructure. It earns yield while remaining usable in DeFi.",
                "related_products": ["eETH", "weETH"]
            },

            "LiquidUSD": {
                "full_name": "ether.fi Liquid USD",
                "type": "Stablecoin Yield Vault",
                "description": "Liquid USD is ether.fi's USD-denominated savings product that provides high yield on stablecoins.",
                "key_features": [
                    "High yield on USD deposits (~10% APY)",
                    "Instant liquidity",
                    "No lockup periods",
                    "Composable with other DeFi protocols"
                ],
                "use_cases": [
                    "Earn yield on stablecoin holdings",
                    "Park profits from trading",
                    "Diversify away from ETH exposure",
                    "Emergency liquidity reserve"
                ],
                "risks": [
                    "Smart contract risk",
                    "Stablecoin depeg risk",
                    "Yield strategy risk",
                    "Protocol risk"
                ],
                "how_it_works": "Deposit stablecoins into Liquid USD vaults. The protocol automatically deploys them to various yield-generating strategies while maintaining liquidity.",
                "related_products": ["eETH", "weETH"]
            }
        }

    def _load_defi_concepts(self) -> Dict[str, Dict[str, Any]]:
        """Load DeFi concept explanations"""
        return {
            "liquid_staking": {
                "name": "Liquid Staking",
                "simple_explanation": "Liquid staking lets you earn staking rewards while keeping your crypto usable in DeFi.",
                "detailed_explanation": "Traditional staking locks up your crypto. Liquid staking gives you a token (like eETH) representing your staked assets. You earn staking rewards AND can use the token in DeFi protocols.",
                "benefits": [
                    "Earn staking rewards",
                    "Maintain liquidity",
                    "Use tokens in DeFi",
                    "No minimum staking amount",
                    "No validator technical knowledge required"
                ],
                "example": "If you stake 10 ETH with ether.fi, you get 10 eETH. That eETH earns staking rewards (balance increases) AND you can use it as collateral to borrow, provide liquidity, etc."
            },

            "restaking": {
                "name": "Restaking (EigenLayer)",
                "simple_explanation": "Restaking lets you use your staked ETH to secure additional networks and earn extra rewards.",
                "detailed_explanation": "EigenLayer allows you to 'restake' your liquid staking tokens (like weETH) to provide security for other networks called AVS (Actively Validated Services). You earn staking rewards PLUS restaking rewards.",
                "benefits": [
                    "Additional yield on top of staking rewards",
                    "Support new decentralized services",
                    "Compound your rewards"
                ],
                "risks": [
                    "Additional slashing risk from AVS",
                    "More complex risk profile",
                    "Smart contract risk"
                ],
                "example": "Your weETH earns 3% from staking. By restaking on EigenLayer, you might earn an additional 2-3% from securing AVS, for a total of 5-6% APY."
            },

            "apy_vs_apr": {
                "name": "APY vs APR",
                "simple_explanation": "APY includes compounding, APR doesn't.",
                "detailed_explanation": "APR (Annual Percentage Rate) is the simple interest rate. APY (Annual Percentage Yield) includes the effect of compounding - earning interest on your interest.",
                "example": "5% APR with monthly compounding = ~5.12% APY. The difference grows larger with higher rates and more frequent compounding."
            },

            "dvt": {
                "name": "Distributed Validator Technology (DVT)",
                "simple_explanation": "DVT splits validator duties across multiple operators to reduce risk.",
                "detailed_explanation": "DVT technology allows a single validator to be run by multiple independent operators. This reduces the risk of downtime and slashing if one operator has issues.",
                "benefits": [
                    "Reduced slashing risk",
                    "Improved uptime",
                    "More decentralization",
                    "Fault tolerance"
                ],
                "how_ether_fi_uses_it": "ether.fi uses DVT (via SSV Network) to protect stakers. If one operator goes offline, the others keep the validator running."
            },

            "slashing": {
                "name": "Slashing",
                "simple_explanation": "Slashing is a penalty for validators that misbehave or go offline.",
                "detailed_explanation": "Ethereum penalizes validators that double-sign blocks, go offline for extended periods, or act maliciously. Penalties range from small (0.01 ETH) to severe (entire stake).",
                "how_to_avoid": [
                    "Use protocols with DVT protection",
                    "Choose operators with good track records",
                    "Monitor validator uptime",
                    "Use redundant infrastructure"
                ],
                "ether_fi_protection": "ether.fi uses DVT and carefully selected operators to minimize slashing risk. Historical slashing rate: 0%"
            },

            "ltv": {
                "name": "Loan-to-Value (LTV) Ratio",
                "simple_explanation": "LTV is how much you can borrow relative to your collateral value.",
                "detailed_explanation": "If you have $1000 of collateral and can borrow up to $700, that's a 70% LTV. Lower LTV = safer from liquidation but less capital efficiency.",
                "safe_levels": "Most protocols recommend keeping LTV under 50-60% to avoid liquidation risk during market volatility."
            }
        }

    def _load_risk_knowledge(self) -> Dict[str, Dict[str, Any]]:
        """Load risk information"""
        return {
            "smart_contract_risk": {
                "severity": "Medium-High",
                "description": "Risk that bugs in smart contract code could lead to loss of funds",
                "mitigation": [
                    "Use audited protocols (ether.fi is audited)",
                    "Start with small amounts",
                    "Diversify across protocols",
                    "Monitor protocol announcements"
                ]
            },
            "validator_risk": {
                "severity": "Low-Medium",
                "description": "Risk of validators being slashed or going offline",
                "mitigation": [
                    "Use DVT-protected protocols",
                    "Monitor validator uptime",
                    "Choose reputable operators",
                    "Diversify across operators"
                ],
                "ether_fi_stats": "99.5%+ uptime, 0 slashing events, DVT protected"
            },
            "liquidity_risk": {
                "severity": "Low",
                "description": "Risk that you can't exit positions quickly at fair prices",
                "mitigation": [
                    "Check DEX liquidity before large trades",
                    "Use limit orders",
                    "Consider multi-chain options",
                    "Monitor liquidity trends"
                ]
            },
            "market_risk": {
                "severity": "High",
                "description": "Risk of crypto price volatility affecting your portfolio value",
                "mitigation": [
                    "Use stablecoins for portion of portfolio",
                    "Set stop losses",
                    "Don't overleverage",
                    "Keep emergency fund"
                ]
            }
        }

    def _load_strategy_knowledge(self) -> Dict[str, Dict[str, Any]]:
        """Load strategy information"""
        return {
            "simple_staking": {
                "name": "Simple Staking",
                "difficulty": "Beginner",
                "description": "Just stake ETH for eETH/weETH and hold",
                "expected_return": "3-4% APY",
                "risk_level": "Low",
                "steps": [
                    "Buy ETH on exchange",
                    "Connect wallet to ether.fi",
                    "Stake ETH for eETH or weETH",
                    "Hold and earn rewards"
                ]
            },
            "restaking": {
                "name": "EigenLayer Restaking",
                "difficulty": "Intermediate",
                "description": "Restake weETH via EigenLayer for additional yield",
                "expected_return": "5-7% APY",
                "risk_level": "Medium",
                "steps": [
                    "Get weETH from ether.fi",
                    "Connect to EigenLayer",
                    "Delegate to operators",
                    "Earn staking + restaking rewards"
                ]
            },
            "leveraged_staking": {
                "name": "Leveraged Staking",
                "difficulty": "Advanced",
                "description": "Use weETH as collateral to borrow and restake",
                "expected_return": "8-12% APY",
                "risk_level": "High",
                "steps": [
                    "Stake ETH for weETH",
                    "Supply weETH as collateral",
                    "Borrow stablecoins at ≤50% LTV",
                    "Deploy stables to yield protocol",
                    "Monitor liquidation risk"
                ]
            }
        }

    async def get_live_market_data(self) -> Dict[str, Any]:
        """Fetch live market data from APIs"""
        if not REAL_DATA_AVAILABLE:
            return self._get_mock_market_data()

        try:
            # Get prices
            prices = await self.defillama.get_current_prices()

            # Get APY data
            apy_data = await self.defillama.get_all_apys()

            # Get validator metrics
            uptime = await self.beacon.calculate_uptime_metrics()

            # Get liquidity
            liquidity = await self.uniswap.get_multi_chain_liquidity()

            # Get restaking data
            restaking = await self.eigen.get_restaking_distribution()

            return {
                "timestamp": datetime.now().isoformat(),
                "prices": {
                    "eETH": prices.get("eETH", {}).get("price", 0),
                    "weETH": prices.get("weETH", {}).get("price", 0),
                    "ETHFI": prices.get("ETHFI", {}).get("price", 0),
                    "ETH": 3500  # Market price
                },
                "apy": {
                    "eETH": apy_data.get("eETH", {}).get("apy_total", 0),
                    "weETH": apy_data.get("weETH", {}).get("apy_total", 0)
                },
                "tvl": {
                    "total": apy_data.get("eETH", {}).get("tvl_usd", 0)
                },
                "validator_metrics": {
                    "uptime": uptime.get("uptime_pct", 0),
                    "validators": uptime.get("validator_count", 0)
                },
                "liquidity": {
                    "total_tvl": sum(c.get("total_tvl_usd", 0) for c in liquidity),
                    "chains": len(liquidity)
                },
                "restaking": {
                    "restaked_pct": restaking.get("restaked_pct", 0)
                },
                "data_source": "real_apis"
            }

        except Exception as e:
            print(f"Error fetching live data: {e}")
            return self._get_mock_market_data()

    def _get_mock_market_data(self) -> Dict[str, Any]:
        """Return mock market data"""
        return {
            "timestamp": datetime.now().isoformat(),
            "prices": {
                "eETH": 3500,
                "weETH": 3600,
                "ETHFI": 2.5,
                "ETH": 3500
            },
            "apy": {
                "eETH": 3.2,
                "weETH": 3.2
            },
            "tvl": {
                "total": 8500000000
            },
            "validator_metrics": {
                "uptime": 99.5,
                "validators": 10000
            },
            "data_source": "mock"
        }

    def get_product_info(self, product: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific product"""
        return self.products.get(product)

    def get_concept_info(self, concept: str) -> Optional[Dict[str, Any]]:
        """Get information about a DeFi concept"""
        return self.concepts.get(concept)

    def search_knowledge(self, query: str) -> List[Dict[str, Any]]:
        """Search knowledge base for relevant information"""
        query_lower = query.lower()
        results = []

        # Search products
        for product_key, product_data in self.products.items():
            if query_lower in product_key.lower() or query_lower in product_data.get("description", "").lower():
                results.append({
                    "type": "product",
                    "key": product_key,
                    "data": product_data
                })

        # Search concepts
        for concept_key, concept_data in self.concepts.items():
            if query_lower in concept_key.lower() or query_lower in concept_data.get("simple_explanation", "").lower():
                results.append({
                    "type": "concept",
                    "key": concept_key,
                    "data": concept_data
                })

        return results


# Global instance
knowledge_base = DeFiKnowledgeBase()


# Convenience functions
async def get_market_context() -> str:
    """Get formatted market context for Claude"""
    data = await knowledge_base.get_live_market_data()

    context = f"""
Current Market Data ({data['data_source'].upper()}):
- eETH Price: ${data['prices']['eETH']:,.2f} | APY: {data['apy']['eETH']:.2f}%
- weETH Price: ${data['prices']['weETH']:,.2f} | APY: {data['apy']['weETH']:.2f}%
- ETHFI Price: ${data['prices']['ETHFI']:.2f}
- ETH Price: ${data['prices']['ETH']:,.2f}
- Total Protocol TVL: ${data['tvl']['total']:,.0f}
- Validator Uptime: {data['validator_metrics']['uptime']:.2f}%
- Active Validators: {data['validator_metrics']['validators']:,}
- Restaked: {data.get('restaking', {}).get('restaked_pct', 0):.1f}%
"""
    return context.strip()


def get_product_context(product: str) -> str:
    """Get formatted product context for Claude"""
    info = knowledge_base.get_product_info(product)
    if not info:
        return f"No information available for {product}"

    context = f"""
{info['full_name']} ({product}):
Type: {info['type']}
Description: {info['description']}

Key Features:
{chr(10).join(f"- {feature}" for feature in info['key_features'])}

Risks:
{chr(10).join(f"- {risk}" for risk in info['risks'])}
"""
    return context.strip()


# Test function
async def test_knowledge_base():
    """Test the knowledge base"""
    print("=" * 60)
    print("Testing DeFi Knowledge Base")
    print("=" * 60)

    # Test live market data
    print("\n1. Live Market Data:")
    market_data = await knowledge_base.get_live_market_data()
    print(f"   eETH Price: ${market_data['prices']['eETH']:,.2f}")
    print(f"   APY: {market_data['apy']['eETH']:.2f}%")
    print(f"   Data Source: {market_data['data_source'].upper()}")

    # Test product info
    print("\n2. Product Information:")
    eeth_info = knowledge_base.get_product_info("eETH")
    print(f"   Product: {eeth_info['full_name']}")
    print(f"   Type: {eeth_info['type']}")
    print(f"   Features: {len(eeth_info['key_features'])}")

    # Test concept info
    print("\n3. Concept Information:")
    liquid_staking = knowledge_base.get_concept_info("liquid_staking")
    print(f"   Concept: {liquid_staking['name']}")
    print(f"   Explanation: {liquid_staking['simple_explanation']}")

    # Test search
    print("\n4. Search Results for 'staking':")
    results = knowledge_base.search_knowledge("staking")
    print(f"   Found {len(results)} results")
    for result in results[:3]:
        print(f"   - {result['type']}: {result['key']}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_knowledge_base())
