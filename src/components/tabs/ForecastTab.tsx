import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useDemoState } from '@/contexts/DemoContext';
import { getJSON } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { LineChart, TrendingUp } from 'lucide-react';

interface DataPoint {
  month: number;
  value: number;
}

interface ForecastResponse {
  historical: DataPoint[];
  projection: DataPoint[];
}

export const ForecastTab = () => {
  const { demoState } = useDemoState();
  const { balances, assumptions } = demoState;
  const { toast } = useToast();

  const [principal, setPrincipal] = useState(balances.weETH);
  const [apy, setApy] = useState(assumptions.apyStake);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPrincipal(balances.weETH);
  }, [balances.weETH]);

  const fetchForecast = async () => {
    setIsLoading(true);
    try {
      const data = await getJSON<ForecastResponse>(
        `/api/forecast?principal=${principal}&apy=${apy}&months=12`
      );
      setForecast(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load forecast data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const maxValue = forecast
    ? Math.max(
        ...forecast.historical.map((d) => d.value),
        ...forecast.projection.map((d) => d.value)
      )
    : 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Growth Forecast</h2>
        <p className="text-muted-foreground">
          Historical data and 12-month projection based on your holdings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Principal (ETH)</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              step="0.1"
              value={principal}
              onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Projected APY</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              step="0.01"
              value={apy * 100}
              onChange={(e) => setApy(parseFloat(e.target.value) / 100 || 0)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                12-Month Projection
              </CardTitle>
              <CardDescription>Gray = Historical, Blue = Projected</CardDescription>
            </div>
            <button
              onClick={fetchForecast}
              disabled={isLoading}
              className="text-sm text-primary hover:underline"
            >
              Refresh
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading forecast...</p>
              </div>
            </div>
          ) : forecast ? (
            <div className="space-y-4">
              {/* Simple SVG chart */}
              <svg viewBox="0 0 800 300" className="w-full h-64">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="50"
                    y1={50 + i * 50}
                    x2="750"
                    y2={50 + i * 50}
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                ))}

                {/* Historical line */}
                <polyline
                  points={forecast.historical
                    .map(
                      (d) =>
                        `${50 + (d.month / 24) * 700},${250 - (d.value / maxValue) * 180}`
                    )
                    .join(' ')}
                  fill="none"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="2"
                />

                {/* Projection line */}
                <polyline
                  points={forecast.projection
                    .map(
                      (d) =>
                        `${50 + ((d.month + 12) / 24) * 700},${250 - (d.value / maxValue) * 180}`
                    )
                    .join(' ')}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                />

                {/* Axis labels */}
                <text x="25" y="55" className="text-xs fill-muted-foreground">
                  {maxValue.toFixed(2)}
                </text>
                <text x="25" y="255" className="text-xs fill-muted-foreground">
                  0
                </text>
              </svg>

              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-muted-foreground"></div>
                  <span className="text-muted-foreground">Historical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-primary"></div>
                  <span className="text-foreground">Projection</span>
                </div>
              </div>

              {forecast.projection.length > 0 && (
                <Card className="bg-success/5 border-success/20">
                  <CardContent className="pt-4 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium">
                        Projected value in 12 months:{' '}
                        {forecast.projection[forecast.projection.length - 1].value.toFixed(4)} ETH
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Based on {(apy * 100).toFixed(2)}% APY
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
