
import React, { useState } from 'react';
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

const WatchlistPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState([
    {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      price: '₹28,45,678',
      change: '+2.34%',
      changeAmount: '+₹65,432',
      volume: '₹1,234 Cr',
      isPositive: true,
      isWatched: true
    },
    {
      id: '2',
      symbol: 'ETH',
      name: 'Ethereum',
      price: '₹1,85,432',
      change: '-1.67%',
      changeAmount: '-₹3,145',
      volume: '₹892 Cr',
      isPositive: false,
      isWatched: true
    }
  ]);

  const [allCoins] = useState([
    {
      id: '3',
      symbol: 'BNB',
      name: 'BNB',
      price: '₹32,156',
      change: '+5.43%',
      changeAmount: '+₹1,656',
      volume: '₹567 Cr',
      isPositive: true,
      isWatched: false
    },
    {
      id: '4',
      symbol: 'ADA',
      name: 'Cardano',
      price: '₹45.67',
      change: '+0.89%',
      changeAmount: '+₹0.40',
      volume: '₹234 Cr',
      isPositive: true,
      isWatched: false
    },
    {
      id: '5',
      symbol: 'SOL',
      name: 'Solana',
      price: '₹8,456',
      change: '-2.15%',
      changeAmount: '-₹186',
      volume: '₹345 Cr',
      isPositive: false,
      isWatched: false
    }
  ]);

  const toggleWatchlist = (coinId: string) => {
    const coin = allCoins.find(c => c.id === coinId);
    if (coin && !coin.isWatched) {
      setWatchlist(prev => [...prev, { ...coin, isWatched: true }]);
    }
  };

  const removeFromWatchlist = (coinId: string) => {
    setWatchlist(prev => prev.filter(coin => coin.id !== coinId));
  };

  const filteredCoins = allCoins.filter(coin => 
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
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
              {watchlist.length} coins
            </Badge>
          </div>

          {watchlist.length === 0 ? (
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
              {watchlist.map((coin) => (
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
                              onClick={() => removeFromWatchlist(coin.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                            >
                              <Heart className="h-3 w-3 fill-current" />
                            </Button>
                          </div>
                          <p className="text-muted-foreground text-sm">{coin.name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{coin.price}</p>
                        <div className="flex items-center justify-end space-x-1">
                          {coin.isPositive ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )}
                          <Badge 
                            variant={coin.isPositive ? "default" : "destructive"}
                            className={coin.isPositive ? "profit-gradient" : "loss-gradient"}
                          >
                            {coin.change}
                          </Badge>
                        </div>
                        <p className={`text-xs ${coin.isPositive ? 'text-success' : 'text-destructive'}`}>
                          {coin.changeAmount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* All Cryptocurrencies */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">All Cryptocurrencies</h2>
            <Badge variant="outline">
              {filteredCoins.length} available
            </Badge>
          </div>

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
                            onClick={() => toggleWatchlist(coin.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-sm">{coin.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">{coin.price}</p>
                      <div className="flex items-center justify-end space-x-1">
                        {coin.isPositive ? (
                          <TrendingUp className="h-3 w-3 text-success" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-destructive" />
                        )}
                        <Badge 
                          variant={coin.isPositive ? "default" : "destructive"}
                          className={coin.isPositive ? "profit-gradient" : "loss-gradient"}
                        >
                          {coin.change}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vol: {coin.volume}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistPage;
