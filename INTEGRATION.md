# Integration Guide

This guide shows how to connect your React components to the FastAPI backend.

## Prerequisites

1. Backend running at http://localhost:8000
2. Frontend running at http://localhost:8080
3. Vite proxy configured (already done in [vite.config.ts](vite.config.ts))

## API Client Usage

Import the typed API client:

```typescript
import { api } from '@/lib/api';
import type { SimulateRequest, SimulateResponse } from '@/lib/types';
```

### Example: Portfolio Simulation

```typescript
import { useDemoState } from '@/contexts/DemoContext';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';

function PortfolioOverview() {
  const { demoState } = useDemoState();
  const [simulation, setSimulation] = useState<SimulateResponse | null>(null);

  useEffect(() => {
    // Call the simulate endpoint whenever balances change
    api.simulate({
      balances: demoState.balances,
      assumptions: demoState.assumptions,
    })
      .then(setSimulation)
      .catch(console.error);
  }, [demoState]);

  if (!simulation) return <div>Loading...</div>;

  return (
    <div>
      <h2>Blended APY: {(simulation.blendedApy * 100).toFixed(2)}%</h2>
      <div>Risk Level: {simulation.risk}</div>
      <h3>Strategies:</h3>
      {simulation.strategies.map(strategy => (
        <div key={strategy.name}>
          <h4>{strategy.name}</h4>
          <p>APY: {(strategy.apy * 100).toFixed(2)}%</p>
          <p>Yearly ETH: {strategy.yearlyEth.toFixed(4)}</p>
          <ul>
            {strategy.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### Example: Forecast Chart

```typescript
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Line } from 'recharts';

function ForecastChart({ blendedApy, principal }: { blendedApy: number, principal: number }) {
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    api.forecast(principal, blendedApy, 12)
      .then(setForecast)
      .catch(console.error);
  }, [principal, blendedApy]);

  if (!forecast) return <div>Loading forecast...</div>;

  // Combine historical and projection for chart
  const chartData = [
    ...forecast.historical.map(p => ({ month: p.month, value: p.value, type: 'historical' })),
    ...forecast.projection.map(p => ({ month: p.month, value: p.value, type: 'projection' })),
  ];

  return (
    <LineChart data={chartData}>
      <Line dataKey="value" stroke="#8884d8" />
      {/* Add your chart config */}
    </LineChart>
  );
}
```

### Example: Ask Claude (Product Drawer)

```typescript
import { api } from '@/lib/api';
import { useState } from 'react';
import { getProductInfo } from '@/lib/productCopy';

function ProductDrawer({ productName }: { productName: string }) {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const productInfo = getProductInfo(productName);

  const handleAsk = async (question: string) => {
    setLoading(true);
    try {
      const result = await api.ask({
        q: question,
        context: { product: productName },
      });
      setAnswer(result.answer);
    } catch (error) {
      console.error('Ask failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{productInfo?.name}</h2>
      <p>{productInfo?.tagline}</p>
      <p>{productInfo?.description}</p>

      <button onClick={() => handleAsk(\`Explain ${productName} to a beginner\`)}>
        Ask Claude
      </button>

      {loading && <div>Claude is thinking...</div>}
      {answer && <div className="answer">{answer}</div>}

      <h3>Benefits</h3>
      <ul>
        {productInfo?.benefits.map((b, i) => <li key={i}>{b}</li>)}
      </ul>

      <h3>Risks</h3>
      <ul>
        {productInfo?.risks.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
}
```

### Example: Health Score Badge

```typescript
import { healthScore, healthBadge } from '@/lib/helpers';
import { useDemoState } from '@/contexts/DemoContext';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';

function HealthScoreBadge() {
  const { demoState } = useDemoState();
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    api.simulate({
      balances: demoState.balances,
      assumptions: demoState.assumptions,
    }).then(setSimulation);
  }, [demoState]);

  if (!simulation) return null;

  const score = healthScore(
    simulation.risk,
    demoState.balances.weETH,
    demoState.balances.LiquidUSD
  );

  const badge = healthBadge(score);

  return (
    <div className={\`health-badge health-\${badge.toLowerCase()}\`}>
      <div>Health Score: {score}/100</div>
      <div>{badge}</div>
    </div>
  );
}
```

### Example: Load Demo Presets

```typescript
import { PRESET_BEGINNER, PRESET_HOLDER } from '@/lib/helpers';
import { useDemoState } from '@/contexts/DemoContext';

function PresetButtons() {
  const { updateBalances } = useDemoState();

  return (
    <div>
      <button onClick={() => updateBalances(PRESET_BEGINNER.balances)}>
        Load Beginner Preset
      </button>
      <button onClick={() => updateBalances(PRESET_HOLDER.balances)}>
        Load Holder Preset
      </button>
    </div>
  );
}
```

## Testing Checklist

1. **Backend Health Check**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"ok"}
   ```

2. **Simulate Endpoint**
   ```bash
   curl -X POST http://localhost:8000/api/simulate \
     -H "Content-Type: application/json" \
     -d '{"balances":{"ETH":0.2,"eETH":0,"weETH":5,"LiquidUSD":1200},"assumptions":{"apyStake":0.04,"apyLiquidUsd":0.10,"borrowRate":0.05,"ltvWeeth":0.5}}'
   ```

3. **Forecast Endpoint**
   ```bash
   curl "http://localhost:8000/api/forecast?principal=5&apy=0.05&months=12"
   ```

4. **Ask Claude (with API key)**
   ```bash
   curl -X POST http://localhost:8000/api/ask \
     -H "Content-Type: application/json" \
     -d '{"q":"Explain weETH to a beginner","context":{"product":"weETH"}}'
   ```

5. **Frontend Integration**
   - Open http://localhost:8080
   - Open browser DevTools → Network tab
   - Change mock balances → should see POST to `/api/simulate`
   - View forecast tab → should see GET to `/api/forecast`
   - Click product node → drawer opens with product info
   - Click "Ask Claude" → should see POST to `/api/ask`

## Error Handling

The API client throws errors with meaningful messages:

```typescript
try {
  const result = await api.simulate(request);
} catch (error) {
  console.error('Simulation failed:', error.message);
  // Show error to user
}
```

## Environment Variables

Create [.env](.env) from [.env.example](.env.example):

```env
APP_ORIGIN=http://localhost:8080  # Frontend URL
ANTHROPIC_API_KEY=sk-...         # Optional - leave blank for demo
DEFAULT_APY_STAKE=0.04
DEFAULT_APY_LIQUID_USD=0.10
DEFAULT_BORROW_RATE=0.05
DEFAULT_LTV_WEETH=0.50
FORECAST_MONTHS=12
```

## Deployment

### Backend (Fly.io / Render / Railway)

1. Add environment variables in hosting dashboard
2. Update `APP_ORIGIN` to your deployed frontend URL
3. Deploy from `backend/` directory
4. Note the backend URL (e.g., https://your-app.fly.dev)

### Frontend (Vercel / Netlify)

1. Update Vite config for production:
   ```typescript
   // vite.config.ts
   export default defineConfig(({ mode }) => ({
     server: {
       proxy: mode === 'development' ? {
         "/api": "http://localhost:8000",
       } : undefined,
     },
     // In production, use full backend URL
     define: {
       'import.meta.env.VITE_API_BASE': JSON.stringify(
         mode === 'production'
           ? 'https://your-backend.fly.dev'
           : ''
       ),
     },
   }));
   ```

2. Update API client to use base URL in production:
   ```typescript
   const API_BASE = import.meta.env.VITE_API_BASE || '';

   export const api = {
     simulate: (body) => postJSON(\`\${API_BASE}/api/simulate\`, body),
     // ... etc
   };
   ```

## Next Steps

1. Wire up your existing components using the examples above
2. Test each endpoint with the checklist
3. Add error states and loading indicators
4. Test with both demo mode (no API key) and real Claude responses
5. Deploy and update CORS settings

Need help? Check the [backend README](backend/README.md) or the FastAPI docs at http://localhost:8000/docs
