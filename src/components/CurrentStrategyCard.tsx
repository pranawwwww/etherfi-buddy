import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDemoState } from '@/contexts/DemoContext';
import { api } from '@/lib/api';
import { formatETH, formatUSD, formatPercentage, healthScore, healthBadge } from '@/lib/helpers';
import type { SimulateResponse } from '@/lib/types';
import { TrendingUp, AlertTriangle, Shield, Zap } from 'lucide-react';

export function CurrentStrategyCard() {
  const { demoState } = useDemoState();
  const [simulation, setSimulation] = useState<SimulateResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .simulate({
        balances: demoState.balances,
        assumptions: demoState.assumptions,
      })
      .then(setSimulation)
      .catch(console.error)
      .finally(() => setLoading(false));
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

  const ethPrice = 3500;
  const totalEthValue =
    demoState.balances.ETH +
    demoState.balances.eETH +
    demoState.balances.weETH +
    demoState.balances.LiquidUSD / ethPrice;

  const totalUsdValue = totalEthValue * ethPrice;

  const annualEthEarnings = totalEthValue * simulation.blendedApy;
  const annualUsdEarnings = annualEthEarnings * ethPrice;

  const health = healthScore(
    simulation.risk,
    demoState.balances.weETH,
    demoState.balances.LiquidUSD,
    ethPrice
  );
  const healthStatus = healthBadge(health);

  // Calculate position breakdown
  const positions = [
    {
      asset: 'ETH',
      amount: demoState.balances.ETH,
      value: demoState.balances.ETH * ethPrice,
      apy: 0,
      earning: 'Earning 0% (Idle)',
    },
    {
      asset: 'eETH',
      amount: demoState.balances.eETH,
      value: demoState.balances.eETH * ethPrice,
      apy: demoState.assumptions.apyStake,
      earning: `Earning ${formatPercentage(demoState.assumptions.apyStake)} APY`,
    },
    {
      asset: 'weETH',
      amount: demoState.balances.weETH,
      value: demoState.balances.weETH * ethPrice,
      apy: demoState.assumptions.apyStake,
      earning: `Earning ${formatPercentage(demoState.assumptions.apyStake)} APY`,
    },
    {
      asset: 'Liquid USD',
      amount: demoState.balances.LiquidUSD,
      value: demoState.balances.LiquidUSD,
      apy: demoState.assumptions.apyLiquidUsd,
      earning: `Earning ${formatPercentage(demoState.assumptions.apyLiquidUsd)} APY`,
    },
  ].filter((p) => p.amount > 0);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'Good':
        return 'bg-green-500';
      case 'Caution':
        return 'bg-yellow-500';
      case 'Risky':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

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
          <Badge className={getRiskColor(simulation.risk)} variant="outline">
            {simulation.risk} Risk
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold">{formatUSD(totalUsdValue)}</div>
            <div className="text-xs text-muted-foreground">
              {formatETH(totalEthValue, 2)}
            </div>
          </div>

          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-sm text-muted-foreground">Blended APY</div>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(simulation.blendedApy)}
            </div>
            <div className="text-xs text-muted-foreground">Current yield</div>
          </div>

          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-sm text-muted-foreground">Annual Earnings</div>
            <div className="text-2xl font-bold">~{formatETH(annualEthEarnings, 3)}</div>
            <div className="text-xs text-muted-foreground">
              {formatUSD(annualUsdEarnings)}
            </div>
          </div>

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
                  <div className="font-semibold">{position.asset}</div>
                  <div className="text-sm text-muted-foreground">
                    {position.asset === 'Liquid USD'
                      ? formatUSD(position.amount)
                      : `${position.amount.toFixed(4)} ${position.asset}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatUSD(position.value)}</div>
                  <div
                    className={`text-sm ${
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
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
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
          <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-semibold text-orange-900 dark:text-orange-100">
                  Optimization Opportunities
                </div>
                <ul className="text-sm text-orange-800 dark:text-orange-200 mt-2 space-y-1">
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
