import type { WalletBalances, Assumptions } from './types';

// Health Score Calculation
export function healthScore(
  risk: "Low" | "Medium" | "High",
  weETH: number,
  lusd: number,
  ethPrice: number = 3500
): number {
  let score = 100;

  // Risk penalty
  if (risk === "Medium") score -= 15;
  if (risk === "High") score -= 30;

  // Concentration penalty
  const totalValue = ethPrice * (weETH || 0) + (lusd || 0);
  const usdSide = totalValue ? (lusd || 0) / totalValue : 0;

  if (usdSide > 0.8 || usdSide < 0.2) {
    score -= 15; // Too concentrated in one asset
  }

  return Math.max(0, Math.min(100, score));
}

export function healthBadge(score: number): string {
  return score >= 70 ? "Good" : score >= 40 ? "Caution" : "Risky";
}

// Demo Presets
export const PRESET_BEGINNER = {
  balances: {
    ETH: 0.2,
    eETH: 0,
    weETH: 0.5,
    LiquidUSD: 250,
  } as WalletBalances,
  assumptions: {
    apyStake: 0.04,
    apyLiquidUsd: 0.10,
    borrowRate: 0.05,
    ltvWeeth: 0.5,
  } as Assumptions,
};

export const PRESET_HOLDER = {
  balances: {
    ETH: 0.2,
    eETH: 0,
    weETH: 5,
    LiquidUSD: 1200,
  } as WalletBalances,
  assumptions: {
    apyStake: 0.04,
    apyLiquidUsd: 0.10,
    borrowRate: 0.05,
    ltvWeeth: 0.5,
  } as Assumptions,
};

// Format percentages
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// Format ETH amounts
export function formatETH(value: number, decimals: number = 4): string {
  return `${value.toFixed(decimals)} ETH`;
}

// Format USD amounts
export function formatUSD(value: number, decimals: number = 2): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
