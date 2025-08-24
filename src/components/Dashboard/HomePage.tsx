
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Plus, DollarSign, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCryptoPrices, formatPrice, formatMarketCap, CryptoData } from '@/services/cryptoService';

const HomePage: React.FC = () => {
  const { userData } = useAuth();
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalMarketCap = cryptoData.reduce((sum, crypto) => sum + crypto.quote.USD.market_cap, 0);
  const totalVolume = cryptoData.reduce((sum, crypto) => sum + crypto.quote.USD.volume_24h, 0);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="px-4">
        <Card className="glass-card crypto-gradient text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-white/80 text-sm">Portfolio Balance</p>
                <p className="text-2xl font-bold">
                  ${userData?.wallet?.balance?.toLocaleString() || '0.00'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/80 text-sm">Today's P&L</p>
                <p className="text-2xl font-bold text-success">+$1,234.56</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <Button className="crypto-button h-auto p-4 flex-col">
            <Plus className="h-5 w-5 mb-2" />
            <span className="text-xs">Buy</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex-col">
            <DollarSign className="h-5 w-5 mb-2" />
            <span className="text-xs">Sell</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex-col">
            <BarChart3 className="h-5 w-5 mb-2" />
            <span className="text-xs">Trade</span>
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Market Overview</h2>
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
            {cryptoData.map((crypto) => (
              <Card key={crypto.id} className="glass-card hover:bg-card/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary text-sm">
                          {crypto.symbol}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{crypto.symbol}</p>
                        <p className="text-muted-foreground text-sm">{crypto.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(crypto.quote.USD.price)}</p>
                      <div className="flex items-center justify-end space-x-1">
                        {crypto.quote.USD.percent_change_24h > 0 ? (
                          <TrendingUp className="h-3 w-3 text-success" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-destructive" />
                        )}
                        <Badge 
                          variant={crypto.quote.USD.percent_change_24h > 0 ? "default" : "destructive"}
                          className={crypto.quote.USD.percent_change_24h > 0 ? "profit-gradient" : "loss-gradient"}
                        >
                          {crypto.quote.USD.percent_change_24h > 0 ? '+' : ''}
                          {crypto.quote.USD.percent_change_24h.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Market Stats */}
      <div className="px-4 pb-20">
        <h2 className="text-lg font-semibold mb-3">Market Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Total Market Cap
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-lg font-bold">{formatMarketCap(totalMarketCap)}</p>
              <p className="text-success text-sm">+2.3% (24h)</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                24h Volume
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-lg font-bold">{formatMarketCap(totalVolume)}</p>
              <p className="text-destructive text-sm">-1.2% (24h)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
