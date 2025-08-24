
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPositions, closePosition } from '@/services/positionsService';
import { toast } from 'sonner';

const formatNumber = (n: number) => {
  try {
    return Number(n).toLocaleString();
  } catch {
    return String(n);
  }
};

const PositionsList: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const result = await getPositions();
      console.log('[PositionsList] loaded', result);
      return result;
    },
  });

  const { mutate: mutateClose, isPending: closing } = useMutation({
    mutationFn: async (id: string) => {
      return await closePosition({ id });
    },
    meta: {
      onSuccess: () => {
        toast.success('Position closed');
      },
      onError: () => {
        toast.error('Failed to close position');
      },
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1,2].map(i => (
          <Card key={i} className="glass-card">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>No active positions yet</p>
          <p className="text-sm mt-1">Use "Add Position" to create your first trade</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {positions.map((position: any) => {
        const pnl = Number(position.current_price ?? position.buy_price) - Number(position.buy_price);
        const pnlValue = pnl * Number(position.amount);
        const pnlPercent = (Number(position.current_price ?? position.buy_price) - Number(position.buy_price)) / Number(position.buy_price || 1) * 100;
        const isProfit = pnlValue >= 0;

        return (
          <Card key={position.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{position.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {Number(position.amount)} {position.symbol}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {position.position_type}
                    </Badge>
                    <Badge variant={position.status === 'open' ? 'secondary' : 'outline'} className="text-xs capitalize">
                      {position.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{position.coin_name}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 justify-end">
                    {isProfit ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={`font-semibold text-sm ${isProfit ? 'profit-text' : 'loss-text'}`}>
                      {isProfit ? '+' : ''}₹{formatNumber(pnlValue)}
                    </span>
                  </div>
                  <p className={`text-xs ${isProfit ? 'text-success' : 'text-destructive'}`}>
                    {isProfit ? '+' : ''}{(isFinite(pnlPercent) ? pnlPercent.toFixed(2) : '0.00')}%
                  </p>
                </div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Buy: ₹{formatNumber(Number(position.buy_price))}</span>
                <span>Current: ₹{formatNumber(Number(position.current_price ?? position.buy_price))}</span>
              </div>

              {position.status === 'open' && (
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={closing}
                    onClick={() => mutateClose(position.id)}
                  >
                    {closing ? 'Closing...' : 'Close Position'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PositionsList;
