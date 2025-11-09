import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { postJSON } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useDemoState } from '@/contexts/DemoContext';
import { useChatContext } from '@/contexts/ChatContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatBubble = () => {
  const { isChatOpen, openChat, closeChat, prefilledMessage, clearPrefilledMessage } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { demoState } = useDemoState();

  useEffect(() => {
    const stored = localStorage.getItem('chat-history');
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      const { balances } = demoState;
      const hasAssets = balances.weETH > 0 || balances.eETH > 0 || balances.ETH > 0;
      
      setMessages([
        {
          role: 'assistant',
          content: hasAssets 
            ? `Hi! I can see you have some assets in your portfolio. Ask me about your holdings, strategies to maximize yield, or any DeFi concepts you'd like to understand better! 🚀`
            : `Hi! I'm your DeFi assistant. Ask me about ether.fi products (eETH, weETH, ETHFI), staking strategies, risks, or any DeFi concepts. I can provide personalized advice based on your portfolio! 💡`,
        },
      ]);
    }
  }, [demoState]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isChatOpen]);

  // Handle prefilled message from explainer
  useEffect(() => {
    if (prefilledMessage && isChatOpen) {
      setInput(prefilledMessage);
      clearPrefilledMessage();
      // Focus input after setting the message
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [prefilledMessage, isChatOpen, clearPrefilledMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        if (isChatOpen) {
          closeChat();
        } else {
          openChat();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen, openChat, closeChat]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context with user's current portfolio
      const { balances, assumptions, currentUser } = demoState;
      const weethValue = balances.weETH * 3000; // Mock ETH price
      const totalValue = weethValue + balances.LiquidUSD;
      const blendedApy = totalValue > 0
        ? ((weethValue * assumptions.apyStake + balances.LiquidUSD * assumptions.apyLiquidUsd) / totalValue) * 100
        : 0;

      const context = {
        portfolio: {
          ETH: balances.ETH,
          eETH: balances.eETH,
          weETH: balances.weETH,
          LiquidUSD: balances.LiquidUSD,
          totalValueUSD: totalValue,
          blendedAPY: blendedApy.toFixed(2),
        },
        userProfile: currentUser?.name || 'Unknown',
        userLevel: currentUser?.level || 'Beginner',
      };

      const response = await postJSON<{ answer: string }>('/api/ask', { 
        q: input,
        context: context 
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: response.answer }]);
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

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const quickActions = [
    "What's in my portfolio?",
    "How can I maximize yield?",
    "Explain liquid staking",
    "What are the risks?"
  ];

  return (
    <>
      <Button
        onClick={() => openChat()}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 z-50 transition-all hover:scale-110"
        size="icon"
      >
        <Sparkles className="w-6 h-6" />
      </Button>

      <Dialog open={isChatOpen} onOpenChange={(open) => open ? openChat() : closeChat()}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  AI Assistant
                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                    Online
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  Powered by Claude • Context-aware responses
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div 
            className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin" 
            ref={scrollRef}
          >
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`flex flex-col gap-2 max-w-[85%]`}>
                    <div
                      className={`rounded-2xl px-5 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted border border-border'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => <h1 className="text-lg font-bold mt-2 mb-2 text-foreground">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-bold mt-2 mb-1.5 text-foreground">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground">{children}</h3>,
                              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-foreground">{children}</p>,
                              ul: ({ children }) => <ul className="space-y-1 my-2 list-disc list-inside text-foreground">{children}</ul>,
                              ol: ({ children }) => <ol className="space-y-1 my-2 list-decimal list-inside text-foreground">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed text-foreground">{children}</li>,
                              strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                              em: ({ children }) => <em className="italic text-foreground/80">{children}</em>,
                              code: ({ children }) => (
                                <code className="px-1.5 py-0.5 rounded bg-primary/10 text-xs font-mono text-foreground">{children}</code>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-2 border-primary pl-3 italic text-foreground/70 my-2">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => copyToClipboard(msg.content, idx)}
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border rounded-2xl px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-foreground">Claude is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {messages.length === 1 && !isLoading && (
            <div className="px-6 pb-3">
              <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setInput(action);
                      inputRef.current?.focus();
                    }}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 pb-6 pt-3 border-t bg-muted/20">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about your portfolio, strategies, risks..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()} 
                size="icon"
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Cmd/Ctrl + /</kbd> to open • <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Enter</kbd> to send
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
