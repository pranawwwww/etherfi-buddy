import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
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

  // Generate dynamic explanation
  const generateExplanation = () => {
    const diversificationScore = calculateDiversificationScore(data.allocation);
    const allocEntries = Object.entries(data.allocation).filter(([_, v]) => v > 0);
    const maxAllocation = Math.max(...allocEntries.map(([_, v]) => v));
    const dominantAsset = allocEntries.find(([_, v]) => v === maxAllocation);
    const isConcentrated = maxAllocation > 70;
    const isDiversified = allocEntries.length >= 3 && maxAllocation < 50;

    return {
      title: "Portfolio Allocation Overview",
      description: `This pie chart shows how your total portfolio value (${totalValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })}) is distributed across different assets.`,
      keyPoints: [
        `🎯 ${allocEntries.length} active asset${allocEntries.length !== 1 ? 's' : ''} in your portfolio`,
        `📊 Largest holding: ${dominantAsset?.[0]} at ${dominantAsset?.[1].toFixed(1)}%`,
        `🎲 Diversification score: ${diversificationScore}/100 ${isDiversified ? '(Well balanced!)' : isConcentrated ? '(Concentrated)' : '(Moderate)'}`,
        `💡 Higher diversification score = lower concentration risk`,
        `🔍 Hover over pie slices to see exact percentages and values`
      ],
      status: {
        type: isDiversified ? 'good' : isConcentrated ? 'warning' : 'neutral',
        message: isDiversified
          ? 'Healthy diversification - portfolio spread across multiple assets'
          : isConcentrated
          ? `High concentration in ${dominantAsset?.[0]} - consider diversifying to reduce risk`
          : 'Moderate allocation - could benefit from more diversification'
      }
    };
  };

  const explanation = data ? generateExplanation() : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Portfolio Allocation</CardTitle>
              {explanation && (
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-96" side="right">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{explanation.title}</h4>
                        <p className="text-xs text-muted-foreground">{explanation.description}</p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold mb-2">Key Information:</div>
                        <ul className="text-xs space-y-1">
                          {explanation.keyPoints.map((point, idx) => (
                            <li key={idx} className="text-muted-foreground">{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-semibold mb-2">Status:</div>
                        <div className={`p-2 rounded-lg flex items-start gap-2 border ${
                          explanation.status.type === 'good'
                            ? 'bg-green-950/40 border-green-500/20'
                            : explanation.status.type === 'warning'
                            ? 'bg-orange-950/40 border-orange-500/20'
                            : 'bg-blue-950/40 border-blue-500/20'
                        }`}>
                          {explanation.status.type === 'good' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : explanation.status.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-xs">{explanation.status.message}</span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
            <CardDescription>
              Current distribution across assets (${totalValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              total)
            </CardDescription>
          </div>
        </div>
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
