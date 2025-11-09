import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Info } from 'lucide-react';
import { api } from '@/lib/api';
import type { CorrelationMatrix } from '@/lib/types';

export function CorrelationHeatmap() {
  const [data, setData] = useState<CorrelationMatrix | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .correlationMatrix()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Correlation Matrix</CardTitle>
          <CardDescription>Loading correlation data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Correlation Matrix</CardTitle>
          <CardDescription>Failed to load data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Helper to get color based on correlation value
  const getColor = (value: number): string => {
    if (value >= 0.9) return 'bg-red-600';
    if (value >= 0.7) return 'bg-orange-500';
    if (value >= 0.5) return 'bg-yellow-500';
    if (value >= 0.3) return 'bg-green-400';
    if (value >= 0.1) return 'bg-blue-400';
    return 'bg-gray-400';
  };

  const getTextColor = (value: number): string => {
    return value >= 0.5 ? 'text-white' : 'text-gray-900';
  };

  // Generate dynamic explanation
  const generateExplanation = () => {
    // Find highest and lowest correlations (excluding diagonal 1.0s)
    let highestCorr = { value: 0, pair: ['', ''] };
    let lowestCorr = { value: 1, pair: ['', ''] };

    data.matrix.forEach((row, i) => {
      row.forEach((value, j) => {
        if (i !== j) { // Skip diagonal
          if (value > highestCorr.value) {
            highestCorr = { value, pair: [data.assets[i], data.assets[j]] };
          }
          if (value < lowestCorr.value) {
            lowestCorr = { value, pair: [data.assets[i], data.assets[j]] };
          }
        }
      });
    });

    const hasLowCorrelation = lowestCorr.value < 0.3;
    const hasHighCorrelation = highestCorr.value > 0.8;

    return {
      title: "Asset Correlation Analysis",
      description: "This heatmap shows how closely different assets move together. Higher correlation (red) means assets tend to move in the same direction, lower correlation (blue/gray) means more independent movements.",
      keyPoints: [
        `📊 Matrix shows ${data.assets.length} assets compared against each other`,
        `🔴 Highest correlation: ${highestCorr.pair[0]} ↔ ${highestCorr.pair[1]} at ${highestCorr.value.toFixed(2)} (${highestCorr.value > 0.8 ? 'move together closely' : 'moderate relationship'})`,
        `🔵 Lowest correlation: ${lowestCorr.pair[0]} ↔ ${lowestCorr.pair[1]} at ${lowestCorr.value.toFixed(2)} (${lowestCorr.value < 0.3 ? 'move independently' : 'some relationship'})`,
        `💡 Diagonal is always 1.0 (asset compared to itself)`,
        `🎯 Lower correlations = better diversification potential`,
        `⚠️ High correlations mean portfolio risk isn't as diversified as it appears`
      ],
      insights: [
        hasLowCorrelation
          ? `Good: Found low-correlation pairs for diversification`
          : `Consider adding uncorrelated assets`,
        hasHighCorrelation
          ? `Some assets move together - diversification limited`
          : `Assets show healthy independence`,
        data.assets.includes('LiquidUSD')
          ? `Stablecoins provide low-correlation hedge`
          : null
      ].filter(Boolean)
    };
  };

  const explanation = data ? generateExplanation() : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Asset Correlation Matrix</CardTitle>
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
              How assets move together (1.0 = perfect correlation, 0.0 = no correlation)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header row */}
            <div className="flex">
              <div className="w-20 h-20 flex items-center justify-center" />
              {data.assets.map((asset) => (
                <div
                  key={asset}
                  className="w-20 h-20 flex items-center justify-center font-semibold text-sm"
                >
                  {asset}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {data.assets.map((rowAsset, rowIdx) => (
              <div key={rowAsset} className="flex">
                {/* Row label */}
                <div className="w-20 h-20 flex items-center justify-center font-semibold text-sm">
                  {rowAsset}
                </div>

                {/* Correlation cells */}
                {data.matrix[rowIdx].map((value, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`w-20 h-20 flex items-center justify-center text-sm font-medium border border-gray-200 ${getColor(
                      value
                    )} ${getTextColor(value)}`}
                    title={`${rowAsset} vs ${data.assets[colIdx]}: ${value.toFixed(2)}`}
                  >
                    {value.toFixed(2)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6">
          <div className="text-sm font-semibold mb-2">Correlation Strength</div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded" />
              <span className="text-xs">Very High (0.9+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded" />
              <span className="text-xs">High (0.7-0.9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span className="text-xs">Medium (0.5-0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded" />
              <span className="text-xs">Low (0.3-0.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded" />
              <span className="text-xs">Very Low (0.1-0.3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded" />
              <span className="text-xs">None (0-0.1)</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-blue-950/40 border border-blue-500/20 rounded-lg">
          <div className="text-sm font-semibold mb-2">Key Insights</div>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• ETH derivatives (eETH, weETH) are highly correlated (0.98+)</li>
            <li>• Stablecoins (LiquidUSD) have low correlation with crypto assets</li>
            <li>• BTC and ETH show moderate correlation (0.65)</li>
            <li>
              • Diversify across low-correlation assets to reduce portfolio volatility
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
