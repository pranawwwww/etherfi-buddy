# AI Chatbot Setup Guide

## Overview
The AI chatbot uses Claude (Anthropic) to provide intelligent, context-aware responses about DeFi, ether.fi products, and personalized portfolio advice.

## Features
✅ **Portfolio Context-Aware**: The chatbot knows your current balances and can give personalized advice
✅ **Live Market Data**: Pulls real-time prices, APY, and metrics from multiple APIs
✅ **DeFi Knowledge Base**: Comprehensive knowledge about eETH, weETH, ETHFI, eBTC, and DeFi concepts
✅ **Beginner-Friendly**: Explains complex concepts in simple language with examples

## Quick Setup

### 1. Install Dependencies
The `anthropic` library is already in `requirements.txt` and should be installed:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Get Your Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### 3. Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
# On Windows PowerShell:
New-Item -Path .env -ItemType File

# On Linux/Mac:
touch .env
```

Add your API key to `.env`:

```env
# Anthropic API Key for Claude AI Chatbot
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# Application Settings (optional - these have defaults)
APP_ORIGIN=http://localhost:8080
DEFAULT_APY_STAKE=0.04
DEFAULT_APY_LIQUID_USD=0.10
DEFAULT_BORROW_RATE=0.05
DEFAULT_LTV_WEETH=0.50
FORECAST_MONTHS=12
```

⚠️ **IMPORTANT**: Replace `sk-ant-api03-your-actual-key-here` with your actual API key!

### 4. Restart the Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 5. Test the Chatbot

1. Open your app at `http://localhost:8080`
2. Click the chat bubble in the bottom-right corner (or press `Cmd/Ctrl + /`)
3. Try asking:
   - "What's in my portfolio?"
   - "How can I maximize my yield?"
   - "What is liquid staking?"
   - "Is my portfolio risky?"
   - "Should I use eETH or weETH?"

## How It Works

### Context-Aware Responses

The chatbot automatically receives your current portfolio information:

```typescript
{
  portfolio: {
    ETH: 0,
    eETH: 0,
    weETH: 5.0,
    LiquidUSD: 1200,
    totalValueUSD: 16200,
    blendedAPY: "6.54"
  },
  userProfile: "Conservative Saver",
  userLevel: "Beginner"
}
```

This allows the chatbot to:
- Give personalized advice based on YOUR holdings
- Suggest strategies appropriate for YOUR risk level
- Explain concepts relevant to YOUR current position

### Knowledge Base

The chatbot has deep knowledge about:

**Products:**
- eETH (Liquid Staking Token)
- weETH (Wrapped eETH)
- ETHFI (Governance Token)
- eBTC (Bitcoin Liquid Staking)
- LiquidUSD (Stablecoin Vault)

**Concepts:**
- Liquid Staking
- Restaking (EigenLayer)
- APY vs APR
- DVT (Distributed Validator Technology)
- Slashing
- LTV (Loan-to-Value)

**Strategies:**
- Simple Staking
- Restaking
- Leveraged Staking

### Live Data Sources

When answering questions, the chatbot can access:
- **DefiLlama**: Current prices & APY
- **Beaconcha.in**: Validator metrics & uptime
- **Uniswap**: Liquidity depth & slippage
- **EigenExplorer**: Restaking distribution

## Example Conversations

### Example 1: Portfolio Analysis
**User:** "What's in my portfolio?"

**Chatbot:** "You currently hold 5.0 weETH (worth ~$16,200) earning 4% APY, plus $1,200 in LiquidUSD earning 10% APY. Your blended portfolio yield is 6.54%. This is a balanced approach with good diversification between staking rewards and stablecoin yield. Risk: smart contract risk exists in both protocols. Educational only — not financial advice."

### Example 2: Strategy Advice
**User:** "How can I increase my yield?"

**Chatbot:** "With your current 5.0 weETH, you have several options: (1) Restake via EigenLayer to earn an extra 2-3% on top of your 4% staking APY, (2) Use weETH as collateral to borrow stablecoins at 50% LTV and deploy them to higher-yield protocols, or (3) Provide liquidity on DEXes for trading fees. Higher yields come with higher risks like liquidation risk or additional smart contract exposure. Given your 'Beginner' level, I'd suggest starting with EigenLayer restaking as it's less complex than leveraged strategies. Educational only — not financial advice."

### Example 3: Concept Explanation
**User:** "What is liquid staking?"

**Chatbot:** "Liquid staking lets you earn staking rewards while keeping your crypto usable in DeFi. When you stake ETH with ether.fi, you get eETH tokens that represent your staked ETH. These tokens earn staking rewards (your balance increases automatically) AND you can use them as collateral, provide liquidity, or trade them. It's like having your cake and eating it too! Traditional staking locks your ETH for months, but with liquid staking, you maintain liquidity. Main risks: smart contract bugs and validator slashing (though ether.fi uses DVT protection). Educational only — not financial advice."

## Troubleshooting

### Issue: Getting Demo Responses

**Problem:** Chatbot returns "(demo) eETH/weETH are EtherFi staking tokens..."

**Solutions:**
1. Check if `ANTHROPIC_API_KEY` is set in `backend/.env`
2. Verify the API key is valid (starts with `sk-ant-`)
3. Check backend logs for error messages
4. Restart the backend server

### Issue: "Error calling Claude API"

**Problem:** Backend logs show API errors

**Solutions:**
1. Verify your API key hasn't expired
2. Check your Anthropic account has available credits
3. Ensure you have internet connectivity
4. Check if you're hitting rate limits

### Issue: No Portfolio Context

**Problem:** Chatbot doesn't mention your holdings

**Solutions:**
1. Check that `DemoContext` is properly set up in `Index.tsx`
2. Verify you have non-zero balances
3. Try refreshing the page
4. Check browser console for errors

## Cost Considerations

### Claude API Pricing (Sonnet 4.5)
- **Input**: ~$3 per million tokens
- **Output**: ~$15 per million tokens

### Typical Usage
- Average question: ~500-1000 input tokens (knowledge base + context)
- Average response: ~150-300 output tokens
- **Cost per message**: ~$0.005-0.01 (less than 1 cent)

For a hackathon demo with ~100 queries: **~$0.50-1.00 total**

## Development Tips

### Testing Without API Key

The chatbot has fallback responses for common questions. You can test the UI without an API key, but responses will be generic.

### Adding Custom Knowledge

Edit `backend/defi_knowledge_base.py` to add:
- New products
- Additional concepts
- Risk information
- Strategy templates

### Customizing Responses

Edit `backend/enhanced_chatbot.py` to:
- Adjust system prompts
- Change response length (max_tokens)
- Modify temperature (creativity)
- Add custom context builders

## Security Notes

⚠️ **Never commit `.env` file to git!**
- The `.env` file is already in `.gitignore`
- Keep your API key secret
- Rotate keys if exposed

## Support

If you encounter issues:
1. Check backend logs: `uvicorn main:app --reload --port 8000`
2. Check browser console (F12)
3. Verify all dependencies are installed
4. Test API key with: `curl https://api.anthropic.com/v1/messages -H "x-api-key: YOUR_KEY"`

---

**Built with ❤️ using Claude Sonnet 4.5**

