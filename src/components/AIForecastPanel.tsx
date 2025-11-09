import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { TrendingUp, TrendingDown, Brain, Loader2, AlertCircle } from 'lucide-react';
import { formatUSD } from '@/lib/helpers';

interface ForecastData {
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
}

export function AIForecastPanel() {
  const [forecasts, setForecasts] = useState<Record<string, ForecastData>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const products = [
    { key: 'weETH', name: 'weETH', color: 'text-purple-400' },
    { key: 'eETH', name: 'eETH', color: 'text-blue-400' },
  ];

  const fetchForecast = async (product: string) => {
    setLoading((prev) => ({ ...prev, [product]: true }));
    setErrors((prev) => ({ ...prev, [product]: '' }));

    try {
      const data = await api.priceForecast(product, 30);
      console.log(`[AIForecastPanel] Received forecast for ${product}:`, data);
      console.log(`[AIForecastPanel] current_price: ${data.current_price}, predicted_price: ${data.forecast?.predicted_price}`);
      setForecasts((prev) => ({ ...prev, [product]: data }));
    } catch (error) {
      console.error(`Failed to fetch forecast for ${product}:`, error);
      setErrors((prev) => ({
        ...prev,
        [product]: 'AI forecast unavailable - ensure backend is running with ANTHROPIC_API_KEY set',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [product]: false }));
    }
  };

  useEffect(() => {
    // Fetch forecasts for both products on mount
    products.forEach((product) => fetchForecast(product.key));
  }, []);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'moderate':
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getPriceChange = (current: number, predicted: number) => {
    const change = predicted - current;
    const changePct = (change / current) * 100;
    return { change, changePct };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>30-Day Price Forecasts</CardTitle>
            <CardDescription>
              Predictions based on historical trends and market conditions
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {products.map((product) => {
          const forecast = forecasts[product.key];
          const isLoading = loading[product.key];
          const error = errors[product.key];

          if (isLoading) {
            return (
              <div
                key={product.key}
                className="p-4 bg-secondary/50 rounded-lg flex items-center justify-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading forecast for {product.name}...</span>
              </div>
            );
          }

          if (error) {
            return (
              <div
                key={product.key}
                className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-400 mb-1">
                      {product.name} Forecast Unavailable
                    </div>
                    <div className="text-sm text-muted-foreground">{error}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchForecast(product.key)}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            );
          }

          if (!forecast) return null;

          // Additional safety check for forecast structure
          if (!forecast.forecast || !forecast.forecast.predicted_price) {
            return (
              <div
                key={product.key}
                className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-400 mb-1">
                      {product.name} Forecast Data Invalid
                    </div>
                    <div className="text-sm text-muted-foreground">
                      The forecast response is incomplete. Try regenerating.
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchForecast(product.key)}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            );
          }

          const { change, changePct } = getPriceChange(
            forecast.current_price,
            forecast.forecast.predicted_price
          );
          const isPositive = change > 0;

          return (
            <div
              key={product.key}
              className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className={`text-lg font-semibold ${product.color}`}>
                    {product.name}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    30-day forecast
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${getConfidenceColor(forecast.forecast.confidence)}`}
                >
                  {forecast.forecast.confidence} confidence
                </Badge>
              </div>

              {/* Price Prediction */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Current Price
                  </div>
                  <div className="text-xl font-bold">
                    {formatUSD(forecast.current_price)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Predicted Price
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold">
                      {formatUSD(forecast.forecast.predicted_price)}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        isPositive ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>
                        {isPositive ? '+' : ''}
                        {changePct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="mb-3 p-3 bg-purple-950/20 rounded border border-purple-500/20">
                <div className="text-xs font-semibold text-purple-400 mb-1">
                  AI Analysis
                </div>
                <div className="text-sm text-muted-foreground">
                  {forecast.forecast.reasoning}
                </div>
              </div>

              {/* Risk Factors */}
              {forecast.forecast.risk_factors && forecast.forecast.risk_factors.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-orange-400 mb-2">
                    Key Risk Factors
                  </div>
                  <ul className="space-y-1">
                    {forecast.forecast.risk_factors.map((risk, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-orange-400">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Refresh Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchForecast(product.key)}
                className="w-full mt-3 text-xs"
              >
                <Brain className="h-3 w-3 mr-2" />
                Regenerate Forecast
              </Button>
            </div>
          );
        })}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Forecasts generated by Claude AI. Not financial advice. Use for educational purposes
          only.
        </div>
      </CardContent>
    </Card>
  );
}
