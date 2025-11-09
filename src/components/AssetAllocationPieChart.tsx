import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useDemoState } from '@/contexts/DemoContext';
import type { MultiAssetForecastResponse } from '@/lib/types';

const COLORS = {
  ETH: '#627EEA',
  eETH: '#7B3FE4',
  weETH: '#9D4EDD',
  LiquidUSD: '#06D6A0',
  WBTC: '#F7931A',
  LiquidBTC: '#FF9500',
};

export function AssetAllocationPieChart() {
  const { demoState } = useDemoState();
  const [data, setData] = useState<MultiAssetForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .multiAssetForecast(
        {
          balances: demoState.balances,
          assumptions: demoState.assumptions,
        },
        12,
        3500
      )
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [demoState]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Failed to load data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Transform allocation data for pie chart
  const pieData = Object.entries(data.allocation)
    .filter(([_, percentage]) => percentage > 0)
    .map(([asset, percentage]) => ({
      name: asset,
      value: percentage,
    }));

  const totalValue = data.assets.reduce((sum, asset) => sum + asset.currentValue, 0);

  // Custom label for pie slices
  const renderLabel = (entry: any) => {
    return `${entry.value.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
        <CardDescription>
          Current distribution across assets (${totalValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name as keyof typeof COLORS] || '#888'}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-6 space-y-3">
          <div className="text-sm font-semibold text-muted-foreground">Breakdown</div>
          {data.assets.map((asset) => {
            const percentage = data.allocation[asset.asset];
            const color = COLORS[asset.asset as keyof typeof COLORS] || '#888';

            return (
              <div key={asset.asset} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium">{asset.asset}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">
                    ${asset.currentValue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diversification Score */}
        <div className="mt-6 p-4 bg-secondary rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Diversification Score</div>
              <div className="text-xs text-muted-foreground">
                Based on asset concentration
              </div>
            </div>
            <div className="text-2xl font-bold">
              {calculateDiversificationScore(data.allocation)}/100
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateDiversificationScore(allocation: Record<string, number>): number {
  // Higher score = more diversified
  // Use inverse of Herfindahl index scaled to 0-100
  const entries = Object.values(allocation).filter((v) => v > 0);
  if (entries.length === 0) return 0;

  // Herfindahl index: sum of squared percentages (as decimals)
  const herfindahl = entries.reduce((sum, pct) => sum + Math.pow(pct / 100, 2), 0);

  // Perfect diversification (4 equal assets) = 0.25
  // Single asset = 1.0
  // Invert and scale: higher = more diversified
  const score = ((1 - herfindahl) / (1 - 1 / entries.length)) * 100;

  return Math.min(100, Math.max(0, Math.round(score)));
}
