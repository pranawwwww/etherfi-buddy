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
  ethPrice?: number;
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

// Risk Analysis Types
export interface OperatorUptimeData {
  uptime_7d_pct: number;
  missed_attestations_7d: number;
  dvt_protected: boolean;
  client_diversity_note: string;
}

export interface AVSConcentrationData {
  largest_avs_pct: number;
  hhi: number;
  avs_split: Array<{ name: string; pct: number }>;
}

export interface SlashingProxyInputs {
  operator_uptime_band: string;
  historical_slashes_count: number;
  avs_audit_status: string;
  client_diversity_band: string;
  dvt_presence: boolean;
}

export interface SlashingProxyData {
  proxy_score: number;
  inputs: SlashingProxyInputs;
}

export interface LiquidityChainData {
  chain: string;
  venue: string;
  pool: string;
  depth_usd: number;
  slippage_bps: number;
  est_total_fee_usd: number;
}

export interface LiquidityDepthData {
  health_index: number;
  reference_trade_usd: number;
  chains: LiquidityChainData[];
  recommended_chain?: string;
}

export interface TilesData {
  operator_uptime: OperatorUptimeData;
  avs_concentration: AVSConcentrationData;
  slashing_proxy: SlashingProxyData;
  liquidity_depth: LiquidityDepthData;
}

export interface DistributionData {
  base_stake_pct: number;
  restaked_pct: number;
  balanced_score: number;
}

export interface BreakdownData {
  distribution: DistributionData;
}

export interface RiskScoreData {
  score: number;
  grade: "Safe" | "Moderate" | "High";
  top_reasons: string[];
}

export interface RiskAnalysisResponse {
  address: string;
  timestamp: string;
  methodology_version: string;
  risk_score: RiskScoreData;
  tiles: TilesData;
  breakdown: BreakdownData;
}
