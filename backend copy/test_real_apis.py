"""
Comprehensive Test Script for Real API Integrations
Tests Beaconcha.in, Uniswap Subgraph, and EigenExplorer clients
"""
import asyncio
import json
from datetime import datetime


async def test_all_api_clients():
    """Test all API clients comprehensively"""

    print("=" * 80)
    print("COMPREHENSIVE API TESTING SUITE")
    print("Testing: Beaconcha.in, Uniswap Subgraph, EigenExplorer")
    print("=" * 80)

    results = {
        "beaconchain": {"status": "pending", "data": None, "error": None},
        "uniswap": {"status": "pending", "data": None, "error": None},
        "eigenexplorer": {"status": "pending", "data": None, "error": None},
        "enhanced_risk": {"status": "pending", "data": None, "error": None}
    }

    # ========= Test 1: Beaconcha.in Client =========
    print("\n" + "=" * 80)
    print("TEST 1: BEACONCHA.IN CLIENT")
    print("=" * 80)

    try:
        from beaconchain_client import BeaconchainClient

        client = BeaconchainClient()

        print("\n[1.1] Testing uptime metrics...")
        uptime = await client.calculate_uptime_metrics(days=7)
        print(f"✓ Uptime: {uptime.get('uptime_pct')}%")
        print(f"✓ Missed Attestations: {uptime.get('missed_attestations')}")
        print(f"✓ Total Attestations: {uptime.get('total_attestations')}")
        print(f"✓ Validators: {uptime.get('validator_count')}")

        print("\n[1.2] Testing client diversity...")
        diversity = await client.get_client_diversity()
        print(f"✓ Consensus Clients:")
        for client_name, pct in diversity.get("consensus_clients", {}).items():
            print(f"    - {client_name}: {pct}%")
        print(f"✓ Diversity Score: {diversity.get('diversity_score')}/100")

        print("\n[1.3] Testing DVT protection...")
        dvt = await client.check_dvt_protection()
        print(f"✓ DVT Enabled: {dvt.get('dvt_enabled')}")
        print(f"✓ Provider: {dvt.get('dvt_provider')}")
        print(f"✓ Protection: {dvt.get('protection_pct')}%")

        results["beaconchain"]["status"] = "success"
        results["beaconchain"]["data"] = {
            "uptime": uptime,
            "diversity": diversity,
            "dvt": dvt
        }

    except Exception as e:
        print(f"✗ Beaconcha.in test failed: {e}")
        results["beaconchain"]["status"] = "failed"
        results["beaconchain"]["error"] = str(e)

    # ========= Test 2: Uniswap Client =========
    print("\n" + "=" * 80)
    print("TEST 2: UNISWAP SUBGRAPH CLIENT")
    print("=" * 80)

    try:
        from uniswap_client import UniswapClient

        client = UniswapClient()

        print("\n[2.1] Testing Ethereum pools...")
        pools = await client.get_weeth_pools("ethereum")
        print(f"✓ Found {len(pools)} pools on Ethereum")
        if pools:
            for i, pool in enumerate(pools[:2], 1):
                tvl = float(pool.get("totalValueLockedUSD", 0))
                fee = int(pool.get("feeTier", 0)) / 10000
                print(f"    Pool {i}:")
                print(f"      - Pair: {pool.get('token0', {}).get('symbol')}/{pool.get('token1', {}).get('symbol')}")
                print(f"      - TVL: ${tvl:,.2f}")
                print(f"      - Fee: {fee}%")

        print("\n[2.2] Testing liquidity metrics...")
        metrics = await client.calculate_liquidity_metrics("ethereum", 10000)
        print(f"✓ Total TVL: ${metrics.get('total_tvl_usd', 0):,.2f}")
        print(f"✓ Pools Found: {metrics.get('pools_found')}")
        if metrics.get('best_pool'):
            bp = metrics['best_pool']
            print(f"✓ Best Pool:")
            print(f"    - Slippage: {bp.get('slippage_bps')} bps")
            print(f"    - Est. Fee: ${bp.get('est_fee_usd')}")

        print("\n[2.3] Testing multi-chain comparison...")
        all_chains = await client.get_multi_chain_liquidity(10000)
        print(f"✓ Checked {len(all_chains)} chains:")
        for chain_data in all_chains:
            chain_name = chain_data.get('chain', 'Unknown').upper()
            tvl = chain_data.get('total_tvl_usd', 0)
            print(f"    - {chain_name}: ${tvl:,.2f} TVL")
            if chain_data.get('best_pool'):
                slippage = chain_data['best_pool'].get('slippage_bps')
                print(f"      Best slippage: {slippage} bps")

        results["uniswap"]["status"] = "success"
        results["uniswap"]["data"] = {
            "pools_count": len(pools),
            "metrics": metrics,
            "multi_chain": all_chains
        }

    except Exception as e:
        print(f"✗ Uniswap test failed: {e}")
        results["uniswap"]["status"] = "failed"
        results["uniswap"]["error"] = str(e)

    # ========= Test 3: EigenExplorer Client =========
    print("\n" + "=" * 80)
    print("TEST 3: EIGENEXPLORER CLIENT")
    print("=" * 80)

    try:
        from eigenexplorer_client import EigenExplorerClient

        client = EigenExplorerClient()

        print("\n[3.1] Testing AVS concentration...")
        concentration = await client.calculate_avs_concentration()
        print(f"✓ Largest AVS: {concentration.get('largest_avs_name')} ({concentration.get('largest_avs_pct')}%)")
        print(f"✓ HHI: {concentration.get('hhi')} ({concentration.get('concentration_score')})")
        print(f"✓ Concentration Grade: {concentration.get('concentration_grade')}")
        print(f"✓ AVS Split:")
        for avs in concentration.get('avs_split', [])[:3]:
            print(f"    - {avs.get('name')}: {avs.get('pct')}%")

        print("\n[3.2] Testing restaking distribution...")
        distribution = await client.get_restaking_distribution()
        print(f"✓ Base Staking: {distribution.get('base_stake_pct')}%")
        print(f"✓ Restaking: {distribution.get('restaked_pct')}%")
        print(f"✓ Balance Score: {distribution.get('balanced_score')}/100")
        print(f"✓ Grade: {distribution.get('balance_grade')}")

        print("\n[3.3] Testing slashing risk score...")
        risk = await client.calculate_slashing_risk_score(99.5, 75, True, "mixed")
        print(f"✓ Risk Score: {risk.get('proxy_score')}/100")
        print(f"✓ Risk Level: {risk.get('risk_level')}")
        print(f"✓ Grade: {risk.get('grade')}")
        print(f"✓ Breakdown:")
        for factor, value in risk.get('breakdown', {}).items():
            print(f"    - {factor}: {value}")

        results["eigenexplorer"]["status"] = "success"
        results["eigenexplorer"]["data"] = {
            "concentration": concentration,
            "distribution": distribution,
            "risk": risk
        }

    except Exception as e:
        print(f"✗ EigenExplorer test failed: {e}")
        results["eigenexplorer"]["status"] = "failed"
        results["eigenexplorer"]["error"] = str(e)

    # ========= Test 4: Enhanced Risk Analysis =========
    print("\n" + "=" * 80)
    print("TEST 4: ENHANCED RISK ANALYSIS (ALL APIs COMBINED)")
    print("=" * 80)

    try:
        from enhanced_risk_analysis import EnhancedRiskAnalyzer

        analyzer = EnhancedRiskAnalyzer()

        print("\n[4.1] Generating comprehensive risk analysis...")
        analysis = await analyzer.generate_comprehensive_analysis()

        print(f"\n✓ OVERALL RISK SCORE: {analysis.risk_score.score}/100 ({analysis.risk_score.grade})")
        print(f"\n✓ KEY METRICS:")
        print(f"    - Operator Uptime: {analysis.tiles.operator_uptime.uptime_7d_pct}%")
        print(f"    - AVS Concentration: {analysis.tiles.avs_concentration.largest_avs_pct}%")
        print(f"    - Slashing Risk: {analysis.tiles.slashing_proxy.proxy_score}/100")
        print(f"    - Liquidity Health: {analysis.tiles.liquidity_depth.health_index}/100")
        print(f"    - Restaking: {analysis.breakdown.distribution.restaked_pct}%")

        print(f"\n✓ TOP RISK FACTORS:")
        for i, reason in enumerate(analysis.risk_score.top_reasons, 1):
            print(f"    {i}. {reason}")

        print(f"\n✓ LIQUIDITY VENUES:")
        for chain in analysis.tiles.liquidity_depth.chains[:3]:
            print(f"    - {chain.chain}: {chain.pool}")
            print(f"      TVL: ${chain.depth_usd:,.2f} | Slippage: {chain.slippage_bps} bps")

        results["enhanced_risk"]["status"] = "success"
        results["enhanced_risk"]["data"] = {
            "risk_score": analysis.risk_score.score,
            "grade": analysis.risk_score.grade,
            "methodology": analysis.methodology_version
        }

    except Exception as e:
        print(f"✗ Enhanced risk analysis test failed: {e}")
        results["enhanced_risk"]["status"] = "failed"
        results["enhanced_risk"]["error"] = str(e)

    # ========= Summary =========
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)

    total_tests = len(results)
    passed_tests = sum(1 for r in results.values() if r["status"] == "success")
    failed_tests = sum(1 for r in results.values() if r["status"] == "failed")

    print(f"\nTotal Tests: {total_tests}")
    print(f"Passed: {passed_tests} ✓")
    print(f"Failed: {failed_tests} ✗")

    print("\nDetailed Results:")
    for test_name, result in results.items():
        status_symbol = "✓" if result["status"] == "success" else "✗"
        print(f"  {status_symbol} {test_name.upper()}: {result['status']}")
        if result["error"]:
            print(f"      Error: {result['error']}")

    # Save results to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"test_results_{timestamp}.json"

    with open(output_file, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total": total_tests,
                "passed": passed_tests,
                "failed": failed_tests
            },
            "results": results
        }, f, indent=2, default=str)

    print(f"\n✓ Results saved to: {output_file}")

    print("\n" + "=" * 80)
    print("TESTING COMPLETE!")
    print("=" * 80)

    return results


async def quick_test():
    """Quick test of core functionality"""
    print("QUICK TEST - Testing core functionality only\n")

    try:
        from enhanced_risk_analysis import EnhancedRiskAnalyzer
        analyzer = EnhancedRiskAnalyzer()
        analysis = await analyzer.generate_comprehensive_analysis()

        print(f"✓ Risk Score: {analysis.risk_score.score}/100 ({analysis.risk_score.grade})")
        print(f"✓ Methodology: {analysis.methodology_version}")
        print("\nQuick test PASSED!")
        return True

    except Exception as e:
        print(f"✗ Quick test FAILED: {e}")
        return False


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "quick":
        # Quick test
        asyncio.run(quick_test())
    else:
        # Full test suite
        asyncio.run(test_all_api_clients())
