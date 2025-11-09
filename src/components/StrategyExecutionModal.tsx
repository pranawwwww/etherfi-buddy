import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Shield,
  Zap,
  Info,
} from 'lucide-react';
import { formatPercentage } from '@/lib/helpers';

interface StrategyExecutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy: {
    name: string;
    apy: number;
    yearlyEth: number;
    risks: string[];
    steps: string[];
  } | null;
}

export function StrategyExecutionModal({
  open,
  onOpenChange,
  strategy,
}: StrategyExecutionModalProps) {
  if (!strategy) return null;

  const isConservative = strategy.name === 'Conservative';
  const isActive = strategy.name === 'Active';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isConservative && <Shield className="w-6 h-6 text-green-600" />}
            {isActive && <Zap className="w-6 h-6 text-purple-600" />}
            <DialogTitle className="text-2xl">{strategy.name} Strategy</DialogTitle>
          </div>
          <DialogDescription>
            Step-by-step instructions to execute this strategy on EtherFi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Strategy Overview */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Target APY</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(strategy.apy)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Annual Yield</div>
                  <div className="text-2xl font-bold">{strategy.yearlyEth.toFixed(3)} ETH</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Risk Level</div>
                  <Badge
                    variant={isConservative ? 'default' : 'destructive'}
                    className="text-sm"
                  >
                    {isConservative ? 'Low' : 'Medium-High'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step-by-Step Instructions */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              How to Execute on EtherFi
            </h3>

            <div className="space-y-4">
              {isConservative ? (
                <>
                  {/* Conservative Strategy Steps */}
                  <StepCard
                    number={1}
                    title="Visit EtherFi App"
                    action="Open app.ether.fi"
                  >
                    <p className="text-sm text-muted-foreground">
                      Navigate to{' '}
                      <a
                        href="https://app.ether.fi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        app.ether.fi
                        <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      and connect your wallet
                    </p>
                  </StepCard>

                  <StepCard
                    number={2}
                    title="Stake ETH → Get eETH"
                    action="Use the Staking interface"
                  >
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Click "Stake" in the main navigation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Enter the amount of ETH you want to stake</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Approve the transaction and receive eETH (1:1 ratio)</span>
                      </li>
                    </ul>
                  </StepCard>

                  <StepCard
                    number={3}
                    title="Wrap to weETH (Optional)"
                    action="Get compound rewards"
                  >
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Go to "Wrap" section</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Convert eETH → weETH for auto-compounding rewards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                        <span>
                          weETH automatically increases in value relative to ETH (no claiming
                          needed)
                        </span>
                      </li>
                    </ul>
                  </StepCard>

                  <StepCard number={4} title="Monitor & Hold" action="Earn passive rewards">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Your weETH earns ~{formatPercentage(strategy.apy)} APY automatically</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Track your position in the "Portfolio" tab</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Unstake anytime (7-day withdrawal period)</span>
                      </li>
                    </ul>
                  </StepCard>
                </>
              ) : (
                <>
                  {/* Active Strategy Steps */}
                  <StepCard
                    number={1}
                    title="Stake ETH → Get weETH"
                    action="Start with liquid staking"
                  >
                    <p className="text-sm text-muted-foreground mb-2">
                      Follow the same steps as Conservative strategy to get weETH
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Visit app.ether.fi and stake ETH → eETH</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Wrap eETH → weETH for DeFi compatibility</span>
                      </li>
                    </ul>
                  </StepCard>

                  <StepCard
                    number={2}
                    title="Supply weETH as Collateral"
                    action="Enable borrowing"
                  >
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Go to a lending protocol (e.g., Aave, Spark, Morpho)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Supply your weETH as collateral</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                        <span className="font-medium">
                          Note: weETH typically has 75-85% LTV (Loan-to-Value)
                        </span>
                      </li>
                    </ul>
                  </StepCard>

                  <StepCard
                    number={3}
                    title="Borrow Stablecoins"
                    action="Keep LTV ≤ 50% for safety"
                  >
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Borrow USDC, USDT, or DAI against your weETH</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                        <span className="font-medium">
                          Keep LTV at 50% or below to avoid liquidation risk
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                        <span>
                          Example: $10,000 weETH → borrow $5,000 stables (50% LTV)
                        </span>
                      </li>
                    </ul>
                  </StepCard>

                  <StepCard
                    number={4}
                    title="Deploy to Liquid USD"
                    action="Earn high yield on borrowed stables"
                  >
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>
                          Visit{' '}
                          <a
                            href="https://app.ether.fi/liquid"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            EtherFi Liquid
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Deposit your borrowed stablecoins into Liquid USD vault</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                        <span>
                          Earn ~10% APY on stables (varies by market conditions)
                        </span>
                      </li>
                    </ul>
                  </StepCard>

                  <StepCard
                    number={5}
                    title="Monitor Your Position"
                    action="Manage risk actively"
                  >
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Check LTV ratio daily - keep it below 60%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                        <span>If ETH drops 20%, your LTV increases → risk of liquidation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>Set up price alerts for ETH to manage position</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                        <span>You can repay debt or add collateral anytime</span>
                      </li>
                    </ul>
                  </StepCard>
                </>
              )}
            </div>
          </div>

          {/* Risks & Considerations */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Risks & Considerations
            </h3>

            <Card className="bg-orange-950/40 border-orange-500/20">
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {strategy.risks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">
                          {risk}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {getRiskExplanation(risk, isActive)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Pros */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Why Choose This Strategy?
            </h3>

            <Card className="bg-green-950/40 border-green-500/20">
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {getStrategyPros(isConservative).map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              size="lg"
              onClick={() => window.open('https://app.ether.fi', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open EtherFi App
            </Button>
            <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepCard({
  number,
  title,
  action,
  children,
}: {
  number: number;
  title: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              {number}
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{action}</p>
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getRiskExplanation(risk: string, isActive: boolean): string {
  const riskMap: Record<string, string> = {
    'Smart-contract': 'EtherFi contracts are audited but smart contract bugs can still occur',
    'Smart contract risk':
      'EtherFi contracts are audited but smart contract bugs can still occur',
    Protocol: 'Dependency on EtherFi protocol security and governance decisions',
    'Protocol risk': 'Dependency on EtherFi protocol security and governance decisions',
    Slashing: 'Validators may get slashed for misbehavior (rare but possible)',
    'Slashing risk': 'Validators may get slashed for misbehavior (rare but possible)',
    Liquidation:
      'If ETH price drops significantly, your position may be liquidated at a loss',
    'Liquidation risk':
      'If ETH price drops significantly, your position may be liquidated at a loss',
    'Rate changes':
      'Borrowing rates can increase, reducing your net APY or turning it negative',
    'Rate risk': 'Borrowing rates can increase, reducing your net APY or turning it negative',
  };

  return riskMap[risk] || 'Standard DeFi risks apply - always DYOR and understand the protocol';
}

function getStrategyPros(isConservative: boolean): string[] {
  if (isConservative) {
    return [
      'Set-it-and-forget-it - no active management needed',
      'Low risk - just base staking + restaking rewards',
      'No liquidation risk - your ETH is always yours',
      'Earn 3-4% APY passively while staying liquid',
      'Can unstake anytime (7-day withdrawal period)',
      'Great for beginners new to DeFi',
    ];
  }

  return [
    'Higher yields (6-8% APY) through capital efficiency',
    'Leverage your existing ETH holdings without selling',
    'Diversified across staking + lending + DeFi yield',
    'Net positive APY even after borrowing costs',
    'Learn advanced DeFi strategies hands-on',
    'Scale up/down based on market conditions',
  ];
}
