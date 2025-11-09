import type { WalletBalances, Assumptions } from './types';

export interface UserProfile {
  id: string;
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

export const USER_PROFILES: Record<string, UserProfile> = {
  beginner: {
    id: 'beginner',
    name: 'Sarah Chen',
    avatar: '👩‍💼',
    level: 'beginner',
    description: 'New to DeFi, making common mistakes',
    backstory: 'Sarah bought ETH 6 months ago and has been holding it idle. She heard about staking but hasn\'t explored it yet. Her portfolio is inefficient and she\'s missing out on significant yield opportunities.',
    balances: {
      ETH: 2.5,        // Idle ETH earning 0%
      eETH: 0.0,       // Not staking at all
      weETH: 0.8,      // Small staking position
      LiquidUSD: 350,  // Minimal stablecoin exposure
    },
    assumptions: {
      apyStake: 0.04,
      apyLiquidUsd: 0.10,
      borrowRate: 0.05,
      ltvWeeth: 0.50,
    },
    problems: [
      '💸 2.5 ETH sitting idle earning 0%',
      '📉 Missing ~$300/year in staking rewards',
      '⚠️ Over-concentrated in ETH (95%)',
      '🎯 Very low diversification score (22/100)',
      '❌ Not using any DeFi strategies',
      '📊 Strategy efficiency: 15% (terrible!)',
    ],
    opportunities: [
      'Convert 2.5 ETH → weETH = +$350/year',
      'Add $2,000 to Liquid USD = +$200/year',
      'Use Active strategy = +$480/year total',
      'Improve diversification score to 75+',
      'Reduce concentration risk',
      'Unlock borrowing potential',
    ],
  },

  expert: {
    id: 'expert',
    name: 'Marcus Rivera',
    avatar: '👨‍💻',
    level: 'expert',
    description: 'Experienced DeFi user with optimized portfolio',
    backstory: 'Marcus has been in crypto since 2017. He actively manages his portfolio, uses leverage responsibly, and maximizes yield across multiple protocols. His strategy balances risk and reward effectively.',
    balances: {
      ETH: 0.3,        // Small liquid reserve
      eETH: 2.0,       // Significant staking position
      weETH: 5.5,      // Primary position for borrowing (reduced for better balance)
      LiquidUSD: 12000, // Healthy stablecoin allocation (increased for better diversification)
    },
    assumptions: {
      apyStake: 0.04,
      apyLiquidUsd: 0.10,
      borrowRate: 0.05,
      ltvWeeth: 0.50,
    },
    problems: [
      '✅ Already well-optimized',
      '🔍 Could explore other chains (Arbitrum, Base)',
      '📈 Good ETH/Stable balance (38% stables)',
      '🎲 Could add BTC for more diversification',
    ],
    opportunities: [
      'Cross-chain deployment for better rates',
      'Add 10% WBTC for diversification',
      'Explore liquid staking derivatives (LSDfi)',
      'Set up automated rebalancing',
      'Consider options strategies for hedging',
      'Fine-tune LTV for max capital efficiency',
    ],
  },
};

export function getUserProfile(userId: string): UserProfile {
  return USER_PROFILES[userId] || USER_PROFILES.beginner;
}

export function getAllUserProfiles(): UserProfile[] {
  return Object.values(USER_PROFILES);
}

// Calculate expected outcomes for each user
export function calculateUserOutcomes(profile: UserProfile) {
  const ethPrice = 3500;

  // Total portfolio value
  const totalEthValue =
    profile.balances.ETH +
    profile.balances.eETH +
    profile.balances.weETH +
    profile.balances.LiquidUSD / ethPrice;

  const totalUsdValue = totalEthValue * ethPrice;

  // Current strategy (what they're actually earning)
  const stakingEarnings =
    (profile.balances.eETH + profile.balances.weETH) *
    profile.assumptions.apyStake;

  const stableEarnings =
    (profile.balances.LiquidUSD / ethPrice) *
    profile.assumptions.apyLiquidUsd;

  const currentYearlyEth = stakingEarnings + stableEarnings;
  const currentYearlyUsd = currentYearlyEth * ethPrice;
  const currentApy = totalEthValue > 0 ? currentYearlyEth / totalEthValue : 0;

  // Optimal strategy (if they converted all to productive assets)
  const optimalStakingEarnings = totalEthValue * 0.6 * profile.assumptions.apyStake;
  const optimalStableEarnings = totalEthValue * 0.4 * profile.assumptions.apyLiquidUsd;
  const optimalYearlyEth = optimalStakingEarnings + optimalStableEarnings;
  const optimalYearlyUsd = optimalYearlyEth * ethPrice;
  const optimalApy = optimalYearlyEth / totalEthValue;

  // Opportunity cost
  const missedEth = optimalYearlyEth - currentYearlyEth;
  const missedUsd = missedEth * ethPrice;
  const efficiency = currentApy / optimalApy * 100;

  // Risk assessment
  const ethConcentration =
    (profile.balances.ETH + profile.balances.eETH + profile.balances.weETH) /
    totalEthValue;

  const diversificationScore = Math.max(0, 100 - (ethConcentration * 100));

  return {
    totalValue: {
      eth: totalEthValue,
      usd: totalUsdValue,
    },
    current: {
      yearlyEth: currentYearlyEth,
      yearlyUsd: currentYearlyUsd,
      apy: currentApy,
    },
    optimal: {
      yearlyEth: optimalYearlyEth,
      yearlyUsd: optimalYearlyUsd,
      apy: optimalApy,
    },
    opportunity: {
      missedEth,
      missedUsd,
      efficiency,
    },
    risk: {
      ethConcentration,
      diversificationScore,
    },
  };
}

// Get user's current status
export function getUserStatus(profile: UserProfile): {
  healthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  efficiency: number;
  needsHelp: boolean;
} {
  const outcomes = calculateUserOutcomes(profile);

  const healthScore = Math.min(
    100,
    outcomes.risk.diversificationScore * 0.4 +
    outcomes.opportunity.efficiency * 0.6
  );

  const riskLevel =
    outcomes.risk.ethConcentration > 0.8 ? 'High' :
    outcomes.risk.ethConcentration > 0.6 ? 'Medium' : 'Low';

  const efficiency = outcomes.opportunity.efficiency;
  const needsHelp = efficiency < 70 || healthScore < 60;

  return {
    healthScore,
    riskLevel,
    efficiency,
    needsHelp,
  };
}
