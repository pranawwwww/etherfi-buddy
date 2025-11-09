import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, Shield, Wallet, CreditCard, ArrowRight } from 'lucide-react';

interface StartHereTabProps {
  onNavigate: (tab: string) => void;
}

export const StartHereTab = ({ onNavigate }: StartHereTabProps) => {
  const steps = [
    {
      icon: Coins,
      title: 'Start',
      description: 'You have ETH or stablecoins in your wallet',
    },
    {
      icon: TrendingUp,
      title: 'Stake',
      description: 'Stake ETH to receive eETH/weETH liquid staking tokens',
    },
    {
      icon: Shield,
      title: 'Restake',
      description: 'EtherFi restakes your ETH to secure additional services for extra rewards',
    },
    {
      icon: Wallet,
      title: 'Use in DeFi',
      description: 'Park funds in Liquid vaults for hands-off yield or use in protocols like Aave',
    },
    {
      icon: CreditCard,
      title: 'Spend (Optional)',
      description: 'Use EtherFi Cash card in Direct or Borrow mode for real-world purchases',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Welcome to eFi Navigator</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn how EtherFi works in 5 simple steps. This is a demo environment designed to help beginners
          understand liquid staking and DeFi strategies.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <Card key={idx} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{step.description}</CardDescription>
              </CardContent>
              {idx < steps.length - 1 && (
                <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hidden lg:block" />
              )}
            </Card>
          );
        })}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Ready to Explore?</CardTitle>
          <CardDescription>
            Navigate to different sections to see how strategies work with your demo balances
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={() => onNavigate('flow')} className="gap-2">
            Open Flow
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button onClick={() => onNavigate('strategy')} variant="outline" className="gap-2">
            Open Strategy
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
