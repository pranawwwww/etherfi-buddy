import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useDemoState } from '@/contexts/DemoContext';
import { useState, useEffect } from 'react';
import { User, TrendingUp } from 'lucide-react';

interface MockWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MockWalletModal = ({ open, onOpenChange }: MockWalletModalProps) => {
  const { demoState, updateBalances, resetToDemo } = useDemoState();
  const [eth, setEth] = useState(demoState.balances.ETH.toString());
  const [eeth, setEeth] = useState(demoState.balances.eETH.toString());
  const [weETH, setWeETH] = useState(demoState.balances.weETH.toString());
  const [liquidUSD, setLiquidUSD] = useState(demoState.balances.LiquidUSD.toString());

  const handleSave = () => {
    updateBalances({
      ETH: parseFloat(eth) || 0,
      eETH: parseFloat(eeth) || 0,
      weETH: parseFloat(weETH) || 0,
      LiquidUSD: parseFloat(liquidUSD) || 0,
    });
    onOpenChange(false);
  };

  const loadBeginner = () => {
    setEth('1.0');
    setEeth('0.0');
    setWeETH('0.0');
    setLiquidUSD('0.0');
  };

  const loadHolder = () => {
    setEth('0.2');
    setEeth('0.0');
    setWeETH('5.0');
    setLiquidUSD('1200.0');
  };

  useEffect(() => {
    setEth(demoState.balances.ETH.toString());
    setEeth(demoState.balances.eETH.toString());
    setWeETH(demoState.balances.weETH.toString());
    setLiquidUSD(demoState.balances.LiquidUSD.toString());
  }, [demoState.balances]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mock Wallet Connect</DialogTitle>
          <DialogDescription>
            Edit your demo balances or load a preset scenario
          </DialogDescription>
        </DialogHeader>

        {/* Preset Buttons */}
        <div className="flex gap-2 mb-2">
          <Button onClick={loadBeginner} variant="outline" className="flex-1 gap-2">
            <User className="w-4 h-4" />
            Load Beginner
          </Button>
          <Button onClick={loadHolder} variant="outline" className="flex-1 gap-2">
            <TrendingUp className="w-4 h-4" />
            Load Holder
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eth">ETH Balance</Label>
            <Input
              id="eth"
              type="number"
              step="0.01"
              value={eth}
              onChange={(e) => setEth(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eeth">eETH Balance</Label>
            <Input
              id="eeth"
              type="number"
              step="0.1"
              value={eeth}
              onChange={(e) => setEeth(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeth">weETH Balance</Label>
            <Input
              id="weeth"
              type="number"
              step="0.1"
              value={weETH}
              onChange={(e) => setWeETH(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="liquid">Liquid USD Balance</Label>
            <Input
              id="liquid"
              type="number"
              step="1"
              value={liquidUSD}
              onChange={(e) => setLiquidUSD(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={resetToDemo} variant="outline" className="flex-1">
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
