import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Shield, Lightbulb } from 'lucide-react';
import { useDemoState } from '@/contexts/DemoContext';

export const PortfolioTab = () => {
  const { demoState } = useDemoState();
  const { balances, assumptions } = demoState;

  // Simple blended APY calculation
  const weethValue = balances.weETH * 3000; // Mock ETH price
  const totalValue = weethValue + balances.LiquidUSD;
  const blendedApy =
    totalValue > 0
      ? ((weethValue * assumptions.apyStake + balances.LiquidUSD * assumptions.apyLiquidUsd) /
          totalValue) *
        100
      : 0;

  // Risk badge based on concentration
  const getRiskLevel = () => {
    if (balances.LiquidUSD > weethValue * 0.5) return 'Medium';
    if (balances.LiquidUSD > weethValue) return 'High';
    return 'Low';
  };

  const riskLevel = getRiskLevel();
  const riskColor = riskLevel === 'Low' ? 'success' : riskLevel === 'Medium' ? 'warning' : 'destructive';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Portfolio</h2>
        <p className="text-muted-foreground">Overview of your demo holdings and projected returns</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">weETH Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balances.weETH.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">≈ ${(balances.weETH * 3000).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blended APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{blendedApy.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Combined yield across positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={riskColor as any}>{riskLevel}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on position concentration</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Holdings (Demo)</CardTitle>
          <CardDescription>Your current token balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl bg-secondary/50 space-y-1">
              <p className="text-sm text-muted-foreground">ETH</p>
              <p className="text-xl font-bold">{balances.ETH.toFixed(4)}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 space-y-1">
              <p className="text-sm text-muted-foreground">eETH</p>
              <p className="text-xl font-bold">{balances.eETH.toFixed(4)}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 space-y-1">
              <p className="text-sm text-muted-foreground">weETH</p>
              <p className="text-xl font-bold">{balances.weETH.toFixed(4)}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 space-y-1">
              <p className="text-sm text-muted-foreground">Liquid USD</p>
              <p className="text-xl font-bold">${balances.LiquidUSD.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <CardTitle>Beginner Tips</CardTitle>
              <CardDescription className="mt-2 space-y-2">
                <p>• Keep an emergency buffer in stablecoins for unexpected expenses</p>
                <p>• Leverage increases returns but also liquidation risk if collateral value drops</p>
                <p>• Diversify across different yield strategies to manage risk</p>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
