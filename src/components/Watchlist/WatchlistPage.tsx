
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Star,
  Eye
} from 'lucide-react';
import { fetchCryptoPrices, formatPrice, CryptoData } from '@/services/cryptoService';

const WatchlistPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allCoins, setAllCoins] = useState<CryptoData[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(['1', '1027']); // Bitcoin and Ethereum IDs
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCryptoData = async () => {
      try {
        const data = await fetchCryptoPrices();
        setAllCoins(data);
      } catch (error) {
        console.error('Failed to fetch crypto data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCryptoData();
    const interval = setInterval(loadCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleWatchlist = (coinId: string) => {
    setWatchlist(prev => 
      prev.includes(coinId) 
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
  };

  const watchedCoins = allCoins.filter(coin => watchlist.includes(coin.id.toString()));
  const filteredCoins = allCoins.filter(coin => 
    !watchlist.includes(coin.id.toString()) &&
    (coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
     coin.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm p-6 rounded-b-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Watchlist</h1>
            <p className="text-muted-foreground">Track your favorite cryptos</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>
      </div>

      <div className="px-4">
        {/* Watchlist Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Star className="h-5 w-5 text-primary" />
              <span>Your Watchlist</span>
            </h2>
            <Badge variant="outline" className="text-primary">
              {watchedCoins.length} coins
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
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
          ) : watchedCoins.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="text-center py-8">
                <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Your watchlist is empty</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add cryptocurrencies to track their prices
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {watchedCoins.map((coin) => (
                <Card key={coin.id} className="glass-card hover:bg-card/80 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-bold text-primary text-sm">
                            {coin.symbol}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold">{coin.symbol}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWatchlist(coin.id.toString())}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                            >
                              <Heart className="h-3 w-3 fill-current" />
                            </Button>
                          </div>
                          <p className="text-muted-foreground text-sm">{coin.name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(coin.quote.USD.price)}</p>
                        <div className="flex items-center justify-end space-x-1">
                          {coin.quote.USD.percent_change_24h > 0 ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )}
                          <Badge 
                            variant={coin.quote.USD.percent_change_24h > 0 ? "default" : "destructive"}
                            className={coin.quote.USD.percent_change_24h > 0 ? "profit-gradient" : "loss-gradient"}
                          >
                            {coin.quote.USD.percent_change_24h > 0 ? '+' : ''}
                            {coin.quote.USD.percent_change_24h.toFixed(2)}%
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

        {/* All Cryptocurrencies */}
        <div className="pb-20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">All Cryptocurrencies</h2>
            <Badge variant="outline">
              {filteredCoins.length} available
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
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
              {filteredCoins.map((coin) => (
                <Card key={coin.id} className="glass-card hover:bg-card/80 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-bold text-primary text-sm">
                            {coin.symbol}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold">{coin.symbol}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWatchlist(coin.id.toString())}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-muted-foreground text-sm">{coin.name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(coin.quote.USD.price)}</p>
                        <div className="flex items-center justify-end space-x-1">
                          {coin.quote.USD.percent_change_24h > 0 ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )}
                          <Badge 
                            variant={coin.quote.USD.percent_change_24h > 0 ? "default" : "destructive"}
                            className={coin.quote.USD.percent_change_24h > 0 ? "profit-gradient" : "loss-gradient"}
                          >
                            {coin.quote.USD.percent_change_24h > 0 ? '+' : ''}
                            {coin.quote.USD.percent_change_24h.toFixed(2)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Vol: {(coin.quote.USD.volume_24h / 1e9).toFixed(2)}B
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchlistPage;
