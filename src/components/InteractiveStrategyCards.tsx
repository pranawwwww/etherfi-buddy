import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDemoState } from '@/contexts/DemoContext';
import { formatUSD, formatPercentage } from '@/lib/helpers';
import { TrendingUp, Shield, Zap, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  risk: 'Low' | 'Medium' | 'High';
  apy: number;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  requiredAssets: {
    eth: number;
    eeth: number;
    weeth: number;
    liquidUsd: number;
  };
  pros: string[];
  cons: string[];
  bestFor: string;
}

const STRATEGIES: Strategy[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    risk: 'Low',
    apy: 0.04,
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'Minimal risk with steady staking rewards. Perfect for first-time DeFi users.',
    requiredAssets: {
      eth: 0,
      eeth: 60,
      weeth: 20,
      liquidUsd: 20,
    },
    pros: [
      'Lowest risk profile',
      'Simple to understand',
      'No liquidation risk',
      'Steady 4% APY',
    ],
    cons: [
      'Lower returns',
      'Minimal capital efficiency',
      'No leverage benefits',
    ],
    bestFor: 'New users or risk-averse investors',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    risk: 'Medium',
    apy: 0.07,
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Optimal mix of staking and lending. Best risk/reward ratio for most users.',
    requiredAssets: {
      eth: 0,
      eeth: 30,
      weeth: 40,
      liquidUsd: 30,
    },
    pros: [
      'Good diversification',
      '7% blended APY',
      'Moderate leverage',
      'Balanced liquidity',
    ],
    cons: [
      'Requires monitoring',
      'Some liquidation risk',
      'More complex than conservative',
    ],
    bestFor: 'Users comfortable with moderate risk',
  },
  {
    id: 'active',
    name: 'Active',
    risk: 'High',
    apy: 0.12,
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Maximum yield through leverage and active management. For experienced users only.',
    requiredAssets: {
      eth: 0,
      eeth: 20,
      weeth: 50,
      liquidUsd: 30,
    },
    pros: [
      'Highest APY (12%)',
      'Maximum capital efficiency',
      'Leveraged rewards',
      'Advanced strategies',
    ],
    cons: [
      'Liquidation risk',
      'Requires active management',
      'Higher gas costs',
      'Not for beginners',
    ],
    bestFor: 'Experienced DeFi users',
  },
];

const RiskGauge = ({ risk }: { risk: 'Low' | 'Medium' | 'High' }) => {
  const riskLevel = risk === 'Low' ? 25 : risk === 'Medium' ? 50 : 75;
  const rotation = -90 + (riskLevel / 100) * 180;

  const getColor = () => {
    switch (risk) {
      case 'Low': return '#22c55e';
      case 'Medium': return '#3b82f6';
      case 'High': return '#a855f7';
    }
  };

  return (
    <div className="relative w-32 h-16 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 100 50">
        <defs>
          <linearGradient id={`gradient-${risk}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path
          d="M 10 45 A 40 40 0 0 1 90 45"
          fill="none"
          stroke={`url(#gradient-${risk})`}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="45"
          x2="50"
          y2="15"
          stroke={getColor()}
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${rotation} 50 45)`}
          style={{ transition: 'transform 1s ease-out' }}
        />
        <circle cx="50" cy="45" r="3" fill={getColor()} />
      </svg>
    </div>
  );
};

export function InteractiveStrategyCards() {
  const { demoState } = useDemoState();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  const calculateEarnings = (strategy: Strategy) => {
    const totalEthValue =
      demoState.balances.ETH +
      demoState.balances.eETH +
      demoState.balances.weETH +
      demoState.balances.LiquidUSD / 3500;

    const totalUsdValue = totalEthValue * 3500;
    const annualEarnings = totalUsdValue * strategy.apy;

    return {
      annual: annualEarnings,
      monthly: annualEarnings / 12,
    };
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'High':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STRATEGIES.map((strategy) => {
          const earnings = calculateEarnings(strategy);
          const Icon = strategy.icon;

          return (
            <Card
              key={strategy.id}
              className={`relative hover:shadow-xl transition-all cursor-pointer border-2 ${strategy.borderColor} ${strategy.bgColor}`}
              onClick={() => setSelectedStrategy(strategy)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${strategy.bgColor} border ${strategy.borderColor}`}>
                      <Icon className={`h-6 w-6 ${strategy.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{strategy.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {strategy.bestFor}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <Badge className={getRiskBadgeColor(strategy.risk)} variant="outline">
                  {strategy.risk} Risk
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Risk Gauge */}
                <div>
                  <RiskGauge risk={strategy.risk} />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Risk Level
                  </p>
                </div>

                {/* APY Display */}
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <div className={`text-4xl font-bold ${strategy.color}`}>
                    {formatPercentage(strategy.apy)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Expected APY
                  </div>
                </div>

                {/* Earnings Estimate */}
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    Estimated Earnings
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {formatUSD(earnings.annual)}
                    </span>
                    <span className="text-xs text-muted-foreground">/year</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatUSD(earnings.monthly)}/month
                  </div>
                </div>

                {/* Asset Allocation */}
                <div>
                  <div className="text-sm font-semibold mb-2">Required Assets</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {strategy.requiredAssets.eeth > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">eETH:</span>
                        <span className="font-medium">{strategy.requiredAssets.eeth}%</span>
                      </div>
                    )}
                    {strategy.requiredAssets.weeth > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">weETH:</span>
                        <span className="font-medium">{strategy.requiredAssets.weeth}%</span>
                      </div>
                    )}
                    {strategy.requiredAssets.liquidUsd > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Liquid USD:</span>
                        <span className="font-medium">{strategy.requiredAssets.liquidUsd}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full"
                  variant={strategy.id === 'balanced' ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStrategy(strategy);
                  }}
                >
                  Preview This Strategy
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Strategy Detail Modal */}
      <Dialog open={!!selectedStrategy} onOpenChange={() => setSelectedStrategy(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {selectedStrategy && (
                <>
                  <div className={`p-3 rounded-lg ${selectedStrategy.bgColor} border ${selectedStrategy.borderColor}`}>
                    <selectedStrategy.icon className={`h-6 w-6 ${selectedStrategy.color}`} />
                  </div>
                  {selectedStrategy.name} Strategy
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedStrategy?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedStrategy && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">APY</div>
                  <div className={`text-3xl font-bold ${selectedStrategy.color}`}>
                    {formatPercentage(selectedStrategy.apy)}
                  </div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Risk Level</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRiskBadgeColor(selectedStrategy.risk)}>
                      {selectedStrategy.risk}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Advantages
                  </h4>
                  <ul className="space-y-2">
                    {selectedStrategy.pros.map((pro, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    Considerations
                  </h4>
                  <ul className="space-y-2">
                    {selectedStrategy.cons.map((con, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">!</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Allocation Breakdown */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="font-semibold mb-3">Recommended Allocation</h4>
                <div className="space-y-2">
                  {Object.entries(selectedStrategy.requiredAssets).map(([asset, percentage]) => {
                    if (percentage === 0) return null;
                    return (
                      <div key={asset} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{asset.replace('liquidUsd', 'Liquid USD')}</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${selectedStrategy.bgColor}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => setSelectedStrategy(null)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => {
                    window.open('https://app.ether.fi/portfolio', '_blank');
                  }}
                >
                  Switch to This Strategy
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
