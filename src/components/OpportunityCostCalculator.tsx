import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDemoState } from '@/contexts/DemoContext';
import { api } from '@/lib/api';
import { formatETH, formatUSD, formatPercentage } from '@/lib/helpers';
import type { SimulateResponse } from '@/lib/types';
import { DollarSign, TrendingUp, AlertCircle, Calendar } from 'lucide-react';

export function OpportunityCostCalculator() {
  const { demoState } = useDemoState();
  const [simulation, setSimulation] = useState<SimulateResponse | null>(null);

  useEffect(() => {
    api
      .simulate({
        balances: demoState.balances,
        assumptions: demoState.assumptions,
      })
      .then(setSimulation)
      .catch(console.error);
  }, [demoState]);

  if (!simulation) {
    return <div>Loading opportunity cost...</div>;
  }

  const ethPrice = 3500;
  const totalEthValue =
    demoState.balances.ETH +
    demoState.balances.eETH +
    demoState.balances.weETH +
    demoState.balances.LiquidUSD / ethPrice;

  const currentApy = simulation.blendedApy;
  const currentYearlyEth = totalEthValue * currentApy;
  const currentYearlyUsd = currentYearlyEth * ethPrice;

  // Find best strategy
  const bestStrategy = simulation.strategies.reduce((best, current) =>
    current.apy > best.apy ? current : best
  );

  const bestApy = bestStrategy.apy;
  const bestYearlyEth = totalEthValue * bestApy;
  const bestYearlyUsd = bestYearlyEth * ethPrice;

  // Calculate opportunity cost
  const missedEthPerYear = bestYearlyEth - currentYearlyEth;
  const missedUsdPerYear = missedEthPerYear * ethPrice;
  const missedApyPoints = (bestApy - currentApy) * 100;

  // Time horizons
  const timeHorizons = [
    { period: '1 Month', months: 1 },
    { period: '3 Months', months: 3 },
    { period: '6 Months', months: 6 },
    { period: '1 Year', months: 12 },
    { period: '2 Years', months: 24 },
  ];

  const efficiencyScore = (currentApy / bestApy) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Opportunity Cost: What You're Missing
        </CardTitle>
        <CardDescription>
          Calculate potential earnings by switching to the optimal strategy
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Efficiency Score */}
        <div className="p-4 bg-gradient-to-r from-orange-950/40 to-red-950/40 rounded-lg border border-orange-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="font-semibold">Strategy Efficiency</span>
            </div>
            <span className="text-2xl font-bold">{efficiencyScore.toFixed(1)}%</span>
          </div>
          <Progress value={efficiencyScore} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">
            {efficiencyScore >= 95
              ? 'Excellent! You\'re nearly optimized.'
              : efficiencyScore >= 80
              ? 'Good, but there\'s room for improvement.'
              : efficiencyScore >= 60
              ? 'You\'re leaving significant returns on the table.'
              : 'Major optimization opportunity! Consider switching strategies.'}
          </p>
        </div>

        {/* Current vs Optimal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Current Strategy</div>
            <div className="text-2xl font-bold">{formatPercentage(currentApy)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatUSD(currentYearlyUsd)}/year
            </div>
          </div>

          <div className="text-center p-4 border rounded-lg bg-green-950/40 border-green-500/20">
            <div className="text-sm text-muted-foreground mb-1">
              Optimal Strategy ({bestStrategy.name})
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(bestApy)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatUSD(bestYearlyUsd)}/year
            </div>
          </div>
        </div>

        {/* Missed Earnings */}
        {missedEthPerYear > 0 && (
          <>
            <div className="p-4 bg-secondary border-l-4 border-l-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">
                    You're Missing Out
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Per Year
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatETH(missedEthPerYear, 4)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatUSD(missedUsdPerYear)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        APY Points
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        +{missedApyPoints.toFixed(2)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Available gain
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Horizon Breakdown */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Missed Earnings Over Time
              </h3>
              <div className="space-y-2">
                {timeHorizons.map((horizon) => {
                  const missedEth = (missedEthPerYear / 12) * horizon.months;
                  const missedUsd = missedEth * ethPrice;
                  const barWidth = (horizon.months / 24) * 100;

                  return (
                    <div key={horizon.period} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium">{horizon.period}</div>
                      <div className="flex-1">
                        <div className="relative h-8 bg-secondary rounded overflow-hidden">
                          <div
                            className="absolute h-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-end px-2"
                            style={{ width: `${barWidth}%` }}
                          >
                            <span className="text-xs font-semibold text-white">
                              {formatETH(missedEth, 3)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm font-semibold">
                        {formatUSD(missedUsd)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Recommendation */}
            <div className="p-4 bg-blue-950/40 border border-blue-500/20 rounded-lg">
              <h3 className="font-semibold mb-2">
                💡 Recommendation
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                By switching to the <strong>{bestStrategy.name}</strong> strategy,
                you could earn an additional{' '}
                <strong>{formatETH(missedEthPerYear, 3)}</strong> (
                {formatUSD(missedUsdPerYear)}) per year.
              </p>
              <div className="text-sm text-muted-foreground">
                <strong>Next Steps:</strong>
                <ol className="list-decimal ml-5 mt-1 space-y-1">
                  {bestStrategy.steps.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </>
        )}

        {missedEthPerYear <= 0 && (
          <div className="p-4 bg-green-950/40 border border-green-500/20 rounded-lg text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">
              You're Optimized!
            </h3>
            <p className="text-sm text-muted-foreground">
              Your current strategy is already at or near the optimal APY. Great job!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
