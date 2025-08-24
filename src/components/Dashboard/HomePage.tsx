
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Eye, Plus, IndianRupee } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HomePage: React.FC = () => {
  const { userData } = useAuth();

  // Mock crypto data - in real app, this would come from API
  const cryptoData = [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      price: '₹28,45,678', 
      change: '+2.34%', 
      isPositive: true,
      volume: '₹1,234 Cr' 
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      price: '₹1,85,432', 
      change: '-1.67%', 
      isPositive: false,
      volume: '₹892 Cr' 
    },
    { 
      symbol: 'BNB', 
      name: 'BNB', 
      price: '₹32,156', 
      change: '+5.43%', 
      isPositive: true,
      volume: '₹567 Cr' 
    },
    { 
      symbol: 'ADA', 
      name: 'Cardano', 
      price: '₹45.67', 
      change: '+0.89%', 
      isPositive: true,
      volume: '₹234 Cr' 
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm p-6 rounded-b-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              नमस्ते, {userData?.displayName || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground">आज का मार्केट कैसा है?</p>
          </div>
          <Button variant="outline" size="sm" className="border-primary/20">
            <Eye className="h-4 w-4 mr-2" />
            INR
          </Button>
        </div>

        {/* Portfolio Overview */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">कुल बैलेंस</p>
                <p className="text-2xl font-bold">
                  ₹{userData?.wallet?.balance?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm">आज का P&L</p>
                <p className="text-2xl font-bold profit-text">+₹1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button className="crypto-button h-auto p-4 flex-col">
            <Plus className="h-6 w-6 mb-2" />
            <span>Buy Crypto</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex-col">
            <IndianRupee className="h-6 w-6 mb-2" />
            <span>Add Money</span>
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

        <div className="space-y-3">
          {cryptoData.map((crypto) => (
            <Card key={crypto.symbol} className="glass-card hover:bg-card/80 transition-colors">
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
                    <p className="font-semibold">{crypto.price}</p>
                    <div className="flex items-center justify-end space-x-1">
                      {crypto.isPositive ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      <Badge 
                        variant={crypto.isPositive ? "default" : "destructive"}
                        className={crypto.isPositive ? "profit-gradient" : "loss-gradient"}
                      >
                        {crypto.change}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Market Stats */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Market Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Total Market Cap
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl font-bold">₹1.2T</p>
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
              <p className="text-xl font-bold">₹89.5B</p>
              <p className="text-destructive text-sm">-1.2% (24h)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
