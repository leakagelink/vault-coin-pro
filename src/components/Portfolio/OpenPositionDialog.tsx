
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { openPosition } from '@/services/positionsService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface OpenPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OpenPositionDialog: React.FC<OpenPositionDialogProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState('BTC');
  const [coinName, setCoinName] = useState('Bitcoin');
  const [amount, setAmount] = useState('0.01');
  const [buyPrice, setBuyPrice] = useState('5000000');

  useEffect(() => {
    if (!open) {
      setSymbol('BTC');
      setCoinName('Bitcoin');
      setAmount('0.01');
      setBuyPrice('5000000');
    }
  }, [open]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () =>
      openPosition({
        symbol: symbol.trim().toUpperCase(),
        coin_name: coinName.trim(),
        amount: Number(amount),
        buy_price: Number(buyPrice),
      }),
    meta: {
      onSuccess: () => {
        toast.success('Position opened');
      },
      onError: () => {
        toast.error('Failed to open position (make sure you are logged in)');
      },
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Position</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Symbol</label>
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="BTC" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Coin Name</label>
              <Input value={coinName} onChange={(e) => setCoinName(e.target.value)} placeholder="Bitcoin" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Amount</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.01" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Buy Price (₹)</label>
              <Input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="5000000" />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutate()} disabled={isPending}>
            {isPending ? 'Saving...' : 'Add Position'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OpenPositionDialog;
