import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { TrendingUp, TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriceSparkline } from '@/components/PriceSparkline';
import { Explainable } from '@/components/Explainable';

interface PriceData {
  eETH: { price: { price: number; symbol: string; timestamp: number; confidence: number; decimals: number } | number; timestamp: number };
  weETH: { price: { price: number; symbol: string; timestamp: number; confidence: number; decimals: number } | number; timestamp: number };
  ETHFI: { price: { price: number; symbol: string; timestamp: number; confidence: number; decimals: number } | number; timestamp: number };
  eBTC: { price: { price: number; symbol: string; timestamp: number; confidence: number; decimals: number } | number; timestamp: number };
}

interface APYData {
  eETH: { apy: number; source: string };
  weETH: { apy: number; source: string };
  ETHFI: { apy: number; source: string };
  eBTC: { apy: number; source: string };
}

export function LivePriceDisplay() {
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [apyData, setApyData] = useState<APYData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pricesRes, apyRes] = await Promise.all([
        api.prices(),
        api.apy(),
      ]);
      setPrices(pricesRes);
      setApyData(apyRes);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch live prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading && !prices) {
    return (
      <Card className="border-blue-500/20 bg-gradient-to-r from-blue-950/20 to-purple-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading live prices...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prices || !apyData) {
    return null;
  }

  const products = [
    { key: 'eETH', name: 'eETH', color: 'text-blue-400' },
    { key: 'weETH', name: 'weETH', color: 'text-purple-400' },
    { key: 'ETHFI', name: 'ETHFI', color: 'text-green-400' },
    { key: 'eBTC', name: 'eBTC', color: 'text-orange-400' },
  ] as const;

  return (
    <Card className="border-blue-500/20 bg-gradient-to-r from-blue-950/20 to-purple-950/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Live Market Data</h3>
            <Badge variant="outline" className="text-xs">
              Real-time
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => {
            // Handle double-nested price structure from API
            const priceData = prices[product.key].price;
            const price = (priceData && typeof priceData === 'object' && 'price' in priceData)
              ? (priceData as any).price 
              : (priceData as number);
            const apy = apyData[product.key].apy;

            return (
              <div
                key={product.key}
                className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <Explainable 
                    term={product.name} 
                    type="product"
                    data={{
                      currentPrice: price,
                      currentAPY: apy,
                      source: apyData[product.key].source
                    }}
                  >
                    <span className={`font-semibold ${product.color}`}>
                      {product.name}
                    </span>
                  </Explainable>
                  <Badge variant="secondary" className="text-xs">
                    {apyData[product.key].source}
                  </Badge>
                </div>
                <Explainable
                  term={`${product.name} Price`}
                  type="metric"
                  data={{
                    value: price,
                    asset: product.name,
                    unit: 'USD',
                    source: apyData[product.key].source,
                    timestamp: lastUpdate.toISOString()
                  }}
                >
                  <div className="text-2xl font-bold mb-1">
                    ${price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </Explainable>
                <div className="flex items-center gap-1 text-sm">
                  {apy > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <Explainable 
                        term={`${product.name} APY`}
                        type="metric"
                        data={{
                          value: apy,
                          asset: product.name,
                          unit: '%',
                          type: 'Annual Percentage Yield',
                          source: apyData[product.key].source
                        }}
                      >
                        <span className="text-green-500 font-medium">
                          {apy.toFixed(2)}% APY
                        </span>
                      </Explainable>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-400">No yield</span>
                    </>
                  )}
                </div>

                {/* 7-day price sparkline */}
                <div className="mt-2 border-t border-border/50 pt-2">
                  <div className="text-xs text-muted-foreground mb-1">7-day trend</div>
                  <PriceSparkline product={product.key} days={7} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Data source: DefiLlama</span>
            <span>•</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (30s)
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
