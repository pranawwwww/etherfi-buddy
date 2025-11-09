import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { RiskAnalysisResponse } from "@/lib/types";

interface RiskData {
  address?: string;
  timestamp?: string;
  methodology_version?: string;
  risk_score: {
    score: number;
    grade: "Safe" | "Moderate" | "High";
    top_reasons: string[];
  };
  tiles: {
    operator_uptime: {
      uptime_7d_pct: number;
      missed_attestations_7d: number;
      dvt_protected: boolean;
      client_diversity_note: string;
    };
    avs_concentration: {
      largest_avs_pct: number;
      hhi: number;
      avs_split: Array<{ name: string; pct: number }>;
    };
    slashing_proxy: {
      proxy_score: number;
      inputs: {
        operator_uptime_band: string;
        historical_slashes_count: number;
        avs_audit_status: string;
        client_diversity_band: string;
        dvt_presence: boolean;
      };
    };
    liquidity_depth: {
      health_index: number;
      reference_trade_usd: number;
      chains: Array<{
        chain: string;
        venue: string;
        pool: string;
        depth_usd: number;
        slippage_bps: number;
        est_total_fee_usd: number;
      }>;
      recommended_chain?: string;
    };
  };
  breakdown?: {
    distribution: {
      base_stake_pct: number;
      restaked_pct: number;
      balanced_score: number;
    };
  };
}

// Tooltip explanations for each risk metric
const RISK_EXPLANATIONS = {
  slashingProbability: "The likelihood of losing staked ETH due to validator penalties. Lower is better. This is calculated based on operator performance, client diversity, and historical slashing events.",
  avsConcentration: "How much of your restaked assets are allocated to a single service (AVS). High concentration means higher risk if that service has issues. Diversification across multiple services is safer.",
  operatorUptime: "The percentage of time your validator is online and performing duties correctly. Higher uptime (above 99%) means more reliable rewards and lower risk of penalties.",
  liquidityDepth: "How easily you can trade or exit your position. Higher health index means you can buy/sell with minimal price impact. Important for when you need to move funds quickly.",
  restakeDistribution: "The percentage of your assets that are restaked vs. base staking. Restaking offers higher rewards but comes with additional risks from the protocols you're securing.",
  riskScore: "An overall measure of portfolio risk from 0-100. Lower scores (green) indicate safer positions with better diversification and uptime. Higher scores (red) suggest concentrated risk or performance issues."
};

// Mock data for development
const mockData: RiskData = {
  risk_score: {
    score: 32,
    grade: "Safe",
    top_reasons: [
      "Low slashing probability",
      "Good AVS concentration",
      "High operator uptime"
    ]
  },
  tiles: {
    operator_uptime: {
      uptime_7d_pct: 99.3,
      missed_attestations_7d: 12,
      dvt_protected: true,
      client_diversity_note: "Prysm(70%), Lighthouse(30%)"
    },
    avs_concentration: {
      largest_avs_pct: 75,
      hhi: 0.29,
      avs_split: []
    },
    slashing_proxy: {
      proxy_score: 18,
      inputs: {
        operator_uptime_band: "Green",
        historical_slashes_count: 0,
        avs_audit_status: "Audited",
        client_diversity_band: "Amber",
        dvt_presence: true
      }
    },
    liquidity_depth: {
      health_index: 60,
      reference_trade_usd: 10000,
      chains: []
    }
  },
  breakdown: {
    distribution: {
      base_stake_pct: 38,
      restaked_pct: 62,
      balanced_score: 66
    }
  }
};

const RiskScoreGauge = ({ score, grade }: { score: number; grade: string }) => {
  // Calculate rotation angle based on score (0-100 maps to -90 to 90 degrees)
  const rotation = -90 + (score / 100) * 180;

  // Color based on grade
  const getGradeColor = (grade: string) => {
    switch (grade.toLowerCase()) {
      case "safe":
        return "#22c55e"; // green
      case "moderate":
        return "#3b82f6"; // blue
      case "high":
        return "#ef4444"; // red
      default:
        return "#3b82f6";
    }
  };

  const color = getGradeColor(grade);

  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <div className="relative w-64 h-32">
        {/* Background arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Gradient arc from orange to green */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#f97316", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "#eab308", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#22c55e", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            x1="100"
            y1="90"
            x2="100"
            y2="30"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 90)`}
            style={{ transition: "transform 1s ease-out" }}
          />
          {/* Center dot */}
          <circle cx="100" cy="90" r="6" fill={color} />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <div className="text-6xl font-bold" style={{ color }}>
            {score}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Risk Score</div>
        </div>
      </div>
      {/* Labels */}
      <div className="flex justify-between w-64 px-4 mt-2">
        <span className="text-xs text-muted-foreground">Low</span>
        <span className="text-xs text-muted-foreground">High</span>
      </div>
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  subtitle,
  tooltip
}: {
  title: string;
  value: string | number;
  subtitle: string;
  tooltip?: string;
}) => {
  return (
    <Card className="bg-secondary/30 border-border">
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm">{title}</CardTitle>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-primary">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

const RiskBreakdownItem = ({
  label,
  value,
  level,
  tooltip
}: {
  label: string;
  value: string | number;
  level: "Low" | "High" | "Moderate" | string;
  tooltip?: string;
}) => {
  const getIndicatorColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "bg-green-500";
      case "moderate":
        return "bg-blue-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getIndicatorColor(level)}`} />
        <span className="text-sm">{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{level}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
};

export const ForecastTab = ({ address, validatorIndex }: { address?: string; validatorIndex?: string } = {}) => {
  const [data, setData] = useState<RiskData>(mockData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.riskAnalysis(address, validatorIndex);
        setData(response as unknown as RiskData);
      } catch (err) {
        console.error("Error fetching risk analysis:", err);
        setError("Failed to load risk data. Using mock data.");
        // Keep using mock data on error
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
  }, [address, validatorIndex]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Portfolio Health Panel</h2>
          <p className="text-muted-foreground">Loading risk analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Portfolio Health Panel</h2>
          <p className="text-muted-foreground">
            Key risk factors and exposure analysis
            {error && <span className="text-yellow-500 ml-2">({error})</span>}
          </p>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Risk Score with Gauge */}
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-lg">Risk Score</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{RISK_EXPLANATIONS.riskScore}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <RiskScoreGauge score={data.risk_score.score} grade={data.risk_score.grade} />
            </CardContent>
          </Card>

        {/* Risk Breakdown */}
        <Card className="bg-secondary/30 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Risk Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <RiskBreakdownItem
              label="Slashing Probability"
              value={`${(data.tiles.slashing_proxy.proxy_score / 10).toFixed(1)}%`}
              level={data.tiles.slashing_proxy.proxy_score < 30 ? "Low" : data.tiles.slashing_proxy.proxy_score < 60 ? "Moderate" : "High"}
              tooltip={RISK_EXPLANATIONS.slashingProbability}
            />
            <RiskBreakdownItem
              label="AVS Concentration"
              value={`${data.tiles.avs_concentration.largest_avs_pct}%`}
              level={data.tiles.avs_concentration.largest_avs_pct > 50 ? "High" : "Moderate"}
              tooltip={RISK_EXPLANATIONS.avsConcentration}
            />
            <RiskBreakdownItem
              label="Operator Uptime"
              value={`${data.tiles.operator_uptime.uptime_7d_pct}%`}
              level={data.tiles.operator_uptime.uptime_7d_pct > 99.5 ? "High" : "Moderate"}
              tooltip={RISK_EXPLANATIONS.operatorUptime}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="AVS Concentration"
          value={data.tiles.avs_concentration.largest_avs_pct}
          subtitle="Largest AVS"
          tooltip={RISK_EXPLANATIONS.avsConcentration}
        />

        <MetricCard
          title="Slashing Probability"
          value={`${(data.tiles.slashing_proxy.proxy_score / 10).toFixed(1)}%`}
          subtitle={data.tiles.slashing_proxy.proxy_score < 30 ? "Low" : data.tiles.slashing_proxy.proxy_score < 60 ? "Moderate" : "High"}
          tooltip={RISK_EXPLANATIONS.slashingProbability}
        />

        <MetricCard
          title="Liquidity Depth"
          value={data.tiles.liquidity_depth.health_index}
          subtitle="Health Index"
          tooltip={RISK_EXPLANATIONS.liquidityDepth}
        />

        <MetricCard
          title="Restake Distribution"
          value={`${data.breakdown?.distribution.restaked_pct}%`}
          subtitle="Restaked"
          tooltip={RISK_EXPLANATIONS.restakeDistribution}
        />
      </div>
    </div>
    </TooltipProvider>
  );
};

export default ForecastTab;