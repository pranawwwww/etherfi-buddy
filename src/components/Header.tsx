import { Coins, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface HeaderProps {
  onMockConnect: () => void;
}

export const Header = ({ onMockConnect }: HeaderProps) => {
  const [address, setAddress] = useState('');

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">eFi Navigator</h1>
              <p className="text-xs text-muted-foreground">Beginner-friendly EtherFi co-pilot (demo)</p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center gap-2 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Paste address (demo)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 bg-secondary border-border"
            />
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
