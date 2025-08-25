
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CryptoData, formatPrice } from '@/services/cryptoService';
import { openPosition } from '@/services/positionsService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CoinSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cryptoData: CryptoData[];
  action: 'buy' | 'sell' | 'trade';
}

const CoinSelectionDialog: React.FC<CoinSelectionDialogProps> = ({
  open,
  onOpenChange,
  cryptoData,
  action
}) => {
  const [selectedCoin, setSelectedCoin] = useState<CryptoData | null>(null);
  const [amount, setAmount] = useState('');
  const [positionType, setPositionType] = useState<'long' | 'short'>('long');
  const queryClient = useQueryClient();

  const { mutate: createPosition, isPending } = useMutation({
    mutationFn: async () => {
      if (!selectedCoin || !amount) throw new Error('Missing data');
      
      return openPosition({
        symbol: selectedCoin.symbol,
        coin_name: selectedCoin.name,
        amount: Number(amount),
        buy_price: selectedCoin.quote.USD.price,
        position_type: positionType,
      });
    },
    onSuccess: () => {
      toast.success(`${action === 'buy' ? 'Long' : action === 'sell' ? 'Short' : 'Trade'} position opened successfully`);
      onOpenChange(false);
      setSelectedCoin(null);
      setAmount('');
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
    onError: () => {
      toast.error('Failed to open position');
    },
  });

  useEffect(() => {
    if (action === 'buy') setPositionType('long');
    else if (action === 'sell') setPositionType('short');
  }, [action]);

  const getDialogTitle = () => {
    switch (action) {
      case 'buy': return 'Buy Cryptocurrency';
      case 'sell': return 'Sell Cryptocurrency';
      case 'trade': return 'Trade Cryptocurrency';
      default: return 'Select Cryptocurrency';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {!selectedCoin ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select a cryptocurrency:</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cryptoData.map((crypto) => (
                  <div
                    key={crypto.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => setSelectedCoin(crypto)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{crypto.symbol}</p>
                        <p className="text-sm text-muted-foreground">{crypto.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(crypto.quote.USD.price)}</p>
                        <div className="flex items-center space-x-1">
                          {crypto.quote.USD.percent_change_24h > 0 ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )}
                          <Badge 
                            variant={crypto.quote.USD.percent_change_24h > 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {crypto.quote.USD.percent_change_24h > 0 ? '+' : ''}
                            {crypto.quote.USD.percent_change_24h.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{selectedCoin.symbol}</p>
                    <p className="text-sm text-muted-foreground">{selectedCoin.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(selectedCoin.quote.USD.price)}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Amount ({selectedCoin.symbol})</label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {action === 'trade' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Position Type</label>
                  <div className="flex space-x-2">
                    <Button
                      variant={positionType === 'long' ? 'default' : 'outline'}
                      onClick={() => setPositionType('long')}
                      className="flex-1"
                    >
                      Long (Buy)
                    </Button>
                    <Button
                      variant={positionType === 'short' ? 'default' : 'outline'}
                      onClick={() => setPositionType('short')}
                      className="flex-1"
                    >
                      Short (Sell)
                    </Button>
                  </div>
                </div>
              )}

              {amount && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Estimated Value</p>
                  <p className="font-semibold">
                    ${(Number(amount) * selectedCoin.quote.USD.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-4 border-t">
          {selectedCoin ? (
            <>
              <Button variant="outline" onClick={() => setSelectedCoin(null)}>
                Back
              </Button>
              <Button
                onClick={() => createPosition()}
                disabled={!amount || isPending}
                className="flex-1"
              >
                {isPending ? 'Processing...' : `Confirm ${action}`}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoinSelectionDialog;
