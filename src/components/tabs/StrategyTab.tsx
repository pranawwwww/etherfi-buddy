import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';
import { useDemoState } from '@/contexts/DemoContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { postJSON } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const StrategyTab = () => {
  const { demoState } = useDemoState();
  const { balances, assumptions } = demoState;
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const ethPrice = 3000; // Mock price
  const weethValueUsd = balances.weETH * ethPrice;

  // Conservative: just staking yield
  const conservativeApy = assumptions.apyStake * 100;
  const conservativeAnnualEth = balances.weETH * assumptions.apyStake;

  // Active: leverage with borrowed stables to Liquid USD
  const maxBorrow = weethValueUsd * assumptions.ltvWeeth;
  const liquidYield = maxBorrow * assumptions.apyLiquidUsd;
  const borrowCost = maxBorrow * assumptions.borrowRate;
  const netLeverageYield = (liquidYield - borrowCost) / ethPrice;
  const activeAnnualEth = conservativeAnnualEth + netLeverageYield;
  const activeApy = balances.weETH > 0 ? (activeAnnualEth / balances.weETH) * 100 : 0;

  const handleExplain = async () => {
    setShowDialog(true);
    setIsLoading(true);
    setExplanation('');

    try {
      const response = await postJSON<{ answer: string }>('/api/ask', {
        q: 'Explain conservative vs leveraged DeFi strategies to a beginner',
        context: {
          conservative: 'Stake weETH for base yield',
          active: 'Borrow stables against weETH and deposit to high-yield vaults',
        },
      });
      setExplanation(response.answer);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load explanation. Please try again.',
        variant: 'destructive',
      });
      setShowDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Strategy Comparison</h2>
        <p className="text-muted-foreground">
          Compare conservative staking with active leveraged strategies
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conservative */}
        <Card className="border-success/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                Conservative
              </CardTitle>
              <Badge variant="outline" className="text-success border-success">
                Lower Risk
              </Badge>
            </div>
            <CardDescription>Simple staking with base rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">APY</span>
                <span className="text-2xl font-bold text-success">{conservativeApy.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Annual ETH</span>
                <span className="text-lg font-semibold">{conservativeAnnualEth.toFixed(4)} ETH</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium">Risks:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Smart Contract</Badge>
                <Badge variant="secondary">Protocol</Badge>
              </div>
            </div>

            <div className="pt-2 text-sm text-muted-foreground">
              <p>Stake your weETH to earn base restaking rewards without leverage or complexity.</p>
            </div>
          </CardContent>
        </Card>

        {/* Active */}
        <Card className="border-warning/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-warning" />
                Active (Leveraged)
              </CardTitle>
              <Badge variant="outline" className="text-warning border-warning">
                Higher Risk
              </Badge>
            </div>
            <CardDescription>Borrow against weETH for amplified yield</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">APY</span>
                <span className="text-2xl font-bold text-warning">{activeApy.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Annual ETH</span>
                <span className="text-lg font-semibold">{activeAnnualEth.toFixed(4)} ETH</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium">Risks:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="destructive">Liquidation</Badge>
                <Badge variant="secondary">Rate Changes</Badge>
                <Badge variant="secondary">Smart Contract</Badge>
              </div>
            </div>

            <div className="pt-2 text-sm text-muted-foreground">
              <p>
                Borrow stables (≤50% LTV) against weETH, deposit to Liquid USD vaults for boosted yield.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="pt-6 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="font-medium">Need help choosing?</p>
            <p className="text-sm text-muted-foreground">
              Conservative is best for beginners or risk-averse users. Active strategies can boost returns
              but require monitoring collateral ratios to avoid liquidation.
            </p>
            <Button onClick={handleExplain} variant="outline" size="sm" className="gap-2">
              <HelpCircle className="w-4 h-4" />
              Explain to a beginner
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Strategy Comparison Explained</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading explanation...</p>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{explanation}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
