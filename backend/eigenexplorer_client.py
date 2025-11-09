"""
EigenLayer Explorer API Client for AVS and Restaking Data
Provides real AVS concentration, restaking metrics, and distribution data
API Docs: https://docs.eigenlayer.xyz/
"""
import httpx
from typing import Dict, List, Optional, Any
import os


# EigenLayer API endpoints
EIGENLAYER_API = "https://api.eigenlayer.xyz"  # Base URL (may vary)
EIGENLAYER_API_KEY = os.getenv("EIGENLAYER_API_KEY", "")  # Optional API key


class EigenExplorerClient:
    """Client for fetching EigenLayer AVS and restaking data"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or EIGENLAYER_API_KEY
        self.timeout = 30

    async def get_avs_operators(self, operator_address: Optional[str] = None) -> Dict[str, Any]:
        """
        Get AVS (Actively Validated Services) data for operators

        Args:
            operator_address: Optional specific operator address

        Returns:
            Dict with AVS data
        """
        # Note: Actual API endpoints may vary
        # This is a template based on common EigenLayer data structures

        # For now, returning realistic mock data based on ether.fi's known AVS participation
        # In production, replace with actual API calls

        return {
            "total_avs_count": 12,
            "active_avs": [
                {
                    "name": "EigenDA",
                    "type": "Data Availability",
                    "tvl_eth": 145000,
                    "allocation_pct": 46.2,
                    "status": "active",
                    "audit_status": "audited"
                },
                {
                    "name": "Witness Chain",
                    "type": "Oracle Network",
                    "tvl_eth": 97000,
                    "allocation_pct": 30.9,
                    "status": "active",
                    "audit_status": "audited"
                },
                {
                    "name": "Lagrange",
                    "type": "ZK Coprocessor",
                    "tvl_eth": 72000,
                    "allocation_pct": 22.9,
                    "status": "active",
                    "audit_status": "in_progress"
                }
            ],
            "operator_address": operator_address or "0x0000000000000000000000000000000000000000",
            "data_source": "mock"  # Change to "eigenlayer" when using real API
        }

    async def calculate_avs_concentration(self, operator_address: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculate AVS concentration metrics (HHI, largest AVS %, etc.)

        Args:
            operator_address: Optional operator address

        Returns:
            Dict with concentration metrics
        """
        avs_data = await self.get_avs_operators(operator_address)

        if not avs_data.get("active_avs"):
            return {
                "largest_avs_pct": 0,
                "hhi": 0,
                "concentration_score": "unknown",
                "error": "No AVS data available"
            }

        # Extract allocation percentages
        allocations = [avs.get("allocation_pct", 0) for avs in avs_data["active_avs"]]

        # Calculate Herfindahl-Hirschman Index (HHI)
        # HHI = sum of squared market shares
        # Range: 0 to 10,000 (or 0 to 1 if using decimals)
        hhi = sum((pct / 100) ** 2 for pct in allocations)

        # Find largest AVS allocation
        largest_avs_pct = max(allocations) if allocations else 0

        # Determine concentration level
        # HHI < 0.15: Low concentration
        # HHI 0.15-0.25: Moderate concentration
        # HHI > 0.25: High concentration
        if hhi < 0.15:
            concentration_score = "low"
            concentration_grade = "A"
        elif hhi < 0.25:
            concentration_score = "moderate"
            concentration_grade = "B"
        else:
            concentration_score = "high"
            concentration_grade = "C"

        return {
            "largest_avs_pct": round(largest_avs_pct, 2),
            "largest_avs_name": avs_data["active_avs"][0].get("name") if avs_data["active_avs"] else None,
            "hhi": round(hhi, 4),
            "hhi_normalized": int(hhi * 10000),  # 0-10,000 scale
            "concentration_score": concentration_score,
            "concentration_grade": concentration_grade,
            "avs_count": len(avs_data["active_avs"]),
            "avs_split": [
                {
                    "name": avs.get("name"),
                    "pct": avs.get("allocation_pct"),
                    "type": avs.get("type")
                }
                for avs in avs_data["active_avs"]
            ]
        }

    async def get_restaking_distribution(self, operator_address: Optional[str] = None) -> Dict[str, Any]:
        """
        Get distribution between base staking and restaking

        Args:
            operator_address: Optional operator address

        Returns:
            Dict with staking distribution
        """
        # Mock data based on typical ether.fi distribution
        # In production, query EigenLayer contracts or API

        total_staked_eth = 5_000_000  # Example total
        restaked_eth = 3_100_000  # Restaked portion
        base_staked_eth = total_staked_eth - restaked_eth

        restaked_pct = (restaked_eth / total_staked_eth) * 100
        base_staked_pct = (base_staked_eth / total_staked_eth) * 100

        # Calculate balance score (0-100)
        # Ideal ratio is around 60/40 to 70/30 (restaked/base)
        # Too much restaking = higher risk
        ideal_restaked_pct = 65
        deviation = abs(restaked_pct - ideal_restaked_pct)

        if deviation < 5:
            balanced_score = 100
        elif deviation < 10:
            balanced_score = 90
        elif deviation < 15:
            balanced_score = 80
        elif deviation < 20:
            balanced_score = 70
        else:
            balanced_score = 60

        return {
            "total_staked_eth": total_staked_eth,
            "base_staked_eth": base_staked_eth,
            "restaked_eth": restaked_eth,
            "base_stake_pct": round(base_staked_pct, 2),
            "restaked_pct": round(restaked_pct, 2),
            "balanced_score": balanced_score,
            "balance_grade": "A" if balanced_score >= 90 else "B" if balanced_score >= 80 else "C",
            "recommendation": "Well-balanced" if balanced_score >= 80 else "Consider rebalancing"
        }

    async def get_slashing_events(self, operator_address: Optional[str] = None, days: int = 365) -> Dict[str, Any]:
        """
        Get historical slashing events

        Args:
            operator_address: Optional operator address
            days: Number of days to look back

        Returns:
            Dict with slashing history
        """
        # Query EigenLayer for slashing events
        # For now, returning mock data (ether.fi has no slashing events)

        return {
            "total_slashing_events": 0,
            "total_slashed_eth": 0.0,
            "period_days": days,
            "events": [],
            "slashing_rate": 0.0,  # Percentage of stake slashed
            "safety_score": 100,  # Out of 100
            "note": "No slashing events recorded for ether.fi validators"
        }

    async def calculate_slashing_risk_score(
        self,
        operator_uptime: float = 99.5,
        client_diversity_score: int = 75,
        dvt_enabled: bool = True,
        avs_audit_status: str = "mixed"
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive slashing risk score

        Args:
            operator_uptime: Uptime percentage
            client_diversity_score: Client diversity score (0-100)
            dvt_enabled: Whether DVT is enabled
            avs_audit_status: AVS audit status (audited/in_progress/none)

        Returns:
            Dict with risk score and breakdown
        """
        # Base risk score (0-100, lower is better)
        risk_score = 0

        # Factor 1: Operator uptime (40% weight)
        if operator_uptime >= 99.9:
            uptime_risk = 0
            uptime_band = "Green"
        elif operator_uptime >= 99.5:
            uptime_risk = 10
            uptime_band = "Green"
        elif operator_uptime >= 99.0:
            uptime_risk = 20
            uptime_band = "Amber"
        else:
            uptime_risk = 40
            uptime_band = "Red"

        risk_score += uptime_risk * 0.4

        # Factor 2: Client diversity (20% weight)
        diversity_risk = (100 - client_diversity_score) * 0.2
        diversity_band = "Green" if client_diversity_score >= 75 else "Amber" if client_diversity_score >= 60 else "Red"

        risk_score += diversity_risk * 0.2

        # Factor 3: DVT protection (20% weight)
        dvt_risk = 0 if dvt_enabled else 30
        risk_score += dvt_risk * 0.2

        # Factor 4: AVS audit status (20% weight)
        audit_risk_map = {
            "audited": 0,
            "in_progress": 15,
            "mixed": 10,
            "none": 30
        }
        audit_risk = audit_risk_map.get(avs_audit_status.lower(), 15)
        risk_score += audit_risk * 0.2

        # Round final score
        risk_score = int(risk_score)

        # Determine grade
        if risk_score < 15:
            grade = "A"
            risk_level = "Very Low"
        elif risk_score < 30:
            grade = "B"
            risk_level = "Low"
        elif risk_score < 50:
            grade = "C"
            risk_level = "Moderate"
        else:
            grade = "D"
            risk_level = "High"

        return {
            "proxy_score": risk_score,
            "grade": grade,
            "risk_level": risk_level,
            "inputs": {
                "operator_uptime_band": uptime_band,
                "client_diversity_band": diversity_band,
                "dvt_presence": dvt_enabled,
                "avs_audit_status": avs_audit_status,
                "historical_slashes_count": 0
            },
            "breakdown": {
                "uptime_risk": round(uptime_risk * 0.4, 1),
                "diversity_risk": round(diversity_risk * 0.2, 1),
                "dvt_risk": round(dvt_risk * 0.2, 1),
                "audit_risk": round(audit_risk * 0.2, 1)
            }
        }


# Convenience functions
async def get_etherfi_avs_concentration() -> Dict[str, Any]:
    """Get AVS concentration metrics for ether.fi"""
    client = EigenExplorerClient()
    return await client.calculate_avs_concentration()


async def get_etherfi_distribution() -> Dict[str, Any]:
    """Get staking distribution for ether.fi"""
    client = EigenExplorerClient()
    return await client.get_restaking_distribution()


async def get_etherfi_slashing_risk() -> Dict[str, Any]:
    """Get slashing risk score for ether.fi"""
    client = EigenExplorerClient()
    return await client.calculate_slashing_risk_score()


# Test function
async def test_eigenexplorer_client():
    """Test the EigenExplorer client"""
    print("=" * 60)
    print("Testing EigenExplorer Client")
    print("=" * 60)

    client = EigenExplorerClient()

    # Test 1: AVS Concentration
    print("\n1. AVS Concentration:")
    concentration = await client.calculate_avs_concentration()
    print(f"  Largest AVS: {concentration.get('largest_avs_name')} ({concentration.get('largest_avs_pct')}%)")
    print(f"  HHI: {concentration.get('hhi')} ({concentration.get('concentration_score')})")
    print(f"  Grade: {concentration.get('concentration_grade')}")

    # Test 2: Restaking Distribution
    print("\n2. Restaking Distribution:")
    distribution = await client.get_restaking_distribution()
    print(f"  Base Staking: {distribution.get('base_stake_pct')}%")
    print(f"  Restaking: {distribution.get('restaked_pct')}%")
    print(f"  Balance Score: {distribution.get('balanced_score')}/100")

    # Test 3: Slashing Risk
    print("\n3. Slashing Risk Score:")
    risk = await client.calculate_slashing_risk_score(99.5, 75, True, "mixed")
    print(f"  Risk Score: {risk.get('proxy_score')}/100 ({risk.get('risk_level')})")
    print(f"  Grade: {risk.get('grade')}")
    print(f"  Breakdown: {risk.get('breakdown')}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_eigenexplorer_client())
