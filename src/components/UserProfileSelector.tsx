import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDemoState } from '@/contexts/DemoContext';
import { getAllUserProfiles, getUserStatus, calculateUserOutcomes } from '@/lib/userProfiles';
import { formatUSD, formatPercentage } from '@/lib/helpers';
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, User } from 'lucide-react';

export function UserProfileSelector({ onClose }: { onClose?: () => void }) {
  const { switchUser, currentUser } = useDemoState();
  const profiles = getAllUserProfiles();

  const handleSelectUser = (userId: string) => {
    switchUser(userId);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Demo Profile</h2>
        <p className="text-muted-foreground">
          Switch between beginner and expert portfolios to see how our platform helps different users
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile) => {
          const status = getUserStatus(profile);
          const outcomes = calculateUserOutcomes(profile);
          const isActive = currentUser?.id === profile.id;

          return (
            <Card
              key={profile.id}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                isActive ? 'border-primary border-2 shadow-lg' : ''
              }`}
              onClick={() => handleSelectUser(profile.id)}
            >
              {isActive && (
                <div className="absolute top-3 right-3">
                  <Badge variant="default">Active</Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{profile.avatar}</div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {profile.name}
                      <Badge
                        variant={profile.level === 'expert' ? 'default' : 'secondary'}
                      >
                        {profile.level}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{profile.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Portfolio Summary */}
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Value</div>
                      <div className="font-bold">
                        {formatUSD(outcomes.totalValue.usd)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Current APY</div>
                      <div className="font-bold text-green-600">
                        {formatPercentage(outcomes.current.apy)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Health Score</div>
                      <div className="font-bold">{Math.round(status.healthScore)}/100</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Efficiency</div>
                      <div className={`font-bold ${
                        status.efficiency > 80 ? 'text-green-600' :
                        status.efficiency > 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(status.efficiency)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Issues/Strengths */}
                {profile.level === 'beginner' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Key Issues ({profile.problems.length})</span>
                    </div>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {profile.problems.slice(0, 3).map((problem, idx) => (
                        <li key={idx}>{problem}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Well-Optimized Portfolio</span>
                    </div>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>✅ Diversified allocation</li>
                      <li>✅ High efficiency score</li>
                      <li>✅ Active DeFi strategies</li>
                    </ul>
                  </div>
                )}

                {/* Opportunity Highlight */}
                {status.needsHelp && (
                  <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-lg">
                    <div className="flex items-start gap-2 text-sm">
                      <TrendingDown className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-semibold">
                          Missing {formatUSD(outcomes.opportunity.missedUsd)}/year
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Our platform can help optimize this!
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!status.needsHelp && (
                  <div className="p-3 bg-green-950/40 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-green-900 dark:text-green-100">
                          Earning {formatUSD(outcomes.current.yearlyUsd)}/year
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-300">
                          Great portfolio management!
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => handleSelectUser(profile.id)}
                >
                  {isActive ? (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Current Profile
                    </>
                  ) : (
                    `Switch to ${profile.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Backstories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {profiles.map((profile) => (
          <div key={`backstory-${profile.id}`} className="p-4 bg-secondary/30 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span>{profile.avatar}</span>
              {profile.name}'s Story
            </h4>
            <p className="text-sm text-muted-foreground">{profile.backstory}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
