import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Info } from 'lucide-react';
import { api } from '@/lib/api';
import { useDemoState } from '@/contexts/DemoContext';
import type { MultiAssetForecastResponse } from '@/lib/types';
import { formatUSD } from '@/lib/helpers';

const ASSET_COLORS = {
  ETH: '#627EEA',
  eETH: '#7B3FE4',
  weETH: '#9D4EDD',
  LiquidUSD: '#06D6A0',
  Total: '#FFB703',
};

export function MultiAssetChart() {
  const { demoState } = useDemoState();
  const [data, setData] = useState<MultiAssetForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(
    new Set(['ETH', 'eETH', 'weETH', 'LiquidUSD', 'Total'])
  );

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
          <CardTitle>Multi-Asset Performance</CardTitle>
          <CardDescription>Loading asset forecasts...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Asset Performance</CardTitle>
          <CardDescription>Failed to load data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Transform data for Recharts
  const chartData: any[] = [];

  // Combine all time periods
  const maxMonths = Math.max(
    ...data.assets.map((a) => a.historical.length + a.projection.length)
  );

  for (let i = 0; i < maxMonths; i++) {
    const monthOffset = i - 12; // Historical starts at -12
    const point: any = { month: monthOffset };

    // Add each asset's value
    data.assets.forEach((asset) => {
      if (monthOffset < 0) {
        const histIndex = monthOffset + 12;
        if (histIndex >= 0 && histIndex < asset.historical.length) {
          point[asset.asset] = asset.historical[histIndex].value;
        }
      } else {
        const projIndex = monthOffset - 1;
        if (projIndex >= 0 && projIndex < asset.projection.length) {
          point[asset.asset] = asset.projection[projIndex].value;
        }
      }
    });

    // Add total
    const totalIndex = i;
    if (totalIndex < data.totalValue.length) {
      point.Total = data.totalValue[totalIndex].value;
    }

    chartData.push(point);
  }

  const toggleAsset = (asset: string) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(asset)) {
      newSelected.delete(asset);
    } else {
      newSelected.add(asset);
    }
    setSelectedAssets(newSelected);
  };

  // Generate dynamic explanation based on data
  const generateExplanation = () => {
    const totalCurrent = data.totalValue[12]?.value || 0;
    const totalFuture = data.totalValue[data.totalValue.length - 1]?.value || 0;
    const growthPct = ((totalFuture - totalCurrent) / totalCurrent) * 100;
    const topAsset = data.assets.reduce((prev, curr) =>
      curr.currentValue > prev.currentValue ? curr : prev
    );

    return {
      title: "Multi-Asset Performance Timeline",
      description: `This chart shows how your portfolio value evolves over time, combining historical data (past 12 months) and future projections (next 12 months).`,
      keyPoints: [
        `📈 Total portfolio expected to grow ${growthPct.toFixed(1)}% over the next year`,
        `🎯 Current total value: ${formatUSD(totalCurrent)}`,
        `💎 Largest holding: ${topAsset.asset} at ${formatUSD(topAsset.currentValue)} (${topAsset.apy * 100}% APY)`,
        `📊 Month 0 (vertical line) represents today - everything to the left is historical, everything to the right is projected`,
        `🔄 Toggle individual assets on/off using the colored buttons to focus on specific holdings`
      ],
      insights: [
        data.assets.every(a => a.apy > 0)
          ? "All assets are earning positive yields"
          : "Some assets are not generating yield",
        totalCurrent > 0 && growthPct > 5
          ? "Strong growth trajectory expected"
          : "Consider optimizing for higher yields"
      ]
    };
  };

  const explanation = data ? generateExplanation() : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Multi-Asset Performance Forecast</CardTitle>
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
                        <div className="text-xs font-semibold mb-2">Insights:</div>
                        <div className="flex flex-wrap gap-2">
                          {explanation.insights.map((insight, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {insight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
            <CardDescription>
              Historical (12 months) and projected performance for each asset
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {['ETH', 'eETH', 'weETH', 'LiquidUSD', 'Total'].map((asset) => (
            <button
              key={asset}
              onClick={() => toggleAsset(asset)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedAssets.has(asset)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
              style={
                selectedAssets.has(asset)
                  ? { backgroundColor: ASSET_COLORS[asset as keyof typeof ASSET_COLORS] }
                  : undefined
              }
            >
              {asset}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="month"
              label={{ value: 'Months (- is past, + is future)', position: 'insideBottom', offset: -5 }}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              label={{ value: 'Value (USD)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            />

            {/* Reference line at month 0 (today) */}
            <ReferenceLine
              x={0}
              stroke="#888"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: 'Today', position: 'top', fill: '#888', fontSize: 12 }}
            />

            <Tooltip
              formatter={(value: number) => formatUSD(value)}
              labelFormatter={(month) => {
                if (month === 0) return 'Today (Month 0)';
                return month < 0
                  ? `${Math.abs(month)} months ago`
                  : `+${month} months (projected)`;
              }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />

            {selectedAssets.has('ETH') && (
              <Line
                type="monotone"
                dataKey="ETH"
                stroke={ASSET_COLORS.ETH}
                strokeWidth={2}
                dot={false}
              />
            )}
            {selectedAssets.has('eETH') && (
              <Line
                type="monotone"
                dataKey="eETH"
                stroke={ASSET_COLORS.eETH}
                strokeWidth={2}
                dot={false}
              />
            )}
            {selectedAssets.has('weETH') && (
              <Line
                type="monotone"
                dataKey="weETH"
                stroke={ASSET_COLORS.weETH}
                strokeWidth={2}
                dot={false}
              />
            )}
            {selectedAssets.has('LiquidUSD') && (
              <Line
                type="monotone"
                dataKey="LiquidUSD"
                stroke={ASSET_COLORS.LiquidUSD}
                strokeWidth={2}
                dot={false}
              />
            )}
            {selectedAssets.has('Total') && (
              <Line
                type="monotone"
                dataKey="Total"
                stroke={ASSET_COLORS.Total}
                strokeWidth={3}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.assets.map((asset) => (
            <div key={asset.asset} className="text-center">
              <div className="text-sm text-muted-foreground">{asset.asset}</div>
              <div className="text-lg font-bold">{formatUSD(asset.currentValue)}</div>
              <div className="text-sm text-green-600">
                {(asset.apy * 100).toFixed(2)}% APY
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
