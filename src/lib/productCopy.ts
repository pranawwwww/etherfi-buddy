export interface ProductInfo {
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  risks: string[];
  idealFor: string[];
  learnMoreUrl?: string;
}

export const PRODUCT_COPY: Record<string, ProductInfo> = {
  eETH: {
    name: "eETH",
    tagline: "Native Liquid Restaking Token",
    description: "eETH is EtherFi's liquid staking token that represents your staked ETH. It earns staking rewards while remaining liquid and usable across DeFi protocols.",
    benefits: [
      "Earn ETH staking rewards (~4% APY)",
      "Maintain liquidity - use in DeFi while staking",
      "Automated restaking for maximum yields",
      "No lock-up periods or withdrawal delays",
    ],
    risks: [
      "Smart contract risk - bugs in EtherFi protocol",
      "Slashing risk from validator penalties",
      "Market risk - eETH may depeg from ETH",
      "Protocol risk - EtherFi governance changes",
    ],
    idealFor: [
      "ETH holders who want staking rewards",
      "DeFi users who need liquid collateral",
      "Long-term ETH believers",
    ],
    learnMoreUrl: "https://etherfi.gitbook.io/etherfi/liquid-staking/eeth",
  },

  weETH: {
    name: "weETH",
    tagline: "Wrapped eETH for DeFi",
    description: "weETH is a wrapped version of eETH designed for maximum DeFi compatibility. It's rebasing-resistant and works seamlessly with lending protocols, DEXs, and other DeFi applications.",
    benefits: [
      "All benefits of eETH",
      "Works with more DeFi protocols (Aave, Compound, etc.)",
      "No rebasing - easier accounting",
      "Can be used as collateral to borrow stablecoins",
    ],
    risks: [
      "All risks of eETH apply",
      "Additional smart contract layer (wrapping)",
      "Liquidation risk when used as collateral",
      "Borrowing rate changes if you take loans",
    ],
    idealFor: [
      "Active DeFi users",
      "Users wanting to leverage their ETH",
      "Borrowers seeking capital efficiency",
    ],
    learnMoreUrl: "https://etherfi.gitbook.io/etherfi/liquid-staking/weeth",
  },

  "Liquid USD": {
    name: "Liquid USD",
    tagline: "High-Yield Stablecoin Vault",
    description: "Liquid USD is a stablecoin savings vault that earns yield through DeFi strategies. Deposit USDC, USDT, or DAI to earn attractive rates on your stablecoins.",
    benefits: [
      "High APY on stablecoins (~10%)",
      "Auto-compounding yield strategies",
      "Diversified across multiple protocols",
      "Instant deposits and withdrawals",
    ],
    risks: [
      "Smart contract risk across multiple protocols",
      "Strategy risk - yields can fluctuate",
      "Depeg risk of underlying stablecoins",
      "DeFi protocol risks (Aave, Curve, etc.)",
    ],
    idealFor: [
      "Stablecoin holders seeking yield",
      "Users who borrowed stables against weETH",
      "Conservative DeFi investors",
    ],
    learnMoreUrl: "https://etherfi.gitbook.io/etherfi/liquid/liquidusd",
  },

  "Liquid ETH": {
    name: "Liquid ETH",
    tagline: "ETH Liquidity Pool",
    description: "Liquid ETH provides deep liquidity for ETH swaps and earns you trading fees plus additional incentives. Perfect for passive ETH holders.",
    benefits: [
      "Earn trading fees from swaps",
      "Additional token incentives",
      "Automated rebalancing",
      "Deep liquidity for better pricing",
    ],
    risks: [
      "Impermanent loss from ETH price volatility",
      "Smart contract risk",
      "Liquidity provider risks",
      "Lower yields than staking during quiet markets",
    ],
    idealFor: [
      "ETH holders comfortable with LP risks",
      "Users seeking diversified yield sources",
      "Liquidity providers",
    ],
    learnMoreUrl: "https://etherfi.gitbook.io/etherfi/liquid/liquideth",
  },

  "Liquid BTC": {
    name: "Liquid BTC",
    tagline: "Bitcoin Yield Opportunities",
    description: "Bring your Bitcoin to DeFi. Liquid BTC accepts wrapped BTC tokens and generates yield through lending and liquidity provision strategies.",
    benefits: [
      "Earn yield on dormant BTC",
      "Access DeFi with Bitcoin",
      "Automated strategy management",
      "Competitive BTC yields",
    ],
    risks: [
      "Wrapped BTC bridge risks (WBTC, tBTC)",
      "Smart contract vulnerabilities",
      "Bitcoin bridge centralization risks",
      "DeFi protocol dependencies",
    ],
    idealFor: [
      "BTC holders wanting DeFi exposure",
      "Multi-chain investors",
      "Users comfortable with wrapped assets",
    ],
    learnMoreUrl: "https://etherfi.gitbook.io/etherfi/liquid/liquidbtc",
  },

  WBTC: {
    name: "WBTC",
    tagline: "Wrapped Bitcoin on Ethereum",
    description: "Wrapped Bitcoin (WBTC) is an ERC-20 token backed 1:1 by Bitcoin. It allows you to use Bitcoin in Ethereum DeFi applications.",
    benefits: [
      "Use Bitcoin in Ethereum DeFi",
      "1:1 backed by real BTC",
      "High liquidity across DEXs",
      "Transparent on-chain reserves",
    ],
    risks: [
      "Centralized custody (BitGo)",
      "Bridge security risks",
      "Regulatory risks for custodians",
      "Not native Bitcoin - requires trust",
    ],
    idealFor: [
      "Bitcoin holders wanting DeFi access",
      "Users comfortable with custodial solutions",
      "Multi-chain DeFi users",
    ],
    learnMoreUrl: "https://wbtc.network/dashboard/order-book",
  },

  beHYPE: {
    name: "beHYPE",
    tagline: "EtherFi Governance & Rewards Token",
    description: "beHYPE represents your stake in EtherFi's governance and future. Earn protocol revenue share and participate in key decisions.",
    benefits: [
      "Protocol revenue sharing",
      "Governance voting rights",
      "Early access to new features",
      "Long-term alignment with EtherFi growth",
    ],
    risks: [
      "High volatility - governance tokens fluctuate",
      "Governance participation required for value",
      "Token economics can change",
      "Less established than ETH/stablecoins",
    ],
    idealFor: [
      "Long-term EtherFi believers",
      "Active governance participants",
      "Users seeking protocol exposure",
    ],
    learnMoreUrl: "https://etherfi.gitbook.io/etherfi/governance",
  },
};

export function getProductInfo(productName: string): ProductInfo | null {
  return PRODUCT_COPY[productName] || null;
}

export function getAllProducts(): ProductInfo[] {
  return Object.values(PRODUCT_COPY);
}
