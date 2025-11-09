import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDemoState } from '@/contexts/DemoContext';
import { api } from '@/lib/api';
import { formatETH, formatUSD, formatPercentage, healthScore, healthBadge } from '@/lib/helpers';
import type { SimulateResponse } from '@/lib/types';
<<<<<<< HEAD
import { TrendingUp, AlertTriangle, Shield, Zap, Fuel } from 'lucide-react';
=======
import { TrendingUp, AlertTriangle, Shield, Zap } from 'lucide-react';
import { Explainable } from '@/components/Explainable';
>>>>>>> 9f0e84d8b37ac9c382ef03c4fd10a8ce4e4ae37f

export function CurrentStrategyCard() {
  const { demoState } = useDemoState();
  const [simulation, setSimulation] = useState<SimulateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [livePrices, setLivePrices] = useState<any>(null);
  const [liveApy, setLiveApy] = useState<any>(null);
  const [gasData, setGasData] = useState<{ gasPriceGwei: number; source: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // First fetch prices to get live ETH price
        const [prices, apy, gas] = await Promise.all([
          api.prices().catch(() => null),
          api.apy().catch(() => null),
          api.gasPrice().catch(() => ({ gasPriceGwei: 20, source: 'fallback' })),
        ]);

        setLivePrices(prices);
        setLiveApy(apy);
        setGasData(gas);

        // Extract live ETH price
        const getPrice = (priceData: any) => {
          if (!priceData) return null;
          if (typeof priceData === 'number') return priceData;
          if (priceData && typeof priceData === 'object' && 'price' in priceData) {
            return typeof priceData.price === 'number' ? priceData.price : priceData.price?.price;
          }
          return null;
        };
        const liveEthPrice = getPrice(prices?.weETH?.price) || getPrice(prices?.eETH?.price) || 3500;

        // Now simulate with live ETH price
        const sim = await api.simulate({
          balances: demoState.balances,
          assumptions: demoState.assumptions,
          ethPrice: liveEthPrice,
        });

        setSimulation(sim);
        console.log('[CurrentStrategyCard] Data loaded:', {
          user: demoState.balances,
          liveEthPrice,
          simulation: sim,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [demoState]);

  if (loading || !simulation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Current Strategy</CardTitle>
          <CardDescription>Loading your current position...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Use live prices if available, otherwise fallback to static price
  // Handle double-nested price structure from API
  const getPrice = (priceData: any) => {
    if (!priceData) return null;
    if (typeof priceData === 'number') return priceData;
    if (priceData && typeof priceData === 'object' && 'price' in priceData) {
      return typeof priceData.price === 'number' ? priceData.price : priceData.price?.price;
    }
    return null;
  };

  const ethPrice = getPrice(livePrices?.weETH?.price) || getPrice(livePrices?.eETH?.price) || 3500;
  const eethPrice = getPrice(livePrices?.eETH?.price) || ethPrice;
  const weethPrice = getPrice(livePrices?.weETH?.price) || ethPrice;

  // Use live APY if available, otherwise fallback to assumptions
  const eethApy = liveApy?.eETH?.apy || demoState.assumptions.apyStake;
  const weethApy = liveApy?.weETH?.apy || demoState.assumptions.apyStake;
  const liquidUsdApy = liveApy?.eETH?.apy || demoState.assumptions.apyLiquidUsd;

  const totalEthValue =
    demoState.balances.ETH +
    demoState.balances.eETH +
    demoState.balances.weETH +
    demoState.balances.LiquidUSD / ethPrice;

  const totalUsdValue =
    demoState.balances.ETH * ethPrice +
    demoState.balances.eETH * eethPrice +
    demoState.balances.weETH * weethPrice +
    demoState.balances.LiquidUSD;

  const annualEthEarnings = totalEthValue * simulation.blendedApy;
  const annualUsdEarnings = annualEthEarnings * ethPrice;

  const health = healthScore(
    simulation.risk,
    demoState.balances.weETH,
    demoState.balances.LiquidUSD,
    ethPrice
  );
  const healthStatus = healthBadge(health);

  console.log('[CurrentStrategyCard] Health calculation:', {
    risk: simulation.risk,
    weETH: demoState.balances.weETH,
    liquidUSD: demoState.balances.LiquidUSD,
    ethPrice,
    healthScore: health,
    healthStatus,
  });

  // Calculate position breakdown with REAL prices and APY
  const positions = [
    {
      asset: 'ETH',
      amount: demoState.balances.ETH,
      value: demoState.balances.ETH * ethPrice,
      apy: 0,
      earning: 'Earning 0% (Idle)',
      isLive: false,
    },
    {
      asset: 'eETH',
      amount: demoState.balances.eETH,
      value: demoState.balances.eETH * eethPrice,
      apy: eethApy,
      earning: `Earning ${formatPercentage(eethApy)} APY`,
      isLive: !!liveApy,
    },
    {
      asset: 'weETH',
      amount: demoState.balances.weETH,
      value: demoState.balances.weETH * weethPrice,
      apy: weethApy,
      earning: `Earning ${formatPercentage(weethApy)} APY`,
      isLive: !!liveApy,
    },
    {
      asset: 'Liquid USD',
      amount: demoState.balances.LiquidUSD,
      value: demoState.balances.LiquidUSD,
      apy: liquidUsdApy,
      earning: `Earning ${formatPercentage(liquidUsdApy)} APY`,
      isLive: !!liveApy,
    },
  ].filter((p) => p.amount > 0);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-secondary text-muted-foreground';
    }
  };

  const getHealthBanner = (score: number, status: string) => {
    if (score >= 70) {
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-500',
        emoji: '✅',
        title: 'Excellent Portfolio Health',
        description: 'Your portfolio is well-balanced and low-risk. Continue with your current strategy.'
      };
    } else if (score >= 50) {
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-500',
        emoji: '⚠️',
        title: 'Moderate Portfolio Health',
        description: 'Your portfolio has some exposure but is manageable. Consider diversifying to reduce risk.'
      };
    } else {
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-500',
        emoji: '🚨',
        title: 'Portfolio Needs Attention',
        description: 'High concentration risk detected. Diversify across more assets to improve health.'
      };
    }
  };

  const healthBanner = getHealthBanner(health, healthStatus);

  // Calculate gas cost to optimize portfolio
  const calculateGasCost = () => {
    if (!gasData) return null;

    const gasPriceGwei = gasData.gasPriceGwei;

    // Gas estimates for common operations
    const GAS_STAKE_ETH_TO_EETH = 50000; // ~50k gas to stake ETH → eETH
    const GAS_WRAP_EETH_TO_WEETH = 35000; // ~35k gas to wrap eETH → weETH

    // Calculate total gas needed
    const totalGas = GAS_STAKE_ETH_TO_EETH + GAS_WRAP_EETH_TO_WEETH;

    // Convert to ETH (1 gwei = 10^-9 ETH)
    const gasCostEth = (totalGas * gasPriceGwei) / 1e9;

    // Convert to USD
    const gasCostUsd = gasCostEth * ethPrice;

    return {
      totalGas,
      gasPriceGwei,
      gasCostEth,
      gasCostUsd,
      source: gasData.source,
    };
  };

  const gasCost = calculateGasCost();

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              My Current Strategy
            </CardTitle>
            <CardDescription>What you're holding right now</CardDescription>
          </div>
          <Explainable 
            term="Risk Level" 
            type="metric"
            data={{
              level: simulation.risk,
              totalValue: totalUsdValue,
              healthScore: health,
              positions: positions.length
            }}
          >
            <Badge className={getRiskColor(simulation.risk)} variant="outline">
              {simulation.risk} Risk
            </Badge>
          </Explainable>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Portfolio Health Banner - PROMINENT */}
        <div className={`p-6 rounded-lg border-2 ${healthBanner.bg} ${healthBanner.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{healthBanner.emoji}</div>
              <div>
                <div className={`text-2xl font-bold ${healthBanner.text} mb-1`}>
                  {healthBanner.title}
                </div>
                <div className="text-sm text-muted-foreground max-w-2xl">
                  {healthBanner.description}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold ${healthBanner.text}`}>
                {health}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Health Score
              </div>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold">{formatUSD(totalUsdValue)}</div>
            <div className="text-xs text-muted-foreground">
              {formatETH(totalEthValue, 2)}
=======
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Explainable 
            term="Total Portfolio Value"
            type="balance"
            data={{
              valueUSD: totalUsdValue,
              valueETH: totalEthValue,
              ethPrice: ethPrice,
              positions: positions.map(p => ({ asset: p.asset, value: p.value }))
            }}
          >
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="text-2xl font-bold">{formatUSD(totalUsdValue)}</div>
              <div className="text-xs text-muted-foreground">
                {formatETH(totalEthValue, 2)}
              </div>
>>>>>>> 9f0e84d8b37ac9c382ef03c4fd10a8ce4e4ae37f
            </div>
          </Explainable>

          <Explainable 
            term="Blended APY"
            type="metric"
            data={{
              value: simulation.blendedApy * 100,
              unit: '%',
              positions: positions.map(p => ({ asset: p.asset, apy: p.apy, value: p.value })),
              totalValue: totalUsdValue
            }}
          >
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-sm text-muted-foreground">Blended APY</div>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(simulation.blendedApy)}
              </div>
              <div className="text-xs text-muted-foreground">Current yield</div>
            </div>
          </Explainable>

          <Explainable 
            term="Annual Earnings"
            type="metric"
            data={{
              earningsETH: annualEthEarnings,
              earningsUSD: annualUsdEarnings,
              blendedAPY: simulation.blendedApy * 100,
              totalValueETH: totalEthValue,
              totalValueUSD: totalUsdValue
            }}
          >
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-sm text-muted-foreground">Annual Earnings</div>
              <div className="text-2xl font-bold">~{formatETH(annualEthEarnings, 3)}</div>
              <div className="text-xs text-muted-foreground">
                {formatUSD(annualUsdEarnings)}
              </div>
            </div>
<<<<<<< HEAD
          </div>
=======
          </Explainable>

          <Explainable 
            term="Portfolio Health Score"
            type="metric"
            data={{
              score: health,
              status: healthStatus,
              riskLevel: simulation.risk,
              totalValue: totalUsdValue,
              diversification: (positions.length > 1 ? 'Diversified' : 'Concentrated')
            }}
          >
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-sm text-muted-foreground">Health Score</div>
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${getHealthColor(healthStatus)}`}
                />
                <div className="text-2xl font-bold">{health}/100</div>
              </div>
              <div className="text-xs text-muted-foreground">{healthStatus}</div>
            </div>
          </Explainable>
>>>>>>> 9f0e84d8b37ac9c382ef03c4fd10a8ce4e4ae37f
        </div>

        {/* Position Breakdown */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Positions
          </h3>
          <div className="space-y-3">
            {positions.map((position) => (
              <div
                key={position.asset}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{position.asset}</span>
                    {position.isLive && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                        Live
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {position.asset === 'Liquid USD'
                      ? formatUSD(position.amount)
                      : `${position.amount.toFixed(4)} ${position.asset}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatUSD(position.value)}</div>
                  <div
                    className={`text-sm flex items-center justify-end gap-1 ${
                      position.apy > 0 ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {position.earning}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Classification */}
        <div className="p-4 bg-gradient-to-r from-blue-950/40 to-purple-950/40 rounded-lg border border-blue-500/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Strategy Classification
          </h3>
          <div className="text-sm space-y-1">
            {getStrategyClassification(demoState.balances, totalUsdValue)}
          </div>
        </div>

        {/* Warnings if any */}
        {(health < 70 || simulation.risk === 'High') && (
          <div className="p-4 bg-secondary border-l-4 border-l-orange-500 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-foreground mb-2">
                  Optimization Opportunities
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {health < 70 && (
                    <li>
                      • Your health score is below optimal. Consider diversifying.
                    </li>
                  )}
                  {simulation.risk === 'High' && (
                    <li>
                      • High concentration risk detected. Spread across more asset
                      types.
                    </li>
                  )}
                  {demoState.balances.ETH > 0 && (
                    <li>
                      • You have idle ETH earning 0%. Consider staking for ~4% APY.
                    </li>
                  )}
                </ul>

                {/* Gas Cost Estimator Badge */}
                {gasCost && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg cursor-help">
                            <Fuel className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              ⛽ Gas to optimize: ~{formatUSD(gasCost.gasCostUsd)} at current prices
                            </span>
                            {gasCost.source === 'etherscan' && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                Live
                              </Badge>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p className="text-sm">
                            We'll help you find the best time to optimize based on gas prices.
                            Current gas: {gasCost.gasPriceGwei.toFixed(1)} gwei.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Estimated cost: Stake ETH→eETH (50k gas) + Wrap eETH→weETH (35k gas) = 85k gas total
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStrategyClassification(balances: any, totalValue: number) {
  const ethDerivativesValue =
    (balances.ETH + balances.eETH + balances.weETH) * 3500;
  const stablesValue = balances.LiquidUSD;

  const ethPct = (ethDerivativesValue / totalValue) * 100;
  const stablePct = (stablesValue / totalValue) * 100;

  if (ethPct > 80) {
    return (
      <p>
        <strong>ETH Maximalist:</strong> You're heavily concentrated in ETH and its
        derivatives ({ethPct.toFixed(0)}%). High upside potential, but also high
        volatility.
      </p>
    );
  } else if (stablePct > 80) {
    return (
      <p>
        <strong>Conservative Saver:</strong> You're mostly in stablecoins (
        {stablePct.toFixed(0)}%). Low volatility, steady yield, but limited growth
        potential.
      </p>
    );
  } else if (ethPct >= 50 && ethPct <= 70) {
    return (
      <p>
        <strong>Balanced Growth:</strong> You have a healthy mix of ETH (
        {ethPct.toFixed(0)}%) and stables ({stablePct.toFixed(0)}%). Good balance of
        growth and stability.
      </p>
    );
  } else {
    return (
      <p>
        <strong>Moderate Approach:</strong> Your portfolio is diversified across
        multiple asset types. ETH exposure: {ethPct.toFixed(0)}%, Stables:{' '}
        {stablePct.toFixed(0)}%.
      </p>
    );
  }
}
