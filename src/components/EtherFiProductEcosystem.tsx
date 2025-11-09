import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Coins, 
  TrendingUp, 
  Lock, 
  Zap, 
  ArrowRight, 
  Shield, 
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';
import { getProductInfo, type ProductInfo } from '@/lib/productCopy';
import { useDemoState } from '@/contexts/DemoContext';

interface ProductNode {
  id: string;
  name: string;
  category: 'core' | 'wrapped' | 'yield' | 'governance';
  position: { x: number; y: number };
  userBalance: number;
  connections: string[];
  icon: typeof Coins;
  color: string;
  glowColor: string;
}

interface ProductConnection {
  from: string;
  to: string;
  type: 'converts' | 'deposits' | 'earns' | 'governs';
  label: string;
}

export function EtherFiProductEcosystem() {
  const { demoState } = useDemoState();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);

  // Define the product ecosystem structure
  const productNodes: ProductNode[] = [
    // Left side: Liquid Crypto (Yield Products)
    {
      id: 'liquidUSD',
      name: 'Liquid USD',
      category: 'yield',
      position: { x: 15, y: 25 },
      userBalance: demoState.balances.LiquidUSD,
      connections: [],
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      glowColor: 'shadow-green-500/50',
    },
    {
      id: 'liquidETH',
      name: 'Liquid ETH',
      category: 'yield',
      position: { x: 15, y: 50 },
      userBalance: 0,
      connections: [],
      icon: Zap,
      color: 'from-cyan-500 to-blue-500',
      glowColor: 'shadow-cyan-500/50',
    },
    {
      id: 'liquidBTC',
      name: 'Liquid BTC',
      category: 'yield',
      position: { x: 15, y: 75 },
      userBalance: 0,
      connections: [],
      icon: TrendingUp,
      color: 'from-orange-500 to-yellow-500',
      glowColor: 'shadow-orange-500/50',
    },
    // Middle: Core & Wrapped Products
    {
      id: 'eETH',
      name: 'eETH',
      category: 'core',
      position: { x: 50, y: 25 },
      userBalance: demoState.balances.eETH,
      connections: ['weETH', 'liquidETH'],
      icon: Coins,
      color: 'from-blue-500 to-cyan-500',
      glowColor: 'shadow-blue-500/50',
    },
    {
      id: 'weETH',
      name: 'weETH',
      category: 'wrapped',
      position: { x: 50, y: 50 },
      userBalance: demoState.balances.weETH,
      connections: ['liquidUSD', 'liquidETH'],
      icon: Lock,
      color: 'from-purple-500 to-pink-500',
      glowColor: 'shadow-purple-500/50',
    },
    {
      id: 'WBTC',
      name: 'WBTC',
      category: 'wrapped',
      position: { x: 50, y: 75 },
      userBalance: 0,
      connections: ['liquidBTC'],
      icon: Coins,
      color: 'from-orange-400 to-amber-500',
      glowColor: 'shadow-orange-500/50',
    },
    // Right side: Governance
    {
      id: 'beHYPE',
      name: 'beHYPE',
      category: 'governance',
      position: { x: 85, y: 50 },
      userBalance: 0,
      connections: [],
      icon: Sparkles,
      color: 'from-violet-500 to-purple-600',
      glowColor: 'shadow-violet-500/50',
    },
  ];

  const connections: ProductConnection[] = [
    { from: 'eETH', to: 'weETH', type: 'converts', label: 'Wrap for DeFi' },
    { from: 'weETH', to: 'liquidUSD', type: 'deposits', label: 'Borrow stables' },
    { from: 'weETH', to: 'liquidETH', type: 'deposits', label: 'Add liquidity' },
    { from: 'eETH', to: 'liquidETH', type: 'deposits', label: 'Provide liquidity' },
    { from: 'WBTC', to: 'liquidBTC', type: 'deposits', label: 'Earn BTC yield' },
    { from: 'beHYPE', to: 'eETH', type: 'governs', label: 'Protocol rewards' },
  ];

  const selectedInfo = selectedProduct ? getProductInfo(selectedProduct) : null;

  const getNodeStatus = (node: ProductNode) => {
    if (node.userBalance > 0) return 'active';
    const hasActiveConnection = connections.some(
      conn => 
        (conn.from === node.id || conn.to === node.id) &&
        (productNodes.find(n => n.id === conn.from)?.userBalance > 0 ||
         productNodes.find(n => n.id === conn.to)?.userBalance > 0)
    );
    return hasActiveConnection ? 'suggested' : 'available';
  };

  const getCategoryIcon = (category: ProductNode['category']) => {
    switch (category) {
      case 'core': return Coins;
      case 'wrapped': return Lock;
      case 'yield': return TrendingUp;
      case 'governance': return Sparkles;
    }
  };

  const getCategoryLabel = (category: ProductNode['category']) => {
    switch (category) {
      case 'core': return 'Liquid Staking';
      case 'wrapped': return 'DeFi Ready';
      case 'yield': return 'Yield Optimizer';
      case 'governance': return 'Governance';
    }
  };

  return (
    <>
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/20 via-blue-950/20 to-cyan-950/20 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                EtherFi Product Ecosystem
              </CardTitle>
              <CardDescription className="mt-1">
                Interactive map showing your holdings and available opportunities
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
              7 Products
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50" />
              <span className="text-xs text-muted-foreground">Your Holdings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30" />
              <span className="text-xs text-muted-foreground">Suggested Next Step</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-600 to-gray-500" />
              <span className="text-xs text-muted-foreground">Available Products</span>
            </div>
          </div>

          {/* Product Map Visualization */}
          <div className="relative w-full h-[650px] bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-lg border border-border overflow-visible pb-12">
            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.6)" />
                </linearGradient>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="rgba(139, 92, 246, 0.8)" />
                </marker>
              </defs>
              {connections.map((conn, idx) => {
                const fromNode = productNodes.find(n => n.id === conn.from);
                const toNode = productNodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const fromStatus = getNodeStatus(fromNode);
                const toStatus = getNodeStatus(toNode);
                const isHighlighted = fromStatus === 'active' || toStatus === 'active';
                const isSuggested = fromStatus === 'active' && toStatus === 'suggested';
                
                const x1 = `${fromNode.position.x}%`;
                const y1 = `${fromNode.position.y}%`;
                const x2 = `${toNode.position.x}%`;
                const y2 = `${toNode.position.y}%`;

                return (
                  <g key={idx}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isSuggested ? "rgba(234, 179, 8, 0.6)" : isHighlighted ? "url(#connectionGradient)" : "rgba(100, 116, 139, 0.2)"}
                      strokeWidth={isHighlighted ? "3" : "2"}
                      strokeDasharray={isHighlighted ? "0" : "5,5"}
                      markerEnd={isHighlighted ? "url(#arrowhead)" : ""}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Product Nodes */}
            {productNodes.map((node) => {
              const Icon = node.icon;
              const status = getNodeStatus(node);
              const isHovered = hoveredNode === node.id;

              return (
                <div
                  key={node.id}
                  className="absolute transition-all duration-300 cursor-pointer group"
                  style={{
                    left: `${node.position.x}%`,
                    top: `${node.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isHovered ? 100 : 10,
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedProduct(node.id)}
                >
                  {/* Glow effect for active nodes */}
                  {status === 'active' && (
                    <div className={`absolute inset-0 rounded-full blur-xl opacity-60 ${node.glowColor} animate-pulse`} />
                  )}
                  
                  {/* Node circle */}
                  <div className={`
                    relative w-28 h-28 rounded-full flex flex-col items-center justify-center
                    bg-gradient-to-br ${node.color}
                    border-3 transition-all duration-300
                    ${status === 'active' ? 'border-white shadow-2xl scale-110' : 
                      status === 'suggested' ? 'border-yellow-400 shadow-xl shadow-yellow-500/30 scale-105' : 
                      'border-gray-600 opacity-70 hover:opacity-100 hover:scale-105'}
                    ${isHovered ? 'scale-125 shadow-2xl' : ''}
                  `}>
                    <Icon className="w-9 h-9 text-white mb-1" />
                    <span className="text-xs font-bold text-white text-center px-1">{node.name}</span>
                    {status === 'active' && (
                      <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                        <span className="text-sm font-bold">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Category badge */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none">
                    <Badge variant="secondary" className="text-[10px] bg-secondary/90 backdrop-blur border border-border shadow-lg">
                      {getCategoryLabel(node.category)}
                    </Badge>
                  </div>

                  {/* Hover tooltip */}
                  {isHovered && (
                    <div className="absolute top-full mt-10 left-1/2 transform -translate-x-1/2 w-52 p-3 bg-popover border border-border rounded-lg shadow-2xl z-[200] animate-in fade-in slide-in-from-top-2">
                      <div className="text-sm font-semibold mb-1">{node.name}</div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {getProductInfo(node.id)?.tagline}
                      </div>
                      {node.userBalance > 0 && (
                        <div className="text-xs font-medium text-green-500">
                          Balance: {node.userBalance.toFixed(4)}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Click for details
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-950/40 to-cyan-950/40 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Active Holdings</div>
                <div className="text-2xl font-bold text-blue-400">
                  {productNodes.filter(n => n.userBalance > 0).length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 border-purple-500/20">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Available Products</div>
                <div className="text-2xl font-bold text-purple-400">
                  {productNodes.filter(n => n.userBalance === 0).length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/20">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Yield Optimizers</div>
                <div className="text-2xl font-bold text-green-400">
                  {productNodes.filter(n => n.category === 'yield').length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-950/40 to-yellow-950/40 border-orange-500/20">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">DeFi Ready</div>
                <div className="text-2xl font-bold text-orange-400">
                  {productNodes.filter(n => n.category === 'wrapped').length}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Product Details Sheet */}
      {selectedProduct && selectedInfo && (
        <Sheet open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${productNodes.find(n => n.id === selectedProduct)?.color} flex items-center justify-center`}>
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl">{selectedInfo.name}</SheetTitle>
                    <SheetDescription>{selectedInfo.tagline}</SheetDescription>
                  </div>
                </div>
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  {getCategoryLabel(productNodes.find(n => n.id === selectedProduct)?.category!)}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Overview */}
              <Card className="bg-secondary/50 border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedInfo.description}
                  </p>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="bg-gradient-to-br from-green-950/20 to-emerald-950/20 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    Key Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedInfo.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Risks */}
              <Card className="bg-gradient-to-br from-red-950/20 to-orange-950/20 border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-red-400">
                    <Shield className="w-4 h-4" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedInfo.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 mt-0.5">⚠</span>
                        <span className="text-muted-foreground">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Ideal For */}
              <Card className="bg-gradient-to-br from-blue-950/20 to-cyan-950/20 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-blue-400">
                    <Sparkles className="w-4 h-4" />
                    Best For
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedInfo.idealFor.map((ideal, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {ideal}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="flex gap-3">
                <Button className="flex-1 gap-2" size="lg" asChild>
                  <a href="https://app.ether.fi" target="_blank" rel="noopener noreferrer">
                    <Zap className="w-4 h-4" />
                    Get Started
                  </a>
                </Button>
                {selectedInfo.learnMoreUrl && (
                  <Button variant="outline" size="lg" asChild>
                    <a href={selectedInfo.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Learn More
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
