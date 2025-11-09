import { useState, useRef, useEffect } from 'react';
import { HelpCircle, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { postJSON } from '@/lib/api';
import { useDemoState } from '@/contexts/DemoContext';
import { useChatContext } from '@/contexts/ChatContext';
import ReactMarkdown from 'react-markdown';

interface ExplainableProps {
  term: string;
  type?: 'product' | 'balance' | 'metric' | 'concept' | 'strategy';
  data?: Record<string, any>;
  variant?: 'inline' | 'subtle';
  children: React.ReactNode;
}

type ExplanationLevel = 'beginner' | 'standard' | 'advanced';

export const Explainable = ({ 
  term, 
  type = 'concept',
  data = {},
  variant = 'inline',
  children 
}: ExplainableProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [level, setLevel] = useState<ExplanationLevel>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const { demoState } = useDemoState();
  const { openChat } = useChatContext();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Calculate popover position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Show above if not enough space below
      setPosition(spaceBelow < 300 && spaceAbove > spaceBelow ? 'top' : 'bottom');
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const fetchExplanation = async (explainLevel: ExplanationLevel) => {
    setIsLoading(true);
    
    try {
      // Build context
      const { balances, assumptions, currentUser } = demoState;
      const weethValue = balances.weETH * 3000;
      const totalValue = weethValue + balances.LiquidUSD;
      
      const context = {
        portfolio: {
          ETH: balances.ETH,
          eETH: balances.eETH,
          weETH: balances.weETH,
          LiquidUSD: balances.LiquidUSD,
          totalValueUSD: totalValue,
          blendedAPY: totalValue > 0
            ? ((weethValue * assumptions.apyStake + balances.LiquidUSD * assumptions.apyLiquidUsd) / totalValue) * 100
            : 0,
        },
        userProfile: currentUser?.name || 'Unknown',
        userLevel: currentUser?.level || 'Beginner',
      };

      const response = await postJSON<{ explanation: string }>('/api/explain', {
        term,
        type,
        level: explainLevel,
        data,
        userContext: context,
      });

      setExplanation(response.explanation);
    } catch (error) {
      console.error('Failed to fetch explanation:', error);
      setExplanation(getFallbackExplanation(term, type));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (!explanation) {
        fetchExplanation(level);
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleLevelChange = (newLevel: ExplanationLevel) => {
    setLevel(newLevel);
    fetchExplanation(newLevel);
  };

  const openInChat = () => {
    // Build a contextual question based on the term and data
    let question = '';
    
    if (type === 'product') {
      question = `Tell me more about ${term} - how it works, benefits, and risks for my portfolio`;
    } else if (type === 'balance') {
      question = `Can you analyze my ${term} and give me specific recommendations?`;
    } else if (type === 'metric') {
      const value = data?.value || '';
      question = `Explain my ${term}${value ? ` of ${value}` : ''} - what does this mean for me and what should I do?`;
    } else if (type === 'concept') {
      question = `Explain ${term} in detail and how it relates to my current portfolio`;
    } else if (type === 'strategy') {
      question = `Should I consider the ${term}? What are the pros and cons for my situation?`;
    } else {
      question = `Tell me more about ${term}`;
    }
    
    // Close the popover and open chat with the question
    setIsOpen(false);
    openChat(question);
  };

  return (
    <span className="relative inline-block">
      <span
        ref={triggerRef}
        className={`
          relative inline-block cursor-help transition-all duration-200
          ${isHovered || isOpen ? 'explainable-active' : 'explainable'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={`Explain ${term}`}
      >
        {children}
      </span>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className={`
            absolute z-50 w-96 
            ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'}
            left-0
            animate-in fade-in-0 zoom-in-95 slide-in-from-top-2
          `}
          style={{
            animation: 'slideIn 0.2s ease-out'
          }}
        >
          <Card className="border shadow-lg bg-card">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {term}
                  </h3>
                  <p className="text-xs text-muted-foreground capitalize">
                    {type}
                  </p>
                </div>
              </div>

              {/* Explanation */}
              <div className="mb-4">
                {isLoading ? (
                  <div className="flex items-center gap-2 py-8 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-sm leading-relaxed text-foreground mb-2">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-foreground">
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="text-sm space-y-1 my-2 list-disc list-inside text-foreground">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-foreground">{children}</li>
                        ),
                      }}
                    >
                      {explanation}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Level Selector */}
              {!isLoading && (
                <>
                  <div className="flex items-center gap-1 mb-3 pb-3 border-t pt-3">
                    <span className="text-xs text-muted-foreground mr-2">
                      Level:
                    </span>
                    <Button
                      variant={level === 'beginner' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => handleLevelChange('beginner')}
                    >
                      Simple
                    </Button>
                    <Button
                      variant={level === 'standard' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => handleLevelChange('standard')}
                    >
                      Standard
                    </Button>
                    <Button
                      variant={level === 'advanced' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => handleLevelChange('advanced')}
                    >
                      Technical
                    </Button>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={openInChat}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Continue in chat
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .explainable {
          border-bottom: 1px dotted currentColor;
          border-bottom-color: hsl(var(--primary) / 0.4);
        }

        .explainable-active {
          border-bottom: 1.5px solid currentColor;
          border-bottom-color: hsl(var(--primary) / 0.8);
          text-shadow: 0 0 8px hsl(var(--primary) / 0.3);
        }
      `}</style>
    </span>
  );
};

// Fallback explanations if API fails
const getFallbackExplanation = (term: string, type?: string): string => {
  const fallbacks: Record<string, string> = {
    'weETH': '**weETH** is wrapped eETH - a non-rebasing version of ether.fi\'s liquid staking token. It\'s designed for better DeFi compatibility. Instead of your balance increasing, the weETH/ETH price rises over time as staking rewards accrue.',
    'eETH': '**eETH** is ether.fi\'s liquid staking token. When you stake ETH, you receive eETH which automatically grows in balance as you earn staking rewards (~3-4% APY). You can use it in DeFi while still earning rewards.',
    'LiquidUSD': '**LiquidUSD** is ether.fi\'s stablecoin vault that automatically deploys your USD to yield-generating strategies while maintaining liquidity. No lockup periods - withdraw anytime.',
    'ETHFI': '**ETHFI** is ether.fi\'s governance token. Holders can vote on protocol changes and earn a share of protocol fees by staking their tokens.',
    'DVT': '**DVT (Distributed Validator Technology)** splits validator duties across multiple operators. Like having backup generators - if one fails, others keep running. This dramatically reduces slashing risk.',
    'APY': '**APY (Annual Percentage Yield)** includes compounding - earning interest on your interest. Higher APY means faster growth over time.',
  };

  return fallbacks[term] || `**${term}** - This is a ${type || 'concept'} in DeFi. Click "Ask more in chat" to learn more!`;
};

