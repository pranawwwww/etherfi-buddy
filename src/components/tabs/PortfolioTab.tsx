import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Shield, Lightbulb } from 'lucide-react';
import { useDemoState } from '@/contexts/DemoContext';
import { EtherFiProductEcosystem } from '@/components/EtherFiProductEcosystem';
import { HistoricalPriceTrends } from '@/components/HistoricalPriceTrends';
import { AssetAllocationPieChart } from '@/components/AssetAllocationPieChart';
import { Explainable } from '@/components/Explainable';

export const PortfolioTab = () => {
  const { demoState } = useDemoState();
  const { balances, assumptions } = demoState;

  // Calculate values
  const weethValue = balances.weETH * 3000; // Mock ETH price
  const totalValue = weethValue + balances.LiquidUSD;
  const blendedApy = (totalValue > 0
      ? ((weethValue * assumptions.apyStake + balances.LiquidUSD * assumptions.apyLiquidUsd) / totalValue) * 100
      : 0);

  // Portfolio health score logic
  const getHealthScore = () => {
    const diversification = balances.LiquidUSD / totalValue;
    const leverage = balances.LiquidUSD > weethValue * 0.3 ? 'medium' : 'low';
    
    if (diversification > 0.3 && diversification < 0.7 && leverage === 'low') return { label: 'Good', variant: 'success' as const };
    if (diversification < 0.2 || diversification > 0.8 || leverage === 'medium') return { label: 'Caution', variant: 'warning' as const };
    return { label: 'Risky', variant: 'destructive' as const };
  };

  const healthScore = getHealthScore();

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total <Explainable term="weETH" type="product">weETH</Explainable>
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Explainable 
              term="weETH balance" 
              type="balance"
              data={{ amount: balances.weETH, valueUSD: weethValue }}
            >
              <div className="text-2xl font-bold text-primary">{balances.weETH.toFixed(4)}</div>
            </Explainable>
            <p className="text-xs text-muted-foreground">≈ ${weethValue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Explainable term="Blended APY" type="metric" data={{ apy: blendedApy, weethValue, liquidUsdValue: balances.LiquidUSD }}>
                Blended APY
              </Explainable>
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <Explainable 
              term="Blended APY" 
              type="metric"
              data={{ 
                apy: blendedApy,
                weethAPY: assumptions.apyStake * 100,
                liquidUsdAPY: assumptions.apyLiquidUsd * 100,
                weethValue,
                liquidUsdValue: balances.LiquidUSD
              }}
            >
              <div className="text-2xl font-bold text-accent">{blendedApy.toFixed(2)}%</div>
            </Explainable>
            <p className="text-xs text-muted-foreground">Combined portfolio yield</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={healthScore.variant}>{healthScore.label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on diversification & leverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings - Combined Product Ecosystem and Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Interactive map showing your holdings and available opportunities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <EtherFiProductEcosystem />
          
          {/* Current Balances */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Current Balances</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
                <p className="text-sm text-muted-foreground">ETH</p>
                <Explainable term="ETH balance" type="balance" data={{ amount: balances.ETH }}>
                  <p className="text-xl font-bold">{balances.ETH.toFixed(4)}</p>
                </Explainable>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
                <p className="text-sm text-muted-foreground">
                  <Explainable term="eETH" type="product">eETH</Explainable>
                </p>
                <Explainable term="eETH balance" type="balance" data={{ amount: balances.eETH }}>
                  <p className="text-xl font-bold">{balances.eETH.toFixed(4)}</p>
                </Explainable>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
                <p className="text-sm text-muted-foreground">
                  <Explainable term="weETH" type="product">weETH</Explainable>
                </p>
                <Explainable term="weETH balance" type="balance" data={{ amount: balances.weETH, valueUSD: weethValue }}>
                  <p className="text-xl font-bold">{balances.weETH.toFixed(4)}</p>
                </Explainable>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
                <p className="text-sm text-muted-foreground">
                  <Explainable term="LiquidUSD" type="product">Liquid USD</Explainable>
                </p>
                <Explainable term="LiquidUSD balance" type="balance" data={{ amount: balances.LiquidUSD }}>
                  <p className="text-xl font-bold">${balances.LiquidUSD.toFixed(2)}</p>
                </Explainable>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Price Trends */}
      <HistoricalPriceTrends />

      {/* Asset Allocation */}
      <AssetAllocationPieChart />

      {/* Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <CardTitle>Beginner Safety Tips</CardTitle>
              <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                <div>• Keep an emergency buffer in stablecoins for unexpected expenses</div>
                <div>• Leverage increases returns but also liquidation risk if collateral value drops</div>
                <div>• Diversify across different products to manage risk exposure</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
