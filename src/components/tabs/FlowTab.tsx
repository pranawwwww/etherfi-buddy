import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, Coins, TrendingUp, Shield, Wallet, Gift } from 'lucide-react';
import { postJSON } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const FlowTab = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const nodes = [
    { id: 'eth', label: 'Your ETH', icon: Coins, color: 'text-primary' },
    { id: 'stake', label: 'Stake', icon: TrendingUp, color: 'text-success' },
    { id: 'tokens', label: 'eETH/weETH', icon: Wallet, color: 'text-primary' },
    { id: 'restake', label: 'Restaking', icon: Shield, color: 'text-warning' },
    { id: 'defi', label: 'DeFi/Liquid', icon: TrendingUp, color: 'text-success' },
    { id: 'rewards', label: 'Rewards', icon: Gift, color: 'text-success' },
  ];

  const handleNodeClick = async (node: typeof nodes[0]) => {
    setSelectedNode(node.id);
    setIsLoading(true);
    setExplanation('');

    try {
      const response = await postJSON<{ answer: string }>('/api/ask', {
        q: `Explain ${node.label} to a beginner`,
        context: { node: node.label },
      });
      setExplanation(response.answer);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load explanation. Please try again.',
        variant: 'destructive',
      });
      setSelectedNode(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Interactive Flow</h2>
        <p className="text-muted-foreground">Click on any step to learn more about how it works</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-2 flex-wrap">
            {nodes.map((node, idx) => {
              const Icon = node.icon;
              return (
                <div key={node.id} className="flex items-center gap-2">
                  <button
                    onClick={() => handleNodeClick(node)}
                    className="group relative p-6 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-lg"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-secondary rounded-xl group-hover:bg-primary/10 transition-colors">
                        <Icon className={`w-6 h-6 ${node.color}`} />
                      </div>
                      <span className="text-sm font-medium">{node.label}</span>
                    </div>
                  </button>
                  {idx < nodes.length - 1 && (
                    <ArrowRight className="hidden lg:block w-6 h-6 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
          <CardDescription>
            Click any step in the flow above to get a beginner-friendly explanation powered by Claude AI
          </CardDescription>
        </CardHeader>
      </Card>

      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {nodes.find((n) => n.id === selectedNode)?.label || 'Explanation'}
            </DialogTitle>
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
