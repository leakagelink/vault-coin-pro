
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Activity,
  Archive,
  ShoppingCart
} from 'lucide-react';

const PortfolioPage: React.FC = () => {
  // Mock portfolio data
  const positions = [
    {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 0.001,
      buyPrice: 2800000,
      currentPrice: 2845678,
      pnl: 45678,
      pnlPercent: 1.63
    },
    {
      id: '2',
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 0.05,
      buyPrice: 180000,
      currentPrice: 185432,
      pnl: 271.6,
      pnlPercent: 3.02
    }
  ];

  const holdings = [
    {
      id: '1',
      symbol: 'ADA',
      name: 'Cardano',
      amount: 1000,
      avgPrice: 42.5,
      currentPrice: 45.67,
      totalValue: 45670,
      pnl: 3170,
      pnlPercent: 7.46
    }
  ];

  const closedTrades = [
    {
      id: '1',
      symbol: 'BNB',
      name: 'BNB',
      amount: 0.5,
      buyPrice: 30000,
      sellPrice: 32000,
      pnl: 1000,
      pnlPercent: 6.67,
      date: new Date('2024-01-15')
    }
  ];

  const getTotalPnL = () => {
    const positionsPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
    const holdingsPnL = holdings.reduce((sum, hold) => sum + hold.pnl, 0);
    return positionsPnL + holdingsPnL;
  };

  const getTotalValue = () => {
    const positionsValue = positions.reduce((sum, pos) => sum + (pos.amount * pos.currentPrice), 0);
    const holdingsValue = holdings.reduce((sum, hold) => sum + hold.totalValue, 0);
    return positionsValue + holdingsValue;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Portfolio Header */}
      <div className="bg-card/50 backdrop-blur-sm p-6 rounded-b-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-full">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">Track your investments</p>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">Total Value</p>
              <p className="text-xl font-bold">₹{getTotalValue().toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">Total P&L</p>
              <div className="flex items-center justify-center space-x-1">
                {getTotalPnL() >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <p className={`text-xl font-bold ${getTotalPnL() >= 0 ? 'profit-text' : 'loss-text'}`}>
                  {getTotalPnL() >= 0 ? '+' : ''}₹{getTotalPnL().toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4">
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Trade</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-3">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Active Positions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {positions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active positions</p>
                  </div>
                ) : (
                  positions.map((position) => (
                    <div key={position.id} className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{position.symbol}</span>
                            <Badge variant="outline" className="text-xs">
                              {position.amount} {position.symbol}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{position.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            {position.pnl >= 0 ? (
                              <TrendingUp className="h-3 w-3 text-success" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-destructive" />
                            )}
                            <span className={`font-semibold text-sm ${position.pnl >= 0 ? 'profit-text' : 'loss-text'}`}>
                              {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toLocaleString()}
                            </span>
                          </div>
                          <p className={`text-xs ${position.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Buy: ₹{position.buyPrice.toLocaleString()}</span>
                        <span>Current: ₹{position.currentPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holdings" className="space-y-3">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Holdings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {holdings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No holdings yet</p>
                  </div>
                ) : (
                  holdings.map((holding) => (
                    <div key={holding.id} className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{holding.symbol}</span>
                            <Badge variant="outline" className="text-xs">
                              {holding.amount} coins
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{holding.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3 text-success" />
                            <span className="profit-text font-semibold text-sm">
                              +₹{holding.pnl.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-success">
                            +{holding.pnlPercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Avg: ₹{holding.avgPrice}</span>
                        <span>Value: ₹{holding.totalValue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-3">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Bulk Trade</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bulk trades available</p>
                  <p className="text-sm mt-2">Feature coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="closed" className="space-y-3">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Archive className="h-5 w-5" />
                  <span>Closed Positions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {closedTrades.map((trade) => (
                  <div key={trade.id} className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{trade.symbol}</span>
                          <Badge variant="secondary" className="text-xs">
                            Closed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{trade.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3 text-success" />
                          <span className="profit-text font-semibold text-sm">
                            +₹{trade.pnl.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-success">
                          +{trade.pnlPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Buy: ₹{trade.buyPrice.toLocaleString()}</span>
                      <span>Sell: ₹{trade.sellPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Closed on {trade.date.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PortfolioPage;
