import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceSparkline } from '@/components/PriceSparkline';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function HistoricalPriceTrends() {
  const assets = [
    {
      name: 'weETH',
      key: 'weETH',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      description: 'Wrapped eETH - Non-rebasing LST'
    },
    {
      name: 'eETH',
      key: 'eETH',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      description: 'Rebasing Liquid Staking Token'
    },
    {
      name: 'eBTC',
      key: 'eBTC',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      description: 'Bitcoin Liquid Staking Token'
    },
    {
      name: 'ETHFI',
      key: 'ETHFI',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      description: 'Governance Token'
    },
  ];

  return (
    <Card className="border-blue-500/20 bg-gradient-to-r from-blue-950/20 to-purple-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <CardTitle>Historical Price Trends</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            7-Day View
          </Badge>
        </div>
        <CardDescription>
          Live price movements from DefiLlama • Updated every 30 seconds
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.key}
              className={`p-4 rounded-lg border ${asset.borderColor} ${asset.bgColor} hover:bg-opacity-20 transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-lg font-bold ${asset.color}`}>
                      {asset.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {asset.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Trend</span>
                </div>
              </div>

              {/* Sparkline Chart */}
              <div className="bg-secondary/30 rounded-lg p-3 border border-border/30">
                <PriceSparkline product={asset.key} days={7} />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">7-day movement</span>
                <span className={asset.color}>View details →</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-border/50">
          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 text-blue-400 mt-0.5" />
            <div className="flex-1 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Why price trends matter:</p>
              <ul className="space-y-1 ml-4">
                <li>• Spot market volatility before it impacts your portfolio</li>
                <li>• Identify optimal entry/exit points for rebalancing</li>
                <li>• Understand how external market events affect your holdings</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
