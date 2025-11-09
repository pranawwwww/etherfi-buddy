import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';

interface SparklineProps {
  product: string;
  color?: string;
  days?: number;
}

interface PricePoint {
  timestamp: number;
  price: number;
}

export function PriceSparkline({ product, color = '#6B7280', days = 7 }: SparklineProps) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        const result = await api.historicalPrices(product, days);

        // Transform data for Recharts
        if (result.data && Array.isArray(result.data)) {
          const formattedData = result.data.map((point: any) => ({
            timestamp: point.timestamp || point.date,
            price: point.price || point.value || 0,
          }));
          setData(formattedData);
        }
      } catch (error) {
        console.error(`Failed to fetch historical data for ${product}:`, error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [product, days]);

  if (loading || data.length === 0) {
    return (
      <div className="w-full h-10 flex items-center justify-center">
        <div className="text-xs text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  // Calculate price change for color
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;
  const lineColor = isPositive ? '#10B981' : '#EF4444';

  return (
    <div className="w-full h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
