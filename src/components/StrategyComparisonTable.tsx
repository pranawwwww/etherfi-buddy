import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDemoState } from '@/contexts/DemoContext';
import { api } from '@/lib/api';
import { formatPercentage, formatETH, formatUSD } from '@/lib/helpers';
import type { SimulateResponse } from '@/lib/types';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StrategyComparisonTable() {
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
    return <div>Loading comparison...</div>;
  }

  const ethPrice = 3500;
  const totalEthValue =
    demoState.balances.ETH +
    demoState.balances.eETH +
    demoState.balances.weETH +
    demoState.balances.LiquidUSD / ethPrice;

  // Current strategy
  const currentApy = simulation.blendedApy;
  const currentYearlyEth = totalEthValue * currentApy;
  const currentComplexity = calculateComplexity(demoState.balances);

  // Conservative strategy (from simulation)
  const conservative = simulation.strategies.find((s) => s.name === 'Conservative');
  const conservativeApy = conservative?.apy || 0;
  const conservativeYearlyEth = conservative?.yearlyEth || 0;

  // Active strategy (from simulation)
  const active = simulation.strategies.find((s) => s.name === 'Active');
  const activeApy = active?.apy || 0;
  const activeYearlyEth = active?.yearlyEth || 0;

  const rows = [
    {
      metric: 'APY',
      current: formatPercentage(currentApy),
      conservative: formatPercentage(conservativeApy),
      active: formatPercentage(activeApy),
      format: 'percentage',
    },
    {
      metric: 'Annual Yield',
      current: formatETH(currentYearlyEth, 3),
      conservative: formatETH(conservativeYearlyEth, 3),
      active: formatETH(activeYearlyEth, 3),
      format: 'eth',
    },
    {
      metric: 'Annual USD',
      current: formatUSD(currentYearlyEth * ethPrice),
      conservative: formatUSD(conservativeYearlyEth * ethPrice),
      active: formatUSD(activeYearlyEth * ethPrice),
      format: 'usd',
    },
    {
      metric: 'Risk Level',
      current: simulation.risk,
      conservative: 'Low',
      active: 'Medium-High',
      format: 'risk',
    },
    {
      metric: 'Complexity',
      current: currentComplexity,
      conservative: 'Very Simple',
      active: 'Moderate',
      format: 'text',
    },
    {
      metric: 'Actions Needed',
      current: 'None',
      conservative: 'Simplify holdings',
      active: 'Borrow + Redeploy',
      format: 'text',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Comparison: Current vs Recommended</CardTitle>
        <CardDescription>
          See how your current strategy stacks up against alternatives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Metric</th>
                <th className="text-center py-3 px-4 font-semibold bg-primary/10">
                  <div className="flex flex-col items-center">
                    <span>My Current</span>
                    <Badge variant="default" className="mt-1">
                      Active Now
                    </Badge>
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-semibold">Conservative</th>
                <th className="text-center py-3 px-4 font-semibold">Active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.metric} className={idx % 2 === 0 ? 'bg-secondary/30' : ''}>
                  <td className="py-3 px-4 font-medium">{row.metric}</td>
                  <td className="text-center py-3 px-4 bg-primary/5">
                    {renderCell(row.current, row.format)}
                  </td>
                  <td className="text-center py-3 px-4">
                    {renderCell(row.conservative, row.format)}
                    {renderComparison(
                      row.current,
                      row.conservative,
                      row.metric,
                      row.format
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {renderCell(row.active, row.format)}
                    {renderComparison(row.current, row.active, row.metric, row.format)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComparisonInsight
            title="vs Conservative"
            current={currentApy}
            compared={conservativeApy}
            metric="APY"
          />
          <ComparisonInsight
            title="vs Active"
            current={currentApy}
            compared={activeApy}
            metric="APY"
          />
        </div>

        {/* Strategy Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {conservative && (
            <StrategyDetailCard
              title="Conservative Strategy"
              strategy={conservative}
              isCurrent={false}
            />
          )}
          {active && (
            <StrategyDetailCard
              title="Active Strategy"
              strategy={active}
              isCurrent={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function renderCell(value: string, format: string) {
  if (format === 'risk') {
    const color =
      value === 'Low'
        ? 'text-green-600'
        : value === 'Medium' || value === 'Medium-High'
        ? 'text-yellow-600'
        : 'text-red-600';
    return <span className={`font-semibold ${color}`}>{value}</span>;
  }
  return <span className="font-semibold">{value}</span>;
}

function renderComparison(
  current: string,
  compared: string,
  metric: string,
  format: string
) {
  if (metric === 'APY' || metric === 'Annual Yield' || metric === 'Annual USD') {
    const currentNum = parseFloat(current.replace(/[^0-9.]/g, ''));
    const comparedNum = parseFloat(compared.replace(/[^0-9.]/g, ''));

    if (comparedNum > currentNum) {
      const diff = comparedNum - currentNum;
      return (
        <div className="flex items-center justify-center gap-1 text-xs text-green-600 mt-1">
          <TrendingUp className="h-3 w-3" />
          <span>
            +{format === 'percentage' ? diff.toFixed(2) + '%' : diff.toFixed(2)}
          </span>
        </div>
      );
    } else if (comparedNum < currentNum) {
      const diff = currentNum - comparedNum;
      return (
        <div className="flex items-center justify-center gap-1 text-xs text-red-600 mt-1">
          <TrendingDown className="h-3 w-3" />
          <span>
            -{format === 'percentage' ? diff.toFixed(2) + '%' : diff.toFixed(2)}
          </span>
        </div>
      );
    }
  }
  return null;
}

function calculateComplexity(balances: any): string {
  const activeAssets = Object.values(balances).filter((v) => v as number > 0).length;

  if (activeAssets === 1) return 'Very Simple';
  if (activeAssets === 2) return 'Simple';
  if (activeAssets === 3) return 'Moderate';
  return 'Complex';
}

function ComparisonInsight({
  title,
  current,
  compared,
  metric,
}: {
  title: string;
  current: number;
  compared: number;
  metric: string;
}) {
  const diff = compared - current;
  const diffPct = current > 0 ? (diff / current) * 100 : 0;
  const isPositive = diff > 0;

  return (
    <div
      className={`p-4 rounded-lg border ${
        isPositive
          ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
          : 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800'
      }`}
    >
      <div className="text-sm font-semibold mb-2">{title}</div>
      <div className="flex items-center gap-2">
        {isPositive ? (
          <TrendingUp className="h-5 w-5 text-green-600" />
        ) : (
          <TrendingDown className="h-5 w-5 text-orange-600" />
        )}
        <div>
          <div className="text-2xl font-bold">
            {isPositive ? '+' : ''}
            {formatPercentage(diff)}
          </div>
          <div className="text-xs text-muted-foreground">
            {isPositive ? 'Higher' : 'Lower'} APY ({diffPct > 0 ? '+' : ''}
            {diffPct.toFixed(1)}%)
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyDetailCard({
  title,
  strategy,
  isCurrent,
}: {
  title: string;
  strategy: any;
  isCurrent: boolean;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{title}</h4>
        {isCurrent && (
          <Badge variant="default" className="text-xs">
            Current
          </Badge>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">APY:</span>{' '}
          <span className="font-semibold text-green-600">
            {formatPercentage(strategy.apy)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Steps:</span>
          <ul className="mt-1 space-y-1 ml-4">
            {strategy.steps.map((step: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-muted-foreground">Risks:</span>
          <ul className="mt-1 space-y-1 ml-4">
            {strategy.risks.map((risk: string, idx: number) => (
              <li key={idx} className="text-orange-600 text-xs">
                • {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
