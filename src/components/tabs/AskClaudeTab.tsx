import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Send } from 'lucide-react';
import { postJSON } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const AskClaudeTab = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAsk = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer('');

    try {
      const response = await postJSON<{ answer: string }>('/api/ask', { q: question });
      setAnswer(response.answer);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Ask Claude</h2>
        <p className="text-muted-foreground">
          Get beginner-friendly answers about staking, restaking, and DeFi strategies
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Question</CardTitle>
          <CardDescription>Ask anything about EtherFi, staking, or DeFi risks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: What's the difference between staking and restaking?"
            className="min-h-[100px]"
            disabled={isLoading}
          />
          <Button onClick={handleAsk} disabled={isLoading || !question.trim()} className="w-full gap-2">
            <Send className="w-4 h-4" />
            {isLoading ? 'Thinking...' : 'Ask Question'}
          </Button>
        </CardContent>
      </Card>

      {answer && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-foreground whitespace-pre-wrap">{answer}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-warning/5 border-warning/20">
        <CardContent className="pt-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning-foreground">Educational Only</p>
            <p className="text-sm text-muted-foreground mt-1">
              This is not financial advice. Always do your own research before making investment
              decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
