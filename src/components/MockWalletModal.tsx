import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDemoState } from '@/contexts/DemoContext';

interface MockWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MockWalletModal = ({ open, onOpenChange }: MockWalletModalProps) => {
  const { demoState, updateBalances, resetToDemo } = useDemoState();
  const [localBalances, setLocalBalances] = useState(demoState.balances);

  const handleSave = () => {
    updateBalances(localBalances);
    onOpenChange(false);
  };

  const handleReset = () => {
    resetToDemo();
    setLocalBalances(demoState.balances);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mock Wallet</DialogTitle>
          <DialogDescription>
            Adjust your demo balances to explore different scenarios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="weeth">weETH Balance</Label>
            <Input
              id="weeth"
              type="number"
              step="0.1"
              value={localBalances.weETH}
              onChange={(e) =>
                setLocalBalances({ ...localBalances, weETH: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="liquid">Liquid USD Balance</Label>
            <Input
              id="liquid"
              type="number"
              step="1"
              value={localBalances.LiquidUSD}
              onChange={(e) =>
                setLocalBalances({ ...localBalances, LiquidUSD: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eth">ETH Balance</Label>
            <Input
              id="eth"
              type="number"
              step="0.01"
              value={localBalances.ETH}
              onChange={(e) =>
                setLocalBalances({ ...localBalances, ETH: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eeth">eETH Balance</Label>
            <Input
              id="eeth"
              type="number"
              step="0.1"
              value={localBalances.eETH}
              onChange={(e) =>
                setLocalBalances({ ...localBalances, eETH: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Reset to Demo
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
