import type {
  SimulateRequest,
  SimulateResponse,
  ForecastResponse,
  AskRequest,
  AskResponse,
  RatesResponse,
  MultiAssetForecastResponse,
  CorrelationMatrix,
  RiskAnalysisResponse,
} from './types';

export async function postJSON<T>(url: string, body: any): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Typed API functions
export const api = {
  simulate: (body: SimulateRequest) =>
    postJSON<SimulateResponse>('/api/simulate', body),

  forecast: (principal: number, apy: number, months: number = 12) =>
    getJSON<ForecastResponse>(`/api/forecast?principal=${principal}&apy=${apy}&months=${months}`),

  multiAssetForecast: (body: SimulateRequest, months: number = 12, ethPrice: number = 3500) =>
    postJSON<MultiAssetForecastResponse>(`/api/multi-asset-forecast?months=${months}&eth_price=${ethPrice}`, body),

  correlationMatrix: () =>
    getJSON<CorrelationMatrix>('/api/correlation-matrix'),

  ask: (body: AskRequest) =>
    postJSON<AskResponse>('/api/ask', body),

  rates: () =>
    getJSON<RatesResponse>('/api/rates'),

  health: () =>
    getJSON<{ status: string }>('/health'),

  riskAnalysis: (address?: string, validatorIndex?: string) => {
    const params = new URLSearchParams();
    if (address) params.append('address', address);
    if (validatorIndex) params.append('validator_index', validatorIndex);
    const queryString = params.toString();
    return getJSON<RiskAnalysisResponse>(`/api/risk-analysis${queryString ? `?${queryString}` : ''}`);
  },

  // Real-time price data from DefiLlama
  prices: () =>
    getJSON<{
      eETH: { price: number; timestamp: number };
      weETH: { price: number; timestamp: number };
      ETHFI: { price: number; timestamp: number };
      eBTC: { price: number; timestamp: number };
    }>('/api/prices'),

  // Current APY rates from DefiLlama
  apy: () =>
    getJSON<{
      eETH: { apy: number; source: string };
      weETH: { apy: number; source: string };
      ETHFI: { apy: number; source: string };
      eBTC: { apy: number; source: string };
    }>('/api/apy'),

  // AI-powered price forecast
  priceForecast: (product: string, days: number = 30) =>
    postJSON<{
      product: string;
      current_price: number;
      forecast_days: number;
      forecast: {
        predicted_price: number;
        confidence: string;
        reasoning: string;
        risk_factors: string[];
      };
      historical_data: Array<{ date: string; price: number }>;
    }>('/api/price-forecast', { product, days }),

  // Enhanced portfolio analysis with real APIs
  portfolioAnalysisEnhanced: (balances: {
    eth: number;
    eeth: number;
    weeth: number;
    liquid_usd: number;
  }) =>
    postJSON<{
      total_value_usd: number;
      assets: Array<{
        name: string;
        balance: number;
        price_usd: number;
        value_usd: number;
        apy: number;
        annual_yield_usd: number;
      }>;
      metrics: {
        total_annual_yield_usd: number;
        average_apy: number;
        risk_score: number;
        risk_grade: string;
        liquidity_health: number;
        restaking_ratio: number;
      };
      recommendations: Array<{
        strategy: string;
        reason: string;
        risk_impact: string;
        priority: string;
      }>;
      data_sources: string[];
    }>('/api/portfolio-analysis-enhanced', balances),

  // AI-powered risk metric explanations
  explainRiskMetric: (metricName: string, metricValue: number, additionalContext?: Record<string, any>) =>
    postJSON<{
      metric: string;
      value: number;
      explanation: string;
      ai_powered: boolean;
    }>('/api/explain-risk-metric', {
      metric_name: metricName,
      metric_value: metricValue,
      additional_context: additionalContext,
    }),

  // Historical price data
  historicalPrices: (asset: string = 'ETH', days: number = 7) =>
    getJSON<{
      asset: string;
      days: number;
      data: Array<{ timestamp: number; price: number; date?: string; value?: number }>;
    }>(`/api/historical-prices?asset=${asset}&days=${days}`),

  // Current gas prices (fallback to 20 gwei if API fails)
  gasPrice: async (): Promise<{ gasPriceGwei: number; source: string }> => {
    try {
      // Try Etherscan API first (returns result in Wei)
      const response = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
      const data = await response.json();
      if (data.status === '1' && data.result?.SafeGasPrice) {
        return {
          gasPriceGwei: parseFloat(data.result.SafeGasPrice),
          source: 'etherscan',
        };
      }
    } catch (error) {
      console.warn('Etherscan gas API failed, using fallback');
    }
    // Fallback to 20 gwei
    return {
      gasPriceGwei: 20,
      source: 'fallback',
    };
  },
};
