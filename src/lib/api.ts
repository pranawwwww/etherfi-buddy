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
};
