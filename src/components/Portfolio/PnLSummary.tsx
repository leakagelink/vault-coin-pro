
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPositions } from '@/services/positionsService';

const PnLSummary: React.FC = () => {
  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: getPositions,
  });

  const calculateTotalPnL = () => {
    if (!positions || positions.length === 0) return { totalValue: 0, totalPnL: 0, pnlPercent: 0 };

    let totalValue = 0;
    let totalPnL = 0;

    positions.forEach((position: any) => {
      if (position.status === 'open') {
        const currentPrice = Number(position.current_price ?? position.buy_price);
        const buyPrice = Number(position.buy_price);
        const amount = Number(position.amount);
        
        const positionValue = currentPrice * amount;
        const pnl = (currentPrice - buyPrice) * amount;
        
        totalValue += positionValue;
        totalPnL += pnl;
      }
    });

    const pnlPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;
    return { totalValue, totalPnL, pnlPercent };
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalValue, totalPnL, pnlPercent } = calculateTotalPnL();
  const isProfit = totalPnL >= 0;
  const openPositionsCount = positions?.filter((p: any) => p.status === 'open').length || 0;

  return (
    <Card className="glass-card crypto-gradient text-white">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <BarChart3 className="h-5 w-5" />
          <span className="font-semibold">Portfolio Overview</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/80 text-xs mb-1">Total Portfolio Value</p>
            <p className="text-lg font-bold">
              ₹{totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div>
            <p className="text-white/80 text-xs mb-1">Total P&L</p>
            <div className="flex items-center space-x-1">
              {isProfit ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <div>
                <p className={`text-lg font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                  {isProfit ? '+' : ''}₹{totalPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                  {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-white/80 text-xs">Active Positions: {openPositionsCount}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PnLSummary;
