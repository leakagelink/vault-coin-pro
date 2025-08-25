
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Plus, DollarSign, BarChart3, Eye, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCryptoPrices, formatPrice, formatMarketCap, CryptoData } from '@/services/cryptoService';
import CoinSelectionDialog from '@/components/Trading/CoinSelectionDialog';
import PnLSummary from '@/components/Portfolio/PnLSummary';
import { useQuery } from '@tanstack/react-query';
import { getPositions } from '@/services/positionsService';

const HomePage: React.FC = () => {
  const { userData } = useAuth();
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell' | 'trade'>('buy');

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: getPositions,
  });

  useEffect(() => {
    const loadCryptoData = async () => {
      try {
        const data = await fetchCryptoPrices();
        setCryptoData(data);
      } catch (error) {
        console.error('Failed to fetch crypto data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCryptoData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (action: 'buy' | 'sell' | 'trade') => {
    setSelectedAction(action);
    setDialogOpen(true);
  };

  const handleCoinSelect = (crypto: CryptoData) => {
    // You can implement direct coin selection logic here if needed
    console.log('Selected coin:', crypto);
  };

  const totalMarketCap = cryptoData.reduce((sum, crypto) => sum + crypto.quote.USD.market_cap, 0);
  const totalVolume = cryptoData.reduce((sum, crypto) => sum + crypto.quote.USD.volume_24h, 0);

  return (
    <div className="space-y-6">
      {/* Enhanced Portfolio Overview with P&L */}
      <div className="px-4">
        <PnLSummary />
      </div>

      {/* Enhanced Quick Actions */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Quick Trading</span>
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Button 
            className="crypto-button h-auto p-4 flex-col hover:scale-105 transition-transform"
            onClick={() => handleQuickAction('buy')}
          >
            <Plus className="h-6 w-6 mb-2" />
            <span className="text-sm font-semibold">Buy</span>
            <span className="text-xs opacity-80">Open Long</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 flex-col hover:scale-105 transition-transform border-destructive text-destructive hover:bg-destructive hover:text-white"
            onClick={() => handleQuickAction('sell')}
          >
            <DollarSign className="h-6 w-6 mb-2" />
            <span className="text-sm font-semibold">Sell</span>
            <span className="text-xs opacity-80">Open Short</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 flex-col hover:scale-105 transition-transform"
            onClick={() => handleQuickAction('trade')}
          >
            <BarChart3 className="h-6 w-6 mb-2" />
            <span className="text-sm font-semibold">Trade</span>
            <span className="text-xs opacity-80">Long/Short</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Market Overview with Click-to-Trade */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Live Prices</span>
          </h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {cryptoData.map((crypto) => {
              // Check if user has position in this crypto
              const hasPosition = positions?.some((pos: any) => 
                pos.symbol === crypto.symbol && pos.status === 'open'
              );

              return (
                <Card 
                  key={crypto.id} 
                  className={`glass-card hover:bg-card/80 transition-all cursor-pointer hover:scale-[1.02] ${
                    hasPosition ? 'ring-2 ring-primary/50' : ''
                  }`}
                  onClick={() => handleCoinSelect(crypto)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-primary text-sm">
                              {crypto.symbol}
                            </span>
                          </div>
                          {hasPosition && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <Activity className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold">{crypto.symbol}</p>
                            {hasPosition && (
                              <Badge variant="secondary" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{crypto.name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatPrice(crypto.quote.USD.price)}</p>
                        <div className="flex items-center justify-end space-x-1">
                          {crypto.quote.USD.percent_change_24h > 0 ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )}
                          <Badge 
                            variant={crypto.quote.USD.percent_change_24h > 0 ? "default" : "destructive"}
                            className={`${crypto.quote.USD.percent_change_24h > 0 ? "profit-gradient" : "loss-gradient"} text-xs`}
                          >
                            {crypto.quote.USD.percent_change_24h > 0 ? '+' : ''}
                            {crypto.quote.USD.percent_change_24h.toFixed(2)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          MCap: {formatMarketCap(crypto.quote.USD.market_cap)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Market Stats */}
      <div className="px-4 pb-20">
        <h2 className="text-lg font-semibold mb-3">Market Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center space-x-1">
                <BarChart3 className="h-4 w-4" />
                <span>Total Market Cap</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-lg font-bold">{formatMarketCap(totalMarketCap)}</p>
              <p className="text-success text-sm flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>+2.3% (24h)</span>
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>24h Volume</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-lg font-bold">{formatMarketCap(totalVolume)}</p>
              <p className="text-destructive text-sm flex items-center space-x-1">
                <TrendingDown className="h-3 w-3" />
                <span>-1.2% (24h)</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trading Dialog */}
      <CoinSelectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cryptoData={cryptoData}
        action={selectedAction}
      />
    </div>
  );
};

export default HomePage;
