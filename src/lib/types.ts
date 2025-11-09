// Backend API Types

export interface WalletBalances {
  ETH: number;
  eETH: number;
  weETH: number;
  LiquidUSD: number;
}

export interface Assumptions {
  apyStake: number;
  apyLiquidUsd: number;
  borrowRate: number;
  ltvWeeth: number;
}

export interface Strategy {
  name: string;
  apy: number;
  yearlyEth: number;
  steps: string[];
  risks: string[];
}

export interface SimulateRequest {
  balances: WalletBalances;
  assumptions: Assumptions;
}

export interface SimulateResponse {
  blendedApy: number;
  risk: "Low" | "Medium" | "High";
  strategies: Strategy[];
}

export interface ForecastPoint {
  month: number;
  value: number;
}

export interface ForecastResponse {
  historical: ForecastPoint[];
  projection: ForecastPoint[];
}

export interface AskRequest {
  q: string;
  context?: Record<string, any>;
}

export interface AskResponse {
  answer: string;
}

export interface RatesResponse {
  apyStake: number;
  apyLiquidUsd: number;
  borrowRate: number;
  ltvWeeth: number;
  source: string;
}

// Multi-Asset Types
export interface AssetPerformance {
  asset: string;
  historical: ForecastPoint[];
  projection: ForecastPoint[];
  apy: number;
  currentValue: number;
}

export interface MultiAssetForecastResponse {
  assets: AssetPerformance[];
  totalValue: ForecastPoint[];
  allocation: Record<string, number>;
}

export interface CorrelationMatrix {
  assets: string[];
  matrix: number[][];
}
