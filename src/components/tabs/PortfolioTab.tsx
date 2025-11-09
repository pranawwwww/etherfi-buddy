import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Shield, Lightbulb, Info } from 'lucide-react';
import { useDemoState } from '@/contexts/DemoContext';
import { ProductMapNode } from '@/components/ProductMapNode';
import { useState } from 'react';
import { postJSON } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SimulateResponse {
  blendedApy: number;
  risk: string;
  strategies: {
    name: string;
    apy: number;
    annualEth: number;
    risks: string[];
    steps: string;
  }[];
}

export const PortfolioTab = () => {
  const { demoState, currentUser } = useDemoState();
  const { balances, assumptions } = demoState;
  const { toast } = useToast();
  const [simulateData, setSimulateData] = useState<SimulateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate values
  const weethValue = balances.weETH * 3000; // Mock ETH price
  const totalValue = weethValue + balances.LiquidUSD;
  const blendedApy = simulateData?.blendedApy ?? 
    (totalValue > 0
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

  const fetchSimulation = async () => {
    setIsLoading(true);
    try {
      const data = await postJSON<SimulateResponse>('/api/simulate', { balances, assumptions });
      setSimulateData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load simulation. Using default values.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Products with portfolio allocation
  const products = [
    { 
      id: 'eeth', 
      name: 'eETH', 
      subtitle: 'Liquid staked ETH',
      allocation: (balances.eETH / (balances.ETH + balances.eETH + balances.weETH || 1)) * 100,
      description: 'Ethereum liquid staking token that earns staking rewards while remaining liquid.',
      risks: ['Smart contract risk', 'Slashing risk', 'Protocol risk'],
      rewards: ['~4% APY staking yield', 'Liquid - can trade anytime', 'EtherFi points'],
    },
    { 
      id: 'weeth', 
      name: 'weETH', 
      subtitle: 'Wrapped eETH',
      allocation: (balances.weETH / (balances.ETH + balances.eETH + balances.weETH || 1)) * 100,
      description: 'Wrapped version of eETH for DeFi integrations. Restaked for additional yield.',
      risks: ['Smart contract risk', 'Restaking risk', 'Slashing risk'],
      rewards: ['Base staking yield', 'Restaking rewards', 'DeFi composability'],
    },
    { 
      id: 'liquidusd', 
      name: 'Liquid USD', 
      subtitle: 'Stablecoin vault',
      allocation: (balances.LiquidUSD / totalValue) * 100,
      description: 'Automated USD vault for hands-off yield. Deposits into blue-chip DeFi protocols.',
      risks: ['Smart contract risk', 'Protocol risk', 'Depeg risk'],
      rewards: ['~10% APY', 'Auto-compounding', 'No active management'],
      strategy: 'Use borrowed stables from weETH collateral to boost overall yield'
    },
    { 
      id: 'liquideth', 
      name: 'Liquid ETH', 
      subtitle: 'ETH vault',
      allocation: 0,
      description: 'Automated ETH vault that maximizes yield across DeFi protocols.',
      risks: ['Smart contract risk', 'Protocol risk', 'IL risk'],
      rewards: ['Optimized ETH yield', 'Auto-rebalancing', 'Gas efficient'],
    },
    { 
      id: 'liquidbtc', 
      name: 'Liquid BTC', 
      subtitle: 'Bitcoin vault',
      allocation: 0,
      description: 'Bring your BTC to Ethereum and earn yield through automated strategies.',
      risks: ['Bridge risk', 'Smart contract risk', 'Protocol risk'],
      rewards: ['BTC yield on Ethereum', 'DeFi access', 'Auto-compounding'],
    },
    { 
      id: 'wbtc', 
      name: 'WBTC', 
      subtitle: 'Wrapped Bitcoin',
      allocation: 0,
      description: 'Bitcoin wrapped as an ERC-20 token for use in Ethereum DeFi.',
      risks: ['Custody risk', 'Bridge risk', 'Centralization'],
      rewards: ['BTC exposure on Ethereum', 'DeFi composability', 'Liquid'],
    },
    { 
      id: 'behype', 
      name: 'beHYPE', 
      subtitle: 'Hyperliquid restaking',
      allocation: 0,
      description: 'Restake to secure Hyperliquid and earn additional rewards.',
      risks: ['Smart contract risk', 'Restaking risk', 'Protocol risk'],
      rewards: ['Base yield', 'Hyperliquid rewards', 'Early adopter benefits'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Active User Profile Banner */}
      {currentUser && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="text-4xl">{currentUser.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">{currentUser.name}'s Portfolio</CardTitle>
                  <Badge variant={currentUser.level === 'expert' ? 'default' : 'secondary'}>
                    {currentUser.level}
                  </Badge>
                </div>
                <CardDescription className="mt-1">{currentUser.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* KPI Strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total weETH</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{balances.weETH.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">≈ ${weethValue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blended APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{blendedApy.toFixed(2)}%</div>
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

      {/* Holdings Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Current Holdings</CardTitle>
          <CardDescription>Your demo token balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
              <p className="text-sm text-muted-foreground">ETH</p>
              <p className="text-xl font-bold">{balances.ETH.toFixed(4)}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
              <p className="text-sm text-muted-foreground">eETH</p>
              <p className="text-xl font-bold">{balances.eETH.toFixed(4)}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
              <p className="text-sm text-muted-foreground">weETH</p>
              <p className="text-xl font-bold">{balances.weETH.toFixed(4)}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
              <p className="text-sm text-muted-foreground">Liquid USD</p>
              <p className="text-xl font-bold">${balances.LiquidUSD.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Distribution Map */}
      <Card>
        <CardHeader>
          <CardTitle>EtherFi Product Map</CardTitle>
          <CardDescription>Click any product to learn more about risks, rewards, and strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductMapNode key={product.id} product={product} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategy Snapshot */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Strategy Comparison</CardTitle>
              <CardDescription>Conservative vs Active leveraged strategies</CardDescription>
            </div>
            <Button 
              onClick={fetchSimulation} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Conservative */}
            <Card className="bg-secondary/30 border-success/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-success" />
                  Conservative
                </CardTitle>
                <CardDescription>Stake weETH only - no leverage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">APY</p>
                  <p className="text-2xl font-bold text-success">
                    {simulateData?.strategies[0]?.apy?.toFixed(2) ?? (assumptions.apyStake * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual ETH (on {balances.weETH.toFixed(2)} weETH)</p>
                  <p className="text-lg font-medium">
                    {simulateData?.strategies[0]?.annualEth?.toFixed(4) ?? (balances.weETH * assumptions.apyStake).toFixed(4)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Risks:</p>
                  <div className="flex flex-wrap gap-1">
                    {(simulateData?.strategies[0]?.risks ?? ['Smart-contract', 'Protocol']).map((risk) => (
                      <Badge key={risk} variant="outline" className="text-xs">{risk}</Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  {simulateData?.strategies[0]?.steps ?? 'Simply hold weETH and earn base staking + restaking rewards.'}
                </p>
              </CardContent>
            </Card>

            {/* Active */}
            <Card className="bg-secondary/30 border-accent/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Active (Leveraged)
                </CardTitle>
                <CardDescription>Use weETH as collateral, borrow stables → Liquid USD</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Boosted APY</p>
                  <p className="text-2xl font-bold text-accent">
                    {simulateData?.strategies[1]?.apy?.toFixed(2) ?? 
                      ((assumptions.apyStake + (assumptions.apyLiquidUsd - assumptions.borrowRate) * assumptions.ltvWeeth) * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual ETH (on {balances.weETH.toFixed(2)} weETH)</p>
                  <p className="text-lg font-medium">
                    {simulateData?.strategies[1]?.annualEth?.toFixed(4) ?? 
                      (balances.weETH * (assumptions.apyStake + (assumptions.apyLiquidUsd - assumptions.borrowRate) * assumptions.ltvWeeth)).toFixed(4)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Risks:</p>
                  <div className="flex flex-wrap gap-1">
                    {(simulateData?.strategies[1]?.risks ?? ['Liquidation', 'Rate changes', 'Smart-contract']).map((risk) => (
                      <Badge key={risk} variant="outline" className="text-xs">{risk}</Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  {simulateData?.strategies[1]?.steps ?? 
                    `Deposit weETH as collateral → borrow stables at ≤${(assumptions.ltvWeeth * 100).toFixed(0)}% LTV → deposit to Liquid USD vault.`}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <CardTitle>Beginner Safety Tips</CardTitle>
              <CardDescription className="mt-2 space-y-2">
                <p>• Keep an emergency buffer in stablecoins for unexpected expenses</p>
                <p>• Leverage increases returns but also liquidation risk if collateral value drops</p>
                <p>• Diversify across different products to manage risk exposure</p>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
