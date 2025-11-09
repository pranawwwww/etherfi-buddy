import { CurrentStrategyCard } from '@/components/CurrentStrategyCard';
import { InteractiveStrategyCards } from '@/components/InteractiveStrategyCards';
import { OpportunityCostCalculator } from '@/components/OpportunityCostCalculator';
import { LivePriceDisplay } from '@/components/LivePriceDisplay';
import { AIForecastPanel } from '@/components/AIForecastPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function StrategyComparisonTab() {
  return (
    <div className="space-y-6">
      {/* Live Market Data - Always visible at top */}
      <LivePriceDisplay />

      {/* Current Strategy with Live Prices */}
      <CurrentStrategyCard />

      {/* AI-Powered Forecasts */}
      <AIForecastPanel />

      {/* Sub-tabs for detailed comparisons */}
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparison">Strategy Comparison</TabsTrigger>
          <TabsTrigger value="opportunity">Opportunity Cost</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4 mt-6">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Choose Your Strategy
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Select a strategy that matches your risk tolerance and yield goals. Each strategy is tailored to maximize your returns while managing risk.
              </p>
            </div>
            <InteractiveStrategyCards />
          </div>
        </TabsContent>

        <TabsContent value="opportunity" className="space-y-4 mt-6">
          <OpportunityCostCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
