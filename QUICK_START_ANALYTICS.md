# Quick Start: Analytics Dashboard

## 🎯 What You'll See

After starting the app, you'll have access to a powerful **Analytics** tab that provides comprehensive portfolio insights.

## 📍 Where to Find It

```
http://localhost:8080
  ↓
Main Navigation Bar
  ↓
[Portfolio] [Analytics] ← Click here! [Forecast]
```

## 🔍 Three Sub-Tabs Inside Analytics

### 1️⃣ Multi-Asset Performance

**What it shows:**
- Interactive line chart with all your assets
- Historical performance (last 12 months)
- Projected growth (next 12 months)
- Each asset in a different color

**Controls:**
- Toggle buttons at the top to show/hide specific assets
- Compare ETH vs weETH vs LiquidUSD side-by-side
- See which assets are outperforming

**Metrics displayed:**
- Current value in USD for each asset
- APY (Annual Percentage Yield) for each asset
- Total portfolio value over time

**Example Insights:**
- "weETH at 4% APY grows to $18,500 in 12 months"
- "Liquid USD at 10% APY outpaces ETH staking"
- "Total portfolio projected to reach $20,000"

### 2️⃣ Asset Allocation

**What it shows:**
- Pie chart of your portfolio distribution
- Percentage breakdown
- Dollar amounts for each asset
- **Diversification Score** (0-100)

**Key Metrics:**
- How much of each asset you hold (in %)
- Total portfolio value
- Concentration risk indicators

**Rebalancing Recommendations:**
You'll see cards like:

```
⚠️ Reduce Concentration Risk
Your portfolio is 70% weETH. Consider diversifying
into stablecoins or BTC to reduce volatility.

→ Move 1 weETH → Liquid USD
Impact: +15% diversification score
```

```
💡 Increase Yield Opportunity
Liquid USD offers 10% APY vs 4% on weETH.
Rebalancing could boost overall returns.

→ Add $500 to Liquid USD
Impact: +0.8% blended APY
```

**Diversification Score Explained:**
- **85-100**: Excellent diversification
- **70-84**: Good diversification
- **50-69**: Moderate diversification
- **30-49**: Poor diversification
- **0-29**: Very concentrated (high risk)

### 3️⃣ Correlation Matrix

**What it shows:**
- Heatmap showing how assets move together
- Correlation coefficients (-1.0 to 1.0)
- Color-coded for easy understanding

**Color Legend:**
- 🟥 Red (0.9+): Very high correlation
- 🟧 Orange (0.7-0.9): High correlation
- 🟨 Yellow (0.5-0.7): Medium correlation
- 🟩 Green (0.3-0.5): Low correlation
- 🟦 Blue (0.1-0.3): Very low correlation
- ⬜ Gray (0-0.1): No correlation

**Example Insights:**
- ETH, eETH, and weETH are highly correlated (0.98+)
  → They move together, so holding all three doesn't diversify much
- Stablecoins (LiquidUSD) have low correlation (0.05) with ETH
  → Great for reducing volatility
- BTC and ETH have moderate correlation (0.65)
  → Some diversification benefit

**Why This Matters:**
- **High correlation** = assets move together (little diversification)
- **Low correlation** = assets move independently (good diversification)
- **Negative correlation** = assets move opposite (hedge risk)

## 🚀 How to Use It

### Step 1: Set Your Mock Balances
1. Click "Mock Wallet" in the header
2. Enter realistic balances:
   ```
   ETH: 0.2
   weETH: 5.0
   LiquidUSD: 1200
   ```
3. Save

### Step 2: Navigate to Analytics
1. Click the **Analytics** tab in main navigation
2. Explore the three sub-tabs

### Step 3: Review Your Portfolio
1. **Performance Tab**:
   - See how each asset grows
   - Toggle assets to compare
   - Note the projected total value

2. **Allocation Tab**:
   - Check your diversification score
   - Read the rebalancing recommendations
   - Identify concentration risks

3. **Correlation Tab**:
   - Find low-correlation pairs
   - Plan diversification strategy

### Step 4: Test Scenarios
1. Go back to Mock Wallet
2. Try different allocations:
   ```
   Scenario A (Concentrated):
   - weETH: 10.0
   - LiquidUSD: 500
   Expected: Low diversification score

   Scenario B (Balanced):
   - ETH: 1.0
   - weETH: 2.0
   - LiquidUSD: 4000
   Expected: High diversification score
   ```
3. Watch how metrics change

## 💡 Tips for Best Results

### 1. Use Realistic Balances
- Base on actual holdings or goals
- Don't use all zeros (charts won't render)
- Mix different asset types

### 2. Compare Strategies
- Try "Conservative" (mostly stablecoins)
- Try "Aggressive" (mostly ETH/weETH)
- See impact on diversification and APY

### 3. Act on Recommendations
- Read the suggested rebalances
- Note the projected impact
- Consider gas costs before executing

### 4. Check Correlations First
- Before adding a new asset, check correlation
- Look for low-correlation opportunities
- Avoid adding highly correlated assets

## 📊 What Each Metric Means

### Blended APY
Your portfolio's average yield, weighted by allocation.
```
Example:
70% weETH at 4% = 2.8%
30% Liquid USD at 10% = 3.0%
Blended APY = 5.8%
```

### Diversification Score
Calculated using Herfindahl index:
- Measures concentration across assets
- Higher score = more spread out
- Lower score = concentrated in few assets

### Risk Level
Based on asset concentration:
- **Low**: Well-diversified, mostly stables
- **Medium**: Balanced mix
- **High**: Concentrated in volatile assets

### Correlation Coefficient
How two assets move together:
- **1.0**: Perfect correlation (always move together)
- **0.5**: Moderate correlation (sometimes move together)
- **0.0**: No correlation (independent movement)
- **-1.0**: Perfect inverse (always move opposite)

## 🎓 Learning from the Data

### Insight 1: ETH Derivatives Are Similar
```
ETH ↔ eETH: 0.98 correlation
ETH ↔ weETH: 0.98 correlation
```
**Takeaway**: Holding both ETH and weETH provides minimal diversification.

### Insight 2: Stablecoins Reduce Volatility
```
ETH ↔ LiquidUSD: 0.05 correlation
```
**Takeaway**: Adding stablecoins significantly reduces portfolio volatility.

### Insight 3: Higher APY ≠ Better Always
```
Liquid USD: 10% APY, Low volatility
weETH: 4% APY, Higher volatility
```
**Takeaway**: Consider risk-adjusted returns, not just APY.

## ⚙️ Troubleshooting

### Charts not loading?
1. Check backend is running: `curl http://localhost:8000/health`
2. Verify you have non-zero balances
3. Check browser console for errors

### Data looks wrong?
1. Verify your mock balances
2. Check assumptions (APYs, ETH price)
3. Refresh the page

### Performance is slow?
1. Toggle off unused assets
2. Reduce number of months in forecast
3. Close other browser tabs

## 🎯 Success Checklist

After using the Analytics tab, you should be able to:

- ✅ Identify which assets are driving growth
- ✅ Know your diversification score
- ✅ Understand concentration risks
- ✅ Get specific rebalancing suggestions
- ✅ See projected impact of changes
- ✅ Compare asset correlations
- ✅ Make informed portfolio decisions

## 📚 Further Reading

- [MULTI_ASSET_FEATURES.md](MULTI_ASSET_FEATURES.md) - Technical documentation
- [INTEGRATION.md](INTEGRATION.md) - Integration examples
- [backend/README.md](backend/README.md) - API documentation

---

**Ready to explore? Start the servers and click on the Analytics tab!** 🚀
