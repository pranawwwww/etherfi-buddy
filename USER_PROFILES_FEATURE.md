# User Profiles Feature - Demo Users 👥

## Overview

Your app now has **two distinct user personas** that showcase different aspects of your platform:
1. **Sarah Chen** (Beginner) - Making common mistakes, needs help
2. **Marcus Rivera** (Expert) - Optimized portfolio, showcases analytics

## User Profiles

### 👩‍💼 Sarah Chen - The Beginner (Needs Improvement)

**Level**: Beginner
**Total Value**: ~$11,550
**Current APY**: ~1.2%
**Efficiency**: 15% (terrible!)
**Health Score**: 22/100

**Portfolio**:
```
ETH:        2.5  ($8,750)  ← Idle, earning 0%!
eETH:       0.0  ($0)
weETH:      0.8  ($2,800)  ← Small staking position
Liquid USD: $350           ← Minimal stablecoins
```

**Problems** (What our platform FIXES):
- 💸 2.5 ETH sitting idle earning 0%
- 📉 Missing ~$300/year in staking rewards
- ⚠️ Over-concentrated in ETH (95%)
- 🎯 Very low diversification score (22/100)
- ❌ Not using any DeFi strategies
- 📊 Strategy efficiency: 15%

**Opportunities** (What we SHOW her):
- Convert 2.5 ETH → weETH = +$350/year
- Add $2,000 to Liquid USD = +$200/year
- Use Active strategy = +$480/year total
- Improve diversification score to 75+
- Reduce concentration risk

**Why this persona**:
- Shows "before" state - inefficient portfolio
- Demonstrates improvement opportunities
- Highlights strategy comparison features
- Shows opportunity cost calculator in action
- Perfect for showcasing rebalancing recommendations

---

### 👨‍💻 Marcus Rivera - The Expert (Well-Optimized)

**Level**: Expert
**Total Value**: ~$41,750
**Current APY**: ~5.8%
**Efficiency**: 93% (excellent!)
**Health Score**: 85/100

**Portfolio**:
```
ETH:        0.3  ($1,050)   ← Small liquid reserve
eETH:       2.0  ($7,000)   ← Staking position
weETH:      8.5  ($29,750)  ← Primary position
Liquid USD: $5,200          ← Healthy allocation
```

**Strengths** (What our platform CONFIRMS):
- ✅ Diversified allocation
- ✅ High efficiency score (93%)
- ✅ Active DeFi strategies
- ✅ Balanced risk/reward
- ✅ Using leverage responsibly

**Fine-Tuning Opportunities**:
- Cross-chain deployment for better rates
- Add 10% WBTC for more diversification
- Explore liquid staking derivatives
- Set up automated rebalancing

**Why this persona**:
- Shows "after" state - optimized portfolio
- Demonstrates analytics features
- Shows what good looks like
- Perfect for multi-asset charts
- Highlights correlation analysis value

---

## How Users Switch Profiles

### 1. Click "Mock Wallet" Button
In the header, users click "Connect Mock Wallet"

### 2. See User Profiles Tab
Modal opens with two tabs:
- **User Profiles** ← New! Clickable persona cards
- **Manual Edit** ← Original balance editor

### 3. Choose a Persona
Two cards side-by-side:

```
┌─────────────────────────┐  ┌─────────────────────────┐
│ 👩‍💼 Sarah Chen           │  │ 👨‍💻 Marcus Rivera         │
│ Beginner                │  │ Expert                  │
│                         │  │                         │
│ Total: $11,550          │  │ Total: $41,750          │
│ APY: 1.2%               │  │ APY: 5.8%               │
│ Health: 22/100          │  │ Health: 85/100          │
│ Efficiency: 15%         │  │ Efficiency: 93%         │
│                         │  │                         │
│ ⚠️ Missing $400/year    │  │ ✅ Earning $2,400/year  │
│ Our platform can help!  │  │ Great management!       │
│                         │  │                         │
│ [Switch to Sarah Chen]  │  │ [Switch to Marcus]      │
└─────────────────────────┘  └─────────────────────────┘
```

### 4. Instant Portfolio Switch
Click a card → All tabs update immediately with that user's data

---

## What Each Tab Shows

### Portfolio Tab
**Sarah (Beginner)**:
- Shows inefficient allocation
- Highlights idle ETH
- Low health score warnings

**Marcus (Expert)**:
- Balanced portfolio display
- High health score badge
- Active positions

### Strategies Tab
**Sarah (Beginner)** - PERFECT for demos:
- Current: 1.2% APY
- Conservative: 3.5% APY ↗️ +2.3%
- Active: 6.5% APY ↗️ +5.3%
- Opportunity Cost: $480/year missed
- Efficiency: 15% (Shows HUGE improvement potential)

**Marcus (Expert)**:
- Current: 5.8% APY
- Conservative: 4.0% APY ↘️ -1.8%
- Active: 6.2% APY ↗️ +0.4%
- Opportunity Cost: $40/year missed
- Efficiency: 93% (Already optimized)

### Analytics Tab
**Sarah (Beginner)**:
- Multi-asset chart shows heavy ETH concentration
- Allocation pie chart: 95% ETH (red flag!)
- Diversification score: 22/100
- Correlation matrix: Not utilizing low-correlation assets

**Marcus (Expert)**:
- Multi-asset chart shows balanced growth
- Allocation pie chart: 60/40 split (healthy!)
- Diversification score: 85/100
- Correlation matrix: Good use of uncorrelated assets

### Forecast Tab
**Sarah (Beginner)**:
- Flat projections (1.2% APY)
- Shows what could be with optimization

**Marcus (Expert)**:
- Strong upward trajectory (5.8% APY)
- Compound interest working well

---

## Technical Implementation

### Files Created

1. **[src/lib/userProfiles.ts](src/lib/userProfiles.ts)**
   - User profile definitions
   - Outcome calculations
   - Status assessments

2. **[src/components/UserProfileSelector.tsx](src/components/UserProfileSelector.tsx)**
   - Visual profile cards
   - Backstories
   - Quick stats

### Files Modified

3. **[src/contexts/DemoContext.tsx](src/contexts/DemoContext.tsx)**
   - Added `currentUser` state
   - Added `switchUser()` function
   - Default to Sarah (beginner)

4. **[src/components/MockWalletModal.tsx](src/components/MockWalletModal.tsx)**
   - Added tabs: Profiles vs Manual
   - Integrated UserProfileSelector
   - Wider modal for cards

### Data Structure

```typescript
interface UserProfile {
  id: 'beginner' | 'expert';
  name: string;
  avatar: string;
  level: 'beginner' | 'expert';
  description: string;
  backstory: string;
  balances: WalletBalances;
  assumptions: Assumptions;
  problems: string[];
  opportunities: string[];
}
```

---

## Demo Script for Judges

### Act 1: Show the Problem (Sarah)
1. Open app → Default loads Sarah's portfolio
2. Navigate to **Strategies** tab
3. Point out:
   - "Current APY: 1.2%"
   - "Missing $480/year"
   - "Efficiency: 15%"
4. Click **Opportunity Cost** sub-tab
5. Show:
   - "You're Missing Out: $480/year"
   - Time horizon breakdown
   - Recommended actions

**Takeaway**: "See how we identify problems and quantify the cost of inaction!"

### Act 2: Show the Solution (Switch to Marcus)
1. Click "Mock Wallet" button
2. Click **User Profiles** tab
3. Click "Switch to Marcus Rivera"
4. Navigate to **Strategies** tab
5. Point out:
   - "Current APY: 5.8%"
   - "Efficiency: 93%"
   - "Already optimized!"
6. Navigate to **Analytics** tab
7. Show:
   - Multi-asset performance chart
   - Balanced allocation pie chart
   - Diversification score: 85/100

**Takeaway**: "This is what good looks like! Our platform helps users get here."

### Act 3: Show the Journey (Compare Both)
1. Open Modal → Switch back to Sarah
2. Open **Strategy Comparison** table
3. Show Sarah vs Marcus metrics:
   ```
   Sarah:   1.2% APY → Could be 6.5% (+$480/year)
   Marcus:  5.8% APY → Already near optimal
   ```
4. Navigate to **Analytics** → **Allocation**
5. Compare:
   ```
   Sarah:   22 diversification score (poor)
   Marcus:  85 diversification score (excellent)
   ```

**Takeaway**: "We meet users where they are and guide them to optimization."

---

## Key Metrics Showcase

### Sarah's Journey Potential
```
Before (Current):
- APY: 1.2%
- Annual Earnings: $138
- Efficiency: 15%
- Health: 22/100

After (Following Recommendations):
- APY: 6.5%
- Annual Earnings: $750
- Efficiency: 100%
- Health: 80/100

Improvement: +$612/year (444% increase!)
```

### Marcus's Fine-Tuning
```
Current:
- APY: 5.8%
- Annual Earnings: $2,420
- Efficiency: 93%
- Health: 85/100

Potential with Cross-Chain:
- APY: 6.2%
- Annual Earnings: $2,588
- Efficiency: 99%
- Health: 90/100

Improvement: +$168/year (7% increase)
```

---

## Usage Examples

### Switch User Programmatically

```typescript
import { useDemoState } from '@/contexts/DemoContext';

function MyComponent() {
  const { switchUser, currentUser } = useDemoState();

  return (
    <button onClick={() => switchUser('expert')}>
      Load Expert Portfolio
    </button>
  );
}
```

### Get Current User Info

```typescript
const { currentUser } = useDemoState();

if (currentUser?.level === 'beginner') {
  // Show extra help tooltips
}
```

### Calculate Outcomes

```typescript
import { calculateUserOutcomes } from '@/lib/userProfiles';

const outcomes = calculateUserOutcomes(currentUser);
console.log(outcomes.opportunity.missedUsd);  // $480
```

---

## Backstories (For Context)

**Sarah Chen's Story**:
> "Sarah bought ETH 6 months ago and has been holding it idle. She heard about staking but hasn't explored it yet. Her portfolio is inefficient and she's missing out on significant yield opportunities."

**Marcus Rivera's Story**:
> "Marcus has been in crypto since 2017. He actively manages his portfolio, uses leverage responsibly, and maximizes yield across multiple protocols. His strategy balances risk and reward effectively."

---

## Testing

### Manual Testing

```bash
# Start app
npm run dev

# Test flow:
1. Click "Mock Wallet"
2. See Sarah Chen profile (default)
3. Click "Switch to Marcus Rivera"
4. Navigate through all tabs
5. Compare metrics
6. Switch back to Sarah
7. See opportunity cost changes
```

### Automated Testing

```typescript
describe('User Profiles', () => {
  it('switches between users', () => {
    const { switchUser, currentUser } = useDemoState();

    switchUser('expert');
    expect(currentUser?.name).toBe('Marcus Rivera');

    switchUser('beginner');
    expect(currentUser?.name).toBe('Sarah Chen');
  });

  it('calculates correct outcomes', () => {
    const profile = getUserProfile('beginner');
    const outcomes = calculateUserOutcomes(profile);

    expect(outcomes.opportunity.missedUsd).toBeGreaterThan(400);
    expect(outcomes.opportunity.efficiency).toBeLessThan(20);
  });
});
```

---

## Why This Feature Wins Hackathons

1. **Immediate Visual Impact**
   - Click → Instant portfolio transformation
   - Side-by-side comparison
   - Clear before/after story

2. **Showcases ALL Features**
   - Sarah shows improvement features
   - Marcus shows analytics power
   - Both demonstrate platform value

3. **Relatable Personas**
   - Everyone knows a "Sarah" (crypto newbie)
   - Everyone aspires to be "Marcus" (informed investor)
   - Judges see themselves in one

4. **Quantified Value Proposition**
   - "$480/year missed" is tangible
   - "15% efficiency" is shocking
   - "444% improvement" is compelling

5. **Educational Without Preaching**
   - Show, don't tell
   - Let users explore
   - Discovery-based learning

---

## Future Enhancements

### Phase 2: More Personas
- **DeFi Degen** - High risk, high reward
- **Stablecoin Maxi** - Conservative, low volatility
- **Multi-Chain Explorer** - Cross-chain optimization

### Phase 3: Guided Tours
- "Follow Sarah's optimization journey"
- Step-by-step transformation
- Interactive tutorial mode

### Phase 4: Social Sharing
- "Share your profile"
- "Compare with friends"
- Leaderboards

---

## Files Reference

- [src/lib/userProfiles.ts](src/lib/userProfiles.ts)
- [src/components/UserProfileSelector.tsx](src/components/UserProfileSelector.tsx)
- [src/contexts/DemoContext.tsx](src/contexts/DemoContext.tsx)
- [src/components/MockWalletModal.tsx](src/components/MockWalletModal.tsx)

**The user profile feature is complete and ready to impress judges!** 🎯

Just click "Mock Wallet" → "User Profiles" → Switch between Sarah and Marcus to see the magic!
