import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Asset Performance Forecast</CardTitle>
        <CardDescription>
          Historical (12 months) and projected performance for each asset
        </CardDescription>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Value (USD)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip
              formatter={(value: number) => formatUSD(value)}
              labelFormatter={(month) => `Month ${month > 0 ? '+' : ''}${month}`}
            />
            <Legend />

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
