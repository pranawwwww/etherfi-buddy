import { CurrentStrategyCard } from '@/components/CurrentStrategyCard';
import { StrategyComparisonTable } from '@/components/StrategyComparisonTable';
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
          <StrategyComparisonTable />
        </TabsContent>

        <TabsContent value="opportunity" className="space-y-4 mt-6">
          <OpportunityCostCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
