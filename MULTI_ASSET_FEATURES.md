# Multi-Asset Portfolio Analytics

## New Features Added

### 1. Backend API Extensions

**New Endpoints:**

#### `POST /api/multi-asset-forecast`
Generates individual forecasts for all portfolio assets with historical and projection data.

**Request:**
```json
{
  "balances": {
    "ETH": 0.2,
    "eETH": 0.0,
    "weETH": 5.0,
    "LiquidUSD": 1200.0
  },
  "assumptions": {
    "apyStake": 0.04,
    "apyLiquidUsd": 0.10,
    "borrowRate": 0.05,
    "ltvWeeth": 0.50
  }
}
```

**Response:**
```json
{
  "assets": [
    {
      "asset": "weETH",
      "historical": [...],
      "projection": [...],
      "apy": 0.04,
      "currentValue": 17500.0
    }
  ],
  "totalValue": [...],
  "allocation": {
    "weETH": 93.5,
    "LiquidUSD": 6.4
  }
}
```

#### `GET /api/correlation-matrix`
Returns correlation coefficients between all DeFi assets.

**Response:**
```json
{
  "assets": ["ETH", "eETH", "weETH", "LiquidUSD", "WBTC", "LiquidBTC"],
  "matrix": [
    [1.00, 0.98, 0.98, 0.05, 0.65, 0.64],
    ...
  ]
}
```

### 2. Frontend Components

#### `MultiAssetChart.tsx`
- **Interactive line chart** showing historical and projected performance for each asset
- **Toggle buttons** to show/hide specific assets
- **Color-coded lines** for easy visual distinction
- **Asset metrics** showing current value and APY below chart
- Uses Recharts with responsive design

**Usage:**
```tsx
import { MultiAssetChart } from '@/components/MultiAssetChart';

<MultiAssetChart />
```

#### `AssetAllocationPieChart.tsx`
- **Pie chart** showing portfolio distribution
- **Percentage breakdown** with asset values
- **Diversification score** (0-100) based on concentration
- **Detailed breakdown table** below chart

**Usage:**
```tsx
import { AssetAllocationPieChart } from '@/components/AssetAllocationPieChart';

<AssetAllocationPieChart />
```

**Diversification Score Algorithm:**
```typescript
// Uses inverse of Herfindahl index
// Higher score = more diversified
// Perfect diversification = 100
// Single asset = 0
```

#### `CorrelationHeatmap.tsx`
- **Color-coded matrix** showing asset correlations
- **Hover tooltips** with exact correlation values
- **Legend** explaining correlation strength
- **Key insights** about diversification opportunities

**Usage:**
```tsx
import { CorrelationHeatmap } from '@/components/CorrelationHeatmap';

<CorrelationHeatmap />
```

**Color Scale:**
- Red (0.9+): Very high correlation
- Orange (0.7-0.9): High correlation
- Yellow (0.5-0.7): Medium correlation
- Green (0.3-0.5): Low correlation
- Blue (0.1-0.3): Very low correlation
- Gray (0-0.1): No correlation

#### `AnalyticsTab.tsx`
Complete analytics dashboard combining all components with:
- **3 sub-tabs**: Performance, Allocation, Correlation
- **Rebalancing recommendations** with actionable suggestions
- **Portfolio health summary** with key metrics
- **Impact projections** for suggested changes

**Usage:**
```tsx
import { AnalyticsTab } from '@/components/tabs/AnalyticsTab';

<AnalyticsTab />
```

### 3. Integration Example

Add the Analytics tab to your main page:

```tsx
// In your main Index.tsx or similar
import { AnalyticsTab } from '@/components/tabs/AnalyticsTab';

<Tabs defaultValue="portfolio">
  <TabsList>
    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="forecast">Forecast</TabsTrigger>
  </TabsList>

  <TabsContent value="portfolio">
    <PortfolioTab />
  </TabsContent>

  <TabsContent value="analytics">
    <AnalyticsTab />
  </TabsContent>

  <TabsContent value="forecast">
    <ForecastTab />
  </TabsContent>
</Tabs>
```

### 4. Data Flow

```
User's Portfolio (DemoContext)
    ↓
API Call: multiAssetForecast()
    ↓
Backend: Calculate forecasts for each asset
    ↓
Response: Asset performance + allocation + total value
    ↓
Frontend: Render charts with Recharts
```

### 5. Key Insights Provided

#### Multi-Asset Performance Chart
- Compare growth trajectories across assets
- Identify which assets are driving portfolio growth
- See impact of different APYs on long-term value
- Toggle between assets to focus on specific comparisons

#### Asset Allocation
- Understand concentration risk
- Get diversification score
- See exact dollar values and percentages
- Identify over/under-allocated positions

#### Correlation Matrix
- Discover which assets move together
- Find opportunities for true diversification
- Understand portfolio volatility drivers
- Plan rebalancing to reduce correlation

### 6. Rebalancing Recommendations

The system provides actionable recommendations:

**Example 1: Reduce Concentration**
```
Problem: 70% in weETH
Solution: Move 1 weETH → Liquid USD
Impact: +15% diversification score
```

**Example 2: Increase Yield**
```
Problem: Missing higher APY opportunities
Solution: Add $500 to Liquid USD
Impact: +0.8% blended APY
```

**Example 3: Add Uncorrelated Asset**
```
Problem: High portfolio volatility
Solution: Allocate 10% to WBTC
Impact: -12% expected volatility
```

### 7. Testing the New Features

**Start the backend:**
```bash
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

**Test endpoints:**
```bash
# Multi-asset forecast
curl -X POST http://localhost:8000/api/multi-asset-forecast \
  -H "Content-Type: application/json" \
  -d '{"balances":{"ETH":0.2,"eETH":0,"weETH":5,"LiquidUSD":1200},"assumptions":{"apyStake":0.04,"apyLiquidUsd":0.10,"borrowRate":0.05,"ltvWeeth":0.5}}'

# Correlation matrix
curl http://localhost:8000/api/correlation-matrix
```

**Frontend:**
1. Start dev server: `npm run dev`
2. Navigate to the Analytics tab
3. Try toggling different assets in the performance chart
4. Adjust your mock balances and watch charts update
5. Review rebalancing recommendations

### 8. Next Steps

To fully integrate these features:

1. **Add to main navigation:**
   - Update your main page/router to include the Analytics tab
   - Place it prominently as a key feature

2. **Enhance with real data:**
   - Connect to live price feeds (CoinGecko, CoinMarketCap)
   - Fetch real APYs from EtherFi contracts
   - Calculate actual historical correlations from price data

3. **Add more analytics:**
   - Sharpe ratio calculation
   - Maximum drawdown analysis
   - Value at Risk (VaR) metrics
   - Monte Carlo simulations

4. **Implement recommendations engine:**
   - Use Claude AI to generate personalized recommendations
   - Factor in user's risk tolerance
   - Consider gas costs for rebalancing
   - Suggest optimal execution timing

5. **Mobile optimization:**
   - Responsive charts for smaller screens
   - Swipe gestures for asset comparison
   - Simplified views for mobile

## File Structure

```
src/
├── components/
│   ├── MultiAssetChart.tsx           # Performance line chart
│   ├── AssetAllocationPieChart.tsx   # Allocation pie chart
│   ├── CorrelationHeatmap.tsx        # Correlation matrix
│   └── tabs/
│       └── AnalyticsTab.tsx          # Combined analytics dashboard
└── lib/
    ├── types.ts                      # Added multi-asset types
    └── api.ts                        # Added API functions

backend/
└── main.py                           # Added 2 new endpoints
```

## API Summary

**New Endpoints:**
- `POST /api/multi-asset-forecast` - Multi-asset performance forecasts
- `GET /api/correlation-matrix` - Asset correlation data

**Updated Files:**
- [backend/main.py](backend/main.py) - Lines 62-241
- [src/lib/types.ts](src/lib/types.ts) - Lines 63-81
- [src/lib/api.ts](src/lib/api.ts) - Lines 51-55

**New Components:**
- [src/components/MultiAssetChart.tsx](src/components/MultiAssetChart.tsx)
- [src/components/AssetAllocationPieChart.tsx](src/components/AssetAllocationPieChart.tsx)
- [src/components/CorrelationHeatmap.tsx](src/components/CorrelationHeatmap.tsx)
- [src/components/tabs/AnalyticsTab.tsx](src/components/tabs/AnalyticsTab.tsx)

All components are fully typed, responsive, and integrate seamlessly with your existing DemoContext!
