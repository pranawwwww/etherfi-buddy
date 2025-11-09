import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Coins, Bot } from 'lucide-react';
import { postJSON } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  subtitle: string;
  allocation: number;
  description: string;
  risks: string[];
  rewards: string[];
  strategy?: string;
}

interface ProductMapNodeProps {
  product: Product;
}

export const ProductMapNode = ({ product }: ProductMapNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [claudeAnswer, setClaudeAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAskClaude = async () => {
    setIsLoading(true);
    try {
      const response = await postJSON<{ answer: string }>('/api/ask', {
        q: `Explain ${product.name} to a beginner`,
        context: { product: product.name }
      });
      setClaudeAnswer(response.answer);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get explanation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const allocationColor = product.allocation > 50 ? 'text-success' : 
                          product.allocation > 20 ? 'text-accent' : 
                          product.allocation > 0 ? 'text-primary' : 'text-muted-foreground';

  return (
    <>
      <Card 
        className="cursor-pointer hover:border-primary transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 bg-gradient-to-br from-card to-secondary/20"
        onClick={() => setIsOpen(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">{product.name}</CardTitle>
            </div>
            <span className={`text-sm font-bold ${allocationColor}`}>
              {product.allocation.toFixed(1)}%
            </span>
          </div>
          <CardDescription className="text-xs">{product.subtitle}</CardDescription>
        </CardHeader>
      </Card>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              {product.name}
            </SheetTitle>
            <SheetDescription>{product.subtitle}</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* What is it */}
            <div>
              <h3 className="font-semibold mb-2 text-foreground">What is it?</h3>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>

            {/* Portfolio allocation */}
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Your Allocation</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${Math.min(product.allocation, 100)}%` }}
                  />
                </div>
                <span className={`text-sm font-bold ${allocationColor}`}>
                  {product.allocation.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Risk/Reward Panel */}
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle className="text-sm">Risk & Reward Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-success mb-2">✓ Rewards</p>
                  <ul className="space-y-1">
                    {product.rewards.map((reward, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground">• {reward}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-destructive mb-2">⚠ Risks</p>
                  <div className="flex flex-wrap gap-1">
                    {product.risks.map((risk, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{risk}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy hint */}
            {product.strategy && (
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Sample Strategy</h3>
                <p className="text-sm text-muted-foreground italic">{product.strategy}</p>
              </div>
            )}

            {/* Ask Claude */}
            <div className="space-y-3">
              <Button 
                onClick={handleAskClaude} 
                disabled={isLoading}
                className="w-full gap-2"
                variant="outline"
              >
                <Bot className="w-4 h-4" />
                {isLoading ? 'Asking Claude...' : 'Ask Claude to Explain'}
              </Button>

              {claudeAnswer && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <p className="text-sm whitespace-pre-wrap">{claudeAnswer}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
