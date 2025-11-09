import { MultiAssetChart } from '@/components/MultiAssetChart';
import { AssetAllocationPieChart } from '@/components/AssetAllocationPieChart';
import { CorrelationHeatmap } from '@/components/CorrelationHeatmap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Multi-Asset Performance</TabsTrigger>
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="correlation">Correlation Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4 mt-6">
          <MultiAssetChart />
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AssetAllocationPieChart />
            <div className="space-y-4">
              <AllocationInsights />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4 mt-6">
          <CorrelationHeatmap />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AllocationInsights() {
  return (
    <div className="space-y-4">
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Rebalancing Recommendations</h3>
        <div className="space-y-3">
          <RecommendationCard
            title="Reduce Concentration Risk"
            description="Your portfolio is 70% weETH. Consider diversifying into stablecoins or BTC to reduce volatility."
            action="Move 1 weETH → Liquid USD"
            impact="+15% diversification score"
            color="text-orange-600"
          />
          <RecommendationCard
            title="Increase Yield Opportunity"
            description="Liquid USD offers 10% APY vs 4% on weETH. Rebalancing could boost overall returns."
            action="Add $500 to Liquid USD"
            impact="+0.8% blended APY"
            color="text-green-600"
          />
          <RecommendationCard
            title="Add Uncorrelated Asset"
            description="BTC has low correlation with ETH (0.65). Adding Bitcoin exposure reduces portfolio risk."
            action="Allocate 10% to WBTC"
            impact="-12% expected volatility"
            color="text-blue-600"
          />
        </div>
      </div>

      <div className="p-6 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <h3 className="text-lg font-semibold mb-2">Portfolio Health Summary</h3>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <MetricCard label="Diversification" value="65/100" color="text-yellow-600" />
          <MetricCard label="Risk Level" value="Medium" color="text-orange-600" />
          <MetricCard label="Blended APY" value="5.2%" color="text-green-600" />
          <MetricCard label="Total Value" value="$18,700" color="text-blue-600" />
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  title,
  description,
  action,
  impact,
  color,
}: {
  title: string;
  description: string;
  action: string;
  impact: string;
  color: string;
}) {
  return (
    <div className="p-4 border rounded-lg bg-secondary/50">
      <div className={`font-semibold mb-1 ${color}`}>{title}</div>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">→ {action}</span>
        <span className="text-xs bg-primary/10 px-2 py-1 rounded">{impact}</span>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
