import { Coins, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useDemoState } from '@/contexts/DemoContext';

interface HeaderProps {
  onMockConnect: () => void;
}

export const Header = ({ onMockConnect }: HeaderProps) => {
  const [address, setAddress] = useState('');
  const { currentUser } = useDemoState();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">eFi Navigator</h1>
              <p className="text-xs text-muted-foreground">Portfolio Management</p>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-2 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Connect wallet or paste address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 bg-secondary border-border"
            />

            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                <span className="text-lg">{currentUser.avatar}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">{currentUser.name}</span>
                  <Badge
                    variant={currentUser.level === 'expert' ? 'default' : 'secondary'}
                    className="text-[10px] h-4 px-1"
                  >
                    {currentUser.level}
                  </Badge>
                </div>
              </div>
            )}

            <Button onClick={onMockConnect} variant="outline" className="gap-2">
              <Wallet className="w-4 h-4" />
              Mock Connect
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
